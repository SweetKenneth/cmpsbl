/**
 * CMPSBL® Verification Ledger — Phase 6: Verification & Proof Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Structured, queryable event log that makes runtime behavior auditable.
 *
 * Every significant runtime event is recorded as a VerificationEntry:
 *   - What was attached (binding events)
 *   - What executed (invocation events)
 *   - What was blocked (enforcement events)
 *   - Why it happened (causal chain linkage)
 *
 * Artifact fingerprinting ties artifact identity → runtime → behavior,
 * ensuring external trust can be established without source access.
 *
 * Constraints:
 *   - Append-only (no mutation of existing entries)
 *   - Deterministic ordering (monotonic sequence IDs)
 *   - Zero mutation of L1 behavior
 *   - Bounded memory (rolling window)
 *
 * © CMPSBL® — All rights reserved.
 */

import { fnv1a } from './function-identity';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type VerificationEventKind =
  | 'artifact_bound'        // Artifact manifest + attachments loaded
  | 'function_wrapped'      // Function received a wrapper
  | 'rule_registered'       // Orchestration rule registered from attachment
  | 'execution_observed'    // Wrapped function was called
  | 'validation_triggered'  // Input validation ran
  | 'execution_blocked'     // Enforcement action blocked a call
  | 'state_persisted'       // State engine wrote a value
  | 'anomaly_detected'      // Analysis engine flagged deviation
  | 'circuit_tripped'       // Circuit breaker opened
  | 'integrity_check'       // Fingerprint verification event
  | 'proof_generated';      // Activation proof was generated

export interface VerificationEntry {
  /** Monotonic sequence ID */
  readonly seq: number;
  /** Event classification */
  readonly kind: VerificationEventKind;
  /** Which primitive produced this event */
  readonly primitive: string;
  /** Which function (if applicable) */
  readonly functionName: string | null;
  /** Engine that handled this event */
  readonly engine: string;
  /** Why this event occurred */
  readonly reason: string;
  /** Causal link — seq ID of the event that caused this one */
  readonly causedBy: number | null;
  /** Artifact fingerprint at time of event */
  readonly artifactFingerprint: string | null;
  /** Timestamp */
  readonly timestamp: number;
  /** Structured payload (engine-specific details) */
  readonly detail: Readonly<Record<string, unknown>>;
}

/** Artifact fingerprint — ties identity across pipeline stages */
export interface ArtifactFingerprint {
  /** FNV-1a hash of manifest JSON */
  readonly manifestHash: number;
  /** FNV-1a hash of serialized attachments */
  readonly attachmentHash: number;
  /** Composite fingerprint string */
  readonly composite: string;
  /** Timestamp of fingerprint computation */
  readonly computedAt: number;
}

/** Verification query result */
export interface VerificationQueryResult {
  readonly entries: readonly VerificationEntry[];
  readonly totalMatched: number;
  readonly queryMs: number;
}

/** Verification summary — answers "what happened" at a glance */
export interface VerificationSummary {
  readonly artifactFingerprint: string | null;
  readonly totalEvents: number;
  readonly byKind: Readonly<Record<string, number>>;
  readonly byPrimitive: Readonly<Record<string, number>>;
  readonly byEngine: Readonly<Record<string, number>>;
  readonly enforcements: number;
  readonly observations: number;
  readonly anomalies: number;
  readonly integrityChecks: number;
  readonly firstEvent: number | null;
  readonly lastEvent: number | null;
  readonly causalChainDepth: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_LEDGER_SIZE = 5000;
const ledger: VerificationEntry[] = [];
let sequenceCounter = 0;
let activeFingerprint: ArtifactFingerprint | null = null;

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — FINGERPRINTING
// ═══════════════════════════════════════════════════════════════════════════════

/** Stable JSON serialization — sorts keys to prevent order-dependent hashes */
function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = sorted.map(k => `${JSON.stringify(k)}:${stableStringify((obj as Record<string, unknown>)[k])}`);
  return `{${pairs.join(',')}}`;
}

