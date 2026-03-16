-- ============================================
-- AgentForge — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- Agents table
-- ============================================
create table public.agents (
  id uuid default uuid_generate_v4() primary key,
  wallet_address text not null,
  name text not null,
  symbol text not null,
  mint_address text,
  tx_signature text,
  avatar_config jsonb not null default '{}',
  personality jsonb not null default '{}',
  skills jsonb[] not null default '{}',
  skills_md text,
  tokenomics jsonb not null default '{}',
  x_account jsonb,
  x_oauth_token text,
  x_oauth_refresh_token text,
  x_user_id text,
  status text not null default 'pending' check (status in ('active', 'paused', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for wallet lookups
create index idx_agents_wallet on public.agents (wallet_address);
create index idx_agents_status on public.agents (status);

-- ============================================
-- X Posts table (scheduled & posted tweets)
-- ============================================
create table public.x_posts (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid not null references public.agents(id) on delete cascade,
  content text not null,
  x_post_id text,
  post_type text not null default 'scheduled' check (post_type in ('scheduled', 'reply', 'hive_interaction')),
  status text not null default 'queued' check (status in ('queued', 'posted', 'failed')),
  scheduled_for timestamptz not null,
  posted_at timestamptz,
  error text,
  in_reply_to text,
  created_at timestamptz not null default now()
);

create index idx_x_posts_agent on public.x_posts (agent_id);
create index idx_x_posts_status on public.x_posts (status, scheduled_for);

-- ============================================
-- Agent Metrics (snapshots for dashboard)
-- ============================================
create table public.agent_metrics (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid not null references public.agents(id) on delete cascade,
  price_usd numeric,
  holders integer,
  total_burned text,
  total_revenue_sol numeric,
  x_followers integer,
  recorded_at timestamptz not null default now()
);

create index idx_metrics_agent on public.agent_metrics (agent_id, recorded_at desc);

-- ============================================
-- Row Level Security
-- ============================================
alter table public.agents enable row level security;
alter table public.x_posts enable row level security;
alter table public.agent_metrics enable row level security;

-- Agents: anyone can read, only service role can write
create policy "Public read agents" on public.agents for select using (true);
create policy "Service insert agents" on public.agents for insert with check (true);
create policy "Service update agents" on public.agents for update using (true);

-- X Posts: anyone can read, only service role can write
create policy "Public read x_posts" on public.x_posts for select using (true);
create policy "Service insert x_posts" on public.x_posts for insert with check (true);
create policy "Service update x_posts" on public.x_posts for update using (true);

-- Metrics: anyone can read
create policy "Public read metrics" on public.agent_metrics for select using (true);
create policy "Service insert metrics" on public.agent_metrics for insert with check (true);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger agents_updated_at
  before update on public.agents
  for each row execute function public.update_updated_at();
