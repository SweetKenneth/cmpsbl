/**
 * ACCESS Ultimate — System 9: Gateway Circuit Breaker
 * 
 * Per-developer circuit breaker, global gateway health,
 * graceful degradation, retry-after generation, and health probes.
 * 
 * @module access/ultimate/gatewayCircuitBreaker
 */

// ── Types ────────────────────────────────────────────────────────

export type BreakerState = 'closed' | 'open' | 'half_open';
export type DegradationLevel = 'none' | 'L1' | 'L2' | 'L3' | 'L4';

export interface CircuitBreaker {
  id: string;
  keyId: string;
  state: BreakerState;
  failureCount: number;
  successCount: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  openedAt: number | null;
  halfOpenAt: number | null;
  tripThreshold: number;
  recoveryMs: number;
  halfOpenMaxRequests: number;
  halfOpenSuccesses: number;
}

export interface GatewayHealth {
  overall: BreakerState;
  degradationLevel: DegradationLevel;
  activeBreakers: number;
  openBreakers: number;
  halfOpenBreakers: number;
  closedBreakers: number;
  globalErrorRate: number;
  globalSuccessRate: number;
}

export interface RetryAfterInfo {
  retryAfterMs: number;
  retryAfterDate: string;
  jitterMs: number;
}

export interface GatewayBreakerStats {
  totalBreakers: number;
  openBreakers: number;
  totalTrips: number;
  totalRecoveries: number;
  degradationLevel: DegradationLevel;
  globalErrorRate: number;
}

// ── Constants ────────────────────────────────────────────────────

const DEFAULT_TRIP_THRESHOLD = 5;
const DEFAULT_RECOVERY_MS = 30_000;
const DEFAULT_HALF_OPEN_MAX = 3;
const MAX_BREAKERS = 2000;

// ── State ────────────────────────────────────────────────────────

const breakers: Map<string, CircuitBreaker> = new Map();
let totalTrips = 0;
let totalRecoveries = 0;
let globalSuccesses = 0;
let globalFailures = 0;

// ── Core API ────────────────────────────────────────────────────

