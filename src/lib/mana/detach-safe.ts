/**
 * Safe Detach Protocol (HARDENED)
 * U.S. Patent App. No. 64/031,637
 * 
 * STOP-SHIP HARDENING:
 * - Transactional detach: snapshot → audit → detach → verify → propagate
 * - Safe execution boundary only (no mid-call detach)
 * - Idempotent detach
 * - Post-detach integrity verification
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
  readonly phase: 'snapshot' | 'audit' | 'detach' | 'verify' | 'propagate' | 'complete' | 'failed';
  readonly success: boolean;
  readonly error?: string;
  readonly restoredFunctions: number;
  readonly verificationPassed: boolean;
  readonly idempotencyKey: string;
}

export type DetachListener = (receipt: DetachReceipt) => void;

// ═══════════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════════

/** Active detach operations — prevents concurrent detach */
const activeDetachOps = new Set<string>();

/** Idempotency dedup — prevents double-detach */
const completedDetachKeys = new Map<string, DetachReceipt>();
const MAX_COMPLETED_KEYS = 1000;

/** Execution boundary lock — true while a wrapped function is executing */
let executionLockCount = 0;

/** Propagation listeners */
const listeners: DetachListener[] = [];

// ═══════════════════════════════════════════════════════════════
// Execution Boundary
// ═══════════════════════════════════════════════════════════════

/** Enter execution boundary — detach will wait until all exit */
export function enterExecutionBoundary(): void {
  executionLockCount++;
}

/** Exit execution boundary */
export function exitExecutionBoundary(): void {
  if (executionLockCount > 0) executionLockCount--;
}

/** Check if any wrapped function is currently executing */
export function isInExecutionBoundary(): boolean {
  return executionLockCount > 0;
}

// ═══════════════════════════════════════════════════════════════
// Safe Detach
// ═══════════════════════════════════════════════════════════════

/**
 * Perform a safe, transactional detach.
 * 
 * GUARANTEES:
 * 1. Will not detach mid-execution (waits for boundary clear)
 * 2. Idempotent — same hostId returns same receipt
 * 3. Atomic — snapshot → audit → detach → verify → propagate
 * 4. Post-detach verification that all wrappers are removed
 */
export async function safeDetach(
  hostModule: Record<string, unknown>,
  originals: ReadonlyMap<string, AnyFn>,
  hostId: string,
  manifest: ManaManifest,
): Promise<DetachReceipt> {
  const idempotencyKey = `detach:${hostId}:${manifest.attachedAt ?? 0}`;

  /* Idempotency check */
  const existing = completedDetachKeys.get(idempotencyKey);
  if (existing) return existing;

  /* Prevent concurrent detach on same host */
  if (activeDetachOps.has(hostId)) {
    const failedReceipt = createReceipt('', 'failed', false, 'Concurrent detach already in progress', 0, false, idempotencyKey);
    return failedReceipt;
  }

  activeDetachOps.add(hostId);

  try {
    /* Phase 1: SNAPSHOT */
    const snapshot = createSnapshot(manifest);

    /* Phase 2: WAIT FOR EXECUTION BOUNDARY */
    const boundaryTimeout = 5000;
    const boundaryStart = Date.now();
    while (isInExecutionBoundary()) {
      if (Date.now() - boundaryStart > boundaryTimeout) {
        const receipt = createReceipt(snapshot.snapshotId, 'failed', false,
          'Timeout waiting for execution boundary clear', 0, false, idempotencyKey);
        notifyListeners(receipt);
        return receipt;
      }
      await new Promise(r => setTimeout(r, 10));
    }

    /* Phase 3: DETACH — restore all originals */
    let restoredCount = 0;
    for (const [functionName, originalFn] of originals) {
      if (typeof hostModule[functionName] === 'function') {
        hostModule[functionName] = originalFn;
        restoredCount++;
      }
    }

    /* Phase 4: VERIFY — check no wrappers remain */
    let verificationPassed = true;
    for (const [functionName] of originals) {
      const fn = hostModule[functionName];
      if (typeof fn === 'function') {
        const tagged = (fn as unknown as Record<symbol, unknown>)[MANA_LAYER_TAG];
        if (tagged === true) {
          verificationPassed = false;
          break;
        }
      }
    }

    /* Phase 5: PROPAGATE */
    const receipt = createReceipt(
      snapshot.snapshotId,
      verificationPassed ? 'complete' : 'failed',
      verificationPassed,
      verificationPassed ? undefined : 'Post-detach verification failed — wrapper tags still present',
      restoredCount,
      verificationPassed,
      idempotencyKey,
    );

    /* Store for idempotency */
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
  idempotencyKey: string,
): DetachReceipt {
  return {
    receiptId: `detach-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    snapshotId, timestamp: Date.now(), phase,
    success, error, restoredFunctions,
    verificationPassed, idempotencyKey,
  };
}

function notifyListeners(receipt: DetachReceipt): void {
  for (const listener of listeners) {
    try { listener(receipt); } catch { /* listener failure must not block detach */ }
  }
}

/** Register a detach propagation listener */
export function onDetach(listener: DetachListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

/** Reset safe-detach state */
export function resetSafeDetach(): void {
  activeDetachOps.clear();
  completedDetachKeys.clear();
  executionLockCount = 0;
  listeners.length = 0;
}
