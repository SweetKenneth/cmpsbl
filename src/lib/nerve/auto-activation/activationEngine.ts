/**
 * Capability Auto-Activation Engine
 * 
 * The autonomic nervous system of the substrate. Listens for NERVE signals,
 * pattern-matches against the 50-rule Activation Registry, enforces guards
 * (governance, cooldowns, locks), and auto-executes capabilities.
 * 
 * Flow:
 *   System Event/Signal
 *     → NERVE Signal Router (pattern match)
 *     → Activation Registry (trigger lookup)
 *     → Guard Layer (governance / lock / cooldown)
 *     → Auto-Execute Capability
 *     → Telemetry / Audit
 */

import {
  ACTIVATION_RULES,
  type ActivationTier,
  type CapabilityActivationRule,
} from './capabilityActivationRegistry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ActivationOutcome = 'executed' | 'deferred' | 'blocked' | 'cooldown' | 'error';

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
}

export interface EngineHealth {
  version: string;
  enabled: boolean;
  totalRules: number;
  enabledRules: number;
  totalActivations: number;
  activeActivations: number;
  recentEvents: ActivationEvent[];
  tierStats: Record<ActivationTier, { activations: number; blocked: number; errors: number }>;
}

// ═══════════════════════════════════════════════════════════════
// ENGINE STATE
// ═══════════════════════════════════════════════════════════════

const VERSION = '1.0.0';
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
};

const lastActivatedAt = new Map<string, number>();
const activeCount = { value: 0 };
const eventLog: ActivationEvent[] = [];
const tierStats: Record<ActivationTier, { activations: number; blocked: number; errors: number }> = {
  T1_CRITICAL: { activations: 0, blocked: 0, errors: 0 },
  T2_OPERATIONAL: { activations: 0, blocked: 0, errors: 0 },
  T3_INTELLIGENCE: { activations: 0, blocked: 0, errors: 0 },
  T4_OPTIMIZATION: { activations: 0, blocked: 0, errors: 0 },
  T5_AUTONOMOUS: { activations: 0, blocked: 0, errors: 0 },
};

/** Governance block list — rules blocked by GOVERNANCE node */
const governanceBlocks = new Set<string>();

// ═══════════════════════════════════════════════════════════════
// SIGNAL PROCESSING — The Core Loop
// ═══════════════════════════════════════════════════════════════

/**
 * Process an incoming signal against all 50 activation rules.
 * This is the main entry point — called by the NERVE signal router.
 * 
 * Returns all activation events (executed, deferred, blocked).
 */
export function processSignal(
  sourceNode: string,
  signalType: string,
  severity: number,
  payload: Record<string, unknown>,
  executor?: (capabilityId: string, ownerNode: string, payload: Record<string, unknown>) => Promise<void>,
): ActivationEvent[] {
  if (!config.enabled) return [];

  const now = Date.now();
  const normalizedSource = sourceNode.toLowerCase();
  const events: ActivationEvent[] = [];

  // Phase 1: Pattern match against registry
  const matchedRules = matchRules(normalizedSource, signalType, severity, payload);

  // Phase 2: Apply guards and execute
  for (const rule of matchedRules) {
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

    // Source node match
    if (rule.trigger.sourceNode !== sourceNode) continue;

    // Signal type match
    if (rule.trigger.signalType !== signalType) continue;

    // Severity gate
    if (severity < rule.trigger.minSeverity) continue;

    // Custom condition
    if (rule.trigger.condition) {
      try {
        if (!rule.trigger.condition(payload)) continue;
      } catch {
        continue; // Failed conditions are silently skipped
      }
    }

    matches.push(rule);
  }

  // Priority sort: T1 > T2 > T3 > T4 > T5
  const tierOrder: Record<ActivationTier, number> = {
    T1_CRITICAL: 5, T2_OPERATIONAL: 4, T3_INTELLIGENCE: 3,
    T4_OPTIMIZATION: 2, T5_AUTONOMOUS: 1,
  };
  matches.sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier]);

  return matches;
}

/**
 * Evaluate guards and activate if eligible.
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
      .catch(() => { tierStats[rule.tier].errors++; })
      .finally(() => { activeCount.value = Math.max(0, activeCount.value - 1); });
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
  return {
    version: VERSION,
    enabled: config.enabled,
    totalRules: ACTIVATION_RULES.length,
    enabledRules: enabledRules.length,
    totalActivations: total,
    activeActivations: activeCount.value,
    recentEvents: eventLog.slice(-20),
    tierStats: { ...tierStats },
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
  for (const tier of Object.values(tierStats)) {
    tier.activations = 0;
    tier.blocked = 0;
    tier.errors = 0;
  }
}
