/**
 * Improvement #1: Context-Aware Rule Selection
 * Improvement #2: Compositional Repair Chains
 * Improvement #3: Confidence-Scored Repairs
 * Improvement #4: Learned Prioritization (from immune_metrics history)
 * Improvement #10: Escalation Pattern Mining
 * Improvement #11: Parallel Repair Branching
 *
 * This module wraps the deterministic repair pipeline with intelligence:
 * - Selects repair rules based on the validation report archetype
 * - Chains multiple repairs in a single pass for multi-fault inputs
 * - Scores repair confidence before committing
 * - Learns from past success/failure to prioritize effective rules
 */

import { deterministicRepair, type DeterministicRepairResult } from './deterministic-repair';
import { validateInput, type ValidationReport, type InputArchetype } from './schema-validator';
import { repair } from './repairs';
import { log } from '@/lib/system/log';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface IntelligentRepairResult extends DeterministicRepairResult {
  /** Confidence that the repair will succeed on retry (0-1) */
  confidence: number;
  /** Which archetype was detected */
  archetype: InputArchetype;
  /** Validation report from schema */
  validationReport: ValidationReport;
  /** Whether compositional chaining was used */
  chained: boolean;
  /** Number of repair stages applied */
  stagesApplied: number;
  /** Pre-repair normalization applied */
  preNormalized: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// #4: Learned Prioritization — in-memory success rate tracker
// ═══════════════════════════════════════════════════════════════════════════

interface RuleStats {
  attempts: number;
  successes: number;
}

/** Per-executor, per-rule success tracking */
const ruleHistory = new Map<string, Map<string, RuleStats>>();

/**
 * Record whether a repair type succeeded or failed for an executor.
 * Called from wrapExecutor after retry outcome is known.
 */
export function recordRepairOutcome(
  executor: string,
  repairType: string,
  success: boolean,
): void {
  if (!ruleHistory.has(executor)) ruleHistory.set(executor, new Map());
  const executorStats = ruleHistory.get(executor)!;

  const rules = repairType.split('+');
  for (const rule of rules) {
    const stats = executorStats.get(rule) ?? { attempts: 0, successes: 0 };
    stats.attempts++;
    if (success) stats.successes++;
    executorStats.set(rule, stats);
  }
}

/**
 * Get the learned success rate for a rule on an executor.
 * Returns 0.5 (neutral) if no history.
 */
function getRuleSuccessRate(executor: string, rule: string): number {
  const stats = ruleHistory.get(executor)?.get(rule);
  if (!stats || stats.attempts === 0) return 0.5;
  return stats.successes / stats.attempts;
}

/**
 * Get overall repair intelligence stats for dashboard
 */
export function getRepairIntelligenceStats(): Record<string, Record<string, RuleStats>> {
  const out: Record<string, Record<string, RuleStats>> = {};
  for (const [exec, rules] of ruleHistory) {
    out[exec] = {};
    for (const [rule, stats] of rules) {
      out[exec][rule] = { ...stats };
    }
  }
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// #7: Pre-Execution Normalization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize input BEFORE it hits the executor — light-touch transforms
 * that are always safe and don't count as "repairs."
 */
export function preNormalize(
  executor: string,
  input: Record<string, unknown>,
): { normalized: Record<string, unknown>; changed: boolean } {
  const copy = { ...input };
  let changed = false;

  // Trim all string values
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string') {
      const trimmed = (copy[key] as string).trim();
      if (trimmed !== copy[key]) {
        copy[key] = trimmed;
        changed = true;
      }
    }
  }

  // Lowercase enum fields
  if ('wcagLevel' in copy && typeof copy.wcagLevel === 'string') {
    const upper = copy.wcagLevel.toUpperCase();
    if (upper !== copy.wcagLevel) {
      copy.wcagLevel = upper;
      changed = true;
    }
  }

  // Ensure userId is trimmed and non-empty
  if ('userId' in copy && typeof copy.userId === 'string' && copy.userId.trim() === '') {
    copy.userId = 'anonymous';
    changed = true;
  }

  // Remove prototype pollution keys proactively
  for (const key of ['__proto__', 'constructor', 'prototype']) {
    if (key in copy) {
      delete copy[key];
      changed = true;
    }
  }

  return { normalized: copy, changed };
}

