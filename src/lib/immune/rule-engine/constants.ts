/**
 * Immunity Mesh — Governed Rule Engine Constants
 * All thresholds in one place. No magic numbers.
 */

// ═══ PROMOTION GATES ═══
export const PROMOTION_MIN_SUCCESS_RATE = 0.80;
export const PROMOTION_MIN_INVOCATIONS = 20;
export const PROMOTION_MIN_EXECUTORS = 3;
export const PROMOTION_MIN_CONFIDENCE = 0.80;
export const PROMOTION_MAX_DURATION_INCREASE_PCT = 15;

// ═══ CANDIDATE GATES ═══
export const CANDIDATE_MIN_INVOCATIONS = 20;
export const CANDIDATE_MIN_EXECUTORS = 3;
export const CANDIDATE_MIN_CONFIDENCE = 0.80;

// ═══ DECAY / RETIREMENT ═══
export const RETIREMENT_ZERO_INVOCATIONS_DAYS = 7;
export const DEMOTION_SUCCESS_RATE_THRESHOLD = 0.60;

// ═══ RISK SCORING ═══
export const RISKY_RULE_SUCCESS_RATE = 0.60;
export const RISKY_RULE_MIN_INVOCATIONS = 20;

// ═══ AGGREGATION ═══
export const AGGREGATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
export const DASHBOARD_CACHE_TTL_MS = 30_000; // 30 seconds

// ═══ STORM ═══
export const STORM_DEFAULT_MUTATIONS_PER_EXECUTOR = 10;
export const STORM_CATEGORIES = [
  'schema_mismatch',
  'unicode_surrogate',
  'missing_required',
  'rate_limit',
  'auth_edge',
  'injection',
  'overflow',
  'null_coercion',
] as const;

export type StormCategory = typeof STORM_CATEGORIES[number];
