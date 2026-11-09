'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ExternalLink, X } from 'lucide-react';
import { useState } from 'react';

type EventBannerProps = {
  auctionUrl?: string;
};

/** Rendered by Navbar only while the auction is live (date check lives there). */
export default function EventBanner({
  auctionUrl = 'https://www.lkauction.com',
}: EventBannerProps) {
  const t = useTranslations('eventBanner');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

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
