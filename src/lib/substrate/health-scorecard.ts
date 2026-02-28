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

const history: number[] = [];
const MAX_HISTORY = 50;

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
  if (history.length < 3) return 'stable';
  const recent = history.slice(-5);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const diff = current - avg;
  if (diff > 3) return 'improving';
  if (diff < -3) return 'declining';
  return 'stable';
}

export function computeScorecard(dimensions: Omit<DimensionScore, 'status'>[]): HealthScorecard {
  const scored: DimensionScore[] = dimensions.map(d => ({
    ...d,
    status: toStatus(d.score),
  }));

  const totalWeight = scored.reduce((s, d) => s + d.weight, 0);
  const overall = totalWeight > 0
    ? scored.reduce((s, d) => s + d.score * d.weight, 0) / totalWeight
    : 0;

  const trend = computeTrend(overall);
  history.push(overall);
  if (history.length > MAX_HISTORY) history.shift();

  return {
    overall: Math.round(overall * 10) / 10,
    grade: toGrade(overall),
    dimensions: scored,
    timestamp: Date.now(),
    trend,
  };
}

export function getScorecardHistory(): number[] {
  return [...history];
}

/** Quick health from simple module statuses */
export function quickScore(modules: Array<{ name: string; healthy: boolean; latencyMs?: number }>): HealthScorecard {
  return computeScorecard(modules.map(m => ({
    dimension: m.name,
    score: m.healthy ? (m.latencyMs && m.latencyMs > 1000 ? 70 : 95) : 20,
    weight: 1,
  })));
}
