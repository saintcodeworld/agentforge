# Skill Builder

## What It Does

The Skill Builder lets creators define what their AI agent can do. It offers two approaches:

1. **Template-Based** — Pick from pre-built skill cards and configure parameters
2. **AI-Powered Natural Language** — Describe what you want in plain English and we generate the `skills.md`

Both approaches produce a `skills.md` file — the standard format PumpFun's Tokenized Agent uses (compatible with AgentSkills.io).

## How It Works

### Track A: Skill Templates

Pre-built skill cards organized by category:

| Category | Skills |
|----------|--------|
| **Monetization** | Payment Processor, Storefront |
| **Social** | Social Poster, Content Creator |
| **Community** | Community Q&A, Newsletter |
| **Analytics** | Market Analyst, Whale Alert |

Each skill has configurable parameters. For example, "Payment Processor" lets you set:
- Accepted currencies (SOL, USDC, USDT)
- Minimum payment amount
- Auto-reply message on payment

Users click a skill card to add it → configure parameters → the system compiles everything into `skills.md`.

### Track B: AI-Powered Generation

Users type a plain-English description in a text box:

> "I want my agent to sell digital wallpapers for 0.5 SOL each. When someone pays, send them a download link. Post a tweet every time a sale happens."

The system:
1. Sends this to our `/api/generate-skills` endpoint
2. In production, an LLM (GPT-4/Claude) parses intent and maps to structured skills
3. Currently uses keyword matching as a fallback demo
4. Returns a formatted `skills.md` that the user can preview and edit

### Track C: Hybrid (Default UX)

Users can mix both: type a description to bootstrap, then fine-tune with template cards, then optionally edit the raw `skills.md` directly.

## skills.md Format

The generated file follows YAML frontmatter + Markdown:

```markdown
---
name: AgentForge Agent
description: AI agent with custom skills
---

# Agent Skills

## Payment Processor

### Parameters
- **accepted_currencies**: SOL, USDC
- **min_payment**: 0.1 SOL
- **auto_reply**: Thanks for your purchase!

### Instructions
- Execute payment processor operations as configured
- Use the @pump-fun/agent-payments-sdk for on-chain operations
- Report activity to the agent dashboard
```

## Key Files

```
src/components/launch/skill-builder.tsx  — UI component (template cards + AI input)
src/app/api/generate-skills/route.ts     — API route for AI skill generation
src/lib/constants.ts                     — SKILL_TEMPLATES array with all templates
src/lib/store.ts                         — SkillConfig type & skills state
```

## Future Improvements

- Community skill marketplace (users submit & share skills)
- Revenue sharing on community-submitted skills
- Skill dependency resolution (e.g., "Storefront" auto-adds "Payment Processor")
- Visual skill flow editor (node-based, like n8n)
- Skill versioning and rollback
