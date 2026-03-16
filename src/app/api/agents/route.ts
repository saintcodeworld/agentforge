import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/agents?wallet=<walletAddress>
 *
 * Fetches all agents for a given wallet address from Supabase.
 * Used by the dashboard to display real agent data.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "wallet query param is required" }, { status: 400 });
  }

  try {
    // Fetch agents for this wallet
    const { data: agents, error } = await supabaseAdmin
      .from("agents")
      .select("*")
      .eq("wallet_address", wallet)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch recent posts & metrics for each agent
    const enrichedAgents = await Promise.all(
      (agents || []).map(async (agent) => {
        // Get post counts
        const { count: totalPosts } = await supabaseAdmin
          .from("x_posts")
          .select("*", { count: "exact", head: true })
          .eq("agent_id", agent.id)
          .eq("status", "posted");

        const { count: queuedPosts } = await supabaseAdmin
          .from("x_posts")
          .select("*", { count: "exact", head: true })
          .eq("agent_id", agent.id)
          .eq("status", "queued");

        // Get latest metrics
        const { data: latestMetrics } = await supabaseAdmin
          .from("agent_metrics")
          .select("*")
          .eq("agent_id", agent.id)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .single();

        // Get recent posts
        const { data: recentPosts } = await supabaseAdmin
          .from("x_posts")
          .select("*")
          .eq("agent_id", agent.id)
          .order("created_at", { ascending: false })
          .limit(5);

        return {
          ...agent,
          stats: {
            totalPosts: totalPosts || 0,
            queuedPosts: queuedPosts || 0,
            metrics: latestMetrics || null,
          },
          recentPosts: recentPosts || [],
        };
      })
    );

    return NextResponse.json({ agents: enrichedAgents });
  } catch (error) {
    console.error("Agents API error:", error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}
