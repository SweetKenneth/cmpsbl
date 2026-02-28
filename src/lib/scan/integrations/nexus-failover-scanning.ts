/**
 * NEXUS Failover-Resilient Scanning (#10)
 * If a provider goes down mid-scan, reroute to next healthy provider
 * without losing scan context or repeating completed work.
 */

import { getProviderHealthStatus, resetProviderHealth, selectProvider } from '@/lib/nexus/batchRouting';
import { getFleetStatus, recordProviderOutcome } from '@/lib/nexus/router';
import { getCircuitState, recordFailure, recordSuccess } from '@/lib/nexus/circuitBreaker';
import type { ScanCategory } from './nexus-scan-routing';

export interface ScanTask {
  id: string;
  category: ScanCategory;
  prompt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rerouted';
  provider: string | null;
  attempts: number;
  maxAttempts: number;
  result: unknown | null;
  error: string | null;
  rerouteHistory: Array<{
    fromProvider: string;
    toProvider: string;
    reason: string;
    timestamp: number;
  }>;
}

interface FailoverConfig {
  maxAttemptsPerTask: number;
  maxReroutesPerScan: number;
  circuitBreakerThreshold: number;
  providerCooldownMs: number;
}

const DEFAULT_CONFIG: FailoverConfig = {
  maxAttemptsPerTask: 3,
  maxReroutesPerScan: 10,
  circuitBreakerThreshold: 3,
  providerCooldownMs: 60_000,
};

interface ScanFailoverState {
  tasks: ScanTask[];
  totalReroutes: number;
  failedProviders: Set<string>;
  config: FailoverConfig;
  startedAt: number;
}

/**
 * Create a failover-managed scan session
 */
export function createFailoverSession(
  tasks: Array<{ id: string; category: ScanCategory; prompt: string }>,
  config: Partial<FailoverConfig> = {},
): ScanFailoverState {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  return {
    tasks: tasks.map(t => ({
      ...t,
      status: 'pending' as const,
      provider: null,
      attempts: 0,
      maxAttempts: mergedConfig.maxAttemptsPerTask,
      result: null,
      error: null,
      rerouteHistory: [],
    })),
    totalReroutes: 0,
    failedProviders: new Set(),
    config: mergedConfig,
    startedAt: Date.now(),
  };
}

/**
 * Select a provider for a scan task, avoiding known-failed providers
 */
export function selectScanProvider(
  state: ScanFailoverState,
  taskId: string,
): { provider: string; model: string } | null {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return null;

  // Get fleet status, filter out failed providers
  const fleet = getFleetStatus();
  const healthyProviders = fleet.providers
    .filter(p => !state.failedProviders.has(p.name))
    .filter(p => {
      const circuit = getCircuitState(p.name);
      return circuit.state !== 'open';
    });

  if (healthyProviders.length === 0) return null;

  // Select best available
  const selected = selectProvider(task.category);
  if (!selected) {
    // Fallback: pick first healthy
    return {
      provider: healthyProviders[0].name,
      model: healthyProviders[0].currentModel ?? 'default',
    };
  }

  return { provider: selected.provider, model: selected.model ?? 'default' };
}

/**
 * Handle a provider failure during scanning — reroute to next provider
 */
export function handleScanFailure(
  state: ScanFailoverState,
  taskId: string,
  error: string,
): {
  rerouted: boolean;
  newProvider: string | null;
  reason: string;
} {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return { rerouted: false, newProvider: null, reason: 'Task not found' };

  task.attempts++;
  task.error = error;
  const failedProvider = task.provider;

  // Record failure in NEXUS circuit breaker
  if (failedProvider) {
    recordProviderOutcome(failedProvider, false, 0);
    recordFailure(failedProvider);
  }

  // Check if we've exceeded max attempts
  if (task.attempts >= task.maxAttempts) {
    task.status = 'failed';
    return { rerouted: false, newProvider: null, reason: `Max attempts (${task.maxAttempts}) exceeded` };
  }

  // Check if we've exceeded max reroutes for the whole scan
  if (state.totalReroutes >= state.config.maxReroutesPerScan) {
    task.status = 'failed';
    return { rerouted: false, newProvider: null, reason: `Max scan reroutes (${state.config.maxReroutesPerScan}) exceeded` };
  }

  // Mark provider as failed if it has too many failures
  if (failedProvider) {
    const circuitState = getCircuitState(failedProvider);
    if (circuitState.state === 'open') {
      state.failedProviders.add(failedProvider);
    }
  }

  // Select a new provider
  const newSelection = selectScanProvider(state, taskId);
  if (!newSelection) {
    task.status = 'failed';
    return { rerouted: false, newProvider: null, reason: 'No healthy providers available' };
  }

  // Record reroute
  task.rerouteHistory.push({
    fromProvider: failedProvider ?? 'none',
    toProvider: newSelection.provider,
    reason: error,
    timestamp: Date.now(),
  });
  task.provider = newSelection.provider;
  task.status = 'rerouted';
  state.totalReroutes++;

  return {
    rerouted: true,
    newProvider: newSelection.provider,
    reason: `Rerouted from ${failedProvider} to ${newSelection.provider}: ${error}`,
  };
}

/**
 * Mark a scan task as successfully completed
 */
export function handleScanSuccess(
  state: ScanFailoverState,
  taskId: string,
  result: unknown,
): void {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = 'completed';
  task.result = result;
  task.error = null;

  // Record success in NEXUS
  if (task.provider) {
    recordProviderOutcome(task.provider, true, Date.now() - state.startedAt);
    recordSuccess(task.provider);
  }
}

/**
 * Get overall scan session health
 */
export function getSessionHealth(state: ScanFailoverState): {
  total: number;
  completed: number;
  failed: number;
  rerouted: number;
  pending: number;
  healthPercent: number;
  failedProviders: string[];
} {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.status === 'completed').length;
  const failed = state.tasks.filter(t => t.status === 'failed').length;
  const rerouted = state.totalReroutes;
  const pending = state.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  return {
    total,
    completed,
    failed,
    rerouted,
    pending,
    healthPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    failedProviders: [...state.failedProviders],
  };
}
