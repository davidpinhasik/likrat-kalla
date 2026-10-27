'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const targetLocale = locale === 'en' ? 'he' : 'en';
  const label = locale === 'en' ? 'עברית' : 'English';

  // Replace the locale prefix in the current path
  const handleSwitch = () => {
    // pathname starts with /en/... or /he/...
    const segments = pathname.split('/');
    segments[1] = targetLocale;
    const newPath = segments.join('/') || `/${targetLocale}`;
    router.push(newPath);
  };

  return (
    <button
      onClick={handleSwitch}
      className="flex items-center gap-1.5 text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors px-3 py-1.5 rounded-md border border-transparent hover:border-brand-gold/40"
      aria-label={`Switch to ${targetLocale === 'he' ? 'Hebrew' : 'English'}`}
    >
      <Globe className="w-4 h-4" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
