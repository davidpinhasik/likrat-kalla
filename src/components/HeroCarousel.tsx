'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { SiteMedia } from '@/types/database';

type HeroCarouselProps = {
  slides: SiteMedia[];
};

/**
 * Auto-advancing hero image carousel.
 * Falls back to a static gradient hero when no slides are provided.
 */
export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const t = useTranslations('home');
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  }, [slides.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  }, [slides.length]);

  // Auto-advance every 5 seconds when multiple slides exist
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative w-full h-full"
      aria-label={t('carouselAriaLabel')}
      aria-roledescription="carousel"
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          role="group"
          aria-roledescription="slide"
          aria-label={t('goToSlide', { n: i + 1 })}
          aria-hidden={i !== current}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.url}
            alt={slide.title_en ?? ''}
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-brand-navy/60" />
        </div>
      ))}

      {/* Navigation controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label={t('prevSlide')}
            className="absolute start-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" aria-hidden="true" />
          </button>
          <button
            onClick={next}
            aria-label={t('nextSlide')}
            className="absolute end-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white rtl:rotate-180" aria-hidden="true" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={t('goToSlide', { n: i + 1 })}
                aria-current={i === current}
                className={`rounded-full transition-all ${
                  i === current
                    ? 'w-5 h-2 bg-brand-gold'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
