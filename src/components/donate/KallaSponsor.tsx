'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarHeart } from 'lucide-react';
import type { Kalla, PrayerReason } from '@/types/database';
import {
  CheckoutButton,
  DonorFields,
  EMPTY_DONOR,
  PrayerNamesFields,
  inputClass,
  labelClass,
  toDonorDetails,
  toPrayerNames,
  useCheckout,
  useFormatters,
  validateDonor,
  type DonorValues,
  type PrayerEntry,
} from './shared';

const NAMES_PER_KALLA = 3;

type Mode = 'by_date' | 'by_story';

type Props = {
  kallas: Kalla[];
  reasons: PrayerReason[];
  defaultAmountNis: number;
};

export default function KallaSponsor({
  kallas,
  reasons,
  defaultAmountNis,
}: Props) {
  const t = useTranslations('donate');
  const locale = useLocale() as 'en' | 'he';
  const { formatNis, formatDate } = useFormatters();
  const { checkout, busy, error } = useCheckout();

  const [mode, setMode] = useState<Mode>('by_date');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(defaultAmountNis);
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [donor, setDonor] = useState<DonorValues>(EMPTY_DONOR);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectError, setSelectError] = useState(false);

  const visible = kallas.filter(
    (k) =>
      mode === 'by_story' ||
      ((!fromDate || k.wedding_date >= fromDate) &&
        (!toDate || k.wedding_date <= toDate)),
  );
  const selected = kallas.find((k) => k.id === selectedId) ?? null;

  function selectKalla(kalla: Kalla) {
    setSelectedId(kalla.id);
    setSelectError(false);
    setAmount(kalla.target_amount_nis || defaultAmountNis);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      setSelectError(true);
      return;
    }
    const errs = validateDonor(donor, t);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    checkout({
      type: 'kalla',
      locale,
      donor: toDonorDetails(donor),
      kallaId: selected.id,
      mode,
      amount,
      names: toPrayerNames(entries, NAMES_PER_KALLA),
    });
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active
        ? 'bg-brand-navy text-white border-brand-navy'
        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-gold'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-brand-navy">{t('kallaTitle')}</h3>
        <p className="text-gray-600 mt-1">{t('kallaDesc')}</p>
      </div>

      {/* Browse mode */}
      <div className="space-y-4">
        <div
          role="group"
          aria-label={t('kallaBrowseBy')}
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            aria-pressed={mode === 'by_date'}
            onClick={() => setMode('by_date')}
            className={tabClass(mode === 'by_date')}
          >
            {t('kallaByDate')}
          </button>
          <button
            type="button"
            aria-pressed={mode === 'by_story'}
            onClick={() => setMode('by_story')}
            className={tabClass(mode === 'by_story')}
          >
            {t('kallaByStory')}
          </button>
        </div>

        {mode === 'by_date' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label htmlFor="kalla-from" className={labelClass}>
                {t('kallaFromDate')}
              </label>
              <input
                id="kalla-from"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(e) => setFromDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="kalla-to" className={labelClass}>
                {t('kallaToDate')}
              </label>
              <input
                id="kalla-to"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>

      {/* Kalla list */}
      {visible.length === 0 ? (
        <p className="text-sm text-gray-500">{t('kallaEmpty')}</p>
      ) : (
        <ul
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          role="radiogroup"
          aria-label={t('kallaSelect')}
        >
          {visible.map((kalla) => {
            const isSelected = kalla.id === selectedId;
            return (
              <li key={kalla.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => selectKalla(kalla)}
                  className={`w-full h-full text-start rounded-2xl border p-5 bg-white transition-colors ${
                    isSelected
                      ? 'border-brand-gold ring-2 ring-brand-gold/40'
                      : 'border-gray-200 hover:border-brand-gold'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-brand-gold-dark">
                    <CalendarHeart className="w-4 h-4" aria-hidden="true" />
                    {t('kallaWeddingDate', {
                      date: formatDate(kalla.wedding_date),
                    })}
                  </span>
                  <span className="block mt-2 text-sm text-gray-700 leading-relaxed">
                    {locale === 'he' ? kalla.story_he : kalla.story_en}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {selectError && (
        <p className="text-sm text-red-500" role="alert">
          {t('kallaSelectRequired')}
        </p>
      )}

      {/* Amount */}
      <div className="max-w-xs">
        <label htmlFor="kalla-amount" className={labelClass}>
          {t('kallaAmount')}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {[defaultAmountNis, defaultAmountNis * 2].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              aria-pressed={amount === preset}
              className={tabClass(amount === preset)}
            >
              {formatNis(preset)}
            </button>
          ))}
        </div>
        <input
          id="kalla-amount"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={amount || ''}
          onChange={(e) => setAmount(Math.floor(Number(e.target.value)) || 0)}
          className={inputClass}
        />
      </div>

      <PrayerNamesFields
        idPrefix="kalla"
        slots={NAMES_PER_KALLA}
        entries={entries}
        onChange={setEntries}
        reasons={reasons}
      />

      <DonorFields
        idPrefix="kalla"
        values={donor}
        errors={errors}
        onChange={setDonor}
      />

      <div className="flex justify-between items-baseline rounded-xl bg-brand-cream border border-gray-200 p-5">
        <span className="text-sm text-gray-600">{t('total')}</span>
        <span className="text-2xl font-bold text-brand-navy">
          {formatNis(amount)}
        </span>
      </div>

      <CheckoutButton busy={busy} error={error} disabled={amount < 1} />
    </form>
  );
}
