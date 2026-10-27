import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env';

/**
 * Cookie-less anon client for public (RLS-protected) reads and inserts.
 * Unlike the SSR client it does not call cookies(), so pages that only read
 * public data can still be statically rendered.
 * Returns null when Supabase is not configured.
 */
export function getPublicClient(): SupabaseClient<Database> | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;

  return createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Runs `query` against Supabase and returns `fallback` if Supabase is not
 * configured, the query returns an error, or anything throws. Never throws.
 */
export async function withFallback<T>(
  fallback: T,
  query: (client: SupabaseClient<Database>) => PromiseLike<{
    data: T | null;
    error: { message: string } | null;
  }>,
): Promise<T> {
  const client = getPublicClient();
  if (!client) return fallback;

  try {
    const { data, error } = await query(client);
    if (error || data === null) {
      if (error) console.warn(`[data] Supabase query failed: ${error.message}`);
      return fallback;
    }
    return data;
  } catch (err) {
    console.warn('[data] Supabase query threw, using fallback:', err);
    return fallback;
  }
}
