import CatalogManager from '@/components/admin/CatalogManager';
import type { CatalogItem } from '@/types/database';
import { createAdminClient } from '@/lib/supabase/admin';
import { SEED_CATALOG_ITEMS } from '@/lib/data/seed';

async function getAllCatalogItems(): Promise<CatalogItem[]> {
  const client = createAdminClient();
  if (!client) return SEED_CATALOG_ITEMS;
  const { data } = await client
    .from('catalog_items')
    .select('*')
    .order('display_order', { ascending: true });
  return data ?? SEED_CATALOG_ITEMS;
}

export default async function AdminCatalogPage() {
  const items = await getAllCatalogItems();
  return <CatalogManager initialItems={items} />;
}
