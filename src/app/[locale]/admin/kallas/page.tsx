import KallasManager from '@/components/admin/KallasManager';
import type { Kalla } from '@/types/database';
import { createAdminClient } from '@/lib/supabase/admin';
import { SEED_KALLAS } from '@/lib/data/seed';

async function getAllKallas(): Promise<Kalla[]> {
  const client = createAdminClient();
  if (!client) return SEED_KALLAS;
  const { data } = await client
    .from('kallas')
    .select('*')
    .order('wedding_date', { ascending: true });
  return data ?? SEED_KALLAS;
}

export default async function AdminKallasPage() {
  const kallas = await getAllKallas();
  return <KallasManager initialKallas={kallas} />;
}
