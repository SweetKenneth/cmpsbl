/**
 * Promotion Pipeline — Constants & Thresholds
 * All "magic numbers" in one place for governance clarity.
 */

// Preflight guardrails
export const PREFLIGHT = {
  MIN_SUCCESS_RATE: 0.60,
  MAX_ESCALATION_INCREASE: 0.10,
  MAX_LATENCY_DELTA: 0.20,
  MAX_COST_DELTA: 0.25,
  MIN_EXECUTOR_HEALTH: 0.50,
  MIN_INTEGRITY_SCORE: 70,
} as const;

// Canary settings
export const CANARY = {
  TRAFFIC_PERCENT: 5,
  REPLAY_COUNT: 20,
  TIMEOUT_MS: 30_000,
} as const;

// Telemetry recording interval (ms)
export const METRICS_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// Retention
export const RETENTION_DAYS = 30;

// Integrity scan categories
export const INTEGRITY_CATEGORIES = [
  'rule_conflicts',
  'oscillation',
  'duplicate_rules',
  'executor_mismatch',
  'escalation_spike',
  'latency_creep',
  'snapshot_mismatch',
] as const;

export type IntegrityCategory = typeof INTEGRITY_CATEGORIES[number];
