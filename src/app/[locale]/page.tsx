import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Heart, Gift, BookOpen, Users, Star, Handshake, Quote } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import HeroCarousel from '@/components/HeroCarousel';
import { getSiteMedia } from '@/lib/data/media';
import { getSiteContent } from '@/lib/data/content';
import type { Locale } from '@/types/database';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const loc = (locale === 'he' ? 'he' : 'en') as Locale;
  const t = await getTranslations({ locale, namespace: 'home' });

  // Fetch hero carousel slides and dynamic copy overrides
  const [carouselSlides, content] = await Promise.all([
    getSiteMedia('landing_carousel'),
    getSiteContent(loc),
  ]);

  const impactStats = [
    {
      icon: Users,
      value: content['home_impact_brides_value'] || '7,301+',
      label: t('impactBrides'),
    },
    {
      icon: Gift,
      value: content['home_impact_gifts_value'] || '~10',
      label: t('impactGifts'),
    },
    {
      icon: Star,
      value: content['home_impact_volunteer_value'] || '100%',
      label: t('impactVolunteer'),
    },
    {
      icon: Heart,
      value: content['home_impact_years_value'] || '22+',
      label: t('impactYears'),
    },
  ];

  const actionCards = [
    {
      icon: Heart,
      title: t('cardSponsorTitle'),
      desc: t('cardSponsorDesc'),
      href: `/${locale}/donate#sponsor`,
    },
    {
      icon: Handshake,
      title: t('cardPackageTitle'),
      desc: t('cardPackageDesc'),
      href: `/${locale}/donate#package`,
    },
    {
      icon: BookOpen,
      title: t('cardCatalogTitle'),
      desc: t('cardCatalogDesc'),
      href: `/${locale}/donate#catalog`,
    },
  ];

  return (
    <PublicLayout>
      {/* ── Hero Section ── */}
      <section className="relative bg-brand-navy text-white overflow-hidden min-h-[560px] sm:min-h-[640px] flex items-center">
        {/* Background: carousel when slides exist, else gradient */}
        {carouselSlides.length > 0 ? (
          <div className="absolute inset-0">
            <HeroCarousel slides={carouselSlides} />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy opacity-95" />
        )}

        {/* Overlay to ensure text readability when carousel is showing */}
        {carouselSlides.length > 0 && (
          <div className="absolute inset-0 bg-brand-navy/55 z-[1]" />
        )}

        {/* Content */}
        <div className="relative z-[2] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 rounded-full px-4 py-1.5 text-brand-gold text-sm font-medium mb-6">
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            <span>לקראת כלה · Likrat Kalla</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-3xl mx-auto">
            {content['home_hero_title'] || t('heroTitle')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {content['home_hero_subtitle'] || t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/donate`}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-gold text-white font-semibold rounded-full hover:bg-brand-gold-dark transition-colors shadow-lg text-base"
            >
              <Heart className="w-4 h-4" aria-hidden="true" />
              {t('heroCtaPrimary')}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center px-7 py-3.5 border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition-colors text-base"
            >
              {t('heroCtaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="bg-brand-cream py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-navy text-center mb-10">
            {t('impactTitle')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {impactStats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-7 text-center shadow-sm border border-gray-100"
              >
                <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-brand-gold" aria-hidden="true" />
                </div>
                <p className="text-3xl font-bold text-brand-navy mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Action Cards ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actionCards.map(({ icon: Icon, title, desc, href }) => (
              <div
                key={title}
                className="group bg-white border border-gray-200 rounded-2xl p-7 flex flex-col gap-4 hover:shadow-md hover:border-brand-gold/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-gold" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
                <Link
                  href={href}
                  className="mt-auto inline-flex items-center text-brand-gold font-semibold text-sm hover:underline"
                >
                  {locale === 'he' ? '← ' : ''}{title}{locale === 'he' ? '' : ' →'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial / Featured Quote ── */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-brand-navy mb-8">
            {t('featuredTitle')}
          </h2>
          <div className="relative bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100">
            <Quote
              className="absolute top-6 start-6 w-8 h-8 text-brand-gold/30"
              aria-hidden="true"
            />
            <blockquote className="text-gray-700 text-lg leading-relaxed italic">
              {t('featuredQuote')}
            </blockquote>
            <footer className="mt-4 text-sm text-gray-400 font-medium">
              {t('featuredCaption')}
            </footer>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
