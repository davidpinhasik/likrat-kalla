import type { Metadata } from 'next';
import { Inter, Heebo, Rubik } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
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

export const metadata: Metadata = {
  title: 'Likrat Kalla – Helping Jewish Brides',
  description:
    'Likrat Kalla provides ~10 essential household gifts to needy brides in Israel. 100% volunteer-run under Lemaan Achai.',
  openGraph: {
    title: 'Likrat Kalla – Helping Jewish Brides',
    description:
      'Donate to support Jewish brides in Israel. Sponsor a bride, donate a gift package, or browse our catalog.',
    siteName: 'Likrat Kalla',
    locale: 'en_US',
    type: 'website',
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
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
