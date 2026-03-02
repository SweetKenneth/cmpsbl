/**
 * Module Hardening Suite v2.0.0 — "Ironclad Expansion"
 * 
 * Unified hardening layer for all expansion modules.
 * Installs: shadow mode, health auto-restore, dead letter queue,
 * rate limiting, bulkhead isolation, state snapshots, degraded mode,
 * and hot-swap upgrade orchestration.
 * 
 * Usage: Each module calls `createModuleHardening('module_name')` at init.
 */

import { resetBreaker, getBreaker, startAutoRecovery } from '../circuit-breaker';
import { hotSwapModuleEngine, getModuleEngines, deactivateModuleEngine, type ModuleEngine } from '../infra-resilience';
import { emit } from '../events';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export interface DeadLetterEntry {
  id: string;
  module: string;
  action: string;
  payload: unknown;
  error: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface ShadowResult {
  id: string;
  module: string;
  action: string;
  shadowOutput: unknown;
  productionOutput: unknown;
  match: boolean;
  divergence: number;
  timestamp: number;
}

export interface StateSnapshot {
  id: string;
  module: string;
  state: unknown;
  hash: string;
  timestamp: number;
}

export interface RateLimitBucket {
  module: string;
  tokens: number;
  maxTokens: number;
  refillRate: number;        // tokens per second
  lastRefill: number;
}

export interface BulkheadSlot {
  module: string;
  maxConcurrent: number;
  active: number;
  queued: number;
  rejected: number;
}

export interface ModuleHardeningState {
  module: string;
  shadowMode: boolean;
  degradedMode: boolean;
  dlq: DeadLetterEntry[];
  shadowResults: ShadowResult[];
  snapshots: StateSnapshot[];
  rateLimiter: RateLimitBucket;
  bulkhead: BulkheadSlot;
  autoRestoreEnabled: boolean;
  autoRestoreIntervalId: ReturnType<typeof setInterval> | null;
  healthRestoreThreshold: number;
  consecutiveFailures: number;
  totalRestores: number;
}

export interface ModuleHardening {
  state: ModuleHardeningState;

  // Dead Letter Queue
  pushToDLQ: (action: string, payload: unknown, error: string) => DeadLetterEntry;
  retryDLQ: (entryId: string, executor: (payload: unknown) => unknown) => boolean;
  drainDLQ: () => DeadLetterEntry[];
  getDLQSize: () => number;

  // Shadow Mode
  enableShadow: () => void;
  disableShadow: () => void;
  runShadow: <T>(action: string, productionFn: () => T, shadowFn: () => T) => T;

  // State Snapshots
  snapshot: (currentState: unknown) => StateSnapshot;
  restore: (snapshotId: string) => StateSnapshot | null;
  getLatestSnapshot: () => StateSnapshot | null;

  // Rate Limiting
  tryAcquire: () => boolean;
  getRateLimitStatus: () => { allowed: boolean; remaining: number; resetInMs: number };

  // Bulkhead
  enterBulkhead: () => boolean;
  exitBulkhead: () => void;
  getBulkheadStatus: () => BulkheadSlot;

  // Degraded Mode
  enterDegraded: (reason: string) => void;
  exitDegraded: () => void;
  isDegraded: () => boolean;

  // Health Auto-Restore
  startAutoRestore: (healthFn: () => number, restoreFn: () => void, intervalMs?: number) => void;
  stopAutoRestore: () => void;

  // Hot-Swap
  upgradeEngine: (currentEngine: ModuleEngine, newVersion: string) => ModuleEngine;

  // Full Report
  getHardeningReport: () => Record<string, unknown>;

  // Cleanup
  destroy: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// Factory
// ═══════════════════════════════════════════════════════════════════

const MAX_DLQ = 100;
const MAX_SHADOWS = 50;
const MAX_SNAPSHOTS = 20;

const registry = new Map<string, ModuleHardening>();

export function createModuleHardening(module: string, opts?: {
  maxConcurrent?: number;
  rateLimit?: number;       // max calls per second
  healthThreshold?: number; // auto-restore triggers below this
}): ModuleHardening {
  // Return existing if already created
  if (registry.has(module)) return registry.get(module)!;

  const hardeningState: ModuleHardeningState = {
    module,
    shadowMode: false,
    degradedMode: false,
    dlq: [],
    shadowResults: [],
    snapshots: [],
    rateLimiter: {
      module,
      tokens: opts?.rateLimit ?? 100,
      maxTokens: opts?.rateLimit ?? 100,
      refillRate: opts?.rateLimit ?? 100,
      lastRefill: Date.now(),
    },
    bulkhead: {
      module,
      maxConcurrent: opts?.maxConcurrent ?? 10,
      active: 0,
      queued: 0,
      rejected: 0,
    },
    autoRestoreEnabled: false,
    autoRestoreIntervalId: null,
    healthRestoreThreshold: opts?.healthThreshold ?? 40,
    consecutiveFailures: 0,
    totalRestores: 0,
  };

  // ── Helpers ──────────────────────────────────────────────

  function simpleHash(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return `snap-${Math.abs(hash).toString(16)}`;
  }

  function refillTokens(): void {
    const now = Date.now();
    const elapsed = (now - hardeningState.rateLimiter.lastRefill) / 1000;
    const refill = elapsed * hardeningState.rateLimiter.refillRate;
    hardeningState.rateLimiter.tokens = Math.min(
      hardeningState.rateLimiter.maxTokens,
      hardeningState.rateLimiter.tokens + refill
    );
    hardeningState.rateLimiter.lastRefill = now;
  }

  // ── API ──────────────────────────────────────────────────

  const hardening: ModuleHardening = {
    state: hardeningState,

    // Dead Letter Queue
    pushToDLQ(action, payload, error) {
      const entry: DeadLetterEntry = {
        id: `dlq-${module}-${Date.now()}-${hardeningState.dlq.length}`,
        module, action, payload, error,
        timestamp: Date.now(), retryCount: 0, maxRetries: 3,
      };
      if (hardeningState.dlq.length >= MAX_DLQ) hardeningState.dlq.shift();
      hardeningState.dlq.push(entry);
      emit({ module, event_type: 'dlq_push', outcome: 'failed', data: { action, error: error.slice(0, 200) } });
      return entry;
    },

    retryDLQ(entryId, executor) {
      const entry = hardeningState.dlq.find(e => e.id === entryId);
      if (!entry || entry.retryCount >= entry.maxRetries) return false;
      try {
        executor(entry.payload);
        hardeningState.dlq = hardeningState.dlq.filter(e => e.id !== entryId);
        emit({ module, event_type: 'dlq_retry_success', outcome: 'succeeded', data: { entryId } });
        return true;
      } catch {
        entry.retryCount++;
        return false;
      }
    },

    drainDLQ() {
      const drained = [...hardeningState.dlq];
      hardeningState.dlq = [];
      return drained;
    },

    getDLQSize: () => hardeningState.dlq.length,

    // Shadow Mode
    enableShadow() {
      hardeningState.shadowMode = true;
      emit({ module, event_type: 'shadow_enabled', outcome: 'succeeded', data: {} });
    },

    disableShadow() {
      hardeningState.shadowMode = false;
    },

    runShadow<T>(action: string, productionFn: () => T, shadowFn: () => T): T {
      const prodResult = productionFn();
      if (hardeningState.shadowMode) {
        try {
          const shadowResult = shadowFn();
          const match = JSON.stringify(prodResult) === JSON.stringify(shadowResult);
          const result: ShadowResult = {
            id: `shadow-${Date.now()}`, module, action,
            shadowOutput: shadowResult, productionOutput: prodResult,
            match, divergence: match ? 0 : 1, timestamp: Date.now(),
          };
          if (hardeningState.shadowResults.length >= MAX_SHADOWS) hardeningState.shadowResults.shift();
          hardeningState.shadowResults.push(result);
          if (!match) {
            emit({ module, event_type: 'shadow_divergence', outcome: 'failed', data: { action, divergence: 1 } });
          }
        } catch (err) {
          emit({ module, event_type: 'shadow_error', outcome: 'failed', data: { action, error: String(err) } });
        }
      }
      return prodResult;
    },

    // State Snapshots
    snapshot(currentState) {
      const snap: StateSnapshot = {
        id: `snap-${module}-${Date.now()}`,
        module,
        state: JSON.parse(JSON.stringify(currentState)),
        hash: simpleHash(currentState),
        timestamp: Date.now(),
      };
      if (hardeningState.snapshots.length >= MAX_SNAPSHOTS) hardeningState.snapshots.shift();
      hardeningState.snapshots.push(snap);
      return snap;
    },

    restore(snapshotId) {
      const snap = hardeningState.snapshots.find(s => s.id === snapshotId);
      if (snap) {
        emit({ module, event_type: 'state_restored', outcome: 'succeeded', data: { snapshotId, hash: snap.hash } });
      }
      return snap ?? null;
    },

    getLatestSnapshot() {
      return hardeningState.snapshots.length > 0
        ? hardeningState.snapshots[hardeningState.snapshots.length - 1]
        : null;
    },

    // Rate Limiting
    tryAcquire() {
      refillTokens();
      if (hardeningState.rateLimiter.tokens >= 1) {
        hardeningState.rateLimiter.tokens--;
        return true;
      }
      emit({ module, event_type: 'rate_limited', outcome: 'failed', data: { remaining: 0 } });
      return false;
    },

    getRateLimitStatus() {
      refillTokens();
      const remaining = Math.floor(hardeningState.rateLimiter.tokens);
      const resetInMs = remaining <= 0
        ? Math.ceil((1 - hardeningState.rateLimiter.tokens) / hardeningState.rateLimiter.refillRate * 1000)
        : 0;
      return { allowed: remaining > 0, remaining, resetInMs };
    },

    // Bulkhead
    enterBulkhead() {
      if (hardeningState.bulkhead.active >= hardeningState.bulkhead.maxConcurrent) {
        hardeningState.bulkhead.rejected++;
        emit({ module, event_type: 'bulkhead_rejected', outcome: 'failed', data: { active: hardeningState.bulkhead.active } });
        return false;
      }
      hardeningState.bulkhead.active++;
      return true;
    },

    exitBulkhead() {
      hardeningState.bulkhead.active = Math.max(0, hardeningState.bulkhead.active - 1);
    },

    getBulkheadStatus: () => ({ ...hardeningState.bulkhead }),

    // Degraded Mode
    enterDegraded(reason) {
      hardeningState.degradedMode = true;
      emit({ module, event_type: 'degraded_mode_entered', outcome: 'failed', data: { reason } });
    },

    exitDegraded() {
      hardeningState.degradedMode = false;
      emit({ module, event_type: 'degraded_mode_exited', outcome: 'succeeded', data: {} });
    },

    isDegraded: () => hardeningState.degradedMode,

    // Health Auto-Restore
    startAutoRestore(healthFn, restoreFn, intervalMs = 30_000) {
      if (hardeningState.autoRestoreIntervalId) return;
      hardeningState.autoRestoreEnabled = true;

      hardeningState.autoRestoreIntervalId = setInterval(() => {
        try {
          const health = healthFn();
          if (health < hardeningState.healthRestoreThreshold) {
            hardeningState.consecutiveFailures++;

            // Auto-restore: reset circuit breaker + run restore function
            if (hardeningState.consecutiveFailures >= 3) {
              resetBreaker(module);
              restoreFn();
              hardeningState.totalRestores++;
              hardeningState.consecutiveFailures = 0;
              hardeningState.degradedMode = false;
              emit({
                module,
                event_type: 'auto_restore_triggered',
                outcome: 'succeeded',
                data: { health, threshold: hardeningState.healthRestoreThreshold, totalRestores: hardeningState.totalRestores },
              });
            } else {
              // Enter degraded mode as early warning
              if (!hardeningState.degradedMode) {
                hardeningState.degradedMode = true;
                emit({ module, event_type: 'health_degraded', outcome: 'failed', data: { health, consecutive: hardeningState.consecutiveFailures } });
              }
            }
          } else {
            // Health is good — reset counters
            if (hardeningState.consecutiveFailures > 0) {
              hardeningState.consecutiveFailures = 0;
            }
            if (hardeningState.degradedMode) {
              hardeningState.degradedMode = false;
              emit({ module, event_type: 'health_recovered', outcome: 'succeeded', data: { health } });
            }
          }
        } catch {
          // Health check itself failed — don't crash the interval
        }
      }, intervalMs);

      emit({ module, event_type: 'auto_restore_started', outcome: 'succeeded', data: { intervalMs } });
    },

    stopAutoRestore() {
      if (hardeningState.autoRestoreIntervalId) {
        clearInterval(hardeningState.autoRestoreIntervalId);
        hardeningState.autoRestoreIntervalId = null;
        hardeningState.autoRestoreEnabled = false;
      }
    },

    // Hot-Swap
    upgradeEngine(currentEngine, newVersion) {
      const newEngine = hotSwapModuleEngine(module, currentEngine.instance.id, newVersion);
      emit({ module, event_type: 'engine_upgraded', outcome: 'succeeded', data: { from: currentEngine.instance.version, to: newVersion } });
      return newEngine;
    },

    // Full Report
    getHardeningReport() {
      const breaker = getBreaker(module);
      return {
        module,
        hardeningVersion: '2.0.0',
        circuitBreaker: { state: breaker.state, failures: breaker.failures, trips: breaker.totalTrips },
        shadowMode: hardeningState.shadowMode,
        shadowDivergences: hardeningState.shadowResults.filter(s => !s.match).length,
        degradedMode: hardeningState.degradedMode,
        dlqSize: hardeningState.dlq.length,
        dlqMaxRetries: hardeningState.dlq.filter(e => e.retryCount >= e.maxRetries).length,
        snapshots: hardeningState.snapshots.length,
        rateLimiter: { remaining: Math.floor(hardeningState.rateLimiter.tokens), max: hardeningState.rateLimiter.maxTokens },
        bulkhead: { active: hardeningState.bulkhead.active, max: hardeningState.bulkhead.maxConcurrent, rejected: hardeningState.bulkhead.rejected },
        autoRestore: { enabled: hardeningState.autoRestoreEnabled, totalRestores: hardeningState.totalRestores, consecutiveFailures: hardeningState.consecutiveFailures },
        engines: getModuleEngines(module).map(e => ({ id: e.id, version: e.version, phase: e.phase })),
        timestamp: new Date().toISOString(),
      };
    },

    // Cleanup
    destroy() {
      hardening.stopAutoRestore();
      registry.delete(module);
    },
  };

  registry.set(module, hardening);
  return hardening;
}

// ═══════════════════════════════════════════════════════════════════
// Registry
// ═══════════════════════════════════════════════════════════════════

export function getModuleHardening(module: string): ModuleHardening | undefined {
  return registry.get(module);
}

export function getAllHardeningReports(): Record<string, unknown>[] {
  return Array.from(registry.values()).map(h => h.getHardeningReport());
}

export function getHardenedModules(): string[] {
  return Array.from(registry.keys());
}

/**
 * Initialize global auto-recovery for all circuit breakers.
 * Called once at substrate boot.
 */
export function initGlobalAutoRecovery(intervalMs: number = 30_000): void {
  startAutoRecovery(intervalMs);
}

// ═══════════════════════════════════════════════════════════════════
// Original Modules Retrofit — Re-exports
// ═══════════════════════════════════════════════════════════════════

export {
  retrofitOriginalModules,
  getOriginalModuleHardening,
  isRetrofitComplete,
  getModuleProfile,
  getAllModuleProfiles,
  getRetrofitSummary,
  teardownRetrofit,
} from './original-modules-retrofit';
