"use client";

import { useAgentStore } from "@/lib/store";
import { PLATFORM_FEE_SOL } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import {
  Rocket,
  Wallet,
  Check,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Flame,
  Twitter,
  Sparkles,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Avatar2D } from "@/components/two-d/avatar-2d";

export function ReviewLaunch() {
  const {
    avatar,
    skills,
    tokenomics,
    xAccount,
    personality,
    generatedSkillsMd,
    isLaunching,
    setIsLaunching,
    launchResult,
    setLaunchResult,
  } = useAgentStore();

  const { connected, publicKey, signTransaction, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const [copied, setCopied] = useState(false);
  const [launchStatus, setLaunchStatus] = useState("");

  const totalCostSol = tokenomics.devBuyAmountSol + PLATFORM_FEE_SOL + 0.0005;

  const errors: string[] = [];
  if (!tokenomics.name.trim()) errors.push("Token name is required");
  if (!tokenomics.symbol.trim()) errors.push("Token symbol is required");
  if (skills.length === 0 && !generatedSkillsMd) errors.push("Add at least one skill or generate skills.md");

  const handleLaunch = async () => {
    if (!connected || !publicKey || !signTransaction || errors.length > 0) return;
    setIsLaunching(true);
    setLaunchStatus("Uploading metadata & creating token...");

    try {
      // Step 1: Call our API to upload metadata, create PumpPortal tx
      const res = await fetch("/api/launch-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar,
          skills,
          tokenomics,
          xAccount,
          personality,
          skillsMd: generatedSkillsMd,
          walletAddress: publicKey.toBase58(),
        }),
      });

      const data = await res.json();

      if (!data.success || !data.transaction) {
        setLaunchResult({ success: false, error: data.error || "Failed to create token transaction." });
        return;
      }

      // Step 2: Deserialize the unsigned CREATE transaction
      const txBytes = Uint8Array.from(atob(data.transaction), (c) => c.charCodeAt(0));
      const createTx = VersionedTransaction.deserialize(txBytes);

      // Step 3: Sign with user's wallet FIRST (Phantom will prompt)
      setLaunchStatus("Sign the token creation in your wallet...");
      const walletSignedTx = await signTransaction(createTx);

      // Step 4: Add mint keypair signature to the wallet-signed transaction
      const mintKeypair = Keypair.fromSecretKey(bs58.decode(data.mintPrivateKey));
      walletSignedTx.sign([mintKeypair]);
      
      const signedCreateTx = walletSignedTx;

      // Step 4: Send the create transaction to the network
      setLaunchStatus("Creating token on PumpFun...");
      const signature = await connection.sendRawTransaction(signedCreateTx.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });

      // Step 5: Confirm the create transaction
      setLaunchStatus("Confirming token creation...");
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      });

      // Step 6 (optional): If there's a dev buy transaction, sign and send it
      if (data.devBuyTransaction) {
        try {
          setLaunchStatus("Sign the dev buy payment in your wallet...");
          const buyTxBytes = Uint8Array.from(atob(data.devBuyTransaction), (c) => c.charCodeAt(0));
          const buyTx = VersionedTransaction.deserialize(buyTxBytes);
          const signedBuyTx = await signTransaction(buyTx);

          setLaunchStatus("Processing dev buy payment to creator...");
          const buySig = await connection.sendRawTransaction(signedBuyTx.serialize(), {
            skipPreflight: false,
            maxRetries: 3,
          });
          const buyBlockhash = await connection.getLatestBlockhash();
          await connection.confirmTransaction({ signature: buySig, ...buyBlockhash });
          console.log("Dev buy payment confirmed:", buySig);
        } catch (buyErr) {
          console.warn("Dev buy payment failed (token still created):", buyErr);
        }
      }

      // Step 6: Update agent status in Supabase
      if (data.agentId) {
        await fetch("/api/agents/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: data.agentId, status: "active", txSignature: signature }),
        }).catch(() => {});
      }

      setLaunchResult({
        success: true,
        mint: data.mint,
        txSignature: signature,
        agentId: data.agentId,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Launch error:", error);
      if (error.message?.includes("User rejected")) {
        setLaunchResult({ success: false, error: "Transaction was rejected. Please try again." });
      } else {
        setLaunchResult({ success: false, error: error.message || "Launch failed. Please try again." });
      }
    } finally {
      setIsLaunching(false);
      setLaunchStatus("");
    }
  };

  const handleCopyMint = () => {
    if (launchResult?.mint) {
      navigator.clipboard.writeText(launchResult.mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (launchResult?.success) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4 py-8">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto animate-pulse-glow">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-bold">Agent Launched!</h2>
          <p className="text-muted-foreground">
            Your agent <span className="text-foreground font-semibold">{tokenomics.name}</span> (${tokenomics.symbol}) is now live on PumpFun.
          </p>
        </div>

        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Token Mint</div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                  {launchResult.mint || "Simulated-Mint-Address"}
                </code>
                <button onClick={handleCopyMint} className="text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Transaction</div>
              <a
                href={`https://solscan.io/tx/${launchResult.txSignature || "simulated"}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View on Solscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href={`https://pump.fun/coin/${launchResult.mint || "simulated"}`}
            target="_blank"
            rel="noreferrer"
          >
            <Card className="p-4 text-center hover:border-primary/50 transition-all cursor-pointer">
              <Rocket className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium">View on PumpFun</div>
            </Card>
          </a>
          <a href="/dashboard">
            <Card className="p-4 text-center hover:border-primary/50 transition-all cursor-pointer">
              <Sparkles className="w-5 h-5 text-secondary mx-auto mb-2" />
              <div className="text-sm font-medium">Agent Dashboard</div>
            </Card>
          </a>
          <a href="/analytics">
            <Card className="p-4 text-center hover:border-primary/50 transition-all cursor-pointer">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
              <div className="text-sm font-medium">Burn Analytics</div>
            </Card>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Review &amp; Launch</h2>
        <p className="text-muted-foreground text-sm">
          Confirm everything looks good before launching your agent on PumpFun.
        </p>
      </div>

      {/* Avatar Preview - What will be uploaded to coin metadata */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {avatar.imageDataUrl ? (
              <img 
                src={avatar.imageDataUrl} 
                alt="Token avatar" 
                className="w-32 h-32 rounded-xl border-2 border-primary/20"
                style={{ imageRendering: avatar.style === "pixel" ? "pixelated" : "auto" }}
              />
            ) : (
              <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-border flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold mb-1">Token Metadata Image</h3>
              <p className="text-sm text-muted-foreground">
                This avatar will be uploaded to IPFS and used as your token&apos;s image on PumpFun, DEX Screener, and other platforms.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="capitalize">
                {avatar.characterType} &middot; {avatar.style}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {avatar.expression}
              </Badge>
              {avatar.accessory !== "none" && (
                <Badge variant="outline" className="capitalize">
                  {avatar.accessory}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const store = useAgentStore.getState();
                store.setStep(0);
              }}
              className="text-xs"
            >
              ← Change Avatar
            </Button>
          </div>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="space-y-1">
              {errors.map((err) => (
                <p key={err} className="text-sm text-destructive">{err}</p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Token */}
        <Card className="p-4 space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Token</h3>
          <div className="text-lg font-bold">{tokenomics.name || "—"}</div>
          <div className="text-sm text-muted-foreground">${tokenomics.symbol || "—"}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default">Buyback {tokenomics.buybackPercent}%</Badge>
            <Badge variant="success">Dev Buy {tokenomics.devBuyAmountSol} SOL</Badge>
          </div>
        </Card>

        {/* Avatar */}
        <Card className="p-4 space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Avatar (Token Metadata Image)</h3>
          <div className="flex items-center gap-3">
            {avatar.imageDataUrl ? (
              <img 
                src={avatar.imageDataUrl} 
                alt="Avatar preview" 
                className="w-16 h-16 rounded-lg border border-border"
                style={{ imageRendering: avatar.style === "pixel" ? "pixelated" : "auto" }}
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-border flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium capitalize">{avatar.characterType}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {avatar.style} style &middot; {avatar.expression}
              </div>
            </div>
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-4 space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Skills</h3>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <Badge key={s.id} variant="outline">{s.name}</Badge>
              ))}
            </div>
          ) : generatedSkillsMd ? (
            <Badge variant="default">Custom skills.md</Badge>
          ) : (
            <p className="text-sm text-muted-foreground">No skills configured</p>
          )}
        </Card>

        {/* Personality */}
        <Card className="p-4 space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider">Personality</h3>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="capitalize">{personality.archetype}</Badge>
            <Badge variant="outline" className="capitalize">{personality.tone}</Badge>
            <Badge variant="outline" className="capitalize">{personality.language}</Badge>
          </div>
        </Card>
      </div>

      {/* X Account */}
      {xAccount.enabled && (
        <Card className="p-4 space-y-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Twitter className="w-3 h-3" /> X Account
          </h3>
          <div className="text-sm">
            <span className="font-mono text-primary">@{xAccount.username || "—"}</span>
            <span className="text-muted-foreground"> &middot; {xAccount.postingFrequency} posts/day</span>
            {xAccount.joinAgentHive && <Badge variant="success" className="ml-2">Agent Hive</Badge>}
          </div>
        </Card>
      )}

      {/* Cost Breakdown */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold">Cost Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dev Buy (Payment to creator wallet)</span>
            <span>{tokenomics.devBuyAmountSol} SOL</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee (AgentForge)</span>
            <span>{PLATFORM_FEE_SOL} SOL</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Solana Priority Fee</span>
            <span>~0.0005 SOL</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-primary">{totalCostSol.toFixed(4)} SOL</span>
          </div>
        </div>
      </Card>

      {/* Launch Button */}
      <div className="flex flex-col gap-3">
        {!connected ? (
          <Button size="lg" className="w-full" onClick={() => setVisible(true)}>
            <Wallet className="w-5 h-5" />
            Connect Wallet to Launch
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              className="w-full"
              onClick={handleLaunch}
              disabled={isLaunching || errors.length > 0}
            >
              {isLaunching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {launchStatus || "Launching Agent..."}
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Launch Agent on PumpFun
                </>
              )}
            </Button>

            {/* Show error from failed launch */}
            {launchResult && !launchResult.success && launchResult.error && (
              <Card className="p-4 border-destructive/50 bg-destructive/5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-destructive font-medium">Launch failed</p>
                    <p className="text-xs text-destructive/80 mt-1">{launchResult.error}</p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
        <p className="text-xs text-center text-muted-foreground">
          By launching, you agree to PumpFun&apos;s terms and the Tokenized Agent Disclaimer.
          You sign one transaction — we never hold your funds.
        </p>
      </div>
    </div>
  );
}
