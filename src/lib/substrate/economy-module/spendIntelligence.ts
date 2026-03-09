/**
 * ECONOMY Spend Intelligence — v1.0.0
 * Advanced cost analytics, anomaly detection, and optimization recommendations
 * 
 * Provides:
 * - Spend pattern analysis (hourly, daily, weekly seasonality)
 * - Cost optimization recommendations
 * - Budget simulation ("what-if" scenarios)
 * - Cross-module cost correlation
 */

import { emit } from '../events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SpendPattern {
  module: string;
  hourlyDistribution: number[]; // 24 hours
  weekdayDistribution: number[]; // 7 days (0=Sun)
  peakHour: number;
  quietHour: number;
  peakDay: number;
  burstiness: number; // 0-1 (0=uniform, 1=bursty)
}

export interface OptimizationRecommendation {
  id: string;
  module: string;
  type: 'model_downgrade' | 'batch_optimization' | 'cache_opportunity' | 'schedule_shift' | 'budget_rebalance';
  description: string;
  estimatedSavingsPct: number;
  estimatedSavingsMillicents: number;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  createdAt: string;
}

export interface BudgetSimulation {
  scenario: string;
  currentSpend: number;
  projectedSpend: number;
  delta: number;
  deltaPct: number;
  feasible: boolean;
  risks: string[];
}

