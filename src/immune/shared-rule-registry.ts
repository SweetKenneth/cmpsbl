/**
 * IMMUNITY — Central Shared Rule Registry
 * 
 * A single source of truth for learned repair rules that ALL executors
 * can read from and contribute to. When one executor discovers a successful
 * repair pattern, it gets scored and offered to compatible executors.
 * 
 * Safety:
 * - Rules are only propagated to executors in the same category or with
 *   explicit compatibility markers
 * - Propagated rules start at reduced confidence (70% of source)
 * - Auto-rollback if propagated rule fails >50% on the target executor
 */

import { log } from '@/lib/system/log';
import { PILOT_EXECUTORS, EXECUTOR_MODULE_META, getExecutorsByCategory, type PilotExecutorId, type ExecutorModuleMeta } from './pilotExecutors';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface SharedRule {
  id: string;
  /** Executor that originally discovered this rule */
  sourceExecutor: string;
  /** Category of the repair */
  repairStrategy: string;
  /** Human-readable description */
  description: string;
  /** Input archetype this rule handles */
  targetArchetype: string;
  /** Confidence from the source executor (0-1) */
  sourceConfidence: number;
  /** Per-executor adoption stats */
  adoptions: Map<string, AdoptionRecord>;
  /** When the rule was created */
  createdAt: number;
  /** When last updated */
  updatedAt: number;
  /** Whether this rule is globally active */
  active: boolean;
  /** Category compatibility — which executor categories can use this */
  compatibleCategories: ExecutorModuleMeta['category'][];
}

