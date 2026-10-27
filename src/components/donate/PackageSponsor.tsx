'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import type { PrayerReason } from '@/types/database';
import {
  CheckoutButton,
  DonorFields,
  EMPTY_DONOR,
  PrayerNamesFields,
  toDonorDetails,
  toPrayerNames,
  useCheckout,
  useFormatters,
  validateDonor,
  type DonorValues,
  type PrayerEntry,
} from './shared';

const MAX_PACKAGES = 20;
const NAMES_PER_PACKAGE = 3;

type Props = {
  packageCostNis: number;
  reasons: PrayerReason[];
};

export default function PackageSponsor({ packageCostNis, reasons }: Props) {
  const t = useTranslations('donate');
  const locale = useLocale() as 'en' | 'he';
  const { formatNis } = useFormatters();
  const { checkout, busy, error } = useCheckout();

  const [quantity, setQuantity] = useState(1);
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [donor, setDonor] = useState<DonorValues>(EMPTY_DONOR);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateDonor(donor, t);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    checkout({
      type: 'package',
      locale,
      donor: toDonorDetails(donor),
      quantity,
      names: toPrayerNames(entries, quantity * NAMES_PER_PACKAGE),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-brand-navy">
          {t('packageTitle')}
        </h3>
        <p className="text-gray-600 mt-1">
          {t('packageDesc', { amount: formatNis(packageCostNis) })}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-brand-cream border border-gray-200 p-5">
        <div>
          <p className="text-sm font-medium text-gray-700">
            {t('packageQuantity')}
          </p>
          <div className="mt-2 inline-flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label={t('decrease')}
              className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center text-brand-navy hover:border-brand-gold disabled:opacity-40"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span
              className="w-8 text-center text-lg font-semibold text-brand-navy"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(MAX_PACKAGES, q + 1))}
              disabled={quantity >= MAX_PACKAGES}
              aria-label={t('increase')}
              className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center text-brand-navy hover:border-brand-gold disabled:opacity-40"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="text-end">
          <p className="text-sm text-gray-500">{t('total')}</p>
          <p className="text-2xl font-bold text-brand-navy">
            {formatNis(quantity * packageCostNis)}
          </p>
        </div>
      </div>

      <PrayerNamesFields
        idPrefix="package"
        slots={quantity * NAMES_PER_PACKAGE}
        groupSize={NAMES_PER_PACKAGE}
        groupLabel={(n) => t('packageGroup', { n })}
        entries={entries}
        onChange={setEntries}
        reasons={reasons}
      />

      <DonorFields
        idPrefix="package"
        values={donor}
        errors={errors}
        onChange={setDonor}
      />

      <CheckoutButton busy={busy} error={error} />
    </form>
  );
}
