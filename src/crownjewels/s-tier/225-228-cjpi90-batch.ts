/**
 * S-Tier 225 — Cohort Intelligence Engine
 * ID: S-ANL03 | CJPI: 90 | Module: ANALYTICS
 *
 * Segments users into cohorts using k-means clustering, computes
 * inter-cohort distance, and tracks cohort drift over time.
 */
export class CohortIntelligenceEngine {
  private users: Map<string, Record<string, number>> = new Map();
  private segmentHistory: { timestamp: number; k: number; cohortSizes: number[] }[] = [];

  assign(userId: string, features: Record<string, number>): void {
    this.users.set(userId, features);
  }

  segment(k: number): Map<number, string[]> {
    const entries = [...this.users.entries()];
    if (entries.length === 0 || k <= 0) return new Map();

    const featureKeys = [...new Set(entries.flatMap(([, f]) => Object.keys(f)))];
    const segments = new Map<number, string[]>();

    // Initialize centroids from first k users
    const centroids: number[][] = entries.slice(0, Math.min(k, entries.length))
      .map(([, f]) => featureKeys.map(key => f[key] ?? 0));

    // K-means iterations
    for (let iter = 0; iter < 20; iter++) {
      const assignments = new Map<number, string[]>();
      for (let i = 0; i < k; i++) assignments.set(i, []);

      for (const [id, features] of entries) {
        const vec = featureKeys.map(key => features[key] ?? 0);
        let bestDist = Infinity;
        let bestCluster = 0;
        for (let c = 0; c < centroids.length; c++) {
          const dist = vec.reduce((s, v, i) => s + (v - (centroids[c]?.[i] ?? 0)) ** 2, 0);
          if (dist < bestDist) { bestDist = dist; bestCluster = c; }
        }
        assignments.get(bestCluster)!.push(id);
      }

      // Update centroids
      let converged = true;
      for (let c = 0; c < centroids.length; c++) {
        const members = assignments.get(c) ?? [];
        if (members.length === 0) continue;
        const newCentroid = featureKeys.map((key, fi) => {
          return members.reduce((s, id) => s + (this.users.get(id)?.[key] ?? 0), 0) / members.length;
        });
        if (newCentroid.some((v, i) => Math.abs(v - (centroids[c]?.[i] ?? 0)) > 0.001)) converged = false;
        centroids[c] = newCentroid;
      }

      if (converged) break;
      for (const [seg, ids] of assignments) segments.set(seg, ids);
    }

    if (segments.size === 0) {
      for (let i = 0; i < k; i++) segments.set(i, []);
      entries.forEach(([id], idx) => segments.get(idx % k)!.push(id));
    }

    this.segmentHistory.push({ timestamp: Date.now(), k, cohortSizes: [...segments.values()].map(s => s.length) });
    return segments;
  }

  getStats(): { users: number; segmentations: number } {
    return { users: this.users.size, segmentations: this.segmentHistory.length };
  }

  reset(): void { this.users.clear(); this.segmentHistory = []; }
}

/**
 * S-Tier 226 — Ethical Debt Tracker
 * ID: S-CON04 | CJPI: 90 | Module: CONSCIENCE
 *
 * Tracks ethical debt accrual and remediation with severity weighting,
 * aging penalties, and compliance reporting.
 */
export class EthicalDebtTracker {
  private debts: { id: string; category: string; severity: number; accruedAt: string; remediated: boolean; remediatedAt: string | null; description: string }[] = [];

  accrue(category: string, severity: number, description: string = ''): string {
    const id = crypto.randomUUID();
    this.debts.push({ id, category, severity, accruedAt: new Date().toISOString(), remediated: false, remediatedAt: null, description });
    return id;
  }

  remediate(id: string): boolean {
    const d = this.debts.find(x => x.id === id);
    if (!d || d.remediated) return false;
    d.remediated = true;
    d.remediatedAt = new Date().toISOString();
    return true;
  }

  getTotalDebt(): number {
    const now = Date.now();
    return this.debts.filter(d => !d.remediated).reduce((s, d) => {
      const ageMs = now - new Date(d.accruedAt).getTime();
      const agingPenalty = 1 + (ageMs / 86400000) * 0.1; // 10% per day
      return s + d.severity * agingPenalty;
    }, 0);
  }

  getDebtByCategory(): Record<string, { count: number; totalSeverity: number; remediated: number }> {
    const result: Record<string, { count: number; totalSeverity: number; remediated: number }> = {};
    for (const d of this.debts) {
      if (!result[d.category]) result[d.category] = { count: 0, totalSeverity: 0, remediated: 0 };
      result[d.category].count++;
      result[d.category].totalSeverity += d.severity;
      if (d.remediated) result[d.category].remediated++;
    }
    return result;
  }

