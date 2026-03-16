/**
 * Test script: Verify OpenAI integration for tweet and skills generation
 *
 * Usage: npx tsx scripts/test-openai.ts
 *
 * Requires .env.local to be configured with:
 *   OPENAI_API_KEY
 */

import OpenAI from "openai";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY not set in .env.local");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function main() {
  console.log("🤖 Testing OpenAI integration...\n");

  // 1. Test tweet generation
  console.log("📝 Generating test tweet...");
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content: `You are TestAgent, an AI agent with the "optimist" personality archetype.
Your tone is: friendly. You post about: DeFi, Solana, memes.
Your token ticker is $TEST.
Keep tweets under 270 characters. Be authentic. Include #AgentHive occasionally.`,
        },
        {
          role: "user",
          content: "Generate your next tweet. Be creative and on-brand.",
        },
      ],
    });

    const tweet = completion.choices[0]?.message?.content;
    if (tweet) {
      console.log("✅ Tweet generated successfully!");
      console.log(`   Content: "${tweet}"`);
      console.log(`   Length: ${tweet.length} chars`);
      console.log(`   Tokens used: ${completion.usage?.total_tokens}`);
    } else {
      console.error("❌ No content in response");
    }
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    console.error("❌ Tweet generation failed:", e.message);
    if (e.status === 401) console.log("   Check your OPENAI_API_KEY.");
  }

  // 2. Test reply generation
  console.log("\n💬 Generating test reply...");
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 120,
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `You are TestAgent, an AI agent with the "optimist" personality.
Your tone is: friendly. Your token is $TEST.
Reply rules: Keep under 200 chars, be relevant, stay in character.`,
        },
        {
          role: "user",
          content: `Reply to this tweet from @SolanaDevs:\n"Just shipped a major upgrade to the Solana runtime. Transaction throughput is looking incredible!"`,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content;
    if (reply) {
      console.log("✅ Reply generated successfully!");
      console.log(`   Content: "${reply}"`);
      console.log(`   Length: ${reply.length} chars`);
    }
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("❌ Reply generation failed:", e.message);
  }

  // 3. Test skills.md generation
  console.log("\n📋 Generating test skills.md...");
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an AI agent skills compiler for the AgentForge platform.
Given a natural language description, generate a skills.md file following the AgentSkills.io format.
Include YAML frontmatter, structured skill sections with parameters and instructions.`,
        },
        {
          role: "user",
          content: `Generate a skills.md for: "An agent that tracks whale transactions on Solana, posts market analysis tweets, and sells premium alerts as a subscription"`,
        },
      ],
    });

    const skillsMd = completion.choices[0]?.message?.content;
    if (skillsMd) {
      console.log("✅ Skills.md generated successfully!");
      console.log(`   Length: ${skillsMd.length} chars`);
      console.log("   Preview:");
      console.log("   " + skillsMd.split("\n").slice(0, 8).join("\n   "));
      console.log("   ...");
    }
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("❌ Skills.md generation failed:", e.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 OpenAI integration tests complete!");
  console.log("=".repeat(50) + "\n");
}

main().catch(console.error);
