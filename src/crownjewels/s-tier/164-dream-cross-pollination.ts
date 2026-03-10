/**
 * S-Tier 164 — Dream Cross-Pollination
 * ID: S-CJ122 | CJPI: 85 | Module: DREAM
 * Cross-pollination of insights between dream cycles.
 */

export interface DreamInsight {
  id: string;
  cycleId: string;
  domain: string;
  insight: string;
  strength: number;
  crossPollinatedTo: string[];
}

export class DreamCrossPollination {
  private insights: Map<string, DreamInsight> = new Map();

  addInsight(cycleId: string, domain: string, insight: string, strength: number): DreamInsight {
    const di: DreamInsight = {
      id: crypto.randomUUID(), cycleId, domain, insight, strength, crossPollinatedTo: [],
    };
    this.insights.set(di.id, di);
    return di;
  }

  pollinate(insightId: string, targetDomain: string): boolean {
    const insight = this.insights.get(insightId);
    if (!insight || insight.domain === targetDomain) return false;
    insight.crossPollinatedTo.push(targetDomain);
    const newInsight: DreamInsight = {
      id: crypto.randomUUID(), cycleId: insight.cycleId,
      domain: targetDomain, insight: `[Pollinated] ${insight.insight}`,
      strength: insight.strength * 0.7, crossPollinatedTo: [],
    };
    this.insights.set(newInsight.id, newInsight);
    return true;
  }

  findRelated(domain: string): DreamInsight[] {
    return [...this.insights.values()].filter(i => i.domain === domain).sort((a, b) => b.strength - a.strength);
  }

  getPollinationGraph(): { domains: string[]; connections: { from: string; to: string; count: number }[] } {
    const domains = new Set<string>();
    const connMap = new Map<string, number>();
    for (const i of this.insights.values()) {
      domains.add(i.domain);
      for (const t of i.crossPollinatedTo) {
        const key = `${i.domain}→${t}`;
        connMap.set(key, (connMap.get(key) ?? 0) + 1);
      }
    }
    return {
      domains: [...domains],
      connections: [...connMap.entries()].map(([key, count]) => {
        const [from, to] = key.split('→');
        return { from, to, count };
      }),
    };
  }
}
