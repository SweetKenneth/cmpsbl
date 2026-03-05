/**
 * 3-Lane Integrity Computation
 * Replaces single scalar WMI with availability/correctness/performance lanes
 */

import type {
  IntegrityReport,
  IntegrityLane,
  IntegrityMode,
  IntegrityWeights,
  IntegrityInputs,
  ModuleIntegrityConfig,
} from './types';
import { DEFAULT_INTEGRITY_WEIGHTS, INTEGRITY_CONSTANTS } from './types';

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/** Validate weight config: sum must be 1.0 and per-module cap enforced */
export function validateWeights(
  configs: ModuleIntegrityConfig[],
  weights: IntegrityWeights
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const wSum = weights.availability + weights.correctness + weights.performance;
  if (Math.abs(wSum - 1.0) > INTEGRITY_CONSTANTS.WEIGHT_SUM_TOLERANCE) {
    errors.push(`Lane weight sum ${wSum} != 1.0`);
  }
  for (const c of configs) {
    if (c.weight > INTEGRITY_CONSTANTS.MAX_MODULE_WEIGHT && !c.core_kernel_exception) {
      errors.push(`Module ${c.module} weight ${c.weight} exceeds cap ${INTEGRITY_CONSTANTS.MAX_MODULE_WEIGHT}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/** Compute blast radius factor for a module */
export function blastRadiusFactor(fanout: number, maxFanout: number): number {
  if (maxFanout <= 0) return 1;
  return 1 + (fanout / maxFanout) * INTEGRITY_CONSTANTS.BLAST_RADIUS_K;
}

/** Compute availability lane score */
function computeAvailability(inputs: IntegrityInputs, modules: ModuleIntegrityConfig[]): number {
  const totalModules = Math.max(inputs.module_count, 1);
  const breakerPenalty = (inputs.breaker_open_count / totalModules) * 40;
  const quarantinePenalty = (inputs.quarantine_count / totalModules) * 30;
  return clamp(100 - breakerPenalty - quarantinePenalty);
}

/** Compute correctness lane score */
function computeCorrectness(inputs: IntegrityInputs): number {
  const errorPenalty = Math.min(inputs.error_rate * 100, 50);
  const validationPenalty = Math.min(inputs.validation_failure_count * 2, 25);
  const contradictionPenalty = Math.min(inputs.contradiction_count * 5, 25);
  return clamp(100 - errorPenalty - validationPenalty - contradictionPenalty);
}

/** Compute performance lane score */
function computePerformance(inputs: IntegrityInputs): number {
  const baseP95 = Math.max(inputs.baseline_p95_ms, 1);
  const baseP99 = Math.max(inputs.baseline_p99_ms, 1);
  const p95Regression = Math.max(0, (inputs.p95_latency_ms - baseP95) / baseP95);
  const p99Regression = Math.max(0, (inputs.p99_latency_ms - baseP99) / baseP99);
  const p95Penalty = Math.min(p95Regression * 30, 40);
  const p99Penalty = Math.min(p99Regression * 20, 30);
  return clamp(100 - p95Penalty - p99Penalty);
}

/** Compute total from lanes */
function computeTotal(lanes: IntegrityLane, mode: IntegrityMode, weights: IntegrityWeights): number {
  if (mode === 'min') {
    return Math.min(lanes.availability, lanes.correctness, lanes.performance);
  }
  return clamp(
    lanes.availability * weights.availability +
    lanes.correctness * weights.correctness +
    lanes.performance * weights.performance
  );
}

/** Main entry: compute a full integrity report */
export function computeIntegrityReport(
  modules: ModuleIntegrityConfig[],
  inputs: IntegrityInputs,
  opts?: { mode?: IntegrityMode; weights?: IntegrityWeights }
): IntegrityReport {
  const mode = opts?.mode ?? 'min';
  const weights = opts?.weights ?? DEFAULT_INTEGRITY_WEIGHTS;

  const lanes: IntegrityLane = {
    availability: computeAvailability(inputs, modules),
    correctness: computeCorrectness(inputs),
    performance: computePerformance(inputs),
  };

  const total = computeTotal(lanes, mode, weights);

  return {
    lanes,
    total,
    mode,
    computed_at: new Date().toISOString(),
    inputs,
    integrity_score_legacy: total,
  };
}
