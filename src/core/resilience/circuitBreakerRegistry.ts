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
  successThreshold: number;    // Consecutive successes in half-open to close (default: 3)
  resetTimeoutMs: number;      // Initial half-open probe delay (default: 30s)
  maxResetTimeoutMs: number;   // Cap on exponential backoff (default: 5min)
  backoffMultiplier: number;   // Backoff growth per consecutive trip (default: 2)
  jitterRatio: number;         // 0..1 random jitter applied to backoff (default: 0.2)
  probeIntervalMs: number;     // Auto-probe cadence while open (default: 5s tick)
}

const DEFAULT_CONFIG: BreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  resetTimeoutMs: 30_000,
  maxResetTimeoutMs: 300_000,
  backoffMultiplier: 2,
  jitterRatio: 0.2,
  probeIntervalMs: 5_000,
};

const breakers = new Map<string, CircuitBreaker>();
const configs = new Map<string, BreakerConfig>();
// Per-module backoff state — exponential growth on repeated trips, decays on recovery
const backoffState = new Map<string, { currentDelayMs: number; consecutiveTrips: number }>();
// Optional probe function per module — called automatically during half-open
const probes = new Map<string, () => Promise<boolean> | boolean>();

type BreakerCallback = (moduleId: string, from: BreakerState, to: BreakerState) => void;
const listeners: BreakerCallback[] = [];

let autoHealTimer: ReturnType<typeof setInterval> | null = null;

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
  const merged = { ...DEFAULT_CONFIG, ...config };
  configs.set(moduleId, merged);
  backoffState.set(moduleId, { currentDelayMs: merged.resetTimeoutMs, consecutiveTrips: 0 });
  ensureAutoHealLoop();
  return breaker;
}

/**
 * Register an optional probe used during auto half-open transitions.
 * Probe returning true closes the breaker without external traffic.
 */
export function registerBreakerProbe(moduleId: string, probe: () => Promise<boolean> | boolean): void {
  probes.set(moduleId, probe);
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
    // Failure in half-open → reopen with exponential backoff
    growBackoff(moduleId, config);
    transitionBreaker(breaker, 'open');
  } else if (breaker.state === 'closed' && breaker.failureCount >= config.failureThreshold) {
    transitionBreaker(breaker, 'open');
    breaker.tripCount++;
    growBackoff(moduleId, config);
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
    decayBackoff(moduleId, config);
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
      const delay = backoffState.get(moduleId)?.currentDelayMs ?? config.resetTimeoutMs;
      if (elapsed >= delay) {
        transitionBreaker(breaker, 'half_open');
        return true;
      }
    }
    return false;
  }

  // half_open — allow limited probe traffic
  return true;
}

function growBackoff(moduleId: string, config: BreakerConfig): void {
  const state = backoffState.get(moduleId) ?? { currentDelayMs: config.resetTimeoutMs, consecutiveTrips: 0 };
  state.consecutiveTrips++;
  // Exponential growth with jitter, capped at maxResetTimeoutMs
  const base = Math.min(
    config.maxResetTimeoutMs,
    config.resetTimeoutMs * Math.pow(config.backoffMultiplier, Math.max(0, state.consecutiveTrips - 1))
  );
  const jitter = base * config.jitterRatio * (Math.random() * 2 - 1);
  state.currentDelayMs = Math.max(config.resetTimeoutMs, Math.round(base + jitter));
  backoffState.set(moduleId, state);
}

function decayBackoff(moduleId: string, config: BreakerConfig): void {
  backoffState.set(moduleId, { currentDelayMs: config.resetTimeoutMs, consecutiveTrips: 0 });
}

/**
 * Auto-heal loop — periodically probes open breakers and transitions them
 * through half-open → closed when health returns. No user action required.
 */
function ensureAutoHealLoop(): void {
  if (autoHealTimer) return;
  if (typeof setInterval === 'undefined') return;
  // Use the smallest probe interval across registered configs
  const tickMs = Math.max(
    1_000,
    Math.min(...Array.from(configs.values()).map(c => c.probeIntervalMs), DEFAULT_CONFIG.probeIntervalMs)
  );
  autoHealTimer = setInterval(() => { void autoHealTick(); }, tickMs);
  // Don't keep Node process alive if running server-side
  if (typeof (autoHealTimer as { unref?: () => void })?.unref === 'function') {
    (autoHealTimer as { unref: () => void }).unref();
  }
}

async function autoHealTick(): Promise<void> {
  for (const breaker of breakers.values()) {
    if (breaker.state !== 'open') continue;
    // isAllowed performs the time-based open→half_open transition
    if (!isAllowed(breaker.moduleId)) continue;
    const probe = probes.get(breaker.moduleId);
    if (!probe) continue;
    try {
      const ok = await probe();
      if (ok) recordSuccess(breaker.moduleId);
      else recordFailure(breaker.moduleId);
    } catch {
      recordFailure(breaker.moduleId);
    }
  }
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
