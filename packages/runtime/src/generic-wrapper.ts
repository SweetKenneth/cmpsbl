/**
 * CMPSBL® Generic Primitive Activation Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Universal runtime wrapper system that enables ANY primitive
 * to reach Activated and BehaviorallyVerified states without
 * requiring a hand-written definition.
 *
 * Safety constraints:
 *   - NEVER alters L1 behavior
 *   - NEVER blocks execution
 *   - Only observes + emits
 *
 * Specialized primitives (DEFENSE, MEMORY, etc.) override this
 * with richer behavior. This is the baseline fallback.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Standard effect emitted by generic wrappers */
export interface GenericEffect {
  readonly kind: 'call_interception' | 'telemetry_emit' | 'state_write';
  readonly primitiveName: string;
  readonly timestamp: number;
  readonly description: string;
}

/** Wrapper metadata returned after wrapping */
export interface WrapperHandle {
  readonly primitiveName: string;
  readonly wrappedAt: number;
  readonly hooksFiring: boolean;
}

/** Accumulated telemetry from all generic wrappers */
export interface GenericTelemetry {
  readonly effects: readonly GenericEffect[];
  readonly wrapperCount: number;
  readonly callCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — EFFECT COLLECTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Global effect collector — accumulates effects from all generic wrappers.
 * Read-only externally; only the wrapper internals push to it.
 */
const collectedEffects: GenericEffect[] = [];
let totalCallCount = 0;
const activeWrappers = new Map<string, WrapperHandle>();

/** Read collected effects (immutable snapshot) */
export function getCollectedEffects(): readonly GenericEffect[] {
  return [...collectedEffects];
}

/** Read telemetry summary */
export function getGenericTelemetry(): GenericTelemetry {
  return {
    effects: [...collectedEffects],
    wrapperCount: activeWrappers.size,
    callCount: totalCallCount,
  };
}

/** Reset collector (for testing only) */
export function resetCollector(): void {
  collectedEffects.length = 0;
  totalCallCount = 0;
  activeWrappers.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — GENERIC WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wrap a target function with generic observation hooks.
 *
 * The wrapper:
 *   1. Emits a `call_interception` effect on every call (pre-call)
 *   2. Invokes the original function UNMODIFIED
 *   3. Emits a `telemetry_emit` effect after successful return (post-call)
 *   4. On error: re-throws without modification (never swallows)
 *
 * This is a transparent observation layer — L1 behavior is never altered.
 */
export function wrapGeneric<TArgs extends unknown[], TReturn>(
  primitiveName: string,
  targetFn: (...args: TArgs) => TReturn,
): (...args: TArgs) => TReturn {
  // Register the wrapper
  const handle: WrapperHandle = {
    primitiveName,
    wrappedAt: Date.now(),
    hooksFiring: true,
  };
  activeWrappers.set(primitiveName, handle);

  return function genericWrapper(this: unknown, ...args: TArgs): TReturn {
    totalCallCount++;

    // Pre-call: interception signal
    collectedEffects.push({
      kind: 'call_interception',
      primitiveName,
      timestamp: Date.now(),
      description: `Generic wrapper intercepted call to ${primitiveName}-wrapped function`,
    });

    // Execute original — NEVER modify behavior
    const result = targetFn.apply(this, args);

    // Post-call: telemetry signal
    collectedEffects.push({
      kind: 'telemetry_emit',
      primitiveName,
      timestamp: Date.now(),
      description: `Telemetry emitted after ${primitiveName} execution completed`,
    });

    return result;
  };
}

/**
 * Async variant of wrapGeneric for promise-returning functions.
 */
export function wrapGenericAsync<TArgs extends unknown[], TReturn>(
  primitiveName: string,
  targetFn: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  const handle: WrapperHandle = {
    primitiveName,
    wrappedAt: Date.now(),
    hooksFiring: true,
  };
  activeWrappers.set(primitiveName, handle);

  return async function genericWrapperAsync(this: unknown, ...args: TArgs): Promise<TReturn> {
    totalCallCount++;

    collectedEffects.push({
      kind: 'call_interception',
      primitiveName,
      timestamp: Date.now(),
      description: `Generic wrapper intercepted async call to ${primitiveName}-wrapped function`,
    });

    const result = await targetFn.apply(this, args);

    collectedEffects.push({
      kind: 'telemetry_emit',
      primitiveName,
      timestamp: Date.now(),
      description: `Telemetry emitted after ${primitiveName} async execution completed`,
    });

    return result;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — WRAPPER QUERY
// ═══════════════════════════════════════════════════════════════════════════════

/** Check if a primitive has an active generic wrapper */
export function isWrapped(primitiveName: string): boolean {
  return activeWrappers.has(primitiveName);
}

/** Get all actively wrapped primitive names */
export function getWrappedPrimitives(): readonly string[] {
  return Array.from(activeWrappers.keys());
}

/** Get wrapper handle for a specific primitive */
export function getWrapperHandle(primitiveName: string): WrapperHandle | undefined {
  return activeWrappers.get(primitiveName);
}

/** Check if a primitive has emitted at least one effect */
export function hasEmittedEffects(primitiveName: string): boolean {
  return collectedEffects.some(e => e.primitiveName === primitiveName);
}

/** Get effects for a specific primitive */
export function getEffectsForPrimitive(primitiveName: string): readonly GenericEffect[] {
  return collectedEffects.filter(e => e.primitiveName === primitiveName);
}
