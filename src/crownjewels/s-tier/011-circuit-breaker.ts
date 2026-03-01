/**
 * S-Tier Crown Jewel #11 — IMMUNITY Circuit Breaker
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 11 | CJPI: 94 | Module: IMMUNITY | Type: Architecture
 *
 * Three-state circuit breaker (closed → open → half-open) with
 * configurable thresholds, exponential backoff, jitter, and
 * per-resource isolation. Prevents cascade failures.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
  maxTimeout?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  onStateChange?: (from: CircuitState, to: CircuitState, name: string) => void;
}

export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  totalCalls: number;
  lastFailureAt?: number;
  lastSuccessAt?: number;
  openedAt?: number;
  consecutiveSuccesses: number;
  currentTimeout: number;
}

export function createCircuitBreaker(name: string, config: CircuitBreakerConfig = {}) {
  const {
    failureThreshold = 5,
    successThreshold = 2,
    timeout = 30_000,
    maxTimeout = 300_000,
    backoffMultiplier = 2,
    jitter = true,
    onStateChange,
  } = config;

  let state: CircuitState = 'closed';
  let failures = 0;
  let successes = 0;
  let consecutiveSuccesses = 0;
  let totalCalls = 0;
  let lastFailureAt: number | undefined;
  let lastSuccessAt: number | undefined;
  let openedAt: number | undefined;
  let currentTimeout = timeout;

  function transition(to: CircuitState) {
    if (state === to) return;
    const from = state;
    state = to;
    if (to === 'open') {
      openedAt = Date.now();
      consecutiveSuccesses = 0;
    }
    if (to === 'closed') {
      failures = 0;
      currentTimeout = timeout;
    }
    onStateChange?.(from, to, name);
  }

  function shouldAttempt(): boolean {
    if (state === 'closed') return true;
    if (state === 'open') {
      const elapsed = Date.now() - (openedAt ?? 0);
      const jitterMs = jitter ? Math.random() * currentTimeout * 0.1 : 0;
      if (elapsed >= currentTimeout + jitterMs) {
        transition('half_open');
        return true;
      }
      return false;
    }
    return true; // half_open allows probe
  }

  function recordSuccess() {
    totalCalls++;
    successes++;
    consecutiveSuccesses++;
    lastSuccessAt = Date.now();
    if (state === 'half_open' && consecutiveSuccesses >= successThreshold) {
      transition('closed');
    }
  }

  function recordFailure() {
    totalCalls++;
    failures++;
    consecutiveSuccesses = 0;
    lastFailureAt = Date.now();
    if (state === 'half_open') {
      currentTimeout = Math.min(currentTimeout * backoffMultiplier, maxTimeout);
      transition('open');
    } else if (state === 'closed' && failures >= failureThreshold) {
      transition('open');
    }
  }

  async function call<T>(fn: () => Promise<T>): Promise<T> {
    if (!shouldAttempt()) {
      throw new Error(`[CircuitBreaker:${name}] Circuit is OPEN — call rejected`);
    }
    try {
      const result = await fn();
      recordSuccess();
      return result;
    } catch (err) {
      recordFailure();
      throw err;
    }
  }

  function reset() {
    state = 'closed';
    failures = 0;
    successes = 0;
    consecutiveSuccesses = 0;
    currentTimeout = timeout;
    openedAt = undefined;
  }

  function getStats(): CircuitStats {
    return {
      state, failures, successes, totalCalls,
      lastFailureAt, lastSuccessAt, openedAt,
      consecutiveSuccesses, currentTimeout,
    };
  }

  return { call, shouldAttempt, recordSuccess, recordFailure, reset, getStats, get state() { return state; }, get name() { return name; } };
}

// ── Multi-Resource Breaker Panel ────────────────────────────────

export function createBreakerPanel(defaults?: CircuitBreakerConfig) {
  const breakers = new Map<string, ReturnType<typeof createCircuitBreaker>>();

  function getOrCreate(name: string, config?: CircuitBreakerConfig) {
    let b = breakers.get(name);
    if (!b) { b = createCircuitBreaker(name, { ...defaults, ...config }); breakers.set(name, b); }
    return b;
  }

  function call<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return getOrCreate(name).call(fn);
  }

  function getAll(): Record<string, CircuitStats> {
    const out: Record<string, CircuitStats> = {};
    for (const [k, v] of breakers) out[k] = v.getStats();
    return out;
  }

  function getHealthy(): string[] { return [...breakers.entries()].filter(([, b]) => b.state === 'closed').map(([k]) => k); }
  function getDegraded(): string[] { return [...breakers.entries()].filter(([, b]) => b.state !== 'closed').map(([k]) => k); }

  return { getOrCreate, call, getAll, getHealthy, getDegraded };
}
