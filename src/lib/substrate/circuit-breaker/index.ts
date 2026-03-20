/**
 * Circuit Breaker State Machine
 * Formalized open/half-open/closed states per module
 * 
 * Prevents cascading failures by tracking error rates and
 * automatically isolating unhealthy modules.
 */

export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerConfig {
  failureThreshold: number;      // failures before opening
  recoveryTimeout: number;       // ms before half-open
  halfOpenMaxAttempts: number;   // successes needed to close
  windowSize: number;            // sliding window in ms
  autoRecoveryEnabled: boolean;  // enable automatic recovery timer
  autoRecoveryIntervalMs: number; // how often to check for auto-recovery
}

export interface CircuitBreaker {
  module: string;
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastStateChange: number;
  totalTrips: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 30_000,
  halfOpenMaxAttempts: 3,
  windowSize: 60_000,
  autoRecoveryEnabled: true,
  autoRecoveryIntervalMs: 60_000, // check every 60s
};

const breakers = new Map<string, CircuitBreaker>();
const configs = new Map<string, CircuitBreakerConfig>();

export function getBreaker(module: string): CircuitBreaker {
  if (!breakers.has(module)) {
    breakers.set(module, {
      module,
      state: 'closed',
      failures: 0,
      successes: 0,
      lastFailure: null,
      lastStateChange: Date.now(),
      totalTrips: 0,
    });
  }
  return breakers.get(module)!;
}

export function configureBreaker(module: string, config: Partial<CircuitBreakerConfig>) {
  configs.set(module, { ...DEFAULT_CONFIG, ...config });
}

function getConfig(module: string): CircuitBreakerConfig {
  return configs.get(module) || DEFAULT_CONFIG;
}

function transition(breaker: CircuitBreaker, newState: CircuitState) {
  if (breaker.state === newState) return;
  const prev = breaker.state;
  breaker.state = newState;
  breaker.lastStateChange = Date.now();
  if (newState === 'open') breaker.totalTrips++;
  console.log(`[circuit-breaker] ${breaker.module}: ${prev} → ${newState} (trips: ${breaker.totalTrips})`);
}

export function recordSuccess(module: string): void {
  const b = getBreaker(module);
  const cfg = getConfig(module);

  if (b.state === 'half_open') {
    b.successes++;
    if (b.successes >= cfg.halfOpenMaxAttempts) {
      b.failures = 0;
      b.successes = 0;
      transition(b, 'closed');
    }
  } else if (b.state === 'closed') {
    // Reset failure count on success within window
    b.failures = Math.max(0, b.failures - 1);
  }
}

export function recordFailure(module: string): void {
  const b = getBreaker(module);
  const cfg = getConfig(module);

  b.failures++;
  b.lastFailure = Date.now();

  if (b.state === 'half_open') {
    b.successes = 0;
    transition(b, 'open');
  } else if (b.state === 'closed' && b.failures >= cfg.failureThreshold) {
    transition(b, 'open');
  }
}

/** Check if module is allowed to execute */
export function canExecute(module: string): boolean {
  const b = getBreaker(module);
  const cfg = getConfig(module);

  if (b.state === 'closed') return true;

  if (b.state === 'open') {
    const elapsed = Date.now() - b.lastStateChange;
    if (elapsed >= cfg.recoveryTimeout) {
      transition(b, 'half_open');
      b.successes = 0;
      return true; // Allow probe request
    }
    return false;
  }

  // half_open — allow limited requests
  return true;
}

/** Execute with circuit breaker protection + timeout guard */
export async function withCircuitBreaker<T>(
  module: string,
  fn: () => Promise<T>,
  timeoutMs = 30_000
): Promise<T> {
  if (!canExecute(module)) {
    throw new Error(`[circuit-breaker] ${module} circuit is OPEN — request rejected`);
  }

  try {
    // Race the operation against a timeout
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`[circuit-breaker] ${module} operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    
    const result = await Promise.race([fn(), timeout]).finally(() => clearTimeout(timer!));
    recordSuccess(module);
    return result;
  } catch (err) {
    recordFailure(module);
    throw err;
  }
}

/** Get all breaker states */
export function getAllBreakerStates(): CircuitBreaker[] {
  return Array.from(breakers.values());
}

/** Force-reset a breaker */
export function resetBreaker(module: string): void {
  const b = getBreaker(module);
  b.failures = 0;
  b.successes = 0;
  transition(b, 'closed');
}

/** Get health summary */
export function getCircuitBreakerSummary() {
  const all = getAllBreakerStates();
  return {
    total: all.length,
    closed: all.filter(b => b.state === 'closed').length,
    open: all.filter(b => b.state === 'open').length,
    halfOpen: all.filter(b => b.state === 'half_open').length,
    totalTrips: all.reduce((s, b) => s + b.totalTrips, 0),
    unhealthy: all.filter(b => b.state !== 'closed').map(b => b.module),
    autoRecoveryActive: autoRecoveryTimer !== null,
  };
}

// ═══════════════════════════════════════════════════════════════
// AUTOMATIC CIRCUIT RECOVERY
// ═══════════════════════════════════════════════════════════════

let autoRecoveryTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start automatic recovery — periodically checks open breakers
 * and transitions them to half_open when recoveryTimeout has elapsed.
 * Reduces MTTR from hours (manual) to minutes (automatic).
 */
export function startAutoRecovery(intervalMs?: number): void {
  if (autoRecoveryTimer) return; // already running
  
  const checkInterval = intervalMs ?? DEFAULT_CONFIG.autoRecoveryIntervalMs;
  
  autoRecoveryTimer = setInterval(() => {
    if (document.visibilityState === 'hidden') return;
    const openBreakers = getAllBreakerStates().filter(b => b.state === 'open');
    for (const b of openBreakers) {
      const cfg = configs.get(b.module) || DEFAULT_CONFIG;
      if (!cfg.autoRecoveryEnabled) continue;
      
      const elapsed = Date.now() - b.lastStateChange;
      if (elapsed >= cfg.recoveryTimeout) {
        const breaker = getBreaker(b.module);
        transition(breaker, 'half_open');
        breaker.successes = 0;
        console.log(`[circuit-breaker] Auto-recovery: ${b.module} → half_open after ${Math.round(elapsed / 1000)}s`);
      }
    }
  }, checkInterval);
  
  console.log(`[circuit-breaker] Auto-recovery started (interval: ${checkInterval}ms)`);
}

/** Stop automatic recovery */
export function stopAutoRecovery(): void {
  if (autoRecoveryTimer) {
    clearInterval(autoRecoveryTimer);
    autoRecoveryTimer = null;
    console.log('[circuit-breaker] Auto-recovery stopped');
  }
}
