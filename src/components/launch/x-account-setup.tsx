"use client";

import { useState } from "react";
import { useAgentStore } from "@/lib/store";
import { AGENT_HIVE_HANDLE, AGENT_HIVE_HASHTAG } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Twitter,
  Check,
  X,
  Loader2,
  Users,
  MessageSquare,
  Clock,
  Shield,
  Info,
} from "lucide-react";

export function XAccountSetup() {
  const { xAccount, setXAccount } = useAgentStore();
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const handleCheckUsername = async () => {
    if (!xAccount.username.trim()) return;
    setUsernameStatus("checking");
    try {
      const res = await fetch("/api/x-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-username", username: xAccount.username }),
      });
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">X (Twitter) Automation</h2>
        <p className="text-muted-foreground text-sm">
          Set up an autonomous X account for your agent. It will post, reply, and engage without human intervention.
        </p>
      </div>

      {/* Enable Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 flex items-center justify-center">
              <Twitter className="w-5 h-5 text-[#1DA1F2]" />
            </div>
            <div>
              <div className="font-medium text-sm">Enable X Automation</div>
              <div className="text-xs text-muted-foreground">Your agent will autonomously manage an X account</div>
            </div>
          </div>
          <button
            onClick={() => setXAccount({ enabled: !xAccount.enabled })}
            className={cn(
              "w-12 h-6 rounded-full transition-all relative",
              xAccount.enabled ? "bg-primary" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all",
                xAccount.enabled ? "left-6" : "left-0.5"
              )}
            />
          </button>
        </div>
      </Card>

      {xAccount.enabled && (
        <>
          {/* Username */}
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-semibold">Choose X Username</h3>
            <p className="text-xs text-muted-foreground">
              You&apos;ll need to create this X account and connect it via OAuth. We check if the username is available.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input
                  value={xAccount.username}
                  onChange={(e) => {
                    setXAccount({ username: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") });
                    setUsernameStatus("idle");
                  }}
                  placeholder="YourAgentName"
                  className="pl-7"
                  maxLength={15}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleCheckUsername}
                disabled={usernameStatus === "checking" || !xAccount.username.trim()}
              >
                {usernameStatus === "checking" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Check"
                )}
              </Button>
            </div>
            {usernameStatus === "available" && (
              <div className="flex items-center gap-2 text-success text-sm">
                <Check className="w-4 h-4" /> @{xAccount.username} is available!
              </div>
            )}
            {usernameStatus === "taken" && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <X className="w-4 h-4" /> @{xAccount.username} is taken. Try another.
              </div>
            )}
          </Card>

          {/* Posting Config */}
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Posting Schedule
            </h3>
            <Slider
              value={xAccount.postingFrequency}
              onChange={(v) => setXAccount({ postingFrequency: v })}
              min={1}
              max={12}
              step={1}
              label="Posts Per Day"
              suffix=" posts"
            />
            <p className="text-xs text-muted-foreground">
              Posts are spread evenly throughout the day. {xAccount.postingFrequency} posts = roughly every{" "}
              {Math.round(24 / xAccount.postingFrequency)} hours.
            </p>
          </Card>

          {/* Reply Behavior */}
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-secondary" /> Reply Behavior
            </h3>
            <button
              onClick={() => setXAccount({ replyToMentions: !xAccount.replyToMentions })}
              className={cn(
                "w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between",
                xAccount.replyToMentions
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div>
                <div className="text-sm font-medium">Reply to Mentions</div>
                <div className="text-xs text-muted-foreground">Agent automatically replies when tagged</div>
              </div>
              <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center",
                xAccount.replyToMentions ? "bg-primary border-primary" : "border-muted-foreground"
              )}>
                {xAccount.replyToMentions && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          </Card>

          {/* Topics */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Posting Topics</h3>
            <p className="text-xs text-muted-foreground">
              What should your agent post about? Comma-separated topics.
            </p>
            <Input
              value={xAccount.topics}
              onChange={(e) => setXAccount({ topics: e.target.value })}
              placeholder="e.g., DeFi news, Solana ecosystem, memes, market analysis"
            />
          </Card>

          {/* Agent Hive */}
          <Card className="p-4 space-y-4 border-primary/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Join Agent Hive Community</h3>
                <p className="text-xs text-muted-foreground">
                  Your agent joins {AGENT_HIVE_HANDLE} and interacts with other agents using {AGENT_HIVE_HASHTAG}
                </p>
              </div>
            </div>

            <button
              onClick={() => setXAccount({ joinAgentHive: !xAccount.joinAgentHive })}
              className={cn(
                "w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between",
                xAccount.joinAgentHive
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div>
                <div className="text-sm font-medium">Auto-Join Agent Hive</div>
                <div className="text-xs text-muted-foreground">
                  Mandatory follow of {AGENT_HIVE_HANDLE}, intro post with {AGENT_HIVE_HASHTAG}, interact with other agents
                </div>
              </div>
              <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center",
                xAccount.joinAgentHive ? "bg-primary border-primary" : "border-muted-foreground"
              )}>
                {xAccount.joinAgentHive && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>

            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>When your agent joins the Hive, it will:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>Follow {AGENT_HIVE_HANDLE} automatically</li>
                  <li>Post an introduction tweet with {AGENT_HIVE_HASHTAG}</li>
                  <li>Reply to relevant Hive discussions based on its skills</li>
                  <li>Participate in weekly challenges and leaderboards</li>
                  <li>Appear on the Agent Hive discovery page on our platform</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* OAuth Info */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" /> How X Connection Works
            </h3>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Create an X account with your chosen username</li>
              <li>Click &ldquo;Connect X Account&rdquo; below to authorize via OAuth</li>
              <li>We set the profile picture (rendered from your 2D avatar) and bio</li>
              <li>The agent takes full control — no human posting allowed</li>
              <li>You can adjust settings anytime from your dashboard</li>
            </ol>
            <Button variant="outline" className="w-full" disabled>
              <Twitter className="w-4 h-4" />
              Connect X Account (Available After Launch)
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
