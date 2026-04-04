/**
 * S-Tier 215 — Contract Evolution Mediator
 * ID: S-TRT03 | CJPI: 91 | Module: TREATY
 *
 * Manages contract lifecycle with versioned evolution, diff generation,
 * rollback support, and approval workflows.
 */

export interface ContractVersion {
  version: number;
  terms: Record<string, unknown>;
  changedAt: string;
  changedBy: string;
  changeReason: string;
  diff: string[];
}

export interface Contract {
  id: string;
  currentVersion: number;
  terms: Record<string, unknown>;
  history: ContractVersion[];
  status: 'draft' | 'active' | 'suspended' | 'terminated';
  createdAt: string;
}

export class ContractEvolutionMediator {
  private contracts: Map<string, Contract> = new Map();
  private pendingApprovals: Map<string, { contractId: string; newTerms: Record<string, unknown>; requestedBy: string }> = new Map();

  register(id: string, terms: Record<string, unknown>, status: Contract['status'] = 'draft'): void {
    this.contracts.set(id, {
      id,
      currentVersion: 1,
      terms: { ...terms },
      history: [{ version: 1, terms: { ...terms }, changedAt: new Date().toISOString(), changedBy: 'system', changeReason: 'Initial registration', diff: [] }],
      status,
      createdAt: new Date().toISOString(),
    });
  }

  evolve(id: string, newTerms: Record<string, unknown>, changedBy: string = 'system', changeReason: string = ''): boolean {
    const c = this.contracts.get(id);
    if (!c || c.status === 'terminated') return false;

    const diff = this.computeDiff(c.terms, newTerms);
    c.currentVersion++;
    const previousTerms = { ...c.terms };
    c.terms = { ...c.terms, ...newTerms };

    c.history.push({
      version: c.currentVersion,
      terms: { ...c.terms },
      changedAt: new Date().toISOString(),
      changedBy,
      changeReason,
      diff,
    });

    if (c.history.length > 100) c.history = c.history.slice(-100);

    return true;
  }

  requestApproval(contractId: string, newTerms: Record<string, unknown>, requestedBy: string): string {
    const approvalId = crypto.randomUUID();
    this.pendingApprovals.set(approvalId, { contractId, newTerms, requestedBy });
    return approvalId;
  }

  approve(approvalId: string, approvedBy: string): boolean {
    const pending = this.pendingApprovals.get(approvalId);
    if (!pending) return false;
    this.pendingApprovals.delete(approvalId);
    return this.evolve(pending.contractId, pending.newTerms, approvedBy, `Approved by ${approvedBy}`);
  }

  rollback(id: string, toVersion: number): boolean {
    const c = this.contracts.get(id);
    if (!c) return false;
    const target = c.history.find(h => h.version === toVersion);
    if (!target) return false;

    c.currentVersion++;
    c.terms = { ...target.terms };
    c.history.push({
      version: c.currentVersion,
      terms: { ...target.terms },
      changedAt: new Date().toISOString(),
      changedBy: 'system',
      changeReason: `Rollback to version ${toVersion}`,
      diff: this.computeDiff(c.terms, target.terms),
    });

    return true;
  }

  setStatus(id: string, status: Contract['status']): boolean {
    const c = this.contracts.get(id);
    if (!c) return false;
    c.status = status;
    return true;
  }

  getVersion(id: string): number {
    return this.contracts.get(id)?.currentVersion ?? 0;
  }

  getHistory(id: string): ContractVersion[] {
    return [...(this.contracts.get(id)?.history ?? [])];
  }

  getDiff(id: string, versionA: number, versionB: number): string[] {
    const c = this.contracts.get(id);
    if (!c) return [];
    const a = c.history.find(h => h.version === versionA);
    const b = c.history.find(h => h.version === versionB);
    if (!a || !b) return [];
    return this.computeDiff(a.terms, b.terms);
  }

  private computeDiff(oldTerms: Record<string, unknown>, newTerms: Record<string, unknown>): string[] {
    const diff: string[] = [];
    const allKeys = new Set([...Object.keys(oldTerms), ...Object.keys(newTerms)]);
    for (const key of allKeys) {
      const oldVal = JSON.stringify(oldTerms[key]);
      const newVal = JSON.stringify(newTerms[key]);
      if (oldVal !== newVal) {
        if (!(key in oldTerms)) diff.push(`+ ${key}: ${newVal}`);
        else if (!(key in newTerms)) diff.push(`- ${key}: ${oldVal}`);
        else diff.push(`~ ${key}: ${oldVal} → ${newVal}`);
      }
    }
    return diff;
  }

  getStats(): { contracts: number; totalVersions: number; pendingApprovals: number; statusBreakdown: Record<string, number> } {
    const all = [...this.contracts.values()];
    const statusBreakdown: Record<string, number> = {};
    let totalVersions = 0;
    for (const c of all) {
      statusBreakdown[c.status] = (statusBreakdown[c.status] ?? 0) + 1;
      totalVersions += c.currentVersion;
    }
    return { contracts: all.length, totalVersions, pendingApprovals: this.pendingApprovals.size, statusBreakdown };
  }

  reset(): void {
    this.contracts.clear();
    this.pendingApprovals.clear();
  }
}
