/**
 * GOAL — Universal Numeric Contract
 * Global Observability Access Layer — metricsSchema.ts
 * vX.STRUCTURE.2
 *
 * All numeric metrics must conform to this contract.
 * No narrative text. Only structured numeric state.
 */

export type MetricUnit = 'count' | 'percent' | 'ms' | 'rate' | 'score' | 'bytes' | 'ratio';

export interface NumericMetric {
  metricName: string;
  value: number;
  unit: MetricUnit;
  sourceModule: string;
  timestamp: string; // ISO 8601
  snapshotId: string; // UUID v4
}

export interface ModuleLiveMetrics {
  counters: Record<string, number>;
  rates: Record<string, number>;
  healthScore: number; // 0–100
  lastUpdated: string; // ISO 8601
}

export interface ModuleAdapter {
  moduleId: string;
  getLiveMetrics(): Promise<ModuleLiveMetrics>;
}

/**
 * Validate that a percent metric is derivable from raw counts.
 * If it cannot be derived, reject.
 */
export function validatePercentDerivation(
  percentValue: number,
  numerator: number,
  denominator: number,
  tolerance = 0.01
): { valid: boolean; expected: number; actual: number } {
  if (denominator === 0) {
    return { valid: percentValue === 0, expected: 0, actual: percentValue };
  }
  const expected = numerator / denominator;
  const diff = Math.abs(expected - percentValue);
  return { valid: diff <= tolerance, expected, actual: percentValue };
}

/**
 * Create a NumericMetric entry with proper structure
 */
export function createMetric(
  metricName: string,
  value: number,
  unit: MetricUnit,
  sourceModule: string,
  snapshotId: string
): NumericMetric {
  return {
    metricName,
    value,
    unit,
    sourceModule,
    timestamp: new Date().toISOString(),
    snapshotId,
  };
}
