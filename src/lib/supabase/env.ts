/**
 * Centralised, crash-free access to Supabase environment variables.
 *
 * The browser bundle can only see NEXT_PUBLIC_* variables (statically inlined by
 * Next.js, so they must be referenced literally). Server code also accepts the
 * un-prefixed SUPABASE_URL / SUPABASE_ANON_KEY names.
 */

const PLACEHOLDER_PATTERN = /^(your[-_]|<|changeme|placeholder|xxx)/i;

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || PLACEHOLDER_PATTERN.test(trimmed)) return null;
  return trimmed;
}

function isHttpUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSupabaseUrl(): string | null {
  const url =
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    clean(process.env.SUPABASE_URL);
  return isHttpUrl(url) ? url : null;
}

export function getSupabaseAnonKey(): string | null {
  return (
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    clean(process.env.SUPABASE_ANON_KEY) ??
    clean(process.env.SUPABASE_PUBLISHABLE_KEY)
  );
}

/** Server-only. Never import this value into client components. */
export function getSupabaseServiceRoleKey(): string | null {
  return (
    clean(process.env.SUPABASE_SERVICE_ROLE_KEY) ??
    clean(process.env.SUPABASE_SECRET_KEY)
  );
}

/** True when URL + anon key are configured with real values. */
export function isSupabaseConfigured(): boolean {
  return getSupabaseUrl() !== null && getSupabaseAnonKey() !== null;
}

/** True when URL + service role key are configured with real values. */
export function isSupabaseAdminConfigured(): boolean {
  return getSupabaseUrl() !== null && getSupabaseServiceRoleKey() !== null;
}
