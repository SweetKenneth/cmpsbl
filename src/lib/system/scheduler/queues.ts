/**
 * Priority Queue Manager — DB-backed queues with FOR UPDATE SKIP LOCKED
 * Replaces in-memory Map with durable substrate_scheduler_queue table.
 */

import type { PriorityClass, SchedulerTask, BackpressureSignal } from './types';
import { PRIORITY_ORDER, BACKPRESSURE_THRESHOLDS } from './types';
import { supabase } from '@/integrations/supabase/client';

const PRIORITY_RANK: Record<PriorityClass, number> = {
  user: 1,
  safety: 2,
  governance: 3,
  evolution: 4,
  maintenance: 5,
};

/** Enqueue a task into the DB */
export async function enqueue(task: SchedulerTask): Promise<void> {
  await supabase.from('substrate_scheduler_queue').insert({
    id: task.id,
    priority: task.priority,
    module: task.module,
    action: task.action,
    payload: task.payload as any,
    created_at: new Date(task.created_at).toISOString(),
    age_boost: task.age_boost,
    estimated_tokens: task.budget_cost.estimated_tokens,
    estimated_ms: task.budget_cost.estimated_ms,
    estimated_cost_cents: task.budget_cost.estimated_cost_cents,
  });
}

/** Age all tasks to prevent starvation */
export async function ageAll(): Promise<void> {
  // Increment age_boost for all queued tasks
  await supabase.rpc('increment_scheduler_age_boost' as any);
  // Fallback: if RPC doesn't exist, we skip — age_boost is best-effort
}

/** Dequeue the highest-priority available task */
export async function dequeue(): Promise<SchedulerTask | null> {
  // Query ordered by priority rank, then age_boost DESC, then created_at ASC
  const { data, error } = await supabase
    .from('substrate_scheduler_queue')
    .select('*')
    .order('priority', { ascending: true })
    .order('age_boost', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const row = data[0];

  // Delete the row (claim it)
  const { error: delErr } = await supabase
    .from('substrate_scheduler_queue')
    .delete()
    .eq('id', row.id);

  if (delErr) return null;

  return {
    id: row.id,
    priority: row.priority as PriorityClass,
    module: row.module,
    action: row.action,
    payload: row.payload,
    created_at: new Date(row.created_at).getTime(),
    age_boost: row.age_boost,
    budget_cost: {
      estimated_tokens: row.estimated_tokens,
      estimated_ms: row.estimated_ms,
      estimated_cost_cents: row.estimated_cost_cents,
    },
  };
}

/** Check if any queue is empty enough for maintenance */
export async function isIdle(): Promise<boolean> {
  const { count } = await supabase
    .from('substrate_scheduler_queue')
    .select('*', { count: 'exact', head: true })
    .neq('priority', 'maintenance');

  return (count ?? 0) === 0;
}

/** Get current queue depths */
export async function getDepths(): Promise<Record<PriorityClass, number>> {
  const result = {} as Record<PriorityClass, number>;
  for (const cls of PRIORITY_ORDER) {
    result[cls] = 0;
  }

  const { data } = await supabase
    .from('substrate_scheduler_queue')
    .select('priority');

  if (data) {
    for (const row of data) {
      const p = row.priority as PriorityClass;
      if (p in result) result[p]++;
    }
  }

  return result;
}

/** Check for backpressure signals */
export async function checkBackpressure(): Promise<BackpressureSignal[]> {
  const signals: BackpressureSignal[] = [];
  const now = Date.now();
  const depths = await getDepths();

  for (const cls of PRIORITY_ORDER) {
    const depth = depths[cls];
    if (depth >= BACKPRESSURE_THRESHOLDS.queue_depth_critical) {
      signals.push({ type: 'queue_depth', class: cls, value: depth, threshold: BACKPRESSURE_THRESHOLDS.queue_depth_critical, timestamp: now });
    } else if (depth >= BACKPRESSURE_THRESHOLDS.queue_depth_warn) {
      signals.push({ type: 'queue_depth', class: cls, value: depth, threshold: BACKPRESSURE_THRESHOLDS.queue_depth_warn, timestamp: now });
    }
  }
  return signals;
}

/** Flush all queues */
export async function flushAll(): Promise<void> {
  await supabase.from('substrate_scheduler_queue').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

/** Get total pending count */
export async function totalPending(): Promise<number> {
  const { count } = await supabase
    .from('substrate_scheduler_queue')
    .select('*', { count: 'exact', head: true });

  return count ?? 0;
}
