import type {
  MediaCategory,
  MediaSection,
  SiteMedia,
} from '@/types/database';
import { withFallback } from './client';
import { SEED_MEDIA } from './seed';

export async function getSiteMedia(
  section: MediaSection,
  category?: MediaCategory,
): Promise<SiteMedia[]> {
  const fallback = SEED_MEDIA.filter(
    (m) => m.section === section && (!category || m.category === category),
  );

  return withFallback<SiteMedia[]>(fallback, (client) => {
    let query = client
      .from('site_media')
      .select('*')
      .eq('section', section)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (category) query = query.eq('category', category);
    return query;
  });
}
