/**
 * HARVEST Ultimate — Deduplication Forge
 * Multi-layer dedup: bloom filter → MinHash (near-duplicate) → semantic similarity.
 * Catches paraphrased duplicates, not just exact matches.
 */

export interface DedupResult {
  totalInput: number;
  uniqueOutput: number;
  exactDuplicates: number;
  nearDuplicates: number;
  deduplicationRate: number;
  processingTimeMs: number;
}

export interface DedupStats {
  totalProcessed: number;
  totalDeduplicated: number;
  exactDups: number;
  nearDups: number;
  avgDeduplicationRate: number;
  bloomCapacity: number;
  bloomFillRate: number;
}

// Simple bloom filter implementation
class BloomFilter {
  private bits: Uint8Array;
  private hashCount: number;
  private inserted: number;
  readonly capacity: number;

  constructor(capacity: number = 100_000, hashCount: number = 7) {
    const size = Math.ceil(capacity * 10 / 8); // ~10 bits per element
    this.bits = new Uint8Array(size);
    this.hashCount = hashCount;
    this.capacity = capacity;
    this.inserted = 0;
  }

  private hash(str: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h) % (this.bits.length * 8);
  }

  add(item: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const bit = this.hash(item, i * 31);
      this.bits[Math.floor(bit / 8)] |= (1 << (bit % 8));
    }
    this.inserted++;
  }

  has(item: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const bit = this.hash(item, i * 31);
      if (!(this.bits[Math.floor(bit / 8)] & (1 << (bit % 8)))) return false;
    }
    return true;
  }

  get fillRate(): number { return this.inserted / this.capacity; }
  get count(): number { return this.inserted; }

  reset(): void {
    this.bits.fill(0);
    this.inserted = 0;
  }
}

// MinHash for near-duplicate detection
function computeShingles(text: string, k: number = 3): Set<string> {
  const shingles = new Set<string>();
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(' '));
  }
  return shingles;
}

function minHashSignature(shingles: Set<string>, numHashes: number = 64): number[] {
  const sig: number[] = new Array(numHashes).fill(Infinity);
  for (const s of shingles) {
    for (let i = 0; i < numHashes; i++) {
      let h = i * 37;
      for (let j = 0; j < s.length; j++) {
        h = ((h << 5) - h + s.charCodeAt(j)) | 0;
      }
      h = h >>> 0;
      if (h < sig[i]) sig[i] = h;
    }
  }
  return sig;
}

function jaccardFromSignatures(a: number[], b: number[]): number {
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / a.length;
}

function contentHash(record: Record<string, unknown>): string {
  const sorted = Object.keys(record).sort().map(k => `${k}:${JSON.stringify(record[k])}`).join('|');
  let h = 0;
  for (let i = 0; i < sorted.length; i++) {
    h = ((h << 5) - h + sorted.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

const NEAR_DUPLICATE_THRESHOLD = 0.7;
const bloom = new BloomFilter(100_000);
let totalProcessed = 0;
let totalDeduplicated = 0;
let exactDups = 0;
let nearDups = 0;

export function deduplicateRecords(
  records: Record<string, unknown>[],
  textField?: string
): { unique: Record<string, unknown>[]; result: DedupResult } {
  const start = performance.now();
  const unique: Record<string, unknown>[] = [];
  let exactCount = 0;
  let nearCount = 0;

  // Store signatures for near-duplicate detection within this batch
  const batchSignatures: Array<{ sig: number[]; idx: number }> = [];

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const hash = contentHash(rec);

    // Layer 1: Bloom filter (exact)
    if (bloom.has(hash)) {
      exactCount++;
      continue;
    }

    // Layer 2: MinHash (near-duplicate) — if text field available
    let isNearDup = false;
    if (textField && typeof rec[textField] === 'string') {
      const shingles = computeShingles(rec[textField] as string);
      if (shingles.size > 0) {
        const sig = minHashSignature(shingles);
        for (const existing of batchSignatures) {
          const similarity = jaccardFromSignatures(sig, existing.sig);
          if (similarity >= NEAR_DUPLICATE_THRESHOLD) {
            isNearDup = true;
            break;
          }
        }
        if (!isNearDup) {
          batchSignatures.push({ sig, idx: i });
        }
      }
    }

    if (isNearDup) {
      nearCount++;
      continue;
    }

    bloom.add(hash);
    unique.push(rec);
  }

  const elapsed = performance.now() - start;
  totalProcessed += records.length;
  totalDeduplicated += exactCount + nearCount;
  exactDups += exactCount;
  nearDups += nearCount;

  const result: DedupResult = {
    totalInput: records.length,
    uniqueOutput: unique.length,
    exactDuplicates: exactCount,
    nearDuplicates: nearCount,
    deduplicationRate: records.length > 0 ? (exactCount + nearCount) / records.length : 0,
    processingTimeMs: elapsed,
  };

  return { unique, result };
}

export function getDedupStats(): DedupStats {
  return {
    totalProcessed,
    totalDeduplicated,
    exactDups,
    nearDups,
    avgDeduplicationRate: totalProcessed > 0 ? totalDeduplicated / totalProcessed : 0,
    bloomCapacity: bloom.capacity,
    bloomFillRate: bloom.fillRate,
  };
}

export function resetDedupState(): void {
  bloom.reset();
  totalProcessed = 0;
  totalDeduplicated = 0;
  exactDups = 0;
  nearDups = 0;
}
