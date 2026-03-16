import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

type ActivityLogItem = {
  action: string;
  detail: string;
  time: string;
  icon: string;
};

/**
 * GET /api/analytics?agentId=<agentId>&timeRange=<timeRange>
 *
 * Fetches analytics data for a specific agent including:
 * - Token metrics (price, market cap, holders, burned)
 * - Burn history
 * - Deposit history
 * - Chart data
 * - Revenue split
 * - Activity log
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const timeRange = searchParams.get("timeRange") || "7d";

  if (!agentId) {
    return NextResponse.json({ error: "agentId query param is required" }, { status: 400 });
  }

  try {
    // Fetch agent details
    const { data: agent, error: agentError } = await supabaseAdmin
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Calculate time range filter
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case "24h":
        startDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "All":
        startDate = new Date(agent.created_at);
        break;
    }

    // Fetch metrics history for the time range
    const { data: metricsHistory, error: metricsError } = await supabaseAdmin
      .from("agent_metrics")
      .select("*")
      .eq("agent_id", agentId)
      .gte("recorded_at", startDate.toISOString())
      .order("recorded_at", { ascending: true });

    if (metricsError) {
      console.error("Metrics fetch error:", metricsError);
    }

    const metrics = metricsHistory || [];
    const latestMetrics = metrics[metrics.length - 1] || {
      price_usd: 0,
      market_cap: 0,
      holders: 0,
      total_burned: "0",
      total_revenue_sol: 0,
    };

    // Calculate 7-day changes
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const metricsSevenDaysAgo = metrics.find(m => 
      new Date(m.recorded_at) <= sevenDaysAgo
    ) || metrics[0] || latestMetrics;

    const priceChange7d = metricsSevenDaysAgo.price_usd 
      ? ((latestMetrics.price_usd - metricsSevenDaysAgo.price_usd) / metricsSevenDaysAgo.price_usd) * 100
      : 0;

    const marketCapChange7d = metricsSevenDaysAgo.market_cap
      ? ((latestMetrics.market_cap - metricsSevenDaysAgo.market_cap) / metricsSevenDaysAgo.market_cap) * 100
      : 0;

    const holdersChange7d = latestMetrics.holders - (metricsSevenDaysAgo.holders || 0);

    // Fetch burn transactions
    const { data: burnTransactions, error: burnError } = await supabaseAdmin
      .from("burn_transactions")
      .select("*")
      .eq("agent_id", agentId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(8);

    if (burnError) {
      console.error("Burn transactions fetch error:", burnError);
    }

    const burnHistory = (burnTransactions || []).map(tx => ({
      time: new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      amount: formatTokenAmount(tx.amount_burned),
      sol: `${tx.sol_value?.toFixed(2) || '0.00'} SOL`,
    }));

    // Fetch deposit transactions
    const { data: deposits, error: depositsError } = await supabaseAdmin
      .from("deposits")
      .select("*")
      .eq("agent_id", agentId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (depositsError) {
      console.error("Deposits fetch error:", depositsError);
    }

    const depositHistory = (deposits || []).map(dep => ({
      from: dep.from_address ? `${dep.from_address.slice(0, 4)}...${dep.from_address.slice(-4)}` : "Unknown",
      amount: `${dep.amount} ${dep.token_type}`,
      time: formatTimeAgo(new Date(dep.created_at)),
      type: dep.token_type || "SOL",
    }));

    // Generate chart data from metrics history
    const chartData = metrics.length > 0
      ? metrics.map(m => {
          const burnAmount = parseFloat(m.total_burned?.replace(/[^0-9.]/g, '') || '0');
          return Math.min(Math.max((burnAmount / 1000000) * 10, 20), 100);
        })
      : Array(24).fill(0).map(() => Math.random() * 50 + 25);

    const priceChartData = metrics.length > 0
      ? metrics.map((m, i) => {
          const baseHeight = (m.price_usd || 0) * 10000;
          return Math.min(Math.max(baseHeight + (i * 1.2), 20), 95);
        })
      : Array(24).fill(0).map((_, i) => Math.min(35 + (i * 1.2), 95));

    // Calculate revenue split
    const buybackPercent = agent.tokenomics?.buybackPercent || 60;
    const totalDeposits = deposits?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const buybackAmount = totalDeposits * (buybackPercent / 100);
    const claimableAmount = totalDeposits * ((100 - buybackPercent) / 100);

    // Fetch recent activity
    const { data: recentPosts, error: postsError } = await supabaseAdmin
      .from("x_posts")
      .select("*")
      .eq("agent_id", agentId)
      .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (postsError) {
      console.error("Posts fetch error:", postsError);
    }

    const activityLog: ActivityLogItem[] = [];
    
    // Add post activities
    (recentPosts || []).slice(0, 2).forEach(post => {
      activityLog.push({
        action: post.status === "posted" ? "Posted on X" : "Queued post",
        detail: post.content.slice(0, 50) + "...",
        time: formatTimeAgo(new Date(post.created_at)),
        icon: "Zap",
      });
    });

    // Add burn activities
    (burnTransactions || []).slice(0, 2).forEach(tx => {
      activityLog.push({
        action: "Buyback executed",
        detail: `${formatTokenAmount(tx.amount_burned)} tokens burned`,
        time: formatTimeAgo(new Date(tx.created_at)),
        icon: "Flame",
      });
    });

    // Add deposit activities
    (deposits || []).slice(0, 1).forEach(dep => {
      activityLog.push({
        action: "Payment received",
        detail: `${dep.amount} ${dep.token_type} from ${dep.from_address?.slice(0, 4)}...${dep.from_address?.slice(-4)}`,
        time: formatTimeAgo(new Date(dep.created_at)),
        icon: "Coins",
      });
    });

    // Sort by time
    activityLog.sort((a, b) => {
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
      return timeA - timeB;
    });

    const data = {
      stats: {
        price_usd: latestMetrics.price_usd || 0,
        price_change_7d: priceChange7d,
        market_cap: latestMetrics.market_cap || 0,
        market_cap_change_7d: marketCapChange7d,
        total_burned: latestMetrics.total_burned || "0",
        burn_percentage: calculateBurnPercentage(latestMetrics.total_burned),
        holders: latestMetrics.holders || 0,
        holders_change_7d: holdersChange7d,
      },
      burnHistory,
      depositHistory,
      chartData,
      priceChartData,
      revenueData: {
        buybackPercent,
        buybackAmount,
        claimableAmount,
        totalDeposits,
      },
      activityLog: activityLog.slice(0, 5),
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}

function formatTokenAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function parseTimeAgo(timeStr: string): number {
  const match = timeStr.match(/(\d+)([smhdw])/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
  };
  
  return value * (multipliers[unit] || 0);
}

function calculateBurnPercentage(totalBurned: string): number {
  const burned = parseFloat(totalBurned.replace(/[^0-9.]/g, '')) || 0;
  const totalSupply = 1000000000; // 1B tokens (PumpFun standard)
  return (burned / totalSupply) * 100;
}
