/**
 * Capability Auto-Activation Engine v2.0.0
 * 
 * The autonomic nervous system of the substrate. Listens for NERVE signals,
 * pattern-matches against the 100-rule Activation Registry, enforces guards
 * (governance, cooldowns, locks), then applies:
 *   — Activation Arbitration (priority scoring, conflict resolution, limits)
 *   — Confidence Gating (probabilistic firing with per-rule stats)
 * 
 * Flow:
 *   System Event/Signal
 *     → NERVE Signal Router (pattern match)
 *     → Activation Registry (trigger lookup)
 *     → Arbitration Layer (priority, conflicts, limits)
 *     → Confidence Gating (probabilistic threshold)
 *     → Guard Layer (governance / lock / cooldown)
 *     → Auto-Execute Capability
 *     → Stats Update (success/failure tracking)
 *     → Telemetry / Audit
 */

import {
  ACTIVATION_RULES,
  type ActivationTier,
  type CapabilityActivationRule,
} from './capabilityActivationRegistry';

import { arbitrate, type ArbitrationContext, type ArbitrationPlan } from './activationArbitrator';
import {
  computeConfidence,
  recordSuccess,
  recordFailure,
  resetStats,
  getAllStats as getConfidenceStats,
  type ConfidenceResult,
} from './confidenceGating';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ActivationOutcome = 'executed' | 'deferred' | 'blocked' | 'cooldown' | 'low_confidence' | 'suppressed' | 'error';

export interface ActivationEvent {
  ruleId: string;
  capabilityId: string;
  ownerNode: string;
  tier: ActivationTier;
  outcome: ActivationOutcome;
  reason?: string;
  triggeredAt: number;
  durationMs: number | null;
  payload: Record<string, unknown>;
  /** Confidence score that was computed (if applicable) */
  confidence?: number;
}

export interface EngineConfig {
  /** Master kill-switch */
  enabled: boolean;
  /** Global cooldown multiplier (1.0 = normal) */
  cooldownMultiplier: number;
  /** Max concurrent activations */
  maxConcurrent: number;
  /** Whether governance-blocked rules are logged */
  logBlockedActivations: boolean;
  /** Tier-level enable/disable */
  tierEnabled: Record<ActivationTier, boolean>;
  /** Enable arbitration layer (default true) */
  arbitrationEnabled: boolean;
  /** Enable confidence gating (default true) */
  confidenceGatingEnabled: boolean;
}

export interface EngineHealth {
  version: string;
  enabled: boolean;
  totalRules: number;
  enabledRules: number;
  totalActivations: number;
  activeActivations: number;
  recentEvents: ActivationEvent[];
  tierStats: Record<ActivationTier, { activations: number; blocked: number; errors: number; lowConfidence: number }>;
  arbitrationEnabled: boolean;
  confidenceGatingEnabled: boolean;
  confidenceStats: Record<string, { successCount: number; failureCount: number; totalExecutions: number }>;
}

// ═══════════════════════════════════════════════════════════════
// ENGINE STATE
// ═══════════════════════════════════════════════════════════════

const VERSION = '2.0.0';
const MAX_EVENT_LOG = 200;

let config: EngineConfig = {
  enabled: true,
  cooldownMultiplier: 1.0,
  maxConcurrent: 5,
  logBlockedActivations: true,
  tierEnabled: {
    T1_CRITICAL: true,
    T2_OPERATIONAL: true,
    T3_INTELLIGENCE: true,
    T4_OPTIMIZATION: true,
    T5_AUTONOMOUS: true,
  },
  arbitrationEnabled: true,
  confidenceGatingEnabled: true,
};

const lastActivatedAt = new Map<string, number>();
const activeCount = { value: 0 };
const eventLog: ActivationEvent[] = [];
const tierStats: Record<ActivationTier, { activations: number; blocked: number; errors: number; lowConfidence: number }> = {
  T1_CRITICAL: { activations: 0, blocked: 0, errors: 0, lowConfidence: 0 },
  T2_OPERATIONAL: { activations: 0, blocked: 0, errors: 0, lowConfidence: 0 },
  T3_INTELLIGENCE: { activations: 0, blocked: 0, errors: 0, lowConfidence: 0 },
  T4_OPTIMIZATION: { activations: 0, blocked: 0, errors: 0, lowConfidence: 0 },
  T5_AUTONOMOUS: { activations: 0, blocked: 0, errors: 0, lowConfidence: 0 },
};

/** Governance block list — rules blocked by GOVERNANCE node */
const governanceBlocks = new Set<string>();

/** Last arbitration plan for observability */
let lastArbitrationPlan: ArbitrationPlan | null = null;

// ═══════════════════════════════════════════════════════════════
// SIGNAL PROCESSING — The Core Loop (v2)
// ═══════════════════════════════════════════════════════════════

