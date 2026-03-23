/**
 * Activation Arbitration Layer
 * 
 * Pre-execution decision layer that evaluates matched rules as a SET,
 * resolves conflicts, enforces limits, and outputs a final activation plan.
 * 
 * Runs after rule matching, before execution.
 * 
 * @module nerve/auto-activation/activationArbitrator
 * @version 1.0.0
 */

import type { CapabilityActivationRule, ActivationTier } from './capabilityActivationRegistry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ArbitrationContext {
  /** Signal severity (0–10) */
  severity: number;
  /** Source node of the signal */
  sourceNode: string;
  /** Optional node health scores (0–1) keyed by node name */
  nodeHealth?: Record<string, number>;
  /** Optional system load factor (0–1, 1 = maxed) */
  systemLoad?: number;
}

export interface ArbitrationPlan {
  /** Rules approved for execution, in priority order */
  selectedRules: CapabilityActivationRule[];
  /** Rules suppressed with reasons */
  suppressedRules: Array<{ rule: CapabilityActivationRule; reason: string }>;
  /** Summary stats */
  stats: {
    totalMatched: number;
    selected: number;
    suppressed: number;
    t1Count: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

/** Max rules that can fire from a single signal */
const MAX_ACTIVATIONS_PER_SIGNAL = 3;

/** Max T1 overrides allowed simultaneously */
const MAX_T1_PER_SIGNAL = 1;

/** Priority base scores per tier */
const TIER_PRIORITY: Record<ActivationTier, number> = {
  T1_CRITICAL: 100,
  T2_OPERATIONAL: 75,
  T3_INTELLIGENCE: 50,
  T4_OPTIMIZATION: 25,
  T5_AUTONOMOUS: 10,
};

/** Known mutually exclusive action patterns */
const CONFLICT_PAIRS: Array<[string, string]> = [
  ['throttle', 'fan_out'],
  ['throttle', 'fan-out'],
  ['quarantine', 'promote'],
  ['shutdown', 'restart'],
  ['block', 'whitelist'],
  ['isolate', 'broadcast'],
  ['dampen', 'amplify'],
  ['compress', 'expand'],
];

// ═══════════════════════════════════════════════════════════════
// CORE ARBITRATION
// ═══════════════════════════════════════════════════════════════

/**
 * Arbitrate a set of matched rules into a final activation plan.
 * 
 * Scoring formula:
 *   priority = tierBase + (severity × 10) + healthBonus - loadPenalty
 * 
 * Conflict detection:
 *   - Same ownerNode with multiple heavy (T1/T2) capabilities → keep highest
 *   - Mutually opposing actions detected via capabilityId keyword matching
 * 
 * Limits:
 *   - Max 3 activations per signal
 *   - Max 1 T1 override at a time
 */
export function arbitrate(
  rules: CapabilityActivationRule[],
  context: ArbitrationContext,
): ArbitrationPlan {
  if (rules.length === 0) {
    return { selectedRules: [], suppressedRules: [], stats: { totalMatched: 0, selected: 0, suppressed: 0, t1Count: 0 } };
  }

  // Phase 1: Score each rule
  const scored = rules.map(rule => ({
    rule,
    score: computePriorityScore(rule, context),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Phase 2: Select with conflict resolution and limits
  const selected: CapabilityActivationRule[] = [];
  const suppressed: Array<{ rule: CapabilityActivationRule; reason: string }> = [];
  const nodeHeavySlots = new Set<string>(); // tracks nodes with T1/T2 already selected
  let t1Count = 0;

  for (const { rule } of scored) {
    // T1 limit check
    if (rule.tier === 'T1_CRITICAL') {
      if (t1Count >= MAX_T1_PER_SIGNAL) {
        suppressed.push({ rule, reason: `T1 limit reached (max ${MAX_T1_PER_SIGNAL})` });
        continue;
      }
    }

    // Max activations limit
    if (selected.length >= MAX_ACTIVATIONS_PER_SIGNAL) {
      suppressed.push({ rule, reason: `activation limit reached (max ${MAX_ACTIVATIONS_PER_SIGNAL})` });
      continue;
    }

    // Same-node heavy capability conflict
    const isHeavy = rule.tier === 'T1_CRITICAL' || rule.tier === 'T2_OPERATIONAL';
    if (isHeavy && nodeHeavySlots.has(rule.ownerNode)) {
      suppressed.push({ rule, reason: `node ${rule.ownerNode} already has heavy activation` });
      continue;
    }

    // Mutual exclusion conflict
    const conflict = detectConflict(rule, selected);
    if (conflict) {
      suppressed.push({ rule, reason: `conflicts with ${conflict.id}: mutually exclusive actions` });
      continue;
    }

    // Accept
    selected.push(rule);
    if (isHeavy) nodeHeavySlots.add(rule.ownerNode);
    if (rule.tier === 'T1_CRITICAL') t1Count++;
  }

  return {
    selectedRules: selected,
    suppressedRules: suppressed,
    stats: {
      totalMatched: rules.length,
      selected: selected.length,
      suppressed: suppressed.length,
      t1Count,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// SCORING
// ═══════════════════════════════════════════════════════════════

function computePriorityScore(rule: CapabilityActivationRule, ctx: ArbitrationContext): number {
  const tierBase = TIER_PRIORITY[rule.tier];
  const severityBonus = ctx.severity * 10;

  // Health bonus: healthy owner node gets +10
  const nodeHealthVal = ctx.nodeHealth?.[rule.ownerNode] ?? 1.0;
  const healthBonus = nodeHealthVal * 10;

  // Load penalty: high system load penalizes lower-tier rules
  const loadPenalty = (ctx.systemLoad ?? 0) * (100 - tierBase) * 0.5;

  return tierBase + severityBonus + healthBonus - loadPenalty;
}

// ═══════════════════════════════════════════════════════════════
// CONFLICT DETECTION
// ═══════════════════════════════════════════════════════════════

function detectConflict(
  candidate: CapabilityActivationRule,
  selected: CapabilityActivationRule[],
): CapabilityActivationRule | null {
  const candidateId = candidate.capabilityId.toLowerCase();

  for (const existing of selected) {
    const existingId = existing.capabilityId.toLowerCase();

    for (const [a, b] of CONFLICT_PAIRS) {
      const candidateHasA = candidateId.includes(a);
      const candidateHasB = candidateId.includes(b);
      const existingHasA = existingId.includes(a);
      const existingHasB = existingId.includes(b);

      if ((candidateHasA && existingHasB) || (candidateHasB && existingHasA)) {
        return existing;
      }
    }
  }

  return null;
}
