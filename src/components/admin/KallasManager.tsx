'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  createKalla,
  updateKalla,
  deleteKalla,
  deletePastKallas,
} from '@/app/actions/admin';
import type { Kalla } from '@/types/database';

type Props = {
  initialKallas: Kalla[];
};

const BLANK_FORM = {
  wedding_date: '',
  story_en: '',
  story_he: '',
  target_amount_nis: 500,
  is_sponsored: false,
};

export default function KallasManager({ initialKallas }: Props) {
  const t = useTranslations('admin');
  const [kallas, setKallas] = useState<Kalla[]>(initialKallas);
  const [editing, setEditing] = useState<Kalla | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const pastCount = kallas.filter((k) => k.wedding_date < today).length;

  function openAdd() {
    setForm({ ...BLANK_FORM });
    setEditing(null);
    setAdding(true);
  }

  function openEdit(kalla: Kalla) {
    setForm({
      wedding_date: kalla.wedding_date,
      story_en: kalla.story_en,
      story_he: kalla.story_he,
      target_amount_nis: kalla.target_amount_nis,
      is_sponsored: kalla.is_sponsored,
    });
    setEditing(kalla);
    setAdding(true);
  }

  function closeForm() {
    setAdding(false);
    setEditing(null);
    setForm({ ...BLANK_FORM });
  }

  function f(key: keyof typeof form, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      if (editing) {
        const result = await updateKalla(editing.id, {
          wedding_date: form.wedding_date,
          story_en: form.story_en,
          story_he: form.story_he,
          target_amount_nis: form.target_amount_nis,
          is_sponsored: form.is_sponsored,
        });
        if (result.ok) {
          setKallas((prev) =>
            prev.map((k) => (k.id === editing.id ? { ...k, ...form } : k)),
          );
          setFeedback({ type: 'success', msg: t('kallaSaved') });
          closeForm();
        } else {
          setFeedback({ type: 'error', msg: (!result.ok && result.message) || t('kallaError') });
        }
      } else {
        const result = await createKalla({
          wedding_date: form.wedding_date,
          story_en: form.story_en,
          story_he: form.story_he,
          target_amount_nis: form.target_amount_nis,
        });
        if (result.ok && result.data) {
          setKallas((prev) =>
            [...prev, result.data!].sort((a, b) =>
              a.wedding_date.localeCompare(b.wedding_date),
            ),
          );
          setFeedback({ type: 'success', msg: t('kallaAdded') });
          closeForm();
        } else {
          setFeedback({ type: 'error', msg: (!result.ok && result.message) || t('kallaError') });
        }
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    startTransition(async () => {
      const result = await deleteKalla(id);
      if (result.ok) {
        setKallas((prev) => prev.filter((k) => k.id !== id));
        setFeedback({ type: 'success', msg: t('kallaDeleted') });
      } else {
        setFeedback({ type: 'error', msg: t('kallaError') });
      }
    });
  }

  function handleCleanupPast() {
    if (!confirm(t('kallaCleanupConfirm', { count: pastCount }))) return;
    startTransition(async () => {
      const result = await deletePastKallas();
      if (result.ok) {
        const today2 = new Date().toISOString().split('T')[0];
        setKallas((prev) => prev.filter((k) => k.wedding_date >= today2));
        const count = result.data?.count ?? 0;
        setFeedback({ type: 'success', msg: t('kallaCleanupDone', { count }) });
      } else {
        setFeedback({ type: 'error', msg: t('kallaError') });
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{t('kallasTitle')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('kallasSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          {pastCount > 0 && (
            <button
              onClick={handleCleanupPast}
              disabled={isPending}
              className="text-sm border border-amber-400 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              🗑 {t('kallaCleanup')} ({pastCount})
            </button>
          )}
          <button
            onClick={openAdd}
            className="text-sm bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-navy-light transition-colors"
          >
            + {t('kallaAdd')}
          </button>
        </div>
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

      {/* Add/Edit modal */}
      {adding && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="text-lg font-bold text-brand-navy mb-4">
              {editing ? t('kallaEdit') : t('kallaAdd')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('kallaWeddingDate')} *
                  </label>
                  <input
                    required
                    type="date"
                    value={form.wedding_date}
                    onChange={(e) => f('wedding_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('kallaTarget')} (NIS)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.target_amount_nis}
                    onChange={(e) => f('target_amount_nis', parseFloat(e.target.value) || 500)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Story EN *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.story_en}
                  onChange={(e) => f('story_en', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Story HE *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.story_he}
                  onChange={(e) => f('story_he', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
                  dir="rtl"
                />
              </div>
              {editing && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_sponsored}
                    onChange={(e) => f('is_sponsored', e.target.checked)}
                    className="rounded"
                  />
                  {t('kallaSponsored')}
                </label>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="text-sm bg-brand-gold text-brand-navy font-semibold px-5 py-2 rounded-lg hover:bg-brand-gold-hover transition-colors disabled:opacity-50"
                >
                  {isPending ? t('saving') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {kallas.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">{t('kallasEmpty')}</p>
        ) : (
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('kallaWeddingDate')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Story EN
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Target (NIS)
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('kallaSponsored')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('mediaColActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kallas.map((kalla) => {
                const isPast = kalla.wedding_date < today;
                return (
                  <tr
                    key={kalla.id}
                    className={`hover:bg-gray-50 ${isPast ? 'opacity-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {kalla.wedding_date}
                      {isPast && (
                        <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          past
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate text-gray-700">{kalla.story_en}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                      ₪{kalla.target_amount_nis}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block w-4 h-4 rounded-full ${
                          kalla.is_sponsored ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(kalla)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(kalla.id)}
                          disabled={isPending}
                          className="text-xs text-red-500 hover:underline"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
