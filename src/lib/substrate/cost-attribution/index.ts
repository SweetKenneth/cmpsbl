/**
 * Cost Attribution Engine — v1.0.0
 * Per-module token and budget tracking with alerts and forecasting.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ModuleName =
  | 'core' | 'ripple' | 'access'                          // Kernel
  | 'brain' | 'decode' | 'dream'                           // Cognitive
  | 'defense' | 'nexus' | 'vision' | 'encode'              // Operational
  | 'system' | 'evolution' | 'integration' | 'inclusive'    // Administrative
  | 'cortex' | 'atlas'                                      // Orchestrator
  | 'memory' | 'relay' | 'audit' | 'identity' | 'economy' | 'sandbox'; // Infrastructure

export interface CostRecord {
  module: ModuleName;
  operation: string;
  tokens_used: number;
  estimated_cost_cents: number;
  provider: string;
  model: string;
  timestamp: string;
}

export interface ModuleBudget {
  module: ModuleName;
  daily_token_limit: number;
  daily_cost_limit_cents: number;
  alert_threshold_pct: number; // Alert when this % of budget is used
}

export interface ModuleCostSummary {
  module: ModuleName;
  tokens_today: number;
  cost_today_cents: number;
  tokens_7d: number;
  cost_7d_cents: number;
  avg_daily_tokens: number;
  avg_daily_cost_cents: number;
  budget_pct_used: number;
  trending: 'up' | 'flat' | 'down';
  top_operations: Array<{ operation: string; tokens: number; count: number }>;
}

export interface CostAlert {
  module: ModuleName;
  type: 'budget_warning' | 'budget_exceeded' | 'spike_detected';
  message: string;
  current_usage_pct: number;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT BUDGETS
// ═══════════════════════════════════════════════════════════════

const DEFAULT_BUDGETS: Record<ModuleName, ModuleBudget> = {
  // Kernel
  core:        { module: 'core',        daily_token_limit: 50000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  ripple:      { module: 'ripple',      daily_token_limit: 20000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  access:      { module: 'access',      daily_token_limit: 30000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  // Cognitive
  brain:       { module: 'brain',       daily_token_limit: 100000, daily_cost_limit_cents: 0, alert_threshold_pct: 70 },
  decode:      { module: 'decode',      daily_token_limit: 200000, daily_cost_limit_cents: 0, alert_threshold_pct: 70 },
  dream:       { module: 'dream',       daily_token_limit: 80000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  // Operational
  defense:     { module: 'defense',     daily_token_limit: 30000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  nexus:       { module: 'nexus',       daily_token_limit: 150000, daily_cost_limit_cents: 0, alert_threshold_pct: 75 },
  vision:      { module: 'vision',      daily_token_limit: 40000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  encode:      { module: 'encode',      daily_token_limit: 120000, daily_cost_limit_cents: 0, alert_threshold_pct: 75 },
  // Administrative
  system:      { module: 'system',      daily_token_limit: 60000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  evolution:   { module: 'evolution',   daily_token_limit: 100000, daily_cost_limit_cents: 0, alert_threshold_pct: 75 },
  integration: { module: 'integration', daily_token_limit: 50000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  inclusive:   { module: 'inclusive',    daily_token_limit: 30000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  // Orchestrator
  cortex:      { module: 'cortex',      daily_token_limit: 80000,  daily_cost_limit_cents: 0, alert_threshold_pct: 75 },
  atlas:       { module: 'atlas',       daily_token_limit: 40000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  // Infrastructure
  memory:      { module: 'memory',      daily_token_limit: 60000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  relay:       { module: 'relay',       daily_token_limit: 30000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  audit:       { module: 'audit',       daily_token_limit: 20000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  identity:    { module: 'identity',    daily_token_limit: 25000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  economy:     { module: 'economy',     daily_token_limit: 30000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
  sandbox:     { module: 'sandbox',     daily_token_limit: 50000,  daily_cost_limit_cents: 0, alert_threshold_pct: 80 },
};

// In-memory cost accumulator for fast tracking
const costAccumulator: Map<string, CostRecord[]> = new Map();

// ═══════════════════════════════════════════════════════════════
// TRACKING
// ═══════════════════════════════════════════════════════════════

/**
 * Record a cost event for a module
 */
export async function recordCost(record: CostRecord): Promise<CostAlert | null> {
  const key = `${record.module}:${new Date().toISOString().slice(0, 10)}`;
  const existing = costAccumulator.get(key) || [];
  existing.push(record);
  costAccumulator.set(key, existing);

  // Persist to database
  await supabase.from('brain_events').insert({
    module: record.module,
    event_type: 'cost_recorded',
    data: {
      operation: record.operation,
      tokens: record.tokens_used,
      cost_cents: record.estimated_cost_cents,
      provider: record.provider,
      model: record.model,
    } as any,
    outcome: 'success',
  });

  // Check budget
  return checkBudget(record.module);
}

