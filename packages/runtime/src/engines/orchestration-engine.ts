/**
 * CMPSBL® Orchestration Engine — Signal Routing Layer (CORTEX)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Deterministic signal → policy → rule evaluation → action chain execution.
 *
 * Phase 5.2: separation of detection from enforcement.
 *   - validate_input        → DETECT only (flags ctx.validationFailed)
 *   - block_execution       → ENFORCE only (throws if ctx.validationFailed)
 *   - persist_state         → State Engine (write payload to namespace)
 *   - tighten_interception  → registers warning rule on Interception Engine
 *   - trip_execution        → registers trip rule on Execution Engine
 *   - log_only              → proof event only
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
import { resolveCapabilityActions, isCapabilityRegistered } from './capability-registry';
import { resolveCondition } from './condition-resolver';
import { validateAttachment } from './attachment-schema';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type OrchestrationSignal =
  | 'anomaly_detected'
  | 'execution_failed'
  | 'execution_retried'
  | 'execution_started'
  | 'execution_succeeded'
  | 'rule_registered'
  | 'state_written'
  | 'validation_failed';

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
  | 'validation_failed'
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

/** Declarative policy attached to an artifact entry (Phase 5) */
export interface AttachmentPolicy {
  readonly on: OrchestrationSignal;
  readonly condition?: string;
  readonly then: OrchestrationAction | readonly OrchestrationAction[];
}

