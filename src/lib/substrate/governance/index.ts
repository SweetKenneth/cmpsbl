/**
 * Governance Module — Unified Exports
 * v10.5.3 ARCHITECT Epoch
 * 
 * Epistemic discipline, veto authority, and signal arbitration
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
