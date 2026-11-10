import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeartHandshake } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import DonatePathways from '@/components/donate/DonatePathways';
import {
  getAvailableKallas,
  getCatalogItems,
  getPrayerReasons,
  getSiteSettings,
} from '@/lib/data';
import { buildLemaanAchaiUrl } from '@/lib/lemaan-achai';
import { buildPageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  return buildPageMetadata({
    locale,
    path: '/donate',
    title: t('donateTitle'),
    description: t('donateDescription'),
  });
}

export default async function DonatePage({ params }: Props) {
  const { locale } = await params;
  const lang = locale === 'he' ? 'he' : 'en';
  const t = await getTranslations({ locale, namespace: 'donate' });

  const [settings, reasons, catalogItems, kallas] = await Promise.all([
    getSiteSettings(),
    getPrayerReasons(),
    getCatalogItems(),
    getAvailableKallas(),
  ]);

  const generalDonationUrl = buildLemaanAchaiUrl({
    baseUrl: settings.lemaan_achai_donation_url,
    lang,
  });

  return (
    <PublicLayout>
      <section className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 rounded-full px-4 py-1.5 text-brand-gold text-sm font-medium mb-6">
            <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DonatePathways
          generalDonationUrl={generalDonationUrl}
          packageCostNis={settings.package_cost_nis}
          reasons={reasons}
          catalogItems={catalogItems}
          kallas={kallas}
        />
      </div>
    </PublicLayout>
  );
}
