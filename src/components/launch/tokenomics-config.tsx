"use client";

import { useAgentStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Flame, Coins, TrendingUp, Info } from "lucide-react";

export function TokenomicsConfig() {
  const { tokenomics, setTokenomics } = useAgentStore();

  const estimatedMonthlyBurn = (revenue: number) => {
    return (revenue * (tokenomics.buybackPercent / 100)).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Token &amp; Economics</h2>
        <p className="text-muted-foreground text-sm">
          Configure your PumpFun token and the Tokenized Agent buyback/burn parameters.
        </p>
      </div>

      {/* Token Info */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" /> Token Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Token Name</label>
            <Input
              value={tokenomics.name}
              onChange={(e) => setTokenomics({ name: e.target.value })}
              placeholder="e.g., SolGuard AI"
              maxLength={32}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Token Symbol</label>
            <Input
              value={tokenomics.symbol}
              onChange={(e) => setTokenomics({ symbol: e.target.value.toUpperCase() })}
              placeholder="e.g., GUARD"
              maxLength={10}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Description</label>
          <textarea
            value={tokenomics.description}
            onChange={(e) => setTokenomics({ description: e.target.value })}
            placeholder="Describe your agent token and its purpose..."
            className="w-full h-20 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">{tokenomics.description.length}/200</p>
        </div>
      </Card>

      {/* Buyback & Burn Config */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" /> Buyback &amp; Burn Settings
        </h3>
        <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            The Tokenized Agent Authority uses this percentage of deposited assets to buy back and burn your token every hour.
            The remaining funds can be claimed by you as revenue.
          </p>
        </div>

        <Slider
          value={tokenomics.buybackPercent}
          onChange={(v) => setTokenomics({ buybackPercent: v })}
          min={1}
          max={100}
          step={1}
          label="Buyback & Burn Percentage"
          suffix="%"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">Goes to Buyback/Burn</div>
            <div className="text-lg font-bold text-orange-400 mt-1">{tokenomics.buybackPercent}%</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">Claimable Revenue</div>
            <div className="text-lg font-bold text-success mt-1">{100 - tokenomics.buybackPercent}%</div>
          </div>
        </div>
      </Card>

      {/* Dev Buy */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" /> Initial Dev Buy
        </h3>
        <p className="text-xs text-muted-foreground">
          SOL amount that users pay directly to the token creator&apos;s wallet when launching. This supports the creator and is separate from the token creation fee.
        </p>
        <Slider
          value={tokenomics.devBuyAmountSol}
          onChange={(v) => setTokenomics({ devBuyAmountSol: v })}
          min={0.1}
          max={10}
          step={0.1}
          label="Dev Buy Amount"
          suffix=" SOL"
        />
      </Card>

      {/* Simulation */}
      <Card className="p-4 space-y-4 border-primary/20">
        <h3 className="text-sm font-semibold">Burn Simulation</h3>
        <p className="text-xs text-muted-foreground">
          Estimated monthly token burn based on hypothetical revenue scenarios:
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[10, 50, 200].map((rev) => (
            <div key={rev} className="bg-muted rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">{rev} SOL/mo revenue</div>
              <div className="text-sm font-bold text-orange-400 mt-1">
                {estimatedMonthlyBurn(rev)} SOL
              </div>
              <div className="text-[10px] text-muted-foreground">burned monthly</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
