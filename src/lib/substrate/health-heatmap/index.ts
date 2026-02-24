/**
 * Health Heatmap Timeline
 * SPARTA Epoch — Time-series health tracking for all 24 matrix nodes
 * 
 * Captures health snapshots at regular intervals for historical visualization.
 */

import type { SubstrateModuleName } from '@/lib/core';

export interface HealthSnapshot {
  nodeId: SubstrateModuleName;
  health: number;
  breakerState: string;
  timestamp: number;
}

export interface HeatmapData {
  nodeId: SubstrateModuleName;
  label: string;
  timeline: { timestamp: number; health: number; breakerState: string }[];
}

export interface HeatmapConfig {
  snapshotIntervalMs: number;
  maxSnapshots: number; // per node
  retentionMs: number;
}

const config: HeatmapConfig = {
  snapshotIntervalMs: 60_000, // 1 minute
  maxSnapshots: 1440, // 24 hours at 1-min intervals
  retentionMs: 86_400_000, // 24 hours
};

const snapshots = new Map<SubstrateModuleName, HealthSnapshot[]>();
let timer: ReturnType<typeof setInterval> | null = null;
let captureCallback: (() => Record<string, { health: number; breakerState: string }>) | null = null;

export function configureHeatmap(cfg: Partial<HeatmapConfig>): void {
  Object.assign(config, cfg);
}

export function registerCaptureCallback(
  cb: () => Record<string, { health: number; breakerState: string }>
): void {
  captureCallback = cb;
}

export function captureSnapshot(
  healthData: Record<string, { health: number; breakerState: string }>
): void {
  const now = Date.now();
  const cutoff = now - config.retentionMs;

  for (const [nodeId, data] of Object.entries(healthData)) {
    const key = nodeId as SubstrateModuleName;
    if (!snapshots.has(key)) snapshots.set(key, []);
    const timeline = snapshots.get(key)!;

    timeline.push({
      nodeId: key,
      health: data.health,
      breakerState: data.breakerState,
      timestamp: now,
    });

    // Trim old snapshots
    while (timeline.length > 0 && timeline[0].timestamp < cutoff) {
      timeline.shift();
    }
    if (timeline.length > config.maxSnapshots) {
      timeline.splice(0, timeline.length - config.maxSnapshots);
    }
  }
}

export function startHeatmapCapture(): void {
  if (timer) return;
  timer = setInterval(() => {
    if (captureCallback) {
      captureSnapshot(captureCallback());
    }
  }, config.snapshotIntervalMs);
}

export function stopHeatmapCapture(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export function getHeatmapData(
  nodeIds?: SubstrateModuleName[],
  sinceMs?: number
): HeatmapData[] {
  const cutoff = sinceMs ? Date.now() - sinceMs : 0;
  const targetNodes = nodeIds ?? Array.from(snapshots.keys());

  return targetNodes.map(nodeId => {
    const timeline = (snapshots.get(nodeId) ?? [])
      .filter(s => s.timestamp >= cutoff)
      .map(s => ({ timestamp: s.timestamp, health: s.health, breakerState: s.breakerState }));

    return {
      nodeId,
      label: nodeId.toUpperCase(),
      timeline,
    };
  });
}

export function getLatestHealth(): Record<SubstrateModuleName, number> {
  const result = {} as Record<SubstrateModuleName, number>;
  for (const [nodeId, timeline] of snapshots) {
    const last = timeline[timeline.length - 1];
    result[nodeId] = last?.health ?? 100;
  }
  return result;
}

export function getHeatmapSummary() {
  const allNodes = Array.from(snapshots.keys());
  const totalSnapshots = allNodes.reduce((s, n) => s + (snapshots.get(n)?.length ?? 0), 0);

  return {
    nodesTracked: allNodes.length,
    totalSnapshots,
    retentionHours: Math.round(config.retentionMs / 3_600_000),
    captureIntervalSec: Math.round(config.snapshotIntervalMs / 1000),
    isRunning: timer !== null,
  };
}