export interface CostCorrelation {
  moduleA: string;
  moduleB: string;
  correlation: number; // -1 to 1
  relationship: 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

// Hourly cost samples per module
const hourlySamples = new Map<string, Array<{ hour: number; day: number; amount: number; ts: number }>>();
const MAX_SAMPLES = 5000;

// Optimization recommendations
const recommendations: OptimizationRecommendation[] = [];
const MAX_RECOMMENDATIONS = 100;

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a cost sample for pattern analysis
 */
export function recordSpendSample(module: string, amountMillicents: number): void {
  const now = new Date();
  const samples = hourlySamples.get(module) || [];

  samples.push({
    hour: now.getHours(),
    day: now.getDay(),
    amount: amountMillicents,
    ts: Date.now(),
  });

  // Trim old samples
  if (samples.length > MAX_SAMPLES) {
    samples.splice(0, samples.length - MAX_SAMPLES);
  }

  hourlySamples.set(module, samples);
}

/**
 * Analyze spending patterns for a module
 */
export function analyzeSpendPattern(module: string): SpendPattern {
  const samples = hourlySamples.get(module) || [];

  const hourlyDist = new Array(24).fill(0);
  const weekdayDist = new Array(7).fill(0);

  for (const s of samples) {
    hourlyDist[s.hour] += s.amount;
    weekdayDist[s.day] += s.amount;
  }

  // Normalize
  const hourlyTotal = hourlyDist.reduce((a, b) => a + b, 0) || 1;
  const weekdayTotal = weekdayDist.reduce((a, b) => a + b, 0) || 1;
  const normalizedHourly = hourlyDist.map(v => Math.round((v / hourlyTotal) * 100) / 100);
  const normalizedWeekday = weekdayDist.map(v => Math.round((v / weekdayTotal) * 100) / 100);

  const peakHour = hourlyDist.indexOf(Math.max(...hourlyDist));
  const quietHour = hourlyDist.indexOf(Math.min(...hourlyDist));
  const peakDay = weekdayDist.indexOf(Math.max(...weekdayDist));

  // Calculate burstiness (coefficient of variation)
  const mean = hourlyTotal / 24;
  const variance = hourlyDist.reduce((s, v) => s + (v - mean) ** 2, 0) / 24;
  const stdDev = Math.sqrt(variance);
  const burstiness = mean > 0 ? Math.min(1, stdDev / mean) : 0;

  return {
    module,
    hourlyDistribution: normalizedHourly,
    weekdayDistribution: normalizedWeekday,
    peakHour,
    quietHour,
    peakDay,
    burstiness: Math.round(burstiness * 100) / 100,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIMIZATION RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate optimization recommendations based on spending patterns
 */
export function generateRecommendations(
  module: string,
  currentSpendMillicents: number,
  tokenCount: number,
  operationCount: number
): OptimizationRecommendation[] {
  const newRecs: OptimizationRecommendation[] = [];
  const pattern = analyzeSpendPattern(module);

  // 1. Schedule shifting for bursty modules
  if (pattern.burstiness > 0.6) {
    newRecs.push({
      id: `rec-${Date.now()}-schedule`,
      module,
      type: 'schedule_shift',
      description: `Spread ${module} workload more evenly — peak at hour ${pattern.peakHour}, quiet at hour ${pattern.quietHour}`,
      estimatedSavingsPct: 10,
      estimatedSavingsMillicents: Math.round(currentSpendMillicents * 0.1),
      effort: 'medium',
      confidence: 70,
      createdAt: new Date().toISOString(),
    });
  }

  // 2. Model downgrade for high-token operations
  if (tokenCount > 100000 && currentSpendMillicents > 50000) {
    newRecs.push({
      id: `rec-${Date.now()}-model`,
      module,
      type: 'model_downgrade',
      description: `Consider using lighter models for routine ${module} operations to reduce token costs`,
      estimatedSavingsPct: 25,
      estimatedSavingsMillicents: Math.round(currentSpendMillicents * 0.25),
      effort: 'low',
      confidence: 65,
      createdAt: new Date().toISOString(),
    });
  }

  // 3. Batch optimization for high-frequency operations
  if (operationCount > 500) {
    newRecs.push({
      id: `rec-${Date.now()}-batch`,
      module,
      type: 'batch_optimization',
      description: `Batch small ${module} operations to reduce per-call overhead (${operationCount} ops today)`,
      estimatedSavingsPct: 15,
      estimatedSavingsMillicents: Math.round(currentSpendMillicents * 0.15),
      effort: 'medium',
      confidence: 60,
      createdAt: new Date().toISOString(),
    });
  }

  // 4. Cache opportunity for repeated patterns
  const costPerOp = operationCount > 0 ? currentSpendMillicents / operationCount : 0;
  if (costPerOp < 100 && operationCount > 200) {
    newRecs.push({
      id: `rec-${Date.now()}-cache`,
      module,
      type: 'cache_opportunity',
      description: `Many small ${module} calls detected — caching could eliminate redundant operations`,
      estimatedSavingsPct: 30,
      estimatedSavingsMillicents: Math.round(currentSpendMillicents * 0.3),
      effort: 'low',
      confidence: 55,
      createdAt: new Date().toISOString(),
    });
  }

  // Store recommendations
  for (const rec of newRecs) {
    recommendations.push(rec);
  }
  while (recommendations.length > MAX_RECOMMENDATIONS) {
    recommendations.shift();
  }

  if (newRecs.length > 0) {
    emit({
      module: 'economy',
      event_type: 'optimization_recommendations_generated',
      outcome: 'succeeded',
      data: { module, count: newRecs.length, totalSavings: newRecs.reduce((s, r) => s + r.estimatedSavingsMillicents, 0) },
    });
  }

  return newRecs;
}

/**
 * Get all active recommendations
 */
export function getRecommendations(module?: string): OptimizationRecommendation[] {
  let recs = [...recommendations];
  if (module) {
    recs = recs.filter(r => r.module === module);
  }
  return recs.sort((a, b) => b.estimatedSavingsMillicents - a.estimatedSavingsMillicents);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET SIMULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simulate a budget change scenario
 */
export function simulateBudgetChange(
  module: string,
  currentSpend: number,
  newBudget: number,
  growthRatePct: number = 5
): BudgetSimulation {
  const projectedSpend = Math.round(currentSpend * (1 + growthRatePct / 100));
  const delta = newBudget - projectedSpend;
  const deltaPct = projectedSpend > 0 ? Math.round((delta / projectedSpend) * 100) : 0;

  const risks: string[] = [];
  if (delta < 0) {
    risks.push(`Budget shortfall of ${Math.abs(delta)} millicents projected`);
  }
  if (newBudget < currentSpend * 0.8) {
    risks.push('Budget cut >20% may cause service degradation');
  }
  if (growthRatePct > 20) {
    risks.push('High growth rate assumption — forecast may be unreliable');
  }

  return {
    scenario: `${module} budget → ${newBudget} millicents (${growthRatePct}% growth)`,
    currentSpend,
    projectedSpend,
    delta,
    deltaPct,
    feasible: delta >= 0,
    risks,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-MODULE CORRELATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find cost correlations between modules
 */
export function findCostCorrelations(): CostCorrelation[] {
  const modules = Array.from(hourlySamples.keys());
  const correlations: CostCorrelation[] = [];

  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const correlation = calculateCorrelation(modules[i], modules[j]);
      if (Math.abs(correlation) > 0.3) {
        const relationship: CostCorrelation['relationship'] =
          correlation > 0.7 ? 'strong_positive' :
          correlation > 0.3 ? 'positive' :
          correlation < -0.7 ? 'strong_negative' :
          correlation < -0.3 ? 'negative' : 'neutral';

        correlations.push({
          moduleA: modules[i],
          moduleB: modules[j],
          correlation: Math.round(correlation * 100) / 100,
          relationship,
          description: `${modules[i]} and ${modules[j]} costs are ${relationship.replace('_', ' ')}ly correlated`,
        });
      }
    }
  }

  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

function calculateCorrelation(moduleA: string, moduleB: string): number {
  const samplesA = hourlySamples.get(moduleA) || [];
  const samplesB = hourlySamples.get(moduleB) || [];

  if (samplesA.length < 10 || samplesB.length < 10) return 0;

  // Aggregate by hour
  const hourlyA = new Array(24).fill(0);
  const hourlyB = new Array(24).fill(0);

  for (const s of samplesA) hourlyA[s.hour] += s.amount;
  for (const s of samplesB) hourlyB[s.hour] += s.amount;

  // Pearson correlation
  const n = 24;
  const meanA = hourlyA.reduce((a, b) => a + b, 0) / n;
  const meanB = hourlyB.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomA = 0;
  let denomB = 0;

  for (let i = 0; i < n; i++) {
    const dA = hourlyA[i] - meanA;
    const dB = hourlyB[i] - meanB;
    numerator += dA * dB;
    denomA += dA * dA;
    denomB += dB * dB;
  }

  const denominator = Math.sqrt(denomA * denomB);
  return denominator > 0 ? numerator / denominator : 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SpendIntelligenceStats {
  trackedModules: number;
  totalSamples: number;
  activeRecommendations: number;
  totalEstimatedSavings: number;
  correlationPairsFound: number;
}

export function getSpendIntelligenceStats(): SpendIntelligenceStats {
  let totalSamples = 0;
  for (const samples of hourlySamples.values()) {
    totalSamples += samples.length;
  }

  return {
    trackedModules: hourlySamples.size,
    totalSamples,
    activeRecommendations: recommendations.length,
    totalEstimatedSavings: recommendations.reduce((s, r) => s + r.estimatedSavingsMillicents, 0),
    correlationPairsFound: findCostCorrelations().length,
  };
}

/**
 * Reset intelligence state (for testing)
 */
export function resetSpendIntelligence(): void {
  hourlySamples.clear();
  recommendations.length = 0;
}
