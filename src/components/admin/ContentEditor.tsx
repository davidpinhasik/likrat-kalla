'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { upsertSiteContent, deleteSiteContent } from '@/app/actions/admin';

type Props = {
  initialEn: Record<string, string>;
  initialHe: Record<string, string>;
  locale: string;
};

const CONTENT_KEYS = [
  { key: 'home_hero_title', label: 'Home Hero Title' },
  { key: 'home_hero_subtitle', label: 'Home Hero Subtitle' },
  { key: 'about_mission_text', label: 'About — Mission Text' },
  { key: 'about_history_text', label: 'About — History Text' },
  { key: 'about_partnership_text', label: 'About — Partnership Text' },
  { key: 'about_volunteer_text', label: 'About — Volunteer Text' },
  { key: 'contact_ivr_note', label: 'Contact — IVR Note' },
  { key: 'footer_mission_statement', label: 'Footer Mission Statement' },
];

type Entry = { en: string; he: string; saved: boolean };

function buildInitial(
  en: Record<string, string>,
  he: Record<string, string>,
): Record<string, Entry> {
  const map: Record<string, Entry> = {};
  for (const { key } of CONTENT_KEYS) {
    map[key] = { en: en[key] ?? '', he: he[key] ?? '', saved: true };
  }
  return map;
}

export default function ContentEditor({ initialEn, initialHe }: Props) {
  const t = useTranslations('admin');
  const [entries, setEntries] = useState(() =>
    buildInitial(initialEn, initialHe),
  );
  const [activeKey, setActiveKey] = useState(CONTENT_KEYS[0].key);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [customKey, setCustomKey] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const allKeys = [
    ...CONTENT_KEYS,
    ...Object.keys(entries)
      .filter((k) => !CONTENT_KEYS.find((c) => c.key === k))
      .map((k) => ({ key: k, label: k })),
  ];

  function updateField(key: string, locale: 'en' | 'he', value: string) {
    setEntries((prev) => ({
      ...prev,
      [key]: { ...prev[key], [locale]: value, saved: false },
    }));
    setFeedback(null);
  }

  function handleSave(key: string) {
    const entry = entries[key];
    if (!entry) return;
    startTransition(async () => {
      const [resEn, resHe] = await Promise.all([
        upsertSiteContent(key, 'en', entry.en),
        upsertSiteContent(key, 'he', entry.he),
      ]);
      if (resEn.ok && resHe.ok) {
        setEntries((prev) => ({
          ...prev,
          [key]: { ...prev[key], saved: true },
        }));
        setFeedback({ type: 'success', msg: t('contentSaved') });
      } else {
        const msg =
          (!resEn.ok && resEn.message) ||
          (!resHe.ok && resHe.message) ||
          t('contentSaveError');
        setFeedback({ type: 'error', msg: String(msg) });
      }
    });
  }

  function handleClear(key: string) {
    startTransition(async () => {
      const [resEn, resHe] = await Promise.all([
        deleteSiteContent(key, 'en'),
        deleteSiteContent(key, 'he'),
      ]);
      if (resEn.ok && resHe.ok) {
        setEntries((prev) => ({
          ...prev,
          [key]: { en: '', he: '', saved: true },
        }));
        setFeedback({ type: 'success', msg: t('contentCleared') });
      } else {
        setFeedback({ type: 'error', msg: t('contentSaveError') });
      }
    });
  }

  function handleAddCustom() {
    const k = customKey.trim().replace(/\s+/g, '_').toLowerCase();
    if (!k) return;
    if (!entries[k]) {
      setEntries((prev) => ({ ...prev, [k]: { en: '', he: '', saved: true } }));
    }
    setActiveKey(k);
    setCustomKey('');
    setShowCustom(false);
  }

  const active = entries[activeKey];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {t('contentTitle')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('contentSubtitle')}</p>
        </div>
        <button
          onClick={() => setShowCustom((v) => !v)}
          className="text-sm bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-navy-light transition-colors"
        >
          + {t('contentAddKey')}
        </button>
      </div>

      {showCustom && (
        <div className="mb-4 flex gap-2">
          <input
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder={t('contentKeyPlaceholder')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          />
          <button
            onClick={handleAddCustom}
            className="bg-brand-gold text-brand-navy px-4 py-2 text-sm font-semibold rounded-lg hover:bg-brand-gold-hover transition-colors"
          >
            {t('contentAddKeyBtn')}
          </button>
        </div>
      )}

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

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Key list sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {allKeys.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveKey(key)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                  activeKey === key
                    ? 'bg-brand-navy text-white font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="block font-medium truncate">{label}</span>
                {activeKey !== key && (
                  <span className="block text-xs text-gray-400 truncate">
                    {entries[key]?.en?.slice(0, 40) || '—'}
                  </span>
                )}
                {!entries[key]?.saved && (
                  <span className="inline-block mt-0.5 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editor panel */}
        {active && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">
                <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                  {activeKey}
                </span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleClear(activeKey)}
                  disabled={isPending}
                  className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('contentClear')}
                </button>
                <button
                  onClick={() => handleSave(activeKey)}
                  disabled={isPending || active.saved}
                  className="text-sm bg-brand-gold text-brand-navy font-semibold px-4 py-1.5 rounded-lg hover:bg-brand-gold-hover transition-colors disabled:opacity-50"
                >
                  {isPending ? t('saving') : t('save')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  English
                </label>
                <textarea
                  rows={6}
                  value={active.en}
                  onChange={(e) => updateField(activeKey, 'en', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-y"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  עברית
                </label>
                <textarea
                  rows={6}
                  value={active.he}
                  onChange={(e) => updateField(activeKey, 'he', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-y"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
