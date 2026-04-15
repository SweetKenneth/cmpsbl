/**
 * Audit Chain — Merkle-linked immutable event log
 * U.S. Patent App. No. 64/029,678
 *
 * Every mutation in the Ascension pipeline appends to this chain.
 * Each entry's hash includes the previous entry's hash → tamper-evident.
 *
 * Uses FNV-1a for speed (structural) and SHA-256 for trust (integrity).
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface AuditEntry {
  readonly index: number;
  readonly timestamp: number;
  readonly action: string;
  readonly detail: string;
  readonly prevHash: string;
  readonly hash: string;
}

export interface AuditChainState {
  readonly entries: ReadonlyArray<AuditEntry>;
  readonly headHash: string;
  readonly length: number;
  readonly verified: boolean;
}

// ═══════════════════════════════════════════════════════════════
// FNV-1a (32-bit) — fast structural fingerprint
// ═══════════════════════════════════════════════════════════════

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ═══════════════════════════════════════════════════════════════
// SHA-256 — trust-grade integrity fingerprint
// ═══════════════════════════════════════════════════════════════

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ═══════════════════════════════════════════════════════════════
// Chain implementation
// ═══════════════════════════════════════════════════════════════

const GENESIS_HASH = 'ascension-v2-genesis-0000';

let entries: AuditEntry[] = [];
let headHash = GENESIS_HASH;

function computeEntryHash(index: number, timestamp: number, action: string, detail: string, prevHash: string): string {
  return fnv1a(`${index}:${timestamp}:${action}:${detail}:${prevHash}`);
}

/**
 * Append an event to the audit chain. Returns the new entry.
 */
export function appendAudit(action: string, detail: string): AuditEntry {
  const index = entries.length;
  const timestamp = Date.now();
  const prevHash = headHash;
  const hash = computeEntryHash(index, timestamp, action, detail, prevHash);

  const entry: AuditEntry = Object.freeze({
    index,
    timestamp,
    action,
    detail,
    prevHash,
    hash,
  });

  entries.push(entry);
  headHash = hash;
  return entry;
}

/**
 * Verify the entire chain is intact — no gaps, no tampering.
 */
export function verifyChain(): boolean {
  if (entries.length === 0) return true;

  let expectedPrev = GENESIS_HASH;
  for (const entry of entries) {
    if (entry.prevHash !== expectedPrev) return false;
    const recomputed = computeEntryHash(
      entry.index, entry.timestamp, entry.action, entry.detail, entry.prevHash
    );
    if (entry.hash !== recomputed) return false;
    expectedPrev = entry.hash;
  }
  return true;
}

/**
 * Get full chain state snapshot.
 */
export function getChainState(): AuditChainState {
  return Object.freeze({
    entries: Object.freeze([...entries]),
    headHash,
    length: entries.length,
    verified: verifyChain(),
  });
}

/**
 * Generate SHA-256 integrity fingerprint of the entire chain.
 */
export async function getChainIntegrityHash(): Promise<string> {
  const payload = entries.map(e => e.hash).join(':');
  return sha256(payload || GENESIS_HASH);
}

/**
 * Reset chain — only for session teardown.
 */
export function resetChain(): void {
  entries = [];
  headHash = GENESIS_HASH;
}
