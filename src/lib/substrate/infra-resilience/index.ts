/**
 * Infrastructure Resilience Layer
 * 
 * Shared circuit breaker, hot-swap, and graceful fallback utilities
 * for all Infrastructure-layer modules (Memory, Relay, Audit, Identity, Economy, Sandbox).
 */

import { canExecute, recordSuccess, recordFailure, getBreaker, configureBreaker } from '../circuit-breaker';
import { registerEngine, transitionEngine, getActiveEngines, type EngineInstance } from '../hot-swap';
import { emit } from '../events';

// ─── Circuit Breaker Wrapper ─────────────────────────────────────────

export interface CircuitStatus {
  module: string;
  state: 'closed' | 'open' | 'half_open';
  failures: number;
  totalTrips: number;
  canExecute: boolean;
}

/**
 * Initialize circuit breaker for an infra module with default thresholds
 */
export function initCircuitBreaker(module: string, opts?: { failureThreshold?: number; recoveryTimeout?: number }) {
  configureBreaker(module, {
    failureThreshold: opts?.failureThreshold ?? 5,
    recoveryTimeout: opts?.recoveryTimeout ?? 30_000,
    halfOpenMaxAttempts: 3,
    windowSize: 60_000,
  });
}

/**
 * Get the circuit status for a module
 */
export function getCircuitStatus(module: string): CircuitStatus {
  const b = getBreaker(module);
  return {
    module,
    state: b.state,
    failures: b.failures,
    totalTrips: b.totalTrips,
    canExecute: canExecute(module),
  };
}

/**
 * Execute a function with circuit breaker protection + graceful fallback
 */
export async function withResilience<T>(
  module: string,
  fn: () => T | Promise<T>,
  fallback: T,
  actionName: string = 'execute'
): Promise<{ result: T; fromFallback: boolean; circuitState: string }> {
  const breaker = getBreaker(module);
  
  if (!canExecute(module)) {
    emit({
      module,
      event_type: 'circuit_blocked',
      outcome: 'failed',
      data: { action: actionName, state: breaker.state, trips: breaker.totalTrips },
    });
    return { result: fallback, fromFallback: true, circuitState: breaker.state };
  }

  try {
    const result = await fn();
    recordSuccess(module);
    return { result, fromFallback: false, circuitState: breaker.state };
  } catch (err) {
    recordFailure(module);
    const errorMsg = err instanceof Error ? err.message : String(err);
    emit({
      module,
      event_type: 'resilience_fallback',
      outcome: 'failed',
      data: { action: actionName, error: errorMsg, state: breaker.state },
    });
    return { result: fallback, fromFallback: true, circuitState: breaker.state };
  }
}

/**
 * Sync wrapper for non-async operations
 */
export function withResilienceSync<T>(
  module: string,
  fn: () => T,
  fallback: T,
  actionName: string = 'execute'
): { result: T; fromFallback: boolean; circuitState: string } {
  const breaker = getBreaker(module);

  if (!canExecute(module)) {
    emit({
      module,
      event_type: 'circuit_blocked',
      outcome: 'failed',
      data: { action: actionName, state: breaker.state },
    });
    return { result: fallback, fromFallback: true, circuitState: breaker.state };
  }

  try {
    const result = fn();
    recordSuccess(module);
    return { result, fromFallback: false, circuitState: breaker.state };
  } catch (err) {
    recordFailure(module);
    const errorMsg = err instanceof Error ? err.message : String(err);
    emit({
      module,
      event_type: 'resilience_fallback',
      outcome: 'failed',
      data: { action: actionName, error: errorMsg, state: breaker.state },
    });
    return { result: fallback, fromFallback: true, circuitState: breaker.state };
  }
}

// ─── Hot-Swap Engine Management ──────────────────────────────────────

export interface ModuleEngine {
  instance: EngineInstance;
  module: string;
}

/**
 * Register a hot-swappable engine for a module and bring it to active
 */
export function activateModuleEngine(module: string, version: string): ModuleEngine {
  const instance = registerEngine(module, version);
  transitionEngine(instance.id, 'warming');
  transitionEngine(instance.id, 'active');
  emit({
    module,
    event_type: 'engine_activated',
    outcome: 'succeeded',
    data: { instanceId: instance.id, version },
  });
  return { instance, module };
}

/**
 * Drain and unload a module's engine for replacement
 */
export function deactivateModuleEngine(instanceId: string, module: string): boolean {
  const drained = transitionEngine(instanceId, 'draining');
  if (!drained) return false;
  const unloaded = transitionEngine(instanceId, 'unloaded');
  emit({
    module,
    event_type: 'engine_deactivated',
    outcome: unloaded ? 'succeeded' : 'failed',
    data: { instanceId },
  });
  return !!unloaded;
}

/**
 * Hot-swap a module engine to a new version with zero downtime
 */
export function hotSwapModuleEngine(module: string, currentInstanceId: string, newVersion: string): ModuleEngine {
  // Activate new first (shadow)
  const newEngine = activateModuleEngine(module, newVersion);
  // Then drain old
  deactivateModuleEngine(currentInstanceId, module);
  emit({
    module,
    event_type: 'hot_swap_complete',
    outcome: 'succeeded',
    data: { oldInstance: currentInstanceId, newInstance: newEngine.instance.id, newVersion },
  });
  return newEngine;
}

/**
 * Get all active engines for a module
 */
export function getModuleEngines(module: string): EngineInstance[] {
  return getActiveEngines().filter(e => e.engineId === module);
}

// ─── Graceful Degradation ────────────────────────────────────────────

export type HealthGrade = 'healthy' | 'degraded' | 'critical' | 'offline';

export function computeHealthGrade(module: string, moduleHealthScore: number): HealthGrade {
  const circuit = getCircuitStatus(module);
  if (circuit.state === 'open') return 'offline';
  if (circuit.state === 'half_open') return 'degraded';
  if (moduleHealthScore < 50) return 'critical';
  if (moduleHealthScore < 80) return 'degraded';
  return 'healthy';
}

/**
 * Get full resilience report for a module
 */
export function getModuleResilienceReport(module: string, moduleHealthScore: number) {
  const circuit = getCircuitStatus(module);
  const engines = getModuleEngines(module);
  const grade = computeHealthGrade(module, moduleHealthScore);
  return {
    module,
    grade,
    circuit,
    engines: engines.map(e => ({ id: e.id, version: e.version, phase: e.phase })),
    engineCount: engines.length,
    timestamp: new Date().toISOString(),
  };
}
