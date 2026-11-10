import type { Metadata } from 'next';
import { Inter, Heebo, Rubik } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  variable: '--font-rubik',
  display: 'swap',
});

// Fallback only: every public page sets its own title/description via
// generateMetadata (see src/lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Likrat Kalla – Helping Jewish Brides',
  description:
    'Likrat Kalla provides ~10 essential household gifts to needy brides in Israel. 100% volunteer-run under Lemaan Achai.',
};

/** schema.org description of the organisation, for search engines and AI tools. */
const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'Likrat Kalla',
  alternateName: 'לקראת כלה',
  url: SITE_URL,
  logo: `${SITE_URL}/logos/lk-logo.png`,
  description:
    'A volunteer-run project that gives needy Jewish brides in Israel about 10 essential household gifts.',
  areaServed: 'IL',
  parentOrganization: {
    '@type': 'Organization',
    name: 'Lemaan Achai',
    alternateName: 'למען אחי',
    url: 'https://www.lemaanachai.org',
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === 'he' ? 'rtl' : 'ltr';
  const fontClass = locale === 'he' ? heebo.variable : inter.variable;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${heebo.variable} ${rubik.variable}`}
    >
      <body className={`${fontClass} antialiased bg-white text-gray-900`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_JSON_LD).replace(/</g, '\\u003c'),
          }}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
