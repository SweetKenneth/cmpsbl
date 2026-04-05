/**
 * AUTO-SENTINEL — Receipt Chain
 * Pattern: Audit Receipts (Merkle Chain)
 *
 * Produces tamper-evident provenance records for every
 * action the sentinel takes. Each receipt links to the
 * previous via hash, forming an immutable chain.
 */

import type { SentinelReceipt } from './types';

// ── Hash Utility ───────────────────────────────────────────────────────

async function hashContent(content: string): Promise<string> {
  const data = new TextEncoder().encode(content);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Receipt Chain ──────────────────────────────────────────────────────

export class ReceiptChain {
  private chain: SentinelReceipt[] = [];
  private headHash = '0'.repeat(64); // genesis

  async append(
    action: SentinelReceipt['action'],
    input: unknown,
    output: unknown,
  ): Promise<SentinelReceipt> {
    const inputHash = await hashContent(JSON.stringify(input));
    const outputHash = await hashContent(JSON.stringify(output));

    const receipt: SentinelReceipt = {
      id: crypto.randomUUID(),
      action,
      actor: 'sentinel',
      inputHash,
      outputHash,
      timestamp: new Date().toISOString(),
      prevHash: this.headHash,
    };

    // Compute new head
    this.headHash = await hashContent(JSON.stringify({
      id: receipt.id,
      action: receipt.action,
      inputHash: receipt.inputHash,
      outputHash: receipt.outputHash,
      timestamp: receipt.timestamp,
      prevHash: receipt.prevHash,
    }));

    this.chain.push(receipt);
    return receipt;
  }

  getHead(): string {
    return this.headHash;
  }

  getChain(): SentinelReceipt[] {
    return [...this.chain];
  }

  getLength(): number {
    return this.chain.length;
  }

  /**
   * Verify chain integrity by re-computing hashes.
   * Returns true if chain is untampered.
   */
  async verify(): Promise<boolean> {
    let expectedPrev = '0'.repeat(64);

    for (const receipt of this.chain) {
      if (receipt.prevHash !== expectedPrev) return false;

      expectedPrev = await hashContent(JSON.stringify({
        id: receipt.id,
        action: receipt.action,
        inputHash: receipt.inputHash,
        outputHash: receipt.outputHash,
        timestamp: receipt.timestamp,
        prevHash: receipt.prevHash,
      }));
    }

    return expectedPrev === this.headHash;
  }
}