/**
 * Calculate a fingerprint without mutating active state.
 * Uses stable serialization to ensure portability across environments.
 */
function calculateFingerprint(
  manifest: Record<string, unknown>,
  attachments: readonly Record<string, unknown>[],
): ArtifactFingerprint {
  const manifestHash = fnv1a(stableStringify(manifest));
  const attachmentHash = fnv1a(stableStringify(attachments));
  return {
    manifestHash,
    attachmentHash,
    composite: `${manifestHash.toString(16)}-${attachmentHash.toString(16)}`,
    computedAt: Date.now(),
  };
}

/**
 * Compute and bind an artifact fingerprint as the active identity anchor.
 * Every subsequent ledger event carries this fingerprint.
 */
export function computeFingerprint(
  manifest: Record<string, unknown>,
  attachments: readonly Record<string, unknown>[],
): ArtifactFingerprint {
  const fp = calculateFingerprint(manifest, attachments);
  activeFingerprint = fp;
  return fp;
}

/** Get the currently active artifact fingerprint */
export function getActiveFingerprint(): ArtifactFingerprint | null {
  return activeFingerprint;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — LEDGER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record a verification event. Append-only, bounded.
 * Returns the sequence ID for causal linking.
 */
export function record(
  kind: VerificationEventKind,
  primitive: string,
  engine: string,
  reason: string,
  detail: Record<string, unknown> = {},
  options: {
    functionName?: string;
    causedBy?: number;
  } = {},
): number {
  const seq = ++sequenceCounter;

  const entry: VerificationEntry = {
    seq,
    kind,
    primitive,
    functionName: options.functionName ?? null,
    engine,
    reason,
    causedBy: options.causedBy ?? null,
    artifactFingerprint: activeFingerprint?.composite ?? null,
    timestamp: Date.now(),
    detail: { ...detail },
  };

  if (ledger.length >= MAX_LEDGER_SIZE) {
    ledger.splice(0, Math.floor(MAX_LEDGER_SIZE * 0.1));
  }

  ledger.push(entry);
  return seq;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — QUERY API
// ═══════════════════════════════════════════════════════════════════════════════

/** Query entries by kind */
export function queryByKind(kind: VerificationEventKind): VerificationQueryResult {
  const start = performance.now();
  const entries = ledger.filter(e => e.kind === kind);
  return { entries, totalMatched: entries.length, queryMs: Math.round(performance.now() - start) };
}

/** Query entries by primitive */
export function queryByPrimitive(primitive: string): VerificationQueryResult {
  const start = performance.now();
  const upper = primitive.toUpperCase();
  const entries = ledger.filter(e => e.primitive.toUpperCase() === upper);
  return { entries, totalMatched: entries.length, queryMs: Math.round(performance.now() - start) };
}

/** Query entries by function name */
export function queryByFunction(functionName: string): VerificationQueryResult {
  const start = performance.now();
  const entries = ledger.filter(e => e.functionName === functionName);
  return { entries, totalMatched: entries.length, queryMs: Math.round(performance.now() - start) };
}

/** Get the causal chain leading to a specific event */
export function getCausalChain(seq: number): readonly VerificationEntry[] {
  const chain: VerificationEntry[] = [];
  let current = ledger.find(e => e.seq === seq);

  while (current) {
    chain.unshift(current);
    if (current.causedBy === null) break;
    current = ledger.find(e => e.seq === current!.causedBy);
  }

  return chain;
}

/** Get all enforcement events (what was blocked and why) */
export function getEnforcements(): readonly VerificationEntry[] {
  return ledger.filter(e => e.kind === 'execution_blocked');
}

/** Get recent N entries */
export function getRecentEntries(limit = 50): readonly VerificationEntry[] {
  return ledger.slice(-limit);
}

/** Get full ledger snapshot (immutable) */
export function getLedgerSnapshot(): readonly VerificationEntry[] {
  return [...ledger];
}

/** Get total entry count */
export function getLedgerSize(): number {
  return ledger.length;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — VERIFICATION SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a verification summary — the single answer to "what happened."
 * This is the external trust interface.
 */
export function generateVerificationSummary(): VerificationSummary {
  const byKind: Record<string, number> = {};
  const byPrimitive: Record<string, number> = {};
  const byEngine: Record<string, number> = {};
  let enforcements = 0;
  let observations = 0;
  let anomalies = 0;
  let integrityChecks = 0;
  let maxChainDepth = 0;

  for (const entry of ledger) {
    byKind[entry.kind] = (byKind[entry.kind] ?? 0) + 1;
    byPrimitive[entry.primitive] = (byPrimitive[entry.primitive] ?? 0) + 1;
    byEngine[entry.engine] = (byEngine[entry.engine] ?? 0) + 1;

    if (entry.kind === 'execution_blocked') enforcements++;
    if (entry.kind === 'execution_observed') observations++;
    if (entry.kind === 'anomaly_detected') anomalies++;
    if (entry.kind === 'integrity_check') integrityChecks++;

    // Track causal chain depth
    if (entry.causedBy !== null) {
      const chain = getCausalChain(entry.seq);
      maxChainDepth = Math.max(maxChainDepth, chain.length);
    }
  }

  return {
    artifactFingerprint: activeFingerprint?.composite ?? null,
    totalEvents: ledger.length,
    byKind,
    byPrimitive,
    byEngine,
    enforcements,
    observations,
    anomalies,
    integrityChecks,
    firstEvent: ledger.length > 0 ? ledger[0].timestamp : null,
    lastEvent: ledger.length > 0 ? ledger[ledger.length - 1].timestamp : null,
    causalChainDepth: maxChainDepth,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — INTEGRITY VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verify that the current runtime state matches the artifact fingerprint.
 * Records an integrity_check event with the result.
 */
export function verifyIntegrity(
  manifest: Record<string, unknown>,
  attachments: readonly Record<string, unknown>[],
): { valid: boolean; expected: string | null; actual: string } {
  const expected = activeFingerprint?.composite ?? null;
  const recomputed = calculateFingerprint(manifest, attachments);
  const valid = expected === recomputed.composite;

  record(
    'integrity_check',
    'SYSTEM',
    'verification',
    valid ? 'Fingerprint matches — artifact identity confirmed' : 'Fingerprint mismatch — potential artifact tampering',
    { expected, actual: recomputed.composite, valid },
  );

  return { valid, expected, actual: recomputed.composite };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §8 — HUMAN-READABLE VERIFICATION REPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Render a human-readable verification report.
 * This is the externally shareable proof.
 */
export function renderVerificationReport(): string {
  const summary = generateVerificationSummary();
  const lines: string[] = [
    '═══ CMPSBL® Verification Report ═══',
    '',
    `Artifact: ${summary.artifactFingerprint ?? 'unbound'}`,
    `Events:   ${summary.totalEvents} total`,
    '',
    '── Event Distribution ──',
  ];

  for (const [kind, count] of Object.entries(summary.byKind).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${kind}: ${count}`);
  }

  lines.push('', '── Primitive Activity ──');
  for (const [prim, count] of Object.entries(summary.byPrimitive).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${prim}: ${count} events`);
  }

  lines.push('', '── Engine Activity ──');
  for (const [eng, count] of Object.entries(summary.byEngine).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${eng}: ${count} events`);
  }

  lines.push(
    '',
    '── Trust Signals ──',
    `  Enforcements:     ${summary.enforcements}`,
    `  Observations:     ${summary.observations}`,
    `  Anomalies:        ${summary.anomalies}`,
    `  Integrity Checks: ${summary.integrityChecks}`,
    `  Max Causal Depth: ${summary.causalChainDepth}`,
    '',
    summary.enforcements > 0 || summary.integrityChecks > 0
      ? '✔ Behavior is auditable and externally verifiable'
      : '⚠ No enforcement or integrity events recorded yet',
  );

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §9 — RESET (TESTING ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export function resetVerificationLedger(): void {
  ledger.length = 0;
  sequenceCounter = 0;
  activeFingerprint = null;
}
