/**
 * SIMULATE Ultimate — System 10: Simulation Telemetry & Audit
 * 
 * Complete audit trail for every simulation. Tracks simulation types,
 * durations, outcomes, and cross-node usage. Provides simulation
 * analytics for capacity planning.
 * 
 * @module simulate/ultimate/simulationTelemetry
 */

// ── Types ────────────────────────────────────────────────────────

export type SimulationType = 'monte_carlo' | 'scenario' | 'temporal' | 'cost' | 'ab_comparison' | 'blast_radius' | 'chaos' | 'fork';

export interface SimulationAuditEntry {
  id: string;
  type: SimulationType;
  name: string;
  requestedBy: string;       // Node or user that requested the simulation
  parameters: Record<string, unknown>;
  outcome: {
    success: boolean;
    resultId: string;
    summary: string;
    impactLevel: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  };
  computeTimeMs: number;
  iterationsRun?: number;
  nodesInvolved: string[];
  timestamp: string;
}

export interface SimulationAnalytics {
  totalSimulations: number;
  byType: Record<SimulationType, number>;
  avgComputeTimeMs: number;
  peakComputeTimeMs: number;
  totalIterationsRun: number;
  topRequesters: Array<{ requester: string; count: number }>;
  simulationsPerHour: number;
  successRate: number;
}

// ── State ────────────────────────────────────────────────────────

const auditLog: SimulationAuditEntry[] = [];
const MAX_AUDIT = 2000;
let totalSimulations = 0;
let totalIterations = 0;

// ── Core API ────────────────────────────────────────────────────

/** Record a simulation in the audit trail */
export function recordSimulation(entry: Omit<SimulationAuditEntry, 'id' | 'timestamp'>): SimulationAuditEntry {
  const record: SimulationAuditEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  auditLog.push(record);
  if (auditLog.length > MAX_AUDIT) auditLog.splice(0, auditLog.length - MAX_AUDIT);

  totalSimulations++;
  totalIterations += entry.iterationsRun || 0;

  return record;
}

/** Get simulation analytics */
export function getSimulationAnalytics(hours?: number): SimulationAnalytics {
  const cutoff = hours ? Date.now() - hours * 3_600_000 : 0;
  const filtered = cutoff > 0
    ? auditLog.filter(e => new Date(e.timestamp).getTime() > cutoff)
    : auditLog;

  const byType: Record<string, number> = {};
  const requesterCounts: Record<string, number> = {};
  let totalCompute = 0;
  let peakCompute = 0;
  let successCount = 0;
  let iterCount = 0;

  for (const entry of filtered) {
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    requesterCounts[entry.requestedBy] = (requesterCounts[entry.requestedBy] || 0) + 1;
    totalCompute += entry.computeTimeMs;
    if (entry.computeTimeMs > peakCompute) peakCompute = entry.computeTimeMs;
    if (entry.outcome.success) successCount++;
    iterCount += entry.iterationsRun || 0;
  }

  const topRequesters = Object.entries(requesterCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([requester, count]) => ({ requester, count }));

  const spanMs = filtered.length >= 2
    ? new Date(filtered[filtered.length - 1].timestamp).getTime() - new Date(filtered[0].timestamp).getTime()
    : 3_600_000;
  const spanHours = Math.max(1, spanMs / 3_600_000);

  return {
    totalSimulations: filtered.length,
    byType: byType as Record<SimulationType, number>,
    avgComputeTimeMs: filtered.length > 0 ? Math.round(totalCompute / filtered.length * 100) / 100 : 0,
    peakComputeTimeMs: Math.round(peakCompute * 100) / 100,
    totalIterationsRun: iterCount,
    topRequesters,
    simulationsPerHour: Math.round((filtered.length / spanHours) * 10) / 10,
    successRate: filtered.length > 0 ? Math.round((successCount / filtered.length) * 100) : 100,
  };
}

/** Get raw audit entries */
export function getAuditLog(count?: number): SimulationAuditEntry[] {
  return count ? auditLog.slice(-count) : [...auditLog];
}

/** Get entries by type */
export function getAuditByType(type: SimulationType): SimulationAuditEntry[] {
  return auditLog.filter(e => e.type === type);
}

export function getSimulationTelemetryHealth() {
  const recent = auditLog.slice(-50);
  return {
    totalSimulations,
    totalIterations,
    auditLogSize: auditLog.length,
    recentSuccessRate: recent.length > 0
      ? Math.round((recent.filter(e => e.outcome.success).length / recent.length) * 100)
      : 100,
    avgComputeTimeMs: recent.length > 0
      ? Math.round(recent.reduce((s, e) => s + e.computeTimeMs, 0) / recent.length * 100) / 100
      : 0,
  };
}

export function resetSimulationTelemetry(): void {
  auditLog.length = 0;
  totalSimulations = 0;
  totalIterations = 0;
}
