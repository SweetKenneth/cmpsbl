/**
 * Circuit Breaker Mesh
 * 
 * Per-integration circuit breakers preventing cascade failures from
 * external dependencies. CLOSED → OPEN → HALF_OPEN state machine.
 * 
 * @module integration/ultimate/circuitBreakerMesh
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreaker {
  integrationId: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  openedAt: number | null;
  halfOpenProbeAt: number | null;
  /** Fallback response to return when circuit is OPEN */
  fallbackResponse: unknown;
}

export interface CircuitConfig {
  /** Sliding window size for failure rate calculation */
  windowSize: number;
  /** Failure rate threshold (0–1) to trip the circuit */
  failureRateThreshold: number;
  /** Time in ms before moving from OPEN → HALF_OPEN */
  openDurationMs: number;
  /** Number of successful probes needed to close */
  halfOpenSuccessThreshold: number;
}

export interface CircuitBreakerHealth {
  totalCircuits: number;
  openCircuits: number;
  halfOpenCircuits: number;
  closedCircuits: number;
  cascadeAlert: boolean;
}

// ── Constants ──────────────────────────────────────────────────

const DEFAULT_CONFIG: CircuitConfig = {
  windowSize: 10,
  failureRateThreshold: 0.50,
  openDurationMs: 30_000,
  halfOpenSuccessThreshold: 2,
};

const CASCADE_ALERT_THRESHOLD = 3; // # of simultaneous open circuits

// ── State ──────────────────────────────────────────────────────

const circuits = new Map<string, CircuitBreaker>();
const configs = new Map<string, CircuitConfig>();
const recentResults = new Map<string, Array<{ success: boolean; timestamp: number }>>();

// ── Core ───────────────────────────────────────────────────────

/** Get or create a circuit breaker for an integration */
export function getCircuit(integrationId: string): CircuitBreaker {
  let circuit = circuits.get(integrationId);
  if (!circuit) {
    circuit = {
      integrationId, state: 'CLOSED',
      failureCount: 0, successCount: 0,
      lastFailureAt: null, lastSuccessAt: null,
      openedAt: null, halfOpenProbeAt: null,
      fallbackResponse: null,
    };
    circuits.set(integrationId, circuit);
    recentResults.set(integrationId, []);
  }
  return circuit;
}

/** Check if a request should be allowed through */
export function canExecute(integrationId: string): { allowed: boolean; state: CircuitState; fallback: unknown } {
  const circuit = getCircuit(integrationId);
  const cfg = configs.get(integrationId) ?? DEFAULT_CONFIG;
  const now = Date.now();

  if (circuit.state === 'CLOSED') {
    return { allowed: true, state: 'CLOSED', fallback: null };
  }

  if (circuit.state === 'OPEN') {
    // Check if we should move to HALF_OPEN
    if (circuit.openedAt && (now - circuit.openedAt) >= cfg.openDurationMs) {
      circuit.state = 'HALF_OPEN';
      circuit.halfOpenProbeAt = now;
      return { allowed: true, state: 'HALF_OPEN', fallback: null };
    }
    return { allowed: false, state: 'OPEN', fallback: circuit.fallbackResponse };
  }

  // HALF_OPEN — allow probe requests
  return { allowed: true, state: 'HALF_OPEN', fallback: null };
}

/** Record a request result */
export function recordResult(integrationId: string, success: boolean): void {
  const circuit = getCircuit(integrationId);
  const cfg = configs.get(integrationId) ?? DEFAULT_CONFIG;
  const now = Date.now();
  const results = recentResults.get(integrationId) ?? [];

  results.push({ success, timestamp: now });
  // Keep only window size
  while (results.length > cfg.windowSize) results.shift();
  recentResults.set(integrationId, results);

  if (success) {
    circuit.successCount++;
    circuit.lastSuccessAt = now;

    if (circuit.state === 'HALF_OPEN') {
      const recentSuccesses = results.filter(r => r.success).length;
      if (recentSuccesses >= cfg.halfOpenSuccessThreshold) {
        circuit.state = 'CLOSED';
        circuit.failureCount = 0;
        circuit.openedAt = null;
      }
    }
  } else {
    circuit.failureCount++;
    circuit.lastFailureAt = now;

    if (circuit.state === 'HALF_OPEN') {
      // Failed during probe — back to OPEN
      circuit.state = 'OPEN';
      circuit.openedAt = now;
    } else if (circuit.state === 'CLOSED') {
      // Check failure rate
      const failureRate = results.filter(r => !r.success).length / results.length;
      if (results.length >= cfg.windowSize && failureRate >= cfg.failureRateThreshold) {
        circuit.state = 'OPEN';
        circuit.openedAt = now;
      }
    }
  }
}

/** Configure a circuit breaker */
export function configureCircuit(integrationId: string, config: Partial<CircuitConfig>): void {
  const existing = configs.get(integrationId) ?? { ...DEFAULT_CONFIG };
  configs.set(integrationId, { ...existing, ...config });
}

/** Set fallback response for an integration */
export function setFallback(integrationId: string, fallback: unknown): void {
  getCircuit(integrationId).fallbackResponse = fallback;
}

/** Force-trip a circuit (manual override) */
export function tripCircuit(integrationId: string): void {
  const circuit = getCircuit(integrationId);
  circuit.state = 'OPEN';
  circuit.openedAt = Date.now();
}

/** Force-close a circuit (manual override) */
export function closeCircuit(integrationId: string): void {
  const circuit = getCircuit(integrationId);
  circuit.state = 'CLOSED';
  circuit.failureCount = 0;
  circuit.openedAt = null;
}

export function getCircuitBreakerHealth(): CircuitBreakerHealth {
  const all = Array.from(circuits.values());
  const openCount = all.filter(c => c.state === 'OPEN').length;
  return {
    totalCircuits: all.length,
    openCircuits: openCount,
    halfOpenCircuits: all.filter(c => c.state === 'HALF_OPEN').length,
    closedCircuits: all.filter(c => c.state === 'CLOSED').length,
    cascadeAlert: openCount >= CASCADE_ALERT_THRESHOLD,
  };
}

export function resetCircuitBreakerMesh(): void {
  circuits.clear();
  configs.clear();
  recentResults.clear();
}
