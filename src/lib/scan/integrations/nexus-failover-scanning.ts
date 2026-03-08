/**
 * NEXUS Failover-Resilient Scanning (#10)
 * If a provider goes down mid-scan, reroute to next healthy provider
 * without losing scan context or repeating completed work.
 */

import { getFleetStatus, recordProviderOutcome } from '@/lib/nexus/router';
import { getCircuitStatus, recordFailure, recordSuccess } from '@/lib/nexus/circuitBreaker';
import { selectProvider } from '@/lib/nexus/batchRouting';
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

  const fleet = getFleetStatus();
  const healthyProviders = fleet.providers
    .filter(p => !state.failedProviders.has(p.id))
    .filter(p => {
      const circuit = getCircuitStatus(p.id);
      return circuit.state !== 'open';
    });

  if (healthyProviders.length === 0) return null;

  // Use batch routing's selectProvider with cost-optimized strategy
  const selected = selectProvider(task.category, 'cost-optimized');
  if (state.failedProviders.has(selected)) {
    // Fallback to first healthy
    return { provider: healthyProviders[0].id, model: healthyProviders[0].model };
  }

  return { provider: selected, model: 'default' };
}

/**
 * Handle a provider failure during scanning — reroute to next provider
 */
export function handleScanFailure(
  state: ScanFailoverState,
  taskId: string,
  error: string,
): { rerouted: boolean; newProvider: string | null; reason: string } {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return { rerouted: false, newProvider: null, reason: 'Task not found' };

  task.attempts++;
  task.error = error;
  const failedProvider = task.provider;

  if (failedProvider) {
    recordProviderOutcome(failedProvider, false, 0);
    recordFailure(failedProvider);
  }

  if (task.attempts >= task.maxAttempts) {
    task.status = 'failed';
    return { rerouted: false, newProvider: null, reason: `Max attempts (${task.maxAttempts}) exceeded` };
  }

  if (state.totalReroutes >= state.config.maxReroutesPerScan) {
    task.status = 'failed';
    return { rerouted: false, newProvider: null, reason: `Max scan reroutes (${state.config.maxReroutesPerScan}) exceeded` };
  }

  if (failedProvider) {
    const circuitState = getCircuitStatus(failedProvider);
    if (circuitState.state === 'open') {
      state.failedProviders.add(failedProvider);
    }
  }

  const newSelection = selectScanProvider(state, taskId);
  if (!newSelection) {
    task.status = 'failed';
    return { rerouted: false, newProvider: null, reason: 'No healthy providers available' };
  }

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
  taskDurationMs?: number,
): void {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = 'completed';
  task.result = result;
  task.error = null;

  if (task.provider) {
    // FIX: Use actual task duration, not session elapsed time
    const latency = taskDurationMs ?? 0;
    recordProviderOutcome(task.provider, true, latency);
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
  const pending = state.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  return {
    total,
    completed,
    failed,
    rerouted: state.totalReroutes,
    pending,
    healthPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    failedProviders: [...state.failedProviders],
  };
}
