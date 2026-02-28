/**
 * CONTROL PLANE — Architecture Boundary
 * 
 * The Control Plane is a first-class layer containing:
 *   INTEL    — Aggregation + explanation (Founder-only outputs)
 *   ENGINEER — Internal maintenance node (no user UI)
 *   DECODE   — Conversational service (feeds INTEL/ENGINEER)
 *   AUDIT    — Compliance trail service (feeds INTEL/ENGINEER)
 *   NEXUS-CLM BRIDGE — Routes CLM cycles through NEXUS router
 * 
 * Single "disable control plane" toggle gates all CP behavior.
 */

export * from './types';
export { intelAggregator } from './intel/aggregator';
export { engineerNode } from './engineer/maintenance';
export { clmTopicPipeline } from './clm/topic-pipeline';
export { nexusCLMBridge } from './intel/nexus-clm-bridge';
export { getControlPlaneConfig, setControlPlaneConfig, isControlPlaneEnabled } from './config';
export { rehydrateControlPlane } from './rehydrate';
export {
  getPersistenceDimension,
  getClusterSafetyDimension,
  getAtomicityDimension,
  getReplayabilityDimension,
} from './persistence-health';
export {
  saveFlags, saveConfig, saveCanaries, saveRetryBudgets,
  saveMetricsSnapshot, saveCascadeHistory, saveIdempotencyStore,
  saveSchemas, saveQueueState, saveChaosRules, flushAll,
  forceCommitNow, getPersistenceHealth, getLastRevisionId,
  getLastSnapshotHash, isDegradedMode, resetDegradedMode,
} from './persistence';
export { startPersistenceScheduler, stopPersistenceScheduler, isLeader } from './persistence-scheduler';
export { getInstanceId, getEnv, getTenantId } from './identity';
export { appendWalEvent, drainWalEvents, getWalStats, clearWalBuffer } from './wal';
export { canonicalizeJson, sha256, computeSnapshotHash } from './hash';
export { retryWithBackoff } from './retry';
export { listRevisions, restoreToRevision, verifySnapshotHash, getWalForRevision, getWalRange } from './restore';
