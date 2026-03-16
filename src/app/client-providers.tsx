"use client";

import { type ReactNode } from "react";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </WalletProvider>
  );
}
