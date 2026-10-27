import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from './env';

/**
 * Service-role Supabase client. BYPASSES Row Level Security.
 * Server-only: use exclusively in Route Handlers / Server Actions after
 * verifying the caller is authorised. Returns null when not configured.
 */
export function createAdminClient(): SupabaseClient<Database> | null {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!url || !serviceRoleKey) return null;

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
