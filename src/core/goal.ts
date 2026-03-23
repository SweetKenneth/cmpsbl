/**
 * GOAL — Bootstrap
 * Initializes the Global Observability Access Layer.
 * Registers all module adapters and starts the snapshot engine.
 * CORE Ultimate Form v1.0.0
 */

import { registerModuleAdapter } from './metrics/metricsRegistry';
import { startSnapshotEngine } from './metrics/snapshotEngine';
import { registerDefaultStages, executeBoot } from './boot/bootSequencer';
import { startHeartbeatEngine } from './lifecycle/heartbeatEngine';
import { markBootTime } from './diagnostics/runtimeDiagnostics';

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
let stopHeartbeat: (() => void) | null = null;

/**
 * Initialize the Global Observability Access Layer (GOAL).
 * Call once at app boot. Returns a teardown function.
 */
export function initializeGOAL(): () => void {
  markBootTime();

  // Register all module adapters (13 modules)
  const adapters = [
    defenseAdapter, nexusAdapter, rippleAdapter, memoryAdapter,
    accessAdapter, visionAdapter, shadowmeshAdapter,
    brainAdapter, cortexAdapter, economyAdapter,
    encodeAdapter, integrationAdapter, systemAdapter,
  ];
  adapters.forEach(registerModuleAdapter);

  // Register default boot stages and execute boot sequence
  registerDefaultStages();
  executeBoot().catch(console.error);

  // Start snapshot engine (captures every 10 minutes)
  stopSnapshot = startSnapshotEngine();

  // Start heartbeat engine (probes every 30 seconds)
  stopHeartbeat = startHeartbeatEngine();

  console.log(`[GOAL] CORE Ultimate Form initialized — ${adapters.length} adapters, boot sequencer + heartbeat + snapshot active`);

  return () => {
    if (stopSnapshot) { stopSnapshot(); stopSnapshot = null; }
    if (stopHeartbeat) { stopHeartbeat(); stopHeartbeat = null; }
    console.log('[GOAL] Shutdown complete');
  };
}

// Re-export key interfaces — Metrics & Snapshots
export { getAllLiveMetrics, flattenAllMetrics, validateAll, getRegisteredModuleIds } from './metrics/metricsRegistry';
export { capture, getLatestSnapshot, computeDelta, getTrend, getModuleContributions, getSnapshotStats } from './metrics/snapshotEngine';
export { runIntegrityCheck, shouldBlockDecodeForModule } from './metrics/integrityValidator';

// Re-export — Decode
export { queryMetricsForDecode, setDecodeMode, getDecodeMode, formatDecodeResponse } from './decode/decodeAccessPolicy';

// Re-export — Events
export { appendEvent, queryEvents, getRecentEvents, getEventDistribution } from './events/eventStore';

// Re-export — Boot Sequencer
export { executeBoot, getBootManifest, registerBootStage, getRegisteredStages } from './boot/bootSequencer';
export type { BootManifest, BootStage, StageResult } from './boot/bootSequencer';

// Re-export — Lifecycle
export { registerModule, transition, updateHealth, getModuleState, getAllModuleStates, getModulesByState, getSystemSummary, onTransition } from './lifecycle/lifecycleManager';
export type { LifecycleState, LifecycleEntry } from './lifecycle/lifecycleManager';

// Re-export — Heartbeat
export { registerHeartbeatProbe, getHeartbeatRecords, getHeartbeat, getUnhealthyModules } from './lifecycle/heartbeatEngine';
export type { HeartbeatRecord } from './lifecycle/heartbeatEngine';

// Re-export — Capability Registry
export { registerCapability, lookupCapability, getModuleCapabilities, findCapabilities, verifyCapabilityIntegrity, getSystemCapabilityHash, getAllCapabilities } from './registry/capabilityRegistry';
export type { Capability, CapabilityLookupResult } from './registry/capabilityRegistry';

// Re-export — Runtime Mode
export { evaluateMode, getCurrentMode, getRuntimeState, onModeChange, forceMode } from './runtime/runtimeModeController';
export type { RuntimeMode, RuntimeModeState, ModeTransition } from './runtime/runtimeModeController';

// Re-export — Clockless Epoch
export { tick, compareEpochs, happensBefore, getCurrentEpoch, getModuleVectorClock, getVectorClockSnapshot, getRecentEpochs } from './clock/clocklessEpoch';
export type { LogicalTimestamp, EpochEntry } from './clock/clocklessEpoch';

// Re-export — Dependency Graph
export { buildDependencyGraph, getBootOrder, getShutdownOrder, getImpactAnalysis } from './graph/dependencyGraph';
export type { DependencyGraph, GraphNode } from './graph/dependencyGraph';

// Re-export — Circuit Breakers
export { registerBreaker, recordFailure, recordSuccess, isAllowed, getBreakerState, getAllBreakers, getOpenBreakers, forceReset, onBreakerChange } from './resilience/circuitBreakerRegistry';
export type { CircuitBreaker, BreakerState, BreakerConfig } from './resilience/circuitBreakerRegistry';

// Re-export — Diagnostics
export { runDiagnostics, quickHealthCheck } from './diagnostics/runtimeDiagnostics';
export type { DiagnosticReport } from './diagnostics/runtimeDiagnostics';

// Re-export — Event Backbone
export { subscribe, emit, broadcast, getDeadLetterQueue, getBusStats, getChannels } from './bus/eventBackbone';
export type { BusEvent, EventPriority, DeadLetterEntry } from './bus/eventBackbone';

// Re-export — Schema types
export type { NumericMetric, MetricUnit, ModuleLiveMetrics, ModuleAdapter } from './metrics/metricsSchema';
export type { MetricSnapshot, SnapshotDelta, TrendPoint } from './metrics/snapshotEngine';
export type { IntegrityReport, IntegrityDiscrepancy } from './metrics/integrityValidator';
export type { SystemEvent, EventType } from './events/eventStore';
export type { DecodeMode, DecodeMetricsResponse } from './decode/decodeAccessPolicy';
