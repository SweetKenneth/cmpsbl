/**
 * CMPSBL® Orchestration Engine — Signal Routing Layer (CORTEX)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Deterministic signal → action router across engines.
 *
 * Inputs:  events from other engines
 * Outputs: actions + orchestration events (proof layer)
 *
 * Phase 2: controlled action execution through public APIs only.
 *
 * © CMPSBL® — All rights reserved.
 */

import { registerRule, getRegisteredRules } from './interception-engine';
import { registerExecutionRule, getExecutionRules } from './execution-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type OrchestrationSignal =
  | 'anomaly_detected'
  | 'execution_failed'
  | 'execution_retried'
  | 'state_written';

export type OrchestrationAction =
  | 'tighten_interception'
  | 'trip_execution'
  | 'log_only';

export type OrchestrationEffect =
  | 'action_planned'
  | 'action_executed'
  | 'action_skipped';

export interface OrchestrationRule {
  readonly id: string;
  readonly priority?: number;
  readonly signal: OrchestrationSignal;
  readonly test?: (payload: unknown) => boolean;
  readonly action: OrchestrationAction;
}

export interface OrchestrationEvent {
  readonly primitive: string;
  readonly signal: OrchestrationSignal;
  readonly action: OrchestrationAction;
  readonly ruleId: string;
  readonly timestamp: number;
  readonly effect: OrchestrationEffect;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const rules: OrchestrationRule[] = [];
const events: OrchestrationEvent[] = [];
const actionHistory = new Map<string, number>();

const ACTION_COOLDOWN_MS = 30_000;
const MAX_ACTION_HISTORY = 500;

// ═══════════════════════════════════════════════════════════════════════════════
// §2b — DETERMINISTIC AUTO-RULE ID HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function makeInterceptionAutoRuleId(primitive: string): string {
  return `cortex-tighten-${primitive}`;
}

function makeExecutionAutoRuleId(primitive: string): string {
  return `cortex-trip-${primitive}`;
}

function makeActionHistoryKey(
  primitive: string,
  ruleId: string,
  action: OrchestrationAction,
): string {
  return `${primitive}::${ruleId}::${action}`;
}

function shouldSkipAction(
  primitive: string,
  ruleId: string,
  action: OrchestrationAction,
): boolean {
  const key = makeActionHistoryKey(primitive, ruleId, action);
  const lastExecutedAt = actionHistory.get(key);

  if (lastExecutedAt == null) return false;

  return Date.now() - lastExecutedAt < ACTION_COOLDOWN_MS;
}

function recordActionExecution(
  primitive: string,
  ruleId: string,
  action: OrchestrationAction,
): void {
  const key = makeActionHistoryKey(primitive, ruleId, action);
  actionHistory.set(key, Date.now());

  if (actionHistory.size > MAX_ACTION_HISTORY) {
    const oldestKey = actionHistory.keys().next().value;
    if (oldestKey) {
      actionHistory.delete(oldestKey);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — RULE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

/** Register a new orchestration rule (sorted by descending priority) */
export function registerOrchestrationRule(rule: OrchestrationRule): void {
  rules.push(rule);
  rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/** Remove a rule by ID */
export function removeOrchestrationRule(ruleId: string): boolean {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  rules.splice(idx, 1);
  return true;
}

/** Get all registered rules (immutable snapshot) */
export function getOrchestrationRules(): readonly OrchestrationRule[] {
  return [...rules];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — EVENT ACCESS (PROOF LAYER)
// ═══════════════════════════════════════════════════════════════════════════════

export function getOrchestrationEvents(): readonly OrchestrationEvent[] {
  return [...events];
}

export function getOrchestrationEventsForPrimitive(
  primitive: string,
): readonly OrchestrationEvent[] {
  return events.filter(e => e.primitive === primitive);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — RESET (TESTING ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export function resetOrchestrationEngine(): void {
  rules.length = 0;
  events.length = 0;
  actionHistory.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — EVENT EMISSION
// ═══════════════════════════════════════════════════════════════════════════════

function emit(
  primitive: string,
  signal: OrchestrationSignal,
  action: OrchestrationAction,
  ruleId: string,
  effect: OrchestrationEffect,
): void {
  events.push({
    primitive,
    signal,
    action,
    ruleId,
    timestamp: Date.now(),
    effect,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6b — ACTION HANDLER (Phase 2 — controlled execution via public APIs)
// ═══════════════════════════════════════════════════════════════════════════════

function executeAction(
  primitive: string,
  signal: OrchestrationSignal,
  action: OrchestrationAction,
  ruleId: string,
  payload?: unknown,
): void {
  if (shouldSkipAction(primitive, ruleId, action)) {
    emit(primitive, signal, action, ruleId, 'action_skipped');
    return;
  }

  switch (action) {
    case 'tighten_interception': {
      const autoRuleId = makeInterceptionAutoRuleId(primitive);

      const alreadyExists = getRegisteredRules().some(
        r => r.id === autoRuleId,
      );

      if (!alreadyExists) {
        registerRule({
          id: autoRuleId,
          priority: 1000,
          test: () => true,
          action: 'warn',
        });
      }

      recordActionExecution(primitive, ruleId, action);
      emit(primitive, signal, action, ruleId, 'action_executed');
      return;
    }

    case 'trip_execution': {
      const autoRuleId = makeExecutionAutoRuleId(primitive);

      const alreadyExists = getExecutionRules().some(
        r => r.id === autoRuleId,
      );

      if (!alreadyExists) {
        registerExecutionRule({
          id: autoRuleId,
          priority: 1000,
          test: () => true,
          action: 'trip',
        });
      }

      recordActionExecution(primitive, ruleId, action);
      emit(primitive, signal, action, ruleId, 'action_executed');
      return;
    }

    case 'log_only': {
      recordActionExecution(primitive, ruleId, action);
      emit(primitive, signal, action, ruleId, 'action_executed');
      return;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — SIGNAL ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Route a signal from any engine through the orchestration rule set.
 *
 * Evaluation is deterministic:
 *   1. Iterate rules by priority (descending)
 *   2. Match on signal type
 *   3. If rule.test exists, evaluate it (swallow test errors)
 *   4. On match → emit orchestration event
 *
 * Phase 1: emit only — no cross-engine mutation.
 * Phase 2 will attach real engine hooks here.
 */
export function routeSignal(
  primitive: string,
  signal: OrchestrationSignal,
  payload?: unknown,
): void {
  for (const rule of rules) {
    if (rule.signal !== signal) continue;

    let matched = true;

    if (rule.test) {
      try {
        matched = rule.test(payload);
      } catch {
        /* Malformed test — skip, never crash the router */
        continue;
      }
    }

    if (!matched) continue;

    emit(primitive, signal, rule.action, rule.id, 'action_planned');
    executeAction(primitive, signal, rule.action, rule.id, payload);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — ORCHESTRATION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wrap a function with orchestration-layer observation.
 *
 * Currently a pass-through — the orchestration engine acts on
 * signals from other engines, not on direct function calls.
 * This wrapper exists for generic-wrapper routing compatibility.
 */
export function wrapOrchestration<T extends (...args: any[]) => any>(
  _primitiveName: string,
  targetFn: T,
): T {
  /* Orchestration is reactive — it routes signals from other engines.
   * The wrapper itself doesn't alter execution.
   * Future: could emit 'orchestration_invoked' if needed. */
  return targetFn;
}
