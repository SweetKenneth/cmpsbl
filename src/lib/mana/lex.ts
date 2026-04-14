/**
 * Lex Governor — The Layer's Conscience (HARDENED)
 * U.S. Patent App. No. 64/031,637
 * 
 * STOP-SHIP HARDENING v1.0.0:
 * - Strict verdict precedence: deny > detach > quarantine > escalate > phone-home > observe > allow
 * - One event → ONE terminal verdict (no cascade)
 * - Recursion guard (no Lex → Ripple → Lex loops)
 * - Per-target cooldown
 * - Rule deduplication
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { LexRule, LexVerdict, LexEvalContext, ManaCapability, ManaCapabilityOrWildcard } from './types';
import { normalizePriority } from './types';

// ═══════════════════════════════════════════════════════════════
// Extended Verdict System
// ═══════════════════════════════════════════════════════════════

/** Full verdict vocabulary — ordered by precedence (lower index = higher precedence) */
export type LexVerdictExtended =
  | 'deny'
  | 'detach'
  | 'quarantine'
  | 'escalate'
  | 'phone-home'
  | 'observe'
  | 'allow';

/** Strict precedence order — index 0 is highest priority */
const VERDICT_PRECEDENCE: ReadonlyArray<LexVerdictExtended> = Object.freeze([
  'deny', 'detach', 'quarantine', 'escalate', 'phone-home', 'observe', 'allow',
]);

/** Terminal verdicts — after one fires, no lower-priority verdicts execute */
const TERMINAL_VERDICTS: ReadonlySet<LexVerdictExtended> = new Set([
  'deny', 'detach', 'quarantine',
]);

/** Map verdict to its precedence rank (lower = higher priority) */
function verdictRank(v: LexVerdictExtended): number {
  const idx = VERDICT_PRECEDENCE.indexOf(v);
  return idx >= 0 ? idx : VERDICT_PRECEDENCE.length;
}

// ═══════════════════════════════════════════════════════════════
// Recursion Guard
// ═══════════════════════════════════════════════════════════════

/** Tracks active Lex evaluations to prevent Lex → Ripple → Lex loops */
let evaluationDepth = 0;
const MAX_EVALUATION_DEPTH = 3;

// ═══════════════════════════════════════════════════════════════
// Per-Target Cooldown
// ═══════════════════════════════════════════════════════════════

interface CooldownEntry {
  verdict: LexVerdictExtended;
  expiresAt: number;
}

/** Per-target cooldown — prevents rapid re-evaluation of the same target */
const cooldowns = new Map<string, CooldownEntry>();
const DEFAULT_COOLDOWN_MS = 1000;

function getCooldownKey(capability: ManaCapability, target: string): string {
  return `${capability}::${target}`;
}

function checkCooldown(capability: ManaCapability, target: string): CooldownEntry | null {
  const key = getCooldownKey(capability, target);
  const entry = cooldowns.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cooldowns.delete(key);
    return null;
  }
  return entry;
}

