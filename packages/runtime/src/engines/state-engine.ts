/**
 * CMPSBL® State Engine — Deterministic Memory Layer (MEMORY)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Four-layer state controller:
 *   1. Namespace-aware storage
 *   2. Deterministic read/write semantics
 *   3. TTL-based expiration
 *   4. Structured state events for verification
 *
 * Zero mutation of L1 behavior.
 * State is supplementary and observable.
 *
 * Routes state signals to the Orchestration Engine (CORTEX).
 *
 * © CMPSBL® — All rights reserved.
 */

import { routeSignal } from './orchestration-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type StateEffect =
  | 'state_written'
  | 'state_read'
  | 'state_expired'
  | 'snapshot_created';

export interface StatePolicy {
  readonly namespace?: string;
  readonly ttlMs?: number;
  readonly snapshotOnWrite?: boolean;
}

export interface StateEntry {
  readonly primitive: string;
  readonly namespace: string;
  readonly value: unknown;
  readonly writtenAt: number;
  readonly ttlMs?: number;
}

export interface StateSnapshot {
  readonly primitive: string;
  readonly namespace: string;
  readonly createdAt: number;
  readonly value: unknown;
}

export interface StateEvent {
  readonly primitive: string;
  readonly namespace: string;
  readonly effect: StateEffect;
  readonly timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const stateStore = new Map<string, StateEntry>();
const snapshotStore = new Map<string, StateSnapshot[]>();
const stateEvents: StateEvent[] = [];

const DEFAULT_NAMESPACE = 'default';
const MAX_SNAPSHOTS = 50;

function makeKey(primitive: string, namespace: string): string {
  return `${primitive}::${namespace}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — EVENT EMISSION
// ═══════════════════════════════════════════════════════════════════════════════

function emitStateEvent(
  primitive: string,
  namespace: string,
  effect: StateEffect,
): void {
  stateEvents.push({
    primitive,
    namespace,
    effect,
    timestamp: Date.now(),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — TTL
// ═══════════════════════════════════════════════════════════════════════════════

function isExpired(entry: StateEntry): boolean {
  if (entry.ttlMs == null) return false;
  return Date.now() - entry.writtenAt >= entry.ttlMs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — READ / WRITE / SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════

export function writeState(
  primitive: string,
  value: unknown,
  policy?: StatePolicy,
): void {
  const namespace = policy?.namespace ?? DEFAULT_NAMESPACE;
  const key = makeKey(primitive, namespace);

  const entry: StateEntry = {
    primitive,
    namespace,
    value,
    writtenAt: Date.now(),
    ttlMs: policy?.ttlMs,
  };

  stateStore.set(key, entry);
  emitStateEvent(primitive, namespace, 'state_written');
  routeSignal(primitive, 'state_written', { value });

  if (policy?.snapshotOnWrite) {
    const current = snapshotStore.get(key) ?? [];

    if (current.length >= MAX_SNAPSHOTS) {
      current.shift();
    }

    current.push({
      primitive,
      namespace,
      createdAt: Date.now(),
      value,
    });
    snapshotStore.set(key, current);
    emitStateEvent(primitive, namespace, 'snapshot_created');
  }
}

export function readState(
  primitive: string,
  namespace = DEFAULT_NAMESPACE,
): unknown | undefined {
  const key = makeKey(primitive, namespace);
  const entry = stateStore.get(key);

  if (!entry) return undefined;

  if (isExpired(entry)) {
    stateStore.delete(key);
    emitStateEvent(primitive, namespace, 'state_expired');
    return undefined;
  }

  emitStateEvent(primitive, namespace, 'state_read');
  return entry.value;
}

export function getStateEntry(
  primitive: string,
  namespace = DEFAULT_NAMESPACE,
): Readonly<StateEntry> | undefined {
  const key = makeKey(primitive, namespace);
  const entry = stateStore.get(key);

  if (!entry) return undefined;
  if (isExpired(entry)) {
    stateStore.delete(key);
    emitStateEvent(primitive, namespace, 'state_expired');
    return undefined;
  }

  return { ...entry };
}

export function getSnapshots(
  primitive: string,
  namespace = DEFAULT_NAMESPACE,
): readonly StateSnapshot[] {
  const key = makeKey(primitive, namespace);
  return [...(snapshotStore.get(key) ?? [])];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — EVENT ACCESS (PROOF LAYER)
// ═══════════════════════════════════════════════════════════════════════════════

export function getStateEvents(): readonly StateEvent[] {
  return [...stateEvents];
}

export function getStateEventsForPrimitive(
  primitive: string,
): readonly StateEvent[] {
  return stateEvents.filter(e => e.primitive === primitive);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — RESET (TESTING ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export function resetStateEngine(): void {
  stateStore.clear();
  snapshotStore.clear();
  stateEvents.length = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — STATE WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wrap a function with deterministic state capture.
 *
 * Behavior:
 *   1. Execute L1 function unchanged
 *   2. Persist result into state store
 *   3. Emit proof events
 *   4. Return original result unchanged
 */
export function wrapState<T extends (...args: any[]) => any>(
  primitiveName: string,
  targetFn: T,
  policy?: StatePolicy,
): T {
  return function stateWrapper(this: any, ...args: any[]) {
    const result = targetFn.apply(this, args);

    writeState(primitiveName, result, policy);

    return result;
  } as T;
}
