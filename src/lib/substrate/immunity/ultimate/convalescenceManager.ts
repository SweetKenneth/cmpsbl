/**
 * IMMUNITY Ultimate — Convalescence Manager
 * 
 * Manages recovery after threat neutralization.
 * - Recovery plan generation
 * - State integrity verification
 * - Performance baseline comparison
 * - Post-incident immune strengthening
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RecoveryPlan {
  id: string;
  incidentId: string;
  affectedNodes: string[];
  steps: RecoveryStep[];
  status: 'planned' | 'executing' | 'completed' | 'failed';
  startedAt: number | null;
  completedAt: number | null;
  integrityVerified: boolean;
  performanceRestored: boolean;
}

export interface RecoveryStep {
  order: number;
  nodeId: string;
  action: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  startedAt: number | null;
  completedAt: number | null;
}

export interface IntegrityCheck {
  nodeId: string;
  stateValid: boolean;
  corruptionDetected: boolean;
  residualThreats: string[];
  checkedAt: number;
}

export interface ConvalescenceHealth {
  activePlans: number;
  completedPlans: number;
  failedPlans: number;
  avgRecoveryTimeMs: number;
  integrityPassRate: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const EMA_ALPHA = 0.2;
const MAX_PLANS = 200;

const recoveryPlans = new Map<string, RecoveryPlan>();
const integrityChecks = new Map<string, IntegrityCheck[]>(); // nodeId → checks
let completedCount = 0;
let failedCount = 0;
let avgRecoveryTimeEma = 0;
let integrityPassEma = 1.0;

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Generate a recovery plan for an incident */
export function generatePlan(
  incidentId: string,
  affectedNodes: string[],
): RecoveryPlan {
  const steps: RecoveryStep[] = [];
  let order = 0;

  for (const nodeId of affectedNodes) {
    steps.push(
      { order: order++, nodeId, action: 'verify_state', description: 'Verify node state integrity', status: 'pending', startedAt: null, completedAt: null },
      { order: order++, nodeId, action: 'clear_residual', description: 'Clear residual threat artifacts', status: 'pending', startedAt: null, completedAt: null },
      { order: order++, nodeId, action: 'restore_baseline', description: 'Restore performance baseline', status: 'pending', startedAt: null, completedAt: null },
      { order: order++, nodeId, action: 'strengthen_immunity', description: 'Apply post-incident immune hardening', status: 'pending', startedAt: null, completedAt: null },
    );
  }

  const plan: RecoveryPlan = {
    id: `rp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    incidentId,
    affectedNodes: [...affectedNodes],
    steps,
    status: 'planned',
    startedAt: null,
    completedAt: null,
    integrityVerified: false,
    performanceRestored: false,
  };

  recoveryPlans.set(plan.id, plan);

  // Evict old plans
  if (recoveryPlans.size > MAX_PLANS) {
    const oldest = Array.from(recoveryPlans.entries())
      .filter(([, p]) => p.status === 'completed' || p.status === 'failed')
      .sort((a, b) => (a[1].completedAt ?? 0) - (b[1].completedAt ?? 0))[0];
    if (oldest) recoveryPlans.delete(oldest[0]);
  }

  return plan;
}

/** Start executing a recovery plan */
export function startPlan(planId: string): boolean {
  const plan = recoveryPlans.get(planId);
  if (!plan || plan.status !== 'planned') return false;
  plan.status = 'executing';
  plan.startedAt = Date.now();
  return true;
}

/** Complete a recovery step */
export function completeStep(planId: string, stepOrder: number, success: boolean): boolean {
  const plan = recoveryPlans.get(planId);
  if (!plan || plan.status !== 'executing') return false;

  const step = plan.steps.find(s => s.order === stepOrder);
  if (!step) return false;

  step.status = success ? 'done' : 'failed';
  step.completedAt = Date.now();

  // Check if all steps done
  const allDone = plan.steps.every(s => s.status === 'done' || s.status === 'failed');
  if (allDone) {
    const anyFailed = plan.steps.some(s => s.status === 'failed');
    plan.status = anyFailed ? 'failed' : 'completed';
    plan.completedAt = Date.now();

    if (plan.status === 'completed') {
      completedCount++;
      plan.integrityVerified = true;
      plan.performanceRestored = true;
    } else {
      failedCount++;
    }

    // Update recovery time EMA
    if (plan.startedAt) {
      const duration = (plan.completedAt ?? Date.now()) - plan.startedAt;
      avgRecoveryTimeEma = avgRecoveryTimeEma === 0
        ? duration
        : EMA_ALPHA * duration + (1 - EMA_ALPHA) * avgRecoveryTimeEma;
    }
  }

  return true;
}

/** Record integrity check for a node */
export function recordIntegrityCheck(
  nodeId: string,
  stateValid: boolean,
  corruptionDetected: boolean,
  residualThreats: string[] = [],
): IntegrityCheck {
  const check: IntegrityCheck = {
    nodeId,
    stateValid,
    corruptionDetected,
    residualThreats,
    checkedAt: Date.now(),
  };

  const checks = integrityChecks.get(nodeId) ?? [];
  checks.push(check);
  if (checks.length > 50) checks.shift();
  integrityChecks.set(nodeId, checks);

  // Update integrity pass rate
  integrityPassEma = EMA_ALPHA * (stateValid ? 1 : 0) + (1 - EMA_ALPHA) * integrityPassEma;

  return check;
}

/** Get a recovery plan */
export function getPlan(planId: string): RecoveryPlan | null {
  return recoveryPlans.get(planId) ?? null;
}

/** Get active plans */
export function getActivePlans(): RecoveryPlan[] {
  return Array.from(recoveryPlans.values()).filter(p => p.status === 'executing');
}

/** Get convalescence health */
export function getConvalescenceHealth(): ConvalescenceHealth {
  return {
    activePlans: Array.from(recoveryPlans.values()).filter(p => p.status === 'executing').length,
    completedPlans: completedCount,
    failedPlans: failedCount,
    avgRecoveryTimeMs: Math.round(avgRecoveryTimeEma),
    integrityPassRate: Math.round(integrityPassEma * 100) / 100,
  };
}
