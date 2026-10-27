import type { Kalla } from '@/types/database';
import { withFallback } from './client';
import { SEED_KALLAS } from './seed';

/** Kallas still available for sponsorship, soonest wedding first. */
export async function getAvailableKallas(): Promise<Kalla[]> {
  return withFallback<Kalla[]>(
    SEED_KALLAS.filter((k) => !k.is_sponsored),
    (client) =>
      client
        .from('kallas')
        .select('*')
        .eq('is_sponsored', false)
        .order('wedding_date', { ascending: true }),
  );
}

export async function getKallaById(id: string): Promise<Kalla | null> {
  const fallback = SEED_KALLAS.find((k) => k.id === id) ?? null;

  return withFallback<Kalla | null>(fallback, (client) =>
    client.from('kallas').select('*').eq('id', id).maybeSingle(),
  );
}
