import type { CatalogCategory, CatalogItem } from '@/types/database';
import { withFallback } from './client';
import { SEED_CATALOG_ITEMS } from './seed';

export async function getCatalogItems(
  category?: CatalogCategory,
): Promise<CatalogItem[]> {
  const fallback = category
    ? SEED_CATALOG_ITEMS.filter((i) => i.category === category)
    : SEED_CATALOG_ITEMS;

  return withFallback<CatalogItem[]>(fallback, (client) => {
    let query = client
      .from('catalog_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (category) query = query.eq('category', category);
    return query;
  });
}
