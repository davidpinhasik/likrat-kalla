import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Browser Supabase client (anon key, subject to RLS).
 * Returns null when Supabase env vars are not configured, so callers can
 * degrade gracefully instead of crashing.
 *
 * NEXT_PUBLIC_* variables must be referenced literally so Next.js can inline them.
 */
export function createClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !anonKey) return null;

  try {
    new URL(url);
  } catch {
    return null;
  }

  return createBrowserClient<Database>(url, anonKey);
}
