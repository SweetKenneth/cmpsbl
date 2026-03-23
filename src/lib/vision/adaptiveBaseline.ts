/**
 * CMPSBL® VISION — Adaptive Baseline Engine
 * Self-calibrating baselines using rolling windows and EMA.
 * Replaces static thresholds with learned, per-metric norms.
 */

export interface BaselineConfig {
  windowSize: number;      // number of samples
  emaAlpha: number;        // EMA smoothing factor (0-1)
  deviationMultiplier: number; // z-score threshold for anomaly
  recalibrateInterval: number; // samples between recalibrations
  minSamples: number;      // minimum samples before baseline is valid
}

export interface MetricBaseline {
  metric: string;
  mean: number;
  stdDev: number;
  emaValue: number;
  sampleCount: number;
  lastCalibrated: string;
  upperBound: number;
  lowerBound: number;
  isValid: boolean;
  config: BaselineConfig;
}

const DEFAULT_CONFIG: BaselineConfig = {
  windowSize: 100,
  emaAlpha: 0.1,
  deviationMultiplier: 2.5,
  recalibrateInterval: 20,
  minSamples: 10,
};

// Bounded store
const MAX_BASELINES = 300;
const baselines = new Map<string, MetricBaseline>();
const sampleBuffers = new Map<string, number[]>();

/**
 * Record a metric observation and update baseline
 */
export function observe(
  metric: string,
  value: number,
  config?: Partial<BaselineConfig>
): { baseline: MetricBaseline; isAnomaly: boolean; zScore: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Get or create sample buffer
  let buffer = sampleBuffers.get(metric);
  if (!buffer) {
    if (sampleBuffers.size >= MAX_BASELINES) {
      const oldest = sampleBuffers.keys().next().value;
      if (oldest) { sampleBuffers.delete(oldest); baselines.delete(oldest); }
    }
    buffer = [];
    sampleBuffers.set(metric, buffer);
  }

  buffer.push(value);
  if (buffer.length > cfg.windowSize) buffer.shift();

  // Get or create baseline
  let baseline = baselines.get(metric);
  if (!baseline) {
    baseline = {
      metric,
      mean: value,
      stdDev: 0,
      emaValue: value,
      sampleCount: 0,
      lastCalibrated: new Date().toISOString(),
      upperBound: Infinity,
      lowerBound: -Infinity,
      isValid: false,
      config: cfg,
    };
    baselines.set(metric, baseline);
  }

  baseline.sampleCount++;

  // Update EMA
  baseline.emaValue = baseline.emaValue + cfg.emaAlpha * (value - baseline.emaValue);

  // Recalibrate periodically
  if (baseline.sampleCount % cfg.recalibrateInterval === 0 && buffer.length >= cfg.minSamples) {
    calibrate(metric, buffer, cfg);
  }

  // Check for anomaly
  const zScore = baseline.stdDev > 0 ? (value - baseline.mean) / baseline.stdDev : 0;
  const isAnomaly = baseline.isValid && Math.abs(zScore) > cfg.deviationMultiplier;

  return {
    baseline: { ...baseline },
    isAnomaly,
    zScore: Math.round(zScore * 100) / 100,
  };
}

/**
 * Recalibrate baseline from sample buffer
 */
function calibrate(metric: string, buffer: number[], config: BaselineConfig): void {
  const baseline = baselines.get(metric);
  if (!baseline || buffer.length < config.minSamples) return;

  // Trimmed mean (exclude top/bottom 5% for robustness)
  const sorted = [...buffer].sort((a, b) => a - b);
  const trimStart = Math.floor(sorted.length * 0.05);
  const trimEnd = Math.ceil(sorted.length * 0.95);
  const trimmed = sorted.slice(trimStart, trimEnd);

  const mean = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  const variance = trimmed.reduce((sum, v) => sum + (v - mean) ** 2, 0) / trimmed.length;
  const stdDev = Math.sqrt(variance);

  baseline.mean = mean;
  baseline.stdDev = stdDev;
  baseline.upperBound = mean + config.deviationMultiplier * stdDev;
  baseline.lowerBound = mean - config.deviationMultiplier * stdDev;
  baseline.isValid = true;
  baseline.lastCalibrated = new Date().toISOString();
  baseline.config = config;
}

/**
 * Get baseline for a metric
 */
export function getBaseline(metric: string): MetricBaseline | undefined {
  return baselines.get(metric);
}

/**
 * Get all baselines summary
 */
export function getAllBaselines(): Array<{
  metric: string;
  mean: number;
  stdDev: number;
  bounds: [number, number];
  samples: number;
  valid: boolean;
}> {
  return Array.from(baselines.values()).map(b => ({
    metric: b.metric,
    mean: Math.round(b.mean * 100) / 100,
    stdDev: Math.round(b.stdDev * 100) / 100,
    bounds: [Math.round(b.lowerBound * 100) / 100, Math.round(b.upperBound * 100) / 100] as [number, number],
    samples: b.sampleCount,
    valid: b.isValid,
  }));
}

/**
 * Force recalibration of a specific metric
 */
export function forceCalibrate(metric: string): boolean {
  const buffer = sampleBuffers.get(metric);
  const baseline = baselines.get(metric);
  if (!buffer || !baseline) return false;
  calibrate(metric, buffer, baseline.config);
  return true;
}
