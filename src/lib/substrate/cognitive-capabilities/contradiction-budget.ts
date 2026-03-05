/**
 * Contradiction Budgeting
 * Per-cycle limit on memory self-correction to prevent wholesale rewrites.
 * Each dream cycle can only correct a bounded number of contradictions.
 */

import { emit } from '../events';

export interface ContradictionBudgetConfig {
  maxCorrectionsPerCycle: number;    // Hard cap on corrections per cycle (default 5)
  maxCorrectionsPerDay: number;      // Daily aggregate cap (default 20)
  cooldownAfterMaxMs: number;        // Cooldown after hitting cycle cap (default 30min)
  severityWeights: {                 // How much budget each severity level consumes
    low: number;                     // default 1
    medium: number;                  // default 2
    high: number;                    // default 3
    critical: number;                // default 5
  };
}

export interface ContradictionBudgetState {
  nodeId: string;
  cycleCorrections: number;
  dayCorrections: number;
  budgetRemaining: number;
  dayBudgetRemaining: number;
  lastCorrectionAt: string | null;
  lastResetAt: string;
  cooldownUntil: string | null;
  isExhausted: boolean;
}

interface NodeBudgetTracker {
  cycleCorrections: number;
  dayCorrections: number;
  lastCorrectionAt: number | null;
  cycleStartedAt: number;
  dayStartedAt: number;
  cooldownUntil: number | null;
}

const DEFAULT_CONFIG: ContradictionBudgetConfig = {
  maxCorrectionsPerCycle: 5,
  maxCorrectionsPerDay: 20,
  cooldownAfterMaxMs: 30 * 60 * 1000,
  severityWeights: { low: 1, medium: 2, high: 3, critical: 5 },
};

const trackers = new Map<string, NodeBudgetTracker>();
let budgetConfig = { ...DEFAULT_CONFIG };

function ensureTracker(nodeId: string): NodeBudgetTracker {
  const id = nodeId.toUpperCase();
  let tracker = trackers.get(id);
  if (!tracker) {
    const now = Date.now();
    tracker = {
      cycleCorrections: 0,
      dayCorrections: 0,
      lastCorrectionAt: null,
      cycleStartedAt: now,
      dayStartedAt: now,
      cooldownUntil: null,
    };
    trackers.set(id, tracker);
  }

  // Auto-reset day budget if 24h elapsed
  const now = Date.now();
  if (now - tracker.dayStartedAt > 24 * 60 * 60 * 1000) {
    tracker.dayCorrections = 0;
    tracker.dayStartedAt = now;
  }

  return tracker;
}

/**
 * Attempt to consume contradiction budget for a correction.
 * Returns true if the correction is allowed, false if budget is exhausted.
 */
export function enforceContradictionBudget(
  nodeId: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
): boolean {
  const id = nodeId.toUpperCase();
  const tracker = ensureTracker(id);
  const cfg = budgetConfig;
  const now = Date.now();

  // Check cooldown
  if (tracker.cooldownUntil && now < tracker.cooldownUntil) {
    emit({
      module: id.toLowerCase(),
      event_type: 'contradiction_budget_blocked',
      outcome: 'failed',
      data: { reason: 'cooldown', cooldownRemainingMs: tracker.cooldownUntil - now },
    });
    return false;
  }

  const cost = cfg.severityWeights[severity];

  // Check cycle budget
  if (tracker.cycleCorrections + cost > cfg.maxCorrectionsPerCycle) {
    tracker.cooldownUntil = now + cfg.cooldownAfterMaxMs;
    emit({
      module: id.toLowerCase(),
      event_type: 'contradiction_budget_exhausted',
      outcome: 'failed',
      data: { scope: 'cycle', corrections: tracker.cycleCorrections, max: cfg.maxCorrectionsPerCycle },
    });
    return false;
  }

  // Check daily budget
  if (tracker.dayCorrections + cost > cfg.maxCorrectionsPerDay) {
    emit({
      module: id.toLowerCase(),
      event_type: 'contradiction_budget_exhausted',
      outcome: 'failed',
      data: { scope: 'day', corrections: tracker.dayCorrections, max: cfg.maxCorrectionsPerDay },
    });
    return false;
  }

  // Consume budget
  tracker.cycleCorrections += cost;
  tracker.dayCorrections += cost;
  tracker.lastCorrectionAt = now;

  emit({
    module: id.toLowerCase(),
    event_type: 'contradiction_corrected',
    outcome: 'succeeded',
    data: { severity, cost, cycleUsed: tracker.cycleCorrections, dayUsed: tracker.dayCorrections },
  });

  return true;
}

/**
 * Get current contradiction budget state for a node.
 */
export function getContradictionBudgetState(nodeId: string): ContradictionBudgetState {
  const id = nodeId.toUpperCase();
  const tracker = ensureTracker(id);
  const cfg = budgetConfig;

  return {
    nodeId: id,
    cycleCorrections: tracker.cycleCorrections,
    dayCorrections: tracker.dayCorrections,
    budgetRemaining: Math.max(0, cfg.maxCorrectionsPerCycle - tracker.cycleCorrections),
    dayBudgetRemaining: Math.max(0, cfg.maxCorrectionsPerDay - tracker.dayCorrections),
    lastCorrectionAt: tracker.lastCorrectionAt ? new Date(tracker.lastCorrectionAt).toISOString() : null,
    lastResetAt: new Date(tracker.cycleStartedAt).toISOString(),
    cooldownUntil: tracker.cooldownUntil ? new Date(tracker.cooldownUntil).toISOString() : null,
    isExhausted: tracker.cycleCorrections >= cfg.maxCorrectionsPerCycle ||
                 tracker.dayCorrections >= cfg.maxCorrectionsPerDay,
  };
}

/**
 * Reset cycle budget for a node (called at start of new dream cycle).
 */
export function resetContradictionBudget(nodeId: string): void {
  const id = nodeId.toUpperCase();
  const tracker = ensureTracker(id);
  tracker.cycleCorrections = 0;
  tracker.cooldownUntil = null;
  tracker.cycleStartedAt = Date.now();

  emit({
    module: id.toLowerCase(),
    event_type: 'contradiction_budget_reset',
    outcome: 'succeeded',
    data: { dayRemaining: budgetConfig.maxCorrectionsPerDay - tracker.dayCorrections },
  });
}
