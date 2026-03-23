/**
 * CMPSBL® BRAIN — BM25 Ranking Engine
 * Okapi BM25 implementation for information retrieval with term frequency
 * saturation and inverse document frequency weighting.
 *
 * Replaces naive word-match with probabilistic relevance scoring.
 * Zero external dependencies. O(n·k) where n=docs, k=query terms.
 */

import { tokenize, STOP_WORDS } from './shared';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BM25Document {
  id: string;
  content: string;
  tier?: string;
  metadata?: Record<string, unknown>;
}

export interface BM25Result {
  id: string;
  score: number;
  matchedTerms: string[];
  termScores: Record<string, number>;
}

export interface BM25Config {
  /** Term frequency saturation parameter (default 1.5) */
  k1: number;
  /** Document length normalization (default 0.75) */
  b: number;
  /** Minimum score threshold */
  minScore: number;
}

const DEFAULT_CONFIG: BM25Config = { k1: 1.5, b: 0.75, minScore: 0.01 };

// ═══════════════════════════════════════════════════════════════════════════════
// INDEX
// ═══════════════════════════════════════════════════════════════════════════════

interface IndexedDoc {
  id: string;
  termFreqs: Map<string, number>;
  length: number;
  metadata?: Record<string, unknown>;
}

export class BM25Index {
  private docs: IndexedDoc[] = [];
  private docFreqs = new Map<string, number>(); // term → number of docs containing it
  private avgDocLength = 0;
  private config: BM25Config;

  constructor(config?: Partial<BM25Config>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Number of indexed documents */
  get size(): number { return this.docs.length; }

  /**
   * Index a batch of documents. Clears previous index.
   * O(n·L) where L = average doc length in tokens.
   */
  indexDocuments(documents: BM25Document[]): void {
    this.docs = [];
    this.docFreqs.clear();

    let totalLength = 0;

    for (const doc of documents) {
      const tokens = tokenize(doc.content).filter(t => !STOP_WORDS.has(t));
      const termFreqs = new Map<string, number>();

      for (const token of tokens) {
        termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
      }

      // Update document frequencies
      for (const term of termFreqs.keys()) {
        this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
      }

      totalLength += tokens.length;
      this.docs.push({
        id: doc.id,
        termFreqs,
        length: tokens.length,
        metadata: doc.metadata,
      });
    }

    this.avgDocLength = this.docs.length > 0 ? totalLength / this.docs.length : 0;
  }

  /**
   * Add a single document to the index without reindexing.
   */
  addDocument(doc: BM25Document): void {
    const tokens = tokenize(doc.content).filter(t => !STOP_WORDS.has(t));
    const termFreqs = new Map<string, number>();

    for (const token of tokens) {
      termFreqs.set(token, (termFreqs.get(token) || 0) + 1);
    }

    for (const term of termFreqs.keys()) {
      this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
    }

    const prevTotal = this.avgDocLength * this.docs.length;
    this.docs.push({ id: doc.id, termFreqs, length: tokens.length, metadata: doc.metadata });
    this.avgDocLength = (prevTotal + tokens.length) / this.docs.length;
  }

  /**
   * Search the index with a query string.
   * Returns results sorted by BM25 score descending.
   */
  search(query: string, limit: number = 20): BM25Result[] {
    const queryTerms = tokenize(query).filter(t => !STOP_WORDS.has(t));
    if (queryTerms.length === 0 || this.docs.length === 0) return [];

    const { k1, b, minScore } = this.config;
    const N = this.docs.length;
    const results: BM25Result[] = [];

    // Pre-compute IDF for query terms
    const idfMap = new Map<string, number>();
    for (const term of queryTerms) {
      const df = this.docFreqs.get(term) || 0;
      // IDF with smoothing: log((N - df + 0.5) / (df + 0.5) + 1)
      const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
      idfMap.set(term, idf);
    }

    for (const doc of this.docs) {
      let score = 0;
      const matchedTerms: string[] = [];
      const termScores: Record<string, number> = {};

      for (const term of queryTerms) {
        const tf = doc.termFreqs.get(term) || 0;
        if (tf === 0) continue;

        const idf = idfMap.get(term)!;
        // BM25 scoring: IDF * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl/avgdl))
        const numerator = tf * (k1 + 1);
        const denominator = tf + k1 * (1 - b + b * (doc.length / this.avgDocLength));
        const termScore = idf * (numerator / denominator);

        score += termScore;
        matchedTerms.push(term);
        termScores[term] = termScore;
      }

      if (score >= minScore) {
        results.push({ id: doc.id, score, matchedTerms, termScores });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Get IDF values for terms — useful for diagnostics.
   */
  getTermStats(): Map<string, { df: number; idf: number }> {
    const stats = new Map<string, { df: number; idf: number }>();
    const N = this.docs.length;
    for (const [term, df] of this.docFreqs) {
      stats.set(term, {
        df,
        idf: Math.log((N - df + 0.5) / (df + 0.5) + 1),
      });
    }
    return stats;
  }

  /** Clear the entire index */
  clear(): void {
    this.docs = [];
    this.docFreqs.clear();
    this.avgDocLength = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON — Shared brain-wide BM25 index
// ═══════════════════════════════════════════════════════════════════════════════

let _brainIndex: BM25Index | null = null;

export function getBrainBM25Index(): BM25Index {
  if (!_brainIndex) _brainIndex = new BM25Index();
  return _brainIndex;
}

export function resetBrainBM25Index(): void {
  _brainIndex = null;
}
