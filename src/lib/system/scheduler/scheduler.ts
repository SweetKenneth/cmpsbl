/**
 * Clockless Scheduler — Deterministic dispatch with backpressure + budgets
 * DB-backed queues + receipts. No cron dependency.
 */

import type { PriorityClass, SchedulerTask, SchedulerReceipt, TaskBudgetCost, BackpressureSignal } from './types';
import * as queues from './queues';
import * as budgets from './budgets';
import { supabase } from '@/integrations/supabase/client';

export type TaskExecutor = (task: SchedulerTask) => Promise<void>;

/** Classify a module+action into a priority class */
export function classifyPriority(module: string, action: string): PriorityClass {
  const m = module.toUpperCase();
  if (['DEFENSE', 'IMMUNITY'].includes(m)) return 'safety';
  if (['GOVERNANCE', 'AUDIT'].includes(m)) return 'governance';
  if (['EVOLUTION', 'SHADOW'].includes(m)) return 'evolution';
  if (['SYSTEM', 'MEMORY'].includes(m) && ['gc', 'prune', 'tier', 'snapshot'].includes(action)) return 'maintenance';
  return 'user';
}

/** Create a scheduler task */
export function createTask(
  module: string,
  action: string,
  payload: unknown,
  costEstimate?: Partial<TaskBudgetCost>
): SchedulerTask {
  return {
    id: crypto.randomUUID(),
    priority: classifyPriority(module, action),
    module,
    action,
    payload,
    created_at: Date.now(),
    age_boost: 0,
    budget_cost: {
      estimated_tokens: costEstimate?.estimated_tokens ?? 100,
      estimated_ms: costEstimate?.estimated_ms ?? 50,
      estimated_cost_cents: costEstimate?.estimated_cost_cents ?? 0,
    },
  };
}

export interface SubmitResult {
  accepted: boolean;
  degraded?: boolean;
  reason?: string;
  retry_after_ms?: number;
  backpressure: BackpressureSignal[];
}

/** Submit a task to the scheduler with proper acceptance semantics */
export async function submit(task: SchedulerTask): Promise<SubmitResult> {
  const queueBp = await queues.checkBackpressure();
  const budgetBp = budgets.checkBudgetExhaustion();
  const bp = [...queueBp, ...budgetBp];

  // Check for critical backpressure — reject submission
  const hasCritical = bp.some(
    s => s.type === 'queue_depth' && s.value >= 200
  );

  if (hasCritical) {
    return {
      accepted: false,
      reason: 'backpressure_critical',
      retry_after_ms: 500,
      backpressure: bp,
    };
  }

  await queues.enqueue(task);

  // Check for warning-level backpressure — accept but flag degraded
  const hasWarning = bp.length > 0;

  return {
    accepted: true,
    degraded: hasWarning || undefined,
    backpressure: bp,
  };
}

/** Dispatch next task if budget allows. Returns receipt or null. */
export async function dispatchNext(executor: TaskExecutor): Promise<SchedulerReceipt | null> {
  await queues.ageAll();

  const task = await queues.dequeue();
  if (!task) return null;

  // Maintenance only runs when idle AND budget permits
  if (task.priority === 'maintenance' && !(await queues.isIdle())) {
    await queues.enqueue(task); // re-enqueue
    return null;
  }

  if (!budgets.canAfford(task.priority, task.budget_cost)) {
    await queues.enqueue(task); // re-enqueue, wait for budget reset
    return null;
  }

  const dispatched_at = Date.now();
  budgets.consume(task.priority, task.budget_cost);

  try {
    await executor(task);
  } catch {
    // Executor errors are handled by the caller's error boundary
  }

  const receipt: SchedulerReceipt = {
    task_id: task.id,
    priority: task.priority,
    queued_at: task.created_at,
    dispatched_at,
    wait_ms: dispatched_at - task.created_at,
    budget_consumed: task.budget_cost,
    backpressure_active: (await queues.checkBackpressure()).length > 0,
  };

  // Persist receipt to DB
  await supabase.from('substrate_scheduler_receipts').insert({
    task_id: receipt.task_id,
    priority: receipt.priority,
    queued_at: new Date(receipt.queued_at).toISOString(),
    dispatched_at: new Date(receipt.dispatched_at).toISOString(),
    wait_ms: receipt.wait_ms,
    budget_tokens: receipt.budget_consumed.estimated_tokens,
    budget_ms: receipt.budget_consumed.estimated_ms,
    budget_cost_cents: receipt.budget_consumed.estimated_cost_cents,
    backpressure_active: receipt.backpressure_active,
  });

  return receipt;
}

/** Get recent scheduling receipts from DB */
export async function getReceipts(limit = 50): Promise<SchedulerReceipt[]> {
  const { data } = await supabase
    .from('substrate_scheduler_receipts')
    .select('*')
    .order('dispatched_at', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((r: any) => ({
    task_id: r.task_id,
    priority: r.priority as PriorityClass,
    queued_at: new Date(r.queued_at).getTime(),
    dispatched_at: new Date(r.dispatched_at).getTime(),
    wait_ms: r.wait_ms,
    budget_consumed: {
      estimated_tokens: r.budget_tokens,
      estimated_ms: r.budget_ms,
      estimated_cost_cents: r.budget_cost_cents,
    },
    backpressure_active: r.backpressure_active,
  }));
}

/** Get scheduler status snapshot */
export async function getStatus() {
  return {
    queue_depths: await queues.getDepths(),
    budget_utilization: budgets.getUtilization(),
    backpressure: await queues.checkBackpressure(),
    pending_total: await queues.totalPending(),
  };
}

/** Flush scheduler state (for tests/reset) */
export async function reset(): Promise<void> {
  await queues.flushAll();
  budgets.resetAll();
}
