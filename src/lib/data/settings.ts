import type { SiteSettingValues } from '@/types/database';
import { withFallback } from './client';
import { SEED_SETTINGS } from './seed';

/**
 * Returns all known site settings. Values from the database override the
 * seed defaults key-by-key, so a missing row never produces undefined.
 */
export async function getSiteSettings(): Promise<SiteSettingValues> {
  const rows = await withFallback<{ key: string; value: unknown }[]>(
    [],
    (client) => client.from('site_settings').select('key, value'),
  );

  const settings: SiteSettingValues = { ...SEED_SETTINGS };
  const overrides = settings as unknown as Record<string, unknown>;
  for (const { key, value } of rows) {
    if (key in SEED_SETTINGS && value !== null && value !== undefined) {
      overrides[key] = value;
    }
  }
  return settings;
}

export async function getSiteSetting<K extends keyof SiteSettingValues>(
  key: K,
): Promise<SiteSettingValues[K]> {
  return (await getSiteSettings())[key];
}

/** True when the Chinese auction banner is enabled and today is within its date range. */
export async function isAuctionBannerActive(now = new Date()): Promise<boolean> {
  const { enabled, start_date, end_date } = await getSiteSetting(
    'chinese_auction',
  );
  if (!enabled) return false;
  const start = new Date(start_date);
  const end = new Date(end_date);
  end.setUTCHours(23, 59, 59, 999);
  return now >= start && now <= end;
}
