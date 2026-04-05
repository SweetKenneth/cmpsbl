/**
 * DEP-GUARDIAN — Receipt Chain (AUDIT primitive)
 * Pattern: Merkle-chained provenance for tamper-evident audit trail.
 * Identical to Auto-Sentinel receipts — reusable across products.
 */

import type { GuardianReceipt } from './types';

// ── Simple hash (FNV-1a for determinism) ───────────────────────────────

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ── Receipt Chain ──────────────────────────────────────────────────────

export class ReceiptChain {
  private chain: GuardianReceipt[] = [];

  async append(
    phase: string,
    input: Record<string, unknown>,
    output: Record<string, unknown>,
  ): Promise<GuardianReceipt> {
    const parentHash = this.chain.length > 0
      ? this.chain[this.chain.length - 1].hash
      : null;

    const payload = JSON.stringify({ phase, input, output, parentHash });
    const hash = fnv1a(payload);

    const receipt: GuardianReceipt = {
      hash,
      parentHash,
      phase,
      input,
      output,
      timestamp: new Date().toISOString(),
    };

    this.chain.push(receipt);
    return receipt;
  }

  getHead(): string | null {
    return this.chain.length > 0 ? this.chain[this.chain.length - 1].hash : null;
  }

  getLength(): number {
    return this.chain.length;
  }

  getChain(): GuardianReceipt[] {
    return [...this.chain];
  }

  verify(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      if (this.chain[i].parentHash !== this.chain[i - 1].hash) {
        return false;
      }
    }
    return true;
  }
}
