/**
 * CMPSBL® BRAIN — Predictive Pre-Fetch Engine
 * Anticipates which memories will be needed based on:
 * 1. Hebbian pathway predictions
 * 2. Context-based access patterns
 * 3. Temporal access sequences
 *
 * Pre-loads anticipated memories into a fast cache layer.
 */

import { getHebbianEngine } from './hebbianPathways';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PrefetchCandidate {
  memoryId: string;
  confidence: number;     // 0-1 probability of access
  source: 'hebbian' | 'temporal' | 'contextual';
  prefetchedAt?: number;
}

export interface PrefetchStats {
  cacheSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  totalPrefetches: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_CACHE = 50;
const MIN_CONFIDENCE = 0.15;

class PrefetchEngine {
  private cache = new Map<string, PrefetchCandidate>();
  private contextPatterns = new Map<string, string[]>(); // context → recent memory IDs
  private sequenceBuffer: string[] = [];                  // temporal access sequence
  private hits = 0;
  private misses = 0;
  private totalPrefetches = 0;

  /**
   * Signal that a memory was accessed. Updates patterns + triggers prefetch.
   */
  onMemoryAccess(memoryId: string, context: string = 'default'): PrefetchCandidate[] {
    // Check cache hit
    if (this.cache.has(memoryId)) {
      this.hits++;
      this.cache.delete(memoryId);
    } else {
      this.misses++;
    }

    // Update temporal sequence
    this.sequenceBuffer.push(memoryId);
    if (this.sequenceBuffer.length > 50) this.sequenceBuffer = this.sequenceBuffer.slice(-30);

    // Update context patterns
    const ctxList = this.contextPatterns.get(context) || [];
    ctxList.push(memoryId);
    if (ctxList.length > 20) ctxList.splice(0, ctxList.length - 15);
    this.contextPatterns.set(context, ctxList);

    // Generate predictions
    return this.generatePredictions(memoryId, context);
  }

  /**
   * Generate prefetch candidates from multiple prediction sources.
   */
  private generatePredictions(currentMemoryId: string, context: string): PrefetchCandidate[] {
    const candidates = new Map<string, PrefetchCandidate>();

    // Source 1: Hebbian pathway predictions
    const hebbianPreds = getHebbianEngine().predictNext(currentMemoryId, 10);
    for (const pred of hebbianPreds) {
      if (pred.probability >= MIN_CONFIDENCE) {
        candidates.set(pred.memoryId, {
          memoryId: pred.memoryId,
          confidence: pred.probability,
          source: 'hebbian',
        });
      }
    }

    // Source 2: Temporal sequence — bigram prediction
    const seqLen = this.sequenceBuffer.length;
    if (seqLen >= 2) {
      const bigramCounts = new Map<string, number>();
      for (let i = 0; i < seqLen - 1; i++) {
        if (this.sequenceBuffer[i] === currentMemoryId) {
          const next = this.sequenceBuffer[i + 1];
          bigramCounts.set(next, (bigramCounts.get(next) || 0) + 1);
        }
      }
      const totalBigrams = [...bigramCounts.values()].reduce((a, b) => a + b, 0);
      for (const [nextId, count] of bigramCounts) {
        const confidence = count / totalBigrams;
        if (confidence >= MIN_CONFIDENCE) {
          const existing = candidates.get(nextId);
          if (!existing || existing.confidence < confidence) {
            candidates.set(nextId, { memoryId: nextId, confidence, source: 'temporal' });
          }
        }
      }
    }

    // Source 3: Context co-occurrence
    const ctxMemories = this.contextPatterns.get(context) || [];
    const ctxCounts = new Map<string, number>();
    for (const id of ctxMemories) {
      if (id !== currentMemoryId) {
        ctxCounts.set(id, (ctxCounts.get(id) || 0) + 1);
      }
    }
    for (const [id, count] of ctxCounts) {
      const confidence = Math.min(1, count / 5);
      if (confidence >= MIN_CONFIDENCE) {
        const existing = candidates.get(id);
        if (!existing || existing.confidence < confidence) {
          candidates.set(id, { memoryId: id, confidence, source: 'contextual' });
        }
      }
    }

    // Update cache with top candidates
    const sorted = [...candidates.values()].sort((a, b) => b.confidence - a.confidence);
    const toPrefetch = sorted.slice(0, MAX_CACHE);

    for (const candidate of toPrefetch) {
      candidate.prefetchedAt = Date.now();
      this.cache.set(candidate.memoryId, candidate);
      this.totalPrefetches++;
    }

    // Enforce cache capacity
    if (this.cache.size > MAX_CACHE) {
      const entries = [...this.cache.entries()].sort((a, b) => a[1].confidence - b[1].confidence);
      const excess = this.cache.size - MAX_CACHE;
      for (let i = 0; i < excess; i++) this.cache.delete(entries[i][0]);
    }

    return toPrefetch;
  }

  /**
   * Check if a memory is pre-fetched (cache hit prediction).
   */
  isPrefetched(memoryId: string): boolean {
    return this.cache.has(memoryId);
  }

  /** Get current prefetch candidates */
  getCandidates(): PrefetchCandidate[] {
    return [...this.cache.values()].sort((a, b) => b.confidence - a.confidence);
  }

  getStats(): PrefetchStats {
    const total = this.hits + this.misses;
    return {
      cacheSize: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      totalPrefetches: this.totalPrefetches,
    };
  }

  clear(): void {
    this.cache.clear();
    this.contextPatterns.clear();
    this.sequenceBuffer = [];
    this.hits = 0;
    this.misses = 0;
    this.totalPrefetches = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: PrefetchEngine | null = null;

export function getPrefetchEngine(): PrefetchEngine {
  if (!_engine) _engine = new PrefetchEngine();
  return _engine;
}

export function resetPrefetchEngine(): void {
  _engine = null;
}
