/**
 * BRAIN Module Enhancements — SPARTA Epoch
 * AttentionMechanism, MemoryConsolidator, SemanticIndexer, EmotionalResonance
 */

import { calculateSalience, type SalienceInput, type SalienceResult } from '@/lib/substrate/memory-core';

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENTION MECHANISM — Dynamic focus allocation (Miller's Law: 7±2)
// ═══════════════════════════════════════════════════════════════════════════════

interface AttentionSignal {
  memoryId: string;
  weight: number;
  timestamp: number;
  source: 'explicit' | 'implicit' | 'anticipatory';
}

interface AttentionState {
  focusedMemories: string[];
  weights: Map<string, number>;
  contextWindow: number; // Max concurrent focus items
  lastUpdate: number;
}

export class AttentionMechanism {
  private state: AttentionState = {
    focusedMemories: [],
    weights: new Map(),
    contextWindow: 7, // Miller's Law
    lastUpdate: Date.now(),
  };

  /** Focus attention on a memory with optional weight */
  focus(memoryId: string, weight: number = 1.0): AttentionSignal {
    // Evict oldest if at capacity
    if (this.state.focusedMemories.length >= this.state.contextWindow) {
      const evicted = this.state.focusedMemories.shift();
      if (evicted) this.state.weights.delete(evicted);
    }

    this.state.focusedMemories.push(memoryId);
    this.state.weights.set(memoryId, weight);
    this.state.lastUpdate = Date.now();

    return {
      memoryId,
      weight,
      timestamp: Date.now(),
      source: 'explicit',
    };
  }

  /** Remove focus from a memory */
  blur(memoryId: string): void {
    const idx = this.state.focusedMemories.indexOf(memoryId);
    if (idx > -1) {
      this.state.focusedMemories.splice(idx, 1);
      this.state.weights.delete(memoryId);
    }
  }

  /** Get current focus state */
  getFocus(): string[] {
    return [...this.state.focusedMemories];
  }

  /** Anticipatory preload based on patterns */
  anticipate(patterns: string[]): AttentionSignal[] {
    return patterns.slice(0, 3).map(pattern => ({
      memoryId: pattern,
      weight: 0.5,
      timestamp: Date.now(),
      source: 'anticipatory' as const,
    }));
  }

  calculateSalienceScore(memoryId: string, recency: number, frequency: number, extra?: Partial<SalienceInput>): SalienceResult {
    const focusWeight = this.state.weights.get(memoryId) || 0;
    return calculateSalience({
      confidence: extra?.confidence ?? 0.5,
      access_count: frequency,
      created_at: new Date(Date.now() - recency).toISOString(),
      memory_type: extra?.memory_type ?? 'general',
      attention_weight: focusWeight,
      reinforcement_count: extra?.reinforcement_count,
      cross_module_refs: extra?.cross_module_refs,
      query_context: extra?.query_context,
      content: extra?.content,
    });
  }

  /** @deprecated Use calculateSalienceScore() — kept for backward compat */
  calculateSalience(memoryId: string, recency: number, frequency: number): number {
    return this.calculateSalienceScore(memoryId, recency, frequency).score;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY CONSOLIDATOR — Tiered storage with automatic promotion/demotion
// ═══════════════════════════════════════════════════════════════════════════════

type MemoryTier = 'hot' | 'warm' | 'cold' | 'archive';

interface ConsolidationRule {
  fromTier: MemoryTier;
  toTier: MemoryTier;
  condition: (age: number, accessCount: number) => boolean;
}

interface ConsolidationResult {
  promoted: string[];
  demoted: string[];
  archived: string[];
  timestamp: number;
}

export class MemoryConsolidator {
  private rules: ConsolidationRule[] = [
    {
      fromTier: 'hot',
      toTier: 'warm',
      condition: (age, accessCount) => age > 3600000 && accessCount < 5, // 1h, <5 accesses
    },
    {
      fromTier: 'warm',
      toTier: 'cold',
      condition: (age, accessCount) => age > 86400000 && accessCount < 2, // 24h, <2 accesses
    },
    {
      fromTier: 'cold',
      toTier: 'archive',
      condition: (age) => age > 604800000, // 7 days
    },
    {
      fromTier: 'warm',
      toTier: 'hot',
      condition: (_, accessCount) => accessCount > 10, // Promote if heavily accessed
    },
  ];

  /** Run consolidation cycle on memory set */
  consolidate(memories: Array<{ id: string; tier: MemoryTier; age: number; accessCount: number }>): ConsolidationResult {
    const result: ConsolidationResult = {
      promoted: [],
      demoted: [],
      archived: [],
      timestamp: Date.now(),
    };

    for (const memory of memories) {
      for (const rule of this.rules) {
        if (memory.tier === rule.fromTier && rule.condition(memory.age, memory.accessCount)) {
          if (this.getTierPriority(rule.toTier) > this.getTierPriority(rule.fromTier)) {
            result.promoted.push(memory.id);
          } else if (rule.toTier === 'archive') {
            result.archived.push(memory.id);
          } else {
            result.demoted.push(memory.id);
          }
          break;
        }
      }
    }

    return result;
  }

  private getTierPriority(tier: MemoryTier): number {
    const priorities: Record<MemoryTier, number> = { hot: 4, warm: 3, cold: 2, archive: 1 };
    return priorities[tier];
  }

  /** Calculate optimal tier for new memory */
  calculateInitialTier(importance: number, isUserGenerated: boolean): MemoryTier {
    if (isUserGenerated || importance > 0.8) return 'hot';
    if (importance > 0.5) return 'warm';
    return 'cold';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC INDEXER — Vector-based similarity clustering
// ═══════════════════════════════════════════════════════════════════════════════

interface SemanticCluster {
  id: string;
  centroid: number[];
  members: string[];
  coherence: number;
}

interface IndexResult {
  clusterId: string;
  similarity: number;
  neighbors: string[];
}

export class SemanticIndexer {
  private clusters: Map<string, SemanticCluster> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  /** Index a memory with its embedding vector */
  index(memoryId: string, embedding: number[]): IndexResult {
    this.embeddings.set(memoryId, embedding);
    
    // Find best matching cluster
    let bestCluster: SemanticCluster | null = null;
    let bestSimilarity = 0;

    for (const cluster of this.clusters.values()) {
      const similarity = this.cosineSimilarity(embedding, cluster.centroid);
      if (similarity > bestSimilarity && similarity > 0.7) {
        bestSimilarity = similarity;
        bestCluster = cluster;
      }
    }

    if (bestCluster) {
      bestCluster.members.push(memoryId);
      this.updateCentroid(bestCluster);
      return {
        clusterId: bestCluster.id,
        similarity: bestSimilarity,
        neighbors: bestCluster.members.filter(m => m !== memoryId).slice(0, 5),
      };
    }

    // Create new cluster
    const newCluster: SemanticCluster = {
      id: `cluster_${Date.now()}`,
      centroid: embedding,
      members: [memoryId],
      coherence: 1.0,
    };
    this.clusters.set(newCluster.id, newCluster);

    return {
      clusterId: newCluster.id,
      similarity: 1.0,
      neighbors: [],
    };
  }

  /** Find semantically similar memories */
  findSimilar(embedding: number[], topK: number = 5): Array<{ id: string; similarity: number }> {
    const results: Array<{ id: string; similarity: number }> = [];

    for (const [id, vec] of this.embeddings.entries()) {
      const similarity = this.cosineSimilarity(embedding, vec);
      results.push({ id, similarity });
    }

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private updateCentroid(cluster: SemanticCluster): void {
    if (cluster.members.length === 0) return;
    
    const vectors = cluster.members
      .map(id => this.embeddings.get(id))
      .filter((v): v is number[] => v !== undefined);
    
    if (vectors.length === 0) return;
    
    const centroid = vectors[0].map((_, i) => 
      vectors.reduce((sum, v) => sum + v[i], 0) / vectors.length
    );
    cluster.centroid = centroid;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMOTIONAL RESONANCE — Affect-aware memory weighting
// ═══════════════════════════════════════════════════════════════════════════════

type EmotionDimension = 'valence' | 'arousal' | 'dominance';

interface EmotionalProfile {
  valence: number;   // -1 (negative) to +1 (positive)
  arousal: number;   // 0 (calm) to 1 (excited)
  dominance: number; // 0 (submissive) to 1 (dominant)
}

interface ResonanceResult {
  memoryId: string;
  resonanceScore: number;
  emotionalDistance: number;
  amplificationFactor: number;
}

export class EmotionalResonance {
  private emotionalHistory: EmotionalProfile[] = [];
  private memoryEmotions: Map<string, EmotionalProfile> = new Map();

  /** Tag memory with emotional profile */
  tagEmotion(memoryId: string, profile: EmotionalProfile): void {
    this.memoryEmotions.set(memoryId, profile);
  }

  /** Calculate resonance between current state and memory */
  calculateResonance(memoryId: string, currentState: EmotionalProfile): ResonanceResult {
    const memoryEmotion = this.memoryEmotions.get(memoryId);
    
    if (!memoryEmotion) {
      return {
        memoryId,
        resonanceScore: 0.5, // Neutral
        emotionalDistance: 0,
        amplificationFactor: 1.0,
      };
    }

    const distance = this.euclideanDistance(currentState, memoryEmotion);
    const resonance = 1 - (distance / Math.sqrt(3)); // Normalize to 0-1

    // High-arousal memories get amplified
    const amplification = 1 + (memoryEmotion.arousal * 0.5);

    return {
      memoryId,
      resonanceScore: resonance,
      emotionalDistance: distance,
      amplificationFactor: amplification,
    };
  }

  /** Get mood-congruent memories */
  getMoodCongruent(currentState: EmotionalProfile, topK: number = 5): ResonanceResult[] {
    const results: ResonanceResult[] = [];

    for (const memoryId of this.memoryEmotions.keys()) {
      results.push(this.calculateResonance(memoryId, currentState));
    }

    return results
      .sort((a, b) => b.resonanceScore - a.resonanceScore)
      .slice(0, topK);
  }

  /** Track emotional state over time */
  recordState(profile: EmotionalProfile): void {
    this.emotionalHistory.push(profile);
    if (this.emotionalHistory.length > 100) {
      this.emotionalHistory.shift();
    }
  }

  /** Get emotional baseline from history */
  getBaseline(): EmotionalProfile {
    if (this.emotionalHistory.length === 0) {
      return { valence: 0, arousal: 0.5, dominance: 0.5 };
    }

    const sum = this.emotionalHistory.reduce(
      (acc, p) => ({
        valence: acc.valence + p.valence,
        arousal: acc.arousal + p.arousal,
        dominance: acc.dominance + p.dominance,
      }),
      { valence: 0, arousal: 0, dominance: 0 }
    );

    const len = this.emotionalHistory.length;
    return {
      valence: sum.valence / len,
      arousal: sum.arousal / len,
      dominance: sum.dominance / len,
    };
  }

  private euclideanDistance(a: EmotionalProfile, b: EmotionalProfile): number {
    return Math.sqrt(
      Math.pow(a.valence - b.valence, 2) +
      Math.pow(a.arousal - b.arousal, 2) +
      Math.pow(a.dominance - b.dominance, 2)
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const brainEnhancements = {
  AttentionMechanism,
  MemoryConsolidator,
  SemanticIndexer,
  EmotionalResonance,
};

export type {
  AttentionSignal,
  AttentionState,
  MemoryTier,
  ConsolidationResult,
  SemanticCluster,
  IndexResult,
  EmotionalProfile,
  ResonanceResult,
};
