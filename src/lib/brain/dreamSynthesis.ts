/**
 * CMPSBL® BRAIN — Dream Synthesis Engine
 * Generative recombination of knowledge to discover emergent insights.
 *
 * Inspired by biological REM sleep: takes random memory samples,
 * finds unexpected connections, and generates novel hypotheses.
 *
 * Three synthesis modes:
 * 1. Cross-pollination — combine concepts from different domains
 * 2. Abstraction ladder — generalize/specialize patterns
 * 3. Analogy bridge — find structural similarities across contexts
 */

import { extractKeywords, jaccardSimilarity, tokenizeToSet } from './shared';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DreamInput {
  id: string;
  content: string;
  context: string;
  tier: string;
}

export interface DreamInsight {
  id: string;
  type: 'cross-pollination' | 'abstraction' | 'analogy';
  sourceMemories: string[];   // IDs of source memories
  insight: string;             // generated insight text
  novelty: number;             // 0-1 how novel this combination is
  utility: number;             // 0-1 estimated usefulness
  confidence: number;
  synthesizedAt: number;
  keywords: string[];
}

export interface DreamCycleResult {
  insights: DreamInsight[];
  memoriesSampled: number;
  pairsExplored: number;
  duration: number;
  cycleId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

let cycleCounter = 0;
let insightCounter = 0;

class DreamSynthesisEngine {
  private insights = new Map<string, DreamInsight>();
  private maxInsights = 500;

  /**
   * Run a dream synthesis cycle on a set of memories.
   * Samples random pairs and generates insights from unexpected connections.
   */
  synthesize(memories: DreamInput[], options?: {
    maxPairs?: number;
    minNovelty?: number;
    modes?: Array<'cross-pollination' | 'abstraction' | 'analogy'>;
  }): DreamCycleResult {
    const start = Date.now();
    const maxPairs = options?.maxPairs ?? 50;
    const minNovelty = options?.minNovelty ?? 0.3;
    const modes = options?.modes ?? ['cross-pollination', 'abstraction', 'analogy'];
    const cycleId = `dream-${++cycleCounter}`;
    const newInsights: DreamInsight[] = [];

    if (memories.length < 2) {
      return { insights: [], memoriesSampled: memories.length, pairsExplored: 0, duration: 0, cycleId };
    }

    // Sample random pairs (Fisher-Yates partial shuffle)
    const pairs = this.samplePairs(memories, maxPairs);

    for (const [a, b] of pairs) {
      // Skip if too similar (not interesting) or too different (no connection)
      const similarity = jaccardSimilarity(tokenizeToSet(a.content), tokenizeToSet(b.content));
      if (similarity > 0.7 || similarity < 0.05) continue;

      for (const mode of modes) {
        const insight = this.generateInsight(a, b, mode, similarity);
        if (insight && insight.novelty >= minNovelty) {
          newInsights.push(insight);
          this.insights.set(insight.id, insight);
        }
      }
    }

    this.enforceCapacity();

    return {
      insights: newInsights,
      memoriesSampled: memories.length,
      pairsExplored: pairs.length,
      duration: Date.now() - start,
      cycleId,
    };
  }

