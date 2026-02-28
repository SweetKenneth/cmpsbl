/**
 * Receipt Chain Integrity (Merkle-Style)
 * Links evolution receipts cryptographically to form a tamper-evident chain.
 * Subscribers can verify the full evolution history hasn't been altered.
 */

export interface ChainedReceipt {
  id: string;
  proposalId: string;
  tenantId: string;
  previousHash: string;
  contentHash: string;
  chainHash: string; // hash(previousHash + contentHash)
  sequenceNumber: number;
  timestamp: number;
  payload: Record<string, unknown>;
}

export interface ChainVerification {
  valid: boolean;
  totalReceipts: number;
  verifiedCount: number;
  firstBrokenAt: number | null;
  brokenReceiptId: string | null;
  chainHead: string | null;
}

const chain: ChainedReceipt[] = [];

async function hashString(input: string): Promise<string> {
  // Use Web Crypto API for SHA-256
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback: simple hash for environments without Web Crypto
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export async function appendReceipt(
  proposalId: string,
  tenantId: string,
  payload: Record<string, unknown>,
): Promise<ChainedReceipt> {
  const previousHash = chain.length > 0
    ? chain[chain.length - 1].chainHash
    : '0'.repeat(64);

  const contentHash = await hashString(JSON.stringify(payload));
  const chainHash = await hashString(previousHash + contentHash);

  const receipt: ChainedReceipt = {
    id: `rcpt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    proposalId,
    tenantId,
    previousHash,
    contentHash,
    chainHash,
    sequenceNumber: chain.length,
    timestamp: Date.now(),
    payload,
  };

  chain.push(receipt);
  return receipt;
}

export async function verifyChain(): Promise<ChainVerification> {
  if (chain.length === 0) {
    return { valid: true, totalReceipts: 0, verifiedCount: 0, firstBrokenAt: null, brokenReceiptId: null, chainHead: null };
  }

  let verifiedCount = 0;

  for (let i = 0; i < chain.length; i++) {
    const receipt = chain[i];

    // Verify content hash
    const expectedContentHash = await hashString(JSON.stringify(receipt.payload));
    if (expectedContentHash !== receipt.contentHash) {
      return {
        valid: false,
        totalReceipts: chain.length,
        verifiedCount,
        firstBrokenAt: i,
        brokenReceiptId: receipt.id,
        chainHead: chain[chain.length - 1].chainHash,
      };
    }

    // Verify chain link
    const expectedPrevHash = i === 0 ? '0'.repeat(64) : chain[i - 1].chainHash;
    if (receipt.previousHash !== expectedPrevHash) {
      return {
        valid: false,
        totalReceipts: chain.length,
        verifiedCount,
        firstBrokenAt: i,
        brokenReceiptId: receipt.id,
        chainHead: chain[chain.length - 1].chainHash,
      };
    }

    const expectedChainHash = await hashString(receipt.previousHash + receipt.contentHash);
    if (expectedChainHash !== receipt.chainHash) {
      return {
        valid: false,
        totalReceipts: chain.length,
        verifiedCount,
        firstBrokenAt: i,
        brokenReceiptId: receipt.id,
        chainHead: chain[chain.length - 1].chainHash,
      };
    }

    verifiedCount++;
  }

  return {
    valid: true,
    totalReceipts: chain.length,
    verifiedCount,
    firstBrokenAt: null,
    brokenReceiptId: null,
    chainHead: chain[chain.length - 1].chainHash,
  };
}

export function getChain(): ChainedReceipt[] {
  return [...chain];
}

export function getChainHead(): string | null {
  return chain.length > 0 ? chain[chain.length - 1].chainHash : null;
}

export function getReceiptsByTenant(tenantId: string): ChainedReceipt[] {
  return chain.filter(r => r.tenantId === tenantId);
}

export function getChainLength(): number {
  return chain.length;
}
