/**
 * ENGINEER — Workload Pattern Learner
 * 7-day seasonal model (hour × day-of-week) with anomaly detection.
 * Feeds predictive scaling with 20% headroom.
 * @module engineer/workloadPatternLearner
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface LoadSample {
  value: number;        // load metric (e.g., requests/sec)
  timestamp: number;    // epoch ms
}

export interface SeasonalPrediction {
  dayOfWeek: number;    // 0=Sun, 6=Sat
  hour: number;         // 0–23
  expectedLoad: number;
  withHeadroom: number;
  confidence: number;   // 0–1
  sampleCount: number;
}

export interface AnomalyDetection {
  isAnomaly: boolean;
  currentLoad: number;
  expectedLoad: number;
  deviationPercent: number;
  zScore: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const HEADROOM_FACTOR = 1.20; // 20% headroom
const ANOMALY_Z_THRESHOLD = 2.5;
const EMA_ALPHA = 0.15;

// ── State: 7 days × 24 hours = 168 slots ──────────────────────────────────

interface SlotData {
  sum: number;
  sumSq: number;
  count: number;
  ema: number;
}

const seasonalGrid: SlotData[][] = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => ({ sum: 0, sumSq: 0, count: 0, ema: 0 }))
);

// ── Core ───────────────────────────────────────────────────────────────────

function slotKey(timestamp: number): { day: number; hour: number } {
  const d = new Date(timestamp);
  return { day: d.getDay(), hour: d.getHours() };
}

export function recordLoad(sample: LoadSample): void {
  const { day, hour } = slotKey(sample.timestamp);
  const slot = seasonalGrid[day][hour];
  slot.sum += sample.value;
  slot.sumSq += sample.value * sample.value;
  slot.count++;
  slot.ema = slot.count === 1
    ? sample.value
    : EMA_ALPHA * sample.value + (1 - EMA_ALPHA) * slot.ema;
}

export function predict(dayOfWeek: number, hour: number): SeasonalPrediction {
  const slot = seasonalGrid[dayOfWeek]?.[hour];
  if (!slot || slot.count === 0) {
    return {
      dayOfWeek, hour,
      expectedLoad: 0,
      withHeadroom: 0,
      confidence: 0,
      sampleCount: 0,
    };
  }

  const mean = slot.ema; // use EMA for recency bias
  const confidence = Math.min(1, slot.count / 28); // ~4 weeks of data = full confidence

  return {
    dayOfWeek, hour,
    expectedLoad: Math.round(mean * 100) / 100,
    withHeadroom: Math.round(mean * HEADROOM_FACTOR * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    sampleCount: slot.count,
  };
}

export function predictCurrent(): SeasonalPrediction {
  const now = new Date();
  return predict(now.getDay(), now.getHours());
}

export function detectAnomaly(currentLoad: number, timestamp?: number): AnomalyDetection {
  const { day, hour } = slotKey(timestamp ?? Date.now());
  const slot = seasonalGrid[day][hour];

  if (!slot || slot.count < 5) {
    return { isAnomaly: false, currentLoad, expectedLoad: 0, deviationPercent: 0, zScore: 0 };
  }

  const mean = slot.sum / slot.count;
  const variance = (slot.sumSq / slot.count) - mean * mean;
  const std = Math.sqrt(Math.max(0, variance)) || 1;
  const zScore = (currentLoad - mean) / std;
  const deviationPercent = mean !== 0 ? ((currentLoad - mean) / mean) * 100 : 0;

  return {
    isAnomaly: Math.abs(zScore) > ANOMALY_Z_THRESHOLD,
    currentLoad,
    expectedLoad: Math.round(mean * 100) / 100,
    deviationPercent: Math.round(deviationPercent * 10) / 10,
    zScore: Math.round(zScore * 100) / 100,
  };
}

export function getWeeklyProfile(): SeasonalPrediction[] {
  const profile: SeasonalPrediction[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      profile.push(predict(day, hour));
    }
  }
  return profile;
}

export function resetLearner(): void {
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      seasonalGrid[d][h] = { sum: 0, sumSq: 0, count: 0, ema: 0 };
    }
  }
}
