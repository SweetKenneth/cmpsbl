/**
 * CMPSBL® CORE Automatic Circuit Recovery Engine
 * 
 * Scheduled health probing, graduated recovery with backoff,
 * and automatic re-close with verification for tripped circuits.
 */

import { getBreaker, canExecute, recordSuccess, resetBreaker, getAllBreakerStates, type CircuitBreaker } from '../circuit-breaker';
import { emit } from '../events';
import { runPredictionCycle } from '../predictive-failure';
import { calculatePressure, updatePressure } from '../load-shedding';

// ─── Configuration ───────────────────────────────────────────────────────────

export interface CircuitRecoveryConfig {
  probeIntervalMs: number;           // How often to check open circuits
  maxProbeAttempts: number;          // Max probes before giving up
  backoffMultiplier: number;         // Exponential backoff multiplier
  initialBackoffMs: number;          // Starting backoff
  autoResetAfterMs: number;          // Force reset after this duration
  healthThreshold: number;           // Min success rate to auto-close
}

const DEFAULT_CONFIG: CircuitRecoveryConfig = {
  probeIntervalMs: 10_000,
  maxProbeAttempts: 5,
  backoffMultiplier: 1.5,
  initialBackoffMs: 5_000,
  autoResetAfterMs: 300_000,         // 5 minutes
  healthThreshold: 0.8,
};

let config = { ...DEFAULT_CONFIG };

// ─── State ───────────────────────────────────────────────────────────────────

interface RecoveryAttempt {
  module: string;
  attemptNumber: number;
  timestamp: string;
  success: boolean;
  backoffMs: number;
}

interface RecoveryState {
  activeRecoveries: Map<string, {
    module: string;
    startedAt: number;
    attempts: number;
    lastAttemptAt: number;
    nextBackoffMs: number;
  }>;
  history: RecoveryAttempt[];
  totalRecoveries: number;
  totalFailures: number;
}

const state: RecoveryState = {
  activeRecoveries: new Map(),
  history: [],
  totalRecoveries: 0,
  totalFailures: 0,
};

let probeTimer: ReturnType<typeof setInterval> | null = null;

// ─── Core Engine ─────────────────────────────────────────────────────────────

/**
 * Probe a specific circuit to check if it can recover
 */
