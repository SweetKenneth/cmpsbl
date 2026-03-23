/**
 * CORE — Circuit Breaker Registry
 * Centralized breaker states per module:
 * closed → open → half-open → closed
 * Ultimate Form v1.0.0
 */

export type BreakerState = 'closed' | 'open' | 'half_open';

export interface CircuitBreaker {
  moduleId: string;
  state: BreakerState;
  failureCount: number;
  successCount: number;
  lastFailure: string | null;
  lastSuccess: string | null;
  openedAt: string | null;
  halfOpenAt: string | null;
  tripCount: number;       // Total times tripped
  recoveryCount: number;   // Total times recovered
}

export interface BreakerConfig {
  failureThreshold: number;    // Failures before trip (default: 5)
  successThreshold: number;    // Successes in half-open before close (default: 3)
  resetTimeoutMs: number;      // Time before half-open attempt (default: 30s)
}

const DEFAULT_CONFIG: BreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  resetTimeoutMs: 30_000,
};

const breakers = new Map<string, CircuitBreaker>();
const configs = new Map<string, BreakerConfig>();

type BreakerCallback = (moduleId: string, from: BreakerState, to: BreakerState) => void;
const listeners: BreakerCallback[] = [];

/**
 * Register a circuit breaker for a module.
 */
export function registerBreaker(moduleId: string, config?: Partial<BreakerConfig>): CircuitBreaker {
  const breaker: CircuitBreaker = {
    moduleId,
    state: 'closed',
    failureCount: 0,
    successCount: 0,
    lastFailure: null,
    lastSuccess: null,
    openedAt: null,
    halfOpenAt: null,
    tripCount: 0,
    recoveryCount: 0,
  };
  breakers.set(moduleId, breaker);
  configs.set(moduleId, { ...DEFAULT_CONFIG, ...config });
  return breaker;
}

/**
 * Record a failure for a module's breaker.
 */
export function recordFailure(moduleId: string): BreakerState {
  const breaker = breakers.get(moduleId);
  const config = configs.get(moduleId) || DEFAULT_CONFIG;
  if (!breaker) return 'closed';

  breaker.failureCount++;
  breaker.lastFailure = new Date().toISOString();
  breaker.successCount = 0;

  if (breaker.state === 'half_open') {
    // Failure in half-open → reopen
    transitionBreaker(breaker, 'open');
  } else if (breaker.state === 'closed' && breaker.failureCount >= config.failureThreshold) {
    transitionBreaker(breaker, 'open');
    breaker.tripCount++;
  }

  return breaker.state;
}

/**
 * Record a success for a module's breaker.
 */
export function recordSuccess(moduleId: string): BreakerState {
  const breaker = breakers.get(moduleId);
  const config = configs.get(moduleId) || DEFAULT_CONFIG;
  if (!breaker) return 'closed';

  breaker.successCount++;
  breaker.lastSuccess = new Date().toISOString();

  if (breaker.state === 'half_open' && breaker.successCount >= config.successThreshold) {
    transitionBreaker(breaker, 'closed');
    breaker.failureCount = 0;
    breaker.recoveryCount++;
  }

  return breaker.state;
}

/**
 * Check if a module's breaker allows execution.
 */
export function isAllowed(moduleId: string): boolean {
  const breaker = breakers.get(moduleId);
  if (!breaker) return true; // No breaker = allow

  if (breaker.state === 'closed') return true;

  if (breaker.state === 'open') {
    const config = configs.get(moduleId) || DEFAULT_CONFIG;
    if (breaker.openedAt) {
      const elapsed = Date.now() - new Date(breaker.openedAt).getTime();
      if (elapsed >= config.resetTimeoutMs) {
        transitionBreaker(breaker, 'half_open');
        return true;
      }
    }
    return false;
  }

  // half_open — allow limited requests
  return true;
}

function transitionBreaker(breaker: CircuitBreaker, to: BreakerState): void {
  const from = breaker.state;
  breaker.state = to;

  if (to === 'open') breaker.openedAt = new Date().toISOString();
  if (to === 'half_open') breaker.halfOpenAt = new Date().toISOString();

  for (const cb of listeners) {
    try { cb(breaker.moduleId, from, to); } catch { /* no-op */ }
  }
}

export function onBreakerChange(cb: BreakerCallback): () => void {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getBreakerState(moduleId: string): CircuitBreaker | undefined {
  return breakers.get(moduleId);
}

export function getAllBreakers(): CircuitBreaker[] {
  return Array.from(breakers.values());
}

export function getOpenBreakers(): CircuitBreaker[] {
  return Array.from(breakers.values()).filter(b => b.state === 'open');
}

export function getTrippedCount(): number {
  return Array.from(breakers.values()).filter(b => b.state !== 'closed').length;
}

/**
 * Force-reset a breaker to closed state.
 */
export function forceReset(moduleId: string): boolean {
  const breaker = breakers.get(moduleId);
  if (!breaker) return false;
  transitionBreaker(breaker, 'closed');
  breaker.failureCount = 0;
  breaker.successCount = 0;
  return true;
}
