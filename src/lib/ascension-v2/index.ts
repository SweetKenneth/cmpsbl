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
