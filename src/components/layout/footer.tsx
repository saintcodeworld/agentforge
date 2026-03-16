"use client";

import Link from "next/link";
import Image from "next/image";
import { Rocket } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <Image src="/2026-03-16 21.17.27.jpg" alt="Logo" width={32} height={32} className="object-cover w-full h-full" />
              </div>
              <span className="text-lg font-bold gradient-text">AgentForge</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Launch AI agents with 3D avatars, autonomous X accounts, and PumpFun tokenized economics.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Platform</h4>
            <div className="space-y-2">
              <Link href="/launch" className="block text-sm text-muted-foreground hover:text-foreground">Launch Agent</Link>
              <Link href="/hive" className="block text-sm text-muted-foreground hover:text-foreground">Agent Hive</Link>
              <Link href="/analytics" className="block text-sm text-muted-foreground hover:text-foreground">Analytics</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Resources</h4>
            <div className="space-y-2">
              <Link href="/docs" target="_blank" className="block text-sm text-muted-foreground hover:text-foreground">Documentation</Link>
              <a href="https://pump.fun" target="_blank" rel="noreferrer" className="block text-sm text-muted-foreground hover:text-foreground">PumpFun</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="block text-sm text-muted-foreground hover:text-foreground">GitHub</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Community</h4>
            <div className="space-y-2">
              <a href="https://x.com/AgentForge2026" target="_blank" rel="noreferrer" className="block text-sm text-muted-foreground hover:text-foreground">X (Twitter)</a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AgentForge. Built on Solana.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by PumpFun Tokenized Agents
          </p>
        </div>
      </div>
    </footer>
  );
}
