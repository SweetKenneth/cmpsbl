/**
 * Merkle Audit Chain — Typed receipts with multi-anchor verification
 */

import type { AuditReceipt } from './receipts';
import { hashReceipt, createReceipt, type ReceiptType } from './receipts';
import { anchorHead, verifyAnchors, getHeadHash } from './anchors';

const chain: AuditReceipt[] = [];
let currentHead = 'genesis';
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
    anchorHead(currentHead, chain.length);
  }

  // Trim old entries if needed
  if (chain.length > MAX_CHAIN_LENGTH) {
    chain.splice(0, chain.length - MAX_CHAIN_LENGTH);
  }

  return receipt;
}

/** Verify chain integrity from genesis (or nearest anchor) */
export async function verifyChain(): Promise<{
  valid: boolean;
  length: number;
  head: string;
  anchor_consistent: boolean;
  broken_at?: number;
}> {
  const anchorCheck = verifyAnchors();

  if (chain.length === 0) {
    return { valid: true, length: 0, head: 'genesis', anchor_consistent: anchorCheck.consistent };
  }

  let prevHash = chain[0].prev_hash; // should be 'genesis' or a known anchor

  for (let i = 0; i < chain.length; i++) {
    if (chain[i].prev_hash !== prevHash) {
      return { valid: false, length: chain.length, head: currentHead, anchor_consistent: anchorCheck.consistent, broken_at: i };
    }
    prevHash = await hashReceipt(chain[i]);
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
