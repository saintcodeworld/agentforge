import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentForge — AI Agent Launchpad with Custom Avatars & PumpFun Tokenized Economics",
  description:
    "Launch AI agents with custom 2D avatars, autonomous X accounts, and PumpFun tokenized buyback & burn economics. Design, configure, and deploy in under 60 seconds.",
  keywords: ["AI agents", "PumpFun", "Solana", "tokenized agents", "2D avatars", "buyback burn", "agent launchpad"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
