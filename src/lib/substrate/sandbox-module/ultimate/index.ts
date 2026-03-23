/**
 * SANDBOX Ultimate — "Terrarium" v9.0.0
 * 
 * The substrate's Sovereign Execution Realm — secure, instrumented universe
 * for untrusted code, experiments, and builder workloads.
 * 
 * @module sandbox/ultimate
 * @version 9.0.0 — Terrarium
 */

// System 1: Isolation Boundary Engine
export {
  createNamespace, checkCapability, checkSyscall, checkStackDepth,
  getNamespace, getViolations, getIsolationHealth, resetIsolation,
  type IsolationNamespace, type BoundaryViolation,
} from './isolationBoundaryEngine';

// System 2: Resource Metering & Quotas
export {
  allocateQuota, recordConsumption, getUsage, getQuota,
  getCostAttribution, getMeteringHealth, resetMetering,
  type ResourceQuota, type ResourceUsage,
} from './resourceMetering';

// System 3: Execution Timeline Recorder
export {
  recordEvent as recordTimelineEvent, createCheckpoint, getTimelineSlice,
  diffCheckpoints, getTimeline, getCheckpoints,
  getTimelineHealth, resetTimeline,
  type TimelineEvent, type Checkpoint, type TimelineDiff,
} from './executionTimelineRecorder';

// System 4: Escape Detection & Containment
export {
  reportEscapeAttempt, freezeSandbox, isFrozen, unfreeze,
  attachForensicSnapshot, getEscapeAttempts, getContainmentActions,
  getEscapeDetectionHealth, resetEscapeDetection,
  type EscapeAttempt, type EscapeAttemptType, type ContainmentAction,
} from './escapeDetection';

// System 5: Network Policy Controller
export {
  setPolicy, evaluateRequest, recordResponse as recordNetworkResponse,
  getTrafficLog, getPolicy, getNetworkHealth, resetNetworkPolicy,
  type NetworkPolicy, type NetworkRequest,
} from './networkPolicyController';

// System 6: Experiment Orchestrator
export {
  createExperiment, advancePhase, recordMetric, checkSignificance,
  promoteVariant, getExperiment, getAllExperiments,
  getExperimentHealth, resetExperiments,
  type Experiment, type ExperimentVariant, type ExperimentPhase, type SignificanceResult,
} from './experimentOrchestrator';

// System 7: Builder Project Runtime
export {
  createProject, hotReload, useCapability, registerArtifact,
  suspendProject, resumeProject, terminateProject,
  getProject, getProjectsByBuilder,
  getBuilderRuntimeHealth, resetBuilderRuntime,
  type BuilderProject, type CapabilityToken,
} from './builderProjectRuntime';

// System 8: Forensic Snapshot Engine
export {
  captureSnapshot as captureForensicSnapshot, verifyChain,
  getSnapshots as getForensicSnapshots, getSnapshot as getForensicSnapshot,
  cleanExpired, getForensicHealth, resetForensics,
  type ForensicSnapshot,
} from './forensicSnapshotEngine';

// System 9: Sandbox Fleet Manager
export {
  warmPool_fill, provision, suspend as suspendSandbox,
  resume as resumeSandbox, terminate as terminateSandbox,
  runGC, configureFleet, getSandbox, getFleetHealth, resetFleetManager,
  type ManagedSandbox, type SandboxLifecycleState, type FleetConfig,
} from './sandboxFleetManager';

// System 10: Sandbox Telemetry Hub
export {
  recordMetrics, recordProvisioningLatency, recordEscapeAttempt as recordEscapeAttemptTelemetry,
  recordExperimentOutcome, getLatestMetrics, getMetricsHistory,
  getFleetAggregates, getTelemetryHubHealth, resetTelemetryHub,
  type SandboxMetrics, type FleetAggregates,
} from './sandboxTelemetryHub';

// ── Unified Health ─────────────────────────────────────────────

import { getIsolationHealth } from './isolationBoundaryEngine';
import { getMeteringHealth } from './resourceMetering';
import { getTimelineHealth } from './executionTimelineRecorder';
import { getEscapeDetectionHealth } from './escapeDetection';
import { getNetworkHealth } from './networkPolicyController';
import { getExperimentHealth } from './experimentOrchestrator';
import { getBuilderRuntimeHealth } from './builderProjectRuntime';
import { getForensicHealth } from './forensicSnapshotEngine';
import { getFleetHealth } from './sandboxFleetManager';
import { getTelemetryHubHealth } from './sandboxTelemetryHub';

export interface SandboxUltimateHealth {
  version: '9.0.0';
  codename: 'Terrarium';
  systems: {
    isolation: ReturnType<typeof getIsolationHealth>;
    metering: ReturnType<typeof getMeteringHealth>;
    timeline: ReturnType<typeof getTimelineHealth>;
    escapeDetection: ReturnType<typeof getEscapeDetectionHealth>;
    networkPolicy: ReturnType<typeof getNetworkHealth>;
    experiments: ReturnType<typeof getExperimentHealth>;
    builderRuntime: ReturnType<typeof getBuilderRuntimeHealth>;
    forensics: ReturnType<typeof getForensicHealth>;
    fleet: ReturnType<typeof getFleetHealth>;
    telemetry: ReturnType<typeof getTelemetryHubHealth>;
  };
  overallHealth: number;
}

/** Unified health assessment across all 10 SANDBOX systems */
export function getSandboxUltimateHealth(): SandboxUltimateHealth {
  const escape = getEscapeDetectionHealth();
  const metering = getMeteringHealth();
  const forensics = getForensicHealth();
  const fleet = getFleetHealth();

  // Composite: security (40%), resource health (30%), fleet utilization (30%)
  const securityScore = escape.totalAttempts > 0
    ? (escape.containedAttempts / escape.totalAttempts) * 100
    : 100;
  const resourceScore = metering.activeSandboxes > 0
    ? Math.max(0, 100 - (metering.exceededCount / metering.activeSandboxes) * 100)
    : 100;
  const fleetScore = 100 - fleet.fleetUtilization; // Lower utilization = more headroom

  const overallHealth = Math.round(
    (securityScore * 0.40) + (resourceScore * 0.30) + (Math.min(100, fleetScore + 50) * 0.30)
  );

  return {
    version: '9.0.0',
    codename: 'Terrarium',
    systems: {
      isolation: getIsolationHealth(),
      metering,
      timeline: getTimelineHealth(),
      escapeDetection: escape,
      networkPolicy: getNetworkHealth(),
      experiments: getExperimentHealth(),
      builderRuntime: getBuilderRuntimeHealth(),
      forensics,
      fleet,
      telemetry: getTelemetryHubHealth(),
    },
    overallHealth,
  };
}
