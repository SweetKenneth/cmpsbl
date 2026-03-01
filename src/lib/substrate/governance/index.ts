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

// Governance Hardening v2.0.0 — "Arbiter" (25 Enterprise Upgrades)
export {
  GOVERNANCE_HARDENING_VERSION,
  GOVERNANCE_HARDENING_CODENAME,
  GOVERNANCE_HARDENING_UPGRADES,
  getGovernanceHardeningStatus,
  // #1 Policy Version Control
  createPolicyVersion,
  getPolicyVersion,
  getPolicyHistory,
  // #2 Quorum Consensus
  createQuorum,
  submitQuorumVote,
  getQuorumStatus,
  getPendingQuorums as getHardenedPendingQuorums,
  // #3 Decision Audit Chain
  recordDecision,
  verifyDecisionChain,
  getDecisionChain,
  // #4 Separation of Duties
  checkDutySeparation,
  // #5 Policy Conflict Resolver
  detectPolicyConflicts,
  // #6 Escalation Ladder
  initiateEscalation,
  checkEscalationPromotion,
  getEscalationTiers,
  // #7 Session Manager
  openGovernanceSession,
  addSessionDecision,
  closeGovernanceSession,
  getActiveSessions,
  // #8 Rule Priority Engine
  evaluateRules,
  // #9 Consent Verification
  requireConsent,
  grantConsent,
  isConsentComplete,
  // #10 Governance Replay
  replayDecisions,
  replayByAuthority,
  replayByAction,
  // #11 Policy Simulation
  simulatePolicy,
  // #12 Delegation Chain
  createDelegation,
  resolveDelegation,
  // #13 Governance Cooldown
  enforceCooldown,
  getCooldownStatus,
  // #14 Decision Entropy Monitor
  measureDecisionEntropy,
  // #15 Policy Expiry Manager
  setPolicyExpiry,
  getExpiredPolicies,
  getExpiringPolicies,
  // #16 Governance Checkpoint
  createGovernanceCheckpoint,
  getCheckpoints,
  // #17 Cross-Module Policy Gate
  enforcePolicy,
  // #18 Governance Rate Limiter
  tryGovernanceAction,
  // #19 Decision Impact Scorer
  assessImpact,
  // #20 Governance Health Composite
  calculateGovernanceHealth,
  // #21 Policy Lineage Tracker
  tracePolicyLineage,
  // #22 Governance Anomaly Detector
  detectGovernanceAnomalies,
  // #23 Emergency Override Protocol
  issueEmergencyOverride,
  revokeEmergencyOverride,
  getActiveOverrides,
  isModuleOverridden,
  // #24 Governance Telemetry Emitter
  getGovernanceTelemetry,
  getGovernanceTelemetryByType,
  flushGovernanceTelemetry,
  // #25 Governance Integrity Seal
  sealGovernanceIntegrity,
  // Types
  type PolicySnapshot,
  type PolicyRule,
  type QuorumRequest,
  type DecisionRecord,
  type GovernanceSession,
  type DelegationEntry,
  type GovernanceCheckpoint,
  type EmergencyOverride,
  type GovernanceTelemetryEvent,
  type GovernanceHealthReport,
  type PolicyConflict,
  type ImpactAssessment,
} from './governance-hardening';
