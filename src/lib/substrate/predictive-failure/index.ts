/**
 * Predictive Failure Detection
 * v1.0.0 — Detects impending failures before they occur
 * 
 * Uses trailing metric windows (error rate, latency, memory) to predict
 * failures and trigger preemptive mitigation actions.
 */

export interface MetricSample {
  moduleId: string;
  metric: string;
  value: number;
  timestamp: number;
}

export interface FailurePrediction {
  id: string;
  moduleId: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  threshold: number;
  confidence: number;
  estimatedTimeToFailureMs: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
  createdAt: number;
}

export interface PredictiveConfig {
  windowSize: number;           // Number of samples in trailing window
  predictionHorizonMs: number;  // How far ahead to predict
  thresholds: Record<string, number>;
  minSamplesForPrediction: number;
}

const DEFAULT_CONFIG: PredictiveConfig = {
  windowSize: 20,
  predictionHorizonMs: 300_000, // 5 minutes
  thresholds: {
    error_rate: 0.15,
    latency_ms: 5000,
    memory_mb: 450,
    cpu_percent: 85,
  },
  minSamplesForPrediction: 5,
};

const metricWindows = new Map<string, MetricSample[]>();
const predictions: FailurePrediction[] = [];
let config = { ...DEFAULT_CONFIG };

/**
 * Record a metric sample
 */
export function recordSample(sample: MetricSample): void {
  const key = `${sample.moduleId}:${sample.metric}`;
  const window = metricWindows.get(key) ?? [];
  window.push(sample);

  // Trim to window size
  if (window.length > config.windowSize) {
    window.splice(0, window.length - config.windowSize);
  }
  metricWindows.set(key, window);
}

/**
 * Linear regression slope for trend detection
 */
function calculateSlope(samples: MetricSample[]): number {
  if (samples.length < 2) return 0;
  const n = samples.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  const t0 = samples[0].timestamp;

  for (let i = 0; i < n; i++) {
    const x = (samples[i].timestamp - t0) / 1000;
    const y = samples[i].value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

/**
 * Predict failures for all tracked metrics
 */
export function runPredictionCycle(): FailurePrediction[] {
  const newPredictions: FailurePrediction[] = [];

  for (const [key, samples] of metricWindows) {
    if (samples.length < config.minSamplesForPrediction) continue;

    const [moduleId, metric] = key.split(':');
    const threshold = config.thresholds[metric];
    if (!threshold) continue;

    const slope = calculateSlope(samples);
    const current = samples[samples.length - 1].value;
    const horizonSec = config.predictionHorizonMs / 1000;
    const predicted = current + slope * horizonSec;

    if (predicted >= threshold && slope > 0) {
      const timeToThreshold = slope > 0 ? ((threshold - current) / slope) * 1000 : Infinity;
      const confidence = Math.min(0.95, 0.5 + (samples.length / config.windowSize) * 0.45);

      const prediction: FailurePrediction = {
        id: `pred-${Date.now()}-${moduleId}-${metric}`,
        moduleId,
        metric,
        currentValue: current,
        predictedValue: predicted,
        threshold,
        confidence,
        estimatedTimeToFailureMs: Math.max(0, timeToThreshold),
        severity: timeToThreshold < 60000 ? 'critical' : timeToThreshold < 180000 ? 'high' : 'medium',
        suggestedAction: `Preemptive mitigation for ${metric} on ${moduleId}`,
        createdAt: Date.now(),
      };

      newPredictions.push(prediction);
      predictions.push(prediction);
    }
  }

  return newPredictions;
}

/** Get all predictions */
export function getPredictions(): FailurePrediction[] {
  return [...predictions];
}

/** Get active (recent) predictions */
export function getActivePredictions(withinMs: number = 600_000): FailurePrediction[] {
  const cutoff = Date.now() - withinMs;
  return predictions.filter(p => p.createdAt > cutoff);
}

/** Configure prediction engine */
export function configurePrediction(updates: Partial<PredictiveConfig>) {
  config = { ...config, ...updates };
}

/** Clear prediction history */
export function clearPredictions() {
  predictions.length = 0;
}
