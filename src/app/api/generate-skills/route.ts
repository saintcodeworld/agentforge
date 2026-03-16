import { NextRequest, NextResponse } from "next/server";
import { generateSkillsWithAI } from "@/lib/openai";

/**
 * POST /api/generate-skills
 *
 * Takes a natural language description and generates a skills.md file.
 * Uses OpenAI for AI-powered generation with keyword fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, existingSkills } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Try OpenAI first, fall back to keyword-based detection
    let skillsMd = "";
    let source: "ai" | "keyword" = "keyword";

    if (process.env.OPENAI_API_KEY) {
      try {
        skillsMd = await generateSkillsWithAI(prompt, existingSkills || []);
        source = "ai";
      } catch (aiError) {
        console.warn("OpenAI generation failed, falling back to keyword detection:", aiError);
      }
    }

    // Fallback: keyword-based skill detection
    if (!skillsMd) {
      const detectedSkills = detectSkillsFromPrompt(prompt);
      skillsMd = generateSkillsMdFromDetected(prompt, detectedSkills, existingSkills || []);
    }

    return NextResponse.json({
      skillsMd,
      source,
      message: source === "ai"
        ? "Skills generated with AI from your description. Review and edit before launching."
        : "Skills generated from keyword detection. You can edit the output before launching.",
    });
  } catch (error) {
    console.error("Skills generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate skills" },
      { status: 500 }
    );
  }
}

type DetectedSkill = {
  name: string;
  description: string;
  params: Record<string, string>;
};

function detectSkillsFromPrompt(prompt: string): DetectedSkill[] {
  const lower = prompt.toLowerCase();
  const skills: DetectedSkill[] = [];

  if (lower.includes("sell") || lower.includes("payment") || lower.includes("buy") || lower.includes("purchase") || lower.includes("store")) {
    skills.push({
      name: "Payment Processor",
      description: "Accept payments for goods or services",
      params: {
        accepted_currencies: "SOL, USDC",
        auto_reply: "Thank you for your purchase!",
      },
    });
  }

  if (lower.includes("tweet") || lower.includes("post") || lower.includes("twitter") || lower.includes("social")) {
    skills.push({
      name: "Social Poster",
      description: "Automatically post updates to social media",
      params: {
        platforms: "X (Twitter)",
        frequency: "4 posts per day",
      },
    });
  }

  if (lower.includes("answer") || lower.includes("question") || lower.includes("support") || lower.includes("help") || lower.includes("community")) {
    skills.push({
      name: "Community Q&A",
      description: "Answer community questions from a knowledge base",
      params: {
        response_style: "Friendly",
        knowledge_source: "Uploaded documents",
      },
    });
  }

  if (lower.includes("price") || lower.includes("market") || lower.includes("analysis") || lower.includes("chart") || lower.includes("trading")) {
    skills.push({
      name: "Market Analyst",
      description: "Post token price analysis and market updates",
      params: {
        analysis_type: "Price Action, Volume",
        alert_threshold: "10%",
      },
    });
  }

  if (lower.includes("nft") || lower.includes("art") || lower.includes("image") || lower.includes("content") || lower.includes("meme")) {
    skills.push({
      name: "Content Creator",
      description: "Generate and distribute creative content",
      params: {
        content_type: "Images, Threads",
        style: "Creative",
      },
    });
  }

  if (lower.includes("whale") || lower.includes("alert") || lower.includes("monitor") || lower.includes("track")) {
    skills.push({
      name: "Whale Alert",
      description: "Monitor and announce large transactions",
      params: {
        threshold: "10 SOL",
        notify_on: "X (Twitter), Telegram",
      },
    });
  }

  if (lower.includes("download") || lower.includes("digital") || lower.includes("deliver") || lower.includes("product")) {
    skills.push({
      name: "Storefront",
      description: "Sell digital goods with automatic delivery",
      params: {
        delivery_method: "Download Link",
        price: "0.5 SOL",
      },
    });
  }

  if (lower.includes("newsletter") || lower.includes("update") || lower.includes("weekly") || lower.includes("recap")) {
    skills.push({
      name: "Newsletter",
      description: "Send periodic updates to subscribers",
      params: {
        frequency: "Weekly",
        topics: "Project updates, market insights",
      },
    });
  }

  // Fallback: if nothing detected, create a custom skill from the prompt
  if (skills.length === 0) {
    skills.push({
      name: "Custom Agent Skill",
      description: prompt.slice(0, 200),
      params: {
        behavior: prompt,
      },
    });
  }

  return skills;
}

function generateSkillsMdFromDetected(
  originalPrompt: string,
  detectedSkills: DetectedSkill[],
  existingSkills: Array<{ name: string }>
): string {
  let md = `---\nname: AgentForge Custom Agent\ndescription: AI agent with skills generated from natural language\n---\n\n`;
  md += `# Agent Skills\n\n`;
  md += `> Generated from: "${originalPrompt.slice(0, 100)}${originalPrompt.length > 100 ? "..." : ""}"\n\n`;

  for (const skill of detectedSkills) {
    // Skip if already exists in the user's manually selected skills
    if (existingSkills.some((s) => s.name === skill.name)) continue;

    md += `## ${skill.name}\n\n`;
    md += `${skill.description}\n\n`;
    md += `### Parameters\n`;
    for (const [key, value] of Object.entries(skill.params)) {
      md += `- **${key}**: ${value}\n`;
    }
    md += `\n### Instructions\n`;
    md += `- Execute this skill according to the parameters above\n`;
    md += `- Use @pump-fun/agent-payments-sdk for any on-chain payment operations\n`;
    md += `- All revenue flows to the Agent Deposit Address for buyback & burn\n`;
    md += `- Report activity through the AgentForge dashboard\n\n`;
  }

  return md;
}
