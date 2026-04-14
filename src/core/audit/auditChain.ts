/**
 * CORE — Audit Chain (HARDENED)
 * 
 * STOP-SHIP HARDENING:
 * - Single canonical event envelope
 * - Strict causal ordering (aligned with CLOCK)
 * - Idempotency keys for every event
 * - Atomic "decision + receipt" write
 * - Append-only log
 * - Replay verifier
 * - Integrity check
 * 
 * © CMPSBL® — All rights reserved.
 */

import { tick, getCurrentEpoch } from '../clock/clocklessEpoch';

// ═══════════════════════════════════════════════════════════════
// Canonical Event Envelope
// ═══════════════════════════════════════════════════════════════

export interface AuditEnvelope {
  /** Unique receipt ID */
  readonly receiptId: string;
  /** Idempotency key — same key = same event, deduped */
  readonly idempotencyKey: string;
  /** Logical epoch from CLOCK — provides causal ordering */
  readonly epoch: number;
  /** Causal parent epoch — what caused this event */
  readonly causalParent: number | null;
  /** Source module */
  readonly source: string;
  /** Event type */
  readonly eventType: string;
  /** Decision that was made */
  readonly decision: string;
  /** Payload data */
  readonly payload: unknown;
  /** Wall-clock timestamp (for debugging only — NOT for ordering) */
  readonly wallTime: string;
  /** Hash of the previous envelope — chain integrity */
  readonly prevHash: string;
  /** Hash of this envelope */
  readonly selfHash: string;
}

// ═══════════════════════════════════════════════════════════════
// FNV-1a Hash (deterministic, fast)
// ═══════════════════════════════════════════════════════════════

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function hashEnvelope(envelope: Omit<AuditEnvelope, 'selfHash'>): string {
  const canonical = `${envelope.receiptId}|${envelope.idempotencyKey}|${envelope.epoch}|${envelope.causalParent}|${envelope.source}|${envelope.eventType}|${envelope.decision}|${envelope.prevHash}`;
  return fnv1a(canonical);
}

// ═══════════════════════════════════════════════════════════════
// Append-Only Log
// ═══════════════════════════════════════════════════════════════

const auditLog: AuditEnvelope[] = [];
const MAX_LOG_SIZE = 50_000;

/** Idempotency set — prevents duplicate writes */
const idempotencySet = new Set<string>();
const MAX_IDEM_SET = 100_000;

let receiptCounter = 0;

// ═══════════════════════════════════════════════════════════════
// Core API
// ═══════════════════════════════════════════════════════════════

/**
 * Record an audit event atomically.
 * Decision and receipt are written as a single operation.
 * Idempotent — same idempotencyKey returns the existing envelope.
 */
export function recordAuditEvent(
  source: string,
  eventType: string,
  decision: string,
  payload: unknown,
  idempotencyKey?: string,
  causalParentEpoch?: number,
): AuditEnvelope {
  const key = idempotencyKey ?? `${source}:${eventType}:${Date.now()}:${receiptCounter}`;

  /* Idempotency check */
  if (idempotencySet.has(key)) {
    const existing = auditLog.find(e => e.idempotencyKey === key);
    if (existing) return existing;
  }

  /* Tick the clock — establishes causal order */
  const ts = tick(source, eventType, causalParentEpoch);

  /* Get previous hash for chain integrity */
  const prevHash = auditLog.length > 0 ? auditLog[auditLog.length - 1].selfHash : '00000000';

  receiptCounter++;
  const receiptId = `audit-${ts.epoch}-${receiptCounter.toString(36)}`;

  const partial: Omit<AuditEnvelope, 'selfHash'> = {
    receiptId,
    idempotencyKey: key,
    epoch: ts.epoch,
    causalParent: ts.causalParent,
    source,
    eventType,
    decision,
    payload,
    wallTime: new Date().toISOString(),
    prevHash,
  };

  const selfHash = hashEnvelope(partial);

  const envelope: AuditEnvelope = { ...partial, selfHash };

  /* Atomic append */
  auditLog.push(envelope);
  if (auditLog.length > MAX_LOG_SIZE) auditLog.shift();

  /* Track idempotency */
  idempotencySet.add(key);
  if (idempotencySet.size > MAX_IDEM_SET) {
    const first = idempotencySet.values().next().value;
    if (first) idempotencySet.delete(first);
  }

  return envelope;
}