/** Get or create a circuit breaker for a key */
export function getBreaker(keyId: string): CircuitBreaker {
  if (!breakers.has(keyId)) {
    const breaker: CircuitBreaker = {
      id: `cb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      keyId, state: 'closed',
      failureCount: 0, successCount: 0,
      lastFailureAt: null, lastSuccessAt: null,
      openedAt: null, halfOpenAt: null,
      tripThreshold: DEFAULT_TRIP_THRESHOLD,
      recoveryMs: DEFAULT_RECOVERY_MS,
      halfOpenMaxRequests: DEFAULT_HALF_OPEN_MAX,
      halfOpenSuccesses: 0,
    };
    breakers.set(keyId, breaker);
    if (breakers.size > MAX_BREAKERS) evictClosed();
  }
  return breakers.get(keyId)!;
}

/** Record a successful request */
export function recordSuccess(keyId: string): void {
  const breaker = getBreaker(keyId);
  globalSuccesses++;
  breaker.lastSuccessAt = Date.now();

  switch (breaker.state) {
    case 'closed':
      breaker.successCount++;
      breaker.failureCount = Math.max(0, breaker.failureCount - 1); // Decay failures
      break;
    case 'half_open':
      breaker.halfOpenSuccesses++;
      if (breaker.halfOpenSuccesses >= breaker.halfOpenMaxRequests) {
        // Recovery complete
        breaker.state = 'closed';
        breaker.failureCount = 0;
        breaker.halfOpenSuccesses = 0;
        totalRecoveries++;
      }
      break;
    case 'open':
      // Shouldn't happen, but handle gracefully
      break;
  }
}

/** Record a failed request */
export function recordFailure(keyId: string): void {
  const breaker = getBreaker(keyId);
  globalFailures++;
  breaker.failureCount++;
  breaker.lastFailureAt = Date.now();

  switch (breaker.state) {
    case 'closed':
      if (breaker.failureCount >= breaker.tripThreshold) {
        breaker.state = 'open';
        breaker.openedAt = Date.now();
        totalTrips++;
      }
      break;
    case 'half_open':
      // Failed during probe — reopen
      breaker.state = 'open';
      breaker.openedAt = Date.now();
      breaker.halfOpenSuccesses = 0;
      totalTrips++;
      break;
    case 'open':
      // Already open
      break;
  }
}

/** Check if a request should be allowed */
export function shouldAllowRequest(keyId: string): { allowed: boolean; retryAfter?: RetryAfterInfo } {
  const breaker = getBreaker(keyId);

  switch (breaker.state) {
    case 'closed':
      return { allowed: true };

    case 'open': {
      // Check if recovery time has passed
      if (breaker.openedAt && Date.now() - breaker.openedAt >= breaker.recoveryMs) {
        breaker.state = 'half_open';
        breaker.halfOpenAt = Date.now();
        breaker.halfOpenSuccesses = 0;
        return { allowed: true }; // Allow probe request
      }
      return {
        allowed: false,
        retryAfter: generateRetryAfter(breaker),
      };
    }

    case 'half_open':
      // Allow limited probe requests
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

/** Generate retry-after with jitter */
function generateRetryAfter(breaker: CircuitBreaker): RetryAfterInfo {
  const baseMs = breaker.openedAt
    ? breaker.recoveryMs - (Date.now() - breaker.openedAt)
    : breaker.recoveryMs;
  const jitterMs = Math.floor(Math.random() * 5000); // 0-5s jitter
  const retryAfterMs = Math.max(1000, baseMs + jitterMs);

  return {
    retryAfterMs,
    retryAfterDate: new Date(Date.now() + retryAfterMs).toISOString(),
    jitterMs,
  };
}

/** Get global gateway health assessment */
export function getGatewayHealth(): GatewayHealth {
  const all = [...breakers.values()];
  const openCount = all.filter(b => b.state === 'open').length;
  const halfOpenCount = all.filter(b => b.state === 'half_open').length;
  const closedCount = all.filter(b => b.state === 'closed').length;
  const total = globalSuccesses + globalFailures;
  const errorRate = total > 0 ? globalFailures / total : 0;

  // Determine degradation level
  let degradationLevel: DegradationLevel = 'none';
  const openPercent = all.length > 0 ? openCount / all.length : 0;
  if (openPercent > 0.5) degradationLevel = 'L4';
  else if (openPercent > 0.3) degradationLevel = 'L3';
  else if (openPercent > 0.15) degradationLevel = 'L2';
  else if (openPercent > 0.05) degradationLevel = 'L1';

  // Determine overall state
  let overall: BreakerState = 'closed';
  if (openCount > all.length * 0.3) overall = 'open';
  else if (openCount > 0 || halfOpenCount > 0) overall = 'half_open';

  return {
    overall, degradationLevel,
    activeBreakers: all.length,
    openBreakers: openCount,
    halfOpenBreakers: halfOpenCount,
    closedBreakers: closedCount,
    globalErrorRate: Math.round(errorRate * 1000) / 1000,
    globalSuccessRate: Math.round((1 - errorRate) * 1000) / 1000,
  };
}

/** Force reset a breaker */
export function resetBreaker(keyId: string): boolean {
  const breaker = breakers.get(keyId);
  if (!breaker) return false;
  breaker.state = 'closed';
  breaker.failureCount = 0;
  breaker.halfOpenSuccesses = 0;
  totalRecoveries++;
  return true;
}

function evictClosed(): void {
  for (const [key, b] of breakers) {
    if (b.state === 'closed' && b.failureCount === 0) {
      breakers.delete(key);
      return;
    }
  }
}

// ── Stats ────────────────────────────────────────────────────────

export function getGatewayBreakerStats(): GatewayBreakerStats {
  const health = getGatewayHealth();
  return {
    totalBreakers: breakers.size,
    openBreakers: health.openBreakers,
    totalTrips,
    totalRecoveries,
    degradationLevel: health.degradationLevel,
    globalErrorRate: health.globalErrorRate,
  };
}

export function resetGatewayBreakers(): void {
  breakers.clear();
  totalTrips = 0;
  totalRecoveries = 0;
  globalSuccesses = 0;
  globalFailures = 0;
}
