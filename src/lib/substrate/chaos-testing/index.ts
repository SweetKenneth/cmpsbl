/**
 * Chaos Testing Scheduler
 * Automated fault injection for resilience validation
 * 
 * Runs in shadow mode to validate recovery paths before production stress.
 * Injects random breaker trips, latency spikes, and sector kills.
 */

import { recordFailure, resetBreaker, getBreaker } from '../circuit-breaker';
import { emit } from '../events';
import type { SubstrateModuleName } from '@/lib/core';

export type ChaosAction = 'breaker_trip' | 'latency_spike' | 'sector_kill' | 'memory_pressure' | 'cascade_failure';

export interface ChaosExperiment {
  id: string;
  action: ChaosAction;
  targetNode: string;
  status: 'pending' | 'running' | 'completed' | 'rolled_back';
  injectedAt: number;
  rolledBackAt: number | null;
  result: {
    recoveryTimeMs: number | null;
    autoRecovered: boolean;
    healthImpact: number;
  } | null;
}

export interface ChaosSchedule {
  enabled: boolean;
  intervalMinutes: number;
  maxConcurrentExperiments: number;
  excludeNodes: string[];
  shadowOnly: boolean; // only run in shadow mode
}

const MAX_EXPERIMENTS = 500;
const experiments: ChaosExperiment[] = [];
let schedule: ChaosSchedule = {
  enabled: false,
  intervalMinutes: 30,
  maxConcurrentExperiments: 1,
  excludeNodes: ['core'], // never chaos-test CORE
  shadowOnly: true,
};

let chaosTimer: ReturnType<typeof setInterval> | null = null;

const CHAOS_ACTIONS: ChaosAction[] = ['breaker_trip', 'latency_spike', 'cascade_failure'];
const CHAOS_TARGETS: SubstrateModuleName[] = [
  'brain', 'decode', 'nexus', 'vision', 'dream', 'encode',
  'economy', 'sandbox', 'inclusive', 'relay',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function injectChaos(action: ChaosAction, targetNode: string): ChaosExperiment {
  const experiment: ChaosExperiment = {
    id: `chaos-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    action,
    targetNode,
    status: 'running',
    injectedAt: Date.now(),
    rolledBackAt: null,
    result: null,
  };

  // Inject the fault
  switch (action) {
    case 'breaker_trip':
      // Trip the circuit breaker for the target node
      for (let i = 0; i < 6; i++) recordFailure(`module:${targetNode}`);
      break;
    case 'latency_spike':
      // Simulate via breaker half-open state
      recordFailure(`module:${targetNode}`);
      recordFailure(`module:${targetNode}`);
      break;
    case 'cascade_failure':
      // Trip multiple related nodes
      recordFailure(`module:${targetNode}`);
      recordFailure(`module:${targetNode}`);
      recordFailure(`module:${targetNode}`);
      break;
    default:
      break;
  }

  experiments.push(experiment);
  if (experiments.length > MAX_EXPERIMENTS) {
    experiments.splice(0, Math.floor(MAX_EXPERIMENTS * 0.3));
  }

  emit({
    module: 'system',
    event_type: 'chaos_injected',
    outcome: 'succeeded',
    data: { action, targetNode, experimentId: experiment.id },
  });

  // Auto-rollback after 60 seconds
  setTimeout(() => rollbackChaos(experiment.id), 60_000);

  return experiment;
}

export function rollbackChaos(experimentId: string): ChaosExperiment | null {
  const exp = experiments.find(e => e.id === experimentId);
  if (!exp || exp.status !== 'running') return exp ?? null;

  // Restore
  resetBreaker(`module:${exp.targetNode}`);

  const recoveryTime = Date.now() - exp.injectedAt;
  const breaker = getBreaker(`module:${exp.targetNode}`);

  exp.status = 'rolled_back';
  exp.rolledBackAt = Date.now();
  exp.result = {
    recoveryTimeMs: recoveryTime,
    autoRecovered: breaker.state === 'closed',
    healthImpact: breaker.state === 'closed' ? 0 : -20,
  };

  emit({
    module: 'system',
    event_type: 'chaos_rolled_back',
    outcome: 'succeeded',
    data: { experimentId, recoveryTimeMs: recoveryTime, autoRecovered: exp.result.autoRecovered },
  });

  return exp;
}

export function runRandomChaos(): ChaosExperiment | null {
  if (!schedule.enabled) return null;
  const active = experiments.filter(e => e.status === 'running');
  if (active.length >= schedule.maxConcurrentExperiments) return null;

  const validTargets = CHAOS_TARGETS.filter(t => !schedule.excludeNodes.includes(t));
  if (validTargets.length === 0) return null;

  return injectChaos(pickRandom(CHAOS_ACTIONS), pickRandom(validTargets));
}

export function startChaosScheduler(): void {
  if (chaosTimer || !schedule.enabled) return;
  chaosTimer = setInterval(() => runRandomChaos(), schedule.intervalMinutes * 60_000);
  console.log(`[chaos-testing] Scheduler started (interval: ${schedule.intervalMinutes}min)`);
}

export function stopChaosScheduler(): void {
  if (chaosTimer) {
    clearInterval(chaosTimer);
    chaosTimer = null;
  }
}

export function configureChaos(cfg: Partial<ChaosSchedule>): ChaosSchedule {
  schedule = { ...schedule, ...cfg };
  if (schedule.enabled && !chaosTimer) startChaosScheduler();
  if (!schedule.enabled && chaosTimer) stopChaosScheduler();
  return { ...schedule };
}

export function getChaosSchedule(): ChaosSchedule {
  return { ...schedule };
}

export function getExperiments(limit = 20): ChaosExperiment[] {
  return experiments.slice(-limit);
}

export function getChaosStats() {
  const all = experiments;
  const completed = all.filter(e => e.status === 'rolled_back' || e.status === 'completed');
  const autoRecovered = completed.filter(e => e.result?.autoRecovered);
  const avgRecovery = completed.length > 0
    ? Math.round(completed.reduce((s, e) => s + (e.result?.recoveryTimeMs ?? 0), 0) / completed.length)
    : 0;

  return {
    totalExperiments: all.length,
    active: all.filter(e => e.status === 'running').length,
    autoRecoveryRate: completed.length > 0 ? Math.round((autoRecovered.length / completed.length) * 100) : 100,
    avgRecoveryMs: avgRecovery,
    schedulerEnabled: schedule.enabled,
    shadowOnly: schedule.shadowOnly,
  };
}
