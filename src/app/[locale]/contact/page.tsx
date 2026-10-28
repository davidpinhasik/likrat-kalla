import { getTranslations } from 'next-intl/server';
import { Phone, Clock, Mail, Heart } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import ContactForm from '@/components/ContactForm';
import { getSiteContent } from '@/lib/data/content';
import type { Locale } from '@/types/database';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const loc = (locale === 'he' ? 'he' : 'en') as Locale;
  const [t, content] = await Promise.all([
    getTranslations({ locale, namespace: 'contact' }),
    getSiteContent(loc),
  ]);

  const ivrSteps = [
    {
      ext: '1',
      title: t('ivrExt1Title'),
      desc: t('ivrExt1Desc'),
      highlight: false,
    },
    {
      ext: '2/3',
      title: t('ivrExt2Title'),
      desc: t('ivrExt2Desc'),
      highlight: true,
    },
  ];

  return (
    <PublicLayout>
      {/* ── Hero ── */}
      <section className="bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 rounded-full px-4 py-1.5 text-brand-gold text-sm font-medium mb-6">
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>צרו קשר · Contact Us</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{t('heroSubtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ── LEFT: Recipient (Needy Brides) Guide ── */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              {t('recipientTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">{t('recipientIntro')}</p>
          </div>

          {/* IVR Card */}
          <div className="bg-brand-cream rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header: Call number */}
            <div className="bg-brand-navy text-white p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-gray-300 font-medium">{t('ivrStep1Title')}</p>
                <a
                  href="tel:+97225328888"
                  className="text-xl font-bold text-brand-gold hover:text-brand-gold/80 transition-colors"
                >
                  {t('ivrStep1Desc')}
                </a>
              </div>
            </div>

            {/* IVR Extension Steps */}
            <div className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {t('ivrTitle')}
              </h3>
              {ivrSteps.map((step) => (
                <div
                  key={step.ext}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    step.highlight
                      ? 'bg-brand-gold/5 border-brand-gold/30'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      step.highlight
                        ? 'bg-brand-gold text-white'
                        : 'bg-brand-navy text-white'
                    }`}
                    aria-hidden="true"
                  >
                    {step.ext}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">{step.title}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Call Reception Hours */}
            <div className="border-t border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-brand-gold" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-gray-700">
                  {t('ivrHoursTitle')}
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" aria-hidden="true" />
                  {t('ivrHoursSummer')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" aria-hidden="true" />
                  {t('ivrHoursWinter')}
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-400 italic">{content['contact_ivr_note'] || t('ivrNote')}</p>
            </div>
          </div>

          {/* ── Donor Contact Details ── */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">
              {t('donorTitle')}
            </h2>
            <p className="text-gray-600 mb-5">{t('donorIntro')}</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-brand-gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{t('donorPhone')}</p>
                  <a
                    href="tel:+97225328888"
                    className="font-semibold text-brand-navy hover:text-brand-gold transition-colors"
                  >
                    +972-2-532-8888
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-lg bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-brand-gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{t('donorEmail')}</p>
                  <a
                    href="mailto:info@helpjewishbrides.org"
                    className="font-semibold text-brand-navy hover:text-brand-gold transition-colors"
                  >
                    info@helpjewishbrides.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Inquiry Form ── */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-brand-gold" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-brand-navy">
                {t('donorFormTitle')}
              </h2>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
