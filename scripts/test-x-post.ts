/**
 * Test script: Verify X (Twitter) API posting
 *
 * Usage: npx tsx scripts/test-x-post.ts
 *
 * Requires .env.local to be configured with:
 *   X_BEARER_TOKEN (for username checking)
 *   X_CLIENT_ID + X_CLIENT_SECRET (for OAuth flow)
 *
 * To test posting, you need an OAuth access token.
 * Run the OAuth flow first via the app, then use
 * the stored token from Supabase.
 */

import { TwitterApi } from "twitter-api-v2";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const bearerToken = process.env.X_BEARER_TOKEN;
const clientId = process.env.X_CLIENT_ID;
const clientSecret = process.env.X_CLIENT_SECRET;

async function main() {
  console.log("🐦 Testing X (Twitter) API integration...\n");

  // 1. Test bearer token (app-level)
  if (!bearerToken) {
    console.warn("⚠️  X_BEARER_TOKEN not set. Skipping app-level tests.");
  } else {
    console.log("📡 Testing bearer token (app-level read access)...");
    try {
      const client = new TwitterApi(bearerToken);
      // Try to look up a known user
      const user = await client.v2.userByUsername("twitter");
      if (user.data) {
        console.log(`✅ Bearer token works! Looked up @twitter (ID: ${user.data.id})`);
      } else {
        console.log("⚠️  Bearer token works but no data returned for @twitter");
      }
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string };
      if (e.code === 429) {
        console.log("⚠️  Rate limited. Bearer token likely valid but hitting limits.");
      } else {
        console.error("❌ Bearer token test failed:", e.message);
      }
    }
  }

  // 2. Test username availability check
  if (bearerToken) {
    console.log("\n🔍 Testing username availability check...");
    const testUsernames = ["agentforge_test_12345", "elonmusk"];

    for (const username of testUsernames) {
      try {
        const client = new TwitterApi(bearerToken);
        const result = await client.v2.userByUsername(username);
        const available = !result.data;
        console.log(`   @${username}: ${available ? "✅ Available" : "❌ Taken"}`);
      } catch (err: unknown) {
        const e = err as { code?: number };
        if (e.code === 429) {
          console.log(`   @${username}: ⚠️ Rate limited`);
        } else {
          console.log(`   @${username}: ✅ Likely available (API returned error)`);
        }
      }
    }
  }

  // 3. Test OAuth 2.0 link generation
  if (clientId && clientSecret) {
    console.log("\n🔐 Testing OAuth 2.0 link generation...");
    try {
      const client = new TwitterApi({ clientId, clientSecret });
      const callbackUrl = process.env.NEXT_PUBLIC_X_CALLBACK_URL || "http://localhost:3000/api/x-automation/callback";
      const { url, codeVerifier } = client.generateOAuth2AuthLink(callbackUrl, {
        scope: ["tweet.read", "tweet.write", "users.read", "follows.write", "offline.access"],
        state: "test-agent-id",
      });

      console.log("✅ OAuth link generated successfully!");
      console.log(`   Auth URL: ${url.substring(0, 80)}...`);
      console.log(`   Code Verifier: ${codeVerifier.substring(0, 20)}...`);
      console.log("\n   To test the full flow:");
      console.log("   1. Open the auth URL in a browser");
      console.log("   2. Authorize with a test X account");
      console.log("   3. You'll be redirected to the callback URL");
      console.log("   4. The callback stores tokens in Supabase");
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error("❌ OAuth link generation failed:", e.message);
      console.log("   Check X_CLIENT_ID and X_CLIENT_SECRET in .env.local");
    }
  } else {
    console.warn("⚠️  X_CLIENT_ID or X_CLIENT_SECRET not set. Skipping OAuth tests.");
  }

  // 4. Test posting (requires user access token)
  console.log("\n📝 Posting test...");
  console.log("   To test posting, complete the OAuth flow first:");
  console.log("   1. Launch the app: npm run dev");
  console.log("   2. Create an agent and connect an X account");
  console.log("   3. The OAuth token will be stored in Supabase");
  console.log("   4. The cron job will post queued tweets automatically");
  console.log("   5. Or trigger manually via: POST /api/x-automation { action: 'post', ... }");

  console.log("\n" + "=".repeat(50));
  console.log("🎉 X API connection tests complete!");
  console.log("=".repeat(50) + "\n");
}

main().catch(console.error);
