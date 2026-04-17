/**
 * Safe Detach — Hardened detachment with mid-flight protection
 * U.S. Patent App. No. 64/031,637
 *
 * Purpose: provide a non-destructive alternative to `detach()` that:
 *   1. Verifies each function on the host module bears the MANA_LAYER_TAG
 *      before restoring its original (refuses to overwrite host code that
 *      was swapped after attach by something other than Mana).
 *   2. Detects in-flight invocations via a per-function reentry guard and
 *      defers restoration for those functions instead of yanking them
 *      mid-execution (which would corrupt the call stack).
 *   3. Returns a structured report so callers can see what was restored,
 *      what was skipped, and why — without throwing on partial success.
 *
 * This file is ADDITIVE: it does not modify the existing `detach()` in
 * engine.ts. Callers opt in by importing `detachSafe` directly.
 *
 * © CMPSBL® — All rights reserved.
 */

import { MANA_LAYER_TAG } from './types';
import type { AnyFn } from './types';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type DetachOutcome = 'restored' | 'skipped-untagged' | 'skipped-in-flight' | 'skipped-missing';

export interface DetachEntryReport {
  readonly functionName: string;
  readonly outcome: DetachOutcome;
  readonly reason: string;
}

export interface SafeDetachReport {
  readonly attempted: number;
  readonly restored: number;
  readonly skipped: number;
  readonly entries: ReadonlyArray<DetachEntryReport>;
  readonly fullyDetached: boolean;
  readonly timestamp: number;
}

export interface SafeDetachOptions {
  /** Force restore even if the on-host function is missing the layer tag.
   *  Default false — refuse to overwrite untagged functions. */
  readonly force?: boolean;
  /** If true, throw when any function cannot be restored cleanly.
   *  Default false — return a report instead. */
  readonly strict?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Reentry guard — tracks which wrapped functions are currently executing.
// Engine.ts wraps via closures; we cannot inspect their call frames, so we
// expose an opt-in counter that wrappers can bump. Until a wrapper opts in,
// we treat the function as "not in flight" (best-effort) but still respect
// the tag check, which is the primary safety guarantee.
// ═══════════════════════════════════════════════════════════════

const inFlight: Map<string, number> = new Map();

/** Wrappers may call this on entry to prevent mid-call detach. */
export function markEnter(functionName: string): void {
  inFlight.set(functionName, (inFlight.get(functionName) ?? 0) + 1);
}

/** Paired with markEnter — call on exit (in finally). */
export function markExit(functionName: string): void {
  const n = inFlight.get(functionName) ?? 0;
  if (n <= 1) inFlight.delete(functionName);
  else inFlight.set(functionName, n - 1);
}

function isInFlight(functionName: string): boolean {
  return (inFlight.get(functionName) ?? 0) > 0;
}

function hasLayerTag(fn: unknown): boolean {
  return typeof fn === 'function'
    && (fn as unknown as Record<symbol, unknown>)[MANA_LAYER_TAG] === true;
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

/**
 * Restore originals safely. Accepts the host module and the originals map
 * captured at attach-time. Does not mutate engine state — callers are
 * responsible for clearing their attachment bookkeeping after the report
 * confirms a clean restoration.
 */
export function detachSafe(
  hostModule: Record<string, unknown>,
  originals: ReadonlyMap<string, AnyFn>,
  options: SafeDetachOptions = {}
): SafeDetachReport {
  const { force = false, strict = false } = options;
  const entries: DetachEntryReport[] = [];
  let restored = 0;
  let skipped = 0;

  for (const [functionName, originalFn] of originals.entries()) {
    const current = hostModule[functionName];

    if (current === undefined) {
      entries.push({
        functionName,
        outcome: 'skipped-missing',
        reason: 'Host no longer exposes this function.',
      });
      skipped++;
      continue;
    }

    if (isInFlight(functionName)) {
      entries.push({
        functionName,
        outcome: 'skipped-in-flight',
        reason: 'Wrapper is currently executing — refusing to swap mid-call.',
      });
      skipped++;
      continue;
    }

    if (!hasLayerTag(current) && !force) {
      entries.push({
        functionName,
        outcome: 'skipped-untagged',
        reason: 'Current host function is not Mana-tagged — refusing to overwrite foreign code.',
      });
      skipped++;
      continue;
    }

    hostModule[functionName] = originalFn;
    entries.push({
      functionName,
      outcome: 'restored',
      reason: force && !hasLayerTag(current)
        ? 'Restored under force=true despite missing tag.'
        : 'Restored from captured original.',
    });
    restored++;
  }

  const report: SafeDetachReport = Object.freeze({
    attempted: originals.size,
    restored,
    skipped,
    entries: Object.freeze(entries),
    fullyDetached: skipped === 0,
    timestamp: Date.now(),
  });

  if (strict && !report.fullyDetached) {
    throw new Error(
      `[MANA] Safe detach incomplete: ${skipped}/${originals.size} functions could not be restored. ` +
      `First skip: ${entries.find(e => e.outcome !== 'restored')?.reason ?? 'unknown'}`
    );
  }

  return report;
}

/** Test/teardown helper — clear the in-flight tracker. */
export function resetSafeDetach(): void {
  inFlight.clear();
}
