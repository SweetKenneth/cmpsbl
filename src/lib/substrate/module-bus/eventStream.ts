/**
 * Substrate Event Stream — Observable stream of system activity
 * Aggregates module-bus signals for debugging and governance observability.
 *
 * Features:
 * - In-memory 500-entry ring buffer (fast + cheap)
 * - Circuit breaker for persistence failures
 * - Health scoring (0-100) with degradation tracking
 * - Optional CP-backed persistence (off by default)
 * - Deterministic index-range eviction for persisted entries
 * - Self-healing via system.heal and dashboard Auto-Heal
 */

import { subscribe, type ModuleSignal } from './index';
import { cpPut, cpDelete } from '../control-plane/adapters/queueStateAdapter';

// ═══════════════════════════════════════════════════════════════
// STREAM BUFFER
// ═══════════════════════════════════════════════════════════════

const MAX_STREAM_SIZE = 500;
const MAX_PERSISTED = 100;

// ═══════════════════════════════════════════════════════════════
// SIGNAL SALIENCE — scores each signal for discovery potential
// ═══════════════════════════════════════════════════════════════

interface SignalSalience {
  score: number;
  factors: {
    rarity: number;
    crossModule: number;
    novelty: number;
    success: number;
  };
}

const signalHistory = new Map<string, number>();

function calculateSignalSalience(signal: ModuleSignal): SignalSalience {
  const type = signal.type;
  const seen = signalHistory.get(type) || 0;
  signalHistory.set(type, seen + 1);

  const rarity = Math.max(0, 1 - (seen / 200));
  const crossModule = signal.from !== signal.to ? 1 : 0.3;
  const novelty = seen < 10 ? 1 : 0.2;
  const success = signal.payload?.success ? 1 : 0.5;

  const score =
    rarity * 0.35 +
    crossModule * 0.25 +
    novelty * 0.25 +
    success * 0.15;

  return {
    score,
    factors: { rarity, crossModule, novelty, success },
  };
}

export interface StreamEntry {
  index: number;
  signal: ModuleSignal;
  salience?: SignalSalience;
  captured_at: string;
}

const stream: StreamEntry[] = [];
let counter = 0;
let initialized = false;
let persistenceEnabled = false;

// Track min/max persisted index for deterministic eviction
let minPersistedIndex = -1;
let maxPersistedIndex = -1;

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER
// ═══════════════════════════════════════════════════════════════

interface StreamCircuitBreaker {
  state: 'closed' | 'half_open' | 'open';
  failures: number;
  lastFailure: number;
  lastSuccess: number;
  totalFailures: number;
  totalSuccesses: number;
}

const BREAKER_THRESHOLD = 5;       // failures before opening
const BREAKER_RECOVERY_MS = 30_000; // 30s recovery window
const BREAKER_HALF_OPEN_PROBE = 1;  // allow 1 probe in half-open

const breaker: StreamCircuitBreaker = {
  state: 'closed',
  failures: 0,
  lastFailure: 0,
  lastSuccess: 0,
  totalFailures: 0,
  totalSuccesses: 0,
};

function recordBreakerSuccess(): void {
  breaker.totalSuccesses++;
  breaker.lastSuccess = Date.now();
  if (breaker.state === 'half_open') {
    breaker.state = 'closed';
    breaker.failures = 0;
  }
}

function recordBreakerFailure(): void {
  breaker.failures++;
  breaker.totalFailures++;
  breaker.lastFailure = Date.now();

  if (breaker.failures >= BREAKER_THRESHOLD) {
    breaker.state = 'open';
  }
}

function shouldAllowPersistence(): boolean {
  if (breaker.state === 'closed') return true;

  if (breaker.state === 'open') {
    // Check if recovery window has passed → transition to half-open
    if (Date.now() - breaker.lastFailure >= BREAKER_RECOVERY_MS) {
      breaker.state = 'half_open';
      return true; // allow one probe
    }
    return false;
  }

  // half_open: allow limited probes
  return true;
}

function resetBreaker(): void {
  breaker.state = 'closed';
  breaker.failures = 0;
}