/**
 * Check if a module is approaching or exceeding its budget
 */
export async function checkBudget(module: ModuleName): Promise<CostAlert | null> {
  const budget = DEFAULT_BUDGETS[module];
  if (!budget) return null;

  const today = new Date().toISOString().slice(0, 10);
  const key = `${module}:${today}`;
  const records = costAccumulator.get(key) || [];
  const totalTokens = records.reduce((sum, r) => sum + r.tokens_used, 0);
  const usagePct = budget.daily_token_limit > 0
    ? (totalTokens / budget.daily_token_limit) * 100
    : 0;

  if (usagePct >= 100) {
    return {
      module,
      type: 'budget_exceeded',
      message: `${module} has exceeded its daily token budget (${totalTokens}/${budget.daily_token_limit})`,
      current_usage_pct: usagePct,
      timestamp: new Date().toISOString(),
    };
  }

  if (usagePct >= budget.alert_threshold_pct) {
    return {
      module,
      type: 'budget_warning',
      message: `${module} is at ${usagePct.toFixed(0)}% of daily token budget`,
      current_usage_pct: usagePct,
      timestamp: new Date().toISOString(),
    };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════

/**
 * Get cost summary for a module
 */
export async function getModuleCostSummary(module: ModuleName): Promise<ModuleCostSummary> {
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // Get events from database
  const { data: events } = await supabase
    .from('brain_events')
    .select('data, created_at')
    .eq('module', module)
    .eq('event_type', 'cost_recorded')
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(500);

  const allRecords = events || [];
  const todayRecords = allRecords.filter(e => e.created_at?.startsWith(today));

  const sumTokens = (recs: typeof allRecords) =>
    recs.reduce((s, r) => s + ((r.data as any)?.tokens || 0), 0);
  const sumCost = (recs: typeof allRecords) =>
    recs.reduce((s, r) => s + ((r.data as any)?.cost_cents || 0), 0);

  const tokensToday = sumTokens(todayRecords);
  const costToday = sumCost(todayRecords);
  const tokens7d = sumTokens(allRecords);
  const cost7d = sumCost(allRecords);

  // Operation breakdown
  const opMap = new Map<string, { tokens: number; count: number }>();
  for (const r of allRecords) {
    const op = (r.data as any)?.operation || 'unknown';
    const existing = opMap.get(op) || { tokens: 0, count: 0 };
    existing.tokens += (r.data as any)?.tokens || 0;
    existing.count++;
    opMap.set(op, existing);
  }

  const topOps = Array.from(opMap.entries())
    .map(([operation, stats]) => ({ operation, ...stats }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 5);

  const budget = DEFAULT_BUDGETS[module];
  const budgetPct = budget.daily_token_limit > 0
    ? (tokensToday / budget.daily_token_limit) * 100
    : 0;

  // Simple trend detection
  const firstHalf = allRecords.slice(Math.floor(allRecords.length / 2));
  const secondHalf = allRecords.slice(0, Math.floor(allRecords.length / 2));
  const firstHalfTokens = sumTokens(firstHalf);
  const secondHalfTokens = sumTokens(secondHalf);
  const trending = secondHalfTokens > firstHalfTokens * 1.2 ? 'up'
    : secondHalfTokens < firstHalfTokens * 0.8 ? 'down' : 'flat';

  return {
    module,
    tokens_today: tokensToday,
    cost_today_cents: costToday,
    tokens_7d: tokens7d,
    cost_7d_cents: cost7d,
    avg_daily_tokens: Math.round(tokens7d / 7),
    avg_daily_cost_cents: Math.round(cost7d / 7),
    budget_pct_used: budgetPct,
    trending,
    top_operations: topOps,
  };
}

/**
 * Get cost summary across all modules
 */
export async function getGlobalCostSummary(): Promise<{
  total_tokens_today: number;
  total_cost_today_cents: number;
  modules: ModuleCostSummary[];
  alerts: CostAlert[];
}> {
  const modules: ModuleName[] = [
    'core', 'ripple', 'access',
    'brain', 'decode', 'dream',
    'defense', 'nexus', 'vision', 'encode',
    'system', 'evolution', 'integration', 'inclusive',
    'cortex', 'atlas',
    'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox',
  ];

  const summaries: ModuleCostSummary[] = [];
  const alerts: CostAlert[] = [];

  for (const mod of modules) {
    const summary = await getModuleCostSummary(mod);
    summaries.push(summary);

    const alert = await checkBudget(mod);
    if (alert) alerts.push(alert);
  }

  return {
    total_tokens_today: summaries.reduce((s, m) => s + m.tokens_today, 0),
    total_cost_today_cents: summaries.reduce((s, m) => s + m.cost_today_cents, 0),
    modules: summaries,
    alerts,
  };
}
