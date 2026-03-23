/**
 * Sandbox Telemetry Hub
 * 
 * Unified observability for all sandbox activity — per-sandbox metrics,
 * fleet-wide aggregates, escape rates, provisioning latency.
 * 
 * @module sandbox/ultimate/sandboxTelemetryHub
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export interface SandboxMetrics {
  sandboxId: string;
  cpuPct: number;
  memoryPct: number;
  ioOps: number;
  wallClockMs: number;
  capabilityCalls: number;
  timestamp: number;
}

export interface FleetAggregates {
  totalActiveSandboxes: number;
  avgCpuPct: number;
  avgMemoryPct: number;
  totalIoOps: number;
  escapeAttemptRate: number;
  provisioningLatencyP95Ms: number;
  resourceUtilizationEfficiency: number;
  experimentSuccessRate: number;
}

// ── State ──────────────────────────────────────────────────────

const metricsStore = new Map<string, SandboxMetrics[]>();
const provisioningLatencies: number[] = [];
const MAX_METRICS_PER_SANDBOX = 100;
const MAX_LATENCIES = 500;

// Counters
let totalEscapeAttempts = 0;
let totalSandboxesCreated = 0;
let experimentsCompleted = 0;
let experimentsSuccessful = 0;

// ── Core ───────────────────────────────────────────────────────

/** Record metrics for a sandbox */
export function recordMetrics(metrics: SandboxMetrics): void {
  const existing = metricsStore.get(metrics.sandboxId) ?? [];
  existing.push(metrics);
  if (existing.length > MAX_METRICS_PER_SANDBOX) existing.shift();
  metricsStore.set(metrics.sandboxId, existing);
}

/** Record provisioning latency */
export function recordProvisioningLatency(latencyMs: number): void {
  provisioningLatencies.push(latencyMs);
  if (provisioningLatencies.length > MAX_LATENCIES) provisioningLatencies.shift();
  totalSandboxesCreated++;
}

/** Record escape attempt (for fleet-wide rate) */
export function recordEscapeAttempt(): void {
  totalEscapeAttempts++;
}

/** Record experiment outcome */
export function recordExperimentOutcome(successful: boolean): void {
  experimentsCompleted++;
  if (successful) experimentsSuccessful++;
}

/** Get latest metrics for a sandbox */
export function getLatestMetrics(sandboxId: string): SandboxMetrics | undefined {
  const history = metricsStore.get(sandboxId);
  return history?.[history.length - 1];
}

/** Get metrics history for a sandbox */
export function getMetricsHistory(sandboxId: string): SandboxMetrics[] {
  return metricsStore.get(sandboxId) ?? [];
}

/** Compute fleet-wide aggregates */
export function getFleetAggregates(): FleetAggregates {
  const latestMetrics: SandboxMetrics[] = [];
  for (const history of metricsStore.values()) {
    if (history.length > 0) latestMetrics.push(history[history.length - 1]);
  }

  const active = latestMetrics.length;
  const avgCpu = active > 0 ? latestMetrics.reduce((s, m) => s + m.cpuPct, 0) / active : 0;
  const avgMem = active > 0 ? latestMetrics.reduce((s, m) => s + m.memoryPct, 0) / active : 0;
  const totalIo = latestMetrics.reduce((s, m) => s + m.ioOps, 0);

  // Provisioning latency P95
  const sorted = [...provisioningLatencies].sort((a, b) => a - b);
  const p95Idx = Math.ceil(sorted.length * 0.95) - 1;
  const provP95 = sorted.length > 0 ? sorted[Math.max(0, p95Idx)] : 0;

  // Resource utilization efficiency (actual usage vs. what's allocated)
  const utilEfficiency = active > 0 ? Math.round((avgCpu + avgMem) / 2) : 0;

  // Experiment success rate
  const expRate = experimentsCompleted > 0 ? experimentsSuccessful / experimentsCompleted : 0;

  return {
    totalActiveSandboxes: active,
    avgCpuPct: Math.round(avgCpu * 10) / 10,
    avgMemoryPct: Math.round(avgMem * 10) / 10,
    totalIoOps: totalIo,
    escapeAttemptRate: totalSandboxesCreated > 0 ? totalEscapeAttempts / totalSandboxesCreated : 0,
    provisioningLatencyP95Ms: provP95,
    resourceUtilizationEfficiency: utilEfficiency,
    experimentSuccessRate: Math.round(expRate * 100),
  };
}

export function getTelemetryHubHealth() {
  return {
    trackedSandboxes: metricsStore.size,
    totalMetricPoints: Array.from(metricsStore.values()).reduce((s, h) => s + h.length, 0),
    provisioningLatencySamples: provisioningLatencies.length,
    totalEscapeAttempts,
    totalSandboxesCreated,
  };
}

export function resetTelemetryHub(): void {
  metricsStore.clear();
  provisioningLatencies.length = 0;
  totalEscapeAttempts = 0;
  totalSandboxesCreated = 0;
  experimentsCompleted = 0;
  experimentsSuccessful = 0;
}