/** Mana attachment entry — extended with optional policy (Phase 5) */
export interface AttachmentEntry {
  readonly functionName: string;
  readonly capability: string;
  readonly primitive: string;
  readonly policy?: AttachmentPolicy;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const rules: OrchestrationRule[] = [];
const events: OrchestrationEvent[] = [];
const MAX_EVENTS = 10_000;
const actionHistory = new Map<string, number>();

/** Re-entrancy guard — prevents routeSignal → executeAction → writeState → routeSignal loops */
let routingDepth = 0;
const MAX_ROUTING_DEPTH = 2;

const ACTION_COOLDOWN_MS = 30_000;
const MAX_ACTION_HISTORY = 500;

/** Actions exempt from cooldown — security-critical actions must always execute */
const COOLDOWN_EXEMPT_ACTIONS: ReadonlySet<OrchestrationAction> = new Set<OrchestrationAction>([
  'validate_input',
  'block_execution',
]);

/**
 * Chain-local execution context — carries state between actions in a single chain.
 * `validationFailed` is set by `validate_input` when injection is detected,
 * and read by `block_execution` to decide whether to throw.
 */
interface ChainContext {
  validationFailed: boolean;
}

/** Built-in injection patterns for validate_input (DEFENSE-grade) */
const INJECTION_PATTERNS: readonly RegExp[] = [
  /<script[\s>]/i,
  /javascript:/i,
  /on(?:load|error|click|mouseover)=/i,
  /<iframe[\s>]/i,
  /<object[\s>]/i,
  /<embed[\s>]/i,
];

/**
 * Active attachment registry — maps ruleId → AttachmentEntry.
 * Used by routeSignal to resolve policy action chains at execution time.
 */
const attachmentRegistry = new Map<string, AttachmentEntry>();

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
  /* Security-critical actions are never skipped by cooldown */
  if (COOLDOWN_EXEMPT_ACTIONS.has(action)) return false;

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
  attachmentRegistry.delete(ruleId);
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
// §4b — RULE QUERIES (Phase 3 — Activation Proof)
// ═══════════════════════════════════════════════════════════════════════════════

/** Total registered rule count */
export function getRegisteredRuleCount(): number {
  return rules.length;
}

/** All registered rule IDs */
export function getRegisteredRuleIds(): readonly string[] {
  return rules.map(r => r.id);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — RESET (TESTING ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export function resetOrchestrationEngine(): void {
  rules.length = 0;
  events.length = 0;
  actionHistory.clear();
  attachmentRegistry.clear();
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
 * Execute a single action through public engine APIs only.
 * Accepts a ChainContext to carry state between chained actions.
 */
function executeAction(
  primitive: string,
  signal: OrchestrationSignal,
  action: OrchestrationAction,
  ruleId: string,
  payload?: unknown,
  ctx?: ChainContext,
): void {
  if (shouldSkipAction(primitive, ruleId, action)) {
    emit(primitive, signal, action, ruleId, 'action_skipped');
    return;
  }

  switch (action) {
    case 'validate_input': {
      /**
       * Phase 5.2 — DETECT ONLY.
       * validate_input inspects the payload and sets ctx.validationFailed
       * but never throws. Enforcement is delegated to block_execution.
       * This enables composable chains: detect-only, detect+log, detect+block.
       */
      const inputArg = (payload as Record<string, unknown> | undefined)?.input;
      if (inputArg === undefined) {
        recordActionExecution(primitive, ruleId, action);
        emit(primitive, signal, action, ruleId, 'action_executed');
        return;
      }

      let detected = false;

      /* Built-in injection detection (DEFENSE-grade) */
      if (typeof inputArg === 'string') {
        detected = INJECTION_PATTERNS.some(p => p.test(inputArg));
      }

      /* Also check interception engine rules */
      if (!detected) {
        const passthrough = (...args: unknown[]) => args;
        const guarded = wrapInterception(`cortex::${primitive}`, passthrough);
        try {
          guarded(inputArg);
        } catch {
          detected = true;
        }
      }

      if (detected) {
        if (ctx) ctx.validationFailed = true;
        recordActionExecution(primitive, ruleId, action);
        emit(primitive, signal, action, ruleId, 'validation_failed');
        return;   /* ← no throw — block_execution handles enforcement */
      }

      recordActionExecution(primitive, ruleId, action);
      emit(primitive, signal, action, ruleId, 'validation_passed');
      return;
    }

    case 'persist_state': {
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
      /* In a chain context, block_execution is conditional —
       * it only throws if a prior validate_input flagged an issue.
       * When used standalone (no ctx), it blocks unconditionally. */
      if (ctx && !ctx.validationFailed) {
        recordActionExecution(primitive, ruleId, action);
        emit(primitive, signal, action, ruleId, 'action_executed');
        return;
      }
      recordActionExecution(primitive, ruleId, action);
      emit(primitive, signal, action, ruleId, 'execution_blocked');
      throw new Error(`[CORTEX] execution blocked by rule '${ruleId}'`);
    }

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
// §6c — ACTION CHAIN EXECUTOR (Phase 5)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Execute a deterministic sequence of actions for a single rule match.
 * A shared ChainContext carries state (e.g. validationFailed) between actions.
 * Actions run in order; if any throws (e.g. block_execution), the chain halts.
 */
function executeActionChain(
  primitive: string,
  signal: OrchestrationSignal,
  actions: readonly OrchestrationAction[],
  ruleId: string,
  payload?: unknown,
): void {
  const ctx: ChainContext = { validationFailed: false };
  for (const action of actions) {
    try {
      executeAction(primitive, signal, action, ruleId, payload, ctx);
    } catch (err) {
      /* Terminal — execution_blocked halts the entire chain immediately */
      throw err;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6d — POLICY ACTION RESOLVER (Phase 5)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve the action chain for a matched rule.
 *
 * If the rule was registered from an attachment with a policy,
 * the policy's `then` field takes precedence (may be an array).
 * Otherwise falls back to the single action stored on the rule.
 */
function resolveRuleActions(
  ruleId: string,
  fallbackAction: OrchestrationAction,
): readonly OrchestrationAction[] {
  const attachment = attachmentRegistry.get(ruleId);
  if (!attachment) return [fallbackAction];

  /* If policy has explicit `then`, respect it */
  if (attachment.policy) {
    const thenActions = attachment.policy.then;
    return Array.isArray(thenActions)
      ? thenActions as readonly OrchestrationAction[]
      : [thenActions as OrchestrationAction];
  }

  /* No policy — use capability-derived chain (includes enforcement) */
  return mapCapabilityToActions(attachment.capability);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — SIGNAL ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Route a signal from any engine through the orchestration rule set.
 *
 * Phase 5: supports policy-driven action chains.
 *
 * Evaluation is deterministic:
 *   1. Iterate rules by priority (descending)
 *   2. Match on signal type
 *   3. If rule.test exists, evaluate it (swallow test errors)
 *   4. On match → resolve action chain → execute sequentially
 */
export function routeSignal(
  primitive: string,
  signal: OrchestrationSignal,
  payload?: unknown,
): void {
  if (routingDepth >= MAX_ROUTING_DEPTH) return;

  routingDepth++;
  try {
    for (const rule of rules) {
      if (rule.signal !== signal) continue;

      let matched = true;

      if (rule.test) {
        try {
          matched = rule.test(payload);
        } catch {
          continue;
        }
      }

      if (!matched) continue;

      const actions = resolveRuleActions(rule.id, rule.action);

      /* Emit action_planned for each action in the chain */
      for (const action of actions) {
        emit(primitive, signal, action, rule.id, 'action_planned');
      }

      executeActionChain(primitive, signal, actions, rule.id, payload);
    }
  } finally {
    routingDepth--;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — CAPABILITY → ACTION MAPPER (Phase 2 — delegated to capability-registry)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Map a Mana capability slug to a deterministic action chain.
 * Delegates to the Capability Registry (Phase 2).
 */
function mapCapabilityToActions(capability: string): readonly OrchestrationAction[] {
  return resolveCapabilityActions(capability);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8b — CONDITION RESOLVER (Phase 2 — delegated to condition-resolver)
// ═══════════════════════════════════════════════════════════════════════════════

/* Condition resolution is now handled by the imported resolveCondition from
 * './condition-resolver'. The function supports composable AND/OR/NOT syntax
 * and a declarative condition registry. See condition-resolver.ts for details. */

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — ATTACHMENT → RULE AUTO-BINDING (Phase 5 — policy-first)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Register orchestration rules derived from Mana attachments.
 *
 * Phase 2 stabilization:
 *   - Every attachment is validated before consumption.
 *   - Invalid attachments are rejected with a thrown error.
 *   - No silent fallbacks — capability must be registered,
 *     conditions must be resolvable.
 *   - Rules are deduplicated by ID so this is safe to call multiple times.
 */
export function registerAttachmentRules(
  primitive: string,
  attachments: ReadonlyArray<AttachmentEntry>,
): void {
  for (const a of attachments) {
    /* ── Gate: validate before consumption ── */
    const validation = validateAttachment(a);
    if (!validation.valid) {
      throw new Error(
        `[CORTEX] Invalid attachment for '${a.functionName}': ${validation.errors.join('; ')}`,
      );
    }

    const ruleId = `attachment::${a.functionName}::${a.capability}`;

    const exists = rules.some(r => r.id === ruleId);
    if (exists) continue;

    /* Determine signal — policy overrides default */
    const signal: OrchestrationSignal = a.policy?.on ?? 'execution_started';

    /* Resolve condition test from policy string key */
    const conditionTest = resolveCondition(a.policy?.condition);

    /* Determine the single action stored on the rule.
     * For policy chains, the first action is stored here;
     * the full chain is resolved at execution time from attachmentRegistry. */
    const primaryAction: OrchestrationAction = a.policy
      ? (Array.isArray(a.policy.then)
        ? a.policy.then[0] as OrchestrationAction
        : a.policy.then as OrchestrationAction)
      : mapCapabilityToActions(a.capability)[0];

    registerOrchestrationRule({
      id: ruleId,
      priority: 500,
      signal,
      test: (payload: unknown) => {
        if (typeof payload !== 'object' || payload === null) return false;

        const fn = (payload as Record<string, unknown>).function;
        if (typeof fn !== 'string' || fn !== a.functionName) return false;

        if (!conditionTest) return true;
        return conditionTest(payload);
      },
      action: primaryAction,
    });

    /* Store attachment in registry so resolveRuleActions can find the full chain */
    attachmentRegistry.set(ruleId, a);

    emit(primitive, 'rule_registered', primaryAction, ruleId, 'action_planned');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §10 — ORCHESTRATION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wrap a function with orchestration-layer observation.
 *
 * Currently a pass-through — the orchestration engine acts on
 * signals from other engines, not on direct function calls.
 * This wrapper exists for generic-wrapper routing compatibility.
 */
export function wrapOrchestration<T extends (...args: unknown[]) => unknown>(
  _primitiveName: string,
  targetFn: T,
): T {
  /* Orchestration is reactive — it routes signals from other engines.
   * The wrapper itself doesn't alter execution. */
  return targetFn;
}
