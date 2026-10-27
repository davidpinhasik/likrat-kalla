'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  createPrayerReason,
  updatePrayerReason,
  deletePrayerReason,
} from '@/app/actions/admin';
import type { PrayerSubmission, PrayerReason } from '@/types/database';

type Props = {
  initialSubmissions: PrayerSubmission[];
  initialReasons: PrayerReason[];
};

type Tab = 'submissions' | 'reasons';

export default function PrayersManager({ initialSubmissions, initialReasons }: Props) {
  const t = useTranslations('admin');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  const [tab, setTab] = useState<Tab>('submissions');
  const [submissions] = useState<PrayerSubmission[]>(initialSubmissions);
  const [reasons, setReasons] = useState<PrayerReason[]>(initialReasons);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Reason form
  const [editingReason, setEditingReason] = useState<PrayerReason | null>(null);
  const [addingReason, setAddingReason] = useState(false);
  const [reasonForm, setReasonForm] = useState({ label_en: '', label_he: '', display_order: 1 });

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.donor_name.toLowerCase().includes(q) ||
      s.donor_email.toLowerCase().includes(q) ||
      (s.names_list ?? []).some((n) => n.name.toLowerCase().includes(q))
    );
  });

  function openAddReason() {
    setReasonForm({ label_en: '', label_he: '', display_order: reasons.length + 1 });
    setEditingReason(null);
    setAddingReason(true);
  }

  function openEditReason(r: PrayerReason) {
    setReasonForm({ label_en: r.label_en, label_he: r.label_he, display_order: r.display_order });
    setEditingReason(r);
    setAddingReason(true);
  }

  function closeReasonForm() {
    setAddingReason(false);
    setEditingReason(null);
  }

  function handleReasonSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      if (editingReason) {
        const result = await updatePrayerReason(editingReason.id, reasonForm);
        if (result.ok) {
          setReasons((prev) =>
            prev.map((r) => (r.id === editingReason.id ? { ...r, ...reasonForm } : r)),
          );
          setFeedback({ type: 'success', msg: t('reasonSaved') });
          closeReasonForm();
        } else {
          setFeedback({ type: 'error', msg: t('reasonError') });
        }
      } else {
        const result = await createPrayerReason(reasonForm);
        if (result.ok && result.data) {
          setReasons((prev) => [...prev, result.data!]);
          setFeedback({ type: 'success', msg: t('reasonAdded') });
          closeReasonForm();
        } else {
          setFeedback({ type: 'error', msg: t('reasonError') });
        }
      }
    });
  }

  function handleDeleteReason(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    startTransition(async () => {
      const result = await deletePrayerReason(id);
      if (result.ok) {
        setReasons((prev) => prev.filter((r) => r.id !== id));
        setFeedback({ type: 'success', msg: t('reasonDeleted') });
      } else {
        setFeedback({ type: 'error', msg: t('reasonError') });
      }
    });
  }

  function handleToggleReason(r: PrayerReason) {
    startTransition(async () => {
      const result = await updatePrayerReason(r.id, { is_active: !r.is_active });
      if (result.ok) {
        setReasons((prev) =>
          prev.map((item) => (item.id === r.id ? { ...item, is_active: !item.is_active } : item)),
        );
      }
    });
  }

  const reasonMap = Object.fromEntries(reasons.map((r) => [r.id, r.label_en]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{t('prayersTitle')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('prayersSubtitle')}</p>
        </div>
        <Link
          href={`/${locale}/admin/prayers/print`}
          target="_blank"
          className="text-sm border border-brand-navy text-brand-navy px-4 py-2 rounded-lg hover:bg-brand-navy/5 transition-colors"
        >
          🖨 {t('prayersPrint')}
        </Link>
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

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {(['submissions', 'reasons'] as Tab[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === tabKey
                ? 'border-brand-gold text-brand-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tabKey === 'submissions' ? t('prayersTabSubmissions') : t('prayersTabReasons')}
            {tabKey === 'submissions' && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {submissions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- Submissions tab ---- */}
      {tab === 'submissions' && (
        <div>
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('prayersSearch')}
              className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">{t('prayersEmpty')}</p>
            ) : (
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Donor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Type / Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Prayer Names
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{s.donor_name}</p>
                        <p className="text-xs text-gray-400">{s.donor_email}</p>
                        {s.donor_phone && (
                          <p className="text-xs text-gray-400">{s.donor_phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          {s.sponsorship_type}
                        </span>
                        <p className="text-xs text-gray-600 mt-0.5">₪{s.amount_nis}</p>
                        {s.emailed_to_admin && (
                          <span className="text-xs text-green-600">✓ emailed</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {(s.names_list ?? []).length === 0 ? (
                          <span className="text-gray-300 text-xs">—</span>
                        ) : (
                          <ul className="space-y-0.5">
                            {(s.names_list ?? []).map((n, i) => (
                              <li key={i} className="text-xs text-gray-700">
                                <span className="font-medium">{n.name}</span>
                                {n.reason_id && reasonMap[n.reason_id] && (
                                  <span className="text-gray-400">
                                    {' '}— {reasonMap[n.reason_id]}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ---- Reasons tab ---- */}
      {tab === 'reasons' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={openAddReason}
              className="text-sm bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-navy-light transition-colors"
            >
              + {t('reasonAdd')}
            </button>
          </div>

          {addingReason && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-bold text-brand-navy mb-4">
                  {editingReason ? t('reasonEdit') : t('reasonAdd')}
                </h2>
                <form onSubmit={handleReasonSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label EN *</label>
                    <input
                      required
                      value={reasonForm.label_en}
                      onChange={(e) => setReasonForm((f) => ({ ...f, label_en: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label HE *</label>
                    <input
                      required
                      value={reasonForm.label_he}
                      onChange={(e) => setReasonForm((f) => ({ ...f, label_he: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                    <input
                      type="number"
                      min={1}
                      value={reasonForm.display_order}
                      onChange={(e) => setReasonForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 1 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeReasonForm}
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

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {reasons.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">{t('reasonsEmpty')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">English</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hebrew</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Active</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('mediaColActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reasons.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{r.display_order}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{r.label_en}</td>
                      <td className="px-4 py-3 text-gray-600" dir="rtl">{r.label_he}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleReason(r)}
                          disabled={isPending}
                          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${r.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${r.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditReason(r)} className="text-xs text-blue-600 hover:underline">{t('edit')}</button>
                          <button onClick={() => handleDeleteReason(r.id)} disabled={isPending} className="text-xs text-red-500 hover:underline">{t('delete')}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
