/**
 * ATLAS Module — Governance Authority & System Control
 * Wraps governance-hub with standard substrate patterns:
 * init, health, resilience, engine hot-swap.
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';
import { getAtlasState, getPendingProposals, getProposalHistory } from './governance-hub';

export interface AtlasModuleState {
  initialized: boolean;
  governanceMode: string;
  pendingProposals: number;
  totalDecisions: number;
  approvalRate: number;
  rejectionRate: number;
  avgDecisionLatencyMs: number;
  sebaEnabled: boolean;
  clmThrottle: number;
  evolutionVelocity: number;
}

const moduleState: AtlasModuleState = {
  initialized: false,
  governanceMode: 'ACTIVE',
  pendingProposals: 0,
  totalDecisions: 0,
  approvalRate: 0,
  rejectionRate: 0,
  avgDecisionLatencyMs: 0,
  sebaEnabled: true,
  clmThrottle: 1.0,
  evolutionVelocity: 5,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

export function initAtlas(): void {
  emitStarted('atlas', 'init', {});
  try {
    initCircuitBreaker('atlas', { failureThreshold: 3, recoveryTimeout: 60_000 });
    moduleEngine = activateModuleEngine('atlas', '1.0.0');
    hardening = createModuleHardening('atlas', { maxConcurrent: 4, rateLimit: 30, healthThreshold: 40 });
    moduleState.initialized = true;
    hardening.startAutoRestore(() => getAtlasHealth(), () => { recalculate(); }, 60_000);
    hardening.snapshot(moduleState);
    emitSucceeded('atlas', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    moduleState.initialized = true;
    emitFailed('atlas', 'init', err instanceof Error ? err.message : String(err));
  }
}

function recalculate(): void {
  const hubState = getAtlasState();
  moduleState.governanceMode = hubState.mode;
  moduleState.sebaEnabled = hubState.sebaEnabled;
  moduleState.clmThrottle = hubState.clmThrottle;
  moduleState.evolutionVelocity = hubState.evolutionVelocity;
  moduleState.pendingProposals = hubState.pendingProposals;
  moduleState.totalDecisions = hubState.totalDecisions;

  const history = getProposalHistory(50);
  const decided = history.filter(p => p.governorDecision);
  const approved = decided.filter(p => p.status === 'approved');
  const rejected = decided.filter(p => p.status === 'rejected');
  moduleState.approvalRate = decided.length > 0 ? Math.round((approved.length / decided.length) * 100) : 0;
  moduleState.rejectionRate = decided.length > 0 ? Math.round((rejected.length / decided.length) * 100) : 0;

  const withLatency = decided.filter(p => p.governorDecision);
  moduleState.avgDecisionLatencyMs = withLatency.length > 0
    ? Math.round(withLatency.reduce((s, p) => s + ((p.governorDecision!.decidedAt) - p.createdAt), 0) / withLatency.length)
    : 0;
}

export function getAtlasModuleState(): AtlasModuleState { recalculate(); return { ...moduleState }; }

export function getAtlasHealth(): number {
  if (!moduleState.initialized) return 0;
  recalculate();
  // Health: penalize high pending backlog and lockdown mode
  let h = 90;
  if (moduleState.pendingProposals > 20) h -= 15;
  else if (moduleState.pendingProposals > 10) h -= 5;
  if (moduleState.governanceMode === 'LOCKDOWN') h -= 10;
  h = clampNumber(h, 0, 100, 85);
  if (hardening?.isDegraded()) return Math.min(h, 40);
  return h;
}

export function getAtlasResilience() { return getModuleResilienceReport('atlas', getAtlasHealth()); }
export function getAtlasEngine() { return moduleEngine; }
export function getAtlasHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeAtlasEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(moduleState); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }
