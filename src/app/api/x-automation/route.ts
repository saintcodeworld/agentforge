import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkUsernameAvailability, postTweet, updateProfile, followUser, generateOAuthLink } from "@/lib/twitter";
import { generateTweet, generateReply } from "@/lib/openai";

const AGENT_FORGE_X_USER_ID = process.env.AGENT_FORGE_X_USER_ID || "";

/**
 * POST /api/x-automation
 *
 * Handles X (Twitter) automation setup and management for agents.
 * All actions use real X API v2 + OpenAI for content generation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "check-username":
        return handleCheckUsername(body);
      case "oauth-link":
        return handleOAuthLink(body);
      case "setup":
        return handleSetup(body);
      case "post":
        return handlePost(body);
      case "interact":
        return handleHiveInteraction(body);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("X automation error:", error);
    return NextResponse.json(
      { error: "X automation failed" },
      { status: 500 }
    );
  }
}

async function handleCheckUsername(body: { username: string }) {
  const { username } = body;

  if (!username || username.length < 1 || username.length > 15) {
    return NextResponse.json({ available: false, error: "Invalid username" });
  }

  try {
    const available = await checkUsernameAvailability(username);
    return NextResponse.json({ available, username });
  } catch (error) {
    console.error("Username check failed:", error);
    return NextResponse.json({
      available: false,
      username,
      error: "Could not verify username. X API may be rate-limited.",
    });
  }
}

async function handleOAuthLink(body: { agentId: string }) {
  const { agentId } = body;

  try {
    const { url, codeVerifier } = generateOAuthLink(agentId);

    // Store code verifier in Supabase for the callback to use
    await supabaseAdmin
      .from("agents")
      .update({ x_oauth_code_verifier: codeVerifier } as Record<string, unknown>)
      .eq("id", agentId);

    return NextResponse.json({ success: true, authUrl: url });
  } catch (error) {
    console.error("OAuth link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate OAuth link. Check X_CLIENT_ID and X_CLIENT_SECRET." },
      { status: 500 }
    );
  }
}

async function handleSetup(body: {
  agentId: string;
  username: string;
  personality: { archetype: string; tone: string; customPrompt: string };
  tokenSymbol: string;
  agentName: string;
  joinAgentHive: boolean;
}) {
  const { agentId, username, personality, tokenSymbol, agentName, joinAgentHive } = body;

  // Fetch the agent's OAuth token from DB
  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .select("x_oauth_token, x_user_id")
    .eq("id", agentId)
    .single();

  if (error || !agent?.x_oauth_token) {
    return NextResponse.json(
      { success: false, error: "Agent not found or X account not connected. Complete OAuth first." },
      { status: 400 }
    );
  }

  const accessToken = agent.x_oauth_token;
  const xUserId = agent.x_user_id;

  // 1. Update X profile
  const bio = `${personality.archetype} AI agent | $${tokenSymbol} | Powered by @AgentForge | #AgentHive`;
  await updateProfile(accessToken, {
    name: agentName || username,
    description: bio,
  });

  // 2. Follow @AgentForgeHQ
  if (AGENT_FORGE_X_USER_ID && xUserId) {
    await followUser(accessToken, xUserId, AGENT_FORGE_X_USER_ID);
  }

  // 3. Post intro tweet
  const introTweet = generateIntroTweet(username, personality, tokenSymbol);
  const introResult = await postTweet(accessToken, introTweet);

  // 4. Queue the intro tweet record in DB
  if (introResult) {
    await supabaseAdmin.from("x_posts").insert({
      agent_id: agentId,
      content: introTweet,
      x_post_id: introResult.id,
      post_type: "scheduled",
      status: "posted",
      scheduled_for: new Date().toISOString(),
      posted_at: new Date().toISOString(),
    });
  }

  // 5. Update agent status to active
  await supabaseAdmin
    .from("agents")
    .update({ status: "active" })
    .eq("id", agentId);

  // 6. Schedule first batch of posts
  await scheduleNextPosts(agentId, personality, tokenSymbol, agentName);

  return NextResponse.json({
    success: true,
    agentId,
    introTweet,
    introPostId: introResult?.id || null,
    message: "X automation configured. Agent is now live and will post on schedule.",
  });
}

async function handlePost(body: {
  agentId: string;
  personality: { archetype: string; tone: string; customPrompt: string };
  topics: string;
  tokenSymbol: string;
  agentName: string;
}) {
  const { agentId, personality, topics, tokenSymbol, agentName } = body;

  // Generate tweet content via OpenAI
  const tweetContent = await generateTweet({
    personality,
    topics,
    tokenSymbol,
    agentName: agentName || tokenSymbol,
  });

  // Get agent's OAuth token
  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("x_oauth_token")
    .eq("id", agentId)
    .single();

  if (!agent?.x_oauth_token) {
    // Queue for later if no token
    const scheduledFor = new Date(Date.now() + 3600000).toISOString();
    await supabaseAdmin.from("x_posts").insert({
      agent_id: agentId,
      content: tweetContent,
      post_type: "scheduled",
      status: "queued",
      scheduled_for: scheduledFor,
    });

    return NextResponse.json({
      success: true,
      post: tweetContent,
      status: "queued",
      scheduledFor,
      message: "Tweet generated and queued. Will post when X account is connected.",
    });
  }

  // Post immediately
  const result = await postTweet(agent.x_oauth_token, tweetContent);

  if (result) {
    await supabaseAdmin.from("x_posts").insert({
      agent_id: agentId,
      content: tweetContent,
      x_post_id: result.id,
      post_type: "scheduled",
      status: "posted",
      scheduled_for: new Date().toISOString(),
      posted_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      post: tweetContent,
      xPostId: result.id,
      status: "posted",
    });
  }

  // Failed to post — queue it
  await supabaseAdmin.from("x_posts").insert({
    agent_id: agentId,
    content: tweetContent,
    post_type: "scheduled",
    status: "failed",
    scheduled_for: new Date().toISOString(),
    error: "X API post failed",
  });

  return NextResponse.json({
    success: false,
    post: tweetContent,
    status: "failed",
    error: "Failed to post to X. Tweet saved for retry.",
  });
}

async function handleHiveInteraction(body: {
  agentId: string;
  personality: { archetype: string; tone: string; customPrompt: string };
  triggerPost: { author: string; content: string; postId: string };
  tokenSymbol: string;
  agentName: string;
}) {
  const { agentId, personality, triggerPost, tokenSymbol, agentName } = body;

  // Generate contextual reply via OpenAI
  const replyContent = await generateReply({
    personality,
    originalTweet: triggerPost.content,
    originalAuthor: triggerPost.author,
    tokenSymbol,
    agentName: agentName || tokenSymbol,
  });

  // Get agent's OAuth token
  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("x_oauth_token")
    .eq("id", agentId)
    .single();

  if (!agent?.x_oauth_token) {
    return NextResponse.json({
      success: false,
      error: "X account not connected",
    });
  }

  // Post the reply
  const result = await postTweet(agent.x_oauth_token, replyContent, triggerPost.postId);

  if (result) {
    await supabaseAdmin.from("x_posts").insert({
      agent_id: agentId,
      content: replyContent,
      x_post_id: result.id,
      post_type: "hive_interaction",
      status: "posted",
      scheduled_for: new Date().toISOString(),
      posted_at: new Date().toISOString(),
      in_reply_to: triggerPost.postId,
    });
  }

  return NextResponse.json({
    success: !!result,
    reply: replyContent,
    xPostId: result?.id || null,
    inReplyTo: triggerPost.postId,
  });
}

function generateIntroTweet(
  username: string,
  personality: { archetype: string; tone: string },
  tokenSymbol: string
): string {
  return `Just launched on @AgentForge!\n\nI'm @${username}, a ${personality.archetype} AI agent.\nMy token: $${tokenSymbol}\nTone: ${personality.tone}\n\nReady to engage with the Hive! Let's connect.\n\n#AgentHive`;
}

async function scheduleNextPosts(
  agentId: string,
  personality: { archetype: string; tone: string; customPrompt: string },
  tokenSymbol: string,
  agentName: string
) {
  // Get agent's posting frequency
  const { data: agent } = await supabaseAdmin
    .from("agents")
    .select("x_account")
    .eq("id", agentId)
    .single();

  const xConfig = agent?.x_account as { postingFrequency?: number; topics?: string } | null;
  const postsPerDay = xConfig?.postingFrequency || 4;
  const topics = xConfig?.topics || "";
  const intervalMs = (24 * 60 * 60 * 1000) / postsPerDay;

  // Generate and queue next batch of posts
  for (let i = 0; i < postsPerDay; i++) {
    const scheduledFor = new Date(Date.now() + intervalMs * (i + 1)).toISOString();

    const content = await generateTweet({
      personality,
      topics,
      tokenSymbol,
      agentName,
    });

    await supabaseAdmin.from("x_posts").insert({
      agent_id: agentId,
      content,
      post_type: "scheduled",
      status: "queued",
      scheduled_for: scheduledFor,
    });
  }
}
