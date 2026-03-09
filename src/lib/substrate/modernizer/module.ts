/**
 * MODERNIZER Module — Architecture Modernization & Codebase Evolution
 * Scan, analyze, propose, shadow-validate, and promote improvements
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { clampNumber, validateStringInput } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

export type ScanDepth = 'quick' | 'standard' | 'deep';
export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'applied' | 'rolled_back';

export interface ModernizerScan {
  id: string;
  depth: ScanDepth;
  targetModule: string | null;
  findingsCount: number;
  proposalsGenerated: number;
  riskScore: number;
  scannedAt: number;
  durationMs: number;
}

export interface ModernizerProposal {
  id: string;
  scanId: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: ProposalStatus;
  confidence: number;
  createdAt: number;
  resolvedAt: number | null;
}

export interface ModernizerModuleState {
  initialized: boolean;
  scans: ModernizerScan[];
  proposals: ModernizerProposal[];
  totalScans: number;
  totalProposals: number;
  approvalRate: number;
  avgRiskScore: number;
  pendingProposals: number;
}

const state: ModernizerModuleState = {
  initialized: false,
  scans: [],
  proposals: [],
  totalScans: 0,
  totalProposals: 0,
  approvalRate: 0,
  avgRiskScore: 0,
  pendingProposals: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

export function initModernizer(): void {
  emitStarted('modernizer', 'init', {});
  try {
    initCircuitBreaker('modernizer', { failureThreshold: 3, recoveryTimeout: 60_000 });
    moduleEngine = activateModuleEngine('modernizer', '1.0.0');
    hardening = createModuleHardening('modernizer', { maxConcurrent: 6, rateLimit: 50, healthThreshold: 35 });
    state.initialized = true;
    hardening.startAutoRestore(() => getModernizerHealth(), () => { recalculate(); }, 60_000);
    hardening.snapshot(state);
    emitSucceeded('modernizer', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('modernizer', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function recordScan(depth: ScanDepth, targetModule: string | null, findingsCount: number, proposalsGenerated: number, durationMs: number): ModernizerScan {
  const scan: ModernizerScan = {
    id: `mscan-${Date.now()}-${state.totalScans}`,
    depth, targetModule, findingsCount, proposalsGenerated,
    riskScore: clampNumber(findingsCount * 5 + Math.random() * 20, 0, 100, 30),
    scannedAt: Date.now(), durationMs,
  };
  if (state.scans.length >= 100) state.scans.shift();
  state.scans.push(scan);
  state.totalScans++;
  recalculate();
  emit({ module: 'modernizer', event_type: 'scan_complete', outcome: 'succeeded', data: { id: scan.id, findings: findingsCount } });
  return scan;
}

export function recordProposal(scanId: string, title: string, description: string, riskLevel: ModernizerProposal['riskLevel'], confidence: number): ModernizerProposal {
  const proposal: ModernizerProposal = {
    id: `mprop-${Date.now()}-${state.totalProposals}`,
    scanId, title: (validateStringInput(title, { maxLength: 300 }) ?? 'Untitled'),
    description: (validateStringInput(description, { maxLength: 5000 }) ?? ''),
    riskLevel, status: 'pending',
    confidence: clampNumber(confidence, 0, 1, 0.5),
    createdAt: Date.now(), resolvedAt: null,
  };
  if (state.proposals.length >= 200) state.proposals.shift();
  state.proposals.push(proposal);
  state.totalProposals++;
  recalculate();
  return proposal;
}

export function resolveProposal(proposalId: string, status: 'approved' | 'rejected' | 'applied' | 'rolled_back'): boolean {
  const p = state.proposals.find(pr => pr.id === proposalId);
  if (!p) return false;
  p.status = status;
  p.resolvedAt = Date.now();
  recalculate();
  return true;
}

function recalculate(): void {
  const resolved = state.proposals.filter(p => p.resolvedAt);
  const approved = resolved.filter(p => p.status === 'approved' || p.status === 'applied');
  state.approvalRate = resolved.length > 0 ? Math.round((approved.length / resolved.length) * 100) : 0;
  state.pendingProposals = state.proposals.filter(p => p.status === 'pending').length;
  const recentScans = state.scans.slice(-20);
  state.avgRiskScore = recentScans.length > 0 ? Math.round(recentScans.reduce((s, sc) => s + sc.riskScore, 0) / recentScans.length) : 0;
}

export function getModernizerState(): ModernizerModuleState { recalculate(); return { ...state }; }
export function getModernizerHealth(): number {
  if (!state.initialized) return 0;
  recalculate();
  // Higher approval rate and lower risk = better health
  const base = state.totalProposals > 0 ? Math.max(50, state.approvalRate) : 85;
  const riskPenalty = Math.min(20, state.avgRiskScore / 5);
  const h = clampNumber(base - riskPenalty, 0, 100, 85);
  if (hardening?.isDegraded()) return Math.min(h, 40);
  return h;
}
export function getModernizerResilience() { return getModuleResilienceReport('modernizer', getModernizerHealth()); }
export function getModernizerEngine() { return moduleEngine; }
export function getModernizerHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeModernizerEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }
