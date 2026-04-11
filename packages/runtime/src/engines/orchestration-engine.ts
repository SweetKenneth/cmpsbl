/**
 * CMPSBL® Orchestration Engine — Signal Routing Layer (CORTEX)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Deterministic signal → action router across engines.
 *
 * Inputs:  events from other engines
 * Outputs: actions + orchestration events (proof layer)
 *
 * Phase 1: routing + proof only (no cross-engine mutation).
 * Phase 2 will attach real engine hooks for dynamic adaptation.
 *
 * © CMPSBL® — All rights reserved.
 */

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
  | 'action_planned';

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
// §6b — ACTION HANDLER (Phase 2 Patch 1 — intent only, no mutation)
// ═══════════════════════════════════════════════════════════════════════════════

function executeAction(
  primitive: string,
  action: OrchestrationAction,
  _payload?: unknown,
): void {
  switch (action) {
    case 'tighten_interception':
      /* Phase 1: no mutation — intent only */
      break;

    case 'trip_execution':
      /* Phase 1: no mutation — intent only */
      break;

    case 'log_only':
      break;
  }

  /* Emit proof that action was planned */
  events.push({
    primitive,
    signal: 'state_written',
    action,
    ruleId: 'internal',
    timestamp: Date.now(),
    effect: 'action_planned',
  });
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
    executeAction(primitive, rule.action, payload);
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