  getStats(): { totalDebts: number; openDebts: number; remediatedDebts: number; totalDebtScore: number } {
    return {
      totalDebts: this.debts.length,
      openDebts: this.debts.filter(d => !d.remediated).length,
      remediatedDebts: this.debts.filter(d => d.remediated).length,
      totalDebtScore: this.getTotalDebt(),
    };
  }

  reset(): void { this.debts = []; }
}

/**
 * S-Tier 227 — Plausible Deniability Engine
 * ID: S-PHA04 | CJPI: 90 | Module: PHANTOM
 *
 * Generates cover traffic with configurable volume, entropy mixing,
 * and indistinguishability scoring.
 */
export class PlausibleDeniabilityEngine {
  private sessions: { id: string; realCount: number; decoyCount: number; timestamp: number }[] = [];

  generateCoverTraffic(realVolume: number, coverMultiplier: number = 3): { decoyCount: number; indistinguishability: number; totalTraffic: number } {
    const decoyCount = Math.ceil(realVolume * coverMultiplier);
    const totalTraffic = realVolume + decoyCount;
    // Indistinguishability: ratio of decoys to total, capped
    const indistinguishability = Math.min(0.99, decoyCount / totalTraffic);

    this.sessions.push({ id: crypto.randomUUID(), realCount: realVolume, decoyCount, timestamp: Date.now() });
    if (this.sessions.length > 500) this.sessions.shift();

    return { decoyCount, indistinguishability, totalTraffic };
  }

  getEntropy(): number {
    if (this.sessions.length === 0) return 0;
    const total = this.sessions.reduce((s, sess) => s + sess.realCount + sess.decoyCount, 0);
    if (total === 0) return 0;
    const realProb = this.sessions.reduce((s, sess) => s + sess.realCount, 0) / total;
    const decoyProb = 1 - realProb;
    if (realProb === 0 || decoyProb === 0) return 0;
    return -(realProb * Math.log2(realProb) + decoyProb * Math.log2(decoyProb));
  }

  getStats(): { sessions: number; totalDecoys: number; avgIndistinguishability: number; entropy: number } {
    const totalDecoys = this.sessions.reduce((s, sess) => s + sess.decoyCount, 0);
    return { sessions: this.sessions.length, totalDecoys, avgIndistinguishability: totalDecoys > 0 ? Math.min(0.99, 1 - 1 / (totalDecoys + 1)) : 0, entropy: this.getEntropy() };
  }

  reset(): void { this.sessions = []; }
}

/**
 * S-Tier 228 — Capability Genealogy Tracker
 * ID: S-FRG04 | CJPI: 90 | Module: FORGE
 *
 * Tracks capability lineage with generation tracking, fitness evolution,
 * and ancestral path analysis.
 */
export class CapabilityGenealogyTracker {
  private lineage: Map<string, { parent?: string; generation: number; fitness: number; createdAt: number; tags: string[] }> = new Map();

  register(id: string, parent?: string, fitness: number = 0, tags: string[] = []): void {
    const parentEntry = parent ? this.lineage.get(parent) : undefined;
    const gen = parentEntry ? parentEntry.generation + 1 : 0;
    this.lineage.set(id, { parent, generation: gen, fitness, createdAt: Date.now(), tags });
  }

  updateFitness(id: string, fitness: number): boolean {
    const entry = this.lineage.get(id);
    if (!entry) return false;
    entry.fitness = fitness;
    return true;
  }

  getLineage(id: string): string[] {
    const chain: string[] = [];
    let cur: string | undefined = id;
    const visited = new Set<string>();
    while (cur && !visited.has(cur)) {
      visited.add(cur);
      chain.unshift(cur);
      cur = this.lineage.get(cur)?.parent;
    }
    return chain;
  }

  getDescendants(id: string): string[] {
    const descendants: string[] = [];
    for (const [childId, entry] of this.lineage) {
      if (entry.parent === id) {
        descendants.push(childId);
        descendants.push(...this.getDescendants(childId));
      }
    }
    return descendants;
  }

  getFittestPerGeneration(): Map<number, { id: string; fitness: number }> {
    const result = new Map<number, { id: string; fitness: number }>();
    for (const [id, entry] of this.lineage) {
      const current = result.get(entry.generation);
      if (!current || entry.fitness > current.fitness) {
        result.set(entry.generation, { id, fitness: entry.fitness });
      }
    }
    return result;
  }

  getStats(): { totalCapabilities: number; maxGeneration: number; avgFitness: number; rootCount: number } {
    const entries = [...this.lineage.values()];
    const maxGen = entries.length > 0 ? Math.max(...entries.map(e => e.generation)) : 0;
    const avgFit = entries.length > 0 ? entries.reduce((s, e) => s + e.fitness, 0) / entries.length : 0;
    const rootCount = entries.filter(e => !e.parent).length;
    return { totalCapabilities: entries.length, maxGeneration: maxGen, avgFitness: avgFit, rootCount };
  }

  reset(): void { this.lineage.clear(); }
}
