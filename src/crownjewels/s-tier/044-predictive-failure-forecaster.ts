/**
 * S-Tier 044 — Predictive Failure Forecaster
 * CJPI: 93 | Node: MEDIC | ID: S-76
 *
 * Analyses module health trends to predict imminent failures.
 * Uses linear regression on recent health scores to detect downward trajectories.
 */

export interface HealthSample {
  module: string;
  health: number;    // 0-100
  timestamp: number;
}

export interface FailurePrediction {
  module: string;
  currentHealth: number;
  predictedHealth: number; // estimated in forecastHorizon
  slope: number;           // health change per hour
  timeToFailure: number | null; // ms until health <= 0, null if stable/rising
  risk: 'critical' | 'high' | 'medium' | 'low';
  forecastAt: string;
}

function linearRegression(points: Array<{ x: number; y: number }>): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function forecastFailures(
  samples: HealthSample[],
  forecastHorizonMs = 3_600_000 // 1 hour
): FailurePrediction[] {
  const byModule = new Map<string, HealthSample[]>();
  for (const s of samples) {
    if (!byModule.has(s.module)) byModule.set(s.module, []);
    byModule.get(s.module)!.push(s);
  }

  const predictions: FailurePrediction[] = [];

  for (const [module, moduleSamples] of byModule) {
    const sorted = moduleSamples.sort((a, b) => a.timestamp - b.timestamp);
    const baseTime = sorted[0].timestamp;
    const points = sorted.map(s => ({ x: (s.timestamp - baseTime) / 3_600_000, y: s.health }));
    const { slope, intercept } = linearRegression(points);

    const currentHealth = sorted[sorted.length - 1].health;
    const hoursAhead = forecastHorizonMs / 3_600_000;
    const currentX = (sorted[sorted.length - 1].timestamp - baseTime) / 3_600_000;
    const predictedHealth = Math.max(0, Math.min(100, slope * (currentX + hoursAhead) + intercept));

    let timeToFailure: number | null = null;
    if (slope < 0) {
      const hoursToZero = -intercept / slope - currentX;
      if (hoursToZero > 0) timeToFailure = hoursToZero * 3_600_000;
    }

    let risk: FailurePrediction['risk'] = 'low';
    if (slope < -10) risk = 'critical';
    else if (slope < -5) risk = 'high';
    else if (slope < -1) risk = 'medium';

    predictions.push({
      module,
      currentHealth,
      predictedHealth: Math.round(predictedHealth * 10) / 10,
      slope: Math.round(slope * 100) / 100,
      timeToFailure,
      risk,
      forecastAt: new Date().toISOString(),
    });
  }

  return predictions.sort((a, b) => {
    const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return riskOrder[a.risk] - riskOrder[b.risk];
  });
}
