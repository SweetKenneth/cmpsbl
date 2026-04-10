/**
 * PROMPT-SHIELD v1.0.0 — Orchestrator
 * Cross-Vertical LLM Prompt Defense System
 *
 * Pipeline: DETECT → GROUND → GOVERN → SANITIZE → RECEIPT
 *
 * Cross-Vertical Primitives Used:
 *   LLM:   VERITAS (grounding), RAMPART (injection), SIEVE (sanitization), GAUNTLET (testing)
 *   Cyber: BASTION (zero-trust), WATCHTOWER (threat detection)
 *   Spine: DEFENSE, GOVERNANCE, CONSCIENCE, COMPASS, AUDIT, BEACON
 *
 * Dependency on Convex Core: ZERO
 */

import type {
  ConversationContext,
  PromptShieldConfig,
  ShieldRunResult,
  ShieldRunStatus,
  ShieldMetrics,
  GovernancePolicy,
} from './types';
import { detectThreats, getSignatureCount } from './detector';
import { groundOutput } from './grounding';
import { evaluateThreats } from './governance-gate';
import { sanitizeOutput } from './sanitizer';
import { mintReceipt } from './receipts';

// ── Default Configuration ──────────────────────────────────────────────

const DEFAULT_POLICY: GovernancePolicy = {
  maxSeverityAutoBlock: 'high',
  minConfidenceToBlock: 0.7,
  allowMonitoredCategories: ['social_engineering'],
  requireReviewCategories: ['context_poisoning', 'output_manipulation'],
  maxHallucinationRate: 0.3,
  enableAdversarialTesting: false,
};

const DEFAULT_CONFIG: PromptShieldConfig = {
  enableInjectionDetection: true,
  enableHallucinationDetection: true,
  enableOutputSanitization: true,
  enableAdversarialTesting: false,
  governancePolicy: DEFAULT_POLICY,
  maxProcessingMs: 5000,
  circuitBreakerThreshold: 5,
  signatureUpdateInterval: 3600_000,
};

// ── Circuit Breaker (DEFENSE) ──────────────────────────────────────────

interface CircuitBreakerState {
  consecutiveFailures: number;
  isOpen: boolean;
  lastFailureAt: string | null;
  cooldownMs: number;
}

const circuitBreaker: CircuitBreakerState = {
  consecutiveFailures: 0,
  isOpen: false,
  lastFailureAt: null,
  cooldownMs: 30_000,
};

function checkCircuitBreaker(threshold: number): boolean {
  if (!circuitBreaker.isOpen) return true;

  // Check cooldown
  if (circuitBreaker.lastFailureAt) {
    const elapsed = Date.now() - new Date(circuitBreaker.lastFailureAt).getTime();
    if (elapsed > circuitBreaker.cooldownMs) {
      circuitBreaker.isOpen = false;
      circuitBreaker.consecutiveFailures = 0;
      return true;
    }
  }

  return false;
}

function recordSuccess(): void {
  circuitBreaker.consecutiveFailures = 0;
  circuitBreaker.isOpen = false;
}

function recordFailure(threshold: number): void {
  circuitBreaker.consecutiveFailures++;
  circuitBreaker.lastFailureAt = new Date().toISOString();
  if (circuitBreaker.consecutiveFailures >= threshold) {
    circuitBreaker.isOpen = true;
  }
}

// ── Shield Orchestrator ────────────────────────────────────────────────

export class PromptShield {
  private readonly config: PromptShieldConfig;

