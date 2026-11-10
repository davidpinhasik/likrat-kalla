import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';

/** Public origin of the site (no trailing slash). Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.helpjewishbrides.org'
).replace(/\/$/, '');

export const SITE_NAME = 'Likrat Kalla';

/**
 * Social share image (1200x630 recommended), e.g. '/og-image.jpg' once the file
 * exists in /public. Left null until then so we never point to a missing image.
 */
export const OG_IMAGE: string | null = null;

const OG_LOCALES = { en: 'en_US', he: 'he_IL' } as const;

type PageMetadataInput = {
  locale: string;
  /** Path after the locale, e.g. '' (home), '/about', '/donate'. */
  path: string;
  title: string;
  description: string;
};

/**
 * Title, description, canonical URL, English/Hebrew alternate links (hreflang)
 * and Open Graph data for one public page.
 */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
}: PageMetadataInput): Metadata {
  const loc = locale === 'he' ? 'he' : 'en';
  const other = loc === 'he' ? 'en' : 'he';
  const url = `/${loc}${path}`;

  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}${path}`]),
  );
  languages['x-default'] = `/${routing.defaultLocale}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALES[loc],
      alternateLocale: OG_LOCALES[other],
      type: 'website',
      ...(OG_IMAGE ? { images: [OG_IMAGE] } : {}),
    },
  };
}
