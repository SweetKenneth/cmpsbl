/**
 * Autonomous Decision Policy — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rule-based action selection engine that evaluates system conditions
 * and autonomously selects the optimal action from a policy table.
 * 
 * Consumers: DREAM, ENGINEER, EVOLUTION, MEDIC, CLM
 * Origin: simnapDecisionPolicy.ts
 */

// ── Types ─────────────────────────────────────────────────────────

export type ConditionFn = (ctx: DecisionContext) => boolean;
export type ActionId = string;

export interface DecisionContext {
  /** Module requesting the decision */
  module: string;
  /** Current memory pressure 0-1 */
  memoryPressure: number;
  /** Current error rate 0-1 */
  errorRate: number;
  /** Time since last action (ms) */
  timeSinceLastAction: number;
  /** Number of pending items (proposals, insights, tasks) */
  pendingCount: number;
  /** Current health score 0-100 */
  healthScore: number;
  /** Active goals / priorities */
  activeGoals: string[];
  /** Custom signals from the calling module */
  signals: Record<string, number | boolean | string>;
}

export interface PolicyRule {
  id: string;
  name: string;
  /** Higher priority wins when multiple rules match */
  priority: number;
  /** All conditions must be true for the rule to fire */
  conditions: ConditionFn[];
  /** Action to take */
  action: ActionId;
  /** Cooldown in ms — prevent rapid re-firing */
  cooldownMs: number;
  /** Optional explanation for audit trail */
  rationale: string;
}

export interface DecisionResult {
  action: ActionId;
  rule: string;
  rationale: string;
  evaluatedAt: number;
  matchedRules: number;
  totalRules: number;
}

// ── Policy Engine ─────────────────────────────────────────────────

const cooldownTracker = new Map<string, number>();

/**
 * Evaluate a policy table against the current context
 * Returns the highest-priority matching rule's action
 */
export function evaluatePolicy(
  rules: PolicyRule[],
  ctx: DecisionContext
): DecisionResult | null {
  const now = Date.now();
  const eligible: PolicyRule[] = [];

  for (const rule of rules) {
    // Check cooldown
    const lastFired = cooldownTracker.get(rule.id) ?? 0;
    if (now - lastFired < rule.cooldownMs) continue;

    // Evaluate all conditions
    const allMatch = rule.conditions.every(cond => {
      try { return cond(ctx); }
      catch { return false; }
    });

    if (allMatch) eligible.push(rule);
  }

  if (eligible.length === 0) return null;

  // Sort by priority descending
  eligible.sort((a, b) => b.priority - a.priority);
  const winner = eligible[0];

  // Record cooldown
  cooldownTracker.set(winner.id, now);

  return {
    action: winner.action,
    rule: winner.id,
    rationale: winner.rationale,
    evaluatedAt: now,
    matchedRules: eligible.length,
    totalRules: rules.length,
  };
}

/**
 * Clear cooldown for a specific rule (for testing or resets)
 */
export function clearCooldown(ruleId: string): void {
  cooldownTracker.delete(ruleId);
}

export function clearAllCooldowns(): void {
  cooldownTracker.clear();
}

// ── Pre-Built Policy Tables ───────────────────────────────────────

/** DREAM module decision policy */
export const DREAM_POLICY: PolicyRule[] = [
  {
    id: 'dream_emergency_consolidate',
    name: 'Emergency Consolidation',
    priority: 100,
    conditions: [
      ctx => ctx.memoryPressure > 0.85,
      ctx => ctx.module === 'dream' || ctx.signals.dreamActive === true,
    ],
    action: 'consolidation',
    cooldownMs: 60_000,
    rationale: 'Memory pressure critical — force consolidation cycle',
  },
  {
    id: 'dream_reflection_due',
    name: 'Scheduled Reflection',
    priority: 60,
    conditions: [
      ctx => ctx.timeSinceLastAction > 3_600_000, // 1 hour
      ctx => ctx.pendingCount >= 3,
    ],
    action: 'reflection',
    cooldownMs: 1_800_000, // 30 min
    rationale: 'Sufficient pending insights and idle time — trigger reflection',
  },
  {
    id: 'dream_mutation_opportunity',
    name: 'Mutation Opportunity',
    priority: 40,
    conditions: [
      ctx => ctx.healthScore > 80,
      ctx => ctx.errorRate < 0.05,
      ctx => ctx.timeSinceLastAction > 900_000, // 15 min
    ],
    action: 'mutation',
    cooldownMs: 600_000, // 10 min
    rationale: 'System healthy and stable — safe to attempt pattern mutation',
  },
  {
    id: 'dream_synthesis_idle',
    name: 'Idle Synthesis',
    priority: 20,
    conditions: [
      ctx => ctx.timeSinceLastAction > 7_200_000, // 2 hours
      ctx => ctx.pendingCount === 0,
      ctx => ctx.healthScore > 60,
    ],
    action: 'synthesis',
    cooldownMs: 3_600_000, // 1 hour
    rationale: 'Extended idle with no pending work — run creative synthesis',
  },
];

