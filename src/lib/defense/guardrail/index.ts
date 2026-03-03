/**
 * DEFENSE Guardrail Layer — Barrel Export
 * 
 * Prevents automatic self-locking, runaway threshold escalation,
 * and anomaly-triggered instability.
 * 
 * Phase 1: Proposal Gate (no direct auto-enforcement)
 * Phase 2: Threshold Clamping System
 * Phase 3: Traffic Spike Protection
 * Phase 4: Shadow Mode Validation
 * Phase 5: Immunity Learning Sandbox
 * Phase 6: Observability (integrated via logger.ts)
 */

// Types
export type {
  ProposalStatus,
  ProposalCategory,
  ProposedAdjustment,
  ShadowMetrics,
  PromotionGateResult,
  GuardrailLogEntry,
} from './types';

// Proposal Store
export {
  createProposal,
  checkPromotionGate,
  transitionProposal,
  getProposals,
  getProposal,
  getProposalStats,
  setEvaluationWindow,
  clearProposals,
  setSpikeActive,
  isSpikeActive,
} from './proposal-store';

// Threshold Clamping
export {
  clamp,
  enforceDeltaCap,
  registerThreshold,
  requestThresholdAdjustment,
  getThresholdState,
  listThresholds,
  clearThresholds,
  type ThresholdBounds,
  type ThresholdConfig,
  type ThresholdState,
  type ClampResult,
  type DeltaCapResult,
} from './threshold-clamp';

// Structured Logger
export {
  guardrailLog,
  getGuardrailLogs,
  clearGuardrailLogs,
} from './logger';

// Spike Detector (Phase 3)
export {
  recordTrafficEvent,
  isSpikeActive as isSpikeDetected,
  isConservativeMode,
  getSpikeState,
  configureSpikeDetector,
  clearSpikeState,
  type SpikeConfig,
} from './spike-detector';

// Shadow Mode Validation (Phase 4)
export {
  startShadowTest,
  recordShadowResult,
  evaluateShadowSession,
  finalizeShadowSession,
  updateBaseline,
  saveConfigSnapshot,
  getLastStableSnapshot,
  checkRollbackCondition,
  configureShadowMode,
  getActiveShadowSessions,
  clearShadowState,
  type ShadowConfig,
} from './shadow-validator';

// Immunity Learning Sandbox (Phase 5)
export {
  submitToSandbox,
  recordEvidence,
  markPromoted,
  getSandboxEntry,
  listSandboxEntries,
  getSandboxStats,
  configureSandbox,
  clearSandbox,
  type SandboxConfig,
  type SandboxEntry,
  type SandboxEvidence,
} from './learning-sandbox';
