/**
 * SHADOW Ultimate — Divergence Analyzer
 * Multi-dimensional comparison: output equivalence, latency, error rate, resources.
 * Weighted composite divergence scoring.
 */

export interface DivergenceReport {
  id: string;
  sessionId: string;
  outputDivergence: number;      // 0–1
  latencyDivergence: number;     // 0–1
  errorDivergence: number;       // 0–1
  resourceDivergence: number;    // 0–1
  compositeScore: number;        // weighted composite
  verdict: 'pass' | 'review' | 'fail';
  details: DivergenceDetail[];
  analyzedAt: number;
}

export interface DivergenceDetail {
  dimension: string;
  productionValue: number;
  shadowValue: number;
  delta: number;
  significance: 'negligible' | 'minor' | 'significant' | 'critical';
}

export interface DivergenceStats {
  totalReports: number;
  avgComposite: number;
  passRate: number;
  failRate: number;
  reviewRate: number;
}

const WEIGHT_OUTPUT = 0.50;
const WEIGHT_LATENCY = 0.30;
const WEIGHT_ERROR = 0.20;
const PASS_THRESHOLD = 0.05;
const REVIEW_THRESHOLD = 0.15;

const MAX_REPORTS = 1000;
const reports: DivergenceReport[] = [];

function computeSignificance(delta: number): DivergenceDetail['significance'] {
  if (delta < 0.02) return 'negligible';
  if (delta < 0.10) return 'minor';
  if (delta < 0.30) return 'significant';
  return 'critical';
}

export function analyzeDivergence(
  sessionId: string,
  production: { outputs: number[]; latencyMs: number; errorRate: number; resourceUsage: number },
  shadow: { outputs: number[]; latencyMs: number; errorRate: number; resourceUsage: number }
): DivergenceReport {
  // Output divergence: normalized mean absolute difference
  let outputDiv = 0;
  if (production.outputs.length > 0) {
    const len = Math.min(production.outputs.length, shadow.outputs.length);
    let totalDiff = 0;
    for (let i = 0; i < len; i++) {
      const maxVal = Math.max(Math.abs(production.outputs[i]), Math.abs(shadow.outputs[i]), 1);
      totalDiff += Math.abs(production.outputs[i] - shadow.outputs[i]) / maxVal;
    }
    outputDiv = len > 0 ? totalDiff / len : 0;
  }

  // Latency divergence
  const maxLat = Math.max(production.latencyMs, shadow.latencyMs, 1);
  const latencyDiv = Math.abs(production.latencyMs - shadow.latencyMs) / maxLat;

  // Error divergence
  const errorDiv = Math.abs(production.errorRate - shadow.errorRate);

  // Resource divergence
  const maxRes = Math.max(production.resourceUsage, shadow.resourceUsage, 1);
  const resourceDiv = Math.abs(production.resourceUsage - shadow.resourceUsage) / maxRes;

  const compositeScore = outputDiv * WEIGHT_OUTPUT + latencyDiv * WEIGHT_LATENCY + errorDiv * WEIGHT_ERROR;

  const verdict: DivergenceReport['verdict'] =
    compositeScore < PASS_THRESHOLD ? 'pass'
    : compositeScore < REVIEW_THRESHOLD ? 'review'
    : 'fail';

  const details: DivergenceDetail[] = [
    { dimension: 'output', productionValue: production.outputs.length, shadowValue: shadow.outputs.length, delta: outputDiv, significance: computeSignificance(outputDiv) },
    { dimension: 'latency', productionValue: production.latencyMs, shadowValue: shadow.latencyMs, delta: latencyDiv, significance: computeSignificance(latencyDiv) },
    { dimension: 'error_rate', productionValue: production.errorRate, shadowValue: shadow.errorRate, delta: errorDiv, significance: computeSignificance(errorDiv) },
    { dimension: 'resources', productionValue: production.resourceUsage, shadowValue: shadow.resourceUsage, delta: resourceDiv, significance: computeSignificance(resourceDiv) },
  ];

  const report: DivergenceReport = {
    id: `div-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sessionId, outputDivergence: outputDiv, latencyDivergence: latencyDiv,
    errorDivergence: errorDiv, resourceDivergence: resourceDiv,
    compositeScore, verdict, details, analyzedAt: Date.now(),
  };

  if (reports.length >= MAX_REPORTS) reports.shift();
  reports.push(report);
  return report;
}

export function getDivergenceStats(): DivergenceStats {
  const total = reports.length;
  return {
    totalReports: total,
    avgComposite: total > 0 ? reports.reduce((s, r) => s + r.compositeScore, 0) / total : 0,
    passRate: total > 0 ? reports.filter(r => r.verdict === 'pass').length / total : 0,
    failRate: total > 0 ? reports.filter(r => r.verdict === 'fail').length / total : 0,
    reviewRate: total > 0 ? reports.filter(r => r.verdict === 'review').length / total : 0,
  };
}

export function resetDivergenceState(): void { reports.length = 0; }
