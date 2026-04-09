/**
 * PROMPT-SHIELD v1.0.0 — Type System
 * Cross-Vertical LLM Prompt Defense System
 *
 * Composed from:
 *   LLM Vertical:   VERITAS (hallucination), RAMPART (injection), SIEVE (output sanitization), GAUNTLET (adversarial testing)
 *   Cyber Vertical:  BASTION (zero-trust), WATCHTOWER (threat detection)
 *   Spine:           DEFENSE, GOVERNANCE, CONSCIENCE, COMPASS, AUDIT, BEACON
 *
 * Cross-vertical stress test: scanner must select from 3 pools simultaneously.
 * Dependency on Convex Core: ZERO
 */

// ── Enums & Literals ───────────────────────────────────────────────────

export type ThreatSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type ThreatCategory =
  | 'prompt_injection'
  | 'jailbreak_attempt'
  | 'data_exfiltration'
  | 'hallucination'
  | 'context_poisoning'
  | 'instruction_override'
  | 'encoding_attack'
  | 'social_engineering'
  | 'token_smuggling'
  | 'output_manipulation';

export type DefenseAction = 'block' | 'sanitize' | 'flag' | 'rewrite' | 'quarantine' | 'allow_monitored' | 'escalate';

export type AnalysisVerdict = 'clean' | 'suspicious' | 'malicious' | 'hallucinated' | 'uncertain';

export type ShieldRunStatus = 'scanning' | 'completed' | 'completed_with_threats' | 'failed' | 'circuit_broken';

export type GovernanceVerdict = 'approve' | 'deny' | 'review_required';

// ── Prompt Analysis Models ─────────────────────────────────────────────

export interface PromptInput {
  readonly id: string;
  readonly content: string;
  readonly role: 'system' | 'user' | 'assistant' | 'tool';
  readonly timestamp: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ConversationContext {
  readonly sessionId: string;
  readonly messages: readonly PromptInput[];
  readonly modelId: string;
  readonly systemPrompt?: string;
  readonly maxTokens?: number;
}

// ── Threat Detection ───────────────────────────────────────────────────

export interface DetectedThreat {
  readonly id: string;
  readonly category: ThreatCategory;
  readonly severity: ThreatSeverity;
  readonly confidence: number;          // 0–1, COMPASS-weighted
  readonly description: string;
  readonly evidence: string;            // The specific fragment that triggered
  readonly startIndex: number;
  readonly endIndex: number;
  readonly detectorId: string;          // Which engine detected it
  readonly mitreTechniqueId?: string;   // MITRE ATLAS mapping
}

export interface InjectionSignature {
  readonly id: string;
  readonly pattern: RegExp | string;
  readonly category: ThreatCategory;
  readonly severity: ThreatSeverity;
  readonly description: string;
  readonly bypassResistance: number;    // 0–1 how resistant to encoding bypass
  readonly falsePositiveRate: number;   // Historical FP rate
}

// ── Hallucination Detection ────────────────────────────────────────────

export interface HallucinationCheck {
  readonly claimId: string;
  readonly claim: string;
  readonly groundingScore: number;      // 0–1, VERITAS factual grounding
  readonly sources: readonly string[];
  readonly isHallucinated: boolean;
  readonly confidence: number;
}

export interface GroundingReport {
  readonly outputId: string;
  readonly totalClaims: number;
  readonly groundedClaims: number;
  readonly hallucinatedClaims: number;
  readonly uncertainClaims: number;
  readonly overallGroundingScore: number;
  readonly checks: readonly HallucinationCheck[];
}

// ── Output Sanitization ────────────────────────────────────────────────

export interface SanitizationResult {
  readonly originalOutput: string;
  readonly sanitizedOutput: string;
  readonly removedFragments: readonly SanitizedFragment[];
  readonly wasModified: boolean;
  readonly safetyScore: number;         // 0–100
}

export interface SanitizedFragment {
  readonly content: string;
  readonly reason: string;
  readonly category: ThreatCategory;
  readonly action: DefenseAction;
}

// ── Governance Gate ────────────────────────────────────────────────────

export interface GovernancePolicy {
  readonly maxSeverityAutoBlock: ThreatSeverity;
  readonly minConfidenceToBlock: number;
  readonly allowMonitoredCategories: ThreatCategory[];
  readonly requireReviewCategories: ThreatCategory[];
  readonly maxHallucinationRate: number;
  readonly enableAdversarialTesting: boolean;
}

export interface GovernanceDecision {
  readonly threatId: string;
  readonly verdict: GovernanceVerdict;
  readonly action: DefenseAction;
  readonly reason: string;
  readonly policyRef: string;
  readonly overrideApplied: boolean;
  readonly timestamp: string;
}

// ── Audit Trail ────────────────────────────────────────────────────────

export interface ShieldReceipt {
  readonly receiptId: string;
  readonly sessionId: string;
  readonly timestamp: string;
  readonly inputHash: string;
  readonly outputHash: string;
  readonly threatsDetected: number;
  readonly threatsBlocked: number;
  readonly hallucinationsFound: number;
  readonly governanceDecisions: number;
  readonly verdict: AnalysisVerdict;
  readonly processingMs: number;
  readonly prevReceiptHash: string;
  readonly receiptHash: string;
}

// ── Shield Run ─────────────────────────────────────────────────────────

export interface ShieldRunResult {
  readonly runId: string;
  readonly status: ShieldRunStatus;
  readonly context: ConversationContext;
  readonly threats: readonly DetectedThreat[];
  readonly groundingReport: GroundingReport | null;
  readonly sanitization: SanitizationResult | null;
  readonly governanceDecisions: readonly GovernanceDecision[];
  readonly receipt: ShieldReceipt;
  readonly metrics: ShieldMetrics;
}

export interface ShieldMetrics {
  readonly totalInputTokens: number;
  readonly totalOutputTokens: number;
  readonly scanDurationMs: number;
  readonly groundingDurationMs: number;
  readonly governanceDurationMs: number;
  readonly sanitizationDurationMs: number;
  readonly totalDurationMs: number;
  readonly threatDensity: number;       // threats per 1000 tokens
  readonly falsePositiveEstimate: number;
}

// ── Configuration ──────────────────────────────────────────────────────

export interface PromptShieldConfig {
  readonly enableInjectionDetection: boolean;
  readonly enableHallucinationDetection: boolean;
  readonly enableOutputSanitization: boolean;
  readonly enableAdversarialTesting: boolean;
  readonly governancePolicy: GovernancePolicy;
  readonly maxProcessingMs: number;
  readonly circuitBreakerThreshold: number;  // consecutive failures before trip
  readonly signatureUpdateInterval: number;  // ms between signature refresh
}
