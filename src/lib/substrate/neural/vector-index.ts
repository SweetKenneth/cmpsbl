/**
 * BRAIN Neural Substrate Layer — Vector Similarity Index (Neural Recall)
 * In-memory HNSW-like nearest neighbor search for semantic memory retrieval
 * 
 * Replaces tag-based memory lookup with vector similarity search.
 * Falls back to tag-based lookup when index is empty or unavailable.
 */

import { supabase } from '@/integrations/supabase/client';
import { embeddingEngine, EMBEDDING_DIM } from './embedding-engine';

export interface NeuralRecallResult {
  artifact_id: string;
  artifact_type: 'crystal' | 'trace' | 'heuristic' | 'memory_hot' | 'memory_warm';
  similarity: number;
  content: string;
  metadata: Record<string, any>;
}

interface VectorEntry {
  artifact_id: string;
  artifact_type: string;
  vector: Float32Array;
  content: string;
}

interface VectorIndexState {
  loaded: boolean;
  entryCount: number;
  lastRefreshedAt: string | null;
  queryCount: number;
  avgQueryTimeMs: number;
}

const MAX_INDEX_SIZE = 10000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * In-memory vector similarity index
 * Uses brute-force cosine similarity (efficient up to ~10k vectors)
 * For larger indices, swap to HNSW via hnswlib-wasm
 */
class VectorSimilarityIndex {
  private entries: VectorEntry[] = [];
  private state: VectorIndexState = {
    loaded: false,
    entryCount: 0,
    lastRefreshedAt: null,
    queryCount: 0,
    avgQueryTimeMs: 0,
  };
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private loadingPromise: Promise<number> | null = null;

  /**
   * Load vectors from database into memory (deduplicated)
   */
  async load(): Promise<number> {
    // Prevent duplicate concurrent loads
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = this._doLoad();
    try { return await this.loadingPromise; } finally { this.loadingPromise = null; }
    try {
      const { data, error } = await supabase
        .from('brain_embeddings')
        .select('artifact_id, artifact_type, embedding, artifact_content')
        .order('created_at', { ascending: false })
        .limit(MAX_INDEX_SIZE);

      if (error || !data) {
        console.warn('[Neural] Failed to load vector index:', error?.message);
        return 0;
      }

      this.entries = data
        .filter(d => d.embedding)
        .map(d => ({
          artifact_id: d.artifact_id,
          artifact_type: d.artifact_type,
          vector: new Float32Array(d.embedding as any),
          content: d.artifact_content,
        }));

      this.state.loaded = true;
      this.state.entryCount = this.entries.length;
      this.state.lastRefreshedAt = new Date().toISOString();

      // Auto-refresh periodically
      if (!this.refreshTimer) {
        this.refreshTimer = setInterval(() => this.load(), REFRESH_INTERVAL_MS);
      }

      console.log(`[Neural] Vector index loaded: ${this.entries.length} entries`);
      return this.entries.length;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.warn('[Neural] Vector index load error:', message);
      return 0;
    }
  }

  /**
   * Add a single entry to the index (without full reload)
   */
  addEntry(entry: VectorEntry): void {
    if (this.entries.length >= MAX_INDEX_SIZE) {
      // Evict oldest entry
      this.entries.shift();
    }
    this.entries.push(entry);
    this.state.entryCount = this.entries.length;
  }

  /**
   * Semantic nearest-neighbor search
   * Returns top-k most similar artifacts to the query text
   */
  async search(query: string, topK: number = 10, minSimilarity: number = 0.3): Promise<NeuralRecallResult[]> {
    if (!this.state.loaded || this.entries.length === 0) {
      return [];
    }

    const startTime = performance.now();
    const queryVector = embeddingEngine.encode(query);

    // Compute similarities
    const scored = this.entries.map(entry => ({
      ...entry,
      similarity: embeddingEngine.cosineSimilarity(queryVector, entry.vector),
    }));

    // Sort by similarity descending, filter by threshold
    const results = scored
      .filter(s => s.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(s => ({
        artifact_id: s.artifact_id,
        artifact_type: s.artifact_type as NeuralRecallResult['artifact_type'],
        similarity: s.similarity,
        content: s.content,
        metadata: {},
      }));

    // Track query performance
    const elapsed = performance.now() - startTime;
    this.state.queryCount++;
    this.state.avgQueryTimeMs = (
      (this.state.avgQueryTimeMs * (this.state.queryCount - 1)) + elapsed
    ) / this.state.queryCount;

    return results;
  }

  /**
   * Neural Recall — primary API for NEXUS prompt augmentation
   * Searches for semantically similar artifacts and returns ranked context
   */
  async neuralRecall(query: string, topK: number = 5): Promise<NeuralRecallResult[]> {
    // Try in-memory index first
    let results = await this.search(query, topK);

    // If in-memory index is empty, try database-side vector search
    if (results.length === 0) {
      try {
        const queryVector = embeddingEngine.encode(query);
        const { data } = await supabase.rpc('vector_memory_search', {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_agent_id: 'neural_substrate',
          p_query_embedding: Array.from(queryVector) as any,
          p_limit: topK,
          p_min_similarity: 0.3,
        });

        if (data && data.length > 0) {
          results = data.map((d: any) => ({
            artifact_id: d.id,
            artifact_type: 'memory_hot' as const,
            similarity: d.similarity,
            content: d.content,
            metadata: { tier: d.tier, memory_type: d.memory_type },
          }));
        }
      } catch {
        // Silent fallback — vector search RPC may not exist yet
      }
    }

    return results;
  }

  getState(): VectorIndexState {
    return { ...this.state };
  }

  destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.entries = [];
    this.state.loaded = false;
    this.state.entryCount = 0;
  }
}

export const vectorIndex = new VectorSimilarityIndex();
export type { VectorIndexState };
