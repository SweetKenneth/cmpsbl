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

let eventHead = 0;
let eventCount = 0;

export function recordForgeEvent(type: TelemetryEvent['type'], durationMs: number, success: boolean, cjpiScore?: number): void {
  const entry = { type, timestamp: Date.now(), durationMs, success, cjpiScore };
  if (eventCount < MAX_EVENTS) {
    events.push(entry);
  } else {
    events[eventHead] = entry;
  }
  eventHead = (eventHead + 1) % MAX_EVENTS;
  eventCount++;
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

  // Single-pass aggregation over all events
  let recentForgeCount = 0;
  let forgeTotal = 0;
  let forgeSuccess = 0;
  let cjpiSum = 0;
  let cjpiCount = 0;

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.type !== 'forge') continue;
    forgeTotal++;
    if (e.success) forgeSuccess++;
    if (e.cjpiScore !== undefined) { cjpiSum += e.cjpiScore; cjpiCount++; }
    if (e.timestamp > hourAgo) recentForgeCount++;
  }

  const successRate = forgeTotal > 0
    ? Math.round(forgeSuccess / forgeTotal * 1000) / 1000
    : 0;
  const avgCJPI = cjpiCount > 0 ? Math.round(cjpiSum / cjpiCount) : 0;
  const health = Math.round(successRate * 50 + Math.min(50, avgCJPI / 2));

  return {
    forgesPerHour: recentForgeCount,
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
