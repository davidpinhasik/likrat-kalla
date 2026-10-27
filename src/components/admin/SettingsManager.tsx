'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { updateSiteSettings } from '@/app/actions/admin';
import type { SiteSettingValues } from '@/types/database';

type Props = {
  initialSettings: SiteSettingValues;
};

export default function SettingsManager({ initialSettings }: Props) {
  const t = useTranslations('admin');
  const [settings, setSettings] = useState<SiteSettingValues>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [dirty, setDirty] = useState(false);

  function update<K extends keyof SiteSettingValues>(key: K, value: SiteSettingValues[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setFeedback(null);
  }

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateSiteSettings(settings);
      if (result.ok) {
        setDirty(false);
        setFeedback({ type: 'success', msg: t('settingsSaved') });
      } else {
        setFeedback({
          type: 'error',
          msg: (!result.ok && result.message) || t('settingsError'),
        });
      }
    });
  }

  const auction = settings.chinese_auction;
  const adminEmails = settings.admin_emails.join(', ');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{t('settingsTitle')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('settingsSubtitle')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || !dirty}
          className="text-sm bg-brand-gold text-brand-navy font-semibold px-5 py-2 rounded-lg hover:bg-brand-gold-hover transition-colors disabled:opacity-50"
        >
          {isPending ? t('saving') : t('saveAll')}
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* Package Cost */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">{t('settingsPackageSection')}</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('settingsPackageCost')} (NIS) *
            </label>
            <input
              type="number"
              min={1}
              value={settings.package_cost_nis}
              onChange={(e) => update('package_cost_nis', parseFloat(e.target.value) || 500)}
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <p className="text-xs text-gray-400 mt-1">{t('settingsPackageCostHint')}</p>
          </div>
        </div>

        {/* Admin Emails */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">{t('settingsEmailSection')}</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('settingsAdminEmails')}
            </label>
            <textarea
              rows={2}
              value={adminEmails}
              onChange={(e) =>
                update(
                  'admin_emails',
                  e.target.value
                    .split(',')
                    .map((v) => v.trim())
                    .filter(Boolean),
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
              placeholder="admin@example.com, other@example.com"
            />
            <p className="text-xs text-gray-400 mt-1">{t('settingsAdminEmailsHint')}</p>
          </div>
        </div>

        {/* Lemaan Achai URL */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">{t('settingsPaymentSection')}</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('settingsLemaanUrl')}
            </label>
            <input
              type="url"
              value={settings.lemaan_achai_donation_url}
              onChange={(e) => update('lemaan_achai_donation_url', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="https://www.lemaanachai.org/en/project/likrat-kalla"
            />
            <p className="text-xs text-gray-400 mt-1">{t('settingsLemaanUrlHint')}</p>
          </div>
        </div>

        {/* Chinese Auction */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">{t('settingsAuctionSection')}</h2>

          <label className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() =>
                update('chinese_auction', { ...auction, enabled: !auction.enabled })
              }
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                auction.enabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                  auction.enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {auction.enabled ? t('settingsAuctionEnabled') : t('settingsAuctionDisabled')}
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('settingsAuctionStart')}
              </label>
              <input
                type="date"
                value={auction.start_date}
                onChange={(e) =>
                  update('chinese_auction', { ...auction, start_date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {t('settingsAuctionEnd')}
              </label>
              <input
                type="date"
                value={auction.end_date}
                onChange={(e) =>
                  update('chinese_auction', { ...auction, end_date: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {t('settingsAuctionUrl')}
            </label>
            <input
              type="url"
              value={auction.url}
              onChange={(e) =>
                update('chinese_auction', { ...auction, url: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="https://www.lkauction.com"
            />
            <p className="text-xs text-gray-400 mt-1">{t('settingsAuctionUrlHint')}</p>
          </div>
        </div>

        {/* Save button (bottom) */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            disabled={isPending || !dirty}
            className="text-sm bg-brand-gold text-brand-navy font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-gold-hover transition-colors disabled:opacity-50"
          >
            {isPending ? t('saving') : t('saveAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
