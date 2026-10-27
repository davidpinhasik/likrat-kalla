import type { Locale } from '@/types/database';

export type LemaanAchaiCurrency = 'ILS' | 'USD';

export type LemaanAchaiRedirectParams = {
  /** Likrat Kalla campaign URL (site_settings.lemaan_achai_donation_url). */
  baseUrl: string;
  /** Total in `currency`. Omit for a general donation where the donor picks the amount. */
  amount?: number;
  currency?: LemaanAchaiCurrency;
  /** prayer_submissions.id so Lemaan Achai's receipt correlates with our record. */
  ref?: string;
  lang: Locale;
  email?: string;
  name?: string;
  phone?: string;
  /** Where Lemaan Achai should send the donor after a successful payment. */
  returnUrl?: string;
}

const DEFAULT_ORIGIN = 'https://www.lemaanachai.org';

function formatAmount(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/**
 * Builds the Lemaan Achai payment redirect URL (GET pattern from the
 * development plan, section 4.5):
 *   {baseUrl}?amount=&currency=&ref=&lang=&email=...
 *
 * The exact parameter names are still to be confirmed by Lemaan Achai's
 * programmer; they are all defined in this single function.
 * Pure and safe to call on the server or in the browser.
 */
export function buildLemaanAchaiUrl(params: LemaanAchaiRedirectParams): string {
  const origin = process.env.LEMAAN_ACHAI_BASE_URL?.trim() || DEFAULT_ORIGIN;

  let url: URL;
  try {
    url = new URL(params.baseUrl, origin);
  } catch {
    url = new URL(DEFAULT_ORIGIN);
  }

  // The campaign page is localised via a leading /en or /he path segment.
  url.pathname = url.pathname.replace(/^\/(en|he)(?=\/|$)/, `/${params.lang}`);

  const search = url.searchParams;
  if (params.amount !== undefined && params.amount > 0) {
    search.set('amount', formatAmount(params.amount));
    search.set('currency', params.currency ?? 'ILS');
  }
  if (params.ref) search.set('ref', params.ref);
  search.set('lang', params.lang);
  if (params.email) search.set('email', params.email);
  if (params.name) search.set('name', params.name);
  if (params.phone) search.set('phone', params.phone);
  if (params.returnUrl) search.set('return_url', params.returnUrl);

  return url.toString();
}
