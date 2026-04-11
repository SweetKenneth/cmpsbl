/**
 * CMPSBL® Execution Engine — Policy-Driven Resilience Layer (FAILSAFE)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Three-layer execution controller:
 *   1. Retry Policy — rule-driven retry with configurable backoff
 *   2. Circuit Breaker — per-primitive open/half_open/closed state
 *   3. Execution Telemetry — structured effect emission for verification
 *
 * Follows the interception engine pattern:
 *   - Configurable rules sorted by priority
 *   - Deterministic evaluation
 *   - Every decision emits a verifiable event
 *   - Zero mutation of L1 behavior
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ExecutionAction = 'retry' | 'fail' | 'trip';

export type ExecutionEffect =
  | 'execution_attempted'
  | 'execution_retried'
  | 'execution_failed'
  | 'execution_succeeded'
  | 'circuit_opened'
  | 'circuit_blocked'
  | 'circuit_half_open';

export interface ExecutionRule {
  readonly id: string;
  readonly priority?: number;
  readonly test: (error: unknown, attempt: number) => boolean;
  readonly action: ExecutionAction;
  readonly maxAttempts?: number;
  readonly backoffMs?: (attempt: number) => number;
}

export interface ExecutionEvent {
  readonly primitive: string;
  readonly ruleId?: string;
  readonly effect: ExecutionEffect;
  readonly attempt: number;
  readonly timestamp: number;
  readonly error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — CIRCUIT BREAKER STATE
// ═══════════════════════════════════════════════════════════════════════════════

type CircuitState = 'closed' | 'open' | 'half_open';

interface CircuitRecord {
  state: CircuitState;
  failureCount: number;
  lastFailureAt: number;
}

/** Per-primitive circuit state */
const circuits = new Map<string, CircuitRecord>();

/** Cooldown before an open circuit transitions to half_open (ms) */
const CIRCUIT_COOLDOWN_MS = 30_000;

/** Failure threshold before circuit opens */
const CIRCUIT_FAILURE_THRESHOLD = 5;

function getCircuit(primitive: string): CircuitRecord {
  let record = circuits.get(primitive);
  if (!record) {
    record = { state: 'closed', failureCount: 0, lastFailureAt: 0 };
    circuits.set(primitive, record);
  }

  /* Transition open → half_open after cooldown */
  if (
    record.state === 'open' &&
    Date.now() - record.lastFailureAt >= CIRCUIT_COOLDOWN_MS
  ) {
    record.state = 'half_open';
  }

  return record;
}

function openCircuit(primitive: string): void {
  const record = getCircuit(primitive);
  record.state = 'open';
  record.lastFailureAt = Date.now();
}

function recordFailure(primitive: string): void {
  const record = getCircuit(primitive);
  record.failureCount++;
  record.lastFailureAt = Date.now();

  if (record.failureCount >= CIRCUIT_FAILURE_THRESHOLD) {
    record.state = 'open';
  }
}

function resetCircuit(primitive: string): void {
  const record = circuits.get(primitive);
  if (record) {
    record.state = 'closed';
    record.failureCount = 0;
  }
}

/** Read-only circuit snapshot (for verification / telemetry) */
export function getCircuitState(primitive: string): Readonly<CircuitRecord> {
  return { ...getCircuit(primitive) };
}

/** Reset all circuits (testing only) */
export function resetAllCircuits(): void {
  circuits.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — RULE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const executionRules: ExecutionRule[] = [];
const executionEvents: ExecutionEvent[] = [];

/** Register a new execution rule (sorted by descending priority) */
export function registerExecutionRule(rule: ExecutionRule): void {
  executionRules.push(rule);
  executionRules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/** Remove a rule by ID */
export function removeExecutionRule(ruleId: string): boolean {
  const idx = executionRules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  executionRules.splice(idx, 1);
  return true;
}

/** Get all registered rules (immutable snapshot) */
export function getExecutionRules(): readonly ExecutionRule[] {
  return [...executionRules];
}

/** Get all execution events (immutable snapshot) — proof layer */
export function getExecutionEvents(): readonly ExecutionEvent[] {
  return [...executionEvents];
}

/** Get events for a specific primitive */
export function getExecutionEventsForPrimitive(
  primitive: string,
): readonly ExecutionEvent[] {
  return executionEvents.filter(e => e.primitive === primitive);
}

/** Reset all rules, events, and circuits (testing only) */
export function resetExecutionEngine(): void {
  executionRules.length = 0;
  executionEvents.length = 0;
  circuits.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function emitEvent(
  primitive: string,
  effect: ExecutionEffect,
  attempt: number,
  ruleId?: string,
  error?: unknown,
): void {
  executionEvents.push({
    primitive,
    ruleId,
    effect,
    attempt,
    timestamp: Date.now(),
    error: error instanceof Error ? error.message : error ? String(error) : undefined,
  });
}

function matchRule(error: unknown, attempt: number): ExecutionRule | undefined {
  for (const rule of executionRules) {
    try {
      if (rule.test(error, attempt)) return rule;
    } catch {
      /* Malformed test — skip, never crash the engine */
    }
  }
  return undefined;
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — EXECUTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wrap a function with policy-driven execution control.
 *
 * Flow per call:
 *   1. Check circuit — if open, block immediately
 *   2. If half_open, emit signal and allow one probe call
 *   3. Execute function
 *   4. On success → emit succeeded, reset circuit
 *   5. On failure → evaluate rules by priority:
 *      - 'retry' → backoff + re-execute (up to maxAttempts)
 *      - 'trip'  → open circuit, throw
 *      - 'fail'  → throw immediately
 *      - no match → record failure, throw
 */
export function wrapExecution<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
): T {
  return (async function executionWrapper(this: any, ...args: any[]) {
    const circuit = getCircuit(primitiveName);

    /* ── Circuit open → block immediately ── */
    if (circuit.state === 'open') {
      emitEvent(primitiveName, 'circuit_blocked', 0);
      throw new Error(`[${primitiveName}] circuit open — execution blocked`);
    }

    /* ── Half-open → signal probe attempt ── */
    if (circuit.state === 'half_open') {
      emitEvent(primitiveName, 'circuit_half_open', 0);
    }

    let attempt = 0;

    while (true) {
      attempt++;
      emitEvent(primitiveName, 'execution_attempted', attempt);

      try {
        const result = await targetFn.apply(this, args);

        emitEvent(primitiveName, 'execution_succeeded', attempt);
        resetCircuit(primitiveName);

        return result;
      } catch (error: unknown) {
        emitEvent(primitiveName, 'execution_failed', attempt, undefined, error);

        const rule = matchRule(error, attempt);

        /* No matching rule → record failure, throw */
        if (!rule || rule.action === 'fail') {
          recordFailure(primitiveName);
          throw error;
        }

        /* Trip → open circuit immediately */
        if (rule.action === 'trip') {
          openCircuit(primitiveName);
          emitEvent(primitiveName, 'circuit_opened', attempt, rule.id, error);
          throw error;
        }

        /* Retry → backoff + loop (up to maxAttempts) */
        if (rule.action === 'retry') {
          const max = rule.maxAttempts ?? 3;
          if (attempt >= max) {
            recordFailure(primitiveName);
            throw error;
          }

          emitEvent(primitiveName, 'execution_retried', attempt, rule.id, error);

          const delay = rule.backoffMs?.(attempt) ?? 0;
          await sleep(delay);

          continue;
        }
      }
    }
  }) as unknown as T;
}
