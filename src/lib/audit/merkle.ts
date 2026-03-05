/**
 * Merkle Audit Chain — Typed receipts with correct verification algorithm
 * Chain verification recomputes hashes from genesis to detect tampering.
 */

import type { AuditReceipt } from './receipts';
import { hashReceipt, createReceipt, type ReceiptType } from './receipts';
import { anchorHead, verifyAnchors } from './anchors';

const GENESIS_HASH = 'genesis';

const chain: AuditReceipt[] = [];
let currentHead = GENESIS_HASH;
const MAX_CHAIN_LENGTH = 5000;

/** Append a receipt to the chain */
export async function appendReceipt(
  type: ReceiptType,
  actor: string,
  inputs: unknown,
  outputs: unknown,
  metadata?: Record<string, unknown>
): Promise<AuditReceipt> {
  const receipt = await createReceipt(type, actor, inputs, outputs, currentHead, metadata);
  const receiptHash = await hashReceipt(receipt);

  chain.push(receipt);
  currentHead = receiptHash;

  // Anchor every 100 receipts
  if (chain.length % 100 === 0) {
    await anchorHead(currentHead, chain.length);
  }

  // Trim old entries if needed
  if (chain.length > MAX_CHAIN_LENGTH) {
    chain.splice(0, chain.length - MAX_CHAIN_LENGTH);
  }

  return receipt;
}

/**
 * Verify chain integrity from genesis.
 * Correct algorithm: recompute each receipt's hash and verify prev_hash linkage.
 */
export async function verifyChain(): Promise<{
  valid: boolean;
  length: number;
  head: string;
  anchor_consistent: boolean;
  broken_at?: number;
}> {
  const anchorCheck = await verifyAnchors();

  if (chain.length === 0) {
    return { valid: true, length: 0, head: GENESIS_HASH, anchor_consistent: anchorCheck.consistent };
  }

  // First receipt must link to genesis
  if (chain[0].prev_hash !== GENESIS_HASH) {
    return { valid: false, length: chain.length, head: currentHead, anchor_consistent: anchorCheck.consistent, broken_at: 0 };
  }

  let prevHash = GENESIS_HASH;

  for (let i = 0; i < chain.length; i++) {
    // Verify the receipt's prev_hash matches the computed hash of the previous receipt
    if (chain[i].prev_hash !== prevHash) {
      return { valid: false, length: chain.length, head: currentHead, anchor_consistent: anchorCheck.consistent, broken_at: i };
    }

    // Recompute the hash of this receipt for the next iteration
    const computedHash = await hashReceipt(chain[i]);

    // If we have a next receipt, its prev_hash must match this computed hash
    // We set prevHash to the recomputed hash for the next round
    prevHash = computedHash;
  }

  return { valid: true, length: chain.length, head: currentHead, anchor_consistent: anchorCheck.consistent };
}

/** Get chain length */
export function getChainLength(): number {
  return chain.length;
}

/** Get recent receipts */
export function getRecentReceipts(limit = 20): AuditReceipt[] {
  return chain.slice(-limit);
}

/** Get head hash */
export function getChainHead(): string {
  return currentHead;
}
