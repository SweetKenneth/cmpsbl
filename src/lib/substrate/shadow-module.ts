/**
 * SHADOW Module — CSZ (Covert Systems Zone)
 * Shadow execution, mesh configuration, and state management.
 * 
 * Provides:
 * - Shadow run execution with divergence analysis
 * - Mesh configuration for shadow topology
 * - State queries and health metrics
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from './events';
import { initCircuitBreaker, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from './infra-resilience';
import { createModuleHardening, type ModuleHardening } from './module-hardening';
import { clampNumber } from '@/lib/system/hardening';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ShadowRunMode = 'parallel' | 'sequential' | 'isolated';

export interface ShadowMeshConfig {
  topology: 'star' | 'ring' | 'mesh';
  replicationFactor: number;
  isolationLevel: 'none' | 'process' | 'container';
  maxConcurrent: number;
  timeoutMs: number;
}

export interface ShadowRun {
  id: string;
  proposalId: string;
  mode: ShadowRunMode;
  startedAt: number;
  completedAt: number | null;
  durationMs: number;
  divergence: number;
  verdict: 'converged' | 'diverged' | 'timeout' | 'error';
  artifacts: string[];
  error?: string;
}

export interface ShadowModuleState {
  initialized: boolean;
  meshConfig: ShadowMeshConfig;
  activeRuns: ShadowRun[];
  recentRuns: ShadowRun[];
  totalRuns: number;
  successRate: number;
  avgDivergence: number;
  avgDurationMs: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const state: ShadowModuleState = {
  initialized: false,
  meshConfig: {
    topology: 'star',
    replicationFactor: 2,
    isolationLevel: 'process',
    maxConcurrent: 4,
    timeoutMs: 30000,
  },
  activeRuns: [],
  recentRuns: [],
  totalRuns: 0,
  successRate: 100,
  avgDivergence: 0,
  avgDurationMs: 0,
};

const MAX_RECENT_RUNS = 100;

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

export function initShadow(): void {
  emitStarted('shadow', 'init', {});
  try {
    initCircuitBreaker('shadow', { failureThreshold: 3, recoveryTimeout: 60_000 });
    moduleEngine = activateModuleEngine('shadow', '1.0.0');
    hardening = createModuleHardening('shadow', { maxConcurrent: 4, rateLimit: 20, healthThreshold: 40 });
    state.initialized = true;
    hardening.startAutoRestore(() => getShadowHealth(), () => { recalculate(); }, 60_000);
    hardening.snapshot(state);
    emitSucceeded('shadow', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('shadow', 'init', err instanceof Error ? err.message : String(err));
  }
}

// ═══════════════════════════════════════════════════════════════
// SHADOW RUN EXECUTION
// ═══════════════════════════════════════════════════════════════

export function executeShadowRun(proposalId: string, mode: ShadowRunMode = 'parallel'): ShadowRun {
  const runId = `shadow_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();

  emit({
    module: 'shadow',
    event_type: 'run.started',
    outcome: 'started',
    data: { runId, proposalId, mode },
  });

  // Simulate shadow execution with divergence analysis
  const durationMs = Math.floor(Math.random() * 200) + 50;
  const divergence = Math.random() * 0.15; // 0-15% divergence
  const verdict: ShadowRun['verdict'] = divergence < 0.1 ? 'converged' : 'diverged';

  const run: ShadowRun = {
    id: runId,
    proposalId,
    mode,
    startedAt,
    completedAt: startedAt + durationMs,
    durationMs,
    divergence: Math.round(divergence * 1000) / 1000,
    verdict,
    artifacts: [],
  };

  // Add to recent runs
  state.recentRuns.push(run);
  if (state.recentRuns.length > MAX_RECENT_RUNS) {
    state.recentRuns.shift();
  }
  state.totalRuns++;

  recalculate();

  emit({
    module: 'shadow',
    event_type: 'run.completed',
    outcome: verdict === 'converged' ? 'succeeded' : 'failed',
    data: { runId, divergence: run.divergence, verdict, durationMs },
  });

  return run;
}

// ═══════════════════════════════════════════════════════════════
// MESH CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export function configureMesh(config: Partial<ShadowMeshConfig>): ShadowMeshConfig {
  const prev = { ...state.meshConfig };

  if (config.topology) state.meshConfig.topology = config.topology;
  if (config.replicationFactor !== undefined) {
    state.meshConfig.replicationFactor = clampNumber(config.replicationFactor, 1, 5, 2);
  }
  if (config.isolationLevel) state.meshConfig.isolationLevel = config.isolationLevel;
  if (config.maxConcurrent !== undefined) {
    state.meshConfig.maxConcurrent = clampNumber(config.maxConcurrent, 1, 16, 4);
  }
  if (config.timeoutMs !== undefined) {
    state.meshConfig.timeoutMs = clampNumber(config.timeoutMs, 1000, 120000, 30000);
  }

  emit({
    module: 'shadow',
    event_type: 'mesh.configured',
    outcome: 'succeeded',
    data: { prev, next: state.meshConfig },
  });

  return { ...state.meshConfig };
}

export function getMeshConfig(): ShadowMeshConfig {
  return { ...state.meshConfig };
}

// ═══════════════════════════════════════════════════════════════
// STATE & HEALTH
// ═══════════════════════════════════════════════════════════════

function recalculate(): void {
  const completed = state.recentRuns.filter(r => r.completedAt !== null);
  const converged = completed.filter(r => r.verdict === 'converged');

  state.successRate = completed.length > 0
    ? Math.round((converged.length / completed.length) * 100)
    : 100;

  state.avgDivergence = completed.length > 0
    ? Math.round((completed.reduce((s, r) => s + r.divergence, 0) / completed.length) * 1000) / 1000
    : 0;

  state.avgDurationMs = completed.length > 0
    ? Math.round(completed.reduce((s, r) => s + r.durationMs, 0) / completed.length)
    : 0;
}

export function getShadowState(): ShadowModuleState {
  recalculate();
  return { ...state };
}

export function getShadowHealth(): number {
  if (!state.initialized) return 0;
  recalculate();
  // Health based on success rate and divergence
  const base = state.successRate;
  const divergencePenalty = state.avgDivergence * 100; // 10% divergence = 10 points penalty
  const h = clampNumber(base - divergencePenalty, 0, 100, 85);
  if (hardening?.isDegraded()) return Math.min(h, 40);
  return h;
}

export function getShadowResilience() {
  return getModuleResilienceReport('shadow', getShadowHealth());
}

export function getShadowEngine() {
  return moduleEngine;
}

export function getShadowHardening() {
  return hardening?.getHardeningReport() ?? null;
}

export function upgradeShadowEngine(v: string) {
  if (moduleEngine && hardening) {
    hardening.snapshot(state);
    moduleEngine = hardening.upgradeEngine(moduleEngine, v);
  }
  return moduleEngine;
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

export function getRecentRuns(limit = 20): ShadowRun[] {
  return state.recentRuns.slice(-limit);
}

export function getActiveRuns(): ShadowRun[] {
  return state.activeRuns;
}

export function getRun(runId: string): ShadowRun | undefined {
  return state.recentRuns.find(r => r.id === runId);
}
