'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import EventBanner from './EventBanner';

type NavbarProps = {
  /** ISO date strings from admin settings — passed from a server component */
  auctionActive?: boolean;
  auctionFromDate?: string | null;
  auctionToDate?: string | null;
  auctionUrl?: string;
};

export default function Navbar({
  auctionActive = false,
  auctionFromDate = null,
  auctionToDate = null,
  auctionUrl = 'https://www.lkauction.com',
}: NavbarProps) {
  const t = useTranslations('nav');
  const tNavbar = useTranslations('navbar');
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { key: 'home', href: `/${locale}` },
    { key: 'about', href: `/${locale}/about` },
    { key: 'donate', href: `/${locale}/donate` },
    { key: 'contact', href: `/${locale}/contact` },
  ];

  return (
    <>
      {/* Event Banner (shown only when active per server-side date check) */}
      {auctionActive && (
        <EventBanner
          fromDate={auctionFromDate}
          toDate={auctionToDate}
          auctionUrl={auctionUrl}
        />
      )}

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold text-brand-navy">
                  לקראת כלה
                </span>
                <span className="text-[10px] text-brand-gold font-semibold tracking-wide uppercase">
                  {tNavbar('tagline')}
                </span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-navy hover:bg-gray-50 rounded-md transition-colors"
                >
                  {t(key as 'home' | 'about' | 'donate' | 'contact')}
                </Link>
              ))}
              {/* Auction link in nav when active */}
              {auctionActive && (
                <Link
                  href={auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-sm font-medium text-brand-gold hover:text-brand-gold-dark hover:bg-brand-gold/5 rounded-md transition-colors"
                >
                  {t('auction')}
                </Link>
              )}
            </div>

            {/* Right side: language switcher + donate CTA */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href={`/${locale}/donate`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-white text-sm font-semibold rounded-full hover:bg-brand-gold-dark transition-colors shadow-sm"
              >
                <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                {tNavbar('donateBtn')}
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-brand-navy hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {mobileOpen && (
            <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
              {navLinks.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-navy hover:bg-gray-50 rounded-md transition-colors"
                >
                  {t(key as 'home' | 'about' | 'donate' | 'contact')}
                </Link>
              ))}
              {auctionActive && (
                <Link
                  href={auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-brand-gold hover:bg-brand-gold/5 rounded-md transition-colors"
                >
                  {t('auction')}
                </Link>
              )}
              <div className="pt-3 pb-1 flex items-center gap-3 px-3">
                <LanguageSwitcher />
                <Link
                  href={`/${locale}/donate`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-gold text-white text-sm font-semibold rounded-full hover:bg-brand-gold-dark transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" aria-hidden="true" />
                  {tNavbar('donateBtn')}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
