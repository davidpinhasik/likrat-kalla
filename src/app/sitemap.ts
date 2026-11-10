import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

/** Public pages (path after the locale). Admin and thank-you pages are left out. */
const PAGES = ['', '/about', '/donate', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
        ),
      },
    })),
  );
}
