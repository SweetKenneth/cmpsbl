/**
 * CMPSBL® MEMORY — Cross-Tier Semantic Index
 * Unified lightweight index spanning all tiers for O(1) existence checks
 * and O(log n) similarity lookups without querying each tier separately.
 *
 * Stores only: memoryId, contentHash, tier, topKeywords
 * Enables: "Does this memory exist anywhere?" in constant time.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface IndexEntry {
  memoryId: string;
  contentHash: number;
  tier: 'hot' | 'warm' | 'cold' | 'glacier';
  keywords: string[];     // top 5 keywords for fast matching
  addedAt: number;
}

export interface CrossTierSearchResult {
  memoryId: string;
  tier: string;
  matchScore: number;
  keywords: string[];
}

export interface CrossTierStats {
  totalIndexed: number;
  byTier: Record<string, number>;
  hashCollisions: number;
  avgKeywordsPerEntry: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FNV-1a HASH (same as content-dedup for consistency)
// ═══════════════════════════════════════════════════════════════════════════════

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) | 0;
  }
  return hash >>> 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_INDEX_SIZE = 30000; // Covers hot(500) + warm(10k) + cold(10k) + glacier headroom

class CrossTierIndex {
  private byId = new Map<string, IndexEntry>();
  private byHash = new Map<number, string[]>(); // hash → memoryIds
  private byKeyword = new Map<string, Set<string>>(); // keyword → memoryIds
  private tierCounts: Record<string, number> = { hot: 0, warm: 0, cold: 0, glacier: 0 };

  /**
   * Add a memory to the cross-tier index.
   * O(k) where k = number of keywords.
   */
  add(memoryId: string, content: string, tier: IndexEntry['tier']): void {
    // Remove existing entry if updating
    if (this.byId.has(memoryId)) this.remove(memoryId);

    const contentHash = fnv1a(content.toLowerCase().replace(/\s+/g, ' ').trim());
    const keywords = this.extractTopKeywords(content, 5);

    const entry: IndexEntry = { memoryId, contentHash, tier, keywords, addedAt: Date.now() };
    this.byId.set(memoryId, entry);

    // Hash index
    if (!this.byHash.has(contentHash)) this.byHash.set(contentHash, []);
    this.byHash.get(contentHash)!.push(memoryId);

    // Keyword index
    for (const kw of keywords) {
      if (!this.byKeyword.has(kw)) this.byKeyword.set(kw, new Set());
      this.byKeyword.get(kw)!.add(memoryId);
    }

    this.tierCounts[tier] = (this.tierCounts[tier] || 0) + 1;
    this.enforceCapacity();
  }

  /**
   * Remove a memory from the index. O(k).
   */
  remove(memoryId: string): boolean {
    const entry = this.byId.get(memoryId);
    if (!entry) return false;

    this.byId.delete(memoryId);

    // Clean hash index
    const hashList = this.byHash.get(entry.contentHash);
    if (hashList) {
      const idx = hashList.indexOf(memoryId);
      if (idx !== -1) hashList.splice(idx, 1);
      if (hashList.length === 0) this.byHash.delete(entry.contentHash);
    }

    // Clean keyword index
    for (const kw of entry.keywords) {
      this.byKeyword.get(kw)?.delete(memoryId);
      if (this.byKeyword.get(kw)?.size === 0) this.byKeyword.delete(kw);
    }

    this.tierCounts[entry.tier] = Math.max(0, (this.tierCounts[entry.tier] || 0) - 1);
    return true;
  }

  /**
   * O(1) existence check by content hash.
   */
  existsByContent(content: string): { exists: boolean; memoryIds: string[]; tier?: string } {
    const hash = fnv1a(content.toLowerCase().replace(/\s+/g, ' ').trim());
    const ids = this.byHash.get(hash);
    if (!ids || ids.length === 0) return { exists: false, memoryIds: [] };

    const firstEntry = this.byId.get(ids[0]);
    return { exists: true, memoryIds: [...ids], tier: firstEntry?.tier };
  }

  /**
   * O(1) existence check by memory ID.
   */
  exists(memoryId: string): boolean {
    return this.byId.has(memoryId);
  }

  /**
   * Get the tier a memory is stored in. O(1).
   */
  getTier(memoryId: string): string | null {
    return this.byId.get(memoryId)?.tier || null;
  }

  /**
   * Update a memory's tier (e.g., after promotion/demotion). O(1).
   */
  updateTier(memoryId: string, newTier: IndexEntry['tier']): boolean {
    const entry = this.byId.get(memoryId);
    if (!entry) return false;

    this.tierCounts[entry.tier] = Math.max(0, (this.tierCounts[entry.tier] || 0) - 1);
    entry.tier = newTier;
    this.tierCounts[newTier] = (this.tierCounts[newTier] || 0) + 1;
    return true;
  }

  /**
   * Search by keywords across all tiers.
   * Returns memories matching any of the query keywords, scored by overlap.
   */
  searchByKeywords(query: string, limit: number = 20): CrossTierSearchResult[] {
    const queryKeywords = this.extractTopKeywords(query, 10);
    if (queryKeywords.length === 0) return [];

    const scores = new Map<string, number>();
    const matchedKw = new Map<string, string[]>();

    for (const kw of queryKeywords) {
      const memIds = this.byKeyword.get(kw);
      if (!memIds) continue;
      for (const id of memIds) {
        scores.set(id, (scores.get(id) || 0) + 1);
        if (!matchedKw.has(id)) matchedKw.set(id, []);
        matchedKw.get(id)!.push(kw);
      }
    }

    const results: CrossTierSearchResult[] = [];
    for (const [memoryId, score] of scores) {
      const entry = this.byId.get(memoryId);
      if (!entry) continue;
      results.push({
        memoryId,
        tier: entry.tier,
        matchScore: score / queryKeywords.length,
        keywords: matchedKw.get(memoryId) || [],
      });
    }

    results.sort((a, b) => b.matchScore - a.matchScore);
    return results.slice(0, limit);
  }

  /**
   * Get all memories in a specific tier.
   */
  getByTier(tier: string): string[] {
    const result: string[] = [];
    for (const [id, entry] of this.byId) {
      if (entry.tier === tier) result.push(id);
    }
    return result;
  }

  /** Extract top keywords (non-stop-word, length > 2, by frequency) */
  private extractTopKeywords(text: string, count: number): string[] {
    const STOPS = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'was', 'one', 'our', 'has', 'have', 'been', 'this', 'that', 'with', 'they', 'from', 'what', 'which', 'their', 'about', 'would', 'could', 'should', 'there', 'these', 'those', 'other', 'into', 'some', 'than', 'then', 'them', 'your']);
    const freq = new Map<string, number>();
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    for (const w of words) {
      if (w.length > 2 && !STOPS.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, count).map(e => e[0]);
  }

  getStats(): CrossTierStats {
    let collisions = 0;
    for (const ids of this.byHash.values()) {
      if (ids.length > 1) collisions += ids.length - 1;
    }

    const totalKeywords = [...this.byId.values()].reduce((s, e) => s + e.keywords.length, 0);

    return {
      totalIndexed: this.byId.size,
      byTier: { ...this.tierCounts },
      hashCollisions: collisions,
      avgKeywordsPerEntry: this.byId.size > 0 ? totalKeywords / this.byId.size : 0,
    };
  }

  private enforceCapacity(): void {
    if (this.byId.size <= MAX_INDEX_SIZE) return;
    // Remove oldest glacier entries first
    const glacierEntries = [...this.byId.entries()]
      .filter(([, e]) => e.tier === 'glacier')
      .sort((a, b) => a[1].addedAt - b[1].addedAt);
    const excess = this.byId.size - MAX_INDEX_SIZE;
    for (let i = 0; i < Math.min(excess, glacierEntries.length); i++) {
      this.remove(glacierEntries[i][0]);
    }
  }

  clear(): void {
    this.byId.clear();
    this.byHash.clear();
    this.byKeyword.clear();
    this.tierCounts = { hot: 0, warm: 0, cold: 0, glacier: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _index: CrossTierIndex | null = null;

export function getCrossTierIndex(): CrossTierIndex {
  if (!_index) _index = new CrossTierIndex();
  return _index;
}

export function resetCrossTierIndex(): void {
  _index = null;
}
