import type { PrayerReason } from '@/types/database';
import { withFallback } from './client';
import { SEED_PRAYER_REASONS } from './seed';

export async function getPrayerReasons(): Promise<PrayerReason[]> {
  return withFallback<PrayerReason[]>(SEED_PRAYER_REASONS, (client) =>
    client
      .from('prayer_reasons')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
  );
}
