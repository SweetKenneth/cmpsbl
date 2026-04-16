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
// scoring, and contract engines to the V2 pipeline (Phase A: gaps 1-6).
export {
  // Confidence banding
  bandDiscovery,
  // Quality gate
  runV2QualityGate,
  // Scan integrity
  fingerprintSourceFiles,
  aggregateProfile,
  // Ingest audit
  logV2Upload,
  logV2Extraction,
  logV2QualityGate,
  logV2ChainParticipation,
  logV2Discovery,
  // Compatibility scoring
  scoreCollision,
  // Contract extraction
  extractFileContracts,
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
} from './v1-bridge';
