/**
 * GOAL — Bootstrap
 * Initializes the Global Observability Access Layer.
 * Registers all module adapters and starts the snapshot engine.
 * vX.STRUCTURE.2
 */

import { registerModuleAdapter } from './metrics/metricsRegistry';
import { startSnapshotEngine } from './metrics/snapshotEngine';

// Module Adapters — 13 modules
import { defenseAdapter } from './metrics/moduleAdapters/defense.adapter';
import { nexusAdapter } from './metrics/moduleAdapters/nexus.adapter';
import { rippleAdapter } from './metrics/moduleAdapters/ripple.adapter';
import { memoryAdapter } from './metrics/moduleAdapters/memory.adapter';
import { accessAdapter } from './metrics/moduleAdapters/access.adapter';
import { visionAdapter } from './metrics/moduleAdapters/vision.adapter';
import { shadowmeshAdapter } from './metrics/moduleAdapters/shadowmesh.adapter';
import { brainAdapter } from './metrics/moduleAdapters/brain.adapter';
import { cortexAdapter } from './metrics/moduleAdapters/cortex.adapter';
import { economyAdapter } from './metrics/moduleAdapters/economy.adapter';
import { encodeAdapter } from './metrics/moduleAdapters/encode.adapter';
import { integrationAdapter } from './metrics/moduleAdapters/integration.adapter';
import { systemAdapter } from './metrics/moduleAdapters/system.adapter';

let stopSnapshot: (() => void) | null = null;

/**
 * Initialize the Global Observability Access Layer (GOAL).
 * Call once at app boot. Returns a teardown function.
 */
export function initializeGOAL(): () => void {
  // Register all module adapters (13 modules)
  const adapters = [
    defenseAdapter, nexusAdapter, rippleAdapter, memoryAdapter,
    accessAdapter, visionAdapter, shadowmeshAdapter,
    brainAdapter, cortexAdapter, economyAdapter,
    encodeAdapter, integrationAdapter, systemAdapter,
  ];
  adapters.forEach(registerModuleAdapter);

  // Start snapshot engine (captures every 10 minutes)
  stopSnapshot = startSnapshotEngine();

  console.log(`[GOAL] Global Observability Access Layer initialized — ${adapters.length} adapters, snapshot engine active`);

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
