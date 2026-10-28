'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemInsert,
  Json,
  Kalla,
  KallaInsert,
  MediaCategory,
  MediaSection,
  MediaType,
  PrayerReason,
  PrayerReasonInsert,
  SiteMedia,
  SiteMediaInsert,
  SiteSettingValues,
} from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; reason: 'unauthorized' | 'not_configured' | 'error'; message?: string };

// ---------------------------------------------------------------------------
// Mock admin session (used when Supabase is unconfigured)
// ---------------------------------------------------------------------------

const MOCK_ADMIN_EMAIL = 'admin@helpjewishbrides.org';
const MOCK_ADMIN_PASSWORD = 'admin1234';
const MOCK_SESSION_COOKIE = 'admin_mock_session';

import { isSupabaseConfigured } from '@/lib/supabase/env';

function isMockMode(): boolean {
  return !isSupabaseConfigured();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function adminLogin(credentials: {
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; reason: 'invalid_credentials' | 'error'; message?: string }> {
  const { email, password } = credentials;

  if (isMockMode()) {
    // Fallback: compare against hardcoded mock admin (dev/demo mode only)
    if (email.trim().toLowerCase() === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set(MOCK_SESSION_COOKIE, '1', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
      });
      return { ok: true };
    }
    return { ok: false, reason: 'invalid_credentials', message: 'Mock mode active. Use admin@helpjewishbrides.org / admin1234 or configure Supabase keys.' };
  }

  const client = await createClient();
  if (!client) return { ok: false, reason: 'error', message: 'Database client not initialized.' };

  const { error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    console.error('[auth] Supabase signIn error:', error.message);
    return {
      ok: false,
      reason: error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('credential')
        ? 'invalid_credentials'
        : 'error',
      message: error.message,
    };
  }
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  if (isMockMode()) {
    const cookieStore = await cookies();
    cookieStore.delete(MOCK_SESSION_COOKIE);
    return;
  }
  const client = await createClient();
  await client?.auth.signOut();
}

/** Returns the session user, or null if not authenticated. */
export async function getAdminSession(): Promise<{ email: string } | null> {
  if (isMockMode()) {
    const cookieStore = await cookies();
    const mock = cookieStore.get(MOCK_SESSION_COOKIE);
    return mock ? { email: MOCK_ADMIN_EMAIL } : null;
  }

  const client = await createClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  if (!data.user) return null;
  return { email: data.user.email ?? '' };
}

// ---------------------------------------------------------------------------
// Guard helper
// ---------------------------------------------------------------------------

async function requireAdmin(): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, reason: 'unauthorized' };
  const client = createAdminClient();
  if (!client && !isMockMode()) return { ok: false, reason: 'not_configured' };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Site Content (Page Copy)
// ---------------------------------------------------------------------------

export async function upsertSiteContent(
  key: string,
  locale: 'en' | 'he',
  value: string,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true }; // mock mode: silently succeed

  const { error } = await client.from('site_content').upsert(
    { key, locale, value, updated_at: new Date().toISOString() },
    { onConflict: 'key,locale' },
  );
  if (error) return { ok: false, reason: 'error', message: error.message };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function deleteSiteContent(
  key: string,
  locale: 'en' | 'he',
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client
    .from('site_content')
    .delete()
    .eq('key', key)
    .eq('locale', locale);
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export async function createMedia(payload: {
  section: MediaSection;
  category: MediaCategory | null;
  media_type: MediaType;
  url: string;
  title_en: string;
  title_he: string;
  display_order: number;
}): Promise<ActionResult<SiteMedia>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: false, reason: 'not_configured' };

  const insert: SiteMediaInsert = {
    section: payload.section,
    category: payload.category,
    media_type: payload.media_type,
    url: payload.url,
    title_en: payload.title_en || null,
    title_he: payload.title_he || null,
    display_order: payload.display_order,
    is_active: true,
  };

  const { data, error } = await client
    .from('site_media')
    .insert(insert)
    .select()
    .single();
  if (error) return { ok: false, reason: 'error', message: error.message };
  revalidatePath('/', 'layout');
  return { ok: true, data: data as SiteMedia };
}

