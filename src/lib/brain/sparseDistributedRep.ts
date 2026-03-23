/**
 * CMPSBL® BRAIN — Sparse Distributed Representations (SDR)
 * Biologically-inspired encoding with better noise tolerance and pattern completion.
 *
 * Properties:
 * - Fixed-width binary vectors (2048 bits, ~2% active = ~41 bits on)
 * - Overlap-based similarity (faster than cosine on dense vectors)
 * - Graceful degradation under noise
 * - Sub-pattern matching for partial recall
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const SDR_WIDTH = 2048;
const SPARSITY = 0.02;   // 2% active bits
const ACTIVE_BITS = Math.round(SDR_WIDTH * SPARSITY); // ~41

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SDR {
  /** Active bit positions (sorted) */
  activeBits: number[];
  /** Width of the representation */
  width: number;
}

export interface SDRMatch {
  id: string;
  overlap: number;      // raw overlap count
  similarity: number;   // normalized 0-1
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENCODING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * FNV-1a hash for deterministic bit selection.
 */
function fnv1a(input: string, seed: number = 0x811c9dc5): number {
  let hash = seed;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) | 0;
  }
  return hash >>> 0;
}

/**
 * Encode text into a Sparse Distributed Representation.
 * Uses semantic hashing: each trigram activates specific bits.
 */
export function encodeSDR(text: string): SDR {
  const lower = text.toLowerCase().replace(/[^\\w\\s]/g, '');
  const activeBitsSet = new Set<number>();

  // Generate trigrams and hash each to bit positions
  const padded = `  ${lower}  `;
  for (let i = 0; i < padded.length - 2; i++) {
    const trigram = padded.slice(i, i + 3);
    // Use multiple hash seeds to spread activation
    const h1 = fnv1a(trigram, 0x811c9dc5) % SDR_WIDTH;
    const h2 = fnv1a(trigram, 0x01000193) % SDR_WIDTH;
    activeBitsSet.add(h1);
    activeBitsSet.add(h2);
  }

  // Also hash words for word-level features
  const words = lower.split(/\\s+/).filter(w => w.length > 2);
  for (const word of words) {
    const h = fnv1a(word, 0xDEADBEEF) % SDR_WIDTH;
    activeBitsSet.add(h);
  }

  // Enforce target sparsity: if too many bits, keep only the most deterministic
  let bits = [...activeBitsSet].sort((a, b) => a - b);
  if (bits.length > ACTIVE_BITS * 2) {
    // Hash-select top bits deterministically
    bits = bits
      .map(b => ({ bit: b, priority: fnv1a(String(b), fnv1a(lower)) }))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, ACTIVE_BITS * 2)
      .map(b => b.bit)
      .sort((a, b) => a - b);
  }

  // If too few bits, add more via word-position hashing
  if (bits.length < ACTIVE_BITS) {
    for (let i = 0; bits.length < ACTIVE_BITS && i < 100; i++) {
      const extra = fnv1a(`${lower}:${i}`, 0xCAFEBABE) % SDR_WIDTH;
      if (!activeBitsSet.has(extra)) {
        bits.push(extra);
        activeBitsSet.add(extra);
      }
    }
    bits.sort((a, b) => a - b);
  }

  return { activeBits: bits, width: SDR_WIDTH };
}

/**
 * Compute overlap between two SDRs.
 * O(m+n) via sorted merge.
 */
export function sdrOverlap(a: SDR, b: SDR): number {
  let i = 0, j = 0, overlap = 0;
  while (i < a.activeBits.length && j < b.activeBits.length) {
    if (a.activeBits[i] === b.activeBits[j]) {
      overlap++;
      i++;
      j++;
    } else if (a.activeBits[i] < b.activeBits[j]) {
      i++;
    } else {
      j++;
    }
  }
  return overlap;
}

/**
 * Compute normalized similarity between two SDRs.
 * Uses Jaccard-like overlap / union.
 */
export function sdrSimilarity(a: SDR, b: SDR): number {
  const overlap = sdrOverlap(a, b);
  const union = a.activeBits.length + b.activeBits.length - overlap;
  return union > 0 ? overlap / union : 0;
}

/**
 * Union of two SDRs (OR operation).
 */
export function sdrUnion(a: SDR, b: SDR): SDR {
  const merged = new Set([...a.activeBits, ...b.activeBits]);
  return { activeBits: [...merged].sort((x, y) => x - y), width: SDR_WIDTH };
}

/**
 * Intersection of two SDRs (AND operation).
 */
export function sdrIntersection(a: SDR, b: SDR): SDR {
  const bSet = new Set(b.activeBits);
  const intersection = a.activeBits.filter(bit => bSet.has(bit));
  return { activeBits: intersection, width: SDR_WIDTH };
}

/**
 * Check if SDR a is a sub-pattern of SDR b (partial recall).
 * Returns true if >80% of a's bits are present in b.
 */
export function isSubPattern(a: SDR, b: SDR, threshold: number = 0.8): boolean {
  const overlap = sdrOverlap(a, b);
  return a.activeBits.length > 0 && overlap / a.activeBits.length >= threshold;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SDR INDEX — Fast nearest-neighbor search on sparse representations
// ═══════════════════════════════════════════════════════════════════════════════

export class SDRIndex {
  private entries: Array<{ id: string; sdr: SDR }> = [];

  get size(): number { return this.entries.length; }

  add(id: string, text: string): SDR {
    const sdr = encodeSDR(text);
    this.entries.push({ id, sdr });
    return sdr;
  }

  addRaw(id: string, sdr: SDR): void {
    this.entries.push({ id, sdr });
  }

  /**
   * Search for most similar entries.
   * O(n·k) where k = average active bits.
   */
  search(query: string, limit: number = 10, minSimilarity: number = 0.1): SDRMatch[] {
    const querySdr = encodeSDR(query);
    const results: SDRMatch[] = [];

    for (const entry of this.entries) {
      const overlap = sdrOverlap(querySdr, entry.sdr);
      const similarity = sdrSimilarity(querySdr, entry.sdr);
      if (similarity >= minSimilarity) {
        results.push({ id: entry.id, overlap, similarity });
      }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, limit);
  }

  /**
   * Find entries that contain a sub-pattern (partial recall).
   */
  findSubPatterns(query: string, threshold: number = 0.7): SDRMatch[] {
    const querySdr = encodeSDR(query);
    const results: SDRMatch[] = [];

    for (const entry of this.entries) {
      if (isSubPattern(querySdr, entry.sdr, threshold)) {
        const overlap = sdrOverlap(querySdr, entry.sdr);
        results.push({
          id: entry.id,
          overlap,
          similarity: overlap / querySdr.activeBits.length,
        });
      }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  clear(): void { this.entries = []; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _index: SDRIndex | null = null;

export function getBrainSDRIndex(): SDRIndex {
  if (!_index) _index = new SDRIndex();
  return _index;
}

export function resetBrainSDRIndex(): void {
  _index = null;
}
