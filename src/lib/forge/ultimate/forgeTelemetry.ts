/**
 * FORGE Ultimate #10 — Forge Telemetry Hearth
 * Blueprints forged/hour, success rate, avg CJPI, stage bottleneck,
 * material usage heatmap, artifact export distribution.
 */

// ── Types ──

export interface ForgeTelemetrySnapshot {
  forgesPerHour: number;
  successRate: number;
  avgCJPI: number;
  stageBottleneck: string | null;
  materialHeatmap: { materialId: string; usageCount: number }[];
  targetDistribution: { target: string; count: number }[];
  thermalZone: string;
  activeCollaborations: number;
  antiPatternsDetected: number;
  systemHealth: number;
  generatedAt: number;
}

interface TelemetryEvent {
  type: 'forge' | 'compile' | 'qa' | 'collaborate';
  timestamp: number;
  durationMs: number;
  success: boolean;
  cjpiScore?: number;
}

// ── State ──

const events: TelemetryEvent[] = [];
const MAX_EVENTS = 5000;

// ── Core ──

export function recordForgeEvent(type: TelemetryEvent['type'], durationMs: number, success: boolean, cjpiScore?: number): void {
  events.push({ type, timestamp: Date.now(), durationMs, success, cjpiScore });
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
}

export function getHearthSnapshot(externalMetrics: {
  stageBottleneck?: string | null;
  materialHeatmap?: { materialId: string; usageCount: number }[];
  targetDistribution?: { target: string; count: number }[];
  thermalZone?: string;
  activeCollaborations?: number;
  antiPatternsDetected?: number;
} = {}): ForgeTelemetrySnapshot {
  const now = Date.now();
  const hourAgo = now - 3600_000;
  const recentForges = events.filter(e => e.type === 'forge' && e.timestamp > hourAgo);
  const allForges = events.filter(e => e.type === 'forge');

  const successRate = allForges.length > 0
    ? Math.round(allForges.filter(e => e.success).length / allForges.length * 1000) / 1000
    : 0;

  const scoredForges = allForges.filter(e => e.cjpiScore !== undefined);
  const avgCJPI = scoredForges.length > 0
    ? Math.round(scoredForges.reduce((s, e) => s + (e.cjpiScore ?? 0), 0) / scoredForges.length)
    : 0;

  const health = Math.round(successRate * 50 + Math.min(50, avgCJPI / 2));

  return {
    forgesPerHour: recentForges.length,
    successRate,
    avgCJPI,
    stageBottleneck: externalMetrics.stageBottleneck ?? null,
    materialHeatmap: externalMetrics.materialHeatmap ?? [],
    targetDistribution: externalMetrics.targetDistribution ?? [],
    thermalZone: externalMetrics.thermalZone ?? 'cool',
    activeCollaborations: externalMetrics.activeCollaborations ?? 0,
    antiPatternsDetected: externalMetrics.antiPatternsDetected ?? 0,
    systemHealth: health,
    generatedAt: now,
  };
}

export function getHearthStats(): { totalEvents: number; eventsByType: Record<string, number> } {
  const byType: Record<string, number> = {};
  for (const e of events) byType[e.type] = (byType[e.type] ?? 0) + 1;
  return { totalEvents: events.length, eventsByType: byType };
}

export function resetHearthState(): void { events.length = 0; }
