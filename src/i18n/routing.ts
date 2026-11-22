import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'he'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Language links (hreflang) are written into each page's HTML by
  // buildPageMetadata() in src/lib/seo.ts. Without this, next-intl also sends
  // a conflicting HTTP Link header that names "/" as the default page.
  alternateLinks: false,
});
