/**
 * Mutation Receipt Chain — Immutable Tamper-Evident Ledger
 * 
 * Persists immutable mutation receipts with chained hash structure.
 * Each receipt references the previous receipt's hash for tamper resistance.
 * 
 * Receipt stores:
 * - Proposal ID and outcome
 * - Metrics deltas (before/after)
 * - Approval decisions
 * - Execution logs
 * - Chained SHA-256 hash
 */

import type { MutationProposal } from './mutation-pipeline';

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
  prevHash: string;
  hash: string;
}

export interface ChainIntegrity {
  valid: boolean;
  length: number;
  headHash: string;
  genesisHash: string;
  brokenAt?: number;
}

// ═══════════════════════════════════════════════════════════════
// CHAIN STATE
// ═══════════════════════════════════════════════════════════════

const chain: MutationReceipt[] = [];
const GENESIS_HASH = '0'.repeat(64);
const MAX_CHAIN_LENGTH = 5000;

// ═══════════════════════════════════════════════════════════════
// HASHING
// ═══════════════════════════════════════════════════════════════

function syncHash(input: string): string {
  // FNV-1a for synchronous contexts
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h * 0x01000193) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function computeReceiptHash(receipt: Omit<MutationReceipt, 'hash'>): string {
  const payload = [
    receipt.index,
    receipt.prevHash,
    receipt.mutationId,
    receipt.outcome,
    receipt.timestamp,
    JSON.stringify(receipt.metricsDeltas),
    JSON.stringify(receipt.approvalDecision),
  ].join(':');

  return syncHash(payload);
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

/** Append a receipt for a completed mutation */
export function appendReceipt(proposal: MutationProposal): MutationReceipt {
  const prevHash = chain.length > 0 ? chain[chain.length - 1].hash : GENESIS_HASH;

  const executionLog: string[] = [];
  if (proposal.shadowResult) {
    executionLog.push(`Shadow: ${proposal.shadowResult.success ? 'PASS' : 'FAIL'} (${proposal.shadowResult.executionTimeMs}ms)`);
    executionLog.push(...proposal.shadowResult.warnings.map(w => `Warning: ${w}`));
    executionLog.push(...proposal.shadowResult.errors.map(e => `Error: ${e}`));
  }
  if (proposal.dualExecution) {
    executionLog.push(`Dual Executor: ${proposal.dualExecution.agreement ? 'AGREE' : 'DISAGREE'}`);
  }

  const partialReceipt: Omit<MutationReceipt, 'hash'> = {
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

  const hash = computeReceiptHash(partialReceipt);
  const receipt: MutationReceipt = { ...partialReceipt, hash };

  chain.push(receipt);
  if (chain.length > MAX_CHAIN_LENGTH) chain.splice(0, 1000);

  return receipt;
}

/** Verify the entire chain's integrity */
export function verifyChain(): ChainIntegrity {
  if (chain.length === 0) {
    return { valid: true, length: 0, headHash: GENESIS_HASH, genesisHash: GENESIS_HASH };
  }

  for (let i = 0; i < chain.length; i++) {
    const receipt = chain[i];
    const expectedPrev = i === 0 ? GENESIS_HASH : chain[i - 1].hash;

    if (receipt.prevHash !== expectedPrev) {
      return {
        valid: false,
        length: chain.length,
        headHash: chain[chain.length - 1].hash,
        genesisHash: chain[0]?.prevHash || GENESIS_HASH,
        brokenAt: i,
      };
    }

    // Re-compute hash and compare
    const recomputed = computeReceiptHash({
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
      prevHash: receipt.prevHash,
    });

    if (recomputed !== receipt.hash) {
      return {
        valid: false,
        length: chain.length,
        headHash: chain[chain.length - 1].hash,
        genesisHash: chain[0]?.prevHash || GENESIS_HASH,
        brokenAt: i,
      };
    }
  }

  return {
    valid: true,
    length: chain.length,
    headHash: chain[chain.length - 1].hash,
    genesisHash: chain[0].prevHash,
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
  return chain.length > 0 ? chain[chain.length - 1].hash : GENESIS_HASH;
}

/** Get chain length */
export function getChainLength(): number {
  return chain.length;
}