/** Get circuit breaker state for diagnostics */
export function getStreamBreakerState(): Readonly<StreamCircuitBreaker> {
  // Auto-transition open → half_open if recovery window passed
  if (breaker.state === 'open' && Date.now() - breaker.lastFailure >= BREAKER_RECOVERY_MS) {
    breaker.state = 'half_open';
  }
  return { ...breaker };
}

// ═══════════════════════════════════════════════════════════════
// HEALTH SCORING
// ═══════════════════════════════════════════════════════════════

interface StreamHealth {
  score: number;          // 0-100
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  droppedSignals: number; // signals lost due to errors
  lastError: string | null;
  lastErrorAt: string | null;
}

const health: StreamHealth = {
  score: 100,
  status: 'healthy',
  droppedSignals: 0,
  lastError: null,
  lastErrorAt: null,
};

function degradeHealth(amount: number, reason: string): void {
  health.score = Math.max(0, health.score - amount);
  health.droppedSignals++;
  health.lastError = reason;
  health.lastErrorAt = new Date().toISOString();
  health.status = scoreToStatus(health.score);
}

function boostHealth(amount: number): void {
  health.score = Math.min(100, health.score + amount);
  health.status = scoreToStatus(health.score);
}

function scoreToStatus(score: number): StreamHealth['status'] {
  if (breaker.state === 'open') return 'offline';
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'degraded';
  return 'critical';
}

