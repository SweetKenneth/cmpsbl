/**
 * CORE — Runtime Diagnostics Engine
 * Self-inspection: memory pressure, event queue depth,
 * adapter lag, boot timing — feeds GOAL dashboards.
 * Ultimate Form v1.0.0
 */

import { getSnapshotStats } from '../metrics/snapshotEngine';
import { getEventCount } from '../events/eventStore';
import { getRegisteredModuleIds } from '../metrics/metricsRegistry';
import { getCurrentEpoch } from '../clock/clocklessEpoch';
import { getTrippedCount } from '../resilience/circuitBreakerRegistry';
import { getBootManifest } from '../boot/bootSequencer';

export interface DiagnosticReport {
  timestamp: string;
  runtime: {
    uptimeMs: number;
    currentEpoch: number;
    registeredModules: number;
    trippedBreakers: number;
  };
  memory: {
    heapUsedMB: number | null;
    heapTotalMB: number | null;
    pressureLevel: 'low' | 'moderate' | 'high' | 'critical';
  };
  telemetry: {
    eventCount: number;
    snapshotCount: number;
    totalCaptures: number;
    avgHealthScore: number;
  };
  boot: {
    totalDurationMs: number;
    stagesCompleted: number;
    stagesTotal: number;
    success: boolean;
  };
  performance: {
    diagnosticDurationMs: number;
  };
}

let bootTimestamp: number = Date.now();

export function markBootTime(): void {
  bootTimestamp = Date.now();
}

/**
 * Run a full diagnostic report.
 */
export function runDiagnostics(): DiagnosticReport {
  const start = performance.now();

  // Memory estimation (browser-safe)
  let heapUsedMB: number | null = null;
  let heapTotalMB: number | null = null;
  let pressureLevel: DiagnosticReport['memory']['pressureLevel'] = 'low';

  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const mem = (performance as unknown as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    heapUsedMB = Math.round(mem.usedJSHeapSize / 1024 / 1024 * 100) / 100;
    heapTotalMB = Math.round(mem.totalJSHeapSize / 1024 / 1024 * 100) / 100;

    const ratio = heapUsedMB / heapTotalMB;
    if (ratio > 0.9) pressureLevel = 'critical';
    else if (ratio > 0.75) pressureLevel = 'high';
    else if (ratio > 0.5) pressureLevel = 'moderate';
  }

  // Snapshot stats
  const snapStats = getSnapshotStats();
  const eventCount = getEventCount();
  const moduleCount = getRegisteredModuleIds().length;
  const epoch = getCurrentEpoch();
  const trippedBreakers = getTrippedCount();

  // Boot info
  const manifest = getBootManifest();
  const bootInfo = manifest
    ? {
        totalDurationMs: manifest.totalDurationMs,
        stagesCompleted: manifest.stages.filter(s => s.status === 'ready').length,
        stagesTotal: manifest.stages.length,
        success: manifest.success,
      }
    : { totalDurationMs: 0, stagesCompleted: 0, stagesTotal: 0, success: false };

  return {
    timestamp: new Date().toISOString(),
    runtime: {
      uptimeMs: Date.now() - bootTimestamp,
      currentEpoch: epoch,
      registeredModules: moduleCount,
      trippedBreakers,
    },
    memory: { heapUsedMB, heapTotalMB, pressureLevel },
    telemetry: {
      eventCount,
      snapshotCount: snapStats.retainedSnapshots,
      totalCaptures: snapStats.totalCaptures,
      avgHealthScore: snapStats.avgHealthScore,
    },
    boot: bootInfo,
    performance: {
      diagnosticDurationMs: Math.round((performance.now() - start) * 100) / 100,
    },
  };
}

/**
 * Quick health check — returns a simple score 0-100.
 */
export function quickHealthCheck(): { score: number; status: string } {
  const report = runDiagnostics();

  let score = 100;

  // Penalize memory pressure
  if (report.memory.pressureLevel === 'critical') score -= 40;
  else if (report.memory.pressureLevel === 'high') score -= 20;
  else if (report.memory.pressureLevel === 'moderate') score -= 10;

  // Penalize tripped breakers
  score -= report.runtime.trippedBreakers * 10;

  // Penalize low health
  if (report.telemetry.avgHealthScore < 50) score -= 20;
  else if (report.telemetry.avgHealthScore < 70) score -= 10;

  // Penalize failed boot
  if (!report.boot.success && report.boot.stagesTotal > 0) score -= 15;

  score = Math.max(0, Math.min(100, score));
  const status = score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical';

  return { score, status };
}