  constructor(config: Partial<PromptShieldConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run the full shield pipeline on a conversation context.
   * DETECT → GROUND → GOVERN → SANITIZE → RECEIPT
   */
  run(ctx: ConversationContext, outputText?: string): ShieldRunResult {
    const startTime = Date.now();

    // DEFENSE: Circuit breaker check
    if (!checkCircuitBreaker(this.config.circuitBreakerThreshold)) {
      const elapsed = Date.now() - startTime;
      return this.buildCircuitBrokenResult(ctx, elapsed);
    }

    try {
      // ── Stage 1: DETECT (RAMPART + WATCHTOWER + BASTION) ──
      const detectStart = Date.now();
      const threats = this.config.enableInjectionDetection
        ? detectThreats(ctx)
        : [];
      const detectMs = Date.now() - detectStart;

      // ── Stage 2: GROUND (VERITAS) ──
      const groundStart = Date.now();
      const groundingReport = (this.config.enableHallucinationDetection && outputText)
        ? groundOutput(`${ctx.sessionId}-output`, outputText)
        : null;
      const groundMs = Date.now() - groundStart;

      // ── Stage 3: GOVERN (GOVERNANCE + CONSCIENCE + COMPASS) ──
      const govStart = Date.now();
      const decisions = evaluateThreats(threats, groundingReport, this.config.governancePolicy);
      const govMs = Date.now() - govStart;

      // ── Stage 4: SANITIZE (SIEVE) ──
      const sanitizeStart = Date.now();
      const sanitization = (this.config.enableOutputSanitization && outputText)
        ? sanitizeOutput(outputText, threats, decisions)
        : null;
      const sanitizeMs = Date.now() - sanitizeStart;

      // ── Stage 5: RECEIPT (AUDIT + BEACON) ──
      const totalMs = Date.now() - startTime;
      const receipt = mintReceipt(ctx, threats, groundingReport, decisions, totalMs);

      recordSuccess();

      const status: ShieldRunStatus = threats.length === 0
        ? 'completed'
        : 'completed_with_threats';

      const totalTokens = ctx.messages.reduce((s, m) => s + m.content.split(/\s+/).length, 0);

      const metrics: ShieldMetrics = {
        totalInputTokens: totalTokens,
        totalOutputTokens: outputText?.split(/\s+/).length ?? 0,
        scanDurationMs: detectMs,
        groundingDurationMs: groundMs,
        governanceDurationMs: govMs,
        sanitizationDurationMs: sanitizeMs,
        totalDurationMs: totalMs,
        threatDensity: totalTokens > 0 ? (threats.length / totalTokens) * 1000 : 0,
        falsePositiveEstimate: threats.length > 0
          ? threats.reduce((s, t) => s + (1 - t.confidence), 0) / threats.length
          : 0,
      };

      return {
        runId: receipt.receiptId,
        status,
        context: ctx,
        threats,
        groundingReport,
        sanitization,
        governanceDecisions: decisions,
        receipt,
        metrics,
      };

    } catch (err) {
      recordFailure(this.config.circuitBreakerThreshold);
      const elapsed = Date.now() - startTime;
      return this.buildFailedResult(ctx, elapsed, err instanceof Error ? err.message : 'Unknown error');
    }
  }

  /** BEACON: Health signal */
  getHealth(): { healthy: boolean; circuitBreakerOpen: boolean; signatureCount: number } {
    return {
      healthy: !circuitBreaker.isOpen,
      circuitBreakerOpen: circuitBreaker.isOpen,
      signatureCount: getSignatureCount(),
    };
  }

  private buildCircuitBrokenResult(ctx: ConversationContext, processingMs: number): ShieldRunResult {
    return {
      runId: `psr-circuit-broken`,
      status: 'circuit_broken',
      context: ctx,
      threats: [],
      groundingReport: null,
      sanitization: null,
      governanceDecisions: [],
      receipt: mintReceipt(ctx, [], null, [], processingMs),
      metrics: this.emptyMetrics(processingMs),
    };
  }

  private buildFailedResult(ctx: ConversationContext, processingMs: number, _error: string): ShieldRunResult {
    return {
      runId: `psr-failed`,
      status: 'failed',
      context: ctx,
      threats: [],
      groundingReport: null,
      sanitization: null,
      governanceDecisions: [],
      receipt: mintReceipt(ctx, [], null, [], processingMs),
      metrics: this.emptyMetrics(processingMs),
    };
  }

  private emptyMetrics(totalMs: number): ShieldMetrics {
    return {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      scanDurationMs: 0,
      groundingDurationMs: 0,
      governanceDurationMs: 0,
      sanitizationDurationMs: 0,
      totalDurationMs: totalMs,
      threatDensity: 0,
      falsePositiveEstimate: 0,
    };
  }
}

// ── Lifecycle Bridge ───────────────────────────────────────────────────

/** Primitives exercised by Prompt-Shield (cross-vertical) */
const SHIELD_PRIMITIVES = [
  'DEFENSE', 'GOVERNANCE', 'CONSCIENCE', 'COMPASS', 'AUDIT', 'BEACON',
  'VERITAS', 'RAMPART', 'SIEVE', 'GAUNTLET', 'BASTION', 'WATCHTOWER',
] as const;

/**
 * Build a lifecycle summary for this product's report.
 * Proves which primitives are activated at runtime.
 */
export function getLifecycleSummary() {
  const { buildReporterLifecycleSummary } = require('@/lib/capability-lifecycle/export-bridge');
  return buildReporterLifecycleSummary('prompt-shield', SHIELD_PRIMITIVES);
}
