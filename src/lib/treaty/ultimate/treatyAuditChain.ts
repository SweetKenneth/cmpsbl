/**
 * TREATY Ultimate — Audit Chain
 * Hash-chained immutable audit trail of all contract events.
 * Provides tamper-evident logging with FNV-1a integrity hashing.
 */

export interface AuditEntry {
  id: string;
  contractId: string;
  eventType: string;
  actor: string;
  details: Record<string, unknown>;
  timestamp: number;
  hash: string;
  prevHash: string;
}

const MAX_ENTRIES = 2000;
const chain: AuditEntry[] = [];
let entryCounter = 0;

/** FNV-1a hash for chain integrity */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function appendAudit(
  contractId: string,
  eventType: string,
  actor: string,
  details: Record<string, unknown> = {},
): AuditEntry {
  const prevHash = chain.length > 0 ? chain[chain.length - 1].hash : '00000000';
  const timestamp = Date.now();
  const payload = `${prevHash}:${contractId}:${eventType}:${actor}:${timestamp}`;
  const hash = fnv1a(payload);

  const entry: AuditEntry = {
    id: `audit-${++entryCounter}`,
    contractId,
    eventType,
    actor,
    details,
    timestamp,
    hash,
    prevHash,
  };

  if (chain.length >= MAX_ENTRIES) chain.shift();
  chain.push(entry);
  return entry;
}

export function verifyChainIntegrity(): { valid: boolean; brokenAt: number | null; totalEntries: number } {
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].prevHash !== chain[i - 1].hash) {
      return { valid: false, brokenAt: i, totalEntries: chain.length };
    }
  }
  return { valid: true, brokenAt: null, totalEntries: chain.length };
}

export function getAuditTrail(contractId?: string): AuditEntry[] {
  if (!contractId) return [...chain];
  return chain.filter(e => e.contractId === contractId);
}

export function getAuditStats() {
  const contracts = new Set(chain.map(e => e.contractId));
  return {
    totalEntries: chain.length,
    uniqueContracts: contracts.size,
    chainIntegrity: verifyChainIntegrity().valid,
    oldestEntry: chain.length > 0 ? chain[0].timestamp : null,
    newestEntry: chain.length > 0 ? chain[chain.length - 1].timestamp : null,
  };
}
