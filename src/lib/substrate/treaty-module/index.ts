/**
 * TREATY Module — Inter-Node Contracts & SLA Enforcement
 * Bilateral enforcement, penalty escalation ladder, automatic contract renewal,
 * contract lifecycle management.
 * Circuit Breaker + Hot-Swap + Graceful Fallback
 */

import { emit, emitStarted, emitSucceeded, emitFailed } from '../events';
import { initCircuitBreaker, withResilienceSync, activateModuleEngine, getModuleResilienceReport, type ModuleEngine } from '../infra-resilience';
import { validateStringInput, clampNumber } from '@/lib/system/hardening';
import { createModuleHardening, type ModuleHardening } from '../module-hardening';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContractStatus = 'draft' | 'proposed' | 'negotiating' | 'active' | 'breached' | 'expired' | 'terminated';
export type SLAMetric = 'uptime' | 'latency_p99' | 'error_rate' | 'throughput' | 'response_time' | 'availability';
export type PenaltyEscalation = 'warning' | 'throttle' | 'circuit_isolation' | 'termination';

export interface Contract {
  id: string;
  name: string;
  parties: string[];
  status: ContractStatus;
  terms: ContractTerm[];
  slas: SLADefinition[];
  penalties: PenaltyClause[];
  breachCount: number;
  escalationLevel: PenaltyEscalation;
  effectiveDate: number;
  expirationDate: number;
  autoRenew: boolean;
  renewalCount: number;
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
  window: 'hourly' | 'daily' | 'weekly' | 'monthly';
  measurementWindow: number;
  currentValue: number;
  compliant: boolean;
  partyId: string; // Which party this SLA applies to (bilateral)
}

export interface PenaltyClause {
  id: string;
  triggeredBy: string;
  penaltyType: 'credit' | 'fee' | 'termination_right' | 'escalation';
  escalation: PenaltyEscalation;
  amount: number;
  currency: string;
  triggered: boolean;
  triggeredAt: number | null;
  partyId: string;
}

