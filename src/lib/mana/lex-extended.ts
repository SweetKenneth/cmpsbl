/**
 * Lex Extended — Additive temporal & conditional governance
 * U.S. Patent App. No. 64/031,637
 *
 * Layered ON TOP of the base Lex governor in lex.ts. The base evaluator
 * is left untouched so the existing pipeline behaviour is byte-identical.
 * This module composes its own predicate rules first; if none match it
 * delegates to the base `evaluate()`.
 *
 * Adds three capabilities the base governor cannot express:
 *   - Time-windowed rules     (active only between two timestamps)
 *   - Rate-limited rules      (deny after N invocations per window)
 *   - Predicate rules         (arbitrary context check, deterministic)
 *
 * © CMPSBL® — All rights reserved.
 */

import { evaluate as baseEvaluate } from './lex';
import type {
  LexVerdict, LexEvalContext, ManaCapability, ManaCapabilityOrWildcard,
} from './types';
import { normalizePriority } from './types';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface LexExtendedContextInput {
  readonly args?: ReadonlyArray<unknown>;
  readonly callerId?: string;
  readonly timestamp?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type LexPredicate = (ctx: {
  capability: ManaCapability;
  target: string;
  context: LexEvalContext;
  input: LexExtendedContextInput;
  invocationCount: number;
}) => LexVerdict | null;

export interface LexExtendedRule {
  readonly id: string;
  readonly capability: ManaCapabilityOrWildcard;
  readonly target: string;
  readonly verdict: LexVerdict;
  readonly reason: string;
  readonly priority: number;
  readonly createdAt: number;
  /** Optional time window — inclusive bounds in ms epoch. */
  readonly notBefore?: number;
  readonly notAfter?: number;
  /** Optional rate limit — N invocations per windowMs before deny. */
  readonly maxInvocations?: number;
  readonly windowMs?: number;
  /** Optional custom predicate — returns verdict to override, or null to skip. */
  readonly predicate?: LexPredicate;
}

export interface ExtendedEvalResult {
  readonly verdict: LexVerdict;
  readonly source: 'extended' | 'base';
  readonly ruleId: string | null;
  readonly reason: string;
  readonly context: LexEvalContext;
}

// ═══════════════════════════════════════════════════════════════
// Internal store
// ═══════════════════════════════════════════════════════════════

const extendedRules: Map<string, LexExtendedRule> = new Map();
const invocations: Map<string, number[]> = new Map(); // ruleId → timestamps
let extIdCounter = 0;

function nextId(): string {
  extIdCounter += 1;
  return `lex-ext-${Date.now().toString(36)}-${extIdCounter.toString(36)}`;
}

function recordAndCount(ruleId: string, windowMs: number, now: number): number {
  const arr = invocations.get(ruleId) ?? [];
  // Drop entries older than window
  const cutoff = now - windowMs;
  const fresh = arr.filter(t => t >= cutoff);
  fresh.push(now);
  invocations.set(ruleId, fresh);
  return fresh.length;
}

function ruleMatches(rule: LexExtendedRule, capability: ManaCapability, target: string): boolean {
  const capMatch = rule.capability === capability || rule.capability === '*';
  const targetMatch = rule.target === target || rule.target === '*';
  return capMatch && targetMatch;
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export function registerExtendedRule(input: Omit<LexExtendedRule, 'id' | 'createdAt' | 'priority'> & { priority?: number }): LexExtendedRule {
  const rule: LexExtendedRule = Object.freeze({
    id: nextId(),
    capability: input.capability,
    target: input.target,
    verdict: input.verdict,
    reason: input.reason,
    priority: normalizePriority(input.priority ?? 100),
    createdAt: Date.now(),
    notBefore: input.notBefore,
    notAfter: input.notAfter,
    maxInvocations: input.maxInvocations,
    windowMs: input.windowMs,
    predicate: input.predicate,
  });
  extendedRules.set(rule.id, rule);
  return rule;
}

export function revokeExtendedRule(id: string): boolean {
  invocations.delete(id);
  return extendedRules.delete(id);
}

export function getExtendedRules(): ReadonlyArray<LexExtendedRule> {
  return Array.from(extendedRules.values());
}

export function resetLexExtended(): void {
  extendedRules.clear();
  invocations.clear();
  extIdCounter = 0;
}

/**
 * Evaluate a capability through the extended governor first, then fall
 * back to the base evaluator. Deterministic ordering: priority asc, then
 * createdAt asc — matching base lex semantics.
 */
export function evaluateExtended(
  capability: ManaCapability,
  target: string,
  mode: 'permissive' | 'strict',
  context: LexEvalContext = 'runtime',
  input: LexExtendedContextInput = {},
): ExtendedEvalResult {
  const now = input.timestamp ?? Date.now();

  const sorted = Array.from(extendedRules.values()).sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.createdAt - b.createdAt;
  });

  for (const rule of sorted) {
    if (!ruleMatches(rule, capability, target)) continue;

    // Time window check — outside window means rule does not apply
    if (rule.notBefore !== undefined && now < rule.notBefore) continue;
    if (rule.notAfter !== undefined && now > rule.notAfter) continue;

    // Rate limit — counts as a deny once exceeded
    if (rule.maxInvocations !== undefined && rule.windowMs !== undefined) {
      const count = recordAndCount(rule.id, rule.windowMs, now);
      if (count > rule.maxInvocations) {
        return {
          verdict: 'deny',
          source: 'extended',
          ruleId: rule.id,
          reason: `${rule.reason} (rate limit ${rule.maxInvocations}/${rule.windowMs}ms exceeded)`,
          context,
        };
      }
    }

    // Predicate — optional override
    if (rule.predicate) {
      const verdict = rule.predicate({
        capability, target, context, input,
        invocationCount: invocations.get(rule.id)?.length ?? 0,
      });
      if (verdict !== null) {
        return { verdict, source: 'extended', ruleId: rule.id, reason: rule.reason, context };
      }
      continue; // predicate abstained — try next rule
    }

    return { verdict: rule.verdict, source: 'extended', ruleId: rule.id, reason: rule.reason, context };
  }

  // Delegate to base — preserves all existing behaviour
  const base = baseEvaluate(capability, target, mode, context);
  return {
    verdict: base.verdict,
    source: 'base',
    ruleId: base.rule?.id ?? null,
    reason: base.rule?.reason ?? `default-${mode}`,
    context: base.context,
  };
}
