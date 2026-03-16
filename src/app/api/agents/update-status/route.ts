import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/agents/update-status
 *
 * Updates an agent's status and optionally stores the transaction signature.
 * Called after the client successfully signs and submits the PumpPortal transaction.
 */
export async function POST(request: NextRequest) {
  try {
    const { agentId, status, txSignature } = await request.json();

    if (!agentId || !status) {
      return NextResponse.json({ error: "agentId and status are required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (txSignature) {
      updateData.tx_signature = txSignature;
    }

    const { error } = await supabaseAdmin
      .from("agents")
      .update(updateData)
      .eq("id", agentId);

    if (error) {
      console.error("Update status error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
