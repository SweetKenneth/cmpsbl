/**
 * CONTENT-GUARDIAN — Receipt Chain (AUDIT primitive)
 * Merkle-chained provenance for tamper-evident content audit trail.
 */

import type { ContentGuardianReceipt } from './types';

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export class ReceiptChain {
  private chain: ContentGuardianReceipt[] = [];

  async append(
    phase: string,
    input: Record<string, unknown>,
    output: Record<string, unknown>,
  ): Promise<ContentGuardianReceipt> {
    const parentHash = this.chain.length > 0
      ? this.chain[this.chain.length - 1].hash
      : null;

    const payload = JSON.stringify({ phase, input, output, parentHash });
    const hash = fnv1a(payload);

    const receipt: ContentGuardianReceipt = {
      hash, parentHash, phase, input, output,
      timestamp: new Date().toISOString(),
    };

    this.chain.push(receipt);
    return receipt;
  }

  getHead(): string | null {
    return this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : null;
  }

  getLength(): number { return this.chain.length; }

  getChain(): ContentGuardianReceipt[] { return [...this.chain]; }

  verify(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      if (this.chain[i].parentHash !== this.chain[i - 1].hash) return false;
    }
    return true;
  }
}
