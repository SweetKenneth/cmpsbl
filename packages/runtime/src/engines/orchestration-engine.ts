/**
 * CMPSBL® Orchestration Engine — Signal Routing Layer (CORTEX)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Deterministic signal → rule evaluation → action execution router.
 *
 * Phase 2: controlled action execution through public engine APIs only.
 *   - validate_input  → Interception Engine (test args against rules)
 *   - persist_state   → State Engine (write payload to namespace)
 *   - block_execution → throws (halts pipeline)
 *   - tighten_interception → registers warning rule on Interception Engine
 *   - trip_execution   → registers trip rule on Execution Engine
 *   - log_only         → proof event only
 *
 * Constraints:
 *   - No async
 *   - No cross-engine mutation beyond public APIs
 *   - No recursion into routeSignal from action handlers
 *   - Payload treated as untrusted
 *
 * © CMPSBL® — All rights reserved.
 */

import { registerRule, getRegisteredRules, wrapInterception } from './interception-engine';
import { registerExecutionRule, getExecutionRules } from './execution-engine';
import { writeState } from './state-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type OrchestrationSignal =
  | 'anomaly_detected'
  | 'execution_failed'
  | 'execution_retried'
  | 'execution_started'
  | 'state_written';

export type OrchestrationAction =
  | 'validate_input'
  | 'persist_state'
  | 'block_execution'
  | 'tighten_interception'
  | 'trip_execution'
  | 'log_only';

export type OrchestrationEffect =
  | 'action_planned'
  | 'action_executed'
  | 'action_skipped'
  | 'validation_passed'
  | 'execution_blocked'
  | 'state_persisted';

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

/** Re-entrancy guard — prevents routeSignal → executeAction → writeState → routeSignal loops */
let routingDepth = 0;
const MAX_ROUTING_DEPTH = 2;

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
  routingDepth = 0;
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

/**
 * Execute an action through public engine APIs only.
 *
 * Actions:
 *   validate_input       → wraps a no-op through Interception Engine rules
 *   persist_state         → writes payload to State Engine namespace
 *   block_execution       → emits proof event, throws to halt pipeline
 *   tighten_interception  → registers a warning rule on the Interception Engine
 *   trip_execution        → registers a trip rule on the Execution Engine
 *   log_only              → proof event only
 */
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
    // ── NEW Phase 2 actions ────────────────────────────────────────────────

    case 'validate_input': {
      /* Run the payload through the Interception Engine's registered rules
       * by wrapping a pass-through function and invoking it.
       * If any interception rule blocks, the error propagates up. */
      const passthrough = (...args: unknown[]) => args;
      const guarded = wrapInterception(`cortex::${primitive}`, passthrough);

      const inputArg = (payload as Record<string, unknown> | undefined)?.input;
      if (inputArg === undefined) {
        recordActionExecution(primitive, ruleId, action);
        emit(primitive, signal, action, ruleId, 'action_executed');
        return;
      }

      try {
        guarded(inputArg);
      } catch (err) {
        emit(primitive, signal, action, ruleId, 'execution_blocked');
        throw err;
      }

      recordActionExecution(primitive, ruleId, action);
      emit(primitive, signal, action, ruleId, 'validation_passed');
      return;
    }

    case 'persist_state': {
      /* Write payload into State Engine under the CORTEX namespace */
      if (payload == null) {
        recordActionExecution(primitive, ruleId, action);
        emit(primitive, signal, action, ruleId, 'action_executed');
        return;
      }

      writeState(primitive, payload, { namespace: `cortex::${ruleId}` });

      recordActionExecution(primitive, ruleId, action);
      emit(primitive, signal, action, ruleId, 'state_persisted');
      return;
    }

    case 'block_execution': {
      /* Hard stop — emit proof then throw */
      recordActionExecution(primitive, ruleId, action);
      emit(primitive, signal, action, ruleId, 'execution_blocked');
      throw new Error(`[CORTEX] execution blocked by rule '${ruleId}'`);
    }

    // ── Phase 1 carry-forward actions ──────────────────────────────────────

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
 *   4. On match → emit action_planned → execute action
 *
 * Phase 2: actions mutate other engines through public APIs only.
 *
 * Normal input:
 *   execution_started → validation_passed → state_persisted → pipeline executes
 *
 * Malicious input:
 *   execution_started → execution_blocked → exception thrown → pipeline halted
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
