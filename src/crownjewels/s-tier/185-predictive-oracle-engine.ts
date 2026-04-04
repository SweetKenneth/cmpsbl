/**
 * S-Tier 185 — Predictive Oracle Engine
 * CJPI: 92 | Module: ORACLE | ID: S-ORC01
 *
 * Multi-signal prediction engine with weighted ingestion, exponential
 * decay, multi-horizon forecasting, accuracy tracking, and anomaly
 * detection. Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface OracleSignal {
  source: string;
  value: number;
  weight: number;
  timestamp: number;
}

export interface OraclePrediction {
  id: string;
  horizon: number;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  confidence: number;
  signals: number;
  generatedAt: string;
}

export interface OracleStats {
  totalSignals: number;
  totalPredictions: number;
  avgConfidence: number;
  accuracy: number;
  sources: string[];
}

const MAX_SIGNALS = 1000;
const MAX_PREDICTIONS = 500;

export function createPredictiveOracle() {
  let signals: OracleSignal[] = [];
  let predictions: OraclePrediction[] = [];
  let outcomes: { predictionId: string; correct: boolean }[] = [];

  function ingestSignal(source: string, value: number, weight: number = 1): void {
    signals.push({ source, value, weight, timestamp: Date.now() });
    if (signals.length > MAX_SIGNALS) signals = signals.slice(-MAX_SIGNALS);
  }

  function ingestBatch(batch: { source: string; value: number; weight?: number }[]): number {
    for (const b of batch) ingestSignal(b.source, b.value, b.weight ?? 1);
    return batch.length;
  }

  function predict(horizonMs: number, decayFactor: number = 0.95): OraclePrediction {
    const now = Date.now();
    const relevant = signals.filter(s => now - s.timestamp < horizonMs * 3);

    let weightedSum = 0;
    let totalWeight = 0;
    for (const s of relevant) {
      const age = (now - s.timestamp) / horizonMs;
      const decayed = s.weight * Math.pow(decayFactor, age);
      weightedSum += s.value * decayed;
      totalWeight += decayed;
    }

    const avg = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const recent = relevant.slice(-Math.ceil(relevant.length / 2));
    const recentAvg = recent.length > 0
      ? recent.reduce((s, sig) => s + sig.value, 0) / recent.length
      : 0;

    const delta = recentAvg - avg;
    const direction: OraclePrediction['direction'] =
      Math.abs(delta) < 0.05 ? 'stable' : delta > 0 ? 'up' : 'down';
    const magnitude = Math.abs(delta);

    const variance = relevant.length > 1
      ? relevant.reduce((s, sig) => s + (sig.value - avg) ** 2, 0) / relevant.length
      : 1;
    const confidence = Math.min(0.98, Math.max(0.1,
      (relevant.length / 30) * (1 / (1 + Math.sqrt(variance)))
    ));

    const prediction: OraclePrediction = {
      id: `orc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      horizon: horizonMs,
      direction,
      magnitude,
      confidence,
      signals: relevant.length,
      generatedAt: new Date().toISOString(),
    };

    if (predictions.length >= MAX_PREDICTIONS) predictions.shift();
    predictions.push(prediction);
    return prediction;
  }

  function recordOutcome(predictionId: string, correct: boolean): void {
    outcomes.push({ predictionId, correct });
    if (outcomes.length > MAX_PREDICTIONS) outcomes.shift();
  }

  function detectAnomaly(source: string, thresholdSigma: number = 2): boolean {
    const sourceSignals = signals.filter(s => s.source === source);
    if (sourceSignals.length < 10) return false;
    const values = sourceSignals.map(s => s.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
    const latest = values[values.length - 1];
    return Math.abs(latest - mean) > thresholdSigma * std;
  }

  function getStats(): OracleStats {
    const sources = [...new Set(signals.map(s => s.source))];
    const accuracy = outcomes.length > 0
      ? outcomes.filter(o => o.correct).length / outcomes.length
      : 0;
    return {
      totalSignals: signals.length,
      totalPredictions: predictions.length,
      avgConfidence: predictions.length > 0
        ? predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length
        : 0,
      accuracy,
      sources,
    };
  }

  function reset(): void {
    signals = [];
    predictions = [];
    outcomes = [];
  }

  return { ingestSignal, ingestBatch, predict, recordOutcome, detectAnomaly, getStats, reset };
}
