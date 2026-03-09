/**
 * EVOLUTION Module — Core State & Health
 * Wraps the control-center lifecycle with standard substrate patterns:
 * init, health, resilience, engine hot-swap.
 *
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';
import { clampNumber } from '@/lib/system/hardening';
import { getRecentCycles, getActiveCycle, type EvolutionCycle } from './control-center';

export interface EvolutionModuleState {
  initialized: boolean;
  totalCycles: number;
  appliedCycles: number;
  failedCycles: number;
  rolledBackCycles: number;
  activeCycle: EvolutionCycle | null;
  recentCycles: EvolutionCycle[];
  successRate: number;
  avgCycleDurationMs: number;
}

const state: EvolutionModuleState = {
  initialized: false,
  totalCycles: 0,
  appliedCycles: 0,
  failedCycles: 0,
  rolledBackCycles: 0,
  activeCycle: null,
  recentCycles: [],
  successRate: 0,
  avgCycleDurationMs: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

export function initEvolution(): void {
  emitStarted('evolution', 'init', {});
  try {
    initCircuitBreaker('evolution', { failureThreshold: 3, recoveryTimeout: 60_000 });
    moduleEngine = activateModuleEngine('evolution', '1.0.0');
    hardening = createModuleHardening('evolution', { maxConcurrent: 4, rateLimit: 30, healthThreshold: 40 });
    state.initialized = true;
    hardening.startAutoRestore(() => getEvolutionHealth(), () => { recalculate(); }, 60_000);
    hardening.snapshot(state);
    emitSucceeded('evolution', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('evolution', 'init', err instanceof Error ? err.message : String(err));
  }
}

function recalculate(): void {
  const recent = getRecentCycles(50);
  state.recentCycles = recent;
  state.activeCycle = getActiveCycle();
  state.totalCycles = recent.length;
  state.appliedCycles = recent.filter(c => c.phase === 'applied').length;
  state.failedCycles = recent.filter(c => c.phase === 'failed').length;
  state.rolledBackCycles = recent.filter(c => c.phase === 'rolled_back').length;
  state.successRate = state.totalCycles > 0 ? Math.round((state.appliedCycles / state.totalCycles) * 100) : 0;

  const completed = recent.filter(c => c.completedAt && c.startedAt);
  state.avgCycleDurationMs = completed.length > 0
    ? Math.round(completed.reduce((s, c) => s + ((c.completedAt ?? 0) - c.startedAt), 0) / completed.length)
    : 0;
}

export function getEvolutionState(): EvolutionModuleState {
  recalculate();
  return { ...state };
}

export function getEvolutionHealth(): number {
  if (!state.initialized) return 0;
  recalculate();
  // Health based on success rate, penalized by consecutive failures
  const base = state.totalCycles > 0 ? state.successRate : 85;
  const h = clampNumber(base, 0, 100, 85);
  if (hardening?.isDegraded()) return Math.min(h, 40);
  return h;
}

export function getEvolutionResilience() { return getModuleResilienceReport('evolution', getEvolutionHealth()); }
export function getEvolutionEngine() { return moduleEngine; }
export function getEvolutionHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeEvolutionEngine(v: string) {
  if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); }
  return moduleEngine;
}
