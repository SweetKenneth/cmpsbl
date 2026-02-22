/**
 * Evolution Mesh — Shared Rule Registry
 * Cross-function learning: successful repairs become rules that propagate.
 */

export interface LearnedRule {
  id: string;
  repairStrategy: string;
  archetype: string;
  confidence: number;
  sourceFunction: string;
  category: string;
  invocations: number;
  successes: number;
  createdAt: number;
}

const rules = new Map<string, LearnedRule>();
const performanceLog = new Map<string, { fn: string; successes: number; failures: number; total: number }>();

let ruleCounter = 0;

/**
 * Record a successful repair and potentially create a learning rule.
 */
export function contributeRule(
  fnName: string,
  repairStrategy: string,
  archetype: string,
  confidence: number,
  category: string = 'general',
): void {
  if (confidence < 0.6) return; // Only learn from confident repairs

  const ruleId = `rule_${++ruleCounter}`;
  rules.set(ruleId, {
    id: ruleId,
    repairStrategy,
    archetype,
    confidence,
    sourceFunction: fnName,
    category,
    invocations: 0,
    successes: 0,
    createdAt: Date.now(),
  });
}

/**
 * Find applicable rules for a function based on category compatibility.
 */
export function findRulesForFunction(fnName: string, category: string): LearnedRule[] {
  return Array.from(rules.values())
    .filter(r => r.category === category && r.confidence > 0.4)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

/**
 * Apply a learned rule to an input.
 */
export function applyRule(
  rule: LearnedRule,
  input: Record<string, unknown>,
): { applied: boolean; output: Record<string, unknown> } {
  rule.invocations++;
  // Rules don't modify input directly — they inform the repair engine
  // which strategy to try. The actual transform is in deterministic repair.
  return { applied: false, output: input };
}

/**
 * Record outcome of a rule application.
 */
export function recordRuleOutcome(ruleId: string, success: boolean): void {
  const rule = rules.get(ruleId);
  if (!rule) return;
  
  if (success) {
    rule.successes++;
    rule.confidence = Math.min(1.0, rule.confidence + 0.02);
  } else {
    rule.confidence = Math.max(0, rule.confidence - 0.05);
  }

  // Auto-demote rules that fall below threshold
  if (rule.confidence < 0.3 && rule.invocations > 10) {
    rules.delete(ruleId);
  }
}

export function getRules(): LearnedRule[] {
  return Array.from(rules.values());
}

export function getPerformanceStats(): Map<string, { fn: string; successes: number; failures: number; total: number }> {
  return new Map(performanceLog);
}
