/**
 * Enhancement Mesh — Telemetry & Health Monitoring
 * 
 * Tracks amplifier uptime, fan-out coverage, uplift deltas,
 * and computes weighted mesh health scores.
 */

import type { AmplifierCategory, HeartbeatTick } from './meshAmplifier';

// ─── Types ────────────────────────────────────────────────────────

export interface MeshTickRecord {
  amplifierId: string;
  category: AmplifierCategory;
  timestamp: string;
  latencyMs: number;
  nodesReached: number;
  upliftDelta: number;
  healthy: boolean;
}

export interface MeshHealthReport {
  overallHealth: number;          // 0–100
  categoryHealth: Record<AmplifierCategory, number>;
  totalTicks: number;
  healthyTicks: number;
  failedTicks: number;
  avgLatencyMs: number;
  fanOutCoverage: number;         // % of nodes reached
  meshUptime: number;             // %
  lastUpdated: string;
  alerts: MeshAlert[];
}

export interface MeshAlert {
  level: 'warning' | 'critical';
  category: AmplifierCategory;
  message: string;
  timestamp: string;
}

// ─── Storage ──────────────────────────────────────────────────────

const MAX_TICK_HISTORY = 500;
const tickHistory: MeshTickRecord[] = [];
const categoryTicks = new Map<AmplifierCategory, MeshTickRecord[]>();
const alerts: MeshAlert[] = [];

// ─── Category Health Weights ──────────────────────────────────────

const CATEGORY_HEALTH_WEIGHTS: Record<AmplifierCategory, number> = {
  cognitive: 0.25,
  resilience: 0.25,
  operational: 0.20,
  governance: 0.15,
  evolution: 0.10,
  observability: 0.05,
};

const TOTAL_NODES = 40;

// ─── Recording ────────────────────────────────────────────────────

export function recordMeshTick(
  amplifierId: string,
  category: AmplifierCategory,
  tick: HeartbeatTick
): void {
  const record: MeshTickRecord = {
    amplifierId,
    category,
    timestamp: tick.timestamp,
    latencyMs: tick.latencyMs,
    nodesReached: tick.nodesReached,
    upliftDelta: tick.upliftDelta,
    healthy: tick.healthy,
  };

  tickHistory.push(record);
  if (tickHistory.length > MAX_TICK_HISTORY) {
    tickHistory.splice(0, tickHistory.length - MAX_TICK_HISTORY);
  }

  // Per-category tracking
  if (!categoryTicks.has(category)) categoryTicks.set(category, []);
  const catTicks = categoryTicks.get(category)!;
  catTicks.push(record);
  if (catTicks.length > 100) catTicks.splice(0, catTicks.length - 100);

  // Alert detection
  if (!tick.healthy) {
    const recentFails = catTicks.filter(t => !t.healthy).length;
    if (recentFails >= 5) {
      addAlert('critical', category, `${category} amplifiers: ${recentFails} failures in recent window`);
    } else if (recentFails >= 3) {
      addAlert('warning', category, `${category} amplifiers: ${recentFails} failures detected`);
    }
  }
}

function addAlert(level: 'warning' | 'critical', category: AmplifierCategory, message: string): void {
  alerts.push({ level, category, message, timestamp: new Date().toISOString() });
  if (alerts.length > 50) alerts.splice(0, alerts.length - 50);
}

// ─── Health Computation ───────────────────────────────────────────

export function getMeshHealth(): MeshHealthReport {
  const totalTicks = tickHistory.length;
  const healthyTicks = tickHistory.filter(t => t.healthy).length;
  const failedTicks = totalTicks - healthyTicks;

  const avgLatencyMs = totalTicks > 0
    ? Math.round(tickHistory.reduce((sum, t) => sum + t.latencyMs, 0) / totalTicks)
    : 0;

  const avgNodesReached = totalTicks > 0
    ? tickHistory.reduce((sum, t) => sum + t.nodesReached, 0) / totalTicks
    : TOTAL_NODES;

  const fanOutCoverage = Math.round((avgNodesReached / TOTAL_NODES) * 100);
  const meshUptime = totalTicks > 0 ? Math.round((healthyTicks / totalTicks) * 100) : 100;

  // Per-category health
  const categoryHealth: Record<AmplifierCategory, number> = {
    cognitive: 100,
    resilience: 100,
    operational: 100,
    governance: 100,
    evolution: 100,
    observability: 100,
  };

  for (const [cat, ticks] of categoryTicks.entries()) {
    if (ticks.length === 0) continue;
    const catHealthy = ticks.filter(t => t.healthy).length;
    categoryHealth[cat] = Math.round((catHealthy / ticks.length) * 100);
  }

  // Weighted overall health
  let overallHealth = 0;
  for (const [cat, weight] of Object.entries(CATEGORY_HEALTH_WEIGHTS)) {
    overallHealth += categoryHealth[cat as AmplifierCategory] * weight;
  }
  overallHealth = Math.round(overallHealth);

  return {
    overallHealth,
    categoryHealth,
    totalTicks,
    healthyTicks,
    failedTicks,
    avgLatencyMs,
    fanOutCoverage,
    meshUptime,
    lastUpdated: new Date().toISOString(),
    alerts: [...alerts],
  };
}

// ─── Public Accessors ─────────────────────────────────────────────

export function getMeshTelemetry() {
  return {
    tickHistorySize: tickHistory.length,
    recentTicks: tickHistory.slice(-20),
    alertCount: alerts.length,
    recentAlerts: alerts.slice(-10),
  };
}

export function getMeshAlerts(): MeshAlert[] {
  return [...alerts];
}

export function clearMeshAlerts(): void {
  alerts.length = 0;
}