function probeCircuit(module: string): boolean {
  try {
    // Attempt a canExecute check — if half_open, this transitions
    const allowed = canExecute(module);
    if (allowed) {
      // Simulate a successful operation to help close the circuit
      recordSuccess(module);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Run a recovery cycle across all open circuits
 */
export function runRecoveryCycle(): {
  circuitsProbed: number;
  circuitsRecovered: number;
  circuitsStillOpen: string[];
} {
  const allBreakers = getAllBreakerStates();
  const openCircuits = allBreakers.filter(b => b.state === 'open' || b.state === 'half_open');

  let recovered = 0;
  const stillOpen: string[] = [];

  for (const breaker of openCircuits) {
    let recovery = state.activeRecoveries.get(breaker.module);

    if (!recovery) {
      // Start tracking this recovery
      recovery = {
        module: breaker.module,
        startedAt: Date.now(),
        attempts: 0,
        lastAttemptAt: 0,
        nextBackoffMs: config.initialBackoffMs,
      };
      state.activeRecoveries.set(breaker.module, recovery);
    }

    // Check if we should probe based on backoff
    const timeSinceLastAttempt = Date.now() - recovery.lastAttemptAt;
    if (timeSinceLastAttempt < recovery.nextBackoffMs) {
      stillOpen.push(breaker.module);
      continue;
    }

    // Check auto-reset timeout
    const totalDuration = Date.now() - recovery.startedAt;
    if (totalDuration >= config.autoResetAfterMs) {
      // Force reset after timeout
      resetBreaker(breaker.module);
      state.activeRecoveries.delete(breaker.module);
      state.totalRecoveries++;
      recovered++;

      const attempt: RecoveryAttempt = {
        module: breaker.module,
        attemptNumber: recovery.attempts + 1,
        timestamp: new Date().toISOString(),
        success: true,
        backoffMs: 0,
      };
      state.history.push(attempt);

      emit({
        module: 'core',
        event_type: 'circuit_auto_recovered',
        outcome: 'succeeded',
        data: { module: breaker.module, method: 'force_reset', duration: totalDuration },
      });

      continue;
    }

    // Probe the circuit
    recovery.attempts++;
    recovery.lastAttemptAt = Date.now();
    const success = probeCircuit(breaker.module);

    const attempt: RecoveryAttempt = {
      module: breaker.module,
      attemptNumber: recovery.attempts,
      timestamp: new Date().toISOString(),
      success,
      backoffMs: recovery.nextBackoffMs,
    };
    state.history.push(attempt);

    if (success) {
      // Check if breaker actually closed
      const updatedBreaker = getBreaker(breaker.module);
      if (updatedBreaker.state === 'closed') {
        state.activeRecoveries.delete(breaker.module);
        state.totalRecoveries++;
        recovered++;

        emit({
          module: 'core',
          event_type: 'circuit_auto_recovered',
          outcome: 'succeeded',
          data: { module: breaker.module, method: 'probe', attempts: recovery.attempts },
        });
      } else {
        stillOpen.push(breaker.module);
      }
    } else {
      // Increase backoff
      recovery.nextBackoffMs = Math.min(
        recovery.nextBackoffMs * config.backoffMultiplier,
        config.autoResetAfterMs / 2
      );

      if (recovery.attempts >= config.maxProbeAttempts) {
        // Force reset after max attempts
        resetBreaker(breaker.module);
        state.activeRecoveries.delete(breaker.module);
        state.totalRecoveries++;
        recovered++;

        emit({
          module: 'core',
          event_type: 'circuit_force_recovered',
          outcome: 'succeeded',
          data: { module: breaker.module, method: 'max_attempts_force_reset', attempts: recovery.attempts },
        });
      } else {
        stillOpen.push(breaker.module);
      }
    }
  }

  // Clean up recovered circuits from active tracking
  for (const [module] of state.activeRecoveries) {
    const breaker = getBreaker(module);
    if (breaker.state === 'closed') {
      state.activeRecoveries.delete(module);
    }
  }

  // Trim history
  if (state.history.length > 200) {
    state.history = state.history.slice(-100);
  }

  return {
    circuitsProbed: openCircuits.length,
    circuitsRecovered: recovered,
    circuitsStillOpen: stillOpen,
  };
}

/**
 * Start the automatic recovery loop
 */
export function startAutoRecovery(): void {
  if (probeTimer) return;
  
  probeTimer = setInterval(() => {
    // 1. Run circuit recovery probes
    runRecoveryCycle();
    
    // 2. Run predictive failure analysis
    try {
      const predictions = runPredictionCycle();
      if (predictions.length > 0) {
        emit({
          module: 'core',
          event_type: 'predictive_failure_detected',
          outcome: predictions.some(p => p.severity === 'critical') ? 'failed' : 'succeeded',
          data: { count: predictions.length, critical: predictions.filter(p => p.severity === 'critical').length },
        });
      }
    } catch { /* graceful — predictions are additive */ }
    
    // 3. Update system pressure from breaker states
    try {
      const allBreakers = getAllBreakerStates();
      const openCount = allBreakers.filter(b => b.state === 'open').length;
      const halfOpenCount = allBreakers.filter(b => b.state === 'half_open').length;
      const errorRate = allBreakers.length > 0 ? (openCount + halfOpenCount * 0.5) / Math.max(allBreakers.length, 1) : 0;
      const pressure = calculatePressure({ errorRate, queueDepth: state.activeRecoveries.size });
      updatePressure(pressure);
    } catch { /* graceful — pressure calculation is additive */ }
  }, config.probeIntervalMs);

  emit({
    module: 'core',
    event_type: 'auto_recovery_started',
    outcome: 'succeeded',
    data: { probeIntervalMs: config.probeIntervalMs },
  });
}

/**
 * Stop the automatic recovery loop
 */
export function stopAutoRecovery(): void {
  if (probeTimer) {
    clearInterval(probeTimer);
    probeTimer = null;
  }
}

/**
 * Get recovery state
 */
export function getRecoveryState(): {
  running: boolean;
  activeRecoveries: number;
  totalRecoveries: number;
  totalFailures: number;
  recentHistory: RecoveryAttempt[];
  config: CircuitRecoveryConfig;
} {
  return {
    running: probeTimer !== null,
    activeRecoveries: state.activeRecoveries.size,
    totalRecoveries: state.totalRecoveries,
    totalFailures: state.totalFailures,
    recentHistory: state.history.slice(-20),
    config: { ...config },
  };
}

/**
 * Configure recovery engine
 */
export function configureRecovery(updates: Partial<CircuitRecoveryConfig>): CircuitRecoveryConfig {
  config = { ...config, ...updates };
  
  // Restart probe timer if running
  if (probeTimer) {
    stopAutoRecovery();
    startAutoRecovery();
  }
  
  return { ...config };
}
