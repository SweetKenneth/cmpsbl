/**
 * CMPSBL® Condition Resolver — Composable Policy Conditions
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Phase 2: First-Class Attachments
 *
 * Replaces the hardcoded condition switch with a declarative,
 * extensible condition registry. Conditions are pure functions
 * identified by string keys — no freeform user code.
 *
 * Supports composition via AND/OR prefix syntax:
 *   - "and:cond_a,cond_b" — all must pass
 *   - "or:cond_a,cond_b"  — any must pass
 *   - "not:cond_a"        — negation
 *   - "cond_a"            — single condition (default)
 *
 * Design constraints:
 *   - No eval, no dynamic code execution
 *   - All conditions are synchronous
 *   - Unknown conditions resolve to undefined (rule always matches)
 *   - Composition depth is flat (no nesting)
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** A condition test function — receives the signal payload, returns boolean */
export type ConditionFn = (payload: unknown) => boolean;

/** Registered condition entry */
export interface ConditionDefinition {
  readonly key: string;
  readonly description: string;
  readonly test: ConditionFn;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const conditions = new Map<string, ConditionDefinition>();

/**
 * Register a named condition. Idempotent — first write wins.
 */
export function registerCondition(
  key: string,
  description: string,
  test: ConditionFn,
): boolean {
  if (conditions.has(key)) return false;
  conditions.set(key, { key, description, test });
  return true;
}

/**
 * Get all registered condition keys.
 */
export function getRegisteredConditions(): readonly string[] {
  return Array.from(conditions.keys());
}

/**
 * Get a condition definition by key.
 */
export function getConditionDefinition(key: string): ConditionDefinition | undefined {
  return conditions.get(key);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — RESOLVER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve a condition string to a test function.
 *
 * Supports composition:
 *   - "always"                 → single condition
 *   - "and:cond_a,cond_b"     → all must pass
 *   - "or:cond_a,cond_b"      → any must pass
 *   - "not:cond_a"            → negation
 *
 * Returns undefined if condition key is unknown (rule always matches).
 */
export function resolveCondition(condition?: string): ConditionFn | undefined {
  if (!condition) return undefined;

  /* Composition: AND */
  if (condition.startsWith('and:')) {
    const keys = condition.slice(4).split(',').map(k => k.trim());
    const fns = keys.map(k => conditions.get(k)?.test).filter(Boolean) as ConditionFn[];
    if (fns.length === 0) return undefined;
    return (payload: unknown) => fns.every(fn => fn(payload));
  }

  /* Composition: OR */
  if (condition.startsWith('or:')) {
    const keys = condition.slice(3).split(',').map(k => k.trim());
    const fns = keys.map(k => conditions.get(k)?.test).filter(Boolean) as ConditionFn[];
    if (fns.length === 0) return undefined;
    return (payload: unknown) => fns.some(fn => fn(payload));
  }

  /* Composition: NOT */
  if (condition.startsWith('not:')) {
    const key = condition.slice(4).trim();
    const fn = conditions.get(key)?.test;
    if (!fn) return undefined;
    return (payload: unknown) => !fn(payload);
  }

  /* Single condition */
  const def = conditions.get(condition);
  return def?.test;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — RESET (TESTING ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export function resetConditionRegistry(): void {
  conditions.clear();
  seedBuiltinConditions();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — BUILT-IN CONDITIONS
// ═══════════════════════════════════════════════════════════════════════════════

function seedBuiltinConditions(): void {
  registerCondition(
    'always',
    'Always matches — unconditional trigger',
    () => true,
  );

  registerCondition(
    'input_exists',
    'Matches when payload contains an input field',
    (payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return false;
      return 'input' in (payload as Record<string, unknown>);
    },
  );

  registerCondition(
    'input_contains_script',
    'Matches when input contains <script tag (XSS detection)',
    (payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return false;
      const input = (payload as Record<string, unknown>).input;
      return typeof input === 'string' && input.includes('<script');
    },
  );

  registerCondition(
    'input_is_string',
    'Matches when input field is a string type',
    (payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return false;
      const input = (payload as Record<string, unknown>).input;
      return typeof input === 'string';
    },
  );

  registerCondition(
    'input_is_empty',
    'Matches when input is undefined, null, or empty string',
    (payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return true;
      const input = (payload as Record<string, unknown>).input;
      return input === undefined || input === null || input === '';
    },
  );

  registerCondition(
    'input_contains_sql',
    'Matches when input contains SQL injection patterns',
    (payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return false;
      const input = (payload as Record<string, unknown>).input;
      if (typeof input !== 'string') return false;
      return /('|--|;|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i.test(input);
    },
  );

  registerCondition(
    'execution_failed',
    'Matches on execution_failed signal payloads',
    (payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return false;
      return (payload as Record<string, unknown>).error !== undefined;
    },
  );

  registerCondition(
    'high_latency',
    'Matches when execution duration exceeds 5000ms',
    (payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) return false;
      const duration = (payload as Record<string, unknown>).durationMs;
      return typeof duration === 'number' && duration > 5000;
    },
  );
}

/* Auto-seed on module load */
seedBuiltinConditions();
