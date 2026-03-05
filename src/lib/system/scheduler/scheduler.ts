/**
 * Clockless Scheduler — Deterministic dispatch with backpressure + budgets
 * No cron dependency. Maintenance pulses are optional.
 */

import type { PriorityClass, SchedulerTask, SchedulerReceipt, TaskBudgetCost, BackpressureSignal } from './types';
import * as queues from './queues';
import * as budgets from './budgets';

export type TaskExecutor = (task: SchedulerTask) => Promise<void>;

const receipts: SchedulerReceipt[] = [];
const MAX_RECEIPTS = 500;

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

/** Submit a task to the scheduler */
export function submit(task: SchedulerTask): { accepted: boolean; backpressure: BackpressureSignal[] } {
  const bp = [...queues.checkBackpressure(), ...budgets.checkBudgetExhaustion()];
  queues.enqueue(task);
  return { accepted: true, backpressure: bp };
}

/** Dispatch next task if budget allows. Returns receipt or null. */
export async function dispatchNext(executor: TaskExecutor): Promise<SchedulerReceipt | null> {
  queues.ageAll();

  const task = queues.dequeue();
  if (!task) return null;

  // Maintenance only runs when idle AND budget permits
  if (task.priority === 'maintenance' && !queues.isIdle()) {
    queues.enqueue(task); // re-enqueue
    return null;
  }

  if (!budgets.canAfford(task.priority, task.budget_cost)) {
    queues.enqueue(task); // re-enqueue, wait for budget reset
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
    backpressure_active: queues.checkBackpressure().length > 0,
  };

  receipts.push(receipt);
  if (receipts.length > MAX_RECEIPTS) receipts.splice(0, receipts.length - MAX_RECEIPTS);

  return receipt;
}

/** Get recent scheduling receipts */
export function getReceipts(limit = 50): SchedulerReceipt[] {
  return receipts.slice(-limit);
}

/** Get scheduler status snapshot */
export function getStatus() {
  return {
    queue_depths: queues.getDepths(),
    budget_utilization: budgets.getUtilization(),
    backpressure: queues.checkBackpressure(),
    pending_total: queues.totalPending(),
    receipts_count: receipts.length,
  };
}

/** Flush scheduler state (for tests/reset) */
export function reset(): void {
  queues.flushAll();
  budgets.resetAll();
  receipts.length = 0;
}
