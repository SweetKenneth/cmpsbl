/**
 * INTENT Ultimate — System 6: Rollback Planning Engine
 * 
 * Every action plan ships with a rollback strategy — compensating actions,
 * checkpoint snapshots, or idempotent no-ops.
 * 
 * @module intent/ultimate/rollbackPlanner
 */

// ── Types ────────────────────────────────────────────────────────

export type RollbackStrategy = 'compensating' | 'checkpoint' | 'idempotent' | 'none';

export interface RollbackStep {
  actionId: string;
  strategy: RollbackStrategy;
  compensatingAction?: string;
  checkpointId?: string;
  description: string;
  estimatedDurationMs: number;
}

export interface RollbackPlan {
  id: string;
  actionPlanId: string;
  steps: RollbackStep[];
  totalEstimatedMs: number;
  status: 'ready' | 'executing' | 'completed' | 'failed' | 'unnecessary';
  createdAt: string;
  executedAt?: string;
}

export interface RollbackExecution {
  planId: string;
  stepsExecuted: number;
  stepsSucceeded: number;
  stepsFailed: number;
  totalDurationMs: number;
  errors: string[];
}

// ── State ────────────────────────────────────────────────────────

const rollbackPlans: Map<string, RollbackPlan> = new Map();
const checkpoints: Map<string, Record<string, unknown>> = new Map();
const executionHistory: RollbackExecution[] = [];
const MAX_PLANS = 200;
const MAX_CHECKPOINTS = 100;

// ── Core API ────────────────────────────────────────────────────

/** Create a rollback plan for an action plan */
export function createRollbackPlan(
  actionPlanId: string,
  actions: Array<{
    actionId: string;
    strategy: RollbackStrategy;
    compensatingAction?: string;
    description?: string;
  }>,
): RollbackPlan {
  const steps: RollbackStep[] = actions.map(a => ({
    actionId: a.actionId,
    strategy: a.strategy,
    compensatingAction: a.compensatingAction,
    description: a.description || `Rollback ${a.actionId} via ${a.strategy}`,
    estimatedDurationMs: a.strategy === 'compensating' ? 200 :
      a.strategy === 'checkpoint' ? 500 :
      a.strategy === 'idempotent' ? 50 : 0,
  }));

  // Reverse order — rollback happens in reverse
  steps.reverse();

  const plan: RollbackPlan = {
    id: crypto.randomUUID(),
    actionPlanId,
    steps,
    totalEstimatedMs: steps.reduce((s, step) => s + step.estimatedDurationMs, 0),
    status: 'ready',
    createdAt: new Date().toISOString(),
  };

  rollbackPlans.set(plan.id, plan);
  if (rollbackPlans.size > MAX_PLANS) {
    const oldest = rollbackPlans.keys().next().value;
    if (oldest) rollbackPlans.delete(oldest);
  }

  return plan;
}

/** Create a checkpoint for restoration */
export function createCheckpoint(actionId: string, state: Record<string, unknown>): string {
  const id = `chk_${actionId}_${Date.now()}`;
  checkpoints.set(id, structuredClone(state));
  if (checkpoints.size > MAX_CHECKPOINTS) {
    const oldest = checkpoints.keys().next().value;
    if (oldest) checkpoints.delete(oldest);
  }
  return id;
}

/** Get checkpoint state */
export function getCheckpoint(checkpointId: string): Record<string, unknown> | undefined {
  return checkpoints.get(checkpointId);
}

/** Execute rollback plan (simulate — in real substrate this would call compensating actions) */
export function executeRollback(planId: string): RollbackExecution {
  const plan = rollbackPlans.get(planId);
  if (!plan) {
    return { planId, stepsExecuted: 0, stepsSucceeded: 0, stepsFailed: 0, totalDurationMs: 0, errors: ['Plan not found'] };
  }

  plan.status = 'executing';
  plan.executedAt = new Date().toISOString();

  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const step of plan.steps) {
    if (step.strategy === 'none' || step.strategy === 'idempotent') {
      succeeded++;
      continue;
    }

    if (step.strategy === 'checkpoint') {
      if (step.checkpointId && checkpoints.has(step.checkpointId)) {
        succeeded++;
      } else {
        failed++;
        errors.push(`Checkpoint ${step.checkpointId} not found for ${step.actionId}`);
      }
      continue;
    }

    if (step.strategy === 'compensating') {
      if (step.compensatingAction) {
        succeeded++;
      } else {
        failed++;
        errors.push(`No compensating action defined for ${step.actionId}`);
      }
    }
  }

  plan.status = failed > 0 ? 'failed' : 'completed';

  const execution: RollbackExecution = {
    planId,
    stepsExecuted: plan.steps.length,
    stepsSucceeded: succeeded,
    stepsFailed: failed,
    totalDurationMs: plan.totalEstimatedMs,
    errors,
  };

  executionHistory.push(execution);
  return execution;
}

/** Get rollback plan */
export function getRollbackPlan(planId: string): RollbackPlan | undefined {
  return rollbackPlans.get(planId);
}

/** Get rollback health */
export function getRollbackHealth() {
  const executions = executionHistory;
  const successCount = executions.filter(e => e.stepsFailed === 0).length;
  return {
    totalPlans: rollbackPlans.size,
    totalCheckpoints: checkpoints.size,
    totalExecutions: executions.length,
    successRate: executions.length > 0 ? Math.round((successCount / executions.length) * 100) : 100,
  };
}

/** Reset */
export function resetRollbackPlanner(): void {
  rollbackPlans.clear();
  checkpoints.clear();
  executionHistory.length = 0;
}
