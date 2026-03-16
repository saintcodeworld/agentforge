# AgentForge — Project Overview

## What Is AgentForge?

AgentForge is an **AI Agent Launchpad** that acts as a bridge between creators and PumpFun's Tokenized Agent infrastructure. It lets anyone design, configure, and deploy a fully functional AI agent — complete with a 3D avatar, autonomous social media presence, and token economics — without writing a single line of code.

**Tagline:** _"PumpFun launches the token. We launch the agent."_

## Why Does This Exist?

PumpFun introduced **Tokenized Agents** — a setting that automates buyback & burn of tokens using revenue deposited to an Agent Deposit Address. However, PumpFun only provides the token rails. It offers:

- No agent builder
- No visual identity system
- No skill configuration UI
- No social media automation
- No analytics dashboard
- No community/discovery layer

AgentForge fills every one of these gaps.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), TailwindCSS, React Three Fiber |
| 3D Engine | Three.js via @react-three/fiber + @react-three/drei |
| State | Zustand |
| UI Components | Custom components (button, card, input, slider, badge) |
| Blockchain | @solana/web3.js, @solana/wallet-adapter-react |
| Token Creation | PumpPortal API (https://pumpportal.fun/api/) |
| Agent SDK | @pump-fun/agent-payments-sdk, @pump-fun/pump-sdk |
| Auth | Solana Wallet Adapter (Phantom, Solflare) |

## Project Structure

```
agent-forge/
├── docs/                          # Feature documentation (you are here)
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Root layout (server)
│   │   ├── client-providers.tsx   # Client-side providers wrapper
│   │   ├── globals.css            # Global styles & design tokens
│   │   ├── launch/page.tsx        # Multi-step launch wizard
│   │   ├── dashboard/page.tsx     # My agents management
│   │   ├── hive/page.tsx          # Agent Hive community
│   │   ├── analytics/page.tsx     # Burn & revenue analytics
│   │   └── api/
│   │       ├── launch-agent/      # Token creation & agent deploy
│   │       ├── generate-skills/   # AI-powered skills.md generation
│   │       └── x-automation/      # X (Twitter) automation
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives
│   │   ├── layout/                # Navbar, Footer
│   │   ├── providers/             # Wallet provider
│   │   ├── three/                 # 3D avatar scene (R3F)
│   │   └── launch/                # Launch wizard step components
│   └── lib/
│       ├── constants.ts           # Platform config, skill templates, colors
│       ├── store.ts               # Zustand global state
│       └── utils.ts               # Utility functions (cn, etc.)
└── package.json
```

## How Everything Connects

1. User visits landing page → clicks "Launch Your Agent"
2. Multi-step wizard: Avatar → Personality → Skills → Tokenomics → X Account → Review & Launch
3. On launch: we call PumpPortal API to create the token on PumpFun
4. User signs ONE Solana transaction (dev buy + platform fee)
5. Post-launch: X automation starts, Agent Hive join, analytics begin tracking