/**
 * Process an incoming signal against all activation rules.
 * This is the main entry point — called by the NERVE signal router.
 * 
 * v2 Flow:
 *   1. Pattern match against registry
 *   2. Arbitrate (priority, conflicts, limits)
 *   3. Confidence gate (probabilistic threshold)
 *   4. Guard layer (governance, cooldown, concurrency)
 *   5. Execute
 *   6. Track success/failure
 */
export function processSignal(
  sourceNode: string,
  signalType: string,
  severity: number,
  payload: Record<string, unknown>,
  executor?: (capabilityId: string, ownerNode: string, payload: Record<string, unknown>) => Promise<void>,
  /** Optional context for arbitration/confidence */
  systemContext?: { nodeHealth?: Record<string, number>; systemLoad?: number; errorRates?: Record<string, number> },
): ActivationEvent[] {
  if (!config.enabled) return [];

  const now = Date.now();
  const normalizedSource = sourceNode.toLowerCase();
  const events: ActivationEvent[] = [];

  // Phase 1: Pattern match against registry
  const matchedRules = matchRules(normalizedSource, signalType, severity, payload);
  if (matchedRules.length === 0) return [];

  // Phase 2: Arbitration — evaluate as a set, resolve conflicts
  let rulesToEvaluate: CapabilityActivationRule[];
  if (config.arbitrationEnabled) {
    const arbCtx: ArbitrationContext = {
      severity,
      sourceNode: normalizedSource,
      nodeHealth: systemContext?.nodeHealth,
      systemLoad: systemContext?.systemLoad,
    };
    const plan = arbitrate(matchedRules, arbCtx);
    lastArbitrationPlan = plan;
    rulesToEvaluate = plan.selectedRules;

    // Log suppressed rules
    for (const { rule, reason } of plan.suppressedRules) {
      const event: ActivationEvent = {
        ruleId: rule.id,
        capabilityId: rule.capabilityId,
        ownerNode: rule.ownerNode,
        tier: rule.tier,
        outcome: 'suppressed',
        reason,
        triggeredAt: now,
        durationMs: null,
        payload,
      };
      events.push(event);
      recordEvent(event);
    }
  } else {
    rulesToEvaluate = matchedRules;
  }

  // Phase 3 + 4: Confidence gate → Guard layer → Execute
  for (const rule of rulesToEvaluate) {
    // Confidence gating
    if (config.confidenceGatingEnabled) {
      const confResult = computeConfidence(rule, {
        severity,
        nodeHealth: systemContext?.nodeHealth?.[rule.ownerNode],
        errorRate: systemContext?.errorRates?.[rule.ownerNode],
      });

      if (!confResult.passes) {
        tierStats[rule.tier].lowConfidence++;
        const event: ActivationEvent = {
          ruleId: rule.id,
          capabilityId: rule.capabilityId,
          ownerNode: rule.ownerNode,
          tier: rule.tier,
          outcome: 'low_confidence',
          reason: `confidence ${confResult.confidence} < threshold ${confResult.threshold}`,
          triggeredAt: now,
          durationMs: null,
          payload,
          confidence: confResult.confidence,
        };
        events.push(event);
        recordEvent(event);
        continue;
      }
    }

    // Guard layer + execute
    const event = evaluateAndActivate(rule, now, payload, executor);
    events.push(event);
    recordEvent(event);
  }

  return events;
}

/**
 * Match incoming signal against all enabled rules.
 */
function matchRules(
  sourceNode: string,
  signalType: string,
  severity: number,
  payload: Record<string, unknown>,
): CapabilityActivationRule[] {
  const matches: CapabilityActivationRule[] = [];

  for (const rule of ACTIVATION_RULES) {
    if (!rule.enabled) continue;
    if (!config.tierEnabled[rule.tier]) continue;
    if (rule.trigger.sourceNode !== sourceNode) continue;
    if (rule.trigger.signalType !== signalType) continue;
    if (severity < rule.trigger.minSeverity) continue;

    if (rule.trigger.condition) {
      try {
        if (!rule.trigger.condition(payload)) continue;
      } catch {
        continue;
      }
    }

    matches.push(rule);
  }

  return matches;
}

/**
 * Evaluate guards and activate if eligible. Tracks success/failure for confidence stats.
 */
