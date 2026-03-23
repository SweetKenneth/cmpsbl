/**
 * COMPASS Ultimate — Landmark Registry
 * Catalogs significant system events as navigational landmarks.
 * Enables "navigate relative to landmark X" for temporal orientation.
 */

export type LandmarkType = 'deployment' | 'schema_change' | 'discovery' | 'incident' | 'milestone' | 'upgrade' | 'anomaly';

export interface Landmark {
  id: string;
  type: LandmarkType;
  label: string;
  description: string;
  timestamp: number;
  nodeId?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface LandmarkQuery {
  before: Landmark[];
  after: Landmark[];
  nearest: Landmark | null;
}

export interface LandmarkStats {
  totalLandmarks: number;
  byType: Record<string, number>;
  byImpact: Record<string, number>;
  avgPerDay: number;
}

const MAX_LANDMARKS = 1000;
const landmarks: Landmark[] = [];

export function registerLandmark(
  type: LandmarkType, label: string, description: string,
  impact: Landmark['impact'] = 'medium',
  nodeId?: string, tags: string[] = [], metadata?: Record<string, unknown>
): Landmark {
  const lm: Landmark = {
    id: `lm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type, label, description, timestamp: Date.now(),
    nodeId, impact, tags, metadata,
  };
  if (landmarks.length >= MAX_LANDMARKS) landmarks.shift();
  landmarks.push(lm);
  return lm;
}

export function findLandmarksNear(timestamp: number, range: number = 3_600_000): LandmarkQuery {
  const before = landmarks
    .filter(l => l.timestamp < timestamp && timestamp - l.timestamp <= range)
    .sort((a, b) => b.timestamp - a.timestamp);
  const after = landmarks
    .filter(l => l.timestamp > timestamp && l.timestamp - timestamp <= range)
    .sort((a, b) => a.timestamp - b.timestamp);

  let nearest: Landmark | null = null;
  let nearestDist = Infinity;
  for (const l of landmarks) {
    const d = Math.abs(l.timestamp - timestamp);
    if (d < nearestDist) { nearest = l; nearestDist = d; }
  }

  return { before: before.slice(0, 10), after: after.slice(0, 10), nearest };
}

export function queryLandmarks(opts?: {
  type?: LandmarkType; nodeId?: string; impact?: Landmark['impact'];
  since?: number; limit?: number;
}): Landmark[] {
  let filtered = [...landmarks];
  if (opts?.type) filtered = filtered.filter(l => l.type === opts.type);
  if (opts?.nodeId) filtered = filtered.filter(l => l.nodeId === opts.nodeId);
  if (opts?.impact) filtered = filtered.filter(l => l.impact === opts.impact);
  if (opts?.since) filtered = filtered.filter(l => l.timestamp >= opts.since!);
  filtered.sort((a, b) => b.timestamp - a.timestamp);
  return filtered.slice(0, opts?.limit ?? 50);
}

export function getLandmarkStats(): LandmarkStats {
  const byType: Record<string, number> = {};
  const byImpact: Record<string, number> = {};
  for (const l of landmarks) {
    byType[l.type] = (byType[l.type] ?? 0) + 1;
    byImpact[l.impact] = (byImpact[l.impact] ?? 0) + 1;
  }

  const span = landmarks.length >= 2
    ? (landmarks[landmarks.length - 1].timestamp - landmarks[0].timestamp) / 86_400_000
    : 1;

  return {
    totalLandmarks: landmarks.length,
    byType, byImpact,
    avgPerDay: span > 0 ? landmarks.length / span : landmarks.length,
  };
}

export function resetLandmarkState(): void { landmarks.length = 0; }
