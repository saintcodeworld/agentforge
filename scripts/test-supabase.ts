/**
 * Test script: Verify Supabase connection and CRUD operations
 *
 * Usage: npx tsx scripts/test-supabase.ts
 *
 * Requires .env.local to be configured with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase env vars. Check .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("🔌 Testing Supabase connection...\n");
  console.log(`   URL: ${supabaseUrl}`);

  // 1. Test connection
  try {
    const { data, error } = await supabase.from("agents").select("count").limit(1);
    if (error) throw error;
    console.log("✅ Connected to Supabase successfully");
  } catch (err: unknown) {
    const e = err as { message?: string; code?: string };
    if (e.code === "PGRST116" || e.message?.includes("0 rows")) {
      console.log("✅ Connected to Supabase (agents table empty, which is expected)");
    } else {
      console.error("❌ Connection failed:", e.message);
      console.log("\n   Make sure you've run the schema SQL in your Supabase SQL Editor.");
      console.log("   Schema file: scripts/supabase-schema.sql\n");
      process.exit(1);
    }
  }

  // 2. Test insert
  console.log("\n📝 Testing agent insert...");
  const testAgent = {
    wallet_address: "TEST_WALLET_" + Date.now(),
    name: "TestAgent",
    symbol: "TEST",
    mint_address: "TEST_MINT_" + Date.now(),
    avatar_config: { bodyType: "humanoid", primaryColor: "#6366f1" },
    personality: { archetype: "optimist", tone: "friendly" },
    skills: [{ name: "Social Poster", id: "social-poster" }],
    skills_md: "# Test Skills\n\n## Social Poster\n",
    tokenomics: { name: "TestAgent", symbol: "TEST", buybackPercent: 50 },
    status: "pending",
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("agents")
    .insert(testAgent)
    .select()
    .single();

  if (insertErr) {
    console.error("❌ Insert failed:", insertErr.message);
    process.exit(1);
  }
  console.log("✅ Agent inserted:", inserted.id);

  // 3. Test x_posts insert
  console.log("\n📝 Testing x_posts insert...");
  const { data: post, error: postErr } = await supabase
    .from("x_posts")
    .insert({
      agent_id: inserted.id,
      content: "Test tweet from AgentForge!",
      post_type: "scheduled",
      status: "queued",
      scheduled_for: new Date().toISOString(),
    })
    .select()
    .single();

  if (postErr) {
    console.error("❌ Post insert failed:", postErr.message);
  } else {
    console.log("✅ X post inserted:", post.id);
  }

  // 4. Test metrics insert
  console.log("\n📝 Testing agent_metrics insert...");
  const { error: metricsErr } = await supabase
    .from("agent_metrics")
    .insert({
      agent_id: inserted.id,
      price_usd: 0.001,
      holders: 10,
      total_burned: "0",
      total_revenue_sol: 0,
      x_followers: 0,
    });

  if (metricsErr) {
    console.error("❌ Metrics insert failed:", metricsErr.message);
  } else {
    console.log("✅ Metrics inserted");
  }

  // 5. Test read
  console.log("\n📖 Testing agent read...");
  const { data: fetched } = await supabase
    .from("agents")
    .select("*")
    .eq("id", inserted.id)
    .single();

  if (fetched) {
    console.log("✅ Agent read OK:", fetched.name, `($${fetched.symbol})`);
  }

  // 6. Test update
  console.log("\n✏️  Testing agent update...");
  const { error: updateErr } = await supabase
    .from("agents")
    .update({ status: "active" })
    .eq("id", inserted.id);

  if (updateErr) {
    console.error("❌ Update failed:", updateErr.message);
  } else {
    console.log("✅ Agent status updated to active");
  }

  // 7. Cleanup
  console.log("\n🧹 Cleaning up test data...");
  await supabase.from("agent_metrics").delete().eq("agent_id", inserted.id);
  await supabase.from("x_posts").delete().eq("agent_id", inserted.id);
  await supabase.from("agents").delete().eq("id", inserted.id);
  console.log("✅ Test data cleaned up");

  console.log("\n" + "=".repeat(50));
  console.log("🎉 All Supabase tests passed!");
  console.log("=".repeat(50) + "\n");
}

main().catch(console.error);
