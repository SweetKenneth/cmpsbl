/**
 * S-Tier 141 — Recursive Knowledge Crystallization
 * ID: S-CJ99 | CJPI: 86 | Module: MEMORY
 * 
 * Crystallizes transient knowledge into permanent structured storage.
 */

export interface TransientKnowledge {
  id: string;
  content: string;
  domain: string;
  confidence: number;
  accessCount: number;
  lastAccessed: string;
  createdAt: string;
}

export interface CrystallizedKnowledge {
  id: string;
  sourceIds: string[];
  summary: string;
  domain: string;
  confidence: number;
  crystallizedAt: string;
  version: number;
}

export class RecursiveKnowledgeCrystallizer {
  private transient: Map<string, TransientKnowledge> = new Map();
  private crystallized: Map<string, CrystallizedKnowledge> = new Map();
  private crystallizationThreshold = 5; // min access count

  addTransient(knowledge: TransientKnowledge): void {
    this.transient.set(knowledge.id, knowledge);
  }

  access(id: string): void {
    const k = this.transient.get(id);
    if (k) {
      k.accessCount++;
      k.lastAccessed = new Date().toISOString();
    }
  }

  crystallize(): CrystallizedKnowledge[] {
    const candidates = [...this.transient.values()]
      .filter(k => k.accessCount >= this.crystallizationThreshold && k.confidence >= 0.7);

    // Group by domain
    const byDomain = new Map<string, TransientKnowledge[]>();
    for (const k of candidates) {
      const group = byDomain.get(k.domain) || [];
      group.push(k);
      byDomain.set(k.domain, group);
    }

    const results: CrystallizedKnowledge[] = [];
    for (const [domain, items] of byDomain) {
      const existing = [...this.crystallized.values()].find(c => c.domain === domain);
      const crystal: CrystallizedKnowledge = {
        id: existing?.id || crypto.randomUUID(),
        sourceIds: items.map(i => i.id),
        summary: items.map(i => i.content).join('; '),
        domain,
        confidence: items.reduce((s, i) => s + i.confidence, 0) / items.length,
        crystallizedAt: new Date().toISOString(),
        version: (existing?.version || 0) + 1,
      };
      this.crystallized.set(crystal.id, crystal);
      results.push(crystal);

      // Remove from transient
      for (const item of items) this.transient.delete(item.id);
    }

    return results;
  }

  getCrystallized(): CrystallizedKnowledge[] { return [...this.crystallized.values()]; }
  getTransientCount(): number { return this.transient.size; }
}
