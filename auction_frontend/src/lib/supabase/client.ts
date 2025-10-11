"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Allow augmenting window to store a singleton client in the browser safely.
 */
declare global {
  interface Window {
    __supabaseClient?: SupabaseClient;
  }
}

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient
 * Creates or returns a singleton Supabase client for browser usage.
 *
 * Notes:
 * - Only uses public env vars (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY).
 * - Safe for client-side usage.
 */
export function getSupabaseClient(): SupabaseClient {
  // Singleton on window to prevent multiple websocket connections on HMR
  const w: Window | undefined = typeof window !== "undefined" ? window : undefined;

  if (w?.__supabaseClient) return w.__supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Do not throw at import time to keep module tree-shakeable; throw when used
    throw new Error(
      "Supabase client missing configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY are set."
    );
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  if (w) w.__supabaseClient = client;
  return client;
}

export type SupabaseClientType = SupabaseClient;
