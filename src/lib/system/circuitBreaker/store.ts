/**
 * Circuit Breaker Trip Store — Persists trip metadata + backoff state
 */

export interface TripMetadata {
  module: string;
  trip_cause: string;
  last_error_signature: string;
  downstream_service: string | null;
  estimated_blast_radius: number;  // 0–1
  tripped_at: string;
  consecutive_trips: number;
  open_duration_ms: number;
  backoff_multiplier: number;
}

const trips = new Map<string, TripMetadata>();

const BASE_OPEN_DURATION_MS = 5_000;
const MAX_OPEN_DURATION_MS = 15 * 60 * 1000; // 15 minutes cap
const BACKOFF_BASE = 2;

/** Add jitter to a duration (±25%) */
function withJitter(ms: number): number {
  const jitter = 0.75 + Math.random() * 0.5; // 0.75–1.25
  return Math.round(ms * jitter);
}

/** Compute open duration with exponential backoff + jitter */
export function computeOpenDuration(consecutiveTrips: number): number {
  const raw = BASE_OPEN_DURATION_MS * Math.pow(BACKOFF_BASE, Math.min(consecutiveTrips, 10));
  return withJitter(Math.min(raw, MAX_OPEN_DURATION_MS));
}

/** Record a trip */
export function recordTrip(
  module: string,
  cause: string,
  errorSignature: string,
  downstream: string | null,
  blastRadius: number
): TripMetadata {
  const existing = trips.get(module);
  const consecutiveTrips = (existing?.consecutive_trips ?? 0) + 1;

  const meta: TripMetadata = {
    module,
    trip_cause: cause,
    last_error_signature: errorSignature,
    downstream_service: downstream,
    estimated_blast_radius: Math.min(blastRadius, 1),
    tripped_at: new Date().toISOString(),
    consecutive_trips: consecutiveTrips,
    open_duration_ms: computeOpenDuration(consecutiveTrips),
    backoff_multiplier: Math.pow(BACKOFF_BASE, Math.min(consecutiveTrips, 10)),
  };

  trips.set(module, meta);
  return meta;
}

/** Clear trip history for a module (on successful half-open probe) */
export function clearTrip(module: string): void {
  trips.delete(module);
}

/** Get trip metadata */
export function getTrip(module: string): TripMetadata | null {
  return trips.get(module) ?? null;
}

/** Get all active trips */
export function getAllTrips(): TripMetadata[] {
  return Array.from(trips.values());
}

/** Reset all trips */
export function resetAll(): void {
  trips.clear();
}
