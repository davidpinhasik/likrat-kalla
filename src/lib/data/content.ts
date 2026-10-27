import type { Locale } from '@/types/database';
import { withFallback } from './client';
import { SEED_CONTENT } from './seed';

/**
 * Returns admin-managed copy for a locale as a key → value map.
 * Keys with no DB row are simply absent; callers should fall back to the
 * next-intl message files for those.
 */
export async function getSiteContent(
  locale: Locale,
): Promise<Record<string, string>> {
  const rows = await withFallback<{ key: string; value: string }[]>(
    Object.entries(SEED_CONTENT[locale]).map(([key, value]) => ({
      key,
      value,
    })),
    (client) =>
      client.from('site_content').select('key, value').eq('locale', locale),
  );

  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** Returns a single content value, or `fallback` when not set. */
export async function getSiteContentValue(
  key: string,
  locale: Locale,
  fallback = '',
): Promise<string> {
  const content = await getSiteContent(locale);
  return content[key] ?? fallback;
}
