/**
 * Hardened Circuit Breaker — Backoff/jitter + failure classification + trip cause
 */

import { classifyFailure, type ClassifiedFailure } from './classifyFailure';
import { recordTrip, clearTrip, getTrip, computeOpenDuration, type TripMetadata } from './store';

export type BreakerState = 'closed' | 'open' | 'half_open';

interface BreakerConfig {
  failureThreshold: number;   // countable failures before trip
  halfOpenMaxAttempts: number; // probes before re-closing
  windowMs: number;           // failure counting window
}

interface BreakerInstance {
  state: BreakerState;
  failures: ClassifiedFailure[];
  countableFailures: number;
  lastTrip: TripMetadata | null;
  openUntil: number;
  halfOpenAttempts: number;
  config: BreakerConfig;
}

const breakers = new Map<string, BreakerInstance>();

const DEFAULT_CONFIG: BreakerConfig = {
  failureThreshold: 5,
  halfOpenMaxAttempts: 2,
  windowMs: 30_000,
};

function getInstance(module: string): BreakerInstance {
  if (!breakers.has(module)) {
    breakers.set(module, {
      state: 'closed',
      failures: [],
      countableFailures: 0,
      lastTrip: null,
      openUntil: 0,
      halfOpenAttempts: 0,
      config: { ...DEFAULT_CONFIG },
    });
  }
  return breakers.get(module)!;
}

/** Prune old failures outside the window */
function pruneWindow(b: BreakerInstance): void {
  const cutoff = Date.now() - b.config.windowMs;
  // We track by count, not timestamps on individual failures, so we just count recent
}

/** Check if a request can proceed */
export function canExecute(module: string): boolean {
  const b = getInstance(module);

  if (b.state === 'closed') return true;

  if (b.state === 'open') {
    if (Date.now() >= b.openUntil) {
      b.state = 'half_open';
      b.halfOpenAttempts = 0;
      return true; // allow probe
    }
    return false;
  }

  // half_open: allow limited probes
  return b.halfOpenAttempts < b.config.halfOpenMaxAttempts;
}

/** Record a successful execution */
export function recordSuccess(module: string): void {
  const b = getInstance(module);
  if (b.state === 'half_open') {
    b.halfOpenAttempts++;
    if (b.halfOpenAttempts >= b.config.halfOpenMaxAttempts) {
      // All probes succeeded → close
      b.state = 'closed';
      b.countableFailures = 0;
      b.failures = [];
      clearTrip(module);
    }
  } else if (b.state === 'closed') {
    // Decay failures on success
    b.countableFailures = Math.max(0, b.countableFailures - 1);
  }
}

/** Record a failure */
export function recordFailure(
  module: string,
  error: unknown,
  downstream?: string,
  blastRadius?: number
): { tripped: boolean; classified: ClassifiedFailure; trip?: TripMetadata } {
  const b = getInstance(module);
  const classified = classifyFailure(error);

  b.failures.push(classified);
  if (b.failures.length > 50) b.failures.splice(0, b.failures.length - 50);

  // Only count countable failures toward breaker
  if (classified.class === 'ignorable') {
    return { tripped: false, classified };
  }

  b.countableFailures++;

  // Half-open failure → re-open immediately
  if (b.state === 'half_open') {
    const trip = recordTrip(module, classified.category, classified.message, downstream ?? null, blastRadius ?? 0.1);
    b.state = 'open';
    b.openUntil = Date.now() + trip.open_duration_ms;
    b.lastTrip = trip;
    return { tripped: true, classified, trip };
  }

  // Check threshold
  if (b.countableFailures >= b.config.failureThreshold) {
    const trip = recordTrip(module, classified.category, classified.message, downstream ?? null, blastRadius ?? 0.1);
    b.state = 'open';
    b.openUntil = Date.now() + trip.open_duration_ms;
    b.lastTrip = trip;
    b.countableFailures = 0;
    return { tripped: true, classified, trip };
  }

  return { tripped: false, classified };
}

/** Get breaker state for a module */
export function getState(module: string): { state: BreakerState; trip: TripMetadata | null } {
  const b = getInstance(module);
  return { state: b.state, trip: b.lastTrip };
}

/** Force reset a breaker */
export function forceReset(module: string): void {
  breakers.delete(module);
  clearTrip(module);
}

/** Get all breaker states */
export function getAllStates(): Array<{ module: string; state: BreakerState; trip: TripMetadata | null }> {
  return Array.from(breakers.entries()).map(([module, b]) => ({
    module,
    state: b.state,
    trip: b.lastTrip,
  }));
}
