/**
 * Budget Envelope Manager — Per-class token/time/cost budgets
 */

import type { PriorityClass, BudgetEnvelope, TaskBudgetCost, BackpressureSignal } from './types';
import { DEFAULT_BUDGETS, PRIORITY_ORDER } from './types';

interface BudgetState {
  tokens_used: number;
  ms_used: number;
  cost_used_cents: number;
  window_start: number;
}

const state = new Map<PriorityClass, BudgetState>();
const envelopes = new Map<PriorityClass, BudgetEnvelope>();

function initClass(cls: PriorityClass): void {
  if (!state.has(cls)) {
    state.set(cls, { tokens_used: 0, ms_used: 0, cost_used_cents: 0, window_start: Date.now() });
    envelopes.set(cls, { ...DEFAULT_BUDGETS[cls] });
  }
}

// Initialize all on load
for (const cls of PRIORITY_ORDER) initClass(cls);

/** Track daily cost reset separately */
let lastCostResetDay = new Date().toDateString();

/** Reset window if minute has elapsed; reset cost if day has changed */
function maybeResetWindow(cls: PriorityClass): void {
  const s = state.get(cls)!;
  const now = Date.now();
  if (now - s.window_start >= 60_000) {
    s.tokens_used = 0;
    s.ms_used = 0;
    s.window_start = now;
  }
  // Daily cost reset
  const today = new Date().toDateString();
  if (today !== lastCostResetDay) {
    lastCostResetDay = today;
    for (const c of PRIORITY_ORDER) {
      const st = state.get(c);
      if (st) st.cost_used_cents = 0;
    }
  }
}

/** Check if a task can be afforded within the budget */
export function canAfford(cls: PriorityClass, cost: TaskBudgetCost): boolean {
  initClass(cls);
  maybeResetWindow(cls);
  const s = state.get(cls)!;
  const e = envelopes.get(cls)!;
  return (
    s.tokens_used + cost.estimated_tokens <= e.tokens_per_min &&
    s.ms_used + cost.estimated_ms <= e.ms_per_min
  );
}

/** Consume budget */
export function consume(cls: PriorityClass, cost: TaskBudgetCost): void {
  initClass(cls);
  maybeResetWindow(cls);
  const s = state.get(cls)!;
  s.tokens_used += cost.estimated_tokens;
  s.ms_used += cost.estimated_ms;
  s.cost_used_cents += cost.estimated_cost_cents;
}

/** Check for budget exhaustion signals */
export function checkBudgetExhaustion(): BackpressureSignal[] {
  const signals: BackpressureSignal[] = [];
  const now = Date.now();
  for (const cls of PRIORITY_ORDER) {
    initClass(cls);
    maybeResetWindow(cls);
    const s = state.get(cls)!;
    const e = envelopes.get(cls)!;
    const tokenRatio = e.tokens_per_min > 0 ? s.tokens_used / e.tokens_per_min : 0;
    if (tokenRatio >= 0.9) {
      signals.push({ type: 'budget_exhausted', class: cls, value: tokenRatio, threshold: 0.9, timestamp: now });
    }
  }
  return signals;
}

/** Get budget utilization snapshot */
export function getUtilization(): Record<PriorityClass, { tokens_pct: number; ms_pct: number }> {
  const result = {} as Record<PriorityClass, { tokens_pct: number; ms_pct: number }>;
  for (const cls of PRIORITY_ORDER) {
    initClass(cls);
    maybeResetWindow(cls);
    const s = state.get(cls)!;
    const e = envelopes.get(cls)!;
    result[cls] = {
      tokens_pct: e.tokens_per_min > 0 ? (s.tokens_used / e.tokens_per_min) * 100 : 0,
      ms_pct: e.ms_per_min > 0 ? (s.ms_used / e.ms_per_min) * 100 : 0,
    };
  }
  return result;
}

/** Override budget envelope for a class */
export function setEnvelope(cls: PriorityClass, envelope: BudgetEnvelope): void {
  envelopes.set(cls, { ...envelope });
}

/** Reset all budgets */
export function resetAll(): void {
  for (const cls of PRIORITY_ORDER) {
    state.set(cls, { tokens_used: 0, ms_used: 0, cost_used_cents: 0, window_start: Date.now() });
  }
}
