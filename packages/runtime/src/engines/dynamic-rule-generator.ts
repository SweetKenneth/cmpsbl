/**
 * CMPSBL® CORTEX Phase 6 — Dynamic Rule Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Auto-generates orchestration rules from runtime telemetry.
 *
 * When the Analysis Engine detects anomalies, this module decides
 * whether to auto-register protective rules on CORTEX — closing
 * the feedback loop from observation → enforcement.
 *
 * Rule generation policies:
 *   1. Frequency-based: if a primitive triggers N anomalies in window T,
 *      auto-register a `tighten_interception` rule.
 *   2. Severity-based: if anomaly deviation exceeds 5σ,
 *      auto-register a `trip_execution` rule immediately.
 *   3. Cooldown: auto-rules are not re-generated within a decay window.
 *
 * Constraints:
 *   - No async — purely synchronous analysis
 *   - No external dependencies
 *   - Deterministic — same inputs produce same rules
 *   - All auto-rules use prefix `cortex-auto-` for identification
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  registerOrchestrationRule,
  getOrchestrationRules,
  type OrchestrationRule,
} from './orchestration-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface DynamicRuleConfig {
  /** Anomaly count within window to trigger tighten_interception */
  readonly frequencyThreshold: number;
  /** Window duration (ms) for frequency counting */
  readonly frequencyWindowMs: number;
  /** Deviation threshold (σ) for immediate trip_execution */
  readonly severityThreshold: number;
  /** Cooldown (ms) before an auto-rule can be re-generated for the same primitive */
  readonly ruleDecayMs: number;
  /** Maximum total auto-generated rules allowed */
  readonly maxAutoRules: number;
}

const DEFAULT_CONFIG: DynamicRuleConfig = {
  frequencyThreshold: 3,
  frequencyWindowMs: 60_000,
  severityThreshold: 5.0,
  ruleDecayMs: 300_000,
  maxAutoRules: 50,
};

let config: DynamicRuleConfig = { ...DEFAULT_CONFIG };

export function configureDynamicRules(overrides: Partial<DynamicRuleConfig>): void {
  config = { ...config, ...overrides };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — ANOMALY TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

interface AnomalyRecord {
  readonly primitive: string;
  readonly deviation: number;
  readonly timestamp: number;
}

const anomalyLog: AnomalyRecord[] = [];
const autoRuleTimestamps = new Map<string, number>();
const MAX_LOG_SIZE = 1000;

/** Record an anomaly and evaluate whether to generate a rule */
export function recordAnomaly(
  primitive: string,
  deviation: number,
): GeneratedRuleResult | null {
  const now = Date.now();

  // Append to log (capped)
  if (anomalyLog.length >= MAX_LOG_SIZE) {
    anomalyLog.shift();
  }
  anomalyLog.push({ primitive, deviation, timestamp: now });

  // Check cooldown — skip if auto-rule was recently generated
  const lastGenerated = autoRuleTimestamps.get(primitive);
  if (lastGenerated != null && now - lastGenerated < config.ruleDecayMs) {
    return null;
  }

  // Check max auto-rule cap
  const existingAutoRules = getOrchestrationRules().filter(
    r => r.id.startsWith('cortex-auto-'),
  );
  if (existingAutoRules.length >= config.maxAutoRules) {
    return null;
  }

  // Severity check — immediate trip
  if (deviation >= config.severityThreshold) {
    return generateTripRule(primitive, deviation, now);
  }

  // Frequency check — count anomalies in window
  const windowStart = now - config.frequencyWindowMs;
  const recentCount = anomalyLog.filter(
    r => r.primitive === primitive && r.timestamp >= windowStart,
  ).length;

  if (recentCount >= config.frequencyThreshold) {
    return generateTightenRule(primitive, recentCount, now);
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — RULE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface GeneratedRuleResult {
  readonly ruleId: string;
  readonly primitive: string;
  readonly reason: string;
  readonly action: 'tighten_interception' | 'trip_execution';
  readonly generatedAt: number;
}

function generateTightenRule(
  primitive: string,
  anomalyCount: number,
  now: number,
): GeneratedRuleResult {
  const ruleId = `cortex-auto-tighten-${primitive.toLowerCase()}`;

  // Skip if already exists
  const exists = getOrchestrationRules().some(r => r.id === ruleId);
  if (!exists) {
    const rule: OrchestrationRule = {
      id: ruleId,
      priority: 800,
      signal: 'anomaly_detected',
      test: (payload: unknown) => {
        if (typeof payload !== 'object' || payload === null) return true;
        return true;
      },
      action: 'tighten_interception',
    };
    registerOrchestrationRule(rule);
  }

  autoRuleTimestamps.set(primitive, now);

  return {
    ruleId,
    primitive,
    reason: `${anomalyCount} anomalies in ${config.frequencyWindowMs / 1000}s window`,
    action: 'tighten_interception',
    generatedAt: now,
  };
}

function generateTripRule(
  primitive: string,
  deviation: number,
  now: number,
): GeneratedRuleResult {
  const ruleId = `cortex-auto-trip-${primitive.toLowerCase()}`;

  const exists = getOrchestrationRules().some(r => r.id === ruleId);
  if (!exists) {
    const rule: OrchestrationRule = {
      id: ruleId,
      priority: 900,
      signal: 'anomaly_detected',
      test: () => true,
      action: 'trip_execution',
    };
    registerOrchestrationRule(rule);
  }

  autoRuleTimestamps.set(primitive, now);

  return {
    ruleId,
    primitive,
    reason: `Deviation ${deviation.toFixed(1)}σ exceeds severity threshold ${config.severityThreshold}σ`,
    action: 'trip_execution',
    generatedAt: now,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all auto-generated rule IDs currently active */
export function getAutoGeneratedRuleIds(): readonly string[] {
  return getOrchestrationRules()
    .filter(r => r.id.startsWith('cortex-auto-'))
    .map(r => r.id);
}

/** Get anomaly log snapshot */
export function getAnomalyLog(): readonly AnomalyRecord[] {
  return [...anomalyLog];
}

/** Get count of auto-generated rules */
export function getAutoRuleCount(): number {
  return getOrchestrationRules().filter(r => r.id.startsWith('cortex-auto-')).length;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — RESET
// ═══════════════════════════════════════════════════════════════════════════════

export function resetDynamicRuleGenerator(): void {
  anomalyLog.length = 0;
  autoRuleTimestamps.clear();
  config = { ...DEFAULT_CONFIG };
}
