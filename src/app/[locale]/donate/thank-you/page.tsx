import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ThankYouPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'thankYou' });

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <CheckCircle2
          className="w-16 h-16 text-green-500 mx-auto mb-6"
          aria-hidden="true"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 mb-3">{t('message')}</p>
        <p className="text-gray-500 mb-10">{t('prayerNote')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-navy text-white font-semibold hover:bg-brand-navy-light transition-colors"
          >
            {t('backHome')}
          </Link>
          <Link
            href={`/${locale}/donate`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-brand-gold text-brand-gold-dark font-semibold hover:bg-brand-gold/10 transition-colors"
          >
            {t('donateAgain')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
