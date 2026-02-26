/**
 * Evolution Mesh — Repair Strategy Effectiveness Tracking
 * Measures which repair strategies work best for which archetypes and contexts.
 * Informs strategy selection and priority ordering.
 */

export interface StrategyRecord {
  strategy: string;
  archetype: string;
  executorId: string;
  success: boolean;
  durationMs: number;
  timestamp: number;
}

export interface StrategyEffectiveness {
  strategy: string;
  totalAttempts: number;
  successes: number;
  failures: number;
  successRate: number;
  avgDurationMs: number;
  byArchetype: Record<string, { attempts: number; successes: number; rate: number }>;
  trend: 'improving' | 'stable' | 'declining';
}

const strategyRecords: StrategyRecord[] = [];
const MAX_RECORDS = 20_000;

/**
 * Record a repair strategy outcome.
 */
export function recordStrategyOutcome(
  strategy: string,
  archetype: string,
  executorId: string,
  success: boolean,
  durationMs: number,
): void {
  strategyRecords.push({ strategy, archetype, executorId, success, durationMs, timestamp: Date.now() });
  if (strategyRecords.length > MAX_RECORDS) strategyRecords.splice(0, strategyRecords.length - MAX_RECORDS);
}

/**
 * Get effectiveness report for a specific strategy.
 */
export function getStrategyEffectiveness(strategy: string): StrategyEffectiveness {
  const records = strategyRecords.filter(r => r.strategy === strategy);
  const successes = records.filter(r => r.success);

  const byArchetype: Record<string, { attempts: number; successes: number; rate: number }> = {};
  for (const r of records) {
    if (!byArchetype[r.archetype]) byArchetype[r.archetype] = { attempts: 0, successes: 0, rate: 0 };
    byArchetype[r.archetype].attempts++;
    if (r.success) byArchetype[r.archetype].successes++;
  }
  for (const arch of Object.values(byArchetype)) {
    arch.rate = arch.attempts > 0 ? arch.successes / arch.attempts : 0;
  }

  // Trend: compare first half vs second half
  const half = Math.floor(records.length / 2);
  const firstRate = half > 0 ? records.slice(0, half).filter(r => r.success).length / half : 0;
  const secondRate = half > 0 ? records.slice(half).filter(r => r.success).length / (records.length - half) : 0;
  let trend: StrategyEffectiveness['trend'] = 'stable';
  if (secondRate > firstRate + 0.05) trend = 'improving';
  else if (secondRate < firstRate - 0.05) trend = 'declining';

  return {
    strategy,
    totalAttempts: records.length,
    successes: successes.length,
    failures: records.length - successes.length,
    successRate: records.length > 0 ? successes.length / records.length : 0,
    avgDurationMs: records.length > 0
      ? Math.round(records.reduce((s, r) => s + r.durationMs, 0) / records.length)
      : 0,
    byArchetype,
    trend,
  };
}

/**
 * Get ranked list of all strategies by effectiveness.
 */
export function getRankedStrategies(): StrategyEffectiveness[] {
  const strategyNames = [...new Set(strategyRecords.map(r => r.strategy))];
  return strategyNames
    .map(s => getStrategyEffectiveness(s))
    .sort((a, b) => b.successRate - a.successRate);
}

/**
 * Get the best strategy for a given archetype.
 */
export function getBestStrategyForArchetype(archetype: string): {
  strategy: string;
  successRate: number;
} | null {
  const records = strategyRecords.filter(r => r.archetype === archetype);
  if (records.length === 0) return null;

  const byStrategy = new Map<string, { successes: number; total: number }>();
  for (const r of records) {
    const existing = byStrategy.get(r.strategy) ?? { successes: 0, total: 0 };
    existing.total++;
    if (r.success) existing.successes++;
    byStrategy.set(r.strategy, existing);
  }

  let best: { strategy: string; successRate: number } | null = null;
  for (const [strategy, data] of byStrategy.entries()) {
    const rate = data.total > 0 ? data.successes / data.total : 0;
    if (!best || rate > best.successRate) {
      best = { strategy, successRate: rate };
    }
  }

  return best;
}

// ── #23 Strategy Sequence Analysis ──

export interface StrategySequence {
  sequence: string[];
  occurrences: number;
  successRate: number;
  avgTotalDurationMs: number;
}

/**
 * Analyze the order in which strategies are attempted and which sequences yield highest success.
 * Enables reordering strategy chains based on historical effectiveness.
 */
