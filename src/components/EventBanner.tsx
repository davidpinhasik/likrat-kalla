'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ExternalLink, X } from 'lucide-react';
import { useState } from 'react';

type EventBannerProps = {
  /** ISO date strings from admin settings */
  fromDate?: string | null;
  toDate?: string | null;
  auctionUrl?: string;
};

export default function EventBanner({
  fromDate,
  toDate,
  auctionUrl = 'https://www.lkauction.com',
}: EventBannerProps) {
  const t = useTranslations('eventBanner');
  const locale = useLocale();
  const [dismissed, setDismissed] = useState(false);

  // Show when within the date range (or always when no dates configured in dev)
  const now = new Date();
  const start = fromDate ? new Date(fromDate) : null;
  const end = toDate ? new Date(toDate) : null;
  const withinRange =
    (!start || now >= start) && (!end || now <= end);

  if (!withinRange || dismissed) return null;

  return (
    <div
      className="bg-brand-gold text-white text-sm font-medium"
      role="banner"
      aria-label="Event announcement"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 justify-center">
          <span>{t('message')}</span>
          <Link
            href={auctionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-white/80 transition-colors"
          >
            {t('cta')}
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
