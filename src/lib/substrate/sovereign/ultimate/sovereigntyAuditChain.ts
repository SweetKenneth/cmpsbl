/**
 * SOVEREIGN Ultimate — Sovereignty Audit Chain
 * Immutable hash-chained audit entries for compliance evidence.
 * v9.0.0 "Crown Prime"
 */

// ─── Types ────────────────────────────────────────────────────────

export type SovereigntyDecisionType =
  | 'jurisdiction_registered'
  | 'transfer_assessed'
  | 'consent_transition'
  | 'data_classified'
  | 'retention_applied'
  | 'legal_hold'
  | 'pia_assessed'
  | 'breach_reported'
  | 'breach_advanced'
  | 'compliance_check'
  | 'policy_change';

export interface SovereigntyAuditEntry {
  index: number;
  hash: string;
  previousHash: string;
  decisionType: SovereigntyDecisionType;
  jurisdiction: string;
  framework: string;
  dataClassification: string;
  outcome: 'approved' | 'denied' | 'conditional' | 'recorded';
  actor: string;
  rationale: string;
  contextSnapshot: Record<string, unknown>;
  timestamp: string;
}

export interface ChainVerification {
  valid: boolean;
  length: number;
  brokenAt: number | null;
  verifiedAt: string;
}

// ─── Storage ──────────────────────────────────────────────────────

const chain: SovereigntyAuditEntry[] = [];
const MAX_CHAIN = 5000;
let lastHash = 'sovereign_genesis_0000';

// ─── FNV-1a ───────────────────────────────────────────────────────

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function computeEntryHash(entry: Omit<SovereigntyAuditEntry, 'hash'>): string {
  const payload = `${entry.index}:${entry.previousHash}:${entry.decisionType}:${entry.jurisdiction}:${entry.outcome}:${entry.timestamp}`;
  return `sov_${fnv1a(payload)}`;
}

// ─── Core Operations ─────────────────────────────────────────────

export function appendSovereigntyAudit(
  decisionType: SovereigntyDecisionType,
  jurisdiction: string,
  framework: string,
  dataClassification: string,
  outcome: SovereigntyAuditEntry['outcome'],
  actor: string,
  rationale: string,
  contextSnapshot: Record<string, unknown> = {}
): SovereigntyAuditEntry {
  const partial = {
    index: chain.length,
    previousHash: lastHash,
    decisionType,
    jurisdiction,
    framework,
    dataClassification,
    outcome,
    actor,
    rationale,
    contextSnapshot,
    timestamp: new Date().toISOString(),
  };

  const hash = computeEntryHash(partial);
  const entry: SovereigntyAuditEntry = { ...partial, hash };

  chain.push(entry);
  lastHash = hash;
  if (chain.length > MAX_CHAIN) chain.splice(0, chain.length - MAX_CHAIN);

  return entry;
}

export function verifyChainIntegrity(): ChainVerification {
  let prevHash = chain.length > 0 ? chain[0].previousHash : lastHash;

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    if (entry.previousHash !== prevHash) {
      return { valid: false, length: chain.length, brokenAt: i, verifiedAt: new Date().toISOString() };
    }
    const expected = computeEntryHash({ ...entry });
    if (entry.hash !== expected) {
      return { valid: false, length: chain.length, brokenAt: i, verifiedAt: new Date().toISOString() };
    }
    prevHash = entry.hash;
  }

  return { valid: true, length: chain.length, brokenAt: null, verifiedAt: new Date().toISOString() };
}

// ─── Queries ──────────────────────────────────────────────────────

export function getSovereigntyChain(): SovereigntyAuditEntry[] { return [...chain]; }
export function getChainLength(): number { return chain.length; }
export function getRecentEntries(count: number = 20): SovereigntyAuditEntry[] { return chain.slice(-count); }
export function getEntriesByType(type: SovereigntyDecisionType): SovereigntyAuditEntry[] {
  return chain.filter(e => e.decisionType === type);
}
export function getChainHealth(): number {
  const verification = verifyChainIntegrity();
  return verification.valid ? 100 : Math.max(0, Math.round(((verification.brokenAt || 0) / chain.length) * 100));
}
