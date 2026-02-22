/**
 * Immunity Mesh — Rule Engine Types
 */

export type RuleStatus = 'learned' | 'candidate' | 'promoted' | 'deprecated' | 'retired' | 'blocked';
export type InvocationOutcome = 'success' | 'fail' | 'skipped';
export type LineageRelation = 'refinement' | 'generalization' | 'fork' | 'merge';
export type ConflictType = 'contradictory_output' | 'oscillation' | 'double_fix' | 'regression';
export type ConflictResolution = 'prefer_a' | 'prefer_b' | 'conditional' | 'both_blocked' | 'unresolved';
export type MeshRunMode = 'replay' | 'synthetic' | 'encode_practice' | 'dual' | 'storm';

export interface ImmunityRule {
  id: string;
  rule_key: string;
  category: string;
  source_executor: string;
  status: RuleStatus;
  confidence: number;
  success_rate: number;
  invocations_24h: number;
  invocations_7d: number;
  last_seen_at: string | null;
  created_at: string;
  promoted_at: string | null;
  retired_at: string | null;
}

export interface RuleHealth {
  rule: ImmunityRule;
  dominant_score: number;
  risk_score: number;
  propagation_breadth: number;
  spread_velocity: number;
  avg_duration_ms: number;
  p95_duration_ms: number;
  avg_cost_units: number;
}

export interface RulePropagation {
  id: string;
  rule_id: string;
  from_executor: string;
  to_executor: string;
  adopted_at: string;
  adoption_confidence: number;
}

export interface RuleLineage {
  id: string;
  parent_rule_id: string;
  child_rule_id: string;
  relation: LineageRelation;
  created_at: string;
}

export interface RuleConflict {
  id: string;
  rule_a_id: string;
  rule_b_id: string;
  conflict_type: ConflictType;
  detected_at: string;
  resolution: ConflictResolution;
  notes: string | null;
}

export interface MeshRun {
  id: string;
  mode: MeshRunMode;
  run_window: string;
  started_at: string;
  ended_at: string | null;
  total_events: number;
  safe_fails: number;
  repaired: number;
  repair_failures: number;
  escalations: number;
  notes: string | null;
}

export interface PropagationStats {
  avg_breadth: number;
  most_spread_rule: { rule_key: string; breadth: number } | null;
  fastest_spreading: { rule_key: string; velocity: number } | null;
}

export interface CostStats {
  per_rule: Array<{ rule_key: string; avg_ms: number; p95_ms: number; avg_cost: number }>;
  per_executor: Array<{ executor: string; total_cost: number; total_ms: number }>;
  top_expensive: Array<{ rule_key: string; total_cost: number }>;
}
