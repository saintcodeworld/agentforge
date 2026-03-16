# Tokenomics Configuration

## What It Does

The Tokenomics Configuration panel lets creators set up their PumpFun token and configure the Tokenized Agent's buyback & burn mechanics — all through visual sliders and inputs, no Solana knowledge required.

## How PumpFun's Tokenized Agent Works (Summary)

1. A token is created on PumpFun with the **Tokenized Agent** setting enabled
2. The token gets a unique **Agent Deposit Address** where anyone can send SOL, USDC, USDT, or USD1
3. The **Tokenized Agent Authority** (a smart contract) takes a creator-defined percentage of deposits and uses it to **buy back** the token on the open market every hour
4. All bought-back tokens are **burned** — permanently removed from circulating supply
5. The remaining percentage of deposits can be **claimed by the creator** as revenue

## What Users Configure

### Token Details
- **Token Name** — e.g., "SolGuard AI" (max 32 chars)
- **Token Symbol** — e.g., "GUARD" (max 10 chars, auto-uppercased)
- **Description** — Short description for the token (max 200 chars)

### Buyback & Burn Percentage
- A slider from 1% to 100%
- Controls how much of the Agent Deposit Address deposits go to buyback/burn
- The remainder = creator's claimable revenue
- **Example:** 60% buyback → if 10 SOL deposited, 6 SOL buys & burns tokens, 4 SOL claimable by creator
- This percentage can be changed at any time post-launch

### Initial Dev Buy
- A slider from 0.1 to 10 SOL
- This is the SOL amount used to purchase the agent's own token at creation
- Required by PumpFun — funds the initial liquidity
- Goes directly into the bonding curve

### Burn Simulation
- Shows estimated monthly burn for three revenue scenarios (10, 50, 200 SOL/month)
- Helps creators understand the economic impact of their buyback % choice

## Key Files

```
src/components/launch/tokenomics-config.tsx  — UI component with sliders
src/lib/store.ts                              — TokenomicsConfig type & state
src/lib/constants.ts                          — PLATFORM_FEE_SOL, ACCEPTED_CURRENCIES
```

## How It Connects to PumpFun

During launch, our API route (`/api/launch-agent`) sends these parameters to PumpPortal:

```json
{
  "action": "create",
  "tokenMetadata": {
    "name": "SolGuard AI",
    "symbol": "GUARD",
    "uri": "<IPFS metadata URI>"
  },
  "denominatedInSol": "true",
  "amount": 1,
  "slippage": 10,
  "priorityFee": 0.0005,
  "pool": "pump"
}
```

After token creation, the Tokenized Agent setting is enabled with the buyback percentage via PumpFun's agent SDK.

## Future Improvements

- Fee sharing configuration (split fees among multiple stakeholders)
- Advanced simulation with real market data
- Auto-adjust buyback % based on market conditions
- Multi-token agent (agent manages multiple tokens)
