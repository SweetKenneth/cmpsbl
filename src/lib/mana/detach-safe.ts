/**
 * Safe Detach Protocol (V1 PATCH CORRECTIONS)
 * U.S. Patent App. No. 64/031,637
 * 
 * Corrections applied:
 * #5: Session-scoped boundary state — no global cross-talk
 * #6: Single detach authority — all restore/verify/report lives here
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { ManaManifest, AnyFn, ManaCapability } from './types';
import { MANA_LAYER_TAG } from './types';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface DetachSnapshot {
  readonly snapshotId: string;
  readonly timestamp: number;
  readonly hostPackage: string;
  readonly attachmentPointCount: number;
  readonly functionNames: ReadonlyArray<string>;
  readonly capabilities: ReadonlyArray<ManaCapability>;
}

export interface DetachReceipt {
  readonly receiptId: string;
  readonly snapshotId: string;
  readonly timestamp: number;
  readonly phase: 'snapshot' | 'boundary_wait' | 'restore' | 'verify' | 'propagate' | 'complete' | 'failed';
  readonly success: boolean;
  readonly error?: string;
  readonly restoredFunctions: number;
  readonly verificationPassed: boolean;
  readonly idempotencyKey: string;
  /** #6: Recovery path taken — 'primary' or 'fallback' */
  readonly recoveryPath: 'primary' | 'fallback' | 'none';
}

export type DetachListener = (receipt: DetachReceipt) => void;

// ═══════════════════════════════════════════════════════════════
// #5: Session-Scoped Execution Boundary State
// ═══════════════════════════════════════════════════════════════

/** Per-host execution lock counters — no global state cross-talk */
const executionLocks = new Map<string, number>();

/** Enter execution boundary for a specific host */
export function enterExecutionBoundary(hostKey: string): void {
  executionLocks.set(hostKey, (executionLocks.get(hostKey) ?? 0) + 1);
}

/** Exit execution boundary for a specific host */
export function exitExecutionBoundary(hostKey: string): void {
  const current = executionLocks.get(hostKey) ?? 0;
  if (current > 0) executionLocks.set(hostKey, current - 1);
}

/** Check if host has active execution */
export function isInExecutionBoundary(hostKey: string): boolean {
  return (executionLocks.get(hostKey) ?? 0) > 0;
}

/** Get lock count for a host (observability) */
export function getExecutionLockCount(hostKey: string): number {
  return executionLocks.get(hostKey) ?? 0;
}

// ═══════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════

const activeDetachOps = new Set<string>();
const completedDetachKeys = new Map<string, DetachReceipt>();
const MAX_COMPLETED_KEYS = 1000;
const listeners: DetachListener[] = [];

// ═══════════════════════════════════════════════════════════════
// #6: Safe Detach — SINGLE DETACH AUTHORITY
// ═══════════════════════════════════════════════════════════════

/**
 * Perform a safe, transactional detach.
 * 
 * #6: This is the SOLE authority for detach operations.
 * Engine/session must NOT own separate fallback restore logic.
 * All restore, verification, and fallback lives here.
 * 
 * GUARANTEES:
 * 1. Will not detach mid-execution (waits for boundary clear)
 * 2. Idempotent — same hostId returns same receipt
 * 3. Atomic — snapshot → boundary_wait → restore → verify → propagate
 * 4. Post-detach verification that all wrappers are removed
 * 5. Built-in fallback on verification failure
 */
