"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAgentStore } from "@/lib/store";
import {
  Rocket,
  LayoutDashboard,
  Users,
  BarChart3,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/launch", label: "Launch Agent", icon: Rocket },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hive", label: "Agent Hive", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { currentStep } = useAgentStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  // Only show wallet button on launch page at final step (step 5)
  const showWalletButton = pathname === "/launch" && currentStep === 5;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <span className="text-lg font-bold gradient-text">AgentForge</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {showWalletButton && (
              <>
                {connected ? (
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:block text-xs font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                      {shortAddress}
                    </span>
                    <Button variant="outline" size="sm" onClick={disconnect}>
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setVisible(true)}>
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </Button>
                )}
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-card">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
