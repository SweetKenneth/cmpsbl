/**
 * REFLEX Ultimate — System 2: Priority Rule Engine v2
 * 
 * Tiered priority evaluation (critical→low) with rule composition,
 * conflict detection, hit-count analytics, and rule lifecycle management.
 * 
 * @module reflex/ultimate/priorityRuleEngine
 */

// ── Types ────────────────────────────────────────────────────────

export type RulePriority = 'critical' | 'high' | 'normal' | 'low';
export type RuleStatus = 'enabled' | 'disabled' | 'deprecated' | 'testing';

export interface ReflexRule {
  id: string;
  name: string;
  priority: RulePriority;
  status: RuleStatus;
  condition: (input: Record<string, unknown>) => boolean;
  action: string;
  maxLatencyMs: number;
  hitCount: number;
  missCount: number;
  successCount: number;
  failureCount: number;
  avgExecutionMs: number;
  tags: string[];
  conflictsWith: string[];     // Rule IDs that conflict
  createdAt: number;
  lastFiredAt: number | null;
}

export interface RuleMatch {
  ruleId: string;
  ruleName: string;
  priority: RulePriority;
  action: string;
  matchedAt: number;
}

export interface RuleConflict {
  ruleAId: string;
  ruleBId: string;
  reason: string;
  detectedAt: number;
}

// ── Constants ────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<RulePriority, number> = { critical: 0, high: 1, normal: 2, low: 3 };
const MAX_RULES = 500;

// ── State ────────────────────────────────────────────────────────

const rules: Map<string, ReflexRule> = new Map();
const conflicts: RuleConflict[] = [];

// ── Core API ────────────────────────────────────────────────────

/** Register a new rule */
export function registerRule(
  name: string,
  priority: RulePriority,
  condition: (input: Record<string, unknown>) => boolean,
  action: string,
  options?: { maxLatencyMs?: number; tags?: string[]; conflictsWith?: string[] },
): ReflexRule {
  const rule: ReflexRule = {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name, priority, condition, action,
    status: 'enabled',
    maxLatencyMs: options?.maxLatencyMs ?? 10,
    hitCount: 0, missCount: 0, successCount: 0, failureCount: 0,
    avgExecutionMs: 0,
    tags: options?.tags ?? [],
    conflictsWith: options?.conflictsWith ?? [],
    createdAt: Date.now(),
    lastFiredAt: null,
  };

  rules.set(rule.id, rule);
  if (rules.size > MAX_RULES) {
    const oldest = rules.keys().next().value;
    if (oldest) rules.delete(oldest);
  }

  // Detect conflicts
  detectConflicts(rule);

  return rule;
}

/** Evaluate input against all enabled rules (priority-ordered, short-circuit) */
export function evaluateRules(input: Record<string, unknown>): RuleMatch | null {
  const sorted = Array.from(rules.values())
    .filter(r => r.status === 'enabled')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  for (const rule of sorted) {
    try {
      const start = performance.now();
      const matches = rule.condition(input);
      const elapsed = performance.now() - start;

      // Update execution time (EMA)
      rule.avgExecutionMs = rule.avgExecutionMs * 0.8 + elapsed * 0.2;

      if (matches) {
        rule.hitCount++;
        rule.lastFiredAt = Date.now();
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          action: rule.action,
          matchedAt: Date.now(),
        };
      } else {
        rule.missCount++;
      }
    } catch {
      rule.failureCount++;
    }
  }

  return null;
}

/** Get all matching rules (not short-circuit) for conflict analysis */
export function findAllMatches(input: Record<string, unknown>): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const sorted = Array.from(rules.values())
    .filter(r => r.status === 'enabled')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  for (const rule of sorted) {
    try {
      if (rule.condition(input)) {
        matches.push({
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          action: rule.action,
          matchedAt: Date.now(),
        });
      }
    } catch {
      // Skip failing rules
    }
  }

  return matches;
}

/** Record rule execution outcome */
export function recordRuleOutcome(ruleId: string, success: boolean): void {
  const rule = rules.get(ruleId);
  if (!rule) return;
  if (success) rule.successCount++;
  else rule.failureCount++;
}

/** Update rule status */
export function setRuleStatus(ruleId: string, status: RuleStatus): boolean {
  const rule = rules.get(ruleId);
  if (!rule) return false;
  rule.status = status;
  return true;
}

/** Get ineffective rules (enabled but never hit) */
export function getIneffectiveRules(minAge: number = 60_000): ReflexRule[] {
  const now = Date.now();
  return Array.from(rules.values()).filter(
    r => r.status === 'enabled' && r.hitCount === 0 && (now - r.createdAt) > minAge,
  );
}

// ── Conflict Detection ──────────────────────────────────────────

function detectConflicts(newRule: ReflexRule): void {
  for (const existing of rules.values()) {
    if (existing.id === newRule.id) continue;

    // Explicit conflict declaration
    if (newRule.conflictsWith.includes(existing.id) || existing.conflictsWith.includes(newRule.id)) {
      conflicts.push({
        ruleAId: newRule.id,
        ruleBId: existing.id,
        reason: 'Explicitly declared conflict',
        detectedAt: Date.now(),
      });
    }

    // Same action at different priorities = potential shadow
    if (newRule.action === existing.action && newRule.priority !== existing.priority) {
      conflicts.push({
        ruleAId: newRule.id,
        ruleBId: existing.id,
        reason: `Same action "${newRule.action}" at different priorities — higher priority always shadows lower`,
        detectedAt: Date.now(),
      });
    }
  }
}

// ── Query ────────────────────────────────────────────────────────

export function getRule(ruleId: string): ReflexRule | undefined { return rules.get(ruleId); }
export function getAllRules(): ReflexRule[] {
  return Array.from(rules.values()).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}
export function getRulesByPriority(priority: RulePriority): ReflexRule[] {
  return Array.from(rules.values()).filter(r => r.priority === priority);
}
export function getConflicts(): RuleConflict[] { return [...conflicts]; }

export function getRuleEngineHealth() {
  const allRules = Array.from(rules.values());
  const enabled = allRules.filter(r => r.status === 'enabled');
  const ineffective = getIneffectiveRules();

  return {
    totalRules: rules.size,
    enabledRules: enabled.length,
    ineffectiveRules: ineffective.length,
    activeConflicts: conflicts.length,
    avgHitRate: enabled.length > 0
      ? Math.round(enabled.reduce((s, r) => s + r.hitCount, 0) / enabled.length)
      : 0,
    ruleEfficiency: enabled.length > 0
      ? Math.round(((enabled.length - ineffective.length) / enabled.length) * 100)
      : 100,
  };
}

export function resetRuleEngine(): void {
  rules.clear();
  conflicts.length = 0;
}
