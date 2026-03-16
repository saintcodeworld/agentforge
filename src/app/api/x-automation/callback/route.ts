import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { exchangeOAuthCode } from "@/lib/twitter";

/**
 * GET /api/x-automation/callback
 *
 * Twitter OAuth 2.0 callback handler.
 * Exchanges the authorization code for access/refresh tokens
 * and stores them in Supabase for the agent.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This is the agentId we passed as state
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${appUrl}/dashboard?x_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard?x_error=missing_params`);
  }

  const agentId = state;

  try {
    // Fetch the stored code verifier from Supabase
    const { data: agent, error: dbError } = await supabaseAdmin
      .from("agents")
      .select("x_oauth_code_verifier")
      .eq("id", agentId)
      .single();

    if (dbError || !agent) {
      console.error("Agent not found for OAuth callback:", agentId, dbError);
      return NextResponse.redirect(`${appUrl}/dashboard?x_error=agent_not_found`);
    }

    const codeVerifier = (agent as Record<string, unknown>).x_oauth_code_verifier as string;
    if (!codeVerifier) {
      return NextResponse.redirect(`${appUrl}/dashboard?x_error=no_code_verifier`);
    }

    // Exchange code for tokens
    const tokens = await exchangeOAuthCode(code, codeVerifier);

    // Store tokens in Supabase
    await supabaseAdmin
      .from("agents")
      .update({
        x_oauth_token: tokens.accessToken,
        x_oauth_refresh_token: tokens.refreshToken,
        x_user_id: tokens.userId,
      })
      .eq("id", agentId);

    console.log(`OAuth success for agent ${agentId}, X user ID: ${tokens.userId}`);

    return NextResponse.redirect(`${appUrl}/manage/${agentId}?x_connected=true`);
  } catch (err) {
    console.error("OAuth token exchange failed:", err);
    return NextResponse.redirect(`${appUrl}/dashboard?x_error=token_exchange_failed`);
  }
}
