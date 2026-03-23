/**
 * ENCODE SHADOW Verdict Analyzer — v1.0.0
 * Post-execution analysis of SHADOW A/B test outcomes.
 * Builds a learning corpus of which strategy (Conservative vs Aggressive)
 * wins per pattern type.
 * 
 * Weighted composite scoring:
 *   Quality    40%
 *   Divergence 25%
 *   Latency    15%
 *   Error Rate 10%
 *   Resource   10%
 */

// ═══ Types ════════════════════════════════════════════════════════

export type Strategy = 'conservative' | 'aggressive';

export interface ShadowOutcome {
  id: string;
  patternType: string;
  surface: string;

  conservative: StrategyMetrics;
  aggressive: StrategyMetrics;

  winner: Strategy;
  margin: number; // how much the winner won by
  confidence: number;
  decidedAt: string;
}

export interface StrategyMetrics {
  qualityScore: number;    // 0-100
  divergenceScore: number; // 0-100 (how different from baseline)
  latencyMs: number;
  errorRate: number;       // 0-1
  resourceCost: number;    // relative cost units
  compositeScore: number;  // weighted total
}

export interface PatternVerdicts {
  patternType: string;
  totalTests: number;
  conservativeWins: number;
  aggressiveWins: number;
  preferredStrategy: Strategy;
  confidence: number;
  avgMargin: number;
}

export interface VerdictSummary {
  totalOutcomes: number;
  conservativeWinRate: number;
  aggressiveWinRate: number;
  byPattern: PatternVerdicts[];
  bySurface: Record<string, { conservative: number; aggressive: number }>;
  strongPreferences: PatternVerdicts[]; // confidence > 0.7
}

// ═══ Weights ══════════════════════════════════════════════════════

const WEIGHTS = {
  quality: 0.40,
  divergence: 0.25,
  latency: 0.15,
  errorRate: 0.10,
  resource: 0.10,
};

// ═══ State ═════════════════════════════════════════════════════════

const outcomes: ShadowOutcome[] = [];
const MAX_OUTCOMES = 300;
let outcomeCounter = 0;

// ═══ Composite Scoring ════════════════════════════════════════════

function calculateComposite(metrics: Omit<StrategyMetrics, 'compositeScore'>): number {
  // Normalize latency (lower is better, cap at 5000ms)
  const latencyNorm = Math.max(0, 100 - (metrics.latencyMs / 50));

  // Normalize error rate (lower is better)
  const errorNorm = (1 - metrics.errorRate) * 100;

  // Normalize resource cost (lower is better, cap at 100)
  const resourceNorm = Math.max(0, 100 - metrics.resourceCost);

  return Math.round(
    metrics.qualityScore * WEIGHTS.quality +
    metrics.divergenceScore * WEIGHTS.divergence +
    latencyNorm * WEIGHTS.latency +
    errorNorm * WEIGHTS.errorRate +
    resourceNorm * WEIGHTS.resource,
  );
}

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Record a SHADOW A/B test outcome
 */
export function recordShadowOutcome(
  patternType: string,
  surface: string,
  conservative: Omit<StrategyMetrics, 'compositeScore'>,
  aggressive: Omit<StrategyMetrics, 'compositeScore'>,
): ShadowOutcome {
  const consComposite = calculateComposite(conservative);
  const aggrComposite = calculateComposite(aggressive);

  const consMetrics: StrategyMetrics = { ...conservative, compositeScore: consComposite };
  const aggrMetrics: StrategyMetrics = { ...aggressive, compositeScore: aggrComposite };

  const winner: Strategy = consComposite >= aggrComposite ? 'conservative' : 'aggressive';
  const margin = Math.abs(consComposite - aggrComposite);

  const outcome: ShadowOutcome = {
    id: `shadow_${++outcomeCounter}`,
    patternType,
    surface,
    conservative: consMetrics,
    aggressive: aggrMetrics,
    winner,
    margin,
    confidence: Math.min(1, margin / 30), // 30-point margin = full confidence
    decidedAt: new Date().toISOString(),
  };

  outcomes.push(outcome);
  if (outcomes.length > MAX_OUTCOMES) outcomes.shift();

  return outcome;
}

/**
 * Get verdicts aggregated by pattern type
 */
export function getPatternVerdicts(): PatternVerdicts[] {
  const byPattern = new Map<string, ShadowOutcome[]>();

  for (const o of outcomes) {
    const list = byPattern.get(o.patternType) || [];
    list.push(o);
    byPattern.set(o.patternType, list);
  }

  return [...byPattern.entries()].map(([patternType, outs]) => {
    const consWins = outs.filter(o => o.winner === 'conservative').length;
    const aggrWins = outs.filter(o => o.winner === 'aggressive').length;
    const total = outs.length;

    const preferredStrategy: Strategy = consWins >= aggrWins ? 'conservative' : 'aggressive';
    const winRate = Math.max(consWins, aggrWins) / total;
    const avgMargin = outs.reduce((s, o) => s + o.margin, 0) / total;

    return {
      patternType,
      totalTests: total,
      conservativeWins: consWins,
      aggressiveWins: aggrWins,
      preferredStrategy,
      confidence: Math.round(winRate * 100) / 100,
      avgMargin: Math.round(avgMargin * 10) / 10,
    };
  }).sort((a, b) => b.totalTests - a.totalTests);
}

/**
 * Get recommended strategy for a pattern type
 */
export function getRecommendedStrategy(patternType: string): {
  strategy: Strategy;
  confidence: number;
  basedOn: number;
} {
  const verdicts = getPatternVerdicts();
  const match = verdicts.find(v => v.patternType === patternType);

  if (!match || match.totalTests < 3) {
    return { strategy: 'conservative', confidence: 0.5, basedOn: match?.totalTests || 0 };
  }

  return {
    strategy: match.preferredStrategy,
    confidence: match.confidence,
    basedOn: match.totalTests,
  };
}

/**
 * Get full verdict summary
 */
export function getVerdictSummary(): VerdictSummary {
  const total = outcomes.length;
  const consWins = outcomes.filter(o => o.winner === 'conservative').length;
  const aggrWins = outcomes.filter(o => o.winner === 'aggressive').length;

  const byPattern = getPatternVerdicts();

  // By surface
  const bySurface: Record<string, { conservative: number; aggressive: number }> = {};
  for (const o of outcomes) {
    if (!bySurface[o.surface]) bySurface[o.surface] = { conservative: 0, aggressive: 0 };
    bySurface[o.surface][o.winner]++;
  }

  return {
    totalOutcomes: total,
    conservativeWinRate: total > 0 ? Math.round((consWins / total) * 100) / 100 : 0,
    aggressiveWinRate: total > 0 ? Math.round((aggrWins / total) * 100) / 100 : 0,
    byPattern,
    bySurface,
    strongPreferences: byPattern.filter(v => v.confidence > 0.7),
  };
}

/**
 * Get recent outcomes
 */
export function getRecentOutcomes(limit: number = 20): ShadowOutcome[] {
  return outcomes.slice(-limit).reverse();
}
