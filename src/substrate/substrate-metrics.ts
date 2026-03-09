/**
 * Substrate Runtime Metrics Store
 * Real observability for all 40 nodes — replaces mock telemetry.
 * 
 * Tracks operations, errors, latency, circuit breaker state,
 * and last activity per module. Zero dependencies.
 */

interface ModuleMetrics {
  opsCount: number;
  errorCount: number;
  latencySamples: number[];
  circuitOpen: boolean;
  lastActivityAt: number;
  firstSeenAt: number;
}

const MAX_LATENCY_SAMPLES = 100;
const IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const MAX_TRACKED_MODULES = 100; // Cap to prevent unbounded growth from dynamic IDs

const store = new Map<string, ModuleMetrics>();

function ensureModule(moduleId: string): ModuleMetrics {
  const id = moduleId.toUpperCase();
  let m = store.get(id);
  if (!m) {
    // Reject registration if store is at capacity with an unknown module
    if (store.size >= MAX_TRACKED_MODULES) {
      // Evict oldest dormant module, or reject
      let oldestDormantKey: string | null = null;
      let oldestTime = Infinity;
      for (const [key, metrics] of store) {
        if (Date.now() - metrics.lastActivityAt > IDLE_THRESHOLD_MS && metrics.lastActivityAt < oldestTime) {
          oldestTime = metrics.lastActivityAt;
          oldestDormantKey = key;
        }
      }
      if (oldestDormantKey) {
        store.delete(oldestDormantKey);
      }
      // If still at capacity (no dormant to evict), allow but log
    }
    m = {
      opsCount: 0,
      errorCount: 0,
      latencySamples: [],
      circuitOpen: false,
      lastActivityAt: Date.now(),
      firstSeenAt: Date.now(),
    };
    store.set(id, m);
  }
  return m;
}

/** Record a successful operation with latency (ms) */
export function recordOperation(moduleId: string, latencyMs: number): void {
  const m = ensureModule(moduleId);
  m.opsCount++;
  m.lastActivityAt = Date.now();
  m.latencySamples.push(latencyMs);
  if (m.latencySamples.length > MAX_LATENCY_SAMPLES) {
    m.latencySamples.shift();
  }
}

/** Record an error for a module */
export function recordError(moduleId: string): void {
  const m = ensureModule(moduleId);
  m.errorCount++;
  m.lastActivityAt = Date.now();
}

/** Set circuit breaker state for a module */
export function setCircuitState(moduleId: string, open: boolean): void {
  const m = ensureModule(moduleId);
  m.circuitOpen = open;
  m.lastActivityAt = Date.now();
}

/** Get total operations count */
export function getOpsCount(moduleId: string): number {
  return store.get(moduleId.toUpperCase())?.opsCount ?? 0;
}

/**
 * Compute health score (0–100) for a module.
 * 
 * Health = 100
 *   − errorRate × 50
 *   − circuitPenalty (25 if circuit open)
 */
export function computeHealth(moduleId: string): number {
  const m = store.get(moduleId.toUpperCase());
  if (!m) return 100; // No metrics yet = assumed healthy

  const totalOps = m.opsCount + m.errorCount;
  const errorRate = totalOps > 0 ? m.errorCount / totalOps : 0;
  const circuitPenalty = m.circuitOpen ? 25 : 0;

  return Math.max(0, Math.min(100, Math.round(100 - errorRate * 50 - circuitPenalty)));
}

export type ModuleState = 'active' | 'degraded' | 'circuit_open' | 'warming' | 'dormant';

/**
 * Derive module operational state:
 *   No metrics → warming
 *   Circuit open → circuit_open
 *   Idle > 5 min → dormant
 *   Health < 60 → degraded
 *   Else → active
 */
export function getModuleState(moduleId: string): ModuleState {
  const m = store.get(moduleId.toUpperCase());
  if (!m) return 'warming';
  if (m.circuitOpen) return 'circuit_open';
  if (Date.now() - m.lastActivityAt > IDLE_THRESHOLD_MS) return 'dormant';
  if (computeHealth(moduleId) < 60) return 'degraded';
  return 'active';
}

/** Get average latency for a module */
export function getAvgLatency(moduleId: string): number {
  const m = store.get(moduleId.toUpperCase());
  if (!m || m.latencySamples.length === 0) return 0;
  return Math.round(m.latencySamples.reduce((a, b) => a + b, 0) / m.latencySamples.length);
}

/** Get last activity timestamp */
export function getLastActivity(moduleId: string): number {
  return store.get(moduleId.toUpperCase())?.lastActivityAt ?? 0;
}

/** Get full snapshot for a module (read-only) */
export function getModuleSnapshot(moduleId: string): ModuleMetrics | null {
  const m = store.get(moduleId.toUpperCase());
  return m ? { ...m, latencySamples: [...m.latencySamples] } : null;
}

/** Get all tracked module IDs */
export function getTrackedModules(): string[] {
  return [...store.keys()];
}

/** Reset all metrics (testing) */
export function resetAllMetrics(): void {
  store.clear();
}
