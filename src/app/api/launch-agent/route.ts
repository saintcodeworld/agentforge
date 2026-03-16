import { NextRequest, NextResponse } from "next/server";
import { Keypair, VersionedTransaction, SystemProgram, PublicKey, TransactionMessage, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/launch-agent
 *
 * Handles the full agent launch flow:
 * 1. Uploads token metadata (name, symbol, image) to IPFS via PumpFun
 * 2. Compiles the skills.md from the user's configuration
 * 3. Creates the token via PumpPortal local transaction API
 * 4. Partially signs tx with mint keypair, returns for user wallet to co-sign
 * 5. Stores agent config in Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      avatar,
      skills,
      tokenomics,
      xAccount,
      personality,
      skillsMd,
      walletAddress,
    } = body;

    // Validate required fields
    if (!tokenomics?.name || !tokenomics?.symbol) {
      return NextResponse.json(
        { success: false, error: "Token name and symbol are required" },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 1: Upload metadata to IPFS via PumpFun
    // ============================================
    // PumpFun IPFS requires multipart form data with a file field
    let metadataUri = "";
    try {
      const formData = new FormData();
      formData.append("name", tokenomics.name);
      formData.append("symbol", tokenomics.symbol);
      formData.append("description", tokenomics.description || `${tokenomics.name} — AI agent powered by AgentForge`);
      formData.append("twitter", "");
      formData.append("telegram", "");
      formData.append("website", "");
      formData.append("showName", "true");

      // Generate a placeholder image if no avatar image is provided
      let imageBlob: Blob;
      if (avatar?.imageDataUrl) {
        const base64Data = avatar.imageDataUrl.split(",")[1];
        const binaryData = Buffer.from(base64Data, "base64");
        imageBlob = new Blob([binaryData], { type: "image/png" });
      } else {
        // Create a minimal 1x1 PNG as placeholder
        imageBlob = createPlaceholderPng();
      }
      formData.append("file", imageBlob, "avatar.png");

      console.log("Uploading metadata to IPFS...");
      const ipfsRes = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: formData,
      });

      if (ipfsRes.ok) {
        const ipfsData = await ipfsRes.json();
        metadataUri = ipfsData.metadataUri;
        console.log("IPFS upload success:", metadataUri);
      } else {
        const errText = await ipfsRes.text();
        console.error("IPFS upload failed:", ipfsRes.status, errText);
        return NextResponse.json(
          { success: false, error: `IPFS metadata upload failed (${ipfsRes.status}). Token creation requires valid metadata.` },
          { status: 500 }
        );
      }
    } catch (ipfsError) {
      console.error("IPFS upload error:", ipfsError);
      return NextResponse.json(
        { success: false, error: "Failed to upload token metadata to IPFS." },
        { status: 500 }
      );
    }

    // ============================================
    // STEP 2: Compile skills.md
    // ============================================
    const finalSkillsMd = skillsMd || compileSkillsMd(skills, personality);

    // ============================================
    // STEP 3: Create token via PumpPortal local transaction API
    // ============================================
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey.toBase58();

    const devBuyAmount = tokenomics.devBuyAmountSol || 0;

    console.log("Creating token via PumpPortal...");
    console.log("  Wallet:", walletAddress);
    console.log("  Mint:", mintPublicKey);
    console.log("  URI:", metadataUri);
    console.log("  Dev buy:", devBuyAmount, "SOL");

    // PumpPortal create transaction - token creation happens separately from dev buy
    // The dev buy is handled as a separate transaction after token creation
    let createTxData: ArrayBuffer;
    try {
      const createRes = await fetch("https://pumpportal.fun/api/trade-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: walletAddress,
          action: "create",
          tokenMetadata: {
            name: tokenomics.name,
            symbol: tokenomics.symbol,
            uri: metadataUri,
          },
          mint: mintPublicKey,
          denominatedInSol: "true",
          amount: 0,
          slippage: 10,
          priorityFee: 0.0005,
          pool: "pump",
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        console.error("PumpPortal create error:", createRes.status, errText);
        return NextResponse.json(
          { success: false, error: `PumpPortal token creation failed (${createRes.status}): ${errText}` },
          { status: 500 }
        );
      }

      createTxData = await createRes.arrayBuffer();
      console.log("PumpPortal create tx ready, size:", createTxData.byteLength, "bytes");
    } catch (pumpError) {
      console.error("PumpPortal API error:", pumpError);
      return NextResponse.json(
        { success: false, error: "PumpPortal API is unreachable. Please try again." },
        { status: 500 }
      );
    }

    // ============================================
    // STEP 4: Return unsigned transaction and mint keypair
    // ============================================
    // PumpPortal create tx requires signatures from BOTH the mint keypair and user wallet.
    // We return the unsigned transaction and the mint keypair so the client can sign properly.
    const unsignedTx = Buffer.from(createTxData).toString("base64");
    const mintPrivateKey = bs58.encode(mintKeypair.secretKey);

    // If dev buy > 0, create a SOL transfer transaction to the creator wallet
    let devBuyTxBase64: string | null = null;
    if (devBuyAmount > 0) {
      try {
        const creatorWalletAddress = process.env.CREATOR_WALLET_ADDRESS;
        
        if (!creatorWalletAddress) {
          console.warn("CREATOR_WALLET_ADDRESS not configured, skipping dev buy");
        } else {
          // Create a connection to get recent blockhash
          const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
          const connection = new Connection(rpcUrl, "confirmed");
          
          // Create SOL transfer instruction from user wallet to creator wallet
          const transferInstruction = SystemProgram.transfer({
            fromPubkey: new PublicKey(walletAddress),
            toPubkey: new PublicKey(creatorWalletAddress),
            lamports: Math.floor(devBuyAmount * LAMPORTS_PER_SOL),
          });

          // Get latest blockhash for the transaction
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

          // Create transaction message
          const messageV0 = new TransactionMessage({
            payerKey: new PublicKey(walletAddress),
            recentBlockhash: blockhash,
            instructions: [transferInstruction],
          }).compileToV0Message();

          // Create versioned transaction
          const transferTx = new VersionedTransaction(messageV0);
          
          // Serialize and encode the transaction
          devBuyTxBase64 = Buffer.from(transferTx.serialize()).toString("base64");
          console.log("Dev buy SOL transfer tx ready:", devBuyAmount, "SOL to creator wallet");
        }
      } catch (buyError) {
        console.warn("Dev buy tx creation error (non-fatal):", buyError);
      }
    }

    // ============================================
    // STEP 5: Store agent config in Supabase
    // ============================================
    const { data: agentRecord, error: dbError } = await supabaseAdmin
      .from("agents")
      .insert({
        wallet_address: walletAddress,
        name: tokenomics.name,
        symbol: tokenomics.symbol,
        mint_address: mintPublicKey,
        avatar_config: avatar || {},
        personality: personality || {},
        skills: skills || [],
        skills_md: finalSkillsMd,
        tokenomics: tokenomics || {},
        x_account: xAccount?.enabled ? xAccount : null,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agentId: agentRecord.id,
      mint: mintPublicKey,
      transaction: unsignedTx,
      mintPrivateKey: mintPrivateKey,
      devBuyTransaction: devBuyTxBase64,
      message: "Transaction created. Sign with your wallet to launch on PumpFun.",
    });
  } catch (error) {
    console.error("Launch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to launch agent" },
      { status: 500 }
    );
  }
}

