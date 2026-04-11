/**
 * CMPSBL® Interception Engine — Policy-Driven Runtime Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Replaces naive hardcoded checks with a composable rule engine.
 *
 * Each rule defines:
 *   - test: how to detect bad input
 *   - action: block | warn | sanitize
 *   - sanitize (optional): how to rewrite args safely
 *
 * Every rule trigger produces a structured InterceptionEvent
 * that feeds into behavioral verification, audit, and CJPI scoring.
 *
 * Constraints:
 *   - Never mutates original function behavior unless sanitize is defined
 *   - Always emits events for verification (proof layer)
 *   - Deterministic: same input → same rule → same outcome
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type InterceptionAction = 'block' | 'warn' | 'sanitize';

export type InterceptionEffect = 'input_blocked' | 'input_sanitized' | 'input_flagged';

export interface InterceptionRule {
  readonly id: string;
  readonly priority?: number;
  readonly test: (args: readonly unknown[]) => boolean;
  readonly action: InterceptionAction;
  readonly sanitize?: (args: unknown[]) => unknown[];
}

export interface InterceptionEvent {
  readonly primitive: string;
  readonly ruleId: string;
  readonly action: InterceptionAction;
  readonly effect: InterceptionEffect;
  readonly timestamp: number;
  readonly argsSnapshot: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — RULE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const rules: InterceptionRule[] = [];
const events: InterceptionEvent[] = [];

/** Register a new interception rule (sorted by descending priority) */
export function registerRule(rule: InterceptionRule): void {
  rules.push(rule);
  rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

/** Remove a rule by ID */
export function removeRule(ruleId: string): boolean {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  rules.splice(idx, 1);
  return true;
}

/** Get all registered rules (immutable snapshot) */
export function getRegisteredRules(): readonly InterceptionRule[] {
  return [...rules];
}

/** Get all interception events (immutable snapshot) — proof layer */
export function getInterceptionEvents(): readonly InterceptionEvent[] {
  return [...events];
}

/** Get events for a specific primitive */
export function getEventsForPrimitive(primitive: string): readonly InterceptionEvent[] {
  return events.filter(e => e.primitive === primitive);
}

/** Reset all rules and events (testing only) */
export function resetInterceptionEngine(): void {
  rules.length = 0;
  events.length = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SAFE ARGS SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════

function snapshotArgs(args: readonly unknown[]): string {
  try {
    return JSON.stringify(args, (_key, value) => {
      if (typeof value === 'function') return '[Function]';
      if (typeof value === 'symbol') return value.toString();
      if (typeof value === 'bigint') return value.toString();
      return value;
    }).slice(0, 512);
  } catch {
    return '[unserializable]';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — EFFECT CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

function classifyEffect(action: InterceptionAction): InterceptionEffect {
  switch (action) {
    case 'block': return 'input_blocked';
    case 'sanitize': return 'input_sanitized';
    case 'warn': return 'input_flagged';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — INTERCEPTION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wrap a function with policy-driven interception.
 *
 * Evaluation order per call (rules sorted by descending priority):
 *   1. Iterate all rules against args
 *   2. First 'block' rule → emit event, throw immediately
 *   3. 'sanitize' rules → emit event, rewrite args, continue evaluating
 *   4. 'warn' rules → emit event, continue (warnings stack)
 *   5. Execute original function with (possibly sanitized) args
 */
export function wrapInterception<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
): T {
  return function (this: any, ...args: any[]) {
    let processedArgs = [...args];

    for (const rule of rules) {
      let matched = false;
      try {
        matched = rule.test(processedArgs);
      } catch {
        continue;
      }

      if (!matched) continue;

      const event: InterceptionEvent = {
        primitive: primitiveName,
        ruleId: rule.id,
        action: rule.action,
        effect: classifyEffect(rule.action),
        timestamp: Date.now(),
        argsSnapshot: snapshotArgs(processedArgs),
      };
      events.push(event);

      if (rule.action === 'block') {
        throw new Error(
          `[${primitiveName}] blocked by rule '${rule.id}'`
        );
      }

      if (rule.action === 'sanitize') {
        if (rule.sanitize) {
          processedArgs = rule.sanitize(processedArgs);
        }
        continue;
      }

      /* warn — event emitted, warnings stack */
    }

    return targetFn.apply(this, processedArgs);
  } as T;
}
