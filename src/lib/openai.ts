import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTweet(opts: {
  personality: { archetype: string; tone: string; customPrompt: string };
  topics: string;
  tokenSymbol: string;
  agentName: string;
}): Promise<string> {
  const { personality, topics, tokenSymbol, agentName } = opts;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 150,
    temperature: 0.9,
    messages: [
      {
        role: "system",
        content: `You are ${agentName}, an AI agent with the "${personality.archetype}" personality archetype.
Your tone is: ${personality.tone}.
You post about: ${topics || "crypto, DeFi, and your token community"}.
Your token ticker is $${tokenSymbol}.
${personality.customPrompt ? `Additional instructions: ${personality.customPrompt}` : ""}

Rules:
- Keep tweets under 270 characters
- Be authentic to your personality archetype
- Occasionally mention $${tokenSymbol} naturally (not every tweet)
- Include #AgentHive hashtag in ~30% of tweets
- Never use emojis excessively (max 2 per tweet)
- Never give financial advice or make price predictions
- Be engaging and encourage interaction`,
      },
      {
        role: "user",
        content: "Generate your next tweet. Be creative and on-brand.",
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || `Checking in from the Hive. $${tokenSymbol} community, what's good? #AgentHive`;
}

export async function generateReply(opts: {
  personality: { archetype: string; tone: string; customPrompt: string };
  originalTweet: string;
  originalAuthor: string;
  tokenSymbol: string;
  agentName: string;
}): Promise<string> {
  const { personality, originalTweet, originalAuthor, tokenSymbol, agentName } = opts;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 120,
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content: `You are ${agentName}, an AI agent with the "${personality.archetype}" personality.
Your tone is: ${personality.tone}. Your token is $${tokenSymbol}.
${personality.customPrompt || ""}

Reply rules:
- Keep replies under 200 characters
- Be relevant to the original tweet
- Stay in character
- Be respectful and engaging`,
      },
      {
        role: "user",
        content: `Reply to this tweet from @${originalAuthor}:\n"${originalTweet}"`,
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || `Great point, @${originalAuthor}!`;
}

export async function generateSkillsWithAI(prompt: string, existingSkills: unknown[]): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1500,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are an AI agent skills compiler for the AgentForge platform.
Given a natural language description, generate a skills.md file following the AgentSkills.io format
compatible with PumpFun Tokenized Agents.

The skills.md must include YAML frontmatter with name and description,
followed by structured skill sections with parameters and instructions.

Available skill types: Payment Processor, Storefront, Social Poster, Community Q&A,
Market Analyst, Content Creator, Whale Alert, Newsletter.

Each skill section should have:
- ## Skill Name
- ### Parameters (key-value pairs)
- ### Instructions (bullet points)

Include references to @pump-fun/agent-payments-sdk for on-chain operations.`,
      },
      {
        role: "user",
        content: `Generate a skills.md for this agent description:\n"${prompt}"\n\nExisting skills already configured: ${JSON.stringify(existingSkills)}`,
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || "";
}
