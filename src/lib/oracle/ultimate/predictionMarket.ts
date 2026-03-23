/**
 * ORACLE Ultimate #10 — Prediction Market (Internal)
 * Competing prediction models that bid on outcomes.
 * Models earn/lose credibility based on accuracy.
 * Ensemble predictions weighted by model track record.
 */

// ── Types ──

export interface PredictionModel {
  id: string;
  name: string;
  category: string;
  credibility: number;       // 0-1, EMA-adjusted
  totalPredictions: number;
  correctPredictions: number;
  avgConfidence: number;
  lastUsedAt: number;
  retired: boolean;
  retirementReason?: string;
}

export interface MarketBid {
  id: string;
  questionId: string;
  modelId: string;
  prediction: number;        // Predicted value or probability
  confidence: number;
  bidAt: number;
}

export interface MarketQuestion {
  id: string;
  question: string;
  category: string;
  bids: MarketBid[];
  ensemblePrediction: number | null;
  actualOutcome: number | null;
  resolved: boolean;
  createdAt: number;
  resolvedAt: number | null;
}

// ── State ──

const models = new Map<string, PredictionModel>();
const questions = new Map<string, MarketQuestion>();
const EMA_ALPHA = 0.2;
const RETIREMENT_THRESHOLD = 0.2;
let bidCounter = 0;
let questionCounter = 0;

// ── Core ──

export function registerModel(id: string, name: string, category: string): PredictionModel {
  const model: PredictionModel = {
    id, name, category, credibility: 0.5,
    totalPredictions: 0, correctPredictions: 0,
    avgConfidence: 0, lastUsedAt: Date.now(), retired: false,
  };
  models.set(id, model);
  return model;
}

export function createQuestion(question: string, category: string): MarketQuestion {
  const q: MarketQuestion = {
    id: `mq-${++questionCounter}`,
    question, category, bids: [],
    ensemblePrediction: null, actualOutcome: null,
    resolved: false, createdAt: Date.now(), resolvedAt: null,
  };
  questions.set(q.id, q);
  return q;
}

export function submitBid(questionId: string, modelId: string, prediction: number, confidence: number): MarketBid | null {
  const q = questions.get(questionId);
  const m = models.get(modelId);
  if (!q || !m || q.resolved || m.retired) return null;

  const bid: MarketBid = {
    id: `bid-${++bidCounter}`,
    questionId, modelId, prediction,
    confidence: Math.max(0, Math.min(1, confidence)),
    bidAt: Date.now(),
  };
  q.bids.push(bid);
  m.lastUsedAt = Date.now();
  m.totalPredictions++;

  // Recalculate ensemble (credibility-weighted average)
  const activeBids = q.bids.filter(b => {
    const model = models.get(b.modelId);
    return model && !model.retired;
  });
  if (activeBids.length > 0) {
    let weightedSum = 0, totalWeight = 0;
    for (const b of activeBids) {
      const model = models.get(b.modelId)!;
      const weight = model.credibility * b.confidence;
      weightedSum += b.prediction * weight;
      totalWeight += weight;
    }
    q.ensemblePrediction = totalWeight > 0
      ? Math.round((weightedSum / totalWeight) * 10000) / 10000
      : null;
  }

  return bid;
}

export function resolveQuestion(questionId: string, actualOutcome: number, tolerance: number = 0.1): void {
  const q = questions.get(questionId);
  if (!q || q.resolved) return;

  q.actualOutcome = actualOutcome;
  q.resolved = true;
  q.resolvedAt = Date.now();

  // Update model credibility based on accuracy
  for (const bid of q.bids) {
    const model = models.get(bid.modelId);
    if (!model) continue;

    const error = Math.abs(bid.prediction - actualOutcome);
    const isCorrect = error <= tolerance;
    if (isCorrect) model.correctPredictions++;

    // EMA update credibility
    const accuracy = isCorrect ? 1 : Math.max(0, 1 - error);
    model.credibility = EMA_ALPHA * accuracy + (1 - EMA_ALPHA) * model.credibility;
    model.credibility = Math.round(model.credibility * 1000) / 1000;

    // Confidence tracking
    model.avgConfidence = EMA_ALPHA * bid.confidence + (1 - EMA_ALPHA) * model.avgConfidence;

    // Auto-retire low-credibility models
    if (model.totalPredictions >= 10 && model.credibility < RETIREMENT_THRESHOLD) {
      model.retired = true;
      model.retirementReason = `Credibility dropped to ${model.credibility} after ${model.totalPredictions} predictions`;
    }
  }
}

export function getModelLeaderboard(): PredictionModel[] {
  return Array.from(models.values())
    .filter(m => !m.retired)
    .sort((a, b) => b.credibility - a.credibility);
}

export function getMarketStats(): {
  totalModels: number; activeModels: number; retiredModels: number;
  totalQuestions: number; resolvedQuestions: number;
  avgCredibility: number;
} {
  const all = Array.from(models.values());
  const active = all.filter(m => !m.retired);
  return {
    totalModels: all.length,
    activeModels: active.length,
    retiredModels: all.length - active.length,
    totalQuestions: questions.size,
    resolvedQuestions: Array.from(questions.values()).filter(q => q.resolved).length,
    avgCredibility: active.length > 0
      ? Math.round((active.reduce((s, m) => s + m.credibility, 0) / active.length) * 1000) / 1000
      : 0,
  };
}

export function resetMarketState(): void {
  models.clear();
  questions.clear();
  bidCounter = 0;
  questionCounter = 0;
}