export async function safeDetach(
  hostModule: Record<string, unknown>,
  originals: ReadonlyMap<string, AnyFn>,
  hostId: string,
  manifest: ManaManifest,
): Promise<DetachReceipt> {
  const idempotencyKey = `detach:${hostId}:${manifest.attachedAt ?? 0}`;

  const existing = completedDetachKeys.get(idempotencyKey);
  if (existing) return existing;

  if (activeDetachOps.has(hostId)) {
    return createReceipt('', 'failed', false, 'Concurrent detach already in progress', 0, false, idempotencyKey, 'none');
  }

  activeDetachOps.add(hostId);

  try {
    /* Phase 1: SNAPSHOT */
    const snapshot = createSnapshot(manifest);

    /* Phase 2: BOUNDARY WAIT — #5: host-scoped */
    const boundaryTimeout = 5000;
    const boundaryStart = Date.now();
    while (isInExecutionBoundary(hostId)) {
      if (Date.now() - boundaryStart > boundaryTimeout) {
        const receipt = createReceipt(snapshot.snapshotId, 'failed', false,
          'Timeout waiting for execution boundary clear', 0, false, idempotencyKey, 'none');
        notifyListeners(receipt);
        return receipt;
      }
      await new Promise(r => setTimeout(r, 10));
    }

    /* Phase 3: RESTORE — primary path */
    let restoredCount = 0;
    for (const [functionName, originalFn] of originals) {
      if (typeof hostModule[functionName] === 'function') {
        hostModule[functionName] = originalFn;
        restoredCount++;
      }
    }

    /* Phase 4: VERIFY — check no wrappers remain */
    let verificationPassed = true;
    const taggedFunctions: string[] = [];
    for (const [functionName] of originals) {
      const fn = hostModule[functionName];
      if (typeof fn === 'function') {
        const tagged = (fn as unknown as Record<symbol, unknown>)[MANA_LAYER_TAG];
        if (tagged === true) {
          verificationPassed = false;
          taggedFunctions.push(functionName);
        }
      }
    }

    /* #6: FALLBACK — built into safeDetach, not external */
    let recoveryPath: 'primary' | 'fallback' = 'primary';
    if (!verificationPassed) {
      recoveryPath = 'fallback';
      // Force-restore tagged functions
      for (const functionName of taggedFunctions) {
        const orig = originals.get(functionName);
        if (orig) {
          hostModule[functionName] = orig;
        }
      }
      // Re-verify after fallback
      verificationPassed = true;
      for (const [functionName] of originals) {
        const fn = hostModule[functionName];
        if (typeof fn === 'function' && (fn as unknown as Record<symbol, unknown>)[MANA_LAYER_TAG] === true) {
          verificationPassed = false;
          break;
        }
      }
    }

    /* Phase 5: PROPAGATE + cleanup host boundary state */
    executionLocks.delete(hostId);

    const receipt = createReceipt(
      snapshot.snapshotId,
      verificationPassed ? 'complete' : 'failed',
      verificationPassed,
      verificationPassed ? undefined : 'Post-detach verification failed after fallback — wrapper tags still present',
      restoredCount,
      verificationPassed,
      idempotencyKey,
      recoveryPath,
    );

    completedDetachKeys.set(idempotencyKey, receipt);
    if (completedDetachKeys.size > MAX_COMPLETED_KEYS) {
      const oldest = completedDetachKeys.keys().next().value;
      if (oldest) completedDetachKeys.delete(oldest);
    }

    notifyListeners(receipt);
    return receipt;
  } finally {
    activeDetachOps.delete(hostId);
  }
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function createSnapshot(manifest: ManaManifest): DetachSnapshot {
  return {
    snapshotId: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    hostPackage: manifest.hostPackage,
    attachmentPointCount: manifest.attachmentPoints.length,
    functionNames: [...new Set(manifest.attachmentPoints.map(p => p.functionName))],
    capabilities: [...new Set(manifest.attachmentPoints.map(p => p.capability))],
  };
}

function createReceipt(
  snapshotId: string, phase: DetachReceipt['phase'],
  success: boolean, error: string | undefined,
  restoredFunctions: number, verificationPassed: boolean,
  idempotencyKey: string, recoveryPath: DetachReceipt['recoveryPath'],
): DetachReceipt {
  return {
    receiptId: `detach-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    snapshotId, timestamp: Date.now(), phase,
    success, error, restoredFunctions,
    verificationPassed, idempotencyKey, recoveryPath,
  };
}

function notifyListeners(receipt: DetachReceipt): void {
  for (const listener of listeners) {
    try { listener(receipt); } catch { /* listener failure must not block detach */ }
  }
}

export function onDetach(listener: DetachListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function resetSafeDetach(): void {
  activeDetachOps.clear();
  completedDetachKeys.clear();
  executionLocks.clear();
  listeners.length = 0;
}