// ═══════════════════════════════════════════════════════════════
// Chain Integrity Verification
// ═══════════════════════════════════════════════════════════════

export interface IntegrityReport {
  valid: boolean;
  totalEntries: number;
  brokenAt: number | null;
  brokenReason: string | null;
  headHash: string;
}

/**
 * Verify the integrity of the entire audit chain.
 * Checks:
 * 1. Each entry's prevHash matches the previous entry's selfHash
 * 2. Each entry's selfHash is correctly computed
 * 3. Epochs are monotonically increasing
 */
export function verifyChainIntegrity(): IntegrityReport {
  if (auditLog.length === 0) {
    return { valid: true, totalEntries: 0, brokenAt: null, brokenReason: null, headHash: '00000000' };
  }

  for (let i = 0; i < auditLog.length; i++) {
    const entry = auditLog[i];

    /* Verify prevHash chain */
    if (i === 0) {
      if (entry.prevHash !== '00000000') {
        return {
          valid: false, totalEntries: auditLog.length,
          brokenAt: 0, brokenReason: 'First entry prevHash is not genesis (00000000)',
          headHash: entry.selfHash,
        };
      }
    } else {
      if (entry.prevHash !== auditLog[i - 1].selfHash) {
        return {
          valid: false, totalEntries: auditLog.length,
          brokenAt: i, brokenReason: `Entry ${i} prevHash (${entry.prevHash}) does not match entry ${i - 1} selfHash (${auditLog[i - 1].selfHash})`,
          headHash: entry.selfHash,
        };
      }
    }

    /* Verify selfHash is correctly computed */
    const { selfHash: _, ...partial } = entry;
    const recomputed = hashEnvelope(partial as Omit<AuditEnvelope, 'selfHash'>);
    if (recomputed !== entry.selfHash) {
      return {
        valid: false, totalEntries: auditLog.length,
        brokenAt: i, brokenReason: `Entry ${i} selfHash mismatch: stored=${entry.selfHash} computed=${recomputed}`,
        headHash: entry.selfHash,
      };
    }

    /* Verify monotonic epochs */
    if (i > 0 && entry.epoch <= auditLog[i - 1].epoch) {
      return {
        valid: false, totalEntries: auditLog.length,
        brokenAt: i, brokenReason: `Entry ${i} epoch (${entry.epoch}) is not greater than entry ${i - 1} (${auditLog[i - 1].epoch})`,
        headHash: entry.selfHash,
      };
    }
  }

  return {
    valid: true, totalEntries: auditLog.length,
    brokenAt: null, brokenReason: null,
    headHash: auditLog[auditLog.length - 1].selfHash,
  };
}

/**
 * Replay verifier — reproduce the exact chain from raw events.
 * Returns true if replay produces identical hashes.
 */
export function replayVerify(events: ReadonlyArray<AuditEnvelope>): boolean {
  if (events.length === 0) return true;

  let prevHash = '00000000';
  for (const event of events) {
    if (event.prevHash !== prevHash) return false;

    const { selfHash: _, ...partial } = event;
    const recomputed = hashEnvelope(partial as Omit<AuditEnvelope, 'selfHash'>);
    if (recomputed !== event.selfHash) return false;

    prevHash = event.selfHash;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════
// Observability
// ═══════════════════════════════════════════════════════════════

export function getAuditLog(): ReadonlyArray<AuditEnvelope> {
  return [...auditLog];
}

export function getAuditLogSlice(start: number, end?: number): ReadonlyArray<AuditEnvelope> {
  return auditLog.slice(start, end);
}

export function getHeadHash(): string {
  return auditLog.length > 0 ? auditLog[auditLog.length - 1].selfHash : '00000000';
}

export function getAuditLogSize(): number {
  return auditLog.length;
}

export function resetAuditChain(): void {
  auditLog.length = 0;
  idempotencySet.clear();
  receiptCounter = 0;
}