export async function updateMedia(
  id: string,
  payload: Partial<SiteMedia>,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client
    .from('site_media')
    .update(payload)
    .eq('id', id);
  if (error) return { ok: false, reason: 'error', message: error.message };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function deleteMedia(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client.from('site_media').delete().eq('id', id);
  if (error) return { ok: false, reason: 'error', message: error.message };
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function reorderMedia(
  items: { id: string; display_order: number }[],
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const updates = items.map(({ id, display_order }) =>
    client!.from('site_media').update({ display_order }).eq('id', id),
  );
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error)
    return { ok: false, reason: 'error', message: failed.error.message };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Catalog Items
// ---------------------------------------------------------------------------

export async function createCatalogItem(payload: {
  title_en: string;
  title_he: string;
  description_en: string;
  description_he: string;
  price_nis: number;
  image_url: string;
  category: CatalogCategory;
  display_order: number;
}): Promise<ActionResult<CatalogItem>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: false, reason: 'not_configured' };

  const insert: CatalogItemInsert = {
    title_en: payload.title_en,
    title_he: payload.title_he,
    description_en: payload.description_en || null,
    description_he: payload.description_he || null,
    price_nis: payload.price_nis,
    image_url: payload.image_url || null,
    category: payload.category ?? 'core_package_item',
    display_order: payload.display_order,
    is_active: true,
  };

  const { data, error } = await client
    .from('catalog_items')
    .insert(insert)
    .select()
    .single();
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true, data: data as CatalogItem };
}

export async function updateCatalogItem(
  id: string,
  payload: Partial<CatalogItem>,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client
    .from('catalog_items')
    .update(payload)
    .eq('id', id);
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true };
}

export async function deleteCatalogItem(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client
    .from('catalog_items')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Kallas (Brides)
// ---------------------------------------------------------------------------

export async function createKalla(payload: {
  wedding_date: string;
  story_en: string;
  story_he: string;
  target_amount_nis: number;
}): Promise<ActionResult<Kalla>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: false, reason: 'not_configured' };

  const insert: KallaInsert = {
    wedding_date: payload.wedding_date,
    story_en: payload.story_en,
    story_he: payload.story_he,
    target_amount_nis: payload.target_amount_nis,
    is_sponsored: false,
  };

  const { data, error } = await client
    .from('kallas')
    .insert(insert)
    .select()
    .single();
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true, data: data as Kalla };
}

export async function updateKalla(
  id: string,
  payload: Partial<Kalla>,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client.from('kallas').update(payload).eq('id', id);
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true };
}

export async function deleteKalla(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client.from('kallas').delete().eq('id', id);
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true };
}

/** Deletes all kallas whose wedding_date < today. */
export async function deletePastKallas(): Promise<ActionResult<{ count: number }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true, data: { count: 0 } };

  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await client
    .from('kallas')
    .delete()
    .lt('wedding_date', today)
    .select('id');
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true, data: { count: data?.length ?? 0 } };
}

// ---------------------------------------------------------------------------
// Prayer Reasons
// ---------------------------------------------------------------------------

export async function createPrayerReason(payload: {
  label_en: string;
  label_he: string;
  display_order: number;
}): Promise<ActionResult<PrayerReason>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: false, reason: 'not_configured' };

  const insert: PrayerReasonInsert = {
    label_en: payload.label_en,
    label_he: payload.label_he,
    display_order: payload.display_order,
    is_active: true,
  };

  const { data, error } = await client
    .from('prayer_reasons')
    .insert(insert)
    .select()
    .single();
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true, data: data as PrayerReason };
}

export async function updatePrayerReason(
  id: string,
  payload: Partial<PrayerReason>,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client
    .from('prayer_reasons')
    .update(payload)
    .eq('id', id);
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true };
}

export async function deletePrayerReason(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client
    .from('prayer_reasons')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------

export async function updateSiteSetting(
  key: string,
  value: Json,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const client = createAdminClient();
  if (!client) return { ok: true };

  const { error } = await client.from('site_settings').upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  );
  if (error) return { ok: false, reason: 'error', message: error.message };
  return { ok: true };
}

export async function updateSiteSettings(
  settings: Partial<SiteSettingValues>,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const entries = Object.entries(settings) as [string, Json][];
  for (const [key, value] of entries) {
    const result = await updateSiteSetting(key, value);
    if (!result.ok) return result;
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Image & Media Storage Upload
// ---------------------------------------------------------------------------

export async function uploadImage(
  formData: FormData,
  bucket: 'catalog' | 'gallery' = 'catalog',
): Promise<ActionResult<{ url: string }>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard;

  const file = formData.get('file') as File | null;
  if (!file) return { ok: false, reason: 'error', message: 'No file provided' };

  const client = createAdminClient();
  if (!client) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'Supabase storage is not configured. Please paste a direct image URL.',
    };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    console.error('[storage] Upload error:', uploadError.message);
    return { ok: false, reason: 'error', message: uploadError.message };
  }

  const { data } = client.storage.from(bucket).getPublicUrl(fileName);
  return { ok: true, data: { url: data.publicUrl } };
}