  private generateInsight(a: DreamInput, b: DreamInput, mode: DreamInsight['type'], similarity: number): DreamInsight | null {
    const keywordsA = extractKeywords(a.content);
    const keywordsB = extractKeywords(b.content);
    const sharedKeywords = keywordsA.filter(k => keywordsB.includes(k));
    const uniqueA = keywordsA.filter(k => !keywordsB.includes(k)).slice(0, 5);
    const uniqueB = keywordsB.filter(k => !keywordsA.includes(k)).slice(0, 5);

    let insight: string;
    let novelty: number;
    let utility: number;

    switch (mode) {
      case 'cross-pollination': {
        if (a.context === b.context) return null; // Must be different domains
        if (uniqueA.length === 0 || uniqueB.length === 0) return null;
        insight = `Cross-domain pattern: [${a.context}] concepts (${uniqueA.slice(0, 3).join(', ')}) may apply to [${b.context}] context (${uniqueB.slice(0, 3).join(', ')}). Shared axis: ${sharedKeywords.slice(0, 3).join(', ') || 'structural'}`;
        novelty = 1 - similarity; // Less similar = more novel
        utility = sharedKeywords.length > 0 ? 0.6 : 0.3;
        break;
      }

      case 'abstraction': {
        if (sharedKeywords.length < 2) return null;
        const abstractConcept = sharedKeywords.slice(0, 3).join(' + ');
        insight = `Abstraction: "${abstractConcept}" is a recurring pattern across ${a.context} and ${b.context}. May represent a generalizable principle.`;
        novelty = Math.min(1, 0.3 + (1 - similarity) * 0.5);
        utility = Math.min(1, sharedKeywords.length * 0.2);
        break;
      }

      case 'analogy': {
        if (uniqueA.length < 2 || uniqueB.length < 2) return null;
        insight = `Analogy: "${uniqueA[0]}" in [${a.context}] may serve the same role as "${uniqueB[0]}" in [${b.context}]. Structural similarity: ${(similarity * 100).toFixed(0)}%`;
        novelty = Math.min(1, 0.5 + (1 - similarity) * 0.3);
        utility = similarity > 0.2 ? 0.5 : 0.3;
        break;
      }

      default:
        return null;
    }

    return {
      id: `insight-${++insightCounter}`,
      type: mode,
      sourceMemories: [a.id, b.id],
      insight,
      novelty,
      utility,
      confidence: Math.min(1, similarity * 2 + 0.2),
      synthesizedAt: Date.now(),
      keywords: [...new Set([...sharedKeywords, ...uniqueA.slice(0, 2), ...uniqueB.slice(0, 2)])],
    };
  }

  /** Sample random pairs using Fisher-Yates */
  private samplePairs(memories: DreamInput[], maxPairs: number): Array<[DreamInput, DreamInput]> {
    const pairs: Array<[DreamInput, DreamInput]> = [];
    const indices = memories.map((_, i) => i);

    // Shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Take sequential pairs from shuffled array
    for (let i = 0; i < Math.min(indices.length - 1, maxPairs); i += 1) {
      const j = (i + 1) % indices.length;
      pairs.push([memories[indices[i]], memories[indices[j]]]);
    }

    return pairs;
  }

  /** Get top insights by novelty × utility */
  getTopInsights(limit: number = 20): DreamInsight[] {
    return [...this.insights.values()]
      .sort((a, b) => (b.novelty * b.utility) - (a.novelty * a.utility))
      .slice(0, limit);
  }

  /** Get insights by type */
  getByType(type: DreamInsight['type']): DreamInsight[] {
    return [...this.insights.values()].filter(i => i.type === type);
  }

  getStats() {
    const all = [...this.insights.values()];
    return {
      totalInsights: all.length,
      byType: {
        'cross-pollination': all.filter(i => i.type === 'cross-pollination').length,
        abstraction: all.filter(i => i.type === 'abstraction').length,
        analogy: all.filter(i => i.type === 'analogy').length,
      },
      avgNovelty: all.length > 0 ? all.reduce((s, i) => s + i.novelty, 0) / all.length : 0,
      avgUtility: all.length > 0 ? all.reduce((s, i) => s + i.utility, 0) / all.length : 0,
      totalCycles: cycleCounter,
    };
  }

  private enforceCapacity(): void {
    if (this.insights.size <= this.maxInsights) return;
    const sorted = [...this.insights.entries()]
      .sort((a, b) => (a[1].novelty * a[1].utility) - (b[1].novelty * b[1].utility));
    const excess = this.insights.size - this.maxInsights;
    for (let i = 0; i < excess; i++) this.insights.delete(sorted[i][0]);
  }

  clear(): void {
    this.insights.clear();
    cycleCounter = 0;
    insightCounter = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: DreamSynthesisEngine | null = null;

export function getDreamSynthesisEngine(): DreamSynthesisEngine {
  if (!_engine) _engine = new DreamSynthesisEngine();
  return _engine;
}

export function resetDreamSynthesis(): void {
  _engine = null;
}
