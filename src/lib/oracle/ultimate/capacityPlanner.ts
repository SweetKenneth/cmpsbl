/**
 * ORACLE Ultimate #7 — Capacity Planning Oracle
 * Projects resource exhaustion timelines with confidence bands.
 * Growth rate modeling and scaling action recommendations.
 */

// ── Types ──

export interface ResourceTracker {
  id: string;
  name: string;
  unit: string;          // 'bytes', 'count', 'percent', etc.
  capacity: number;      // Max capacity
  samples: { timestamp: number; usage: number }[];
  maxSamples: number;
}

export interface ExhaustionProjection {
  resourceId: string;
  currentUsage: number;
  capacity: number;
  utilizationPercent: number;
  growthRatePerHour: number;
  estimatedExhaustionMs: number | null;    // null = not growing
  estimatedExhaustionDate: string | null;
  confidence: number;
  urgency: 'safe' | 'monitor' | 'plan' | 'urgent' | 'critical';
  recommendation: string;
}

// ── State ──

const trackers = new Map<string, ResourceTracker>();
const projections = new Map<string, ExhaustionProjection>();
let totalProjections = 0;

// ── Core ──

export function registerResource(id: string, name: string, capacity: number, unit: string = 'count'): void {
  trackers.set(id, { id, name, unit, capacity, samples: [], maxSamples: 500 });
}

export function recordUsage(resourceId: string, usage: number, timestamp?: number): void {
  const tracker = trackers.get(resourceId);
  if (!tracker) return;
  tracker.samples.push({ timestamp: timestamp ?? Date.now(), usage });
  if (tracker.samples.length > tracker.maxSamples) {
    tracker.samples.splice(0, tracker.samples.length - tracker.maxSamples);
  }
}

export function projectExhaustion(resourceId: string): ExhaustionProjection | null {
  const tracker = trackers.get(resourceId);
  if (!tracker || tracker.samples.length < 3) return null;

  const samples = tracker.samples;
  const current = samples[samples.length - 1].usage;
  const utilizationPercent = Math.round((current / tracker.capacity) * 10000) / 100;

  // Linear regression for growth rate
  const n = samples.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  const t0 = samples[0].timestamp;
  for (let i = 0; i < n; i++) {
    const x = (samples[i].timestamp - t0) / 3600_000; // hours
    sumX += x;
    sumY += samples[i].usage;
    sumXY += x * samples[i].usage;
    sumX2 += x * x;
  }
  const denom = n * sumX2 - sumX * sumX;
  const growthRatePerHour = denom > 0 ? (n * sumXY - sumX * sumY) / denom : 0;

  // Project exhaustion
  let estimatedExhaustionMs: number | null = null;
  let estimatedExhaustionDate: string | null = null;

  if (growthRatePerHour > 0) {
    const remaining = tracker.capacity - current;
    const hoursToExhaustion = remaining / growthRatePerHour;
    estimatedExhaustionMs = hoursToExhaustion * 3600_000;
    estimatedExhaustionDate = new Date(Date.now() + estimatedExhaustionMs).toISOString();
  }

  // Confidence based on R² and sample count
  const yMean = sumY / n;
  const ssTotal = samples.reduce((s, p) => s + (p.usage - yMean) ** 2, 0);
  const ssResid = samples.reduce((s, p, i) => {
    const x = (p.timestamp - t0) / 3600_000;
    const predicted = (sumY / n) + growthRatePerHour * (x - sumX / n);
    return s + (p.usage - predicted) ** 2;
  }, 0);
  const rSquared = ssTotal > 0 ? Math.max(0, 1 - ssResid / ssTotal) : 0;
  const confidence = Math.round(rSquared * Math.min(1, n / 20) * 1000) / 1000;

  // Urgency
  let urgency: ExhaustionProjection['urgency'];
  if (!estimatedExhaustionMs || estimatedExhaustionMs > 7 * 24 * 3600_000) urgency = 'safe';
  else if (estimatedExhaustionMs > 24 * 3600_000) urgency = 'monitor';
  else if (estimatedExhaustionMs > 4 * 3600_000) urgency = 'plan';
  else if (estimatedExhaustionMs > 1 * 3600_000) urgency = 'urgent';
  else urgency = 'critical';

  // Recommendation
  const recommendations: Record<ExhaustionProjection['urgency'], string> = {
    safe: 'No action needed. Growth is stable or declining.',
    monitor: 'Monitor over next 7 days. Consider proactive scaling.',
    plan: 'Begin capacity planning. Estimated exhaustion within 24 hours.',
    urgent: 'Immediate scaling recommended. Exhaustion in < 4 hours.',
    critical: 'CRITICAL: Resource exhaustion imminent. Scale NOW.',
  };

  const projection: ExhaustionProjection = {
    resourceId,
    currentUsage: current,
    capacity: tracker.capacity,
    utilizationPercent,
    growthRatePerHour: Math.round(growthRatePerHour * 1000) / 1000,
    estimatedExhaustionMs,
    estimatedExhaustionDate,
    confidence,
    urgency,
    recommendation: recommendations[urgency],
  };

  projections.set(resourceId, projection);
  totalProjections++;
  return projection;
}

export function getAllProjections(): ExhaustionProjection[] {
  return Array.from(projections.values());
}

export function getCapacityStats(): { trackedResources: number; totalProjections: number; criticalCount: number; urgentCount: number } {
  const all = Array.from(projections.values());
  return {
    trackedResources: trackers.size,
    totalProjections,
    criticalCount: all.filter(p => p.urgency === 'critical').length,
    urgentCount: all.filter(p => p.urgency === 'urgent').length,
  };
}

export function resetCapacityState(): void {
  trackers.clear();
  projections.clear();
  totalProjections = 0;
}
