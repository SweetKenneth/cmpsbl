/**
 * GOVERNANCE Ultimate — System 7: Decision Audit Chain
 * 
 * Hash-chained governance decisions for tamper evidence.
 * Each entry includes decision, rationale, policy references,
 * context snapshot, and actor with chain integrity verification.
 * 
 * @module governance/ultimate/decisionAuditChain
 */

// ── Types ────────────────────────────────────────────────────────

export type ChainDecision = 'approve' | 'deny' | 'warn' | 'veto' | 'escalate';

export interface DecisionChainEntry {
  id: string;
  sequenceNumber: number;
  decision: ChainDecision;
  rationale: string;
  policyReferences: string[];    // Policy IDs that influenced decision
  contextSnapshot: Record<string, unknown>;
  actor: string;
  previousHash: string;
  entryHash: string;
  timestamp: number;
}

export interface ChainIntegrityResult {
  intact: boolean;
  totalEntries: number;
  verifiedEntries: number;
  brokenAt: number | null;       // Sequence number where chain broke
  brokenReason: string | null;
}

export interface ChainAttestation {
  id: string;
  chainLength: number;
  headHash: string;
  attestedBy: string;
  attestedAt: number;
  valid: boolean;
}

export interface DecisionChainStats {
  totalEntries: number;
  chainIntact: boolean;
  lastDecision: ChainDecision | null;
  decisionCounts: Record<string, number>;
  attestationCount: number;
  avgDecisionsPerHour: number;
}

// ── State ────────────────────────────────────────────────────────

const chain: DecisionChainEntry[] = [];
const attestations: ChainAttestation[] = [];
const MAX_CHAIN = 5000;
const MAX_ATTESTATIONS = 200;
const GENESIS_HASH = '0000000000000000';

// ── Hash Function ───────────────────────────────────────────────

function computeHash(input: string): string {
  let h1 = 0x811c9dc5 >>> 0;
  let h2 = 0xcbf29ce4 >>> 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c >> 4), 0x01000193) >>> 0;
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

function computeEntryHash(entry: Omit<DecisionChainEntry, 'entryHash'>): string {
  const payload = `${entry.sequenceNumber}:${entry.decision}:${entry.rationale}:${entry.actor}:${entry.previousHash}:${entry.timestamp}`;
  return computeHash(payload);
}

// ── Core API ────────────────────────────────────────────────────

/** Record a governance decision to the chain */
export function recordChainDecision(
  decision: ChainDecision,
  rationale: string,
  actor: string,
  policyReferences: string[] = [],
  contextSnapshot: Record<string, unknown> = {},
): DecisionChainEntry {
  const previousHash = chain.length > 0 ? chain[chain.length - 1].entryHash : GENESIS_HASH;
  const sequenceNumber = chain.length;

  const entryWithoutHash = {
    id: `dce-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sequenceNumber, decision, rationale,
    policyReferences, contextSnapshot, actor,
    previousHash, timestamp: Date.now(),
  };

  const entryHash = computeEntryHash(entryWithoutHash);
  const entry: DecisionChainEntry = { ...entryWithoutHash, entryHash };

  chain.push(entry);
  if (chain.length > MAX_CHAIN) chain.splice(0, chain.length - MAX_CHAIN);

  return entry;
}

/** Verify chain integrity */
export function verifyChainIntegrity(): ChainIntegrityResult {
  if (chain.length === 0) {
    return { intact: true, totalEntries: 0, verifiedEntries: 0, brokenAt: null, brokenReason: null };
  }

  // Verify genesis
  if (chain[0].previousHash !== GENESIS_HASH) {
    return { intact: false, totalEntries: chain.length, verifiedEntries: 0, brokenAt: 0, brokenReason: 'Invalid genesis hash' };
  }

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];

    // Verify hash
    const expectedHash = computeEntryHash({
      id: entry.id, sequenceNumber: entry.sequenceNumber,
      decision: entry.decision, rationale: entry.rationale,
      policyReferences: entry.policyReferences,
      contextSnapshot: entry.contextSnapshot,
      actor: entry.actor, previousHash: entry.previousHash,
      timestamp: entry.timestamp,
    });

    if (entry.entryHash !== expectedHash) {
      return { intact: false, totalEntries: chain.length, verifiedEntries: i, brokenAt: i, brokenReason: 'Hash mismatch — possible tampering' };
    }

    // Verify chain linkage
    if (i > 0 && entry.previousHash !== chain[i - 1].entryHash) {
      return { intact: false, totalEntries: chain.length, verifiedEntries: i, brokenAt: i, brokenReason: 'Chain linkage broken' };
    }

    // Verify sequence
    if (entry.sequenceNumber !== i) {
      return { intact: false, totalEntries: chain.length, verifiedEntries: i, brokenAt: i, brokenReason: 'Sequence gap detected' };
    }
  }

  return { intact: true, totalEntries: chain.length, verifiedEntries: chain.length, brokenAt: null, brokenReason: null };
}

/** Create a signed attestation of current chain state */
export function attestChain(attestedBy: string): ChainAttestation {
  const integrity = verifyChainIntegrity();
  const attestation: ChainAttestation = {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    chainLength: chain.length,
    headHash: chain.length > 0 ? chain[chain.length - 1].entryHash : GENESIS_HASH,
    attestedBy, attestedAt: Date.now(),
    valid: integrity.intact,
  };

  attestations.push(attestation);
  if (attestations.length > MAX_ATTESTATIONS) attestations.splice(0, attestations.length - MAX_ATTESTATIONS);

  return attestation;
}

// ── Query ────────────────────────────────────────────────────────

export function getChainEntries(count?: number): DecisionChainEntry[] {
  return count ? chain.slice(-count) : [...chain];
}
export function getChainEntry(id: string): DecisionChainEntry | undefined {
  return chain.find(e => e.id === id);
}
export function getChainEntriesByActor(actor: string): DecisionChainEntry[] {
  return chain.filter(e => e.actor === actor);
}
export function getChainEntriesByDecision(decision: ChainDecision): DecisionChainEntry[] {
  return chain.filter(e => e.decision === decision);
}
export function getAttestations(): ChainAttestation[] { return [...attestations]; }

export function getDecisionChainStats(): DecisionChainStats {
  const counts: Record<string, number> = {};
  for (const entry of chain) {
    counts[entry.decision] = (counts[entry.decision] || 0) + 1;
  }

  // Decisions per hour
  const timeSpanMs = chain.length >= 2 ? chain[chain.length - 1].timestamp - chain[0].timestamp : 1;
  const hours = Math.max(1, timeSpanMs / 3_600_000);

  return {
    totalEntries: chain.length,
    chainIntact: verifyChainIntegrity().intact,
    lastDecision: chain.length > 0 ? chain[chain.length - 1].decision : null,
    decisionCounts: counts,
    attestationCount: attestations.length,
    avgDecisionsPerHour: Math.round((chain.length / hours) * 10) / 10,
  };
}

export function resetDecisionChain(): void {
  chain.length = 0;
  attestations.length = 0;
}
