/**
 * Integrity Types — 3-Lane Structural Integrity Model
 * Replaces single scalar WMI with availability/correctness/performance lanes
 */

export interface IntegrityLane {
  availability: number;   // 0–100: uptime, breaker penalties, quarantine
  correctness: number;    // 0–100: error rate, validation failures, contradiction signals
  performance: number;    // 0–100: p95/p99 latency regression against baseline
}

export type IntegrityMode = 'min' | 'weighted';

export interface IntegrityWeights {
  availability: number;   // default 0.35
  correctness: number;    // default 0.40
  performance: number;    // default 0.25
}

export interface IntegrityReport {
  lanes: IntegrityLane;
  total: number;
  mode: IntegrityMode;
  computed_at: string;
  inputs: IntegrityInputs;
  integrity_score_legacy: number; // backward compat
}

export interface IntegrityInputs {
  module_count: number;
  breaker_open_count: number;
  quarantine_count: number;
  error_rate: number;
  validation_failure_count: number;
  contradiction_count: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  baseline_p95_ms: number;
  baseline_p99_ms: number;
}

export interface ModuleIntegrityConfig {
  module: string;
  weight: number;
  core_kernel_exception?: boolean;
  fanout: number;       // downstream dependency count
  max_fanout: number;   // global max for normalization
}

export const DEFAULT_INTEGRITY_WEIGHTS: IntegrityWeights = {
  availability: 0.35,
  correctness: 0.40,
  performance: 0.25,
};

export const INTEGRITY_CONSTANTS = {
  MAX_MODULE_WEIGHT: 0.25,
  BLAST_RADIUS_K: 0.15,
  WEIGHT_SUM_TOLERANCE: 0.001,
} as const;
