/**
 * CMPSBL® Capability Lifecycle Module
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Public API surface for the capability lifecycle system.
 *
 * © CMPSBL® — All rights reserved.
 */

// Types
export type {
  CapabilityState,
  CapabilityLedgerEntry,
  CapabilityActivationLedger,
  LedgerSummary,
  DecomposedCJPI,
  ProvenanceVerification,
  BehavioralVerification,
  BehavioralProbe,
  BehavioralEffect,
  BehavioralEffectKind,
  ClaimLevel,
  PipelineStage,
} from './types';

export {
  CAPABILITY_STATE_ORDINAL,
  CJPI_COMPONENT_WEIGHTS,
  PIPELINE_STAGE_ORDER,
  STATE_TO_MAX_CLAIM,
  ALLOWED_CLAIM_PHRASES,
  FORBIDDEN_CLAIM_PATTERNS,
  SYSTEM_LIMITATIONS,
  meetsStateRequirement,
  computeDecomposedCJPI,
  validateClaim,
} from './types';

// Ledger Builder
export type {
  DetectionRecord,
  GenerationRecord,
  BindingRecord,
  ActivationRecord,
} from './ledger-builder';

export { buildLedger } from './ledger-builder';

// Behavioral Verifier
export type { ProbableArtifact, CapturedEffect } from './behavioral-verifier';
export {
  runBehavioralVerification,
  runStructuralOnlyProbes,
} from './behavioral-verifier';

// Constrained Reporter
export type { ConstrainedReport, CapabilitySummary } from './constrained-reporter';
export { generateConstrainedReport } from './constrained-reporter';
