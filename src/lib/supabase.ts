import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function createSupabaseClient(url: string, key: string): SupabaseClient {
  if (!url || !key || url.startsWith("your_") || key.startsWith("your_")) {
    // Return a lazy proxy that throws helpful errors at call time, not at import time
    return new Proxy({} as SupabaseClient, {
      get(_, prop) {
        if (prop === "from") {
          return () => {
            throw new Error(
              "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and keys in .env.local"
            );
          };
        }
        return undefined;
      },
    });
  }
  return createClient(url, key);
}

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service role key, bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey)
  : supabase;

export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          wallet_address: string;
          name: string;
          symbol: string;
          mint_address: string | null;
          tx_signature: string | null;
          avatar_config: Record<string, unknown>;
          personality: Record<string, unknown>;
          skills: Record<string, unknown>[];
          skills_md: string | null;
          tokenomics: Record<string, unknown>;
          x_account: Record<string, unknown> | null;
          x_oauth_token: string | null;
          x_oauth_refresh_token: string | null;
          x_user_id: string | null;
          status: "active" | "paused" | "pending";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agents"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
      };
      x_posts: {
        Row: {
          id: string;
          agent_id: string;
          content: string;
          x_post_id: string | null;
          post_type: "scheduled" | "reply" | "hive_interaction";
          status: "queued" | "posted" | "failed";
          scheduled_for: string;
          posted_at: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["x_posts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["x_posts"]["Insert"]>;
      };
      agent_metrics: {
        Row: {
          id: string;
          agent_id: string;
          price_usd: number | null;
          holders: number | null;
          total_burned: string | null;
          total_revenue_sol: number | null;
          x_followers: number | null;
          recorded_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agent_metrics"]["Row"], "id" | "recorded_at">;
        Update: Partial<Database["public"]["Tables"]["agent_metrics"]["Insert"]>;
      };
    };
  };
};
