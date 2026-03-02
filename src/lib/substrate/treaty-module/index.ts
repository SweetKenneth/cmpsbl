/**
 * TREATY Module — Multi-Tenant Contract Negotiation & SLA Enforcement
 * Machine-to-machine legal primitives, SLA monitoring, penalty calculation
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

export type ContractStatus = 'draft' | 'proposed' | 'negotiating' | 'active' | 'breached' | 'expired' | 'terminated';
export type SLAMetric = 'uptime' | 'latency_p99' | 'error_rate' | 'throughput' | 'response_time' | 'availability';

export interface Contract {
  id: string;
  name: string;
  parties: string[];
  status: ContractStatus;
  terms: ContractTerm[];
  slas: SLADefinition[];
  penalties: PenaltyClause[];
  effectiveDate: number;
  expirationDate: number;
  createdAt: number;
  lastEvaluatedAt: number;
}

export interface ContractTerm {
  id: string;
  clause: string;
  obligor: string;
  obligee: string;
  metric: string;
  threshold: number;
  unit: string;
  enforceable: boolean;
}

export interface SLADefinition {
  id: string;
  metric: SLAMetric;
  target: number;
  minimum: number;
  measurementWindow: number;
  currentValue: number;
  compliant: boolean;
}

export interface PenaltyClause {
  id: string;
  triggeredBy: string;
  penaltyType: 'credit' | 'fee' | 'termination_right' | 'escalation';
  amount: number;
  currency: string;
  triggered: boolean;
  triggeredAt: number | null;
}

export interface SLAReport {
  contractId: string;
  period: { start: number; end: number };
  metrics: Record<SLAMetric, { target: number; actual: number; compliant: boolean }>;
  overallCompliance: number;
  penalties: PenaltyClause[];
}

export interface TreatyModuleState {
  initialized: boolean;
  contracts: Contract[];
  totalContracts: number;
  activeContracts: number;
  breachedContracts: number;
  totalSLAChecks: number;
  avgCompliance: number;
  totalPenalties: number;
}

const state: TreatyModuleState = {
  initialized: false,
  contracts: [],
  totalContracts: 0,
  activeContracts: 0,
  breachedContracts: 0,
  totalSLAChecks: 0,
  avgCompliance: 100,
  totalPenalties: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

export function initTreaty(): void {
  emitStarted('treaty', 'init', {});
  try {
    initCircuitBreaker('treaty', { failureThreshold: 3, recoveryTimeout: 20_000 });
    moduleEngine = activateModuleEngine('treaty', '1.0.0');
    hardening = createModuleHardening('treaty', { maxConcurrent: 8, rateLimit: 50, healthThreshold: 40 });
    state.initialized = true;
    hardening.startAutoRestore(() => getTreatyHealth(), () => { state.avgCompliance = 100; state.breachedContracts = 0; }, 30_000);
    hardening.snapshot(state);
    emitSucceeded('treaty', 'init', { engineId: moduleEngine.instance.id });
  } catch (err) {
    state.initialized = true;
    emitFailed('treaty', 'init', err instanceof Error ? err.message : String(err));
  }
}

export function createContract(name: string, parties: string[], terms: Omit<ContractTerm, 'id'>[], slas: Omit<SLADefinition, 'id' | 'currentValue' | 'compliant'>[], durationDays: number = 365): Contract {
  const now = Date.now();
  const contract: Contract = {
    id: `contract-${Date.now()}-${state.totalContracts}`,
    name: validateStringInput(name, { maxLength: 200 }) ?? 'Untitled',
    parties, status: 'draft',
    terms: terms.map((t, i) => ({ ...t, id: `term-${i}` })),
    slas: slas.map((s, i) => ({ ...s, id: `sla-${i}`, currentValue: s.target, compliant: true })),
    penalties: [],
    effectiveDate: now,
    expirationDate: now + durationDays * 86400_000,
    createdAt: now,
    lastEvaluatedAt: now,
  };

  if (state.contracts.length >= 200) state.contracts.shift();
  state.contracts.push(contract);
  state.totalContracts++;
  recalculate();
  emit({ module: 'treaty', event_type: 'contract_created', outcome: 'succeeded', data: { id: contract.id, parties } });
  return contract;
}

export function activateContract(contractId: string): boolean {
  const contract = state.contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'draft') return false;
  contract.status = 'active';
  state.activeContracts++;
  emit({ module: 'treaty', event_type: 'contract_activated', outcome: 'succeeded', data: { id: contractId } });
  return true;
}

export function evaluateSLA(contractId: string, metrics: Partial<Record<SLAMetric, number>>): SLAReport | null {
  const contract = state.contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'active') return null;

  const reportMetrics: Record<string, { target: number; actual: number; compliant: boolean }> = {};
  const triggeredPenalties: PenaltyClause[] = [];

  for (const sla of contract.slas) {
    const actual = metrics[sla.metric] ?? sla.currentValue;
    sla.currentValue = actual;
    sla.compliant = actual >= sla.minimum;
    reportMetrics[sla.metric] = { target: sla.target, actual, compliant: sla.compliant };

    if (!sla.compliant) {
      const penalty: PenaltyClause = {
        id: `pen-${Date.now()}-${state.totalPenalties}`, triggeredBy: sla.id,
        penaltyType: 'credit', amount: 100, currency: 'USD', triggered: true, triggeredAt: Date.now(),
      };
      triggeredPenalties.push(penalty);
      contract.penalties.push(penalty);
      state.totalPenalties++;
    }
  }

  const compliantCount = contract.slas.filter(s => s.compliant).length;
  const overall = contract.slas.length > 0 ? compliantCount / contract.slas.length : 1;

  if (overall < 0.5) {
    contract.status = 'breached';
    state.breachedContracts++;
  }

  contract.lastEvaluatedAt = Date.now();
  state.totalSLAChecks++;
  recalculate();

  return {
    contractId, period: { start: contract.effectiveDate, end: Date.now() },
    metrics: reportMetrics as Record<SLAMetric, { target: number; actual: number; compliant: boolean }>,
    overallCompliance: overall, penalties: triggeredPenalties,
  };
}

function recalculate(): void {
  state.activeContracts = state.contracts.filter(c => c.status === 'active').length;
  state.breachedContracts = state.contracts.filter(c => c.status === 'breached').length;
  const active = state.contracts.filter(c => c.status === 'active');
  if (active.length > 0) {
    const totalCompliance = active.reduce((s, c) => {
      const comp = c.slas.filter(sla => sla.compliant).length / (c.slas.length || 1);
      return s + comp;
    }, 0);
    state.avgCompliance = Math.round((totalCompliance / active.length) * 100);
  }
}

export function getTreatyState(): TreatyModuleState { return { ...state }; }
export function getTreatyHealth(): number { if (!state.initialized) return 0; if (hardening?.isDegraded()) return Math.min(state.avgCompliance, 40); return state.avgCompliance; }
export function getTreatyResilience() { return getModuleResilienceReport('treaty', getTreatyHealth()); }
export function getTreatyEngine() { return moduleEngine; }
export function getTreatyHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeTreatyEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }
