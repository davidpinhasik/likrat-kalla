'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ExternalLink,
  Gift,
  Heart,
  HeartHandshake,
  Package,
} from 'lucide-react';
import type { CatalogItem, Kalla, PrayerReason } from '@/types/database';
import PackageSponsor from './PackageSponsor';
import CatalogDonation from './CatalogDonation';
import KallaSponsor from './KallaSponsor';

type PathwayId = 'general' | 'package' | 'catalog' | 'kalla';

type Props = {
  /** Pre-built Lemaan Achai URL for the general donation CTA. */
  generalDonationUrl: string;
  packageCostNis: number;
  reasons: PrayerReason[];
  catalogItems: CatalogItem[];
  kallas: Kalla[];
};

export default function DonatePathways({
  generalDonationUrl,
  packageCostNis,
  reasons,
  catalogItems,
  kallas,
}: Props) {
  const t = useTranslations('donate');
  const [active, setActive] = useState<PathwayId>('general');

  const pathways: {
    id: PathwayId;
    icon: typeof Heart;
    title: string;
    desc: string;
  }[] = [
    {
      id: 'general',
      icon: Heart,
      title: t('generalTabTitle'),
      desc: t('generalTabDesc'),
    },
    {
      id: 'package',
      icon: Package,
      title: t('packageTabTitle'),
      desc: t('packageTabDesc'),
    },
    {
      id: 'catalog',
      icon: Gift,
      title: t('catalogTabTitle'),
      desc: t('catalogTabDesc'),
    },
    {
      id: 'kalla',
      icon: HeartHandshake,
      title: t('kallaTabTitle'),
      desc: t('kallaTabDesc'),
    },
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label={t('pathwaysLabel')}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {pathways.map(({ id, icon: Icon, title, desc }) => {
          const selected = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`pathway-tab-${id}`}
              aria-selected={selected}
              aria-controls={`pathway-panel-${id}`}
              onClick={() => setActive(id)}
              className={`text-start rounded-2xl border p-5 transition-colors ${
                selected
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-brand-navy border-gray-200 hover:border-brand-gold'
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-3 ${selected ? 'text-brand-gold' : 'text-brand-gold-dark'}`}
                aria-hidden="true"
              />
              <span className="block font-semibold">{title}</span>
              <span
                className={`block text-sm mt-1 ${selected ? 'text-gray-300' : 'text-gray-500'}`}
              >
                {desc}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`pathway-panel-${active}`}
        aria-labelledby={`pathway-tab-${active}`}
        className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
      >
        {active === 'general' && (
          <div className="text-center max-w-xl mx-auto py-4">
            <Heart
              className="w-10 h-10 text-brand-gold mx-auto mb-4"
              aria-hidden="true"
            />
            <h3 className="text-xl font-bold text-brand-navy">
              {t('generalTitle')}
            </h3>
            <p className="text-gray-600 mt-2">{t('generalDesc')}</p>
            <a
              href={generalDonationUrl}
              className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-brand-gold text-white font-semibold rounded-full hover:bg-brand-gold-dark transition-colors"
            >
              {t('generalCta')}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
            <p className="text-xs text-gray-400 mt-3">{t('redirectNote')}</p>
          </div>
        )}
        {active === 'package' && (
          <PackageSponsor packageCostNis={packageCostNis} reasons={reasons} />
        )}
        {active === 'catalog' && <CatalogDonation items={catalogItems} />}
        {active === 'kalla' && (
          <KallaSponsor
            kallas={kallas}
            reasons={reasons}
            defaultAmountNis={packageCostNis}
          />
        )}
      </div>
    </div>
  );
}