export interface AdoptionRecord {
  executor: string;
  adopted: boolean;
  confidence: number;
  successes: number;
  failures: number;
  lastUsed: number;
  rolledBack: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════════════════

const sharedRules = new Map<string, SharedRule>();
const MAX_SHARED_RULES = 200;

// ═══════════════════════════════════════════════════════════════════════════
// Seed Rules — Pre-loaded from observed escalation patterns (12h analysis)
// These give every executor a head start so they don't repeat known mistakes.
// ═══════════════════════════════════════════════════════════════════════════

let seedComplete = false;

function seedRulesFromEscalationData() {
  if (seedComplete) return;
  seedComplete = true;

  const seeds: Array<{
    source: string;
    strategy: string;
    archetype: string;
    confidence: number;
    desc: string;
    categories: ExecutorModuleMeta['category'][];
  }> = [
    // 1. SQL injection in cost/governance fields — economy-cost-tracker had 55 escalations
    {
      source: 'economy-cost-tracker',
      strategy: 'value_sanitization',
      archetype: 'injection_attempt',
      confidence: 0.92,
      desc: 'Strip SQL keywords (SELECT/DROP/INSERT/UNION) from action and cost fields before execution. Observed in economy-cost-tracker with inputs like "SELECT * FROM costs; --".',
      categories: ['governance', 'content_validation', 'orchestration'],
    },
    // 2. XSS script tags in prompt/content fields — imagination-engine had 38 escalations
    {
      source: 'imagination-engine',
      strategy: 'value_sanitization',
      archetype: 'injection_attempt',
      confidence: 0.95,
      desc: 'HTML-encode angle brackets and strip <script> tags from prompt/content fields. Seen across cognitive executors with "<script>alert(1)</script>" payloads.',
      categories: ['cognitive_processing', 'content_analysis', 'intelligence'],
    },
    // 3. Oversized string inputs — multiple executors with 1000+ char prompts
    {
      source: 'reasoning-engine',
      strategy: 'value_sanitization',
      archetype: 'oversized',
      confidence: 0.90,
      desc: 'Truncate string values exceeding 5000 chars to prevent memory pressure. Observed with repeated-char flood inputs (e.g., "xxxx...x" >1000 chars).',
      categories: ['cognitive_processing', 'content_analysis', 'intelligence', 'ui_adaptation'],
    },
    // 4. Type mismatch: number where string expected — relay-event-dispatcher had 37 escalations
    {
      source: 'relay-event-dispatcher',
      strategy: 'type_coercion',
      archetype: 'type_mismatch',
      confidence: 0.88,
      desc: 'Coerce numeric values to strings for event/action/module fields. Seen with inputs like {intent: 42, priority: "not-a-number"}.',
      categories: ['event_routing', 'orchestration', 'governance'],
    },
    // 5. Null/undefined in required fields — vision-anomaly-detector had null events
    {
      source: 'vision-anomaly-detector',
      strategy: 'default_injection',
      archetype: 'missing_required',
      confidence: 0.85,
      desc: 'Inject meaningful defaults for null/undefined required fields (event, target, action). Observed with {event: null, target: 12345}.',
      categories: ['intelligence', 'cognitive_processing', 'content_analysis'],
    },
    // 6. Nested objects in string-expected fields — seed:{nested:true} pattern
    {
      source: 'learning-engine',
      strategy: 'shape_normalization',
      archetype: 'type_mismatch',
      confidence: 0.82,
      desc: 'JSON.stringify nested objects found in string-expected fields (seed, prompt, query). Seen with {seed: {nested: true}} inputs.',
      categories: ['cognitive_processing', 'intelligence', 'content_analysis'],
    },
    // 7. Negative numbers in cost/metric fields
    {
      source: 'economy-cost-tracker',
      strategy: 'value_sanitization',
      archetype: 'partial_valid',
      confidence: 0.87,
      desc: 'Clamp negative numeric values to 0 for cost/metric fields (costMillicents, score, priority). Observed with {costMillicents: -1}.',
      categories: ['governance', 'infrastructure', 'orchestration'],
    },
    // 8. Empty shell inputs with only garbage keys — mesh-pipeline-resolver had 37 escalations
    {
      source: 'mesh-pipeline-resolver',
      strategy: 'input_reconstruction',
      archetype: 'empty_shell',
      confidence: 0.80,
      desc: 'Reconstruct minimum viable input shape when no recognized keys present. Inject content/target/userId defaults for orchestration executors.',
      categories: ['orchestration', 'event_routing', 'governance'],
    },
    // 9. Boolean/number coercion for audit fields — audit-compliance-check had 27 escalations
    {
      source: 'audit-compliance-check',
      strategy: 'type_coercion',
      archetype: 'type_mismatch',
      confidence: 0.84,
      desc: 'Cast boolean/number values to strings for wcagLevel, standard, riskLevel fields. Observed with {wcagLevel: 999, mode: true}.',
      categories: ['content_validation', 'content_analysis', 'ui_adaptation'],
    },
    // 10. Prototype pollution / dangerous key injection
    {
      source: 'seba-proposal-evaluator',
      strategy: 'value_sanitization',
      archetype: 'injection_attempt',
      confidence: 0.93,
      desc: 'Strip __proto__, constructor, prototype keys from input objects. Prevents prototype pollution attacks across all executor categories.',
      categories: ['governance', 'orchestration', 'cognitive_processing', 'content_validation', 'event_routing', 'intelligence', 'infrastructure', 'ui_adaptation', 'content_analysis'],
    },
  ];

  for (const seed of seeds) {
    const ruleId = `SR_SEED_${seed.source}_${seed.strategy}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const rule: SharedRule = {
      id: ruleId,
      sourceExecutor: seed.source,
      repairStrategy: seed.strategy,
      description: seed.desc,
      targetArchetype: seed.archetype,
      sourceConfidence: seed.confidence,
      adoptions: new Map(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      active: true,
      compatibleCategories: seed.categories,
    };

    // Auto-adopt for source executor with pre-seeded success count
    rule.adoptions.set(seed.source, {
      executor: seed.source,
      adopted: true,
      confidence: seed.confidence,
      successes: 5, // Pre-seed with history so auto-propagation triggers (needs 3+)
      failures: 0,
      lastUsed: Date.now(),
      rolledBack: false,
    });

    sharedRules.set(ruleId, rule);
  }

  log.info('immune', `Seeded ${seeds.length} learning rules from escalation analysis into shared registry`);
}

// Auto-seed on module load
seedRulesFromEscalationData();

/** Category compatibility matrix — which categories can learn from each other */
const CATEGORY_COMPAT: Record<ExecutorModuleMeta['category'], ExecutorModuleMeta['category'][]> = {
  ui_adaptation:       ['ui_adaptation', 'content_analysis'],
  content_analysis:    ['content_analysis', 'content_validation', 'ui_adaptation'],
  content_validation:  ['content_validation', 'content_analysis', 'governance'],
  cognitive_processing:['cognitive_processing', 'intelligence'],
  event_routing:       ['event_routing', 'orchestration'],
  governance:          ['governance', 'content_validation', 'security'],
  orchestration:       ['orchestration', 'event_routing', 'governance'],
  infrastructure:      ['infrastructure', 'governance', 'event_routing'],
  intelligence:        ['intelligence', 'cognitive_processing', 'content_analysis'],
  security:            ['security', 'governance', 'infrastructure'],
  optimization:        ['optimization', 'governance', 'infrastructure'],
  autonomy:            ['autonomy', 'orchestration', 'intelligence'],
};

// ═══════════════════════════════════════════════════════════════════════════
// Core API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Contribute a successful repair rule to the shared registry.
 * Called when an executor's repair succeeds with high confidence.
 */
export function contributeRule(
  sourceExecutor: string,
  repairStrategy: string,
  targetArchetype: string,
  confidence: number,
  description: string,
): SharedRule {
  const ruleId = `SR_${sourceExecutor}_${repairStrategy}_${Date.now().toString(36)}`;
  
  const sourceMeta = EXECUTOR_MODULE_META[sourceExecutor as PilotExecutorId];
  const sourceCategory = sourceMeta?.category ?? 'cognitive_processing';
  const compatibleCategories = CATEGORY_COMPAT[sourceCategory] ?? [sourceCategory];

  const rule: SharedRule = {
    id: ruleId,
    sourceExecutor,
    repairStrategy,
    description,
    targetArchetype,
    sourceConfidence: confidence,
    adoptions: new Map(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    active: true,
    compatibleCategories,
  };

  // Auto-adopt for source executor
  rule.adoptions.set(sourceExecutor, {
    executor: sourceExecutor,
    adopted: true,
    confidence,
    successes: 1,
    failures: 0,
    lastUsed: Date.now(),
    rolledBack: false,
  });

  // Evict oldest if at capacity
  if (sharedRules.size >= MAX_SHARED_RULES) {
    const oldest = Array.from(sharedRules.entries())
      .sort(([, a], [, b]) => a.updatedAt - b.updatedAt)[0];
    if (oldest) sharedRules.delete(oldest[0]);
  }

  sharedRules.set(ruleId, rule);
  log.info('immune', `Shared rule contributed: ${ruleId} by ${sourceExecutor} [${repairStrategy}] (confidence: ${(confidence * 100).toFixed(0)}%)`);

  return rule;
}

/**
 * Find rules applicable to a target executor based on category compatibility.
 * Returns rules sorted by confidence, filtering out rolled-back adoptions.
 */
export function findApplicableRules(targetExecutor: string): SharedRule[] {
  const targetMeta = EXECUTOR_MODULE_META[targetExecutor as PilotExecutorId];
  if (!targetMeta) return [];

  return Array.from(sharedRules.values())
    .filter(rule => {
      if (!rule.active) return false;
      if (!rule.compatibleCategories.includes(targetMeta.category)) return false;
      // Skip if already adopted and rolled back
      const adoption = rule.adoptions.get(targetExecutor);
      if (adoption?.rolledBack) return false;
      return true;
    })
    .sort((a, b) => {
      // Prefer rules from same category, then by confidence
      const aMatch = a.compatibleCategories[0] === targetMeta.category ? 1 : 0;
      const bMatch = b.compatibleCategories[0] === targetMeta.category ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return b.sourceConfidence - a.sourceConfidence;
    });
}

/**
 * Adopt a shared rule for a target executor.
 * Starts at 70% of source confidence.
 */
export function adoptRule(ruleId: string, targetExecutor: string): boolean {
  const rule = sharedRules.get(ruleId);
  if (!rule || !rule.active) return false;

  const existing = rule.adoptions.get(targetExecutor);
  if (existing?.adopted) return true; // Already adopted

  rule.adoptions.set(targetExecutor, {
    executor: targetExecutor,
    adopted: true,
    confidence: rule.sourceConfidence * 0.7, // Start at 70% of source
    successes: 0,
    failures: 0,
    lastUsed: Date.now(),
    rolledBack: false,
  });

  rule.updatedAt = Date.now();
  log.info('immune', `Rule ${ruleId} adopted by ${targetExecutor} (confidence: ${(rule.sourceConfidence * 0.7 * 100).toFixed(0)}%)`);
  return true;
}

/**
 * Record a repair outcome for a shared rule on a specific executor.
 * Auto-rolls back if failure rate exceeds 50% after 5+ attempts.
 */
export function recordSharedRuleOutcome(ruleId: string, executor: string, success: boolean): void {
  const rule = sharedRules.get(ruleId);
  if (!rule) return;

  const adoption = rule.adoptions.get(executor);
  if (!adoption) return;

  if (success) {
    adoption.successes++;
    adoption.confidence = Math.min(1, adoption.confidence + 0.05);
  } else {
    adoption.failures++;
    adoption.confidence = Math.max(0, adoption.confidence - 0.1);
  }
  adoption.lastUsed = Date.now();
  rule.updatedAt = Date.now();

  // Auto-rollback check
  const total = adoption.successes + adoption.failures;
  if (total >= 5 && adoption.failures / total > 0.5) {
    adoption.rolledBack = true;
    adoption.adopted = false;
    log.warn('immune', `Shared rule ${ruleId} rolled back for ${executor}: ${adoption.failures}/${total} failures`);
  }

  // Boost source confidence if multiple adopters succeed
  const activeAdoptions = Array.from(rule.adoptions.values()).filter(a => a.adopted && !a.rolledBack);
  const avgSuccess = activeAdoptions.length > 0
    ? activeAdoptions.reduce((s, a) => s + (a.successes / Math.max(1, a.successes + a.failures)), 0) / activeAdoptions.length
    : 0;
  
  if (avgSuccess > 0.8 && activeAdoptions.length >= 3) {
    rule.sourceConfidence = Math.min(1, rule.sourceConfidence + 0.02);
  }
}

/**
 * Auto-propagate: find executors that could benefit from unadopted rules
 * and adopt them automatically. Called during learning cycles.
 */
export function autoPropagateRules(): { adopted: number; executors: string[] } {
  let adopted = 0;
  const executorsAffected = new Set<string>();

  for (const rule of sharedRules.values()) {
    if (!rule.active || rule.sourceConfidence < 0.6) continue;

    // Find compatible executors that haven't adopted yet
    for (const executor of PILOT_EXECUTORS) {
      const meta = EXECUTOR_MODULE_META[executor];
      if (!rule.compatibleCategories.includes(meta.category)) continue;
      
      const existing = rule.adoptions.get(executor);
      if (existing) continue; // Already adopted or rolled back

      // Only auto-adopt if source has proven track record (3+ successes)
      const sourceAdoption = rule.adoptions.get(rule.sourceExecutor);
      if (!sourceAdoption || sourceAdoption.successes < 3) continue;

      if (adoptRule(rule.id, executor)) {
        adopted++;
        executorsAffected.add(executor);
      }
    }
  }

  if (adopted > 0) {
    log.info('immune', `Auto-propagated ${adopted} rules to ${executorsAffected.size} executors`);
  }

  return { adopted, executors: Array.from(executorsAffected) };
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard / Telemetry
// ═══════════════════════════════════════════════════════════════════════════

export interface SharedRuleRegistryStats {
  totalRules: number;
  activeRules: number;
  totalAdoptions: number;
  avgConfidence: number;
  topContributors: Array<{ executor: string; ruleCount: number }>;
  categoryBreakdown: Record<string, number>;
  rollbackRate: number;
}

export function getSharedRuleStats(): SharedRuleRegistryStats {
  const rules = Array.from(sharedRules.values());
  const active = rules.filter(r => r.active);
  
  let totalAdoptions = 0;
  let rollbacks = 0;
  const contributorMap = new Map<string, number>();
  const categoryMap: Record<string, number> = {};

  for (const rule of rules) {
    contributorMap.set(rule.sourceExecutor, (contributorMap.get(rule.sourceExecutor) ?? 0) + 1);
    
    for (const adoption of rule.adoptions.values()) {
      totalAdoptions++;
      if (adoption.rolledBack) rollbacks++;
    }

    for (const cat of rule.compatibleCategories) {
      categoryMap[cat] = (categoryMap[cat] ?? 0) + 1;
    }
  }

  const topContributors = Array.from(contributorMap.entries())
    .map(([executor, ruleCount]) => ({ executor, ruleCount }))
    .sort((a, b) => b.ruleCount - a.ruleCount)
    .slice(0, 5);

  return {
    totalRules: rules.length,
    activeRules: active.length,
    totalAdoptions,
    avgConfidence: active.length > 0 ? active.reduce((s, r) => s + r.sourceConfidence, 0) / active.length : 0,
    topContributors,
    categoryBreakdown: categoryMap,
    rollbackRate: totalAdoptions > 0 ? rollbacks / totalAdoptions : 0,
  };
}

export function getSharedRules(): SharedRule[] {
  return Array.from(sharedRules.values()).sort((a, b) => b.sourceConfidence - a.sourceConfidence);
}
