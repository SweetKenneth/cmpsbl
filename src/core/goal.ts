/**
 * GOAL — Bootstrap
 * Initializes the Global Observability Access Layer.
 * Registers all module adapters and starts the snapshot engine.
 * vX.STRUCTURE.2
 */

import { registerModuleAdapter } from './metrics/metricsRegistry';
import { startSnapshotEngine } from './metrics/snapshotEngine';

// Module Adapters
import { defenseAdapter } from './metrics/moduleAdapters/defense.adapter';
import { nexusAdapter } from './metrics/moduleAdapters/nexus.adapter';
import { rippleAdapter } from './metrics/moduleAdapters/ripple.adapter';
import { memoryAdapter } from './metrics/moduleAdapters/memory.adapter';
import { accessAdapter } from './metrics/moduleAdapters/access.adapter';
import { visionAdapter } from './metrics/moduleAdapters/vision.adapter';
import { shadowmeshAdapter } from './metrics/moduleAdapters/shadowmesh.adapter';

let stopSnapshot: (() => void) | null = null;

/**
 * Initialize the Global Observability Access Layer (GOAL).
 * Call once at app boot. Returns a teardown function.
 */
export function initializeGOAL(): () => void {
  // Register all module adapters
  registerModuleAdapter(defenseAdapter);
  registerModuleAdapter(nexusAdapter);
  registerModuleAdapter(rippleAdapter);
  registerModuleAdapter(memoryAdapter);
  registerModuleAdapter(accessAdapter);
  registerModuleAdapter(visionAdapter);
  registerModuleAdapter(shadowmeshAdapter);

  // Start snapshot engine (captures every 10 minutes)
  stopSnapshot = startSnapshotEngine();

  console.log('[GOAL] Global Observability Access Layer initialized — 7 adapters, snapshot engine active');

  return () => {
    if (stopSnapshot) {
      stopSnapshot();
      stopSnapshot = null;
    }
    console.log('[GOAL] Shutdown complete');
  };
}

// Re-export key interfaces
export { getAllLiveMetrics, flattenAllMetrics, validateAll, getRegisteredModuleIds } from './metrics/metricsRegistry';
export { capture, getLatestSnapshot, computeDelta, getTrend, getModuleContributions } from './metrics/snapshotEngine';
export { runIntegrityCheck, shouldBlockDecodeForModule } from './metrics/integrityValidator';
export { queryMetricsForDecode, setDecodeMode, getDecodeMode, formatDecodeResponse } from './decode/decodeAccessPolicy';
export { appendEvent, queryEvents, getRecentEvents, getEventDistribution } from './events/eventStore';
export type { NumericMetric, MetricUnit, ModuleLiveMetrics, ModuleAdapter } from './metrics/metricsSchema';
export type { MetricSnapshot, SnapshotDelta, TrendPoint } from './metrics/snapshotEngine';
export type { IntegrityReport, IntegrityDiscrepancy } from './metrics/integrityValidator';
export type { SystemEvent, EventType } from './events/eventStore';
export type { DecodeMode, DecodeMetricsResponse } from './decode/decodeAccessPolicy';
