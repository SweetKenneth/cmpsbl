/**
 * Priority Queue Manager — Per-class queues with aging + round-robin
 */

import type { PriorityClass, SchedulerTask, BackpressureSignal } from './types';
import { PRIORITY_ORDER, BACKPRESSURE_THRESHOLDS } from './types';

const queues = new Map<PriorityClass, SchedulerTask[]>();
for (const cls of PRIORITY_ORDER) queues.set(cls, []);

/** Enqueue a task */
export function enqueue(task: SchedulerTask): void {
  const q = queues.get(task.priority);
  if (q) q.push(task);
}

/** Age all tasks to prevent starvation */
export function ageAll(): void {
  for (const q of queues.values()) {
    for (const t of q) t.age_boost += 1;
  }
}

/** Dequeue the highest-priority available task (user > safety > ... > maintenance) */
export function dequeue(): SchedulerTask | null {
  for (const cls of PRIORITY_ORDER) {
    const q = queues.get(cls);
    if (q && q.length > 0) {
      // Within a class, pick the oldest (highest age_boost) for fairness
      q.sort((a, b) => b.age_boost - a.age_boost);
      return q.shift()!;
    }
  }
  return null;
}

/** Check if any queue is empty enough for maintenance */
export function isIdle(): boolean {
  for (const cls of PRIORITY_ORDER) {
    if (cls === 'maintenance') continue;
    const q = queues.get(cls);
    if (q && q.length > 0) return false;
  }
  return true;
}

/** Get current queue depths */
export function getDepths(): Record<PriorityClass, number> {
  const result = {} as Record<PriorityClass, number>;
  for (const cls of PRIORITY_ORDER) {
    result[cls] = queues.get(cls)?.length ?? 0;
  }
  return result;
}

/** Check for backpressure signals */
export function checkBackpressure(): BackpressureSignal[] {
  const signals: BackpressureSignal[] = [];
  const now = Date.now();
  for (const cls of PRIORITY_ORDER) {
    const depth = queues.get(cls)?.length ?? 0;
    if (depth >= BACKPRESSURE_THRESHOLDS.queue_depth_critical) {
      signals.push({ type: 'queue_depth', class: cls, value: depth, threshold: BACKPRESSURE_THRESHOLDS.queue_depth_critical, timestamp: now });
    } else if (depth >= BACKPRESSURE_THRESHOLDS.queue_depth_warn) {
      signals.push({ type: 'queue_depth', class: cls, value: depth, threshold: BACKPRESSURE_THRESHOLDS.queue_depth_warn, timestamp: now });
    }
  }
  return signals;
}

/** Flush all queues */
export function flushAll(): void {
  for (const q of queues.values()) q.length = 0;
}

/** Get total pending count */
export function totalPending(): number {
  let total = 0;
  for (const q of queues.values()) total += q.length;
  return total;
}