function evaluateAndActivate(
  rule: CapabilityActivationRule,
  now: number,
  payload: Record<string, unknown>,
  executor?: (capabilityId: string, ownerNode: string, payload: Record<string, unknown>) => Promise<void>,
): ActivationEvent {
  const baseEvent: Omit<ActivationEvent, 'outcome' | 'reason' | 'durationMs'> = {
    ruleId: rule.id,
    capabilityId: rule.capabilityId,
    ownerNode: rule.ownerNode,
    tier: rule.tier,
    triggeredAt: now,
    payload,
  };

  // Guard 1: Governance block
  if (rule.governable && governanceBlocks.has(rule.id)) {
    tierStats[rule.tier].blocked++;
    return { ...baseEvent, outcome: 'blocked', reason: 'governance_block', durationMs: null };
  }

  // Guard 2: Cooldown
  const effectiveCooldown = rule.cooldownMs * config.cooldownMultiplier;
  const lastFired = lastActivatedAt.get(rule.id) ?? 0;
  if ((now - lastFired) < effectiveCooldown) {
    return { ...baseEvent, outcome: 'cooldown', reason: `${Math.ceil((effectiveCooldown - (now - lastFired)) / 1000)}s remaining`, durationMs: null };
  }

  // Guard 3: Concurrency limit
  if (activeCount.value >= config.maxConcurrent) {
    tierStats[rule.tier].blocked++;
    return { ...baseEvent, outcome: 'deferred', reason: 'max_concurrent_reached', durationMs: null };
  }

  // ── Execute ──
  lastActivatedAt.set(rule.id, now);
  tierStats[rule.tier].activations++;

  if (executor) {
    activeCount.value++;
    executor(rule.capabilityId, rule.ownerNode, payload)
      .then(() => {
        recordSuccess(rule.id);
      })
      .catch(() => {
        tierStats[rule.tier].errors++;
        recordFailure(rule.id);
      })
      .finally(() => { activeCount.value = Math.max(0, activeCount.value - 1); });
  } else {
    // No executor — count as success (dry run)
    recordSuccess(rule.id);
  }

  return { ...baseEvent, outcome: 'executed', durationMs: null };
}

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE INTERFACE
// ═══════════════════════════════════════════════════════════════

/** Block a rule via governance override */
export function governanceBlock(ruleId: string): boolean {
  const rule = ACTIVATION_RULES.find(r => r.id === ruleId);
  if (!rule || !rule.governable) return false;
  governanceBlocks.add(ruleId);
  return true;
}

/** Unblock a previously governance-blocked rule */
export function governanceUnblock(ruleId: string): boolean {
  return governanceBlocks.delete(ruleId);
}

/** Get all governance-blocked rule IDs */
export function getGovernanceBlocks(): string[] {
  return Array.from(governanceBlocks);
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/** Update engine configuration */
export function configure(partial: Partial<EngineConfig>): void {
  config = { ...config, ...partial };
  if (partial.tierEnabled) {
    config.tierEnabled = { ...config.tierEnabled, ...partial.tierEnabled };
  }
}

/** Get current configuration */
export function getConfig(): Readonly<EngineConfig> {
  return { ...config };
}

/** Master kill-switch */
export function setEnabled(enabled: boolean): void {
  config.enabled = enabled;
}

// ═══════════════════════════════════════════════════════════════
// OBSERVABILITY
// ═══════════════════════════════════════════════════════════════

/** Get last arbitration plan (for debugging) */
export function getLastArbitrationPlan(): ArbitrationPlan | null {
  return lastArbitrationPlan;
}

// ═══════════════════════════════════════════════════════════════
// TELEMETRY & HEALTH
// ═══════════════════════════════════════════════════════════════

function recordEvent(event: ActivationEvent): void {
  eventLog.push(event);
  if (eventLog.length > MAX_EVENT_LOG) eventLog.shift();
}

/** Get engine health summary */
export function getHealth(): EngineHealth {
  const enabledRules = ACTIVATION_RULES.filter(r => r.enabled);
  const total = Object.values(tierStats).reduce((sum, t) => sum + t.activations, 0);
  const confStats = getConfidenceStats();
  const simplifiedStats: Record<string, { successCount: number; failureCount: number; totalExecutions: number }> = {};
  for (const [id, s] of Object.entries(confStats)) {
    simplifiedStats[id] = { successCount: s.successCount, failureCount: s.failureCount, totalExecutions: s.totalExecutions };
  }
  return {
    version: VERSION,
    enabled: config.enabled,
    totalRules: ACTIVATION_RULES.length,
    enabledRules: enabledRules.length,
    totalActivations: total,
    activeActivations: activeCount.value,
    recentEvents: eventLog.slice(-20),
    tierStats: { ...tierStats },
    arbitrationEnabled: config.arbitrationEnabled,
    confidenceGatingEnabled: config.confidenceGatingEnabled,
    confidenceStats: simplifiedStats,
  };
}

/** Get recent activation events */
export function getRecentEvents(limit = 20): ActivationEvent[] {
  return eventLog.slice(-limit);
}

/** Get events for a specific rule */
export function getEventsForRule(ruleId: string): ActivationEvent[] {
  return eventLog.filter(e => e.ruleId === ruleId);
}

/** Reset all engine state */
export function resetEngine(): void {
  lastActivatedAt.clear();
  activeCount.value = 0;
  eventLog.length = 0;
  governanceBlocks.clear();
  lastArbitrationPlan = null;
  resetStats();
  for (const tier of Object.values(tierStats)) {
    tier.activations = 0;
    tier.blocked = 0;
    tier.errors = 0;
    tier.lowConfidence = 0;
  }
}
