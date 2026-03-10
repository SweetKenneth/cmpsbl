/**
 * S-Tier 094 — Embedding Similarity Engine
 * ID: S-85 | CJPI: 90 | Module: BRAIN
 * 
 * High-performance similarity search across embedding spaces.
 */

export interface EmbeddingVector {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
  namespace?: string;
}

export interface SimilarityResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export class EmbeddingSimilarityEngine {
  private store: Map<string, EmbeddingVector> = new Map();
  private namespaceIndex: Map<string, Set<string>> = new Map();

  insert(embedding: EmbeddingVector): void {
    this.store.set(embedding.id, embedding);
    const ns = embedding.namespace || 'default';
    if (!this.namespaceIndex.has(ns)) this.namespaceIndex.set(ns, new Set());
    this.namespaceIndex.get(ns)!.add(embedding.id);
  }

  remove(id: string): boolean {
    const emb = this.store.get(id);
    if (!emb) return false;
    this.store.delete(id);
    const ns = emb.namespace || 'default';
    this.namespaceIndex.get(ns)?.delete(id);
    return true;
  }

  search(
    query: number[],
    opts: { topK?: number; namespace?: string; threshold?: number } = {}
  ): SimilarityResult[] {
    const { topK = 10, namespace, threshold = 0 } = opts;
    
    let candidates: EmbeddingVector[];
    if (namespace && this.namespaceIndex.has(namespace)) {
      const ids = this.namespaceIndex.get(namespace)!;
      candidates = [...ids].map(id => this.store.get(id)!).filter(Boolean);
    } else {
      candidates = [...this.store.values()];
    }

    const results: SimilarityResult[] = candidates
      .map(emb => ({
        id: emb.id,
        score: cosineSimilarity(query, emb.vector),
        metadata: emb.metadata,
      }))
      .filter(r => r.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  cluster(k: number, namespace?: string): Map<number, string[]> {
    // Simple k-means initialization
    let candidates: EmbeddingVector[];
    if (namespace && this.namespaceIndex.has(namespace)) {
      candidates = [...this.namespaceIndex.get(namespace)!]
        .map(id => this.store.get(id)!).filter(Boolean);
    } else {
      candidates = [...this.store.values()];
    }

    if (candidates.length === 0) return new Map();

    const dim = candidates[0].vector.length;
    // Random centroid init
    const centroids: number[][] = [];
    for (let i = 0; i < Math.min(k, candidates.length); i++) {
      centroids.push([...candidates[i].vector]);
    }

    const assignments = new Map<number, string[]>();
    for (let i = 0; i < k; i++) assignments.set(i, []);

    // Single iteration for fast clustering
    for (const emb of candidates) {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const dist = euclideanDistance(emb.vector, centroids[c]);
        if (dist < bestDist) { bestDist = dist; bestCluster = c; }
      }
      assignments.get(bestCluster)!.push(emb.id);
    }

    return assignments;
  }

  get size(): number { return this.store.size; }
}
