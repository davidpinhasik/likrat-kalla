import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">
                  {t('orgName')}
                </p>
                <p className="text-brand-gold text-xs font-semibold tracking-wide uppercase">
                  {t('tagline')}
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('missionStatement')}
            </p>
          </div>

          {/* Parent org column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              {t('parentOrg')}
            </h3>
            <Link
              href="https://www.lemaanachai.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-brand-gold-light hover:text-white transition-colors font-semibold"
            >
              {t('lemaan')}
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <p className="text-gray-400 text-xs">
              Providing trusted charitable services to the Beit Shemesh
              community since 1998.
            </p>
          </div>

          {/* Contact column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              {t('phone')}
            </h3>
            <div className="flex items-start gap-2 text-gray-300">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-gold" aria-hidden="true" />
              <div>
                <p className="font-semibold text-white">{t('phoneNumber')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('ivr')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>{t('copyright', { year })}</p>
          <Link
            href={`/${locale}/admin`}
            className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
          >
            {t('adminLogin')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
