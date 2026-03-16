# AgentForge — Testing & Setup Guide

Everything is wired to real APIs. Follow these steps to get your testing environment running.

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema:
   ```
   scripts/supabase-schema.sql
   ```
3. Copy your keys from **Settings → API**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. Test: `npm run test:supabase`

## 2. OpenAI Setup

1. Get an API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...
   ```
3. Test: `npm run test:openai`

Uses `gpt-4o-mini` for tweet generation, replies, and skills.md compilation.

## 3. X (Twitter) API Setup

1. Go to [developer.x.com](https://developer.x.com) and create a project/app
2. Enable **OAuth 2.0** with these settings:
   - **Type**: Web App (confidential client)
   - **Callback URL**: `http://localhost:3000/api/x-automation/callback`
   - **Scopes**: `tweet.read`, `tweet.write`, `users.read`, `follows.write`, `offline.access`
3. Add keys to `.env.local`:
   ```env
   X_CLIENT_ID=your_client_id
   X_CLIENT_SECRET=your_client_secret
   X_BEARER_TOKEN=your_bearer_token
   NEXT_PUBLIC_X_CALLBACK_URL=http://localhost:3000/api/x-automation/callback
   ```
4. Test: `npm run test:x`

### OAuth Flow
1. User creates agent → agent gets an ID in Supabase
2. Frontend calls `POST /api/x-automation` with `{ action: "oauth-link", agentId }`
3. User is redirected to X to authorize
4. X redirects back to `/api/x-automation/callback`
5. Callback exchanges code for tokens, stores in Supabase
6. Agent can now post autonomously

## 4. Solana Devnet Setup

1. Already configured — wallet provider uses devnet by default
2. Switch Phantom to devnet: Settings → Developer Settings → Testnet Mode
3. Get devnet SOL: [faucet.solana.com](https://faucet.solana.com)
4. Test: `npm run test:devnet`

The `.env.local` already has:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## 5. Running the App

```bash
npm run dev
```

### Full Testing Flow
1. Connect Phantom wallet (devnet mode)
2. Go to `/launch` — configure avatar, personality, skills, tokenomics, X account
3. On the Review step, click "Launch Agent on PumpFun"
4. The backend will:
   - Upload metadata to IPFS via PumpFun
   - Create a token transaction via PumpPortal
   - Store the agent in Supabase
   - Return a transaction for you to sign
5. After launch, go to `/dashboard` to see your agent (fetched from Supabase)
6. Connect X account via OAuth to enable automated posting

## 6. Automated X Posting (Cron)

The cron endpoint processes queued posts:

```bash
# Trigger manually:
curl -X POST http://localhost:3000/api/cron/x-posts \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json"
```

For production, set up a cron job every 15 minutes pointing to this endpoint.
Set `CRON_SECRET` in `.env.local` to secure it.

## Test Scripts

| Command | What it tests |
|---------|--------------|
| `npm run test:supabase` | DB connection, CRUD on agents/x_posts/metrics tables |
| `npm run test:openai` | Tweet generation, reply generation, skills.md generation |
| `npm run test:x` | Bearer token, username availability, OAuth link generation |
| `npm run test:devnet` | RPC connection, keypair generation, airdrop, PumpPortal/IPFS APIs |
| `npm run test:all` | Runs all tests sequentially |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/launch-agent` | POST | Full agent launch (IPFS + PumpPortal + Supabase) |
| `/api/generate-skills` | POST | AI skill generation (OpenAI + keyword fallback) |
| `/api/x-automation` | POST | X actions: check-username, oauth-link, setup, post, interact |
| `/api/x-automation/callback` | GET | Twitter OAuth 2.0 callback handler |
| `/api/cron/x-posts` | POST | Process queued posts for all active agents |
| `/api/agents` | GET | Fetch agents by wallet address (for dashboard) |
