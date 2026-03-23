/**
 * HARVEST Ultimate — Harvest Telemetry
 * Real-time observability: ingestion rates, source health heatmaps,
 * pipeline throughput, quality trends, and cost-per-record tracking.
 */

export interface HarvestTelemetrySnapshot {
  timestamp: number;
  ingestionsPerHour: number;
  recordsPerSecond: number;
  bytesPerSecond: number;
  activeSourceCount: number;
  avgQualityScore: number;
  avgDeduplicationRate: number;
  pipelineSuccessRate: number;
  costPerRecord: number;
  swarmUtilization: number;
  chainIntegrity: boolean;
  prefetchHitRate: number;
  systemHealth: number;
}

export interface SourceHeatmapEntry {
  sourceId: string;
  heat: number;      // 0–1 activity level
  reliability: number;
  lastActive: number;
}

export interface TelemetryStats {
  snapshotCount: number;
  avgIngestionsPerHour: number;
  avgRecordsPerSecond: number;
  avgSystemHealth: number;
  trendDirection: 'improving' | 'stable' | 'degrading';
}

const MAX_SNAPSHOTS = 200;
const snapshots: HarvestTelemetrySnapshot[] = [];
const sourceHeatmap = new Map<string, SourceHeatmapEntry>();

export function recordSnapshot(data: Omit<HarvestTelemetrySnapshot, 'timestamp' | 'systemHealth'>): HarvestTelemetrySnapshot {
  // Compute composite health
  const healthFactors = [
    data.avgQualityScore * 25,
    (1 - data.avgDeduplicationRate) * 15,  // lower dedup rate = better source quality
    data.pipelineSuccessRate * 25,
    data.swarmUtilization * 10,
    data.chainIntegrity ? 15 : 0,
    data.prefetchHitRate * 10,
  ];
  const systemHealth = Math.min(100, Math.round(healthFactors.reduce((a, b) => a + b, 0)));

  const snapshot: HarvestTelemetrySnapshot = {
    ...data,
    timestamp: Date.now(),
    systemHealth,
  };

  if (snapshots.length >= MAX_SNAPSHOTS) snapshots.shift();
  snapshots.push(snapshot);

  return snapshot;
}

export function updateSourceHeat(sourceId: string, reliability: number, active: boolean): void {
  const existing = sourceHeatmap.get(sourceId);
  const heat = active ? Math.min(1, (existing?.heat ?? 0) + 0.2) : Math.max(0, (existing?.heat ?? 0.5) - 0.1);
  sourceHeatmap.set(sourceId, { sourceId, heat, reliability, lastActive: Date.now() });
  if (sourceHeatmap.size > 500) {
    // Evict coldest
    let coldest: string | null = null;
    let coldestHeat = Infinity;
    for (const [id, entry] of sourceHeatmap) {
      if (entry.heat < coldestHeat) { coldest = id; coldestHeat = entry.heat; }
    }
    if (coldest) sourceHeatmap.delete(coldest);
  }
}

export function getSourceHeatmap(): SourceHeatmapEntry[] {
  return [...sourceHeatmap.values()].sort((a, b) => b.heat - a.heat);
}

export function getTelemetryStats(): TelemetryStats {
  if (snapshots.length === 0) {
    return { snapshotCount: 0, avgIngestionsPerHour: 0, avgRecordsPerSecond: 0, avgSystemHealth: 100, trendDirection: 'stable' };
  }

  const avg = (field: keyof HarvestTelemetrySnapshot) => {
    const vals = snapshots.map(s => s[field] as number);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  // Trend: compare last 25% to first 25%
  const q = Math.max(1, Math.floor(snapshots.length / 4));
  const early = snapshots.slice(0, q).map(s => s.systemHealth);
  const late = snapshots.slice(-q).map(s => s.systemHealth);
  const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
  const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;

  const trendDirection: TelemetryStats['trendDirection'] =
    lateAvg > earlyAvg + 5 ? 'improving'
    : lateAvg < earlyAvg - 5 ? 'degrading'
    : 'stable';

  return {
    snapshotCount: snapshots.length,
    avgIngestionsPerHour: avg('ingestionsPerHour'),
    avgRecordsPerSecond: avg('recordsPerSecond'),
    avgSystemHealth: avg('systemHealth'),
    trendDirection,
  };
}

export function getLatestSnapshot(): HarvestTelemetrySnapshot | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

export function resetTelemetryState(): void {
  snapshots.length = 0;
  sourceHeatmap.clear();
}
