/**
 * Immunity Mesh — Rule Engine Aggregator
 * Computes dashboard-ready stats from DB data.
 * Guarded by shadow_mesh_enabled flag.
 */

import { isShadowMeshEnabled } from '@/lib/system/flags';
import { fetchRules, fetchAllInvocationsSince, fetchPropagation, fetchConflicts, fetchMeshRuns } from './db';
import { buildRuleHealth, computeDominantScore, computeRiskScore, computeSpreadVelocity } from './scoring';
import type { RuleHealth, PropagationStats, CostStats, ImmunityRule, RuleConflict, MeshRun } from './types';
import { RISKY_RULE_SUCCESS_RATE, RISKY_RULE_MIN_INVOCATIONS } from './constants';

export interface RuleEngineDashboard {
  dominantRules: RuleHealth[];
  riskyRules: RuleHealth[];
  propagation: PropagationStats;
  conflicts: RuleConflict[];
  costStats: CostStats;
  recentRuns: MeshRun[];
  totalRules: number;
  rulesByStatus: Record<string, number>;
}

/**
 * Aggregate full dashboard data. Returns empty shell if mesh is OFF.
 */
export async function aggregateRuleEngineDashboard(): Promise<RuleEngineDashboard> {
  const empty: RuleEngineDashboard = {
    dominantRules: [], riskyRules: [],
    propagation: { avg_breadth: 0, most_spread_rule: null, fastest_spreading: null },
    conflicts: [], costStats: { per_rule: [], per_executor: [], top_expensive: [] },
    recentRuns: [], totalRules: 0, rulesByStatus: {},
  };

  // HARD GUARD: mesh OFF = zero overhead
  if (!(await isShadowMeshEnabled())) return empty;

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [rules, invocations, propagations, conflicts, runs] = await Promise.all([
    fetchRules(),
    fetchAllInvocationsSince(since24h),
    fetchPropagation(),
    fetchConflicts(10),
    fetchMeshRuns(10),
  ]);

  if (rules.length === 0) return { ...empty, recentRuns: runs };

  // Group invocations by rule
  const invocByRule = new Map<string, typeof invocations>();
  for (const inv of invocations) {
    const arr = invocByRule.get(inv.rule_id) ?? [];
    arr.push(inv);
    invocByRule.set(inv.rule_id, arr);
  }

  // Group propagation by rule
  const propByRule = new Map<string, typeof propagations>();
  for (const p of propagations) {
    const arr = propByRule.get(p.rule_id) ?? [];
    arr.push(p);
    propByRule.set(p.rule_id, arr);
  }

  // Build health for each rule
  const healthList: RuleHealth[] = rules.map((rule) => {
    const ruleInvocs = invocByRule.get(rule.id) ?? [];
    const ruleProps = propByRule.get(rule.id) ?? [];
    const breadth = new Set(ruleProps.map((p) => p.to_executor)).size;
    const firstAdopted = ruleProps.length > 0 ? ruleProps[ruleProps.length - 1].adopted_at : null;
    const durations = ruleInvocs.map((i) => i.duration_ms);
    const costs = ruleInvocs.map((i) => i.cost_units);
    return buildRuleHealth(rule, breadth, firstAdopted, durations, costs);
  });

  // Dominant (Top 5)
  const dominantRules = [...healthList]
    .sort((a, b) => b.dominant_score - a.dominant_score)
    .slice(0, 5);

  // Risky
  const riskyRules = healthList
    .filter((h) => h.rule.success_rate < RISKY_RULE_SUCCESS_RATE && h.rule.invocations_24h >= RISKY_RULE_MIN_INVOCATIONS)
    .sort((a, b) => b.risk_score - a.risk_score);

  // Propagation stats
  const activeBreadths = healthList.filter((h) => h.rule.status === 'promoted' && h.propagation_breadth > 0);
  const avgBreadth = activeBreadths.length > 0 ? activeBreadths.reduce((s, h) => s + h.propagation_breadth, 0) / activeBreadths.length : 0;
  const mostSpread = activeBreadths.length > 0 ? activeBreadths.reduce((a, b) => a.propagation_breadth > b.propagation_breadth ? a : b) : null;
  const fastestSpreading = activeBreadths.length > 0 ? activeBreadths.reduce((a, b) => a.spread_velocity > b.spread_velocity ? a : b) : null;

  // Cost stats
  const perRule = healthList
    .filter((h) => h.avg_duration_ms > 0)
    .map((h) => ({ rule_key: h.rule.rule_key, avg_ms: h.avg_duration_ms, p95_ms: h.p95_duration_ms, avg_cost: h.avg_cost_units }))
    .sort((a, b) => b.avg_cost - a.avg_cost);

  const execCosts = new Map<string, { cost: number; ms: number }>();
  for (const inv of invocations) {
    const curr = execCosts.get(inv.executor) ?? { cost: 0, ms: 0 };
    curr.cost += inv.cost_units;
    curr.ms += inv.duration_ms;
    execCosts.set(inv.executor, curr);
  }
  const perExecutor = Array.from(execCosts.entries())
    .map(([executor, { cost, ms }]) => ({ executor, total_cost: cost, total_ms: ms }))
    .sort((a, b) => b.total_cost - a.total_cost);

  const topExpensive = perRule.slice(0, 3).map((r) => ({ rule_key: r.rule_key, total_cost: r.avg_cost }));

  // Status counts
  const rulesByStatus: Record<string, number> = {};
  for (const r of rules) rulesByStatus[r.status] = (rulesByStatus[r.status] ?? 0) + 1;

  return {
    dominantRules,
    riskyRules,
    propagation: {
      avg_breadth: avgBreadth,
      most_spread_rule: mostSpread ? { rule_key: mostSpread.rule.rule_key, breadth: mostSpread.propagation_breadth } : null,
      fastest_spreading: fastestSpreading ? { rule_key: fastestSpreading.rule.rule_key, velocity: fastestSpreading.spread_velocity } : null,
    },
    conflicts,
    costStats: { per_rule: perRule, per_executor: perExecutor, top_expensive: topExpensive },
    recentRuns: runs,
    totalRules: rules.length,
    rulesByStatus,
  };
}
