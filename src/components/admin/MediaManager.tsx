'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  createMedia,
  updateMedia,
  deleteMedia,
  reorderMedia,
} from '@/app/actions/admin';
import type { SiteMedia, MediaCategory, MediaSection, MediaType } from '@/types/database';

type Props = {
  initialItems: SiteMedia[];
};

const SECTION_OPTIONS: MediaSection[] = ['landing_carousel', 'about_gallery', 'events', 'general'];
const CATEGORY_OPTIONS: (MediaCategory | '')[] = [
  '',
  'yearly_events',
  'parlor_meetings',
  'distribution_days',
  'special_videos',
  'other',
];

const BLANK_FORM = {
  section: 'about_gallery' as MediaSection,
  category: '' as MediaCategory | '',
  media_type: 'image' as MediaType,
  url: '',
  title_en: '',
  title_he: '',
  display_order: 0,
};

export default function MediaManager({ initialItems }: Props) {
  const t = useTranslations('admin');
  const [items, setItems] = useState<SiteMedia[]>(initialItems);
  const [editing, setEditing] = useState<SiteMedia | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [filterSection, setFilterSection] = useState<MediaSection | 'all'>('all');

  const displayed = filterSection === 'all'
    ? items
    : items.filter((i) => i.section === filterSection);

  function openAdd() {
    setForm({ ...BLANK_FORM, display_order: items.length + 1 });
    setEditing(null);
    setAdding(true);
  }

  function openEdit(item: SiteMedia) {
    setForm({
      section: item.section,
      category: item.category ?? '',
      media_type: item.media_type,
      url: item.url,
      title_en: item.title_en ?? '',
      title_he: item.title_he ?? '',
      display_order: item.display_order,
    });
    setEditing(item);
    setAdding(true);
  }

  function closeForm() {
    setAdding(false);
    setEditing(null);
    setForm({ ...BLANK_FORM });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      if (editing) {
        const result = await updateMedia(editing.id, {
          section: form.section,
          category: form.category || null,
          media_type: form.media_type,
          url: form.url,
          title_en: form.title_en || null,
          title_he: form.title_he || null,
          display_order: form.display_order,
        });
        if (result.ok) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === editing.id
                ? {
                    ...i,
                    section: form.section,
                    category: form.category as MediaCategory | null,
                    media_type: form.media_type,
                    url: form.url,
                    title_en: form.title_en || null,
                    title_he: form.title_he || null,
                    display_order: form.display_order,
                  }
                : i,
            ),
          );
          setFeedback({ type: 'success', msg: t('mediaSaved') });
          closeForm();
        } else {
          setFeedback({
            type: 'error',
            msg: (!result.ok && result.message) || t('mediaError'),
          });
        }
      } else {
        const result = await createMedia({
          section: form.section,
          category: (form.category as MediaCategory) || null,
          media_type: form.media_type,
          url: form.url,
          title_en: form.title_en,
          title_he: form.title_he,
          display_order: form.display_order,
        });
        if (result.ok && result.data) {
          setItems((prev) => [...prev, result.data!]);
          setFeedback({ type: 'success', msg: t('mediaAdded') });
          closeForm();
        } else {
          setFeedback({
            type: 'error',
            msg: (!result.ok && result.message) || t('mediaError'),
          });
        }
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    startTransition(async () => {
      const result = await deleteMedia(id);
      if (result.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setFeedback({ type: 'success', msg: t('mediaDeleted') });
      } else {
        setFeedback({ type: 'error', msg: t('mediaError') });
      }
    });
  }

  function handleToggleActive(item: SiteMedia) {
    startTransition(async () => {
      const result = await updateMedia(item.id, { is_active: !item.is_active });
      if (result.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, is_active: !i.is_active } : i,
          ),
        );
      }
    });
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const newItems = [...displayed];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    const reordered = newItems.map((item, i) => ({ ...item, display_order: i + 1 }));
    setItems((prev) => {
      const unchanged = filterSection === 'all' ? [] : prev.filter((i) => i.section !== filterSection);
      return [...unchanged, ...reordered].sort((a, b) => a.display_order - b.display_order);
    });
    startTransition(async () => {
      await reorderMedia(reordered.map((i) => ({ id: i.id, display_order: i.display_order })));
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{t('mediaTitle')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('mediaSubtitle')}</p>
        </div>
        <button
          onClick={openAdd}
          className="text-sm bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-navy-light transition-colors"
        >
          + {t('mediaAdd')}
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

      {/* Filter bar */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {(['all', ...SECTION_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterSection(s)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filterSection === s
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'border-gray-300 text-gray-600 hover:border-brand-navy'
            }`}
          >
            {s === 'all' ? t('filterAll') : s}
          </button>
        ))}
      </div>

      {/* Add/Edit modal overlay */}
      {adding && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-brand-navy mb-4">
              {editing ? t('mediaEdit') : t('mediaAdd')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Section
                  </label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm((f) => ({ ...f, section: e.target.value as MediaSection }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    {SECTION_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as MediaCategory | '' }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c || '— none —'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={form.media_type}
                    onChange={(e) => setForm((f) => ({ ...f, media_type: e.target.value as MediaType }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    <option value="image">image</option>
                    <option value="video">video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) => setForm((f) => ({ ...f, display_order: Number(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL *</label>
                <input
                  required
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://... or YouTube URL"
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title EN</label>
                  <input
                    value={form.title_en}
                    onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title HE</label>
                  <input
                    value={form.title_he}
                    onChange={(e) => setForm((f) => ({ ...f, title_he: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    dir="rtl"
                  />
                </div>
              </div>
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

      {/* Items table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {displayed.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">{t('mediaEmpty')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('mediaColPreview')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('mediaColTitle')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  Section
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Active
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t('mediaColActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 w-16">
                    {item.media_type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.title_en ?? ''}
                        className="w-12 h-10 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        ▶
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-xs">
                      {item.title_en || '—'}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">
                      {item.url}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {item.section}
                    </span>
                    {item.category && (
                      <span className="ml-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                    {item.media_type}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(item)}
                      disabled={isPending}
                      className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                        item.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                          item.is_active ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => moveItem(idx, 'up')}
                        disabled={idx === 0 || isPending}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveItem(idx, 'down')}
                        disabled={idx === displayed.length - 1 || isPending}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="text-xs text-blue-600 hover:underline px-2 py-1"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="text-xs text-red-500 hover:underline px-2 py-1"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
