/**
 * SLO-Based Health Grading — Replaces threshold-based grading
 * Grade rules:
 *   A/B: within SLO, low burn
 *   C: within SLO but burn elevated
 *   D/F: SLO violated OR breaker open too long OR MTTR above cap
 */

import type { HealthGrade, HealthGradeReport, SloSpec, BurnRateWindow } from './types';
import { getSlo, checkSloCompliance } from './slo';
import { computeBurnRates, isBurnElevated } from './burnRate';
import { computeMttr } from './mttr';

const MTTR_CAP_MS = 30 * 60 * 1000; // 30 minutes

export interface GradingInputs {
  module: string;
  uptime: number;
  error_rate: number;
  p95_ms: number;
  p99_ms: number;
  breaker_open: boolean;
  breaker_open_duration_ms?: number;
  total_error_budget?: number;
}

/** Compute health grade for a module */
export function computeGrade(inputs: GradingInputs): HealthGradeReport {
  const slo = getSlo(inputs.module);
  const compliance = checkSloCompliance(inputs.module, {
    uptime: inputs.uptime,
    error_rate: inputs.error_rate,
    p95_ms: inputs.p95_ms,
    p99_ms: inputs.p99_ms,
  });

  const burnRates = computeBurnRates(
    inputs.module,
    inputs.total_error_budget ?? 100,
    slo.error_budget_window_hours
  );
  const burnElevated = isBurnElevated(burnRates);
  const mttr = computeMttr(inputs.module);

  let grade: HealthGrade;

  // F: SLO violated + breaker open
  if (!compliance.compliant && inputs.breaker_open) {
    grade = 'F';
  }
  // D: SLO violated OR MTTR too high
  else if (!compliance.compliant || (mttr !== null && mttr > MTTR_CAP_MS)) {
    grade = 'D';
  }
  // C: within SLO but burn rate elevated
  else if (burnElevated) {
    grade = 'C';
  }
  // B: within SLO, low burn, but some minor concern
  else if (inputs.p99_ms > slo.p99_latency_target_ms * 0.8) {
    grade = 'B';
  }
  // A: everything healthy
  else {
    grade = 'A';
  }

  return {
    module: inputs.module,
    grade,
    slo_compliant: compliance.compliant,
    burn_rate_elevated: burnElevated,
    breaker_open: inputs.breaker_open,
    p99_latency_ms: inputs.p99_ms,
    mttr_ms: mttr,
    slo_spec: slo,
    burn_rates: burnRates.windows,
    computed_at: new Date().toISOString(),
  };
}

/** Batch compute grades for all modules */
export function computeAllGrades(modules: GradingInputs[]): HealthGradeReport[] {
  return modules.map(computeGrade);
}
