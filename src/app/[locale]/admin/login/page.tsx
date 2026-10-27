'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { adminLogin } from '@/app/actions/admin';

export default function AdminLoginPage() {
  const t = useTranslations('admin');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await adminLogin({ email, password });
      if (result.ok) {
        router.push(`/${locale}/admin`);
      } else {
        setError(
          result.message ??
          (result.reason === 'invalid_credentials'
            ? t('loginErrorCredentials')
            : t('loginErrorGeneric')),
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-navy rounded-full mb-4">
            <svg
              className="w-7 h-7 text-brand-gold"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {t('loginTitle')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('loginEmail')}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="admin@helpjewishbrides.org"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t('loginPassword')}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-lg hover:bg-brand-navy-light transition-colors disabled:opacity-60"
          >
            {isPending ? t('loginLoading') : t('loginBtn')}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t('loginFootnote')}
        </p>
      </div>
    </div>
  );
}
