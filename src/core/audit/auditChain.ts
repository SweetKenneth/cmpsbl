/**
 * CORE — Audit Chain (V1 PATCH CORRECTIONS)
 * 
 * Correction applied:
 * #7: Strict event vocabulary — structured semantic fields instead of
 *     overloaded 'decision' string.
 * 
 * Fields: event_type, phase, outcome, trust_state, governance_verdict, recovery_path
 * 
 * © CMPSBL® — All rights reserved.
 */

import { tick, getCurrentEpoch } from '../clock/clocklessEpoch';

// ═══════════════════════════════════════════════════════════════
// #7: Structured Audit Event Semantics
// ═══════════════════════════════════════════════════════════════

/** Operational phase — WHERE in the lifecycle this event occurs */
export type AuditPhase =
  | 'boot'           /* Identity/fingerprint verification */
  | 'attachment'     /* Capability attachment */
  | 'runtime'        /* During wrapped function execution */
  | 'detachment'     /* Detach lifecycle */
  | 'governance'     /* Lex rule evaluation */
  | 'recovery';      /* Fallback/self-heal path */

/** Outcome — WHAT happened */
export type AuditOutcome =
  | 'success'
  | 'failure'
  | 'denied'
  | 'timeout'
  | 'skipped'
  | 'degraded';

/** Trust state at event time */
export type AuditTrustState =
  | 'uninitialized'
  | 'candidate_baseline'
  | 'trusted_baseline'
  | 'suspect'
  | 'invalid'
  | 'valid'
  | 'unknown';

/** Governance verdict at event time */
export type AuditGovernanceVerdict =
  | 'allow'
  | 'deny'
  | 'observe'
  | 'not_evaluated';

/** Recovery path taken */
export type AuditRecoveryPath =
  | 'none'
  | 'primary'
  | 'fallback'
  | 'self_heal'
  | 'quarantine';

// ═══════════════════════════════════════════════════════════════
// Canonical Event Envelope — #7: Structured semantics
// ═══════════════════════════════════════════════════════════════

export interface AuditEnvelope {
  readonly receiptId: string;
  readonly idempotencyKey: string;
  readonly epoch: number;
  readonly causalParent: number | null;
  readonly source: string;
  /** Event type — stable machine-verifiable category */
  readonly eventType: string;
  /** #7: DEPRECATED — use structured fields. Kept for backward compat. */
  readonly decision: string;
  /** #7: Structured semantic fields */
  readonly phase: AuditPhase;
  readonly outcome: AuditOutcome;
  readonly trustState: AuditTrustState;
  readonly governanceVerdict: AuditGovernanceVerdict;
  readonly recoveryPath: AuditRecoveryPath;
  /** Payload data */
  readonly payload: unknown;
  readonly wallTime: string;
  readonly prevHash: string;
  readonly selfHash: string;
}

/** Structured input for recording events */
export interface AuditEventInput {
  phase?: AuditPhase;
  outcome?: AuditOutcome;
  trustState?: AuditTrustState;
  governanceVerdict?: AuditGovernanceVerdict;
  recoveryPath?: AuditRecoveryPath;
}

// ═══════════════════════════════════════════════════════════════
// FNV-1a Hash
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
const idempotencySet = new Set<string>();
const MAX_IDEM_SET = 100_000;
let receiptCounter = 0;

// ═══════════════════════════════════════════════════════════════
// Core API — #7: Accepts structured semantics
// ═══════════════════════════════════════════════════════════════

/**
 * Record an audit event atomically.
 * #7: Accepts structured semantic fields via optional `semantics` parameter.
 * Legacy callers can still pass just (source, eventType, decision, payload).
 */
