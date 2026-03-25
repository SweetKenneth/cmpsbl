/**
 * Health Scorecard — Composite health scoring across all substrate dimensions
 * Weighted multi-signal health computation
 */

export interface DimensionScore {
  dimension: string;
  score: number; // 0-100
  weight: number;
  status: 'healthy' | 'degraded' | 'critical';
  details?: string;
}

export interface HealthScorecard {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  dimensions: DimensionScore[];
  timestamp: number;
  trend: 'improving' | 'stable' | 'declining';
}

// Ring-buffer for history — O(1) push, bounded
const HISTORY_CAP = 50;
const history: number[] = [];
let historyHead = 0;
let historyCount = 0;

function toGrade(score: number): HealthScorecard['grade'] {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function toStatus(score: number): DimensionScore['status'] {
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'degraded';
  return 'critical';
}

function computeTrend(current: number): HealthScorecard['trend'] {
  if (historyCount < 3) return 'stable';
  // Compute recent average from ring buffer — no slice needed
  const count = Math.min(5, historyCount);
  let sum = 0;
  for (let i = 0; i < count; i++) {
    const idx = (historyHead - 1 - i + HISTORY_CAP) % HISTORY_CAP;
    sum += history[idx];
  }
  const diff = current - sum / count;
  if (diff > 3) return 'improving';
  if (diff < -3) return 'declining';
  return 'stable';
}

function pushHistory(val: number): void {
  if (historyCount < HISTORY_CAP) {
    history.push(val);
    historyCount++;
  } else {
    history[historyHead] = val;
  }
  historyHead = (historyHead + 1) % HISTORY_CAP;
}

export function computeScorecard(dimensions: Omit<DimensionScore, 'status'>[]): HealthScorecard {
  // Single-pass: compute weighted sum and build scored array
  let totalWeight = 0;
  let weightedSum = 0;
  const scored: DimensionScore[] = new Array(dimensions.length);
  for (let i = 0; i < dimensions.length; i++) {
    const d = dimensions[i];
    scored[i] = { ...d, status: toStatus(d.score) };
    totalWeight += d.weight;
    weightedSum += d.score * d.weight;
  }

  const overall = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const trend = computeTrend(overall);
  pushHistory(overall);

  return {
    overall: Math.round(overall * 10) / 10,
    grade: toGrade(overall),
    dimensions: scored,
    timestamp: Date.now(),
    trend,
  };
}

export function getScorecardHistory(): number[] {
  if (historyCount < HISTORY_CAP) return history.slice();
  return [...history.slice(historyHead), ...history.slice(0, historyHead)];
}

/** Quick health from simple module statuses */
export function quickScore(modules: Array<{ name: string; healthy: boolean; latencyMs?: number }>): HealthScorecard {
  return computeScorecard(modules.map(m => ({
    dimension: m.name,
    score: m.healthy ? (m.latencyMs && m.latencyMs > 1000 ? 70 : 95) : 20,
    weight: 1,
  })));
}
