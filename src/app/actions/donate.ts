'use server';

import { headers } from 'next/headers';
import type { PrayerName, SponsorshipType } from '@/types/database';
import type { DonationRequest, DonationResult } from '@/types/donation';
import {
  getAvailableKallas,
  getCatalogItems,
  getPrayerReasons,
  getSiteSettings,
} from '@/lib/data';
import { createPrayerSubmission } from '@/lib/data/submissions';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildLemaanAchaiUrl } from '@/lib/lemaan-achai';
import { sendAdminNotification } from '@/lib/email';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAMES_PER_PACKAGE = 3;
const MAX_PACKAGES = 100;
const MAX_ITEM_QUANTITY = 100;
const MAX_KALLA_AMOUNT = 100000;
const MAX_TEXT = 200;

function clean(value: unknown, max = MAX_TEXT): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanNames(names: unknown, max: number): PrayerName[] {
  if (!Array.isArray(names)) return [];
  return names
    .map((n): PrayerName => {
      const entry = (n ?? {}) as Partial<PrayerName>;
      return {
        name: clean(entry.name),
        reason_id: clean(entry.reason_id) || null,
        note: clean(entry.note) || null,
      };
    })
    .filter((n) => n.name.length > 0)
    .slice(0, max);
}

async function getSiteOrigin(): Promise<string | null> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return null;
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

/**
 * Handles a donation checkout from the /donate page: validates the request,
 * recomputes the amount server-side, saves the prayer submission, notifies
 * the admins by email and returns the Lemaan Achai payment redirect URL.
 */
export async function submitDonation(
  request: DonationRequest,
): Promise<DonationResult> {
  const donor = {
    name: clean(request?.donor?.name),
    email: clean(request?.donor?.email),
    phone: clean(request?.donor?.phone, 40) || undefined,
  };
  if (!donor.name || !EMAIL_PATTERN.test(donor.email)) {
    return { ok: false, error: 'invalid_donor' };
  }
  const locale = request.locale === 'he' ? 'he' : 'en';

  let amount = 0;
  let sponsorshipType: SponsorshipType;
  let kallaId: string | null = null;
  let names: PrayerName[] = [];
  const details: string[] = [];

  switch (request.type) {
    case 'package': {
      const quantity = Math.floor(Number(request.quantity));
      if (!(quantity >= 1 && quantity <= MAX_PACKAGES)) {
        return { ok: false, error: 'invalid_request' };
      }
      const { package_cost_nis } = await getSiteSettings();
      amount = quantity * package_cost_nis;
      sponsorshipType = 'package';
      names = cleanNames(request.names, quantity * MAX_NAMES_PER_PACKAGE);
      details.push(`Packages: ${quantity} x ${package_cost_nis} NIS`);
      break;
    }
    case 'catalog_items': {
      if (!Array.isArray(request.items)) {
        return { ok: false, error: 'invalid_request' };
      }
      const catalog = await getCatalogItems();
      for (const line of request.items) {
        const quantity = Math.floor(Number(line?.quantity));
        const item = catalog.find((c) => c.id === line?.id);
        if (!item || !(quantity >= 1 && quantity <= MAX_ITEM_QUANTITY)) {
          return { ok: false, error: 'invalid_request' };
        }
        amount += quantity * item.price_nis;
        details.push(`${quantity} x ${item.title_en} (${item.price_nis} NIS)`);
      }
      if (amount <= 0) return { ok: false, error: 'invalid_request' };
      sponsorshipType = 'catalog_items';
      break;
    }
    case 'kalla': {
      const kalla = (await getAvailableKallas()).find(
        (k) => k.id === request.kallaId,
      );
      const kallaAmount = Math.floor(Number(request.amount));
      if (!kalla || !(kallaAmount >= 1 && kallaAmount <= MAX_KALLA_AMOUNT)) {
        return { ok: false, error: 'invalid_request' };
      }
      amount = kallaAmount;
      kallaId = kalla.id;
      sponsorshipType =
        request.mode === 'by_story' ? 'kalla_by_story' : 'kalla_by_date';
      names = cleanNames(request.names, MAX_NAMES_PER_PACKAGE);
      details.push(
        `Kalla wedding date: ${kalla.wedding_date}`,
        `Kalla story: ${kalla.story_en}`,
      );
      break;
    }
    default:
      return { ok: false, error: 'invalid_request' };
  }

  const submissionId = crypto.randomUUID();
  const saved = await createPrayerSubmission({
    id: submissionId,
    donor_name: donor.name,
    donor_email: donor.email,
    donor_phone: donor.phone ?? null,
    sponsorship_type: sponsorshipType,
    kalla_id: kallaId,
    amount_nis: amount,
    names_list: names,
  });
  if (!saved.ok && saved.reason === 'error') {
    console.error('[donate] Failed to save prayer submission:', saved.message);
    return { ok: false, error: 'save_failed' };
  }
  if (!saved.ok) {
    console.warn(
      '[donate] Supabase not configured; submission was not persisted.',
    );
  }

  const [settings, reasons] = await Promise.all([
    getSiteSettings(),
    getPrayerReasons(),
  ]);

  const email = await sendAdminNotification({
    recipients: settings.admin_emails,
    submissionId,
    sponsorshipType,
    amountNis: amount,
    donor,
    details,
    names: names.map((n) => ({
      name: n.name,
      reason: reasons.find((r) => r.id === n.reason_id)?.label_en ?? null,
      note: n.note ?? null,
    })),
  });

  if (email.ok && saved.ok) {
    // The anon role cannot UPDATE; use the service role (server-only) if available.
    await createAdminClient()
      ?.from('prayer_submissions')
      .update({ emailed_to_admin: true })
      .eq('id', submissionId);
  }

  const origin = await getSiteOrigin();
  const redirectUrl = buildLemaanAchaiUrl({
    baseUrl: settings.lemaan_achai_donation_url,
    amount,
    currency: 'ILS',
    ref: submissionId,
    lang: locale,
    email: donor.email,
    name: donor.name,
    phone: donor.phone,
    returnUrl: origin
      ? `${origin}/${locale}/donate/thank-you?ref=${submissionId}`
      : undefined,
  });

  return { ok: true, submissionId, redirectUrl };
}
