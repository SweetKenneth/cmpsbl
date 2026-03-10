/**
 * S-Tier 088 — Behavioral Anomaly Detector
 * CJPI: 91 | Node: DEFENSE | ID: S-113
 *
 * Detects anomalous behavior patterns by comparing against learned baselines.
 * Uses statistical deviation analysis.
 */

export interface BehaviorSample {
  userId: string;
  action: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface BehaviorBaseline {
  userId: string;
  avgActionsPerHour: number;
  commonActions: string[];
  activeHours: number[];  // typical hours of day (0-23)
  sampleCount: number;
}

export interface AnomalyAlert {
  userId: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  detectedAt: string;
}

const baselines = new Map<string, BehaviorBaseline>();

export function updateBaseline(userId: string, samples: BehaviorSample[]): BehaviorBaseline {
  const userSamples = samples.filter(s => s.userId === userId);
  if (userSamples.length === 0) {
    return baselines.get(userId) ?? { userId, avgActionsPerHour: 0, commonActions: [], activeHours: [], sampleCount: 0 };
  }

  const hours = userSamples.map(s => new Date(s.timestamp).getHours());
  const actionCounts = new Map<string, number>();
  for (const s of userSamples) {
    actionCounts.set(s.action, (actionCounts.get(s.action) ?? 0) + 1);
  }

  const timeSpanHours = Math.max(1, (Math.max(...userSamples.map(s => s.timestamp)) - Math.min(...userSamples.map(s => s.timestamp))) / 3_600_000);

  const baseline: BehaviorBaseline = {
    userId,
    avgActionsPerHour: Math.round((userSamples.length / timeSpanHours) * 10) / 10,
    commonActions: [...actionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a]) => a),
    activeHours: [...new Set(hours)].sort((a, b) => a - b),
    sampleCount: userSamples.length,
  };
  baselines.set(userId, baseline);
  return baseline;
}

export function detectAnomalies(userId: string, recentSamples: BehaviorSample[]): AnomalyAlert[] {
  const baseline = baselines.get(userId);
  if (!baseline || baseline.sampleCount < 10) return [];

  const alerts: AnomalyAlert[] = [];
  const userRecent = recentSamples.filter(s => s.userId === userId);

  // Rate anomaly
  const recentHours = Math.max(0.1, (Date.now() - Math.min(...userRecent.map(s => s.timestamp))) / 3_600_000);
  const currentRate = userRecent.length / recentHours;
  if (currentRate > baseline.avgActionsPerHour * 3) {
    alerts.push({
      userId, type: 'rate_spike', severity: 'warning',
      description: `Action rate ${Math.round(currentRate)}/hr vs baseline ${baseline.avgActionsPerHour}/hr`,
      detectedAt: new Date().toISOString(),
    });
  }

  // Unusual actions
  const unusual = userRecent.filter(s => !baseline.commonActions.includes(s.action));
  if (unusual.length > userRecent.length * 0.5 && userRecent.length > 3) {
    alerts.push({
      userId, type: 'unusual_actions', severity: 'info',
      description: `${unusual.length}/${userRecent.length} actions outside normal pattern`,
      detectedAt: new Date().toISOString(),
    });
  }

  return alerts;
}
