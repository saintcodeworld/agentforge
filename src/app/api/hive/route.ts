import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/hive
 *
 * Fetches Agent Hive data including all active agents, their posts, and stats.
 * Used by the Agent Hive page to display real-time agent interactions.
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all active agents that have joined the hive
    const { data: agents, error: agentsError } = await supabaseAdmin
      .from("agents")
      .select("*")
      .eq("status", "active")
      .not("x_account", "is", null)
      .order("created_at", { ascending: false });

    if (agentsError) {
      console.error("Supabase agents fetch error:", agentsError);
      return NextResponse.json({ error: agentsError.message }, { status: 500 });
    }

    // Enrich agents with their latest metrics
    const enrichedAgents = await Promise.all(
      (agents || []).map(async (agent) => {
        const { data: metrics } = await supabaseAdmin
          .from("agent_metrics")
          .select("*")
          .eq("agent_id", agent.id)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .single();

        const { data: latestPost } = await supabaseAdmin
          .from("x_posts")
          .select("*")
          .eq("agent_id", agent.id)
          .eq("status", "posted")
          .order("posted_at", { ascending: false })
          .limit(1)
          .single();

        const { count: engagements } = await supabaseAdmin
          .from("x_posts")
          .select("*", { count: "exact", head: true })
          .eq("agent_id", agent.id)
          .eq("status", "posted");

        return {
          id: agent.id,
          name: agent.name,
          handle: agent.x_account?.username ? `@${agent.x_account.username}` : "@agent",
          symbol: agent.symbol,
          archetype: agent.personality?.archetype || "scholar",
          avatar: {
            primary: agent.avatar_config?.primaryColor || "#6366f1",
            secondary: agent.avatar_config?.secondaryColor || "#a855f7",
          },
          followers: metrics?.x_followers || 0,
          engagements: engagements || 0,
          burned: metrics?.total_burned || "0",
          revenue: metrics?.total_revenue_sol ? `${metrics.total_revenue_sol.toFixed(0)} SOL` : "0 SOL",
          lastPost: latestPost?.content || "No posts yet",
          lastPostTime: latestPost?.posted_at 
            ? formatTimeAgo(new Date(latestPost.posted_at))
            : "Never",
        };
      })
    );

    // Fetch recent hive posts
    const { data: posts, error: postsError } = await supabaseAdmin
      .from("x_posts")
      .select(`
        *,
        agent:agents(*)
      `)
      .eq("status", "posted")
      .order("posted_at", { ascending: false })
      .limit(50);

    if (postsError) {
      console.error("Supabase posts fetch error:", postsError);
    }

    const enrichedPosts = (posts || []).map((post: any) => ({
      id: post.id,
      agent: {
        id: post.agent.id,
        name: post.agent.name,
        handle: post.agent.x_account?.username ? `@${post.agent.x_account.username}` : "@agent",
        symbol: post.agent.symbol,
        archetype: post.agent.personality?.archetype || "scholar",
        avatar: {
          primary: post.agent.avatar_config?.primaryColor || "#6366f1",
          secondary: post.agent.avatar_config?.secondaryColor || "#a855f7",
        },
      },
      content: post.content,
      likes: post.likes || 0,
      retweets: post.retweets || 0,
      replies: post.replies || 0,
      time: formatTimeAgo(new Date(post.posted_at)),
      replyTo: post.reply_to_post_id ? {
        handle: "@agent",
        text: "Previous post",
      } : undefined,
    }));

    // Calculate stats
    const stats = {
      activeAgents: enrichedAgents.length,
      postsToday: enrichedPosts.filter((p: any) => {
        const postDate = new Date(posts?.find((post: any) => post.id === p.id)?.posted_at || 0);
        const today = new Date();
        return postDate.toDateString() === today.toDateString();
      }).length,
      totalBurned: enrichedAgents.reduce((sum, a) => {
        const burned = parseInt(a.burned.replace(/[^0-9]/g, '')) || 0;
        return sum + burned;
      }, 0).toString() + "M",
      totalRevenue: enrichedAgents.reduce((sum, a) => {
        const revenue = parseFloat(a.revenue.replace(/[^0-9.]/g, '')) || 0;
        return sum + revenue;
      }, 0).toFixed(0) + " SOL",
    };

    return NextResponse.json({
      agents: enrichedAgents,
      posts: enrichedPosts,
      stats,
    });
  } catch (error) {
    console.error("Hive API error:", error);
    return NextResponse.json({ error: "Failed to fetch hive data" }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}
