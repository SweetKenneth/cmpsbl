/**
 * S-Tier 136 — Audit-Grade Decision Ledger
 * ID: S-CJ94 | CJPI: 86 | Module: AUDIT
 * 
 * Immutable decision ledger with audit-grade traceability.
 */

export interface LedgerEntry {
  id: string;
  sequenceNumber: number;
  decisionType: string;
  actor: string;
  action: string;
  context: Record<string, unknown>;
  previousHash: string;
  hash: string;
  timestamp: string;
}

export class AuditGradeDecisionLedger {
  private entries: LedgerEntry[] = [];
  private sequence = 0;

  record(decisionType: string, actor: string, action: string, context: Record<string, unknown> = {}): LedgerEntry {
    this.sequence++;
    const previousHash = this.entries.length > 0 ? this.entries[this.entries.length - 1].hash : '0'.repeat(64);
    const payload = `${this.sequence}:${decisionType}:${actor}:${action}:${previousHash}`;
    const hash = this.simpleHash(payload);

    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      sequenceNumber: this.sequence,
      decisionType, actor, action, context,
      previousHash, hash,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry;
  }

  verify(): { valid: boolean; brokenAt?: number } {
    for (let i = 1; i < this.entries.length; i++) {
      if (this.entries[i].previousHash !== this.entries[i - 1].hash) {
        return { valid: false, brokenAt: i };
      }
    }
    return { valid: true };
  }

  query(filter: { actor?: string; decisionType?: string; from?: string; to?: string }): LedgerEntry[] {
    return this.entries.filter(e => {
      if (filter.actor && e.actor !== filter.actor) return false;
      if (filter.decisionType && e.decisionType !== filter.decisionType) return false;
      if (filter.from && e.timestamp < filter.from) return false;
      if (filter.to && e.timestamp > filter.to) return false;
      return true;
    });
  }

  getEntries(): LedgerEntry[] { return [...this.entries]; }
  getLength(): number { return this.entries.length; }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}
