'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import type { Locale, PrayerName, PrayerReason } from '@/types/database';
import type { DonationRequest, DonorDetails } from '@/types/donation';
import { submitDonation } from '@/app/actions/donate';

export const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-colors';
export const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
export const errorClass = 'mt-1 text-xs text-red-500';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useFormatters() {
  const locale = useLocale();
  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  });
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  });
  return {
    formatNis: (amount: number) => currency.format(amount),
    formatDate: (iso: string) => date.format(new Date(iso)),
  };
}

// ---------------------------------------------------------------------------
// Donor details
// ---------------------------------------------------------------------------

export type DonorValues = { name: string; email: string; phone: string };
export const EMPTY_DONOR: DonorValues = { name: '', email: '', phone: '' };

export function validateDonor(
  values: DonorValues,
  t: (key: 'requiredField' | 'invalidEmail') => string,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = t('requiredField');
  if (!values.email.trim()) errors.email = t('requiredField');
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = t('invalidEmail');
  return errors;
}

type DonorFieldsProps = {
  idPrefix: string;
  values: DonorValues;
  errors: Record<string, string>;
  onChange: (values: DonorValues) => void;
};

export function DonorFields({
  idPrefix,
  values,
  errors,
  onChange,
}: DonorFieldsProps) {
  const t = useTranslations('donate');

  function field(
    name: keyof DonorValues,
    label: string,
    type: string,
    autoComplete: string,
    required: boolean,
  ) {
    const id = `${idPrefix}-${name}`;
    return (
      <div>
        <label htmlFor={id} className={labelClass}>
          {label}
          {required && <span className="text-red-500 ms-0.5">*</span>}
        </label>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={values[name]}
          onChange={(e) => onChange({ ...values, [name]: e.target.value })}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `${id}-error` : undefined}
          className={`${inputClass} ${errors[name] ? 'border-red-400' : ''}`}
        />
        {errors[name] && (
          <p id={`${id}-error`} className={errorClass} role="alert">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-base font-semibold text-brand-navy mb-3">
        {t('donorTitle')}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('name', t('donorName'), 'text', 'name', true)}
        {field('email', t('donorEmail'), 'email', 'email', true)}
      </div>
      {field('phone', t('donorPhone'), 'tel', 'tel', false)}
    </fieldset>
  );
}

export function toDonorDetails(values: DonorValues): DonorDetails {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || undefined,
  };
}

// ---------------------------------------------------------------------------
// Prayer names
// ---------------------------------------------------------------------------

export type PrayerEntry = { name: string; reason_id: string };
export const EMPTY_ENTRY: PrayerEntry = { name: '', reason_id: '' };

export function toPrayerNames(entries: PrayerEntry[], slots: number) {
  return entries
    .slice(0, slots)
    .filter((e) => e.name.trim())
    .map(
      (e): PrayerName => ({
        name: e.name.trim(),
        reason_id: e.reason_id || null,
      }),
    );
}

type PrayerNamesFieldsProps = {
  idPrefix: string;
  slots: number;
  /** When set, slots are grouped (e.g. 3 names per package). */
  groupSize?: number;
  groupLabel?: (groupNumber: number) => string;
  entries: PrayerEntry[];
  onChange: (entries: PrayerEntry[]) => void;
  reasons: PrayerReason[];
};

export function PrayerNamesFields({
  idPrefix,
  slots,
  groupSize,
  groupLabel,
  entries,
  onChange,
  reasons,
}: PrayerNamesFieldsProps) {
  const t = useTranslations('donate');
  const locale = useLocale() as Locale;

  function update(index: number, patch: Partial<PrayerEntry>) {
    const next = [...entries];
    while (next.length <= index) next.push({ ...EMPTY_ENTRY });
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <fieldset>
      <legend className="text-base font-semibold text-brand-navy">
        {t('prayerTitle')}
      </legend>
      <p className="text-sm text-gray-500 mt-1 mb-4">{t('prayerIntro')}</p>
      <div className="space-y-3">
        {Array.from({ length: slots }, (_, i) => {
          const entry = entries[i] ?? EMPTY_ENTRY;
          const showGroup = groupSize && i % groupSize === 0;
          return (
            <div key={i}>
              {showGroup && groupLabel && (
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-gold-dark mt-3 mb-2">
                  {groupLabel(i / groupSize + 1)}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`${idPrefix}-name-${i}`} className="sr-only">
                    {t('prayerNameLabel', { n: (i % (groupSize ?? slots)) + 1 })}
                  </label>
                  <input
                    id={`${idPrefix}-name-${i}`}
                    type="text"
                    maxLength={200}
                    value={entry.name}
                    onChange={(e) => update(i, { name: e.target.value })}
                    placeholder={t('prayerNamePlaceholder', {
                      n: (i % (groupSize ?? slots)) + 1,
                    })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${idPrefix}-reason-${i}`}
                    className="sr-only"
                  >
                    {t('prayerReasonLabel')}
                  </label>
                  <select
                    id={`${idPrefix}-reason-${i}`}
                    value={entry.reason_id}
                    onChange={(e) => update(i, { reason_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">{t('prayerReasonPlaceholder')}</option>
                    {reasons.map((r) => (
                      <option key={r.id} value={r.id}>
                        {locale === 'he' ? r.label_he : r.label_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

/**
 * Calls the `submitDonation` server action and, on success, sends the donor to
 * the Lemaan Achai payment page.
 */
export function useCheckout() {
  const t = useTranslations('donate');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);

  function checkout(request: DonationRequest) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitDonation(request);
        if (result.ok) {
          setRedirecting(true);
          window.location.assign(result.redirectUrl);
          return;
        }
        setError(
          result.error === 'invalid_donor'
            ? t('errorDonor')
            : result.error === 'save_failed'
              ? t('errorSave')
              : t('errorInvalid'),
        );
      } catch {
        setError(t('errorGeneric'));
      }
    });
  }

  return { checkout, busy: pending || redirecting, error };
}

type CheckoutButtonProps = {
  busy: boolean;
  error: string | null;
  disabled?: boolean;
  label?: string;
};

export function CheckoutButton({
  busy,
  error,
  disabled,
  label,
}: CheckoutButtonProps) {
  const t = useTranslations('donate');
  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={busy || disabled}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-brand-gold text-white font-semibold rounded-full hover:bg-brand-gold-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            {t('processing')}
          </>
        ) : (
          label ?? t('checkout')
        )}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 text-center">
        <Lock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        {t('redirectNote')}
      </p>
    </div>
  );
}
