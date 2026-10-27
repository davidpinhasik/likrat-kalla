'use client';

import { useState } from 'react';
import { X, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SiteMedia, MediaCategory } from '@/types/database';

type FilterKey = 'all' | MediaCategory;

type GalleryProps = {
  media: SiteMedia[];
  locale: string;
};

const FILTER_KEYS: FilterKey[] = [
  'all',
  'yearly_events',
  'parlor_meetings',
  'distribution_days',
  'special_videos',
];

const FILTER_LABEL_MAP: Record<string, string> = {
  all: 'filterAll',
  yearly_events: 'filterYearlyEvents',
  parlor_meetings: 'filterParlorMeetings',
  distribution_days: 'filterDistributionDays',
  special_videos: 'filterSpecialVideos',
};

/** Extract a YouTube embed URL from various YouTube link formats. */
function toYouTubeEmbed(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  );
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
}

export default function MediaGallery({ media, locale }: GalleryProps) {
  const t = useTranslations('about');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [modalItem, setModalItem] = useState<SiteMedia | null>(null);

  const filtered =
    activeFilter === 'all'
      ? media
      : media.filter((m) => m.category === activeFilter);

  const getTitle = (item: SiteMedia) =>
    (locale === 'he' ? item.title_he : item.title_en) ?? '';

  const embedUrl =
    modalItem?.media_type === 'video' && modalItem.url
      ? toYouTubeEmbed(modalItem.url)
      : null;

  return (
    <div>
      {/* Filter tabs */}
      <div
        className="flex flex-wrap gap-2 mb-8"
        role="tablist"
        aria-label="Gallery filter"
      >
        {FILTER_KEYS.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeFilter === key}
            onClick={() => setActiveFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === key
                ? 'bg-brand-gold text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t(FILTER_LABEL_MAP[key] as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">{t('noMedia')}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setModalItem(item)}
              aria-label={
                item.media_type === 'video' ? t('watchVideo') : t('viewImage')
              }
              className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              {item.media_type === 'image' ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.url}
                  alt={getTitle(item)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                /* Video thumbnail: show YouTube thumbnail when possible */
                <div className="w-full h-full bg-brand-navy/80 flex items-center justify-center">
                  {toYouTubeEmbed(item.url) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`https://img.youtube.com/vi/${item.url.match(/([A-Za-z0-9_-]{11})/)?.[1]}/hqdefault.jpg`}
                      alt={getTitle(item)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-navy flex items-center justify-center" />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-5 h-5 text-brand-navy ms-0.5" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              )}

              {/* Hover overlay with title */}
              {getTitle(item) && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                    {getTitle(item)}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={getTitle(modalItem) || t('playVideo')}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalItem(null);
          }}
        >
          <div className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden">
            <button
              onClick={() => setModalItem(null)}
              aria-label={t('closeModal')}
              className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" aria-hidden="true" />
            </button>

            {modalItem.media_type === 'video' && embedUrl ? (
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  title={getTitle(modalItem)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={modalItem.url}
                alt={getTitle(modalItem)}
                className="w-full max-h-[80vh] object-contain"
              />
            )}

            {getTitle(modalItem) && (
              <div className="p-4 text-white text-sm font-medium">
                {getTitle(modalItem)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
