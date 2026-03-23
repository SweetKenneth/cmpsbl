/**
 * MEDIC — Predictive Degradation Model
 * Time-series anomaly detection using Z-score and EMA trend analysis.
 * Predicts failures 30–60 minutes before they occur.
 * @module medic/predictiveDegradationModel
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface HealthSample {
  nodeId: string;
  score: number;     // 0–100
  timestamp: number;
}

export interface DegradationPrediction {
  nodeId: string;
  currentScore: number;
  emaScore: number;
  trend: 'improving' | 'stable' | 'declining' | 'critical_decline';
  zScore: number;
  predictedFailureMinutes: number | null; // null = no predicted failure
  healingTicket: boolean;
  confidence: number; // 0–1
}

interface NodeModel {
  samples: number[];
  ema: number;
  sum: number;
  sumSq: number;
  count: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const EMA_ALPHA = 0.2;
const MAX_SAMPLES = 120;
const ANOMALY_Z_THRESHOLD = -2.0;    // negative Z = declining
const FAILURE_SCORE_THRESHOLD = 30;
const TICKET_LEAD_TIME_MIN = 60;

// ── State ──────────────────────────────────────────────────────────────────

const models = new Map<string, NodeModel>();

// ── Core ───────────────────────────────────────────────────────────────────

function getModel(nodeId: string): NodeModel {
  if (!models.has(nodeId)) {
    models.set(nodeId, { samples: [], ema: 100, sum: 0, sumSq: 0, count: 0 });
  }
  return models.get(nodeId)!;
}

export function ingestHealth(sample: HealthSample): DegradationPrediction {
  const model = getModel(sample.nodeId);

  model.samples.push(sample.score);
  if (model.samples.length > MAX_SAMPLES) model.samples.shift();

  model.sum += sample.score;
  model.sumSq += sample.score * sample.score;
  model.count++;
  model.ema = EMA_ALPHA * sample.score + (1 - EMA_ALPHA) * model.ema;

  const mean = model.sum / model.count;
  const variance = (model.sumSq / model.count) - mean * mean;
  const std = Math.sqrt(Math.max(0, variance)) || 1;
  const zScore = (sample.score - mean) / std;

  // Trend detection from recent samples
  let trend: DegradationPrediction['trend'] = 'stable';
  if (model.samples.length >= 5) {
    const recent5 = model.samples.slice(-5);
    const older5 = model.samples.slice(-10, -5);
    if (older5.length >= 3) {
      const recentAvg = recent5.reduce((a, b) => a + b, 0) / recent5.length;
      const olderAvg = older5.reduce((a, b) => a + b, 0) / older5.length;
      const diff = recentAvg - olderAvg;
      if (diff < -15) trend = 'critical_decline';
      else if (diff < -5) trend = 'declining';
      else if (diff > 5) trend = 'improving';
    }
  }

  // Predict time to failure
  let predictedFailureMinutes: number | null = null;
  if (trend === 'declining' || trend === 'critical_decline') {
    const recent = model.samples.slice(-10);
    if (recent.length >= 3) {
      const declinePerSample = (recent[0] - recent[recent.length - 1]) / recent.length;
      if (declinePerSample > 0) {
        const samplesToFailure = (model.ema - FAILURE_SCORE_THRESHOLD) / declinePerSample;
        // Assume ~1 sample per minute
        predictedFailureMinutes = Math.max(0, Math.round(samplesToFailure));
      }
    }
  }

  const healingTicket = predictedFailureMinutes !== null && predictedFailureMinutes <= TICKET_LEAD_TIME_MIN;
  const confidence = Math.min(1, model.count / 30);

  return {
    nodeId: sample.nodeId,
    currentScore: sample.score,
    emaScore: Math.round(model.ema * 100) / 100,
    trend,
    zScore: Math.round(zScore * 100) / 100,
    predictedFailureMinutes,
    healingTicket,
    confidence: Math.round(confidence * 100) / 100,
  };
}

export function getPredictions(): DegradationPrediction[] {
  return Array.from(models.entries()).map(([nodeId, model]) => {
    const score = model.samples[model.samples.length - 1] ?? 100;
    return ingestHealth({ nodeId, score, timestamp: Date.now() });
  });
}

export function resetModel(nodeId?: string): void {
  if (nodeId) models.delete(nodeId);
  else models.clear();
}
