/**
 * ENGINEER — Performance Regression Detector
 * Statistical change-point detection (CUSUM) for latency, throughput, error rates.
 * Automatic bisection to identify causal change.
 * @module engineer/performanceRegressionDetector
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type MetricType = 'latency_p95' | 'throughput' | 'error_rate';

export interface MetricSample {
  metric: MetricType;
  value: number;
  timestamp: number;
  label?: string; // e.g., commit hash or version
}

export interface RegressionAlert {
  metric: MetricType;
  detectedAt: number;
  baselineMean: number;
  currentMean: number;
  changePercent: number;
  cusumValue: number;
  threshold: number;
  bisectionResult?: {
    beforeLabel: string;
    afterLabel: string;
    suspectedCause: string;
  };
}

interface CusumState {
  samples: MetricSample[];
  baselineMean: number;
  baselineStd: number;
  cusumHigh: number;
  cusumLow: number;
  sampleCount: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const BASELINE_WINDOW = 50;
const MAX_SAMPLES = 500;
const CUSUM_THRESHOLD_FACTOR = 5; // alert at 5σ cumulative shift

const REGRESSION_THRESHOLDS: Record<MetricType, number> = {
  latency_p95: 0.20,   // 20% increase
  throughput: 0.15,     // 15% decrease
  error_rate: 0.05,     // 5% increase
};

// ── State ──────────────────────────────────────────────────────────────────

const cusumStates = new Map<MetricType, CusumState>();
const alerts: RegressionAlert[] = [];

// ── Helpers ────────────────────────────────────────────────────────────────

function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[], avg: number): number {
  if (values.length < 2) return 1;
  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance) || 1;
}

// ── Core ───────────────────────────────────────────────────────────────────

function getOrInit(metric: MetricType): CusumState {
  if (!cusumStates.has(metric)) {
    cusumStates.set(metric, {
      samples: [],
      baselineMean: 0,
      baselineStd: 1,
      cusumHigh: 0,
      cusumLow: 0,
      sampleCount: 0,
    });
  }
  return cusumStates.get(metric)!;
}

export function ingestSample(sample: MetricSample): RegressionAlert | null {
  const state = getOrInit(sample.metric);
  state.samples.push(sample);
  if (state.samples.length > MAX_SAMPLES) {
    state.samples = state.samples.slice(-MAX_SAMPLES);
  }
  state.sampleCount++;

  // Build baseline from first N samples
  if (state.sampleCount <= BASELINE_WINDOW) {
    const values = state.samples.map(s => s.value);
    state.baselineMean = mean(values);
    state.baselineStd = stddev(values, state.baselineMean);
    return null;
  }

  // CUSUM update
  const normalized = (sample.value - state.baselineMean) / state.baselineStd;
  state.cusumHigh = Math.max(0, state.cusumHigh + normalized - 0.5);
  state.cusumLow = Math.min(0, state.cusumLow + normalized + 0.5);

  const threshold = CUSUM_THRESHOLD_FACTOR;
  const isRegression =
    (sample.metric === 'throughput' && state.cusumLow < -threshold) ||
    (sample.metric !== 'throughput' && state.cusumHigh > threshold);

  if (!isRegression) return null;

  // Compute regression magnitude
  const recentWindow = state.samples.slice(-20).map(s => s.value);
  const currentMean = mean(recentWindow);
  const changePct = state.baselineMean !== 0
    ? (currentMean - state.baselineMean) / state.baselineMean
    : 0;

  const metricThreshold = REGRESSION_THRESHOLDS[sample.metric];
  if (Math.abs(changePct) < metricThreshold) return null;

  // Bisect: find the sample where the shift happened
  const bisection = bisectChangePoint(state.samples);

  const alert: RegressionAlert = {
    metric: sample.metric,
    detectedAt: Date.now(),
    baselineMean: Math.round(state.baselineMean * 1000) / 1000,
    currentMean: Math.round(currentMean * 1000) / 1000,
    changePercent: Math.round(changePct * 10000) / 100,
    cusumValue: Math.round((sample.metric === 'throughput' ? state.cusumLow : state.cusumHigh) * 100) / 100,
    threshold,
    bisectionResult: bisection,
  };

  alerts.push(alert);

  // Reset CUSUM after alert to avoid repeated firing
  state.cusumHigh = 0;
  state.cusumLow = 0;
  state.baselineMean = currentMean;
  state.baselineStd = stddev(recentWindow, currentMean);

  return alert;
}

function bisectChangePoint(
  samples: MetricSample[],
): { beforeLabel: string; afterLabel: string; suspectedCause: string } | undefined {
  if (samples.length < 10) return undefined;

  let maxDiff = 0;
  let splitIdx = Math.floor(samples.length / 2);

  for (let i = 5; i < samples.length - 5; i++) {
    const leftMean = mean(samples.slice(i - 5, i).map(s => s.value));
    const rightMean = mean(samples.slice(i, i + 5).map(s => s.value));
    const diff = Math.abs(rightMean - leftMean);
    if (diff > maxDiff) {
      maxDiff = diff;
      splitIdx = i;
    }
  }

  const before = samples[splitIdx - 1];
  const after = samples[splitIdx];
  return {
    beforeLabel: before?.label ?? `sample-${splitIdx - 1}`,
    afterLabel: after?.label ?? `sample-${splitIdx}`,
    suspectedCause: `Change point detected between samples ${splitIdx - 1} and ${splitIdx}`,
  };
}

export function getAlerts(): RegressionAlert[] {
  return [...alerts];
}

export function clearAlerts(): void {
  alerts.length = 0;
}

export function resetDetector(metric?: MetricType): void {
  if (metric) cusumStates.delete(metric);
  else cusumStates.clear();
  alerts.length = 0;
}
