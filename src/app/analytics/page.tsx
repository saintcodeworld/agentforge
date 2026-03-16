"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Coins,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Wallet,
  Zap,
  Loader2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TIME_RANGES = ["24h", "7d", "30d", "All"];

type AnalyticsData = {
  stats: {
    price_usd: number;
    price_change_7d: number;
    market_cap: number;
    market_cap_change_7d: number;
    total_burned: string;
    burn_percentage: number;
    holders: number;
    holders_change_7d: number;
  };
  burnHistory: Array<{ time: string; amount: string; sol: string }>;
  depositHistory: Array<{ from: string; amount: string; time: string; type: string }>;
  chartData: number[];
  priceChartData: number[];
  revenueData: {
    buybackPercent: number;
    buybackAmount: number;
    claimableAmount: number;
    totalDeposits: number;
  };
  activityLog: Array<{
    action: string;
    detail: string;
    time: string;
    icon: string;
  }>;
};

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agent");
  const [timeRange, setTimeRange] = useState("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!agentId) {
        setError("No agent selected");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics?agentId=${agentId}&timeRange=${timeRange}`);
        const result = await res.json();
        if (result.data) {
          setData(result.data);
        } else if (result.error) {
          setError(result.error);
        }
      } catch {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [agentId, timeRange]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Real-time burn tracking, revenue, and token metrics.
            </p>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {TIME_RANGES.map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs transition-all",
                  timeRange === t ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-6 text-center border-destructive/50">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        ) : data ? (
          <>
        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Token Price</span>
              {data.stats.price_change_7d >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
            </div>
            <div className="text-2xl font-bold">${data.stats.price_usd.toFixed(4)}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${data.stats.price_change_7d >= 0 ? 'text-success' : 'text-destructive'}`}>
              {data.stats.price_change_7d >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {data.stats.price_change_7d >= 0 ? '+' : ''}{data.stats.price_change_7d.toFixed(1)}% (7d)
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Market Cap</span>
              <Coins className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold">${(data.stats.market_cap / 1000).toFixed(1)}K</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${data.stats.market_cap_change_7d >= 0 ? 'text-success' : 'text-destructive'}`}>
              {data.stats.market_cap_change_7d >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {data.stats.market_cap_change_7d >= 0 ? '+' : ''}{data.stats.market_cap_change_7d.toFixed(1)}% (7d)
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Burned</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-400">{data.stats.total_burned}</div>
            <div className="text-xs text-muted-foreground mt-1">{data.stats.burn_percentage.toFixed(2)}% of supply</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Holders</span>
              <Users className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-2xl font-bold">{data.stats.holders.toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${data.stats.holders_change_7d >= 0 ? 'text-success' : 'text-destructive'}`}>
              {data.stats.holders_change_7d >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {data.stats.holders_change_7d >= 0 ? '+' : ''}{data.stats.holders_change_7d} (7d)
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Burn Chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" /> Burn Rate
              </h3>
              <Badge variant="warning">{data.revenueData.buybackPercent}% buyback</Badge>
            </div>
            <div className="flex items-end gap-1 h-40">
              {data.chartData.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${h}%`,
                    background: `linear-gradient(to top, rgba(249,115,22,0.3), rgba(249,115,22,0.8))`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>7 days ago</span>
              <span>Now</span>
            </div>
          </Card>

          {/* Price Chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" /> Price History
              </h3>
              <Badge variant={data.stats.price_change_7d >= 0 ? "success" : "destructive"}>
                {data.stats.price_change_7d >= 0 ? '+' : ''}{data.stats.price_change_7d.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-end gap-1 h-40">
              {data.priceChartData.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${Math.min(h + (i * 1.2), 95)}%`,
                    background: `linear-gradient(to top, rgba(34,197,94,0.2), rgba(34,197,94,0.7))`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>7 days ago</span>
              <span>Now</span>
            </div>
          </Card>
        </div>

        {/* Revenue & Deposit Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Revenue Split */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-primary" /> Revenue Split
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Buyback & Burn ({data.revenueData.buybackPercent}%)</span>
                  <span className="text-orange-400 font-medium">{data.revenueData.buybackAmount.toFixed(2)} SOL</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${data.revenueData.buybackPercent}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Claimable Revenue ({100 - data.revenueData.buybackPercent}%)</span>
                  <span className="text-success font-medium">{data.revenueData.claimableAmount.toFixed(2)} SOL</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${100 - data.revenueData.buybackPercent}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-border flex justify-between text-sm font-semibold">
                <span>Total Deposits</span>
                <span>{data.revenueData.totalDeposits.toFixed(1)} SOL</span>
              </div>
            </div>
          </Card>

          {/* Agent Activity */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-secondary" /> Agent Activity (24h)
            </h3>
            <div className="space-y-3">
              {data.activityLog.map((item, i) => {
                const IconComponent = item.icon === 'Zap' ? Zap : item.icon === 'Flame' ? Flame : Coins;
                return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <IconComponent className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{item.action}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{item.detail}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Burn & Deposit History Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Hourly Burns */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-orange-400" /> Hourly Burn Log
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 text-[10px] text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                <span>Time</span>
                <span>Tokens Burned</span>
                <span>SOL Value</span>
              </div>
              {data.burnHistory.map((row, i) => (
                <div key={i} className="grid grid-cols-3 text-xs py-1.5">
                  <span className="text-muted-foreground">{row.time}</span>
                  <span className="text-orange-400 font-medium">{row.amount}</span>
                  <span>{row.sol}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Deposit History */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-success" /> Recent Deposits
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-4 text-[10px] text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                <span>From</span>
                <span>Amount</span>
                <span>Type</span>
                <span>Time</span>
              </div>
              {data.depositHistory.map((row, i) => (
                <div key={i} className="grid grid-cols-4 text-xs py-1.5">
                  <span className="font-mono text-muted-foreground">{row.from}</span>
                  <span className="font-medium">{row.amount}</span>
                  <Badge variant="outline" className="text-[10px] w-fit">{row.type}</Badge>
                  <span className="text-muted-foreground">{row.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        </>
        ) : null}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}