/** ENGINEER module decision policy */
export const ENGINEER_POLICY: PolicyRule[] = [
  {
    id: 'eng_critical_heal',
    name: 'Critical Auto-Heal',
    priority: 100,
    conditions: [
      ctx => ctx.healthScore < 40,
      ctx => ctx.errorRate > 0.2,
    ],
    action: 'auto_heal',
    cooldownMs: 30_000,
    rationale: 'Critical health — initiate auto-heal sequence',
  },
  {
    id: 'eng_clm_trigger',
    name: 'CLM Learning Trigger',
    priority: 50,
    conditions: [
      ctx => ctx.timeSinceLastAction > 1_800_000,
      ctx => ctx.healthScore > 70,
      ctx => ctx.signals.clmEnabled === true,
    ],
    action: 'clm_cycle',
    cooldownMs: 900_000,
    rationale: 'System stable and idle — trigger learning cycle',
  },
  {
    id: 'eng_dependency_check',
    name: 'Dependency Health Check',
    priority: 30,
    conditions: [
      ctx => ctx.timeSinceLastAction > 3_600_000,
    ],
    action: 'dependency_scan',
    cooldownMs: 3_600_000,
    rationale: 'Periodic dependency health verification',
  },
];

/** EVOLUTION module decision policy */
export const EVOLUTION_POLICY: PolicyRule[] = [
  {
    id: 'evo_emergency_rollback',
    name: 'Emergency Rollback',
    priority: 100,
    conditions: [
      ctx => ctx.errorRate > 0.3,
      ctx => ctx.signals.canaryActive === true,
    ],
    action: 'rollback',
    cooldownMs: 60_000,
    rationale: 'Canary showing high error rate — initiate rollback',
  },
  {
    id: 'evo_propose_improvement',
    name: 'Propose Improvement',
    priority: 50,
    conditions: [
      ctx => ctx.pendingCount >= 5,
      ctx => ctx.healthScore > 70,
    ],
    action: 'create_proposal',
    cooldownMs: 600_000,
    rationale: 'Sufficient pending insights for an improvement proposal',
  },
  {
    id: 'evo_canary_promote',
    name: 'Canary Promotion',
    priority: 40,
    conditions: [
      ctx => ctx.signals.canaryActive === true,
      ctx => ctx.errorRate < 0.02,
      ctx => ctx.timeSinceLastAction > 300_000,
    ],
    action: 'promote_canary',
    cooldownMs: 300_000,
    rationale: 'Canary stable with low error rate — safe to promote',
  },
];

/** MEDIC module decision policy */
export const MEDIC_POLICY: PolicyRule[] = [
  {
    id: 'medic_emergency_triage',
    name: 'Emergency Triage',
    priority: 100,
    conditions: [
      ctx => ctx.healthScore < 30,
    ],
    action: 'emergency_triage',
    cooldownMs: 15_000,
    rationale: 'Critical system health — immediate triage required',
  },
  {
    id: 'medic_symptom_collect',
    name: 'Symptom Collection',
    priority: 60,
    conditions: [
      ctx => ctx.errorRate > 0.1,
      ctx => ctx.healthScore < 70,
    ],
    action: 'collect_symptoms',
    cooldownMs: 120_000,
    rationale: 'Elevated errors — gathering diagnostic symptoms',
  },
  {
    id: 'medic_preventive_scan',
    name: 'Preventive Health Scan',
    priority: 20,
    conditions: [
      ctx => ctx.timeSinceLastAction > 7_200_000,
    ],
    action: 'preventive_scan',
    cooldownMs: 7_200_000,
    rationale: 'Routine preventive health check',
  },
];

/** CLM module decision policy */
export const CLM_POLICY: PolicyRule[] = [
  {
    id: 'clm_high_velocity',
    name: 'High-Velocity Training',
    priority: 80,
    conditions: [
      ctx => ctx.signals.quotaRemaining !== undefined && (ctx.signals.quotaRemaining as number) > 100,
      ctx => ctx.healthScore > 80,
    ],
    action: 'high_velocity_learn',
    cooldownMs: 300_000,
    rationale: 'Quota available and system healthy — maximize training throughput',
  },
  {
    id: 'clm_distillation',
    name: 'Knowledge Distillation',
    priority: 50,
    conditions: [
      ctx => ctx.pendingCount >= 10,
      ctx => ctx.timeSinceLastAction > 900_000,
    ],
    action: 'distill_knowledge',
    cooldownMs: 14_400_000, // 4 hours
    rationale: 'Sufficient raw knowledge accumulated — distill and compress',
  },
  {
    id: 'clm_topic_rotation',
    name: 'Topic Rotation',
    priority: 30,
    conditions: [
      ctx => ctx.signals.topicMastered === true,
    ],
    action: 'rotate_topic',
    cooldownMs: 600_000,
    rationale: 'Current topic mastered — rotate to next priority topic',
  },
];
