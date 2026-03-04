/**
 * CMPSBL® DECODE Module
 * Interpreter Primitive with Personality Profiles
 * + Cryptographic Identity Context
 * 
 * Part of the layered cognitive architecture
 */
export {
  personalityEngine,
  PersonalityEngineClient,
  PERSONALITY_PROFILES,
  type PersonalityProfile,
  type PersonalityConfig,
  type PersonalityState,
  type PersonalityDetectionResult,
  type DecodeInterpretation,
} from './personality-engine';

export {
  useDecodePersonality,
  type UseDecodePersonalityReturn,
} from './useDecodePersonality';

export {
  buildIdentityContext,
  getIdentityContext,
  clearIdentityContext,
  isReturningUser,
  type DecodeIdentityContext,
} from './identity-context';

export {
  CLOCKLESS_FULL_NAME,
  CLOCKLESS_SHORT,
  CLOCKLESS_CATEGORY,
  CLOCKLESS_SUBSTRATE,
  CLOCKLESS_TAGLINE,
  CLOCKLESS_DEFINITION,
  COGNITIVE_REALITY_DEFINITION,
  DECODE_SYSTEM_IDENTITY,
  ACCEPTABLE_TERMS,
  DEPRECATED_TERMS,
  TERM_REPLACEMENTS,
  ARCHITECTURE,
  sanitizeClocklessTerminology,
} from './clockless-identity';

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL ENGINEERING GUARD v1.0.0 — Re-exports
// ═══════════════════════════════════════════════════════════════════════════════

export {
  detectSocialEngineering,
  verifyAdminForDecode,
  requiresAdminAccess,
  generateSafeRefusal,
  clearEscalationTracking,
  getEscalationStats,
  type AttackPattern,
  type SocialEngineeringResult,
  type AdminVerification,
} from './social-engineering-guard';

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DIRECTIVE AUTHORITY v1.0.0 — Re-exports
// ═══════════════════════════════════════════════════════════════════════════════

export {
  issueDirective,
  acknowledgeDirective,
  getPendingDirectives,
  getDirectiveHistory,
  getSubstrateInsights,
  getSubstrateSummary,
  type AdminDirective,
  type DirectivePriority,
  type SubstrateInsight,
} from './admin-directive';

// ═══════════════════════════════════════════════════════════════════════════════
// HARDENING LAYER v2.0.0 ("Cipher") — Re-exports
// ═══════════════════════════════════════════════════════════════════════════════

export {
  DECODE_HARDENING_VERSION,
  DECODE_HARDENING_CODENAME,
  // 1. Input Sanitization
  sanitizeInput,
  // 2. Confidence Threshold
  evaluateConfidence, getConfidencePolicy,
  // 3. Intent Disambiguation
  disambiguateIntent,
  // 4. Session Continuity
  trackSessionTurn, getSessionContinuity,
  // 5. Personality Stability Guard
  checkPersonalityStability, recordPersonalitySwitch,
  // 6. Routing Audit Chain
  recordRoutingDecision, verifyRoutingChain, getRoutingAuditChain,
  // 7. Intent Rate Limiter
  checkIntentRateLimit,
  // 8. Context Window Budget
  initContextBudget, consumeContextBudget, getContextBudget,
  // 9. Identity Trust Ladder
  assessTrust,
  // 10. Language Detection
  detectLanguage,
  // 11. Circuit Breaker
  recordDecodeFailure, recordDecodeSuccess, checkDecodeCircuit, getDecodeCircuitState,
  // 12. Intent Fingerprinting
  fingerprintIntent,
  // 13. Telemetry
  recordInterpretationMetrics, recordBlockedInput, getDecodeTelemetry,
  // 14. PII Redaction
  redactSensitiveData,
  // 15. Intent Taxonomy
  classifyIntent,
  // 16. Request Coalescing
  coalesceRequest, resolveCoalescedRequest,
  // 17. Escalation Policy
  evaluateEscalation, getEscalationRules,
  // 18. Feature Flags
  isDecodeFeatureEnabled, getDecodeFeatureFlags,
  // 19. Conversation Replay
  captureConversationSnapshot, getConversationSnapshots,
  // 20. Terminology Enforcement
  enforceTerminology,
  // 21. Multi-Intent Splitter
  splitCompoundIntent,
  // 22. Warmup Validator
  checkDecodeReadiness,
  // 23. Input Complexity
  estimateInputComplexity,
  // 24. Turn Idempotency
  checkTurnIdempotency, recordProcessedTurn,
  // 25. Health Composite
  calculateDecodeHealth,
  // Types
  type SanitizationResult, type ConfidencePolicy, type DisambiguationResult,
  type SessionContinuity, type RoutingAuditEntry, type ContextBudget,
  type TrustLevel, type TrustAssessment, type LanguageDetection,
  type EscalationRule, type ConversationSnapshot, type ComplexityEstimate,
  type DecodeReadiness, type DecodeHealthReport, type IntentCategory, type SplitIntent,
} from './decode-hardening';
