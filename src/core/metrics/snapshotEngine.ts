/**
 * GOAL — Snapshot Engine
 * Captures immutable system-wide metric snapshots every 10 minutes.
 * Supports delta queries, trend queries, module contribution breakdown.
 * vX.STRUCTURE.2
 */

import { getAllLiveMetrics, flattenAllMetrics } from './metricsRegistry';
import type { ModuleLiveMetrics, NumericMetric } from './metricsSchema';
import { persistLatestSnapshot } from './snapshotPersistence';

// ═══ Types ════════════════════════════════════════════════════════

export interface MetricSnapshot {
  snapshotId: string;
  timestamp: string;
  modules: Record<string, ModuleLiveMetrics>;
  flatMetrics: NumericMetric[];
  systemHealth: number;
}

export interface SnapshotDelta {
  from: string; // snapshotId
  to: string;   // snapshotId
  changes: Array<{
    moduleId: string;
    metric: string;
    oldValue: number;
    newValue: number;
    delta: number;
    deltaPercent: number;
  }>;
}

export interface TrendPoint {
  timestamp: string;
  value: number;
}

// ═══ State ════════════════════════════════════════════════════════

const snapshots: MetricSnapshot[] = [];
const MAX_SNAPSHOTS = 144; // 24 hours at 10-min intervals
let captureInterval: ReturnType<typeof setInterval> | null = null;
let totalCaptureCount = 0;

function generateSnapshotId(): string {
  return crypto.randomUUID();
}

// ═══ Capture ══════════════════════════════════════════════════════

export async function capture(): Promise<MetricSnapshot> {
  const snapshotId = generateSnapshotId();
  const allMetrics = await getAllLiveMetrics();
  const flatMetrics = await flattenAllMetrics(snapshotId);

  const modules: Record<string, ModuleLiveMetrics> = {};
  for (const [id, m] of allMetrics) {
    modules[id] = m;
  }

  // Derive system health as weighted average of module health scores
  const scores = Object.values(modules).map(m => m.healthScore);
  const systemHealth = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const snapshot: MetricSnapshot = {
    snapshotId,
    timestamp: new Date().toISOString(),
    modules,
    flatMetrics,
    systemHealth,
  };

  snapshots.push(snapshot);
  totalCaptureCount++;

  // Evict old snapshots
  while (snapshots.length > MAX_SNAPSHOTS) {
    snapshots.shift();
  }

  // Persist to database for cross-session retention (fire-and-forget)
  persistLatestSnapshot().catch(() => {
    // Silent fail — persistence is best-effort
  });

  return snapshot;
}

// ═══ Queries ══════════════════════════════════════════════════════

export function getLatestSnapshot(): MetricSnapshot | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

export function getSnapshotById(snapshotId: string): MetricSnapshot | null {
  return snapshots.find(s => s.snapshotId === snapshotId) ?? null;
}

export function getAllSnapshots(): MetricSnapshot[] {
  return [...snapshots];
}

/**
 * Delta query between two snapshots.
 */
export function computeDelta(fromId: string, toId: string): SnapshotDelta | null {
  const from = getSnapshotById(fromId);
  const to = getSnapshotById(toId);
  if (!from || !to) return null;

  const changes: SnapshotDelta['changes'] = [];

  for (const [moduleId, toMetrics] of Object.entries(to.modules)) {
    const fromMetrics = from.modules[moduleId];
    if (!fromMetrics) continue;

    // Compare counters
    for (const [key, newVal] of Object.entries(toMetrics.counters)) {
      const oldVal = fromMetrics.counters[key] ?? 0;
      if (oldVal !== newVal) {
        changes.push({
          moduleId,
          metric: key,
          oldValue: oldVal,
          newValue: newVal,
          delta: newVal - oldVal,
          deltaPercent: oldVal !== 0 ? ((newVal - oldVal) / oldVal) * 100 : 100,
        });
      }
    }

    // Compare health scores
    if (fromMetrics.healthScore !== toMetrics.healthScore) {
      changes.push({
        moduleId,
        metric: 'healthScore',
        oldValue: fromMetrics.healthScore,
        newValue: toMetrics.healthScore,
        delta: toMetrics.healthScore - fromMetrics.healthScore,
        deltaPercent: fromMetrics.healthScore !== 0
          ? ((toMetrics.healthScore - fromMetrics.healthScore) / fromMetrics.healthScore) * 100
          : 100,
      });
    }
  }

  return { from: fromId, to: toId, changes };
}

/**
 * Trend query for a specific metric across all snapshots.
 */
export function getTrend(moduleId: string, metricName: string): TrendPoint[] {
  return snapshots
    .filter(s => s.modules[moduleId])
    .map(s => {
      const mod = s.modules[moduleId];
      const value = metricName === 'healthScore'
        ? mod.healthScore
        : mod.counters[metricName] ?? mod.rates[metricName] ?? 0;
      return { timestamp: s.timestamp, value };
    });
}

/**
 * Module contribution breakdown for system health.
 */
export function getModuleContributions(): Array<{
  moduleId: string;
  healthScore: number;
  weight: number;
}> {
  const latest = getLatestSnapshot();
  if (!latest) return [];

  const modules = Object.entries(latest.modules);
  const weight = modules.length > 0 ? 1 / modules.length : 0;

  return modules.map(([moduleId, m]) => ({
    moduleId,
    healthScore: m.healthScore,
    weight,
  }));
}

// ═══ Lifecycle ════════════════════════════════════════════════════

const CAPTURE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function startSnapshotEngine(): () => void {
  // Capture immediately
  capture().catch(console.error);

  captureInterval = setInterval(() => {
    if (document.visibilityState === 'hidden') return;
    capture().catch(console.error);
  }, CAPTURE_INTERVAL_MS);

  return () => {
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
  };
}

// ═══ Stats ═══════════════════════════════════════════════════════

/**
 * Get snapshot engine statistics for observability.
 */
export function getSnapshotStats(): {
  totalCaptures: number;
  retainedSnapshots: number;
  maxRetained: number;
  oldestTimestamp: string | null;
  newestTimestamp: string | null;
  avgHealthScore: number;
} {
  const oldest = snapshots.length > 0 ? snapshots[0].timestamp : null;
  const newest = snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp : null;
  const avgHealth = snapshots.length > 0
    ? Math.round(snapshots.reduce((s, snap) => s + snap.systemHealth, 0) / snapshots.length)
    : 0;

  return {
    totalCaptures: totalCaptureCount,
    retainedSnapshots: snapshots.length,
    maxRetained: MAX_SNAPSHOTS,
    oldestTimestamp: oldest,
    newestTimestamp: newest,
    avgHealthScore: avgHealth,
  };
}
