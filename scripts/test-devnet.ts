/**
 * Test script: Verify Solana devnet connectivity and PumpPortal API
 *
 * Usage: npx tsx scripts/test-devnet.ts
 *
 * Tests:
 * 1. Solana devnet RPC connection
 * 2. Keypair generation
 * 3. Devnet airdrop (for testing)
 * 4. PumpPortal API ping
 * 5. PumpFun IPFS API ping
 */

import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");

async function main() {
  console.log("⛓️  Testing Solana devnet + PumpPortal integration...\n");
  console.log(`   RPC URL: ${rpcUrl}\n`);

  // 1. Test devnet connection
  console.log("🔌 Testing devnet RPC connection...");
  const connection = new Connection(rpcUrl, "confirmed");
  try {
    const version = await connection.getVersion();
    console.log(`✅ Connected to Solana devnet (version: ${version["solana-core"]})`);
    
    const slot = await connection.getSlot();
    console.log(`   Current slot: ${slot}`);
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("❌ Devnet connection failed:", e.message);
    process.exit(1);
  }

  // 2. Generate test keypair
  console.log("\n🔑 Generating test keypair...");
  const keypair = Keypair.generate();
  console.log(`✅ Public key: ${keypair.publicKey.toBase58()}`);
  console.log(`   Secret key (base58): ${bs58.encode(keypair.secretKey).substring(0, 20)}...`);

  // 3. Request devnet airdrop
  console.log("\n💰 Requesting devnet SOL airdrop (1 SOL)...");
  try {
    const signature = await connection.requestAirdrop(
      keypair.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    console.log(`   Airdrop tx: ${signature}`);

    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });

    const balance = await connection.getBalance(keypair.publicKey);
    console.log(`✅ Airdrop confirmed! Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.warn("⚠️  Airdrop failed (may be rate-limited):", e.message);
    console.log("   This is normal if you've requested too many airdrops recently.");
    console.log("   You can use https://faucet.solana.com instead.");
  }

  // 4. Test PumpPortal API
  console.log("\n🎯 Testing PumpPortal API...");
  try {
    const res = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: keypair.publicKey.toBase58(),
        action: "create",
        tokenMetadata: {
          name: "AgentForge Test",
          symbol: "AFTEST",
          uri: "",
        },
        mint: Keypair.generate().publicKey.toBase58(),
        denominatedInSol: "true",
        amount: 0.01,
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump",
      }),
    });

    if (res.ok) {
      const data = await res.arrayBuffer();
      console.log(`✅ PumpPortal responded with transaction (${data.byteLength} bytes)`);
      console.log("   This transaction would need to be signed and submitted to create the token.");
    } else {
      const text = await res.text();
      console.log(`⚠️  PumpPortal returned ${res.status}: ${text.substring(0, 200)}`);
      console.log("   This is expected if PumpPortal requires specific conditions.");
    }
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("❌ PumpPortal API error:", e.message);
  }

  // 5. Test PumpFun IPFS API
  console.log("\n📦 Testing PumpFun IPFS API...");
  try {
    const formData = new FormData();
    formData.append("name", "AgentForge Test");
    formData.append("symbol", "AFTEST");
    formData.append("description", "Test token metadata upload");
    formData.append("showName", "true");

    const res = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ IPFS upload successful!`);
      console.log(`   Metadata URI: ${data.metadataUri}`);
    } else {
      const text = await res.text();
      console.log(`⚠️  IPFS API returned ${res.status}: ${text.substring(0, 200)}`);
    }
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("⚠️  IPFS API error:", e.message);
    console.log("   PumpFun IPFS may require specific auth or conditions.");
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Devnet integration tests complete!");
  console.log("=".repeat(50));
  console.log("\nTest wallet generated for this session:");
  console.log(`  Public Key: ${keypair.publicKey.toBase58()}`);
  console.log(`  Secret Key: ${bs58.encode(keypair.secretKey)}`);
  console.log("\nSave this keypair if you want to reuse it for further testing.\n");
}

main().catch(console.error);
