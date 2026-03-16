"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Twitter,
  Check,
  Loader2,
  ExternalLink,
  AlertTriangle,
  ArrowLeft,
  Settings,
  Zap,
  MessageSquare,
  Clock,
  Users,
  Info,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

type AgentData = {
  id: string;
  name: string;
  symbol: string;
  mint_address: string | null;
  status: "active" | "paused" | "pending";
  avatar_config: { primaryColor?: string; secondaryColor?: string };
  personality: { archetype?: string; tone?: string; customPrompt?: string };
  x_account: { 
    username?: string; 
    enabled?: boolean;
    postingFrequency?: number;
    replyToMentions?: boolean;
    topics?: string;
  } | null;
  x_oauth_token: string | null;
  x_user_id: string | null;
};

export default function ManageAgentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connected, publicKey } = useWallet();
  const agentId = params.agentId as string;

  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [setupStatus, setSetupStatus] = useState<string>("");

  // Check for OAuth callback success
  useEffect(() => {
    const xConnected = searchParams.get("x_connected");
    const xError = searchParams.get("x_error");
    
    if (xConnected === "true") {
      setSetupStatus("X account connected! Setting up automation...");
      handleSetupAutomation();
    } else if (xError) {
      setError(`X connection failed: ${xError}`);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!connected || !publicKey) return;
    fetchAgent();
  }, [connected, publicKey, agentId]);

  const fetchAgent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${agentId}?wallet=${publicKey?.toBase58()}`);
      const data = await res.json();
      if (data.agent) {
        setAgent(data.agent);
      } else {
        setError(data.error || "Agent not found");
      }
    } catch {
      setError("Failed to load agent");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectX = async () => {
    if (!agent) return;
    setConnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/x-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "oauth-link",
          agentId: agent.id,
        }),
      });

      const data = await res.json();
      if (data.success && data.authUrl) {
        // Redirect to X OAuth
        window.location.href = data.authUrl;
      } else {
        setError(data.error || "Failed to generate OAuth link");
        setConnecting(false);
      }
    } catch {
      setError("Failed to connect X account");
      setConnecting(false);
    }
  };

  const handleSetupAutomation = async () => {
    if (!agent) return;

    try {
      const res = await fetch("/api/x-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setup",
          agentId: agent.id,
          username: agent.x_account?.username || agent.symbol.toLowerCase(),
          personality: agent.personality,
          tokenSymbol: agent.symbol,
          agentName: agent.name,
          joinAgentHive: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSetupStatus("✅ X automation is live! Your agent will start posting soon.");
        // Refresh agent data
        setTimeout(() => {
          fetchAgent();
          router.push(`/manage/${agent.id}`);
        }, 2000);
      } else {
        setError(data.error || "Failed to setup automation");
      }
    } catch {
      setError("Failed to setup X automation");
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Card className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to manage your agents.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Card className="p-12 text-center border-destructive/50">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (!agent) return null;

  const isXConnected = !!agent.x_oauth_token;
  const avatarPrimary = agent.avatar_config?.primaryColor || "#6366f1";
  const avatarSecondary = agent.avatar_config?.secondaryColor || "#a855f7";

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl shrink-0"
              style={{
                background: `linear-gradient(135deg, ${avatarPrimary}, ${avatarSecondary})`,
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <Badge variant="outline">${agent.symbol}</Badge>
                <Badge variant={agent.status === "active" ? "success" : "warning"}>
                  {agent.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your agent's X automation and settings
              </p>
            </div>
          </div>
        </div>

        {/* Setup Status */}
        {setupStatus && (
          <Card className="p-4 mb-6 border-success/50 bg-success/5">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium">{setupStatus}</p>
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="p-4 mb-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* X Account Connection */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center">
              <Twitter className="w-5 h-5 text-[#1DA1F2]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">X (Twitter) Automation</h3>
              <p className="text-xs text-muted-foreground">
                Connect an X account for your agent to post autonomously
              </p>
            </div>
            {isXConnected && (
              <Badge variant="success" className="gap-1">
                <Check className="w-3 h-3" /> Connected
              </Badge>
            )}
          </div>

          {!isXConnected ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> How to Connect
                </h4>
                <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Create a new X account with username: <strong>@{agent.x_account?.username || agent.symbol.toLowerCase()}</strong></li>
                  <li>Click "Connect X Account" below to authorize via OAuth</li>
                  <li>Your agent will automatically set up profile and start posting</li>
                  <li>Posts are generated based on your agent's personality and skills</li>
                </ol>
              </div>

              <Button 
                onClick={handleConnectX} 
                disabled={connecting}
                className="w-full"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                  </>
                ) : (
                  <>
                    <Twitter className="w-4 h-4" /> Connect X Account
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Username</div>
                  <div className="text-sm font-semibold">@{agent.x_account?.username || "N/A"}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <div className="text-sm font-semibold text-success">Active</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Posting Settings
                </h4>
                
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">
                    Posts Per Day: {agent.x_account?.postingFrequency || 4}
                  </label>
                  <div className="text-xs text-muted-foreground">
                    Posts every ~{Math.round(24 / (agent.x_account?.postingFrequency || 4))} hours
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Topics</label>
                  <div className="text-sm">
                    {agent.x_account?.topics || "General AI agent content"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">Reply to Mentions</div>
                  <Badge variant={agent.x_account?.replyToMentions ? "success" : "outline"}>
                    {agent.x_account?.replyToMentions ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              {agent.x_account?.username && (
                <a
                  href={`https://twitter.com/${agent.x_account.username}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4" /> View on X
                  </Button>
                </a>
              )}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href={`/analytics?agent=${agent.id}`}>
            <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Analytics</div>
                  <div className="text-xs text-muted-foreground">View performance metrics</div>
                </div>
              </div>
            </Card>
          </Link>

          {agent.mint_address && (
            <a
              href={`https://pump.fun/coin/${agent.mint_address}`}
              target="_blank"
              rel="noreferrer"
            >
              <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">PumpFun</div>
                    <div className="text-xs text-muted-foreground">View token page</div>
                  </div>
                </div>
              </Card>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
