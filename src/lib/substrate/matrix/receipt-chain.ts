/**
 * Mutation Receipt Chain — Immutable Tamper-Evident Ledger
 * 
 * SHA-256 audit chain with canonicalized content hashing.
 * Each receipt carries:
 *   - contentHash: SHA-256 of the canonical receipt payload
 *   - chainHash:   SHA-256(prevHash + contentHash) — links receipts
 *   - prevHash:    chainHash of the previous receipt
 * 
 * Anchor heads written every 100 receipts to redundant stores.
 */

import type { MutationProposal } from './mutation-pipeline';
import { anchorHead, verifyAnchors } from '@/lib/audit/anchors';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface MutationReceipt {
  index: number;
  mutationId: string;
  title: string;
  source: string;
  outcome: 'promoted' | 'rejected' | 'rolled_back';
  phase: string;
  riskLevel: string;
  timestamp: number;
  metricsDeltas: Record<string, number>;
  approvalDecision: { approved: boolean; reason: string } | null;
  executionLog: string[];
  contentHash: string;
  chainHash: string;
  prevHash: string;
  algo: 'sha256';
  canonicalizationVersion: 'v1';
  /** @deprecated kept for backward compat — equals chainHash */
  hash: string;
}

export interface ChainIntegrity {
  valid: boolean;
  length: number;
  headHash: string;
  genesisHash: string;
  brokenAt?: number;
  anchor_consistent?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CHAIN STATE
// ═══════════════════════════════════════════════════════════════

const chain: MutationReceipt[] = [];
const GENESIS_HASH = '0'.repeat(64);
const MAX_CHAIN_LENGTH = 5000;
const ANCHOR_INTERVAL = 100;

// ═══════════════════════════════════════════════════════════════
// HASHING — WebCrypto SHA-256
// ═══════════════════════════════════════════════════════════════

/** Stable JSON with recursively sorted keys (canonicalization v1) */
function canonicalize(obj: unknown): string {
  return JSON.stringify(sortKeys(obj));
}

function sortKeys(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(sortKeys);
  if (typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((val as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return val;
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Compute contentHash from receipt payload fields */
async function computeContentHash(
  receipt: Omit<MutationReceipt, 'contentHash' | 'chainHash' | 'hash' | 'algo' | 'canonicalizationVersion'>
): Promise<string> {
  const payload = {
    index: receipt.index,
    mutationId: receipt.mutationId,
    title: receipt.title,
    source: receipt.source,
    outcome: receipt.outcome,
    phase: receipt.phase,
    riskLevel: receipt.riskLevel,
    timestamp: receipt.timestamp,
    metricsDeltas: receipt.metricsDeltas,
    approvalDecision: receipt.approvalDecision,
    executionLog: receipt.executionLog,
  };
  return sha256(canonicalize(payload));
}

/** Compute chainHash = SHA-256(prevHash + contentHash) */
async function computeChainHash(prevHash: string, contentHash: string): Promise<string> {
  return sha256(prevHash + contentHash);
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/** Append a receipt for a completed mutation */
export async function appendReceipt(proposal: MutationProposal): Promise<MutationReceipt> {
  const prevHash = chain.length > 0 ? chain[chain.length - 1].chainHash : GENESIS_HASH;

  const executionLog: string[] = [];
  if (proposal.shadowResult) {
    executionLog.push(`Shadow: ${proposal.shadowResult.success ? 'PASS' : 'FAIL'} (${proposal.shadowResult.executionTimeMs}ms)`);
    executionLog.push(...proposal.shadowResult.warnings.map(w => `Warning: ${w}`));
    executionLog.push(...proposal.shadowResult.errors.map(e => `Error: ${e}`));
  }
  if (proposal.dualExecution) {
    executionLog.push(`Dual Executor: ${proposal.dualExecution.agreement ? 'AGREE' : 'DISAGREE'}`);
  }

  const partial = {
    index: chain.length,
    mutationId: proposal.id,
    title: proposal.title,
    source: proposal.source,
    outcome: proposal.phase as 'promoted' | 'rejected' | 'rolled_back',
    phase: proposal.phase,
    riskLevel: proposal.riskLevel,
    timestamp: Date.now(),
    metricsDeltas: proposal.shadowResult?.metricsDeltas || {},
    approvalDecision: proposal.governorDecision
      ? { approved: proposal.governorDecision.approved, reason: proposal.governorDecision.reason }
      : null,
    executionLog,
    prevHash,
  };

  const contentHash = await computeContentHash(partial);
  const chainHash = await computeChainHash(prevHash, contentHash);

  const receipt: MutationReceipt = {
    ...partial,
    contentHash,
    chainHash,
    algo: 'sha256',
    canonicalizationVersion: 'v1',
    hash: chainHash, // backward compat
  };

  chain.push(receipt);

  // Anchor every N receipts
  if (chain.length % ANCHOR_INTERVAL === 0) {
    try {
      await anchorHead(chainHash, chain.length);
    } catch {
      // Anchor failure is non-fatal — logged via audit system
    }
  }

  if (chain.length > MAX_CHAIN_LENGTH) chain.splice(0, 1000);

  return receipt;
}

/** Verify the entire chain's integrity */
export async function verifyChain(): Promise<ChainIntegrity> {
  let anchorConsistent = true;
  try {
    const anchorCheck = await verifyAnchors();
    anchorConsistent = anchorCheck.consistent;
  } catch {
    anchorConsistent = false;
  }

  if (chain.length === 0) {
    return { valid: true, length: 0, headHash: GENESIS_HASH, genesisHash: GENESIS_HASH, anchor_consistent: anchorConsistent };
  }

  let prevHash = GENESIS_HASH;

  for (let i = 0; i < chain.length; i++) {
    const receipt = chain[i];

    // Check prev linkage
    if (receipt.prevHash !== prevHash) {
      return {
        valid: false, length: chain.length,
        headHash: chain[chain.length - 1].chainHash,
        genesisHash: chain[0].prevHash,
        brokenAt: i, anchor_consistent: anchorConsistent,
      };
    }

    // Recompute contentHash
    const recomputedContent = await computeContentHash(receipt);
    if (recomputedContent !== receipt.contentHash) {
      return {
        valid: false, length: chain.length,
        headHash: chain[chain.length - 1].chainHash,
        genesisHash: chain[0].prevHash,
        brokenAt: i, anchor_consistent: anchorConsistent,
      };
    }

    // Recompute chainHash
    const recomputedChain = await computeChainHash(prevHash, recomputedContent);
    if (recomputedChain !== receipt.chainHash) {
      return {
        valid: false, length: chain.length,
        headHash: chain[chain.length - 1].chainHash,
        genesisHash: chain[0].prevHash,
        brokenAt: i, anchor_consistent: anchorConsistent,
      };
    }

    prevHash = receipt.chainHash;
  }

  return {
    valid: true,
    length: chain.length,
    headHash: chain[chain.length - 1].chainHash,
    genesisHash: chain[0].prevHash,
    anchor_consistent: anchorConsistent,
  };
}

/** Get recent receipts */
export function getReceipts(limit = 50): MutationReceipt[] {
  return chain.slice(-limit);
}

/** Get receipt by mutation ID */
export function getReceiptByMutationId(mutationId: string): MutationReceipt | null {
  return chain.find(r => r.mutationId === mutationId) || null;
}

/** Get chain head hash */
export function getHeadHash(): string {
  return chain.length > 0 ? chain[chain.length - 1].chainHash : GENESIS_HASH;
}

/** Get chain length */
export function getChainLength(): number {
  return chain.length;
}
