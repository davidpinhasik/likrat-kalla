import type { Locale, PrayerName } from './database';

/** Contact details of the person making the donation. */
export type DonorDetails = {
  name: string;
  email: string;
  phone?: string;
}

type DonationBase = {
  locale: Locale;
  donor: DonorDetails;
}

/**
 * Payload sent from the donate page to the `submitDonation` server action.
 * Amounts are intentionally NOT part of package/catalog requests: the server
 * derives them from site_settings / catalog_items so they cannot be tampered with.
 */
export type DonationRequest = DonationBase &
  (
    | { type: 'package'; quantity: number; names: PrayerName[] }
    | {
        type: 'catalog_items';
        items: { id: string; quantity: number }[];
      }
    | {
        type: 'kalla';
        kallaId: string;
        /** How the donor found the bride; stored as the sponsorship type. */
        mode: 'by_date' | 'by_story';
        amount: number;
        names: PrayerName[];
      }
  );

export type DonationErrorCode =
  | 'invalid_donor'
  | 'invalid_request'
  | 'save_failed';

export type DonationResult =
  | { ok: true; submissionId: string; redirectUrl: string }
  | { ok: false; error: DonationErrorCode }