/** Get current stream health */
export function getStreamHealth(): Readonly<StreamHealth> {
  // Recalculate status in case breaker state changed
  health.status = scoreToStatus(health.score);
  return { ...health };
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize the event stream — subscribes to all module-bus signals.
 * Safe to call multiple times (idempotent).
 */
export function initEventStream(): void {
  if (initialized) return;
  initialized = true; // Set BEFORE subscribe to prevent re-entrant init

  subscribe('system', '*', async (signal: ModuleSignal) => {
    try {
      const salience = calculateSignalSalience(signal);

      const entry: StreamEntry = {
        index: counter++,
        signal,
        salience,
        captured_at: new Date().toISOString(),
      };

      stream.push(entry);

      // High-salience signals auto-trigger discovery
      if (salience.score > 0.82) {
        import('../intent-mesh/discovery-engine')
          .then(m => m.runDiscoveryCycle({ persistResults: true }))
          .catch(() => {});
      }

      // Ring buffer — drop oldest when full
      if (stream.length > MAX_STREAM_SIZE) {
        stream.shift();
      }

      // Boost health on successful capture
      if (health.score < 100) boostHealth(0.5);

      // Optional persistence (guarded by circuit breaker)
      if (persistenceEnabled && shouldAllowPersistence()) {
        try {
          await cpPut<StreamEntry>(`bus:event:${entry.index}`, entry);
          recordBreakerSuccess();

          // Track persisted range
          if (minPersistedIndex === -1) minPersistedIndex = entry.index;
          maxPersistedIndex = entry.index;

          // Evict old persisted entries beyond cap using deterministic index range
          const persistedCount = maxPersistedIndex - minPersistedIndex + 1;
          if (persistedCount > MAX_PERSISTED && entry.index % 50 === 0) {
            const toEvict = persistedCount - MAX_PERSISTED;
            for (let i = 0; i < toEvict; i++) {
              try {
                await cpDelete(`bus:event:${minPersistedIndex + i}`);
              } catch { /* best effort */ }
            }
            minPersistedIndex += toEvict;
          }
        } catch (err) {
          recordBreakerFailure();
          const msg = err instanceof Error ? err.message : 'persistence failure';
          degradeHealth(5, msg);
          // Ring buffer still active — signal is NOT lost
        }
      }
    } catch (err) {
      // Catastrophic handler error — degrade heavily but don't crash
      const msg = err instanceof Error ? err.message : 'handler crash';
      degradeHealth(15, msg);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// HEALING
// ═══════════════════════════════════════════════════════════════

export interface StreamHealResult {
  ok: boolean;
  actions: string[];
  previousScore: number;
  newScore: number;
  breakerReset: boolean;
}

/** Heal the event stream — reset breaker, restore health, optionally reinit */
export function healStream(force = false): StreamHealResult {
  const actions: string[] = [];
  const previousScore = health.score;
  let breakerReset = false;

  // FIX #13: Capture breaker state BEFORE resetting so log is accurate
  const previousBreakerState = breaker.state;

  // Step 1: Reset circuit breaker if open/half-open
  if (previousBreakerState !== 'closed' || force) {
    resetBreaker();
    actions.push(`Circuit breaker reset (was: ${previousBreakerState})`);
    breakerReset = true;
  }

  // Step 2: Restore health score
  if (force) {
    health.score = 100;
    actions.push('Health score force-restored to 100');
  } else {
    health.score = Math.max(health.score, 80);
    actions.push(`Health score restored to ${health.score}`);
  }
  health.status = scoreToStatus(health.score);
  health.lastError = null;
  health.lastErrorAt = null;
  actions.push('Error state cleared');

  // Step 3: Reinitialize if not running
  if (!initialized) {
    initEventStream();
    actions.push('Event stream re-initialized');
  }

  // Step 4: Trim buffer if bloated (defensive)
  if (stream.length > MAX_STREAM_SIZE) {
    const trimmed = stream.length - MAX_STREAM_SIZE;
    stream.splice(0, trimmed);
    actions.push(`Buffer trimmed (removed ${trimmed} excess entries)`);
  }

  return {
    ok: true,
    actions,
    previousScore,
    newScore: health.score,
    breakerReset,
  };
}

/** Reset stream state — for testing only */
export function resetEventStream(): void {
  initialized = false;
  persistenceEnabled = false;
  stream.length = 0;
  counter = 0;
  minPersistedIndex = -1;
  maxPersistedIndex = -1;
  // Reset breaker
  breaker.state = 'closed';
  breaker.failures = 0;
  breaker.lastFailure = 0;
  breaker.lastSuccess = 0;
  breaker.totalFailures = 0;
  breaker.totalSuccesses = 0;
  // Reset health
  health.score = 100;
  health.status = 'healthy';
  health.droppedSignals = 0;
  health.lastError = null;
  health.lastErrorAt = null;
}

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE TOGGLE
// ═══════════════════════════════════════════════════════════════

/** Enable or disable CP-backed persistence for the event stream */
export function setStreamPersistence(enabled: boolean): void {
  persistenceEnabled = enabled;
}

/** Check if persistence is enabled */
export function isStreamPersistent(): boolean {
  return persistenceEnabled;
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

/** Get recent events from the stream */
export function getRecentStreamEvents(limit: number = 50): StreamEntry[] {
  return stream.slice(-limit);
}

/** Get events filtered by signal type */
export function getStreamByType(type: string, limit: number = 50): StreamEntry[] {
  return stream
    .filter(e => e.signal.type === type)
    .slice(-limit);
}

/** Get events from a specific module */
export function getStreamByModule(module: string, limit: number = 50): StreamEntry[] {
  return stream
    .filter(e => e.signal.from === module)
    .slice(-limit);
}

/** Get stream size and stats */
export function getStreamStats(): {
  total_captured: number;
  buffer_size: number;
  max_size: number;
  oldest_entry: string | null;
  newest_entry: string | null;
  initialized: boolean;
  persistence_enabled: boolean;
  persisted_range: { min: number; max: number } | null;
  health: Readonly<StreamHealth>;
  breaker: Readonly<StreamCircuitBreaker>;
} {
  return {
    total_captured: counter,
    buffer_size: stream.length,
    max_size: MAX_STREAM_SIZE,
    oldest_entry: stream.length > 0 ? stream[0].captured_at : null,
    newest_entry: stream.length > 0 ? stream[stream.length - 1].captured_at : null,
    initialized,
    persistence_enabled: persistenceEnabled,
    persisted_range: minPersistedIndex >= 0
      ? { min: minPersistedIndex, max: maxPersistedIndex }
      : null,
    health: getStreamHealth(),
    breaker: getStreamBreakerState(),
  };
}

/** Clear the stream buffer */
export function clearStream(): number {
  const cleared = stream.length;
  stream.length = 0;
  return cleared;
}