export function analyzeStrategySequences(archetype?: string): StrategySequence[] {
  // Group records by executor + close timestamps (within 30s = same repair attempt)
  const groups: StrategyRecord[][] = [];
  const sorted = [...strategyRecords]
    .filter(r => !archetype || r.archetype === archetype)
    .sort((a, b) => a.timestamp - b.timestamp);

  let currentGroup: StrategyRecord[] = [];
  for (const record of sorted) {
    if (currentGroup.length === 0 || (
      record.executorId === currentGroup[0].executorId &&
      record.timestamp - currentGroup[currentGroup.length - 1].timestamp < 30_000
    )) {
      currentGroup.push(record);
    } else {
      if (currentGroup.length >= 2) groups.push(currentGroup);
      currentGroup = [record];
    }
  }
  if (currentGroup.length >= 2) groups.push(currentGroup);

  // Extract sequences
  const seqMap = new Map<string, { count: number; successes: number; totalDuration: number }>();
  for (const group of groups) {
    const seq = group.map(r => r.strategy);
    const key = seq.join(' → ');
    const data = seqMap.get(key) ?? { count: 0, successes: 0, totalDuration: 0 };
    data.count++;
    if (group.some(r => r.success)) data.successes++;
    data.totalDuration += group.reduce((s, r) => s + r.durationMs, 0);
    seqMap.set(key, data);
  }

  const results: StrategySequence[] = [];
  for (const [key, data] of seqMap.entries()) {
    if (data.count < 2) continue;
    results.push({
      sequence: key.split(' → '),
      occurrences: data.count,
      successRate: Math.round((data.successes / data.count) * 1000) / 1000,
      avgTotalDurationMs: Math.round(data.totalDuration / data.count),
    });
  }

  return results.sort((a, b) => b.successRate - a.successRate);
}

/**
 * Get the optimal strategy ordering for a given archetype based on historical sequences.
 */
export function getOptimalStrategyOrder(archetype: string): string[] {
  const sequences = analyzeStrategySequences(archetype);
  if (sequences.length === 0) return [];

  // Weight by success rate * occurrences
  const strategyScores = new Map<string, { totalScore: number; totalWeight: number; avgPosition: number; posCount: number }>();

  for (const seq of sequences) {
    const weight = seq.successRate * seq.occurrences;
    for (let i = 0; i < seq.sequence.length; i++) {
      const s = seq.sequence[i];
      const data = strategyScores.get(s) ?? { totalScore: 0, totalWeight: 0, avgPosition: 0, posCount: 0 };
      data.totalScore += seq.successRate * weight;
      data.totalWeight += weight;
      data.avgPosition += i * weight;
      data.posCount += weight;
      strategyScores.set(s, data);
    }
  }

  return Array.from(strategyScores.entries())
    .map(([strategy, data]) => ({
      strategy,
      score: data.totalWeight > 0 ? data.totalScore / data.totalWeight : 0,
      avgPos: data.posCount > 0 ? data.avgPosition / data.posCount : Infinity,
    }))
    .sort((a, b) => b.score - a.score || a.avgPos - b.avgPos)
    .map(s => s.strategy);
}

// ── #24 Diminishing Returns Detection ──

export interface DiminishingReturnsReport {
  strategy: string;
  /** Success rate in first N uses */
  initialRate: number;
  /** Success rate in most recent N uses */
  recentRate: number;
  /** Absolute drop */
  dropMagnitude: number;
  /** Whether this strategy shows diminishing returns */
  diminishing: boolean;
  /** Suggested action */
  recommendation: string;
  sampleSize: number;
}

/**
 * Detect strategies that are losing effectiveness over time (diminishing returns).
 * Helps identify when a strategy should be deprioritized or retired.
 */
export function detectDiminishingReturns(minSamples: number = 10): DiminishingReturnsReport[] {
  const strategyNames = [...new Set(strategyRecords.map(r => r.strategy))];
  const results: DiminishingReturnsReport[] = [];

  for (const strategy of strategyNames) {
    const records = strategyRecords
      .filter(r => r.strategy === strategy)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (records.length < minSamples * 2) continue;

    const third = Math.floor(records.length / 3);
    const firstThird = records.slice(0, third);
    const lastThird = records.slice(-third);

    const initialRate = firstThird.filter(r => r.success).length / firstThird.length;
    const recentRate = lastThird.filter(r => r.success).length / lastThird.length;
    const dropMagnitude = Math.round((initialRate - recentRate) * 1000) / 1000;
    const diminishing = dropMagnitude >= 0.10;

    let recommendation = 'Strategy performance is stable.';
    if (dropMagnitude >= 0.25) recommendation = `Critical degradation (${Math.round(dropMagnitude * 100)}% drop). Consider retiring or completely reworking this strategy.`;
    else if (dropMagnitude >= 0.15) recommendation = `Significant diminishing returns (${Math.round(dropMagnitude * 100)}% drop). Deprioritize and investigate root cause.`;
    else if (diminishing) recommendation = `Mild diminishing returns (${Math.round(dropMagnitude * 100)}% drop). Monitor closely.`;

    results.push({
      strategy,
      initialRate: Math.round(initialRate * 1000) / 1000,
      recentRate: Math.round(recentRate * 1000) / 1000,
      dropMagnitude,
      diminishing,
      recommendation,
      sampleSize: records.length,
    });
  }

  return results.sort((a, b) => b.dropMagnitude - a.dropMagnitude);
}