function setCooldown(capability: ManaCapability, target: string, verdict: LexVerdictExtended, durationMs = DEFAULT_COOLDOWN_MS): void {
  const key = getCooldownKey(capability, target);
  cooldowns.set(key, { verdict, expiresAt: Date.now() + durationMs });
  /* Evict expired entries periodically — bounded to prevent leak */
  if (cooldowns.size > 10_000) {
    const now = Date.now();
    for (const [k, v] of cooldowns) {
      if (now > v.expiresAt) cooldowns.delete(k);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Internal Rule Store
// ═══════════════════════════════════════════════════════════════

const rules: Map<string, LexRule> = new Map();
let ruleIdCounter = 0;

function generateRuleId(): string {
  ruleIdCounter += 1;
  return `lex-${Date.now().toString(36)}-${ruleIdCounter.toString(36)}`;
}

// ═══════════════════════════════════════════════════════════════
// Rule Deduplication
// ═══════════════════════════════════════════════════════════════

/** Check if an equivalent rule already exists (same capability, target, verdict) */
function findDuplicateRule(capability: ManaCapabilityOrWildcard, target: string, verdict: LexVerdict): LexRule | null {
  for (const rule of rules.values()) {
    if (rule.capability === capability && rule.target === target && rule.verdict === verdict) {
      return rule;
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Audit Trail
// ═══════════════════════════════════════════════════════════════

export interface LexAuditEntry {
  readonly timestamp: number;
  readonly capability: ManaCapability;
  readonly target: string;
  readonly verdict: LexVerdictExtended;
  readonly ruleId: string | null;
  readonly context: LexEvalContext;
  readonly reason: string;
  readonly cooldownHit: boolean;
  readonly recursionDepth: number;
}

const auditLog: LexAuditEntry[] = [];
const MAX_AUDIT_LOG = 5000;

function auditRecord(entry: LexAuditEntry): void {
  auditLog.push(entry);
  if (auditLog.length > MAX_AUDIT_LOG) auditLog.shift();
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/**
 * Register a governance rule.
 * Deduplicates — returns existing rule if an equivalent exists.
 */
export function registerRule(
  capability: ManaCapabilityOrWildcard,
  target: string,
  verdict: LexVerdict,
  reason: string,
  priority = 100
): LexRule {
  /* Dedup check */
  const existing = findDuplicateRule(capability, target, verdict);
  if (existing) return existing;

  const safePriority = normalizePriority(priority);
  const rule: LexRule = {
    id: generateRuleId(),
    capability,
    target,
    verdict,
    reason,
    createdAt: Date.now(),
    priority: safePriority,
  };
  rules.set(rule.id, rule);
  return rule;
}

/**
 * Evaluate whether a capability may be applied/invoked.
 * 
 * HARDENED GUARANTEES:
 * 1. Recursion guard — max depth 3
 * 2. Per-target cooldown — returns cached verdict if within cooldown
 * 3. Strict precedence — deny > detach > quarantine > escalate > phone-home > observe > allow
 * 4. One terminal verdict — no cascade after deny/detach/quarantine
 * 5. Deterministic — same rules + same input = same output, always
 */
export function evaluate(
  capability: ManaCapability,
  target: string,
  mode: 'permissive' | 'strict',
  context: LexEvalContext = 'runtime'
): { verdict: LexVerdict; rule: LexRule | null; context: LexEvalContext } {
  /* Recursion guard */
  if (evaluationDepth >= MAX_EVALUATION_DEPTH) {
    return { verdict: 'deny', rule: null, context };
  }

  /* Cooldown check */
  const cooled = checkCooldown(capability, target);
  if (cooled) {
    /* Map extended verdicts back to base LexVerdict for compatibility */
    const baseVerdict = mapToBaseVerdict(cooled.verdict);
    auditRecord({
      timestamp: Date.now(), capability, target,
      verdict: cooled.verdict, ruleId: null, context,
      reason: 'cooldown_hit', cooldownHit: true,
      recursionDepth: evaluationDepth,
    });
    return { verdict: baseVerdict, rule: null, context };
  }

  evaluationDepth++;
  try {
    /* Sort rules by priority (lower = higher priority), then creation order */
    const sorted = Array.from(rules.values()).sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.createdAt - b.createdAt;
    });

    /* Collect ALL matching rules, then resolve by strict precedence */
    const matchingRules: LexRule[] = [];
    for (const rule of sorted) {
      const capMatch = rule.capability === capability || rule.capability === '*';
      const targetMatch = rule.target === target || rule.target === '*';
      if (capMatch && targetMatch) {
        matchingRules.push(rule);
      }
    }

    if (matchingRules.length === 0) {
      const defaultVerdict: LexVerdict = mode === 'permissive' ? 'allow' : 'deny';
      auditRecord({
        timestamp: Date.now(), capability, target,
        verdict: defaultVerdict, ruleId: null, context,
        reason: `no_matching_rules_${mode}`, cooldownHit: false,
        recursionDepth: evaluationDepth,
      });
      return { verdict: defaultVerdict, rule: null, context };
    }

    /* Deterministic resolution: highest-precedence verdict wins.
     * If multiple rules match, the one whose verdict has the lowest
     * precedence index wins. Ties broken by rule priority then creation order. */
    let winningRule = matchingRules[0];
    let winningRank = verdictRank(winningRule.verdict as LexVerdictExtended);

    for (let i = 1; i < matchingRules.length; i++) {
      const rank = verdictRank(matchingRules[i].verdict as LexVerdictExtended);
      if (rank < winningRank) {
        winningRule = matchingRules[i];
        winningRank = rank;
      }
    }

    const extendedVerdict = winningRule.verdict as LexVerdictExtended;
    const baseVerdict = mapToBaseVerdict(extendedVerdict);

    /* Set cooldown for terminal verdicts */
    if (TERMINAL_VERDICTS.has(extendedVerdict)) {
      setCooldown(capability, target, extendedVerdict, 5000);
    }

    auditRecord({
      timestamp: Date.now(), capability, target,
      verdict: extendedVerdict, ruleId: winningRule.id, context,
      reason: winningRule.reason, cooldownHit: false,
      recursionDepth: evaluationDepth,
    });

    return { verdict: baseVerdict, rule: winningRule, context };
  } finally {
    evaluationDepth--;
  }
}

/**
 * Map extended verdicts to base LexVerdict for backward compatibility.
 * deny/detach/quarantine → 'deny'
 * escalate/phone-home → 'observe' (non-blocking but flagged)
 * observe → 'observe'
 * allow → 'allow'
 */
function mapToBaseVerdict(v: LexVerdictExtended): LexVerdict {
  switch (v) {
    case 'deny':
    case 'detach':
    case 'quarantine':
      return 'deny';
    case 'escalate':
    case 'phone-home':
      return 'observe';
    case 'observe':
      return 'observe';
    case 'allow':
      return 'allow';
    default:
      return 'deny';
  }
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
  cooldowns.clear();
  auditLog.length = 0;
  evaluationDepth = 0;
}

/** Count active rules */
export function ruleCount(): number {
  return rules.size;
}

/** Get audit log for forensic analysis */
export function getAuditLog(): ReadonlyArray<LexAuditEntry> {
  return [...auditLog];
}

/** Get cooldown state for observability */
export function getActiveCooldowns(): ReadonlyArray<{ key: string; verdict: LexVerdictExtended; expiresAt: number }> {
  const now = Date.now();
  const result: Array<{ key: string; verdict: LexVerdictExtended; expiresAt: number }> = [];
  for (const [key, entry] of cooldowns) {
    if (now <= entry.expiresAt) {
      result.push({ key, verdict: entry.verdict, expiresAt: entry.expiresAt });
    }
  }
  return result;
}

/** Get verdict precedence order — for external validation */
export function getVerdictPrecedence(): ReadonlyArray<LexVerdictExtended> {
  return VERDICT_PRECEDENCE;
}

/** Check if a verdict is terminal */
export function isTerminalVerdict(verdict: LexVerdictExtended): boolean {
  return TERMINAL_VERDICTS.has(verdict);
}
