import type { PrayerSubmissionInsert } from '@/types/database';
import { getPublicClient } from './client';

export type CreateSubmissionResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'error'; message?: string };

/**
 * Saves a donor prayer submission via the public anon client (RLS allows
 * INSERT only; rows cannot be read back). Never throws.
 * When Supabase is not configured, returns `{ ok: false, reason: 'not_configured' }`
 * so the caller can show a friendly message instead of crashing.
 */
export async function createPrayerSubmission(
  submission: PrayerSubmissionInsert,
): Promise<CreateSubmissionResult> {
  const client = getPublicClient();
  if (!client) return { ok: false, reason: 'not_configured' };

  try {
    const { error } = await client
      .from('prayer_submissions')
      .insert(submission);
    if (error) return { ok: false, reason: 'error', message: error.message };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