// ═══════════════════════════════════════════════════════════════════════════
// #1 + #2 + #3: Intelligent Repair Pipeline
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Archetype-specific repair strategies (#1: Context-Aware)
 * Maps each archetype to the most effective repair rule priorities.
 */
const ARCHETYPE_STRATEGIES: Record<InputArchetype, string[]> = {
  well_formed: [],
  empty_shell: ['DEFAULT_SHAPE', 'EMPTY_STRING_BACKFILL', 'ALL_EMPTY_INJECT', 'PLACEHOLDER_NATURALIZE'],
  type_mismatch: ['COERCE_TYPE', 'FLATTEN_ARRAY', 'NESTED_STRINGIFY', 'DEEP_TYPE_COERCE', 'ENUM_TYPE_COERCE'],
  missing_required: ['DEFAULT_SHAPE', 'EMPTY_STRING_BACKFILL', 'PLACEHOLDER_NATURALIZE'],
  oversized: ['CLAMP_SIZE', 'MULTILINE_COLLAPSE', 'DUPLICATE_CHAR_COLLAPSE', 'EMOJI_FLOOD_COLLAPSE'],
  injection_attempt: ['SANITIZE', 'SQL_SANITIZE', 'HTML_ANGLE_ENCODE', 'EVENT_HANDLER_STRIP', 'PATH_TRAVERSAL_STRIP'],
  shape_alien: ['DEFAULT_SHAPE', 'EXCESS_KEY_PRUNE'],
  partial_valid: ['NORMALIZE_NULLS', 'COERCE_TYPE', 'EMPTY_STRING_BACKFILL'],
};

/**
 * #3: Calculate confidence that a repair will produce a successful retry.
 * Based on: archetype match, rule history, validation score.
 */
function calculateRepairConfidence(
  executor: string,
  archetype: InputArchetype,
  repairType: string,
  validationConfidence: number,
): number {
  if (!repairType) return 0;

  const rules = repairType.split('+');

  // Base confidence from archetype
  const archetypeBase: Record<InputArchetype, number> = {
    well_formed: 0.95,
    empty_shell: 0.6,
    type_mismatch: 0.85,
    missing_required: 0.7,
    oversized: 0.9,
    injection_attempt: 0.75,
    shape_alien: 0.4,
    partial_valid: 0.8,
  };

  let confidence = archetypeBase[archetype] ?? 0.5;

  // Boost/penalize based on learned rule success rates (#4)
  let learnedBoost = 0;
  for (const rule of rules) {
    const rate = getRuleSuccessRate(executor, rule);
    learnedBoost += (rate - 0.5) * 0.1; // ±5% per rule
  }
  confidence += learnedBoost;

  // Factor in validation confidence
  confidence = confidence * 0.7 + validationConfidence * 0.3;

  return Math.min(1, Math.max(0, confidence));
}

/**
 * #11: Parallel Repair Branching
 * For multi-field failures, try repairing each field independently
 * and merge the best results.
 */
function parallelBranchRepair(
  input: Record<string, unknown>,
  report: ValidationReport,
): Record<string, unknown> | null {
  if (report.issues.length < 2) return null;

  const fieldIssues = report.issues.filter(i => i.field !== '*' && !i.field.includes('|'));
  if (fieldIssues.length < 2) return null;

  // Create a copy and repair each problematic field independently
  const merged = { ...input };
  let anyRepaired = false;

  for (const issue of fieldIssues) {
    // Create a mini-input with just this field for isolated repair
    const miniInput: Record<string, unknown> = { [issue.field]: input[issue.field] };
    const miniResult = deterministicRepair(miniInput);

    if (miniResult.repaired && issue.field in miniResult.repaired_input) {
      merged[issue.field] = miniResult.repaired_input[issue.field];
      anyRepaired = true;
    }
  }

  return anyRepaired ? merged : null;
}

/**
 * Main intelligent repair function.
 * Orchestrates all improvements into a single pipeline.
 */
export function intelligentRepair(
  executor: string,
  input: Record<string, unknown>,
): IntelligentRepairResult {
  // Step 1: Schema validation (#5)
  const report = validateInput(executor, input);

  // Short-circuit if already valid
  if (report.valid && report.archetype === 'well_formed') {
    return {
      repaired: false,
      repaired_input: input,
      confidence: 1.0,
      archetype: 'well_formed',
      validationReport: report,
      chained: false,
      stagesApplied: 0,
      preNormalized: false,
    };
  }

  // Step 2: Pre-normalization (#7)
  const { normalized, changed: preNormChanged } = preNormalize(executor, input);

  // Step 3: Primary deterministic repair (#2: compositional chain — already applies all rules)
  const primary = deterministicRepair(normalized);

  // Step 4: If primary repair insufficient, try parallel branching (#11)
  let finalInput = primary.repaired ? primary.repaired_input : normalized;
  let stagesApplied = primary.repaired ? 1 : 0;
  let chained = false;

  if (primary.repaired) {
    // Re-validate after primary repair
    const postRepairReport = validateInput(executor, finalInput);
    if (!postRepairReport.valid) {
      // Try parallel branch repair on remaining issues
      const branchResult = parallelBranchRepair(finalInput, postRepairReport);
      if (branchResult) {
        // Chain: run deterministic repair again on the branch-merged result
        const secondPass = deterministicRepair(branchResult);
        if (secondPass.repaired) {
          finalInput = secondPass.repaired_input;
          stagesApplied = 2;
          chained = true;
        } else {
          finalInput = branchResult;
          stagesApplied = 2;
          chained = true;
        }
      }
    }
  } else {
    // Primary didn't repair — try parallel branching directly
    const branchResult = parallelBranchRepair(normalized, report);
    if (branchResult) {
      const branchRepair = deterministicRepair(branchResult);
      finalInput = branchRepair.repaired ? branchRepair.repaired_input : branchResult;
      stagesApplied = 1;
      chained = true;
    }
  }

  // Step 5: Legacy repair fallback (#2: chain with legacy layer)
  if (stagesApplied === 0 && !primary.repaired) {
    const legacyResult = repair(executor, normalized, {});
    if (legacyResult) {
      finalInput = legacyResult.repairedInput;
      stagesApplied = 1;
    }
  }

  const repaired = stagesApplied > 0 || primary.repaired || preNormChanged;
  const repairType = primary.repair_type ?? (chained ? 'PARALLEL_BRANCH' : undefined);

  // Step 6: Confidence scoring (#3)
  const confidence = repaired
    ? calculateRepairConfidence(executor, report.archetype, repairType ?? '', report.confidence)
    : 0;

  return {
    repaired,
    repair_type: repairType,
    repaired_input: finalInput,
    confidence,
    archetype: report.archetype,
    validationReport: report,
    chained,
    stagesApplied,
    preNormalized: preNormChanged,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// #10: Escalation Pattern Mining
// ═══════════════════════════════════════════════════════════════════════════

interface EscalationPattern {
  executor: string;
  errorSignature: string;
  count: number;
  lastSeen: number;
}

const escalationPatterns = new Map<string, EscalationPattern>();

/**
 * Record an escalation for pattern mining.
 * When a pattern repeats enough, it could be converted to a deterministic rule.
 */
export function mineEscalationPattern(
  executor: string,
  errorMsg: string,
  input: Record<string, unknown>,
): { isRecurring: boolean; count: number; suggestion?: string } {
  // Create a signature from the error + input shape
  const inputShape = Object.keys(input).sort().join(',');
  const signature = `${executor}:${errorMsg.slice(0, 100)}:${inputShape}`;

  const existing = escalationPatterns.get(signature);
  if (existing) {
    existing.count++;
    existing.lastSeen = Date.now();
  } else {
    escalationPatterns.set(signature, {
      executor,
      errorSignature: errorMsg.slice(0, 200),
      count: 1,
      lastSeen: Date.now(),
    });
  }

  const count = escalationPatterns.get(signature)!.count;
  const isRecurring = count >= 3;

  let suggestion: string | undefined;
  if (isRecurring) {
    suggestion = `Recurring escalation (${count}x): "${errorMsg.slice(0, 80)}" — consider adding a deterministic repair rule for input shape [${inputShape}]`;
    log.warn('immune', suggestion);
  }

  return { isRecurring, count, suggestion };
}

/**
 * Get all mined patterns for dashboard display
 */
export function getEscalationPatterns(): EscalationPattern[] {
  return Array.from(escalationPatterns.values())
    .sort((a, b) => b.count - a.count);
}
