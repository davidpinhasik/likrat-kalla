import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Heart, Users, Handshake, CheckCircle2 } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import MediaGallery from '@/components/MediaGallery';
import { getSiteMedia } from '@/lib/data/media';
import { getSiteContent } from '@/lib/data/content';
import type { Locale } from '@/types/database';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const loc = (locale === 'he' ? 'he' : 'en') as Locale;
  const t = await getTranslations({ locale, namespace: 'about' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  // Fetch all about gallery media and dynamic copy overrides
  const [galleryMedia, content] = await Promise.all([
    getSiteMedia('about_gallery'),
    getSiteContent(loc),
  ]);

  const pillars = [
    {
      icon: Heart,
      title: t('missionTitle'),
      text: content['about_mission_text'] || t('missionText'),
    },
    {
      icon: Users,
      title: t('historyTitle'),
      text: content['about_history_text'] || t('historyText'),
    },
    {
      icon: Handshake,
      title: t('partnershipTitle'),
      text: content['about_partnership_text'] || t('partnershipText'),
    },
  ];

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 rounded-full px-4 py-1.5 text-brand-gold text-sm font-medium mb-6">
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            <span>לקראת כלה · Likrat Kalla</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>

      {/* ── Mission / History / Partnership Cards ── */}
      <section className="bg-brand-cream py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-gold" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-navy mb-2">{title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 100% Volunteer Banner ── */}
      <section className="bg-brand-gold py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
            <h2 className="text-2xl font-bold">{t('volunteerTitle')}</h2>
          </div>
          <p className="text-white/90 text-base leading-relaxed max-w-2xl mx-auto">
            {content['about_volunteer_text'] || t('volunteerText')}
          </p>
          <Link
            href={`/${locale}/donate`}
            className="mt-6 inline-flex items-center gap-2 px-7 py-3 bg-white text-brand-gold font-semibold rounded-full hover:bg-white/90 transition-colors text-sm shadow"
          >
            <Heart className="w-4 h-4" aria-hidden="true" />
            {tNav('donate')}
          </Link>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-navy mb-2">
              {t('galleryTitle')}
            </h2>
            <p className="text-gray-500">{t('gallerySubtitle')}</p>
          </div>
          <MediaGallery media={galleryMedia} locale={locale} />
        </div>
      </section>
    </PublicLayout>
  );
}
