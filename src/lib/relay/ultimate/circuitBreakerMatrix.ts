/**
 * RELAY Ultimate — Circuit Breaker Matrix
 * Per-destination circuit breakers (5 failures → trip, 30s half-open probe).
 * Cascade detection across connected routes. Health-aware routing.
 */

export type BreakerState = 'closed' | 'open' | 'half_open';

export interface DestinationBreaker {
  destination: string;
  state: BreakerState;
  consecutiveFailures: number;
  failureThreshold: number;
  recoveryTimeoutMs: number;
  lastFailureAt?: number;
  lastSuccessAt?: number;
  trippedAt?: number;
  halfOpenAt?: number;
  totalTrips: number;
  totalSuccesses: number;
  totalFailures: number;
}

export interface CascadeAlert {
  id: string;
  affectedDestinations: string[];
  triggerDestination: string;
  severity: 'warning' | 'critical';
  detectedAt: number;
}

export interface CircuitBreakerStats {
  totalBreakers: number;
  openBreakers: number;
  halfOpenBreakers: number;
  closedBreakers: number;
  totalTrips: number;
  cascadeAlerts: number;
}

const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_RECOVERY_MS = 30_000;
const MAX_BREAKERS = 200;
const MAX_CASCADES = 100;

const breakers = new Map<string, DestinationBreaker>();
const cascadeAlerts: CascadeAlert[] = [];

export function getOrCreateBreaker(destination: string): DestinationBreaker {
  let breaker = breakers.get(destination);
  if (breaker) return breaker;

  breaker = {
    destination, state: 'closed', consecutiveFailures: 0,
    failureThreshold: DEFAULT_FAILURE_THRESHOLD,
    recoveryTimeoutMs: DEFAULT_RECOVERY_MS,
    totalTrips: 0, totalSuccesses: 0, totalFailures: 0,
  };

  if (breakers.size >= MAX_BREAKERS) {
    const oldest = [...breakers.values()]
      .filter(b => b.state === 'closed')
      .sort((a, b) => (a.lastSuccessAt ?? 0) - (b.lastSuccessAt ?? 0))[0];
    if (oldest) breakers.delete(oldest.destination);
  }
  breakers.set(destination, breaker);
  return breaker;
}

export function recordSuccess(destination: string): void {
  const b = getOrCreateBreaker(destination);
  b.consecutiveFailures = 0;
  b.lastSuccessAt = Date.now();
  b.totalSuccesses++;
  if (b.state === 'half_open') b.state = 'closed';
}

export function recordFailure(destination: string): BreakerState {
  const b = getOrCreateBreaker(destination);
  b.consecutiveFailures++;
  b.lastFailureAt = Date.now();
  b.totalFailures++;

  if (b.consecutiveFailures >= b.failureThreshold && b.state === 'closed') {
    b.state = 'open';
    b.trippedAt = Date.now();
    b.totalTrips++;
    detectCascade(destination);
  }
  return b.state;
}

export function canPass(destination: string): boolean {
  const b = breakers.get(destination);
  if (!b) return true;

  if (b.state === 'closed') return true;
  if (b.state === 'open' && b.trippedAt && Date.now() - b.trippedAt > b.recoveryTimeoutMs) {
    b.state = 'half_open';
    b.halfOpenAt = Date.now();
    return true; // Allow probe
  }
  if (b.state === 'half_open') return true;
  return false;
}

function detectCascade(triggerDest: string): void {
  const openBreakers = [...breakers.values()].filter(b => b.state === 'open');
  if (openBreakers.length >= 3) {
    const alert: CascadeAlert = {
      id: `cascade-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      affectedDestinations: openBreakers.map(b => b.destination),
      triggerDestination: triggerDest,
      severity: openBreakers.length >= 5 ? 'critical' : 'warning',
      detectedAt: Date.now(),
    };
    if (cascadeAlerts.length >= MAX_CASCADES) cascadeAlerts.shift();
    cascadeAlerts.push(alert);
  }
}

export function getDestinationHealth(destination: string): number {
  const b = breakers.get(destination);
  if (!b) return 100;
  if (b.state === 'open') return 0;
  if (b.state === 'half_open') return 30;
  const total = b.totalSuccesses + b.totalFailures;
  if (total === 0) return 100;
  return Math.round((b.totalSuccesses / total) * 100);
}

export function getCircuitBreakerStats(): CircuitBreakerStats {
  const all = [...breakers.values()];
  return {
    totalBreakers: all.length,
    openBreakers: all.filter(b => b.state === 'open').length,
    halfOpenBreakers: all.filter(b => b.state === 'half_open').length,
    closedBreakers: all.filter(b => b.state === 'closed').length,
    totalTrips: all.reduce((s, b) => s + b.totalTrips, 0),
    cascadeAlerts: cascadeAlerts.length,
  };
}

export function resetCircuitBreakerState(): void { breakers.clear(); cascadeAlerts.length = 0; }
