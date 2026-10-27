import MediaManager from '@/components/admin/MediaManager';
import type { SiteMedia } from '@/types/database';
import { createAdminClient } from '@/lib/supabase/admin';
import { SEED_MEDIA } from '@/lib/data/seed';

async function getAllMedia(): Promise<SiteMedia[]> {
  const client = createAdminClient();
  if (!client) return SEED_MEDIA;
  const { data } = await client
    .from('site_media')
    .select('*')
    .order('display_order', { ascending: true });
  return data ?? SEED_MEDIA;
}

export default async function AdminMediaPage() {
  const items = await getAllMedia();
  return <MediaManager initialItems={items} />;
}