// Creates a minimal 1x1 white PNG for tokens without custom avatars
function createPlaceholderPng(): Blob {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );
  return new Blob([png], { type: "image/png" });
}

function compileSkillsMd(
  skills: Array<{ id: string; name: string; params: Record<string, unknown> }>,
  personality: { archetype: string; customPrompt: string; tone: string; language: string }
): string {
  let md = `---\nname: AgentForge Agent\ndescription: AI agent powered by AgentForge\n---\n\n`;
  md += `# Agent Configuration\n\n`;
  md += `## Personality\n`;
  md += `- Archetype: ${personality.archetype}\n`;
  md += `- Tone: ${personality.tone}\n`;
  md += `- Language: ${personality.language}\n`;
  if (personality.customPrompt) {
    md += `- Custom Instructions: ${personality.customPrompt}\n`;
  }
  md += `\n# Skills\n\n`;

  for (const skill of skills) {
    md += `## ${skill.name}\n\n`;
    md += `### Parameters\n`;
    for (const [key, value] of Object.entries(skill.params)) {
      md += `- **${key}**: ${value || "default"}\n`;
    }
    md += `\n### Instructions\n`;
    md += `- Execute ${skill.name.toLowerCase()} operations as configured above\n`;
    md += `- Use the @pump-fun/agent-payments-sdk for all on-chain payment operations\n`;
    md += `- Report activity through the AgentForge dashboard API\n\n`;
  }

  return md;
}

