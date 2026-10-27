'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Gift, Minus, Plus } from 'lucide-react';
import type { CatalogItem } from '@/types/database';
import {
  CheckoutButton,
  DonorFields,
  EMPTY_DONOR,
  toDonorDetails,
  useCheckout,
  useFormatters,
  validateDonor,
  type DonorValues,
} from './shared';

const MAX_ITEM_QUANTITY = 50;

type Props = {
  items: CatalogItem[];
};

export default function CatalogDonation({ items }: Props) {
  const t = useTranslations('donate');
  const locale = useLocale() as 'en' | 'he';
  const { formatNis } = useFormatters();
  const { checkout, busy, error } = useCheckout();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [donor, setDonor] = useState<DonorValues>(EMPTY_DONOR);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const lines = items
    .map((item) => ({ item, quantity: quantities[item.id] ?? 0 }))
    .filter((l) => l.quantity > 0);
  const total = lines.reduce((sum, l) => sum + l.quantity * l.item.price_nis, 0);

  function setQuantity(id: string, next: number) {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(MAX_ITEM_QUANTITY, Math.max(0, next)),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;
    const errs = validateDonor(donor, t);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    checkout({
      type: 'catalog_items',
      locale,
      donor: toDonorDetails(donor),
      items: lines.map((l) => ({ id: l.item.id, quantity: l.quantity })),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-brand-navy">
          {t('catalogTitle')}
        </h3>
        <p className="text-gray-600 mt-1">{t('catalogDesc')}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{t('catalogEmpty')}</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => {
            const title = locale === 'he' ? item.title_he : item.title_en;
            const description =
              locale === 'he' ? item.description_he : item.description_en;
            const quantity = quantities[item.id] ?? 0;
            return (
              <li
                key={item.id}
                className={`flex flex-col rounded-2xl border bg-white overflow-hidden ${
                  quantity > 0
                    ? 'border-brand-gold ring-1 ring-brand-gold/40'
                    : 'border-gray-200'
                }`}
              >
                <div className="aspect-[4/3] bg-brand-cream flex items-center justify-center">
                  {item.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image_url}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gift
                      className="w-12 h-12 text-brand-gold/60"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h4 className="font-semibold text-brand-navy">{title}</h4>
                  {description && (
                    <p className="text-sm text-gray-500 mt-1 flex-1">
                      {description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-brand-gold-dark">
                      {formatNis(item.price_nis)}
                    </span>
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, quantity - 1)}
                        disabled={quantity <= 0}
                        aria-label={`${t('decrease')}: ${title}`}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-brand-navy hover:border-brand-gold disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <span
                        className="w-6 text-center font-semibold text-brand-navy"
                        aria-live="polite"
                      >
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, quantity + 1)}
                        disabled={quantity >= MAX_ITEM_QUANTITY}
                        aria-label={`${t('increase')}: ${title}`}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-brand-navy hover:border-brand-gold disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Live cart */}
      <div className="rounded-xl bg-brand-cream border border-gray-200 p-5">
        <h4 className="font-semibold text-brand-navy mb-3">{t('cartTitle')}</h4>
        {lines.length === 0 ? (
          <p className="text-sm text-gray-500">{t('cartEmpty')}</p>
        ) : (
          <ul className="space-y-1.5 text-sm text-gray-700">
            {lines.map(({ item, quantity }) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {quantity} × {locale === 'he' ? item.title_he : item.title_en}
                </span>
                <span>{formatNis(quantity * item.price_nis)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between items-baseline border-t border-gray-200 mt-4 pt-3">
          <span className="text-sm text-gray-600">{t('total')}</span>
          <span className="text-2xl font-bold text-brand-navy">
            {formatNis(total)}
          </span>
        </div>
      </div>

      <DonorFields
        idPrefix="catalog"
        values={donor}
        errors={errors}
        onChange={setDonor}
      />

      <CheckoutButton busy={busy} error={error} disabled={lines.length === 0} />
    </form>
  );
}
