/**
 * MEDIC — Organ Transplant Orchestrator
 * Managed hot-swap of degraded subsystems:
 * snapshot → spin up replacement → validate → cutover → drain old.
 * @module medic/organTransplantOrchestrator
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type TransplantPhase =
  | 'IDLE'
  | 'SNAPSHOT'
  | 'PROVISIONING'
  | 'VALIDATING'
  | 'CUTOVER'
  | 'DRAINING'
  | 'COMPLETE'
  | 'ROLLBACK'
  | 'FAILED';

export interface TransplantPlan {
  id: string;
  targetNodeId: string;
  reason: string;
  snapshotData: Record<string, unknown> | null;
  phase: TransplantPhase;
  startedAt: number;
  completedAt: number | null;
  healthChecksPassed: number;
  healthChecksRequired: number;
  rolledBack: boolean;
}

export interface TransplantResult {
  planId: string;
  success: boolean;
  phase: TransplantPhase;
  durationMs: number;
  error?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const HEALTH_CHECKS_REQUIRED = 3;
const VALID_TRANSITIONS: Record<TransplantPhase, TransplantPhase[]> = {
  IDLE: ['SNAPSHOT'],
  SNAPSHOT: ['PROVISIONING', 'FAILED'],
  PROVISIONING: ['VALIDATING', 'FAILED'],
  VALIDATING: ['CUTOVER', 'ROLLBACK'],
  CUTOVER: ['DRAINING', 'ROLLBACK'],
  DRAINING: ['COMPLETE', 'ROLLBACK'],
  COMPLETE: ['IDLE'],
  ROLLBACK: ['IDLE', 'FAILED'],
  FAILED: ['IDLE'],
};

// ── State ──────────────────────────────────────────────────────────────────

const activePlans = new Map<string, TransplantPlan>();
const completedPlans: TransplantResult[] = [];
let idCounter = 0;

// ── Core ───────────────────────────────────────────────────────────────────

function genId(): string {
  return `transplant-${++idCounter}-${Date.now().toString(36)}`;
}

function transition(plan: TransplantPlan, target: TransplantPhase): boolean {
  const allowed = VALID_TRANSITIONS[plan.phase];
  if (!allowed?.includes(target)) return false;
  plan.phase = target;
  return true;
}

export function initiateTransplant(targetNodeId: string, reason: string): TransplantPlan {
  const plan: TransplantPlan = {
    id: genId(),
    targetNodeId,
    reason,
    snapshotData: null,
    phase: 'IDLE',
    startedAt: Date.now(),
    completedAt: null,
    healthChecksPassed: 0,
    healthChecksRequired: HEALTH_CHECKS_REQUIRED,
    rolledBack: false,
  };
  activePlans.set(plan.id, plan);
  transition(plan, 'SNAPSHOT');
  return { ...plan };
}

export function captureSnapshot(planId: string, stateData: Record<string, unknown>): boolean {
  const plan = activePlans.get(planId);
  if (!plan || plan.phase !== 'SNAPSHOT') return false;
  plan.snapshotData = { ...stateData };
  return transition(plan, 'PROVISIONING');
}

export function provisionComplete(planId: string): boolean {
  const plan = activePlans.get(planId);
  if (!plan || plan.phase !== 'PROVISIONING') return false;
  return transition(plan, 'VALIDATING');
}

export function recordHealthCheck(planId: string, passed: boolean): TransplantPhase | null {
  const plan = activePlans.get(planId);
  if (!plan || plan.phase !== 'VALIDATING') return null;

  if (passed) {
    plan.healthChecksPassed++;
    if (plan.healthChecksPassed >= plan.healthChecksRequired) {
      transition(plan, 'CUTOVER');
    }
  } else {
    // Failed health check → rollback
    plan.rolledBack = true;
    transition(plan, 'ROLLBACK');
  }
  return plan.phase;
}

export function executeCutover(planId: string): boolean {
  const plan = activePlans.get(planId);
  if (!plan || plan.phase !== 'CUTOVER') return false;
  return transition(plan, 'DRAINING');
}

export function drainComplete(planId: string): TransplantResult {
  const plan = activePlans.get(planId);
  if (!plan) {
    return { planId, success: false, phase: 'FAILED', durationMs: 0, error: 'Plan not found' };
  }

  if (plan.phase === 'DRAINING') {
    transition(plan, 'COMPLETE');
  }

  plan.completedAt = Date.now();
  const result: TransplantResult = {
    planId: plan.id,
    success: plan.phase === 'COMPLETE',
    phase: plan.phase,
    durationMs: plan.completedAt - plan.startedAt,
    error: plan.rolledBack ? 'Rolled back due to failed health checks' : undefined,
  };

  completedPlans.push(result);
  activePlans.delete(planId);
  return result;
}

export function rollback(planId: string): TransplantResult {
  const plan = activePlans.get(planId);
  if (!plan) {
    return { planId, success: false, phase: 'FAILED', durationMs: 0, error: 'Plan not found' };
  }

  plan.rolledBack = true;
  transition(plan, 'ROLLBACK');
  return drainComplete(planId);
}

export function getActivePlans(): TransplantPlan[] {
  return Array.from(activePlans.values()).map(p => ({ ...p }));
}

export function getCompletedPlans(): TransplantResult[] {
  return [...completedPlans];
}

export function resetTransplants(): void {
  activePlans.clear();
  completedPlans.length = 0;
  idCounter = 0;
}
