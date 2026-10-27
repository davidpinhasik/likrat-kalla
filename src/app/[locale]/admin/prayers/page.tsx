import PrayersManager from '@/components/admin/PrayersManager';
import type { PrayerSubmission, PrayerReason } from '@/types/database';
import { createAdminClient } from '@/lib/supabase/admin';
import { SEED_PRAYER_REASONS } from '@/lib/data/seed';

async function getAllSubmissions(): Promise<PrayerSubmission[]> {
  const client = createAdminClient();
  if (!client) return [];
  const { data } = await client
    .from('prayer_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

async function getAllReasons(): Promise<PrayerReason[]> {
  const client = createAdminClient();
  if (!client) return SEED_PRAYER_REASONS;
  const { data } = await client
    .from('prayer_reasons')
    .select('*')
    .order('display_order', { ascending: true });
  return data ?? SEED_PRAYER_REASONS;
}

export default async function AdminPrayersPage() {
  const [submissions, reasons] = await Promise.all([
    getAllSubmissions(),
    getAllReasons(),
  ]);
  return <PrayersManager initialSubmissions={submissions} initialReasons={reasons} />;
}
