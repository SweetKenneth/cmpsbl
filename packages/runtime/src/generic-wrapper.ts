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

import { getEngineForPrimitive } from '@/lib/runtime/primitive-engine-map';
import { wrapInterception } from './engines/interception-engine';
import { wrapState } from './engines/state-engine';
import { wrapExecution } from './engines/execution-engine';
import { wrapAnalysis } from './engines/analysis-engine';
import { wrapOrchestration, registerAttachmentRules, routeSignal } from './engines/orchestration-engine';
import type { AttachmentEntry } from './engines/orchestration-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Standard effect emitted by generic wrappers */
export interface GenericEffect {
  readonly kind: 'call_interception' | 'telemetry_emit' | 'state_write' | 'attachment_bound';
  readonly primitiveName: string;
  readonly timestamp: number;
  readonly description: string;
}

/** Mana attachment manifest — injected into artifacts at build time */
declare const __MANA_ATTACHMENTS__: ReadonlyArray<AttachmentEntry> | undefined;

/** Track which primitives have already auto-bound attachments */
const attachmentsBound = new Set<string>();

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
 * Wrap a target function with engine-specific behavior + generic observation hooks.
 *
 * The wrapper:
 *   1. Resolves the behavior engine for the primitive
 *   2. Applies engine-specific wrapping (interception, state, execution, etc.)
 *   3. Emits a `call_interception` effect on every call (pre-call)
 *   4. Invokes the engine-wrapped function
 *   5. Emits a `telemetry_emit` effect after successful return (post-call)
 *   6. On error: re-throws without modification (never swallows)
 *
 * This is a transparent observation layer — L1 behavior is never altered.
 */
export function wrapGeneric<TArgs extends unknown[], TReturn>(
  primitiveName: string,
  targetFn: (...args: TArgs) => TReturn,
  attachments?: ReadonlyArray<AttachmentEntry>,
): (...args: TArgs) => TReturn {
  // Register the wrapper
  const handle: WrapperHandle = {
    primitiveName,
    wrappedAt: Date.now(),
    hooksFiring: true,
  };
  activeWrappers.set(primitiveName, handle);

  // ── Phase 4: auto-bind attachment rules (once per primitive) ──────────
  const resolvedAttachments = attachments
    ?? (typeof __MANA_ATTACHMENTS__ !== 'undefined' ? __MANA_ATTACHMENTS__ : undefined);

  if (resolvedAttachments && resolvedAttachments.length > 0 && !attachmentsBound.has(primitiveName)) {
    const relevantAttachments = resolvedAttachments.filter(a => a.primitive === primitiveName);
    if (relevantAttachments.length > 0) {
      registerAttachmentRules(primitiveName, relevantAttachments);
      attachmentsBound.add(primitiveName);

      collectedEffects.push({
        kind: 'attachment_bound',
        primitiveName,
        timestamp: Date.now(),
        description: `Auto-bound ${relevantAttachments.length} attachment rule(s) from artifact`,
      });
    }
  }

  const engine = getEngineForPrimitive(primitiveName);

  let wrappedFn = targetFn;

  switch (engine) {
    case 'interception':
      wrappedFn = wrapInterception(primitiveName, targetFn) as typeof targetFn;
      break;
    case 'state':
      wrappedFn = wrapState(primitiveName, targetFn) as typeof targetFn;
      break;
    case 'execution':
      wrappedFn = wrapExecution(primitiveName, targetFn) as typeof targetFn;
      break;
    case 'analysis':
      wrappedFn = wrapAnalysis(primitiveName, targetFn) as typeof targetFn;
      break;
    case 'orchestration':
      wrappedFn = wrapOrchestration(primitiveName, targetFn) as typeof targetFn;
      break;
  }

  return function genericWrapper(this: unknown, ...args: TArgs): TReturn {
    totalCallCount++;

    collectedEffects.push({
      kind: 'call_interception',
      primitiveName,
      timestamp: Date.now(),
      description: `Wrapper executed for ${primitiveName} via ${engine} engine`,
    });

    // ── Phase 4: emit execution_started with function identity ──────────
    routeSignal(primitiveName, 'execution_started', {
      function: primitiveName,
      input: args[0],
    });

    const result = wrappedFn.apply(this, args);

    collectedEffects.push({
      kind: 'telemetry_emit',
      primitiveName,
      timestamp: Date.now(),
      description: `Telemetry emitted (${engine})`,
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

  const engine = getEngineForPrimitive(primitiveName);

  let wrappedFn = targetFn;

  switch (engine) {
    case 'interception':
      wrappedFn = wrapInterception(primitiveName, targetFn) as typeof targetFn;
      break;
    case 'state':
      wrappedFn = wrapState(primitiveName, targetFn) as typeof targetFn;
      break;
    case 'execution':
      wrappedFn = wrapExecution(primitiveName, targetFn) as typeof targetFn;
      break;
    case 'analysis':
      wrappedFn = wrapAnalysis(primitiveName, targetFn) as typeof targetFn;
      break;
    case 'orchestration':
      wrappedFn = wrapOrchestration(primitiveName, targetFn) as typeof targetFn;
      break;
  }

  return async function genericWrapperAsync(this: unknown, ...args: TArgs): Promise<TReturn> {
    totalCallCount++;

    collectedEffects.push({
      kind: 'call_interception',
      primitiveName,
      timestamp: Date.now(),
      description: `Wrapper executed for async ${primitiveName} via ${engine} engine`,
    });

    const result = await wrappedFn.apply(this, args);

    collectedEffects.push({
      kind: 'telemetry_emit',
      primitiveName,
      timestamp: Date.now(),
      description: `Telemetry emitted (${engine} async)`,
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
