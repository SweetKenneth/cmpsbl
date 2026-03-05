/**
 * Matrix Infrastructure Layer — Unified Exports
 * 
 * Provides the runtime infrastructure described in internal architecture docs:
 * - Matrix Node Registry (mutable runtime source of truth)
 * - Matrix Communication Bus (topology-aware node signaling)
 * - Control Planes (governance, execution, memory, routing)
 * - Mutation Pipeline (shadow-first execution discipline)
 * - Receipt Chain (immutable tamper-evident ledger)
 * - Readiness Index (pre-execution fitness assessment)
 * - Dual Executor (two-man rule for critical mutations)
 * - Entropy Tracker (system complexity measurement)
 */

// Registry
export {
  getNodeState,
  getAllNodeStates,
  getNodeStatesBySector,
  setNodeHealth,
  setNodeBreaker,
  heartbeat,
  recordOp,
  getMatrixIntegrity,
  takeSnapshot,
  getSnapshots,
  areDependenciesHealthy,
  onRegistryEvent,
  type RuntimeNodeState,
  type RegistryEvent,
  type MatrixSnapshot,
} from './registry';

// Communication Bus
export {
  sectorBroadcast,
  nodeSignal,
  matrixBroadcast,
  matrixSubscribe,
  matrixUnsubscribe,
  requestSectorHealth,
  getConnectivityMap,
  MATRIX_SIGNALS,
} from './communication-bus';

// Control Planes
export {
  getPlaneState,
  getAllPlaneStates,
  nodeOwnsPlane,
  recordPlaneOp,
  setPlaneStatus,
  governanceCheck,
  getActivePolicies,
  type ControlPlaneId,
  type ControlPlaneState,
  type PlanePolicy,
} from './control-planes';

// Mutation Pipeline
export {
  triggerMutation,
  analyzeMutation,
  shadowRun,
  evaluateMutation,
  promoteMutation,
  rollbackMutation,
  getActiveMutations,
  getCompletedMutations,
  getMutation,
  type MutationProposal,
  type MutationPhase,
  type MutationChange,
  type ShadowRunResult,
} from './mutation-pipeline';

// Receipt Chain
export {
  appendReceipt,
  verifyChain,
  getReceipts,
  getReceiptByMutationId,
  getHeadHash,
  getChainLength,
  type MutationReceipt,
  type ChainIntegrity,
} from './receipt-chain';

// Readiness Index
export {
  computeReadiness,
  type ReadinessReport,
  type ReadinessFactor,
} from './readiness-index';

// Dual Executor
export {
  verifyDual,
  type DualExecutorResult,
  type ExecutorVerdict,
} from './dual-executor';

// Entropy Tracker
export {
  trackEntropy,
  getEntropyHistory,
  getCurrentEntropy,
  getEntropyTrend,
  type EntropySnapshot,
  type EntropyComponent,
} from './entropy-tracker';
