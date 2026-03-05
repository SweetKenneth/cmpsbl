/**
 * Scheduler Driver — Event-driven pump with no background timers
 * 
 * Triggers dispatch on:
 *   1. task enqueue
 *   2. executor completion
 *   3. budget window reset
 *   4. breaker state change
 */

import { dispatchNext, type TaskExecutor } from './scheduler';

let pumping = false;
let registeredExecutor: TaskExecutor | null = null;

/** Register the task executor for the driver */
export function registerExecutor(executor: TaskExecutor): void {
  registeredExecutor = executor;
}

/**
 * Pump the scheduler: dispatch all available tasks until empty or blocked.
 * Re-entrant safe — if already pumping, the call is a no-op.
 * No timers — purely event-driven.
 */
export async function pumpScheduler(): Promise<number> {
  if (pumping || !registeredExecutor) return 0;

  pumping = true;
  let dispatched = 0;

  try {
    while (true) {
      const receipt = await dispatchNext(registeredExecutor);
      if (!receipt) break;
      dispatched++;
    }
  } finally {
    pumping = false;
  }

  return dispatched;
}

/** Trigger pump on budget window reset */
export async function onBudgetReset(): Promise<void> {
  await pumpScheduler();
}

/** Trigger pump on breaker state change */
export async function onBreakerStateChange(): Promise<void> {
  await pumpScheduler();
}

/** Check if driver is currently pumping */
export function isPumping(): boolean {
  return pumping;
}
