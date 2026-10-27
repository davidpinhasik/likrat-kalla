'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import {
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from '@/app/actions/admin';
import type { CatalogItem, CatalogCategory } from '@/types/database';

type Props = {
  initialItems: CatalogItem[];
};

const CATEGORIES: CatalogCategory[] = ['core_package_item', 'random_choice_item'];

const BLANK_FORM = {
  title_en: '',
  title_he: '',
  description_en: '',
  description_he: '',
  price_nis: 0,
  image_url: '',
  category: 'core_package_item' as CatalogCategory,
  display_order: 0,
  is_active: true,
};

export default function CatalogManager({ initialItems }: Props) {
  const t = useTranslations('admin');
  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);

  function openAdd() {
    setForm({ ...BLANK_FORM, display_order: items.length + 1 });
    setEditing(null);
    setAdding(true);
  }

  function openEdit(item: CatalogItem) {
    setForm({
      title_en: item.title_en,
      title_he: item.title_he,
      description_en: item.description_en ?? '',
      description_he: item.description_he ?? '',
      price_nis: item.price_nis,
      image_url: item.image_url ?? '',
      category: item.category,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setEditing(item);
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
        const result = await updateCatalogItem(editing.id, {
          title_en: form.title_en,
          title_he: form.title_he,
          description_en: form.description_en || null,
          description_he: form.description_he || null,
          price_nis: form.price_nis,
          image_url: form.image_url || null,
          category: form.category,
          display_order: form.display_order,
          is_active: form.is_active,
        });
        if (result.ok) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === editing.id
                ? {
                    ...i,
                    ...form,
                    description_en: form.description_en || null,
                    description_he: form.description_he || null,
                    image_url: form.image_url || null,
                  }
                : i,
            ),
          );
          setFeedback({ type: 'success', msg: t('catalogSaved') });
          closeForm();
        } else {
          setFeedback({ type: 'error', msg: (!result.ok && result.message) || t('catalogError') });
        }
      } else {
        const result = await createCatalogItem({
          title_en: form.title_en,
          title_he: form.title_he,
          description_en: form.description_en,
          description_he: form.description_he,
          price_nis: form.price_nis,
          image_url: form.image_url,
          category: form.category,
          display_order: form.display_order,
        });
        if (result.ok && result.data) {
          setItems((prev) => [...prev, result.data!]);
          setFeedback({ type: 'success', msg: t('catalogAdded') });
          closeForm();
        } else {
          setFeedback({ type: 'error', msg: (!result.ok && result.message) || t('catalogError') });
        }
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    startTransition(async () => {
      const result = await deleteCatalogItem(id);
      if (result.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setFeedback({ type: 'success', msg: t('catalogDeleted') });
      } else {
        setFeedback({ type: 'error', msg: t('catalogError') });
      }
    });
  }

  function handleToggleActive(item: CatalogItem) {
    startTransition(async () => {
      const result = await updateCatalogItem(item.id, { is_active: !item.is_active });
      if (result.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i)),
        );
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{t('catalogTitle')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('catalogSubtitle')}</p>
        </div>
        <button
          onClick={openAdd}
          className="text-sm bg-brand-navy text-white px-4 py-2 rounded-lg hover:bg-brand-navy-light transition-colors"
        >
          + {t('catalogAdd')}
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

      {/* Add/Edit modal */}
      {adding && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 my-4">
            <h2 className="text-lg font-bold text-brand-navy mb-4">
              {editing ? t('catalogEdit') : t('catalogAdd')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title EN *</label>
                  <input
                    required
                    value={form.title_en}
                    onChange={(e) => f('title_en', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title HE *</label>
                  <input
                    required
                    value={form.title_he}
                    onChange={(e) => f('title_he', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description EN</label>
                  <textarea
                    rows={3}
                    value={form.description_en}
                    onChange={(e) => f('description_en', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description HE</label>
                  <textarea
                    rows={3}
                    value={form.description_he}
                    onChange={(e) => f('description_he', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (NIS) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price_nis}
                    onChange={(e) => f('price_nis', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => f('category', e.target.value as CatalogCategory)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) => f('display_order', parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                <input
                  value={form.image_url}
                  onChange={(e) => f('image_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>
              {editing && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => f('is_active', e.target.checked)}
                    className="rounded"
                  />
                  Active (visible on public site)
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

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-12 text-sm">{t('catalogEmpty')}</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border ${item.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'} p-4`}
          >
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={item.title_en}
                className="w-full h-32 object-cover rounded-lg mb-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-300 text-3xl">
                🎁
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{item.title_en}</p>
                <p className="text-xs text-gray-500 truncate" dir="rtl">{item.title_he}</p>
                <p className="text-sm font-medium text-brand-gold mt-1">₪{item.price_nis}</p>
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleToggleActive(item)}
                disabled={isPending}
                className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                  item.is_active
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {item.is_active ? 'Active' : 'Inactive'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  className="text-xs text-red-500 hover:underline"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
