/**
 * True when `now` falls within the auction's admin-configured date range.
 * Dates are ISO `YYYY-MM-DD` strings; the end date is inclusive (whole day).
 * Pure and client-safe, so the browser can re-check it on cached pages.
 */
export function isWithinAuctionDates(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  now = new Date(),
): boolean {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (end) end.setUTCHours(23, 59, 59, 999);
  return (!start || now >= start) && (!end || now <= end);
}
