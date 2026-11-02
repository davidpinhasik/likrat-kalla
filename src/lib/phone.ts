/**
 * Builds a tel: link from an admin-entered phone number.
 * Local Israeli numbers (leading 0) are converted to +972 so the link
 * also works for callers abroad.
 */
export function toTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  const international = cleaned.startsWith('0') ? `+972${cleaned.slice(1)}` : cleaned;
  return `tel:${international}`;
}
