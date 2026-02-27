/**
 * Governance Module — Unified Exports
 * 
 * Epistemic discipline, veto authority, signal arbitration,
 * transition validation, quorum, compliance, drift detection
 */

// Veto Authority & Precedence
export { vetoAuthority, type VetoRequest, type VetoResolution, type VetoAuthority, type VetoScope } from './veto-authority';

// Veto Scope Matrix
export { ALLOWED_SCOPES, SCOPE_MATRIX, DEFAULT_SCOPE, normalizeScope, isModuleAffected, getScopesForModule } from './veto-scope';

// Veto Lifecycle & Decay
export { vetoLifecycle, type VetoLifecycleEntry, type VetoLifecycleState, type EntropySnapshot } from './veto-lifecycle';

// Signal Arbitration
export { signalArbitration, type ModuleSignal, type ArbitrationResult, type SignalSeverity } from './signal-arbitration';

// Decode Response Policy (Epistemic Discipline)
export { enforceResponsePolicy, validateEpistemicIntegrity, tagClaim, stripTags, type ProvenanceTag, type PolicyResult, type PolicyViolation } from './decode-response-policy';

// Decode Voice Guardrails
export { applyVoiceGuardrails, needsGuardrails, voiceTaggedClaim, type VoiceGuardrailResult } from './decode-voice-guardrails';

// Transition Validator (v11.5.2) — Pure evaluation + quorum
export {
  evaluateTransition,
  commitTransition,
  getTransitionPath,
  requestTransition,
  approveTransition,
  finalizeTransition,
  getTransitionLog,
  getPendingApprovals,
  validateTransition, // legacy compat alias
  resetTransitionHistory,
  type TransitionValidation,
  type TransitionRequest,
} from './transition-validator';

// Veto ↔ Governance Bridge (v11.5.2) — Deterministic, DB-tracked
export { evaluateVetoEscalation, issueGovernanceVetoes, revokeGovernanceVetoes, onGovernanceModeChange, type VetoGovernanceEscalation } from './veto-governance-bridge';

// Compliance Auditor (v11.5.2) — No silent skips, DB-persisted
export { auditCompliance, runComplianceAudit, getComplianceTrend, getLastComplianceReport, getComplianceScoreAvg, type ComplianceViolation, type ComplianceReport } from './compliance-auditor';

// Governance Drift Detector (v11.5.2) — Fixed windows
export { analyzeDrift, recordMutation, recordEscalation, recordVetoEvent, recordActivation, tickWindow, resetDriftState, type DriftSignal, type DriftReport } from './governance-drift-detector';
