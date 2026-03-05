/**
 * Scheduler Types — Clockless scheduler with backpressure + budget envelopes
 */

export type PriorityClass = 'user' | 'safety' | 'governance' | 'evolution' | 'maintenance';

export const PRIORITY_ORDER: PriorityClass[] = ['user', 'safety', 'governance', 'evolution', 'maintenance'];

export interface BudgetEnvelope {
  tokens_per_min: number;
  ms_per_min: number;
  provider_cost_per_day_cents: number;
}

export interface SchedulerTask {
  id: string;
  priority: PriorityClass;
  module: string;
  action: string;
  payload: unknown;
  created_at: number;      // monotonic ms
  age_boost: number;       // incremented each scheduling round for starvation prevention
  budget_cost: TaskBudgetCost;
}

export interface TaskBudgetCost {
  estimated_tokens: number;
  estimated_ms: number;
  estimated_cost_cents: number;
}

export interface BackpressureSignal {
  type: 'queue_depth' | 'latency_breach' | 'budget_exhausted';
  class: PriorityClass;
  value: number;
  threshold: number;
  timestamp: number;
}

export interface SchedulerReceipt {
  task_id: string;
  priority: PriorityClass;
  queued_at: number;
  dispatched_at: number;
  wait_ms: number;
  budget_consumed: TaskBudgetCost;
  backpressure_active: boolean;
}

export type SafeModeLevel = 'off' | 'degrade' | 'read_only' | 'minimal_routes';

export interface SafeModeState {
  level: SafeModeLevel;
  activated_at: string | null;
  activated_by: string | null;
  reason: string | null;
  cascade_event_id: string | null;
}

export const DEFAULT_BUDGETS: Record<PriorityClass, BudgetEnvelope> = {
  user:        { tokens_per_min: 50000, ms_per_min: 30000, provider_cost_per_day_cents: 500 },
  safety:      { tokens_per_min: 30000, ms_per_min: 20000, provider_cost_per_day_cents: 300 },
  governance:  { tokens_per_min: 20000, ms_per_min: 15000, provider_cost_per_day_cents: 200 },
  evolution:   { tokens_per_min: 15000, ms_per_min: 10000, provider_cost_per_day_cents: 150 },
  maintenance: { tokens_per_min: 5000,  ms_per_min: 5000,  provider_cost_per_day_cents: 50 },
};

export const BACKPRESSURE_THRESHOLDS = {
  queue_depth_warn: 50,
  queue_depth_critical: 200,
  latency_target_ms: 2000,
} as const;