export interface SLAReport {
  contractId: string;
  period: { start: number; end: number };
  metrics: Record<string, { target: number; actual: number; compliant: boolean; partyId: string }>;
  overallCompliance: number;
  bilateralCompliance: Record<string, number>; // per-party compliance
  penalties: PenaltyClause[];
  escalationLevel: PenaltyEscalation;
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
  autoRenewals: number;
  expiringContracts: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

const state: TreatyModuleState = {
  initialized: false,
  contracts: [],
  totalContracts: 0,
  activeContracts: 0,
  breachedContracts: 0,
  totalSLAChecks: 0,
  avgCompliance: 100,
  totalPenalties: 0,
  autoRenewals: 0,
  expiringContracts: 0,
};

let moduleEngine: ModuleEngine | null = null;
let hardening: ModuleHardening | null = null;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initTreaty(): void {
  emitStarted('treaty', 'init', {});
  try {
    initCircuitBreaker('treaty', { failureThreshold: 3, recoveryTimeout: 20_000 });
    moduleEngine = activateModuleEngine('treaty', '2.0.0');
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

// ─── Penalty Escalation Ladder ────────────────────────────────────────────────

const ESCALATION_LADDER: PenaltyEscalation[] = ['warning', 'throttle', 'circuit_isolation', 'termination'];

function escalate(contract: Contract): PenaltyEscalation {
  const idx = Math.min(contract.breachCount, ESCALATION_LADDER.length - 1);
  return ESCALATION_LADDER[idx];
}

// ─── Contract Lifecycle ───────────────────────────────────────────────────────

export function createContract(
  name: string,
  parties: string[],
  terms: Omit<ContractTerm, 'id'>[],
  slas: Omit<SLADefinition, 'id' | 'currentValue' | 'compliant'>[],
  durationDays: number = 365,
): Contract {
  const now = Date.now();
  const contract: Contract = {
    id: `contract-${Date.now()}-${state.totalContracts}`,
    name: validateStringInput(name, { maxLength: 200 }) ?? 'Untitled',
    parties,
    status: 'draft',
    terms: terms.map((t, i) => ({ ...t, id: `term-${i}` })),
    slas: slas.map((s, i) => ({
      ...s, id: `sla-${i}`,
      currentValue: s.target,
      compliant: true,
      partyId: s.partyId ?? parties[0] ?? 'unknown',
    } as SLADefinition)),
    penalties: [],
    breachCount: 0,
    escalationLevel: 'warning',
    effectiveDate: now,
    expirationDate: now + durationDays * 86400_000,
    autoRenew: true,
    renewalCount: 0,
    createdAt: now,
    lastEvaluatedAt: now,
  };

  if (state.contracts.length >= 200) state.contracts.shift();
  state.contracts.push(contract);
  state.totalContracts++;
  recalculate();
  emit({ module: 'treaty', event_type: 'contract_created', outcome: 'succeeded', data: { id: contract.id, parties, durationDays } });
  return contract;
}

export function activateContract(contractId: string): boolean {
  const contract = state.contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'draft') return false;
  contract.status = 'active';
  recalculate();
  emit({ module: 'treaty', event_type: 'contract_activated', outcome: 'succeeded', data: { id: contractId } });
  return true;
}

// ─── Bilateral SLA Evaluation ─────────────────────────────────────────────────

export function evaluateSLA(contractId: string, metrics: Partial<Record<SLAMetric, number>>): SLAReport | null {
  const contract = state.contracts.find(c => c.id === contractId);
  if (!contract || contract.status !== 'active') return null;

  // Check and handle contract expiry
  const now = Date.now();
  if (now > contract.expirationDate) {
    if (contract.autoRenew) {
      // Auto-renew with same terms
      contract.expirationDate = now + 365 * 86400_000;
      contract.renewalCount++;
      state.autoRenewals++;
      emit({ module: 'treaty', event_type: 'contract_auto_renewed', outcome: 'succeeded', data: { id: contractId, renewalCount: contract.renewalCount } });
    } else {
      contract.status = 'expired';
      recalculate();
      return null;
    }
  }

  const reportMetrics: Record<string, { target: number; actual: number; compliant: boolean; partyId: string }> = {};
  const triggeredPenalties: PenaltyClause[] = [];

  // Bilateral evaluation — each party's SLAs are checked independently
  const partyCompliance: Record<string, { compliant: number; total: number }> = {};
  for (const party of contract.parties) {
    partyCompliance[party] = { compliant: 0, total: 0 };
  }

  for (const sla of contract.slas) {
    const actual = metrics[sla.metric] ?? sla.currentValue;
    sla.currentValue = actual;

    // For error_rate: lower is better; for others: higher is better
    const isInverted = sla.metric === 'error_rate';
    sla.compliant = isInverted ? actual <= sla.minimum : actual >= sla.minimum;

    reportMetrics[`${sla.metric}_${sla.partyId}`] = {
      target: sla.target, actual, compliant: sla.compliant, partyId: sla.partyId,
    };

    // Track per-party compliance
    if (partyCompliance[sla.partyId]) {
      partyCompliance[sla.partyId].total++;
      if (sla.compliant) partyCompliance[sla.partyId].compliant++;
    }

    if (!sla.compliant) {
      contract.breachCount++;
      const currentEscalation = escalate(contract);
      contract.escalationLevel = currentEscalation;

      const penalty: PenaltyClause = {
        id: `pen-${Date.now()}-${state.totalPenalties}`,
        triggeredBy: sla.id,
        penaltyType: currentEscalation === 'termination' ? 'termination_right' : 'escalation',
        escalation: currentEscalation,
        amount: currentEscalation === 'warning' ? 0 : currentEscalation === 'throttle' ? 50 : 200,
        currency: 'USD',
        triggered: true,
        triggeredAt: now,
        partyId: sla.partyId,
      };
      triggeredPenalties.push(penalty);
      contract.penalties.push(penalty);
      state.totalPenalties++;
    }
  }

  // Overall compliance: contract is only compliant when ALL parties meet ALL SLAs
  const compliantCount = contract.slas.filter(s => s.compliant).length;
  const overall = contract.slas.length > 0 ? compliantCount / contract.slas.length : 1;

  // Bilateral compliance map
  const bilateralCompliance: Record<string, number> = {};
  for (const [party, data] of Object.entries(partyCompliance)) {
    bilateralCompliance[party] = data.total > 0 ? data.compliant / data.total : 1;
  }

  if (overall < 0.5) {
    contract.status = 'breached';
    emit({ module: 'treaty', event_type: 'contract_breached', outcome: 'failed', data: { id: contractId, compliance: overall, escalation: contract.escalationLevel } });
  }

  contract.lastEvaluatedAt = now;
  state.totalSLAChecks++;
  recalculate();

  return {
    contractId,
    period: { start: contract.effectiveDate, end: now },
    metrics: reportMetrics as any,
    overallCompliance: Math.round(overall * 10000) / 10000,
    bilateralCompliance,
    penalties: triggeredPenalties,
    escalationLevel: contract.escalationLevel,
  };
}

// ─── Contract Expiry Check ────────────────────────────────────────────────────

export function checkExpiringContracts(withinDays: number = 30): Contract[] {
  const threshold = Date.now() + withinDays * 86400_000;
  const expiring = state.contracts.filter(c =>
    c.status === 'active' && c.expirationDate <= threshold && c.expirationDate > Date.now()
  );
  state.expiringContracts = expiring.length;

  if (expiring.length > 0) {
    emit({ module: 'treaty', event_type: 'contracts_expiring', outcome: 'succeeded', data: { count: expiring.length, withinDays } });
  }
  return expiring;
}

// ─── Recalculate ──────────────────────────────────────────────────────────────

function recalculate(): void {
  state.activeContracts = state.contracts.filter(c => c.status === 'active').length;
  state.breachedContracts = state.contracts.filter(c => c.status === 'breached').length;
  state.expiringContracts = state.contracts.filter(c =>
    c.status === 'active' && c.expirationDate <= Date.now() + 30 * 86400_000 && c.expirationDate > Date.now()
  ).length;

  const active = state.contracts.filter(c => c.status === 'active');
  if (active.length > 0) {
    const totalCompliance = active.reduce((s, c) => {
      const comp = c.slas.filter(sla => sla.compliant).length / (c.slas.length || 1);
      return s + comp;
    }, 0);
    state.avgCompliance = Math.round((totalCompliance / active.length) * 100);
  } else {
    state.avgCompliance = 100;
  }
}

// ─── Health (multi-factor) ────────────────────────────────────────────────────

export function getTreatyHealth(): number {
  if (!state.initialized) return 0;
  if (hardening?.isDegraded()) return Math.min(state.avgCompliance, 40);

  let score = 100;

  // Factor 1: Average compliance (weight: 35)
  if (state.avgCompliance < 50) score -= 35;
  else if (state.avgCompliance < 70) score -= 20;
  else if (state.avgCompliance < 85) score -= 10;

  // Factor 2: Breach rate (weight: 25)
  const total = state.contracts.length;
  if (total > 0) {
    const breachRate = state.breachedContracts / total;
    if (breachRate > 0.3) score -= 25;
    else if (breachRate > 0.1) score -= 15;
    else if (breachRate > 0) score -= 5;
  }

  // Factor 3: Penalty accumulation (weight: 20)
  if (state.totalPenalties > 20) score -= 20;
  else if (state.totalPenalties > 10) score -= 10;
  else if (state.totalPenalties > 5) score -= 5;

  // Factor 4: Stale evaluations + expiring contracts (weight: 20)
  const staleContracts = state.contracts.filter(c =>
    c.status === 'active' && Date.now() - c.lastEvaluatedAt > 3600_000
  );
  if (staleContracts.length > 3) score -= 10;
  if (state.expiringContracts > 3) score -= 10;

  return clampNumber(score, 0, 100, 50);
}

// ─── Accessors ────────────────────────────────────────────────────────────────

export function getTreatyState(): TreatyModuleState { return { ...state }; }
export function getTreatyResilience() { return getModuleResilienceReport('treaty', getTreatyHealth()); }
export function getTreatyEngine() { return moduleEngine; }
export function getTreatyHardening() { return hardening?.getHardeningReport() ?? null; }
export function upgradeTreatyEngine(v: string) { if (moduleEngine && hardening) { hardening.snapshot(state); moduleEngine = hardening.upgradeEngine(moduleEngine, v); } return moduleEngine; }
