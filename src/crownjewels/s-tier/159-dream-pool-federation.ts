/**
 * S-Tier 159 — Dream Pool Federation
 * ID: S-CJ117 | CJPI: 85 | Module: DREAM
 * Federated dream pool for cross-agency pattern sharing.
 */

export interface FederatedPattern {
  id: string;
  originAgency: string;
  pattern: string;
  confidence: number;
  shareCount: number;
  createdAt: string;
}

export class DreamPoolFederation {
  private patterns: Map<string, FederatedPattern> = new Map();
  private agencies: Set<string> = new Set();

  registerAgency(agencyId: string): void { this.agencies.add(agencyId); }

  contribute(agencyId: string, pattern: string, confidence: number): FederatedPattern {
    const fp: FederatedPattern = {
      id: crypto.randomUUID(), originAgency: agencyId, pattern,
      confidence, shareCount: 0, createdAt: new Date().toISOString(),
    };
    this.patterns.set(fp.id, fp);
    return fp;
  }

  discover(minConfidence: number = 0.5): FederatedPattern[] {
    return [...this.patterns.values()]
      .filter(p => p.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence);
  }

  share(patternId: string): boolean {
    const p = this.patterns.get(patternId);
    if (!p) return false;
    p.shareCount++;
    return true;
  }

  getStats(): { totalPatterns: number; agencies: number; avgConfidence: number } {
    const patterns = [...this.patterns.values()];
    return {
      totalPatterns: patterns.length, agencies: this.agencies.size,
      avgConfidence: patterns.length > 0 ? patterns.reduce((s, p) => s + p.confidence, 0) / patterns.length : 0,
    };
  }
}
