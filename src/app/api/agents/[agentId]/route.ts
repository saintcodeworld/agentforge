import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/agents/[agentId]
 * 
 * Fetches a single agent by ID with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("wallet");
  const { agentId } = await params;

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address required" },
      { status: 400 }
    );
  }

  try {
    // Fetch agent with ownership verification
    const { data: agent, error } = await supabaseAdmin
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("wallet_address", walletAddress)
      .single();

    if (error || !agent) {
      return NextResponse.json(
        { error: "Agent not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Failed to fetch agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}
