/**
 * Intelligence Metric Types — Immunity Mesh Observability
 * DKD, FNR, RMI, CKP, IIL, MRI definitions
 * Feature flag: IMMUNITY_INTEL_METRICS (default ON)
 */

export type IntelMode = 'normal' | 'shadow_probe' | 'adversarial' | 'replay';
export type IntelOutcome = 'success' | 'safe_fail' | 'repaired_success' | 'repair_failed' | 'escalation' | 'skipped';
export type IntelRepairType = 'deterministic' | 'shared' | 'legacy' | 'adaptive' | null;

export interface IntelligenceEvent {
  executor_id: string;
  is_shadow_mesh: boolean;
  mode: IntelMode;
  outcome: IntelOutcome;
  repair_type: IntelRepairType;
  rule_id: string | null;
  failure_signature_hash: string | null;
  escalation_severity: string | null;
  duration_ms: number | null;
  meta: Record<string, unknown>;
}

// ── Metric Result Types ──

export interface DKDResult {
  global: number | null;
  byRepairType: Record<string, number>;
  perExecutor: Record<string, number>;
  coveredFailures: number;
  totalFailures: number;
}

export interface FNRResult {
  global: number | null;
  perExecutor: Record<string, number>;
  novelSignatures: number;
  totalSignatures: number;
}

export interface RuleHealth {
  ruleId: string;
  invocations: number;
  successRate: number;
  executorCount: number;
  isDominant: boolean;
  isRisky: boolean;
}

export interface RMIResult {
  dominantRules: RuleHealth[];
  riskyRules: RuleHealth[];
}

export interface CKPResult {
  globalAvg: number | null;
  topPropagated: Array<{ ruleId: string; executorCount: number }>;
}

export interface IILResult {
  preflightBlocks: number;
  postcheckBlocks: number;
  safeFails: number;
  repairedSuccess: number;
  repairFailures: number;
  escalationsBySeverity: Record<string, number>;
  totalEvents: number;
}

export interface MRIResult {
  score: number;
  status: 'not_ready' | 'caution' | 'ready';
  factors: {
    dkd: number;
    fnrInverse: number;
    escalationRateInverse: number;
    repairSuccessRate: number;
    cascadeRateInverse: number;
  };
}

export interface IntelligenceDashboardData {
  dkd: DKDResult;
  fnr: FNRResult;
  rmi: RMIResult;
  ckp: CKPResult;
  iil: IILResult;
  mri: MRIResult;
  totalEvents: number;
  windowHours: number;
}

// Feature flag
export const IMMUNITY_INTEL_METRICS = true;
