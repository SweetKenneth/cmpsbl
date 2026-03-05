/**
 * Health + SLO Types — SLO-driven health grading with burn rates
 */

export interface SloSpec {
  module: string;
  uptime_target: number;        // e.g. 0.999
  error_rate_target: number;    // e.g. 0.01 (1%)
  p95_latency_target_ms: number;
  p99_latency_target_ms: number;
  error_budget_window_hours: number; // e.g. 720 (30 days)
}

export interface BurnRateWindow {
  window_minutes: number;
  burn_rate: number;           // consumed budget / elapsed fraction
  budget_remaining: number;    // 0–1
}

export interface BurnRateSpec {
  module: string;
  windows: BurnRateWindow[];   // e.g. [5m, 60m, 1440m]
  computed_at: string;
}

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface HealthGradeReport {
  module: string;
  grade: HealthGrade;
  slo_compliant: boolean;
  burn_rate_elevated: boolean;
  breaker_open: boolean;
  p99_latency_ms: number | null;
  mttr_ms: number | null;
  slo_spec: SloSpec;
  burn_rates: BurnRateWindow[];
  computed_at: string;
}

export interface MttrRecord {
  module: string;
  incident_opened_at: string;
  incident_resolved_at: string | null;
  duration_ms: number | null;
}

export const DEFAULT_SLO: Omit<SloSpec, 'module'> = {
  uptime_target: 0.995,
  error_rate_target: 0.02,
  p95_latency_target_ms: 500,
  p99_latency_target_ms: 1500,
  error_budget_window_hours: 720,
};

export const BURN_RATE_WINDOWS_MINUTES = [5, 60, 1440] as const;
