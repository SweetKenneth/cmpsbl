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
// Phase C (§12) re-exports V1's runtime "lockbox" — Primitive #41
// promotion + dual-layer execution binding + effect injection — so
// V2 reuses the working runtime instead of re-implementing it.
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
  // Phase C — runtime lockbox (§12)
  registerPrimaryHandler,
  hasPrimaryHandler,
  bindAndExecute,
  buildExecutableUnit,
  resolveExecutionStrategy,
  ensurePrimaryRegistered,
  detectPrimaryUnit,
  effectWrapper,
  applyEffectInjection,
  enrichExtractionWithEffects,
  generateEffectSummary,
  autoMapModuleName,
  generateDefaultChain,
  postProcessPrimitives,
  registerPrimitive,
  getPrimitive,
  listPrimitives,
  removePrimitive,
  getPrimitiveCount,
  beginIsolatedRegistryScope,
  runRuntimeForPrimitive,
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
  // Phase C — runtime types
  PrimaryHandlerResult,
  ExecutableUnit,
  ExecutionBindingResult,
  ExecutionStrategy,
  StrategyResolution,
  EffectInjectionResult,
  EffectExtractionMeta,
  EffectSummary,
  EffectStatus,
  EffectUIContract,
  PrimaryExecutionUnit,
  PrimitiveDefinition,
  PrimitiveHandler,
  IsolatedRegistryScope,
  RuntimeExecutionInput,
  RuntimeExecutionOutput,
} from './v1-bridge';

// Funnel telemetry — six events that prove the pipeline converts
export { emitFunnelEvent } from './funnel';
export type { FunnelEvent, FunnelEventPayload } from './funnel';

// Chain anchoring — writes the post-export head into audit_chain_anchors
export { anchorV2ExportHead } from './chain-anchor';

// Re-attach + Re-ascension session handoffs (Block 3 + Block 4)
export { setReattachLayers, consumeReattachLayers } from './reattach';
export {
  setReAscendPayload,
  consumeReAscendPayload,
  peekReAscendPayload,
} from './reascend';
export type { ReAscendPayload, ReAscendSourceFile } from './reascend';