export function recordAuditEvent(
  source: string,
  eventType: string,
  decision: string,
  payload: unknown,
  idempotencyKey?: string,
  causalParentEpoch?: number,
  semantics?: AuditEventInput,
): AuditEnvelope {
  const key = idempotencyKey ?? `${source}:${eventType}:${Date.now()}:${receiptCounter}`;

  if (idempotencySet.has(key)) {
    const existing = auditLog.find(e => e.idempotencyKey === key);
    if (existing) return existing;
  }

  const ts = tick(source, eventType, causalParentEpoch);
  const prevHash = auditLog.length > 0 ? auditLog[auditLog.length - 1].selfHash : '00000000';

  receiptCounter++;
  const receiptId = `audit-${ts.epoch}-${receiptCounter.toString(36)}`;

  // #7: Derive structured fields from decision if semantics not provided
  const phase = semantics?.phase ?? inferPhase(eventType);
  const outcome = semantics?.outcome ?? inferOutcome(decision);
  const trustState = semantics?.trustState ?? 'unknown';
  const governanceVerdict = semantics?.governanceVerdict ?? 'not_evaluated';
  const recoveryPath = semantics?.recoveryPath ?? 'none';

  const partial: Omit<AuditEnvelope, 'selfHash'> = {
    receiptId,
    idempotencyKey: key,
    epoch: ts.epoch,
    causalParent: ts.causalParent,
    source,
    eventType,
    decision,
    phase,
    outcome,
    trustState,
    governanceVerdict,
    recoveryPath,
    payload,
    wallTime: new Date().toISOString(),
    prevHash,
  };

  const selfHash = hashEnvelope(partial);
  const envelope: AuditEnvelope = { ...partial, selfHash };

  auditLog.push(envelope);
  if (auditLog.length > MAX_LOG_SIZE) auditLog.shift();

  idempotencySet.add(key);
  if (idempotencySet.size > MAX_IDEM_SET) {
    const first = idempotencySet.values().next().value;
    if (first) idempotencySet.delete(first);
  }

  return envelope;
}

// ═══════════════════════════════════════════════════════════════
// #7: Inference helpers — derive structured fields from legacy inputs
// ═══════════════════════════════════════════════════════════════

function inferPhase(eventType: string): AuditPhase {
  if (eventType.includes('fingerprint') || eventType.includes('identity')) return 'boot';
  if (eventType.includes('attach')) return 'attachment';
  if (eventType.includes('detach')) return 'detachment';
  if (eventType.includes('lex') || eventType.includes('governance')) return 'governance';
  if (eventType.includes('fallback') || eventType.includes('recover')) return 'recovery';
  return 'runtime';
}

function inferOutcome(decision: string): AuditOutcome {
  const d = decision.toLowerCase();
  if (d === 'success' || d === 'clean' || d === 'valid' || d === 'allow') return 'success';
  if (d === 'denied' || d === 'deny' || d === 'invalid' || d === 'blocked') return 'denied';
  if (d === 'timeout') return 'timeout';
  if (d === 'skipped' || d === 'filtered') return 'skipped';
  if (d === 'fallback' || d === 'suspect' || d === 'degraded') return 'degraded';
  if (d.includes('fail') || d.includes('error')) return 'failure';
  return 'success';
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

export function verifyChainIntegrity(): IntegrityReport {
  if (auditLog.length === 0) {
    return { valid: true, totalEntries: 0, brokenAt: null, brokenReason: null, headHash: '00000000' };
  }

  for (let i = 0; i < auditLog.length; i++) {
    const entry = auditLog[i];

    if (i === 0) {
      if (entry.prevHash !== '00000000') {
        return { valid: false, totalEntries: auditLog.length, brokenAt: 0,
          brokenReason: 'First entry prevHash is not genesis (00000000)', headHash: entry.selfHash };
      }
    } else {
      if (entry.prevHash !== auditLog[i - 1].selfHash) {
        return { valid: false, totalEntries: auditLog.length, brokenAt: i,
          brokenReason: `Entry ${i} prevHash (${entry.prevHash}) does not match entry ${i - 1} selfHash (${auditLog[i - 1].selfHash})`,
          headHash: entry.selfHash };
      }
    }

    const { selfHash: _, ...partial } = entry;
    const recomputed = hashEnvelope(partial as Omit<AuditEnvelope, 'selfHash'>);
    if (recomputed !== entry.selfHash) {
      return { valid: false, totalEntries: auditLog.length, brokenAt: i,
        brokenReason: `Entry ${i} selfHash mismatch: stored=${entry.selfHash} computed=${recomputed}`,
        headHash: entry.selfHash };
    }

    if (i > 0 && entry.epoch <= auditLog[i - 1].epoch) {
      return { valid: false, totalEntries: auditLog.length, brokenAt: i,
        brokenReason: `Entry ${i} epoch (${entry.epoch}) is not greater than entry ${i - 1} (${auditLog[i - 1].epoch})`,
        headHash: entry.selfHash };
    }
  }

  return { valid: true, totalEntries: auditLog.length, brokenAt: null, brokenReason: null,
    headHash: auditLog[auditLog.length - 1].selfHash };
}

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
