/**
 * HARVEST Ultimate — Provenance Ledger
 * Hash-chained audit trail for every record: where it came from, when,
 * what transforms were applied, who consumed it. Full data lineage.
 */

export interface ProvenanceEntry {
  id: string;
  recordHash: string;
  sourceId: string;
  sourceUrl: string;
  fetchedAt: number;
  transforms: TransformRecord[];
  consumers: string[];
  chainHash: string;       // hash of this entry + previous chain hash
  previousHash: string;    // link to previous entry
}

export interface TransformRecord {
  operation: string;
  appliedAt: number;
  inputHash: string;
  outputHash: string;
}

export interface LineageQuery {
  recordHash: string;
  chain: ProvenanceEntry[];
  depth: number;
  fullyTraced: boolean;
}

export interface ProvenanceLedgerStats {
  totalEntries: number;
  chainLength: number;
  totalTransforms: number;
  totalConsumers: number;
  chainIntegrity: boolean;
}

const MAX_ENTRIES = 5000;
const entries: ProvenanceEntry[] = [];
let currentChainHash = '0000000000';

function computeHash(data: string): string {
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = ((h << 5) - h + data.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36).padStart(8, '0');
}

export function recordProvenance(
  recordHash: string,
  sourceId: string,
  sourceUrl: string,
  transforms: TransformRecord[] = []
): ProvenanceEntry {
  const previousHash = currentChainHash;
  const chainData = `${recordHash}|${sourceId}|${previousHash}|${Date.now()}`;
  const chainHash = computeHash(chainData);

  const entry: ProvenanceEntry = {
    id: `prov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recordHash, sourceId, sourceUrl,
    fetchedAt: Date.now(),
    transforms, consumers: [],
    chainHash, previousHash,
  };

  if (entries.length >= MAX_ENTRIES) entries.shift();
  entries.push(entry);
  currentChainHash = chainHash;

  return entry;
}

export function addTransform(recordHash: string, operation: string, outputHash: string): void {
  const entry = [...entries].reverse().find(e => e.recordHash === recordHash);
  if (!entry) return;
  entry.transforms.push({
    operation, appliedAt: Date.now(),
    inputHash: recordHash, outputHash,
  });
}

export function addConsumer(recordHash: string, consumerNode: string): void {
  const entry = [...entries].reverse().find(e => e.recordHash === recordHash);
  if (entry && !entry.consumers.includes(consumerNode)) {
    entry.consumers.push(consumerNode);
  }
}

export function traceLineage(recordHash: string): LineageQuery {
  const chain: ProvenanceEntry[] = [];
  const matching = entries.filter(e => e.recordHash === recordHash);
  chain.push(...matching);

  // Walk chain backwards
  let current = matching[0];
  let depth = 0;
  while (current && depth < 100) {
    const prev = entries.find(e => e.chainHash === current.previousHash);
    if (!prev || chain.includes(prev)) break;
    chain.push(prev);
    current = prev;
    depth++;
  }

  return {
    recordHash,
    chain,
    depth: chain.length,
    fullyTraced: chain.length > 0,
  };
}

export function verifyChainIntegrity(): boolean {
  if (entries.length < 2) return true;
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].previousHash !== entries[i - 1].chainHash) {
      return false;
    }
  }
  return true;
}

export function getLedgerStats(): ProvenanceLedgerStats {
  return {
    totalEntries: entries.length,
    chainLength: entries.length,
    totalTransforms: entries.reduce((s, e) => s + e.transforms.length, 0),
    totalConsumers: new Set(entries.flatMap(e => e.consumers)).size,
    chainIntegrity: verifyChainIntegrity(),
  };
}

export function resetLedgerState(): void {
  entries.length = 0;
  currentChainHash = '0000000000';
}
