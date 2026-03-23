/**
 * ORACLE Ultimate #5 — Prophecy Journal (Prediction Ledger)
 * Immutable log of every prediction with outcome tracking
 * and Brier score calibration.
 */

// ── Types ──

export interface Prophecy {
  id: string;
  category: string;
  prediction: string;
  confidence: number;        // 0-1
  predictedAt: number;
  expiresAt: number;
  outcome: 'correct' | 'incorrect' | 'partial' | 'pending' | 'expired';
  actualValue?: number;
  brierScore?: number;       // 0 = perfect, 1 = worst
  resolvedAt: number | null;
  sourceModel: string;
  metadata?: Record<string, unknown>;
}

export interface CalibrationBucket {
  confidenceRange: string;   // e.g., "70-80%"
  predicted: number;         // Expected success rate
  actual: number;            // Actual success rate
  count: number;
  calibrationError: number;  // |predicted - actual|
}

export interface CalibrationReport {
  totalPredictions: number;
  resolvedPredictions: number;
  overallBrierScore: number;
  buckets: CalibrationBucket[];
  bestCategory: string | null;
  worstCategory: string | null;
  generatedAt: number;
}

// ── State ──

const journal: Prophecy[] = [];
const MAX_JOURNAL = 5000;
let idCounter = 0;

// ── Core ──

export function recordProphecy(input: {
  category: string;
  prediction: string;
  confidence: number;
  sourceModel: string;
  ttlMs?: number;
  metadata?: Record<string, unknown>;
}): Prophecy {
  const prophecy: Prophecy = {
    id: `proph-${++idCounter}-${Date.now().toString(36)}`,
    category: input.category,
    prediction: input.prediction,
    confidence: Math.max(0, Math.min(1, input.confidence)),
    predictedAt: Date.now(),
    expiresAt: Date.now() + (input.ttlMs ?? 3600_000), // Default 1hr
    outcome: 'pending',
    resolvedAt: null,
    sourceModel: input.sourceModel,
    metadata: input.metadata,
  };

  journal.push(prophecy);

  // Trim to max
  if (journal.length > MAX_JOURNAL) {
    journal.splice(0, journal.length - MAX_JOURNAL);
  }

  return prophecy;
}

export function resolveProphecy(id: string, outcome: 'correct' | 'incorrect' | 'partial', actualValue?: number): boolean {
  const prophecy = journal.find(p => p.id === id);
  if (!prophecy || prophecy.outcome !== 'pending') return false;

  prophecy.outcome = outcome;
  prophecy.actualValue = actualValue;
  prophecy.resolvedAt = Date.now();

  // Brier score: (confidence - actual)^2 where actual is 1 for correct, 0 for incorrect
  const actualBinary = outcome === 'correct' ? 1 : outcome === 'partial' ? 0.5 : 0;
  prophecy.brierScore = Math.round(((prophecy.confidence - actualBinary) ** 2) * 10000) / 10000;

  return true;
}

/** Expire pending prophecies past their TTL. */
export function expireProphecies(): number {
  const now = Date.now();
  let count = 0;
  for (const p of journal) {
    if (p.outcome === 'pending' && p.expiresAt < now) {
      p.outcome = 'expired';
      count++;
    }
  }
  return count;
}

/** Generate calibration report — "When ORACLE says 80%, is it right 80% of the time?" */
export function getCalibrationReport(): CalibrationReport {
  const resolved = journal.filter(p => p.outcome !== 'pending' && p.outcome !== 'expired');
  const bucketRanges = [
    { label: '0-10%', low: 0, high: 0.1 },
    { label: '10-20%', low: 0.1, high: 0.2 },
    { label: '20-30%', low: 0.2, high: 0.3 },
    { label: '30-40%', low: 0.3, high: 0.4 },
    { label: '40-50%', low: 0.4, high: 0.5 },
    { label: '50-60%', low: 0.5, high: 0.6 },
    { label: '60-70%', low: 0.6, high: 0.7 },
    { label: '70-80%', low: 0.7, high: 0.8 },
    { label: '80-90%', low: 0.8, high: 0.9 },
    { label: '90-100%', low: 0.9, high: 1.01 },
  ];

  const buckets: CalibrationBucket[] = bucketRanges.map(range => {
    const inBucket = resolved.filter(p => p.confidence >= range.low && p.confidence < range.high);
    const correctCount = inBucket.filter(p => p.outcome === 'correct').length;
    const partialCount = inBucket.filter(p => p.outcome === 'partial').length;
    const actual = inBucket.length > 0 ? (correctCount + partialCount * 0.5) / inBucket.length : 0;
    const predicted = (range.low + range.high) / 2;
    return {
      confidenceRange: range.label,
      predicted: Math.round(predicted * 100) / 100,
      actual: Math.round(actual * 100) / 100,
      count: inBucket.length,
      calibrationError: Math.round(Math.abs(predicted - actual) * 1000) / 1000,
    };
  });

  // Category-level accuracy
  const categories = new Map<string, { correct: number; total: number }>();
  for (const p of resolved) {
    const cat = categories.get(p.category) ?? { correct: 0, total: 0 };
    cat.total++;
    if (p.outcome === 'correct') cat.correct++;
    categories.set(p.category, cat);
  }

  let bestCategory: string | null = null;
  let worstCategory: string | null = null;
  let bestRate = -1, worstRate = 2;
  for (const [cat, stats] of categories) {
    if (stats.total < 3) continue;
    const rate = stats.correct / stats.total;
    if (rate > bestRate) { bestRate = rate; bestCategory = cat; }
    if (rate < worstRate) { worstRate = rate; worstCategory = cat; }
  }

  const brierScores = resolved.filter(p => p.brierScore !== undefined).map(p => p.brierScore!);
  const overallBrier = brierScores.length > 0
    ? Math.round((brierScores.reduce((s, v) => s + v, 0) / brierScores.length) * 10000) / 10000
    : 0;

  return {
    totalPredictions: journal.length,
    resolvedPredictions: resolved.length,
    overallBrierScore: overallBrier,
    buckets,
    bestCategory,
    worstCategory,
    generatedAt: Date.now(),
  };
}

export function getRecentProphecies(n: number = 50): Prophecy[] {
  return journal.slice(-n);
}

export function getJournalStats(): { total: number; pending: number; correct: number; incorrect: number; expired: number; brierScore: number } {
  const pending = journal.filter(p => p.outcome === 'pending').length;
  const correct = journal.filter(p => p.outcome === 'correct').length;
  const incorrect = journal.filter(p => p.outcome === 'incorrect').length;
  const expired = journal.filter(p => p.outcome === 'expired').length;
  const brierScores = journal.filter(p => p.brierScore !== undefined).map(p => p.brierScore!);
  const brierScore = brierScores.length > 0 ? brierScores.reduce((s, v) => s + v, 0) / brierScores.length : 0;
  return { total: journal.length, pending, correct, incorrect, expired, brierScore: Math.round(brierScore * 10000) / 10000 };
}

export function resetJournalState(): void {
  journal.length = 0;
  idCounter = 0;
}
