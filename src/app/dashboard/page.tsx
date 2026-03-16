"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Rocket,
  Flame,
  TrendingUp,
  Twitter,
  Settings,
  ExternalLink,
  Plus,
  Bot,
  Coins,
  BarChart3,
  Clock,
  Users,
  Loader2,
  Wallet,
} from "lucide-react";

type AgentData = {
  id: string;
  name: string;
  symbol: string;
  mint_address: string | null;
  status: "active" | "paused" | "pending";
  avatar_config: { primaryColor?: string; secondaryColor?: string };
  personality: { archetype?: string };
  skills: Array<{ name: string }>;
  tokenomics: { buybackPercent?: number };
  x_account: { username?: string; enabled?: boolean } | null;
  created_at: string;
  stats: {
    totalPosts: number;
    queuedPosts: number;
    metrics: {
      price_usd: number | null;
      holders: number | null;
      total_burned: string | null;
      total_revenue_sol: number | null;
      x_followers: number | null;
    } | null;
  };
  recentPosts: Array<{
    id: string;
    content: string;
    status: string;
    posted_at: string | null;
  }>;
};

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) return;

    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/agents?wallet=${publicKey.toBase58()}`);
        const data = await res.json();
        if (data.agents) {
          setAgents(data.agents);
        } else if (data.error) {
          setError(data.error);
        }
      } catch {
        setError("Failed to load agents");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Card className="p-12 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Solana wallet to view your launched agents.
            </p>
            <Button onClick={() => setVisible(true)}>
              <Wallet className="w-4 h-4" /> Connect Wallet
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">My Agents</h1>
            <p className="text-sm text-muted-foreground">Manage and monitor your launched agents.</p>
          </div>
          <Link href="/launch">
            <Button>
              <Plus className="w-4 h-4" /> Launch New Agent
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="p-6 text-center border-destructive/50">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {!loading && !error && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <Card className="p-4 text-center">
                <Bot className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-2xl font-bold">{agents.filter(a => a.status === "active").length}</div>
                <div className="text-xs text-muted-foreground">Active Agents</div>
              </Card>
              <Card className="p-4 text-center">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <div className="text-2xl font-bold text-orange-400">
                  {agents.reduce((sum, a) => sum + (parseInt(a.stats.metrics?.total_burned || "0") || 0), 0) || "—"}
                </div>
                <div className="text-xs text-muted-foreground">Total Burned</div>
              </Card>
              <Card className="p-4 text-center">
                <Coins className="w-5 h-5 text-success mx-auto mb-1" />
                <div className="text-2xl font-bold text-success">
                  {agents.reduce((sum, a) => sum + (a.stats.metrics?.total_revenue_sol || 0), 0).toFixed(1)} SOL
                </div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
              </Card>
              <Card className="p-4 text-center">
                <Users className="w-5 h-5 text-secondary mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  {agents.reduce((sum, a) => sum + (a.stats.metrics?.holders || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Holders</div>
              </Card>
            </div>

            {/* Agent Cards */}
            <div className="space-y-4">
              {agents.map((agent) => {
                const avatarPrimary = agent.avatar_config?.primaryColor || "#6366f1";
                const avatarSecondary = agent.avatar_config?.secondaryColor || "#a855f7";
                const xUsername = agent.x_account?.username;
                const metrics = agent.stats.metrics;
                const buybackPercent = agent.tokenomics?.buybackPercent || 0;

                return (
                  <Card key={agent.id} className="p-5 hover:border-primary/20 transition-all">
                    <div className="flex flex-col lg:flex-row gap-5">
                      {/* Left: Agent Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className="w-14 h-14 rounded-xl shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${avatarPrimary}, ${avatarSecondary})`,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg">{agent.name}</h3>
                            <Badge variant="outline">${agent.symbol}</Badge>
                            <Badge variant={agent.status === "active" ? "success" : agent.status === "pending" ? "warning" : "outline"}>
                              {agent.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 font-mono">
                            {agent.mint_address ? `${agent.mint_address.slice(0, 6)}...${agent.mint_address.slice(-4)}` : "No mint"}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {agent.skills.map((s) => (
                              <Badge key={s.name} variant="outline" className="text-[10px]">{s.name}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-[420px]">
                        <div className="bg-muted rounded-lg p-2.5 text-center">
                          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Price
                          </div>
                          <div className="text-sm font-bold">
                            {metrics?.price_usd ? `$${metrics.price_usd.toFixed(4)}` : "—"}
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5 text-center">
                          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <Flame className="w-3 h-3" /> Burned
                          </div>
                          <div className="text-sm font-bold text-orange-400">{metrics?.total_burned || "—"}</div>
                          <div className="text-[10px] text-muted-foreground">{buybackPercent}% rate</div>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5 text-center">
                          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <Coins className="w-3 h-3" /> Posts
                          </div>
                          <div className="text-sm font-bold text-success">{agent.stats.totalPosts}</div>
                          <div className="text-[10px] text-muted-foreground">{agent.stats.queuedPosts} queued</div>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5 text-center">
                          <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                            <Twitter className="w-3 h-3" /> X
                          </div>
                          <div className="text-sm font-bold">
                            {metrics?.x_followers ? `${(metrics.x_followers / 1000).toFixed(1)}K` : "—"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {xUsername ? `@${xUsername}` : "Not connected"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> Created {new Date(agent.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/analytics?agent=${agent.id}`}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-3 h-3" /> Analytics
                          </Button>
                        </Link>
                        <Link href={`/manage/${agent.id}`}>
                          <Button variant="outline" size="sm">
                            <Settings className="w-3 h-3" /> Manage
                          </Button>
                        </Link>
                        {agent.mint_address && (
                          <a
                            href={`https://pump.fun/coin/${agent.mint_address}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-3 h-3" /> PumpFun
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {agents.length === 0 && (
              <Card className="p-12 text-center">
                <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Launch your first AI agent with a 3D avatar and PumpFun tokenized economics.
                </p>
                <Link href="/launch">
                  <Button>
                    <Plus className="w-4 h-4" /> Launch Your First Agent
                  </Button>
                </Link>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
