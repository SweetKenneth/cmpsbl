/**
 * S-Tier 047 — Circuit Breaker Fabric
 * CJPI: 93 | Node: CORE | ID: S-117
 *
 * Distributed circuit breaker registry that coordinates breaker state
 * across all substrate nodes. Prevents cascading failures.
 */

export type BreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreaker {
  id: string;
  module: string;
  state: BreakerState;
  failureCount: number;
  successCount: number;
  lastFailure: number | null;
  lastStateChange: number;
  threshold: number;     // failures before open
  cooldownMs: number;    // time before half-open
}

const breakers = new Map<string, CircuitBreaker>();

export function createBreaker(module: string, id: string, threshold = 5, cooldownMs = 30_000): CircuitBreaker {
  const breaker: CircuitBreaker = {
    id, module, state: 'closed', failureCount: 0, successCount: 0,
    lastFailure: null, lastStateChange: Date.now(), threshold, cooldownMs,
  };
  breakers.set(id, breaker);
  return breaker;
}

export function recordSuccess(id: string): BreakerState {
  const b = breakers.get(id);
  if (!b) throw new Error(`Breaker ${id} not found`);
  b.successCount++;
  if (b.state === 'half-open') {
    b.state = 'closed';
    b.failureCount = 0;
    b.lastStateChange = Date.now();
  }
  return b.state;
}

export function recordFailure(id: string): BreakerState {
  const b = breakers.get(id);
  if (!b) throw new Error(`Breaker ${id} not found`);
  b.failureCount++;
  b.lastFailure = Date.now();
  if (b.state === 'closed' && b.failureCount >= b.threshold) {
    b.state = 'open';
    b.lastStateChange = Date.now();
  } else if (b.state === 'half-open') {
    b.state = 'open';
    b.lastStateChange = Date.now();
  }
  return b.state;
}

export function canExecute(id: string): boolean {
  const b = breakers.get(id);
  if (!b) return true;
  if (b.state === 'closed') return true;
  if (b.state === 'open' && Date.now() - b.lastStateChange >= b.cooldownMs) {
    b.state = 'half-open';
    b.lastStateChange = Date.now();
    return true;
  }
  return b.state === 'half-open';
}

export function getBreaker(id: string): CircuitBreaker | null {
  return breakers.get(id) ?? null;
}

export function getAllBreakers(): CircuitBreaker[] {
  return [...breakers.values()];
}

export function resetBreaker(id: string): void {
  const b = breakers.get(id);
  if (b) {
    b.state = 'closed';
    b.failureCount = 0;
    b.successCount = 0;
    b.lastFailure = null;
    b.lastStateChange = Date.now();
  }
}
