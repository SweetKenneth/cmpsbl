/**
 * S-Tier 073 — Embedding Store
 * CJPI: 92 | Node: BRAIN | ID: S-134
 *
 * In-memory vector embedding store with cosine similarity search.
 * Used by BRAIN for semantic retrieval and knowledge clustering.
 */

export interface EmbeddingEntry {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
  storedAt: number;
}

export interface SimilarityResult {
  entry: EmbeddingEntry;
  score: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
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

export class EmbeddingStore {
  private entries: EmbeddingEntry[] = [];

  add(id: string, vector: number[], metadata: Record<string, unknown> = {}): void {
    this.entries.push({ id, vector, metadata, storedAt: Date.now() });
  }

  search(query: number[], topK = 5, minScore = 0): SimilarityResult[] {
    return this.entries
      .map(entry => ({ entry, score: cosineSimilarity(query, entry.vector) }))
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  get(id: string): EmbeddingEntry | null {
    return this.entries.find(e => e.id === id) ?? null;
  }

  remove(id: string): boolean {
    const idx = this.entries.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.entries.splice(idx, 1);
    return true;
  }

  size(): number { return this.entries.length; }
  clear(): void { this.entries = []; }
}

export const globalEmbeddingStore = new EmbeddingStore();
