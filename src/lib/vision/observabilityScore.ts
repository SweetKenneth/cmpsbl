/**
 * CMPSBL® VISION — Observability Score
 * Single aggregate number (0-100) representing overall system observability health.
 */

export interface ObservabilityDimension {
  name: string;
  score: number; // 0-100
  weight: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  details: string;
}

export interface ObservabilityReport {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  dimensions: ObservabilityDimension[];
  recommendations: string[];
  calculatedAt: string;
}

interface DimensionInput {
  metricCoverage: number;      // % of modules with active metrics (0-100)
  traceCoverage: number;       // % of operations with trace context (0-100)
  alertCoverage: number;       // % of critical paths with alert rules (0-100)
  baselineValidity: number;    // % of baselines that are valid/calibrated (0-100)
  anomalyResponseRate: number; // % of anomalies resolved within SLA (0-100)
  dashboardFreshness: number;  // % of dashboards updated within 5 min (0-100)
  logCompleteness: number;     // % of events with required fields (0-100)
  slaTracking: number;         // % of services with SLA definitions (0-100)
}

const DIMENSION_WEIGHTS: Record<keyof DimensionInput, number> = {
  metricCoverage: 0.20,
  traceCoverage: 0.15,
  alertCoverage: 0.15,
  baselineValidity: 0.10,
  anomalyResponseRate: 0.15,
  dashboardFreshness: 0.10,
  logCompleteness: 0.10,
  slaTracking: 0.05,
};

const DIMENSION_NAMES: Record<keyof DimensionInput, string> = {
  metricCoverage: 'Metric Coverage',
  traceCoverage: 'Trace Coverage',
  alertCoverage: 'Alert Coverage',
  baselineValidity: 'Baseline Health',
  anomalyResponseRate: 'Anomaly Response',
  dashboardFreshness: 'Dashboard Freshness',
  logCompleteness: 'Log Completeness',
  slaTracking: 'SLA Tracking',
};

function statusFromScore(score: number): ObservabilityDimension['status'] {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function gradeFromScore(score: number): ObservabilityReport['grade'] {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Calculate observability score from dimension inputs
 */
export function calculateObservabilityScore(input: DimensionInput): ObservabilityReport {
  const dimensions: ObservabilityDimension[] = [];
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(DIMENSION_WEIGHTS) as Array<[keyof DimensionInput, number]>) {
    const score = Math.max(0, Math.min(100, input[key]));
    const status = statusFromScore(score);

    let details = '';
    if (status === 'poor') details = `${DIMENSION_NAMES[key]} needs immediate attention`;
    else if (status === 'fair') details = `${DIMENSION_NAMES[key]} has room for improvement`;
    else if (status === 'good') details = `${DIMENSION_NAMES[key]} is healthy`;
    else details = `${DIMENSION_NAMES[key]} is operating at peak`;

    dimensions.push({
      name: DIMENSION_NAMES[key],
      score,
      weight,
      status,
      details,
    });

    weightedSum += score * weight;
  }

  const overallScore = Math.round(weightedSum);
  const recommendations: string[] = [];

  // Generate targeted recommendations for weak dimensions
  const poor = dimensions.filter(d => d.status === 'poor' || d.status === 'fair')
    .sort((a, b) => a.score - b.score);

  for (const dim of poor.slice(0, 3)) {
    switch (dim.name) {
      case 'Metric Coverage':
        recommendations.push('Add metric instrumentation to uncovered modules');
        break;
      case 'Trace Coverage':
        recommendations.push('Enable distributed tracing on critical request paths');
        break;
      case 'Alert Coverage':
        recommendations.push('Define alert rules for unmonitored critical paths');
        break;
      case 'Baseline Health':
        recommendations.push('Wait for baselines to accumulate sufficient samples or force recalibration');
        break;
      case 'Anomaly Response':
        recommendations.push('Investigate unresolved anomalies and reduce MTTR');
        break;
      case 'Dashboard Freshness':
        recommendations.push('Check metric pipeline for stale data or broken collectors');
        break;
      case 'Log Completeness':
        recommendations.push('Ensure all events include required fields (module, timestamp, outcome)');
        break;
      case 'SLA Tracking':
        recommendations.push('Register SLA definitions for critical services');
        break;
    }
  }

  return {
    overallScore,
    grade: gradeFromScore(overallScore),
    dimensions: dimensions.sort((a, b) => a.score - b.score),
    recommendations,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Quick score with defaults (for when full input isn't available)
 */
export function quickObservabilityScore(partialInput: Partial<DimensionInput>): number {
  const defaults: DimensionInput = {
    metricCoverage: 50,
    traceCoverage: 30,
    alertCoverage: 40,
    baselineValidity: 20,
    anomalyResponseRate: 60,
    dashboardFreshness: 70,
    logCompleteness: 50,
    slaTracking: 20,
  };

  const input = { ...defaults, ...partialInput };
  return calculateObservabilityScore(input).overallScore;
}
