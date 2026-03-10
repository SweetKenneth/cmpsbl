/**
 * S-Tier 076 — Performance Regression Detector
 * CJPI: 92 | Node: VISION | ID: S-104
 *
 * Detects performance regressions by comparing current metrics
 * against established baselines with configurable sensitivity.
 */

export interface PerformanceBaseline {
  metric: string;
  module: string;
  p50: number;
  p95: number;
  p99: number;
  sampleCount: number;
  establishedAt: number;
}

export interface RegressionAlert {
  metric: string;
  module: string;
  baselineP50: number;
  currentP50: number;
  degradationPct: number;
  severity: 'minor' | 'moderate' | 'severe';
  detectedAt: string;
}

const baselines = new Map<string, PerformanceBaseline>();

export function setBaseline(baseline: PerformanceBaseline): void {
  baselines.set(`${baseline.module}::${baseline.metric}`, baseline);
}

export function checkRegression(
  module: string,
  metric: string,
  currentValues: number[],
  sensitivityPct = 20
): RegressionAlert | null {
  const key = `${module}::${metric}`;
  const baseline = baselines.get(key);
  if (!baseline || currentValues.length === 0) return null;

  const sorted = [...currentValues].sort((a, b) => a - b);
  const currentP50 = sorted[Math.floor(sorted.length * 0.5)];
  const degradation = ((currentP50 - baseline.p50) / baseline.p50) * 100;

  if (degradation < sensitivityPct) return null;

  const severity: RegressionAlert['severity'] =
    degradation >= 100 ? 'severe' : degradation >= 50 ? 'moderate' : 'minor';

  return {
    metric, module,
    baselineP50: baseline.p50,
    currentP50,
    degradationPct: Math.round(degradation),
    severity,
    detectedAt: new Date().toISOString(),
  };
}

export function listBaselines(): PerformanceBaseline[] { return [...baselines.values()]; }
