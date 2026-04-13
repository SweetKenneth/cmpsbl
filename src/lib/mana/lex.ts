/**
 * Lex Governor — The Layer's Conscience
 * U.S. Patent App. No. 64/031,637
 * 
 * Lex governs every attachment decision. No capability activates
 * without Lex's verdict. No function is wrapped without Lex's consent.
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { LexRule, LexVerdict, LexEvalContext, ManaCapability } from './types';

/** Internal rule store */
const rules: Map<string, LexRule> = new Map();

/** Monotonic ID counter */
let ruleIdCounter = 0;

function generateRuleId(): string {
  ruleIdCounter += 1;
  return `lex-${Date.now().toString(36)}-${ruleIdCounter.toString(36)}`;
}

/**
 * Register a governance rule.
 * Lex evaluates rules in insertion order — first match wins.
 */
export function registerRule(
  capability: ManaCapability,
  target: string,
  verdict: LexVerdict,
  reason: string,
  priority = 100
): LexRule {
  const rule: LexRule = {
    id: generateRuleId(),
    capability,
    target,
    verdict,
    reason,
    createdAt: Date.now(),
    priority,
  };
  rules.set(rule.id, rule);
  return rule;
}

/**
 * Evaluate whether a capability may be applied to a target function.
 * Returns the verdict and the rule that produced it.
 */
/**
 * Evaluate whether a capability may be applied/invoked.
 * @param context - 'attachment' = may this wrapper be applied?
 *                  'runtime' = may this invocation proceed right now?
 * These are semantically different — a capability may be allowed to attach
 * but a specific runtime call may be denied (e.g., budget exhausted).
 */
export function evaluate(
  capability: ManaCapability,
  target: string,
  mode: 'permissive' | 'strict',
  context: LexEvalContext = 'runtime'
): { verdict: LexVerdict; rule: LexRule | null; context: LexEvalContext } {
  // Sort rules by priority (lower = higher priority), then creation order
  const sorted = Array.from(rules.values()).sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.createdAt - b.createdAt;
  });

  for (const rule of sorted) {
    // Capability matching is EXACT — no wildcards on capability.
    // Wildcards are allowed ONLY on target.
    const capMatch = rule.capability === capability;
    const targetMatch = rule.target === target || rule.target === '*';
    if (capMatch && targetMatch) {
      return { verdict: rule.verdict, rule, context };
    }
  }

  // Default: permissive allows, strict denies
  return {
    verdict: mode === 'permissive' ? 'allow' : 'deny',
    rule: null,
    context,
  };
}

/** Revoke a rule by ID */
export function revokeRule(ruleId: string): boolean {
  return rules.delete(ruleId);
}

/** Get all active rules */
export function getRules(): ReadonlyArray<LexRule> {
  return Array.from(rules.values());
}

/** Clear all rules — full Lex reset */
export function resetLex(): void {
  rules.clear();
  ruleIdCounter = 0;
}

/** Count active rules */
export function ruleCount(): number {
  return rules.size;
}
