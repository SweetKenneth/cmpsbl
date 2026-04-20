/**
 * Ascension V2 — Hardened Pipeline
 * U.S. Patent App. No. 64/029,678
 *
 * Unified export for the V2 pipeline modules.
 * Built alongside V1 — zero interference with /ascension.
 *
 * © CMPSBL® — All rights reserved.
 */

// Audit chain — Merkle-linked immutable event log
export {
  appendAudit,
  verifyChain,
  getChainState,
  getChainIntegrityHash,
  resetChain,
} from './audit-chain';
export type { AuditEntry, AuditChainState } from './audit-chain';

// Fingerprint gate — deterministic structural identity
export {
  computeFingerprint,
  computeMultiFileFingerprint,
  verifyFingerprint,
} from './fingerprint-gate';
export type { SourceFingerprint, FingerprintVerification } from './fingerprint-gate';

// Pre-Ascension Gate — hard-fails invalid source BEFORE the pipeline runs
export {
  runPreAscensionGate,
  formatGateError,
} from './pre-ascension-gate';
export type {
  GateError,
  GateErrorCode,
  GateResult,
} from './pre-ascension-gate';

// Orchestrator — immutable state machine
export {
  initRun,
  commitUpload,
  registerDiscovery,
  beginLocking,
  commitAscension,
  completeRun,
  failRun,
  getNodeOrdering,
  getSnapshot,
  retry,
  PreAscensionGateError,
} from './orchestrator';
export type { RunPhase, RunSnapshot, DiscoveredCapability, OrchestratorCallbacks } from './orchestrator';

// Deduplication — collapses raw discoveries to top 4–7 unique capabilities
export { deduplicateCapabilities } from './dedup';
export type { DedupResult } from './dedup';

// Pre-export harness — final gate before ZIP assembly
export { runPreExportHarness, formatHarnessVerdict } from './pre-export-harness';
export type {
  HarnessReport,
  HarnessCheck,
  HarnessSeverity,
  HarnessInput,
} from './pre-export-harness';

// V1 Bridge — exposes the canonical V1 quality, integrity, audit,
// scoring, contract, merge, learning, feedback, and drift engines
// to the V2 pipeline (Phase A: gaps 1-6, Phase B: gaps 7-11).
export {
  // Phase A — gaps 1-6
  bandDiscovery,
  runV2QualityGate,
  fingerprintSourceFiles,
  aggregateProfile,
  logV2Upload,
  logV2Extraction,
  logV2QualityGate,
  logV2ChainParticipation,
  logV2Discovery,
  scoreCollision,
  extractFileContracts,
  // Phase B — gaps 7-11
  simulateMergeBatch,
  measureDiscoveryDelta,
  recordCollisionOutcome,
  getCollisionLearning,
  recordV2Confirmation,
  getV2FeedbackVocabulary,
  getV2FeedbackStats,
  detectV2Drift,
} from './v1-bridge';
export type {
  ConfidenceBand,
  BandedDiscovery,
  V2QualityGateInput,
  V2QualityGateResult,
  SourceIntegrityReport,
  FileFingerprint,
  AggregatedProfile,
  CompatibilityReport,
  CandidateContractBundle,
  InterfaceContract,
  EnvironmentProfile,
  MergeSimulation,
  V2MergeBatchReport,
  DiscoverySetDelta,
  LearnedSignal,
  FeedbackStats,
  FeedbackExtraction,
  DriftDetection,
  V2DriftReport,
} from './v1-bridge';

// Funnel telemetry — six events that prove the pipeline converts
export { emitFunnelEvent } from './funnel';
export type { FunnelEvent, FunnelEventPayload } from './funnel';
