# Payment Flow — How Users Pay to Launch

## Overview

When a user clicks "Launch Agent" on the review page, they pay for everything in **one single Solana transaction** signed from their connected wallet. We never custody funds.

## Cost Breakdown

| Item | Amount | Goes To |
|------|--------|---------|
| Dev Buy | 0.1–10 SOL (user chooses) | PumpFun bonding curve (buys the new token) |
| Platform Fee | 0.05 SOL | AgentForge treasury wallet |
| Solana Priority Fee | ~0.0005 SOL | Solana validators |

**Total:** Dev Buy + 0.05 + ~0.0005 SOL

## Technical Flow

### Step-by-Step

```
1. User configures agent in the multi-step wizard
2. User clicks "Launch Agent on PumpFun" on the Review step
3. Frontend sends agent config to POST /api/launch-agent
4. Backend:
   a. Uploads token metadata (name, symbol, avatar image) to IPFS via PumpFun API
   b. Generates a mint keypair for the new token
   c. Compiles the skills.md from user's selections
   d. Calls PumpPortal API (/api/trade-local) to build the unsigned transaction
   e. Adds our platform fee as an additional transfer instruction
   f. Returns the unsigned transaction bytes to the frontend
5. Frontend presents the transaction for wallet signing (Phantom/Solflare)
6. User signs ONE transaction
7. Frontend sends the signed transaction to Solana RPC
8. On confirmation:
   a. Token is created on PumpFun
   b. Tokenized Agent setting is enabled
   c. Buyback % is configured
   d. skills.md is uploaded
   e. Platform fee is transferred to us
9. Backend stores agent config in database
10. X automation starts (if enabled)
11. User sees success screen with token mint, tx link, and next steps
```

### PumpPortal API Call (Production)

```javascript
// Build the create transaction
const response = await fetch("https://pumpportal.fun/api/trade-local", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    publicKey: userWalletAddress,
    action: "create",
    tokenMetadata: {
      name: "SolGuard AI",
      symbol: "GUARD",
      uri: metadataUri, // from IPFS upload
    },
    mint: mintKeypair.publicKey.toString(),
    denominatedInSol: "true",
    amount: devBuyAmountSol,
    slippage: 10,
    priorityFee: 0.0005,
    pool: "pump",
  }),
});

// Returns unsigned VersionedTransaction bytes
const txBytes = await response.arrayBuffer();
```

### Platform Fee Injection

Before returning the transaction to the user, we add our fee as an additional instruction:

```javascript
// Add platform fee transfer instruction to the transaction
const platformFeeIx = SystemProgram.transfer({
  fromPubkey: userPublicKey,
  toPubkey: AGENTFORGE_TREASURY,
  lamports: PLATFORM_FEE_SOL * LAMPORTS_PER_SOL,
});
transaction.add(platformFeeIx);
```

## Security Principles

- **Non-custodial:** We never hold user funds. All transactions are signed client-side.
- **Single transaction:** User signs once. No multi-step approval flow.
- **Transparent:** Full cost breakdown shown before signing.
- **On-chain:** Everything is verifiable on Solana explorer.

## Alternative Payment Methods

- **USDC/USDT:** User pays in stablecoin → we swap to SOL on-chain via Jupiter before executing

## Key Files

```
src/components/launch/review-launch.tsx   — Review page with cost breakdown + launch button
src/app/api/launch-agent/route.ts         — Backend that builds and returns the transaction
src/lib/constants.ts                       — PLATFORM_FEE_SOL, PUMPFUN_API_BASE
src/lib/store.ts                           — isLaunching, launchResult state
```
