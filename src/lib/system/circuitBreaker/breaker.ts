/**
 * Hardened Circuit Breaker — DB-backed state with sliding window failure tracking
 * Backoff/jitter + failure classification + trip cause
 */

import { classifyFailure, type ClassifiedFailure } from './classifyFailure';
import { recordTrip, clearTrip, getTrip, computeOpenDuration, type TripMetadata } from './store';
import { supabase } from '@/integrations/supabase/client';

export type BreakerState = 'closed' | 'open' | 'half_open';

interface BreakerConfig {
  failureThreshold: number;   // countable failures before trip
  halfOpenMaxAttempts: number; // probes before re-closing
  windowMs: number;           // failure counting window
}

const DEFAULT_CONFIG: BreakerConfig = {
  failureThreshold: 5,
  halfOpenMaxAttempts: 2,
  windowMs: 30_000,
};

const configs = new Map<string, BreakerConfig>();
const ensuredModules = new Set<string>();

function getConfig(module: string): BreakerConfig {
  return configs.get(module) ?? { ...DEFAULT_CONFIG };
}

/** Ensure a breaker row exists in DB (cached — only upserts once per session) */
async function ensureRow(module: string): Promise<void> {
  if (ensuredModules.has(module)) return;
  await supabase
    .from('circuit_breaker_state')
    .upsert({
      module,
      state: 'closed',
      countable_failures: 0,
      half_open_attempts: 0,
    }, { onConflict: 'module', ignoreDuplicates: true });
  ensuredModules.add(module);
}

/** Read breaker state from DB */
async function readState(module: string): Promise<{
  state: BreakerState;
  countable_failures: number;
  open_until: string | null;
  half_open_attempts: number;
  last_trip_at: string | null;
}> {
  await ensureRow(module);
  const { data } = await supabase
    .from('circuit_breaker_state')
    .select('*')
    .eq('module', module)
    .single();

  return {
    state: (data?.state ?? 'closed') as BreakerState,
    countable_failures: data?.countable_failures ?? 0,
    open_until: data?.open_until ?? null,
    half_open_attempts: data?.half_open_attempts ?? 0,
    last_trip_at: data?.last_trip_at ?? null,
  };
}

/** Update breaker state in DB */
async function updateState(module: string, updates: Record<string, unknown>): Promise<void> {
  await supabase
    .from('circuit_breaker_state')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('module', module);
}

/** Count failures in the sliding window from DB */
async function countWindowFailures(module: string, windowMs: number): Promise<number> {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const { count } = await supabase
    .from('circuit_breaker_failures')
    .select('*', { count: 'exact', head: true })
    .eq('module', module)
    .gte('created_at', cutoff);

  return count ?? 0;
}

/** Log a failure to the sliding window table */
async function logFailure(module: string, classified: ClassifiedFailure): Promise<void> {
  await supabase.from('circuit_breaker_failures').insert({
    module,
    classified_type: classified.category,
    message: classified.message.slice(0, 500),
  });
}

/** Check if a request can proceed */
export async function canExecute(module: string): Promise<boolean> {
  const s = await readState(module);
  const config = getConfig(module);

  if (s.state === 'closed') return true;

  if (s.state === 'open') {
    if (s.open_until && Date.now() >= new Date(s.open_until).getTime()) {
      await updateState(module, { state: 'half_open', half_open_attempts: 0 });
      return true; // allow probe
    }
    return false;
  }

  // half_open: allow limited probes
  return s.half_open_attempts < config.halfOpenMaxAttempts;
}

/** Record a successful execution */
export async function recordSuccess(module: string): Promise<void> {
  const s = await readState(module);
  const config = getConfig(module);

  if (s.state === 'half_open') {
    const attempts = s.half_open_attempts + 1;
    if (attempts >= config.halfOpenMaxAttempts) {
      // All probes succeeded → close
      await updateState(module, {
        state: 'closed',
        countable_failures: 0,
        half_open_attempts: 0,
      });
      clearTrip(module);
    } else {
      await updateState(module, { half_open_attempts: attempts });
    }
  } else if (s.state === 'closed') {
    // Decay failures on success
    await updateState(module, {
      countable_failures: Math.max(0, s.countable_failures - 1),
    });
  }
}

/** Record a failure */
export async function recordFailure(
  module: string,
  error: unknown,
  downstream?: string,
  blastRadius?: number
): Promise<{ tripped: boolean; classified: ClassifiedFailure; trip?: TripMetadata }> {
  const s = await readState(module);
  const config = getConfig(module);
  const classified = classifyFailure(error);

  // Log failure to sliding window table
  await logFailure(module, classified);

  // Only count countable failures toward breaker
  if (classified.class === 'ignorable') {
    return { tripped: false, classified };
  }

  // Count actual failures in the sliding window
  const windowCount = await countWindowFailures(module, config.windowMs);

  // Half-open failure → re-open immediately
  if (s.state === 'half_open') {
    const trip = recordTrip(module, classified.category, classified.message, downstream ?? null, blastRadius ?? 0.1);
    await updateState(module, {
      state: 'open',
      open_until: new Date(Date.now() + trip.open_duration_ms).toISOString(),
      last_trip_at: new Date().toISOString(),
    });
    return { tripped: true, classified, trip };
  }

  // Check threshold using sliding window count
  if (windowCount >= config.failureThreshold) {
    const trip = recordTrip(module, classified.category, classified.message, downstream ?? null, blastRadius ?? 0.1);
    await updateState(module, {
      state: 'open',
      open_until: new Date(Date.now() + trip.open_duration_ms).toISOString(),
      last_trip_at: new Date().toISOString(),
      countable_failures: 0,
    });
    return { tripped: true, classified, trip };
  }

  await updateState(module, {
    countable_failures: windowCount,
  });

  return { tripped: false, classified };
}

/** Get breaker state for a module */
export async function getState(module: string): Promise<{ state: BreakerState; trip: TripMetadata | null }> {
  const s = await readState(module);
  return { state: s.state, trip: getTrip(module) };
}

/** Force reset a breaker */
export async function forceReset(module: string): Promise<void> {
  await supabase.from('circuit_breaker_state').delete().eq('module', module);
  await supabase.from('circuit_breaker_failures').delete().eq('module', module);
  clearTrip(module);
}

/** Get all breaker states */
export async function getAllStates(): Promise<Array<{ module: string; state: BreakerState; trip: TripMetadata | null }>> {
  const { data } = await supabase
    .from('circuit_breaker_state')
    .select('module, state');

  if (!data) return [];

  return data.map((row: any) => ({
    module: row.module,
    state: row.state as BreakerState,
    trip: getTrip(row.module),
  }));
}
