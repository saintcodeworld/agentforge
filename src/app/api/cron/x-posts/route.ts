import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { postTweet, refreshAccessToken } from "@/lib/twitter";
import { generateTweet } from "@/lib/openai";

/**
 * POST /api/cron/x-posts
 *
 * Cron job that processes queued X posts for all active agents.
 * Should be called every 15 minutes by an external cron service
 * (Vercel Cron, Supabase Edge Functions, or a simple cron job).
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    processed: 0,
    posted: 0,
    failed: 0,
    refreshed: 0,
    newlyQueued: 0,
  };

  try {
    // 1. Find queued posts that are due
    const now = new Date().toISOString();
    const { data: queuedPosts, error: fetchError } = await supabaseAdmin
      .from("x_posts")
      .select("*, agents!inner(id, x_oauth_token, x_oauth_refresh_token, x_user_id, personality, x_account, name, symbol, status)")
      .eq("status", "queued")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error("Failed to fetch queued posts:", fetchError);
      return NextResponse.json({ error: "Database error", details: fetchError.message }, { status: 500 });
    }

    if (!queuedPosts || queuedPosts.length === 0) {
      // No posts to process — check if any active agents need new posts queued
      await queueNewPostsForActiveAgents(results);
      return NextResponse.json({ message: "No queued posts due. Checked for new posts to generate.", ...results });
    }

    // 2. Process each queued post
    for (const post of queuedPosts) {
      results.processed++;
      const agent = post.agents as Record<string, unknown>;

      if (!agent || agent.status !== "active") continue;

      let accessToken = agent.x_oauth_token as string;

      if (!accessToken) {
        // Mark as failed — no OAuth token
        await supabaseAdmin
          .from("x_posts")
          .update({ status: "failed", error: "No X OAuth token" })
          .eq("id", post.id);
        results.failed++;
        continue;
      }

      // Try to post
      let result = await postTweet(accessToken, post.content, post.in_reply_to || undefined);

      // If failed, try refreshing the token
      if (!result && agent.x_oauth_refresh_token) {
        const refreshed = await refreshAccessToken(agent.x_oauth_refresh_token as string);
        if (refreshed) {
          // Update stored tokens
          await supabaseAdmin
            .from("agents")
            .update({
              x_oauth_token: refreshed.accessToken,
              x_oauth_refresh_token: refreshed.refreshToken,
            })
            .eq("id", agent.id);

          accessToken = refreshed.accessToken;
          results.refreshed++;

          // Retry the post
          result = await postTweet(accessToken, post.content, post.in_reply_to || undefined);
        }
      }

      if (result) {
        await supabaseAdmin
          .from("x_posts")
          .update({
            status: "posted",
            x_post_id: result.id,
            posted_at: new Date().toISOString(),
          })
          .eq("id", post.id);
        results.posted++;
      } else {
        await supabaseAdmin
          .from("x_posts")
          .update({
            status: "failed",
            error: "X API post failed after retry",
          })
          .eq("id", post.id);
        results.failed++;
      }
    }

    // 3. Queue new posts for agents that have no upcoming queued posts
    await queueNewPostsForActiveAgents(results);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

async function queueNewPostsForActiveAgents(results: { newlyQueued: number }) {
  // Find active agents that have fewer than 2 queued posts remaining
  const { data: agents } = await supabaseAdmin
    .from("agents")
    .select("id, name, symbol, personality, x_account, x_oauth_token")
    .eq("status", "active")
    .not("x_oauth_token", "is", null);

  if (!agents) return;

  for (const agent of agents) {
    // Count remaining queued posts
    const { count } = await supabaseAdmin
      .from("x_posts")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", agent.id)
      .eq("status", "queued");

    if ((count || 0) < 2) {
      const personality = agent.personality as { archetype: string; tone: string; customPrompt: string };
      const xConfig = agent.x_account as { postingFrequency?: number; topics?: string } | null;
      const postsPerDay = xConfig?.postingFrequency || 4;
      const topics = xConfig?.topics || "";
      const intervalMs = (24 * 60 * 60 * 1000) / postsPerDay;

      // Generate next batch
      const postsToGenerate = Math.min(postsPerDay, 4);
      for (let i = 0; i < postsToGenerate; i++) {
        try {
          const content = await generateTweet({
            personality,
            topics,
            tokenSymbol: agent.symbol,
            agentName: agent.name,
          });

          const scheduledFor = new Date(Date.now() + intervalMs * (i + 1)).toISOString();

          await supabaseAdmin.from("x_posts").insert({
            agent_id: agent.id,
            content,
            post_type: "scheduled",
            status: "queued",
            scheduled_for: scheduledFor,
          });

          results.newlyQueued++;
        } catch (err) {
          console.error(`Failed to generate post for agent ${agent.id}:`, err);
        }
      }
    }
  }
}
