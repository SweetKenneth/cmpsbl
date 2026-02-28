/**
 * Bloom Filter — Probabilistic membership test for high-speed deduplication
 * Space-efficient with controllable false positive rate
 */

export class BloomFilter {
  private bits: Uint8Array;
  private numHashes: number;
  private size: number;
  private count = 0;

  constructor(expectedItems = 10000, falsePositiveRate = 0.01) {
    this.size = Math.ceil(-expectedItems * Math.log(falsePositiveRate) / (Math.LN2 * Math.LN2));
    this.numHashes = Math.ceil((this.size / expectedItems) * Math.LN2);
    this.bits = new Uint8Array(Math.ceil(this.size / 8));
  }

  private hash(value: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < value.length; i++) {
      h = ((h << 5) - h + value.charCodeAt(i)) | 0;
    }
    return Math.abs(h) % this.size;
  }

  add(value: string): void {
    for (let i = 0; i < this.numHashes; i++) {
      const bit = this.hash(value, i * 0x9e3779b9);
      this.bits[bit >> 3] |= 1 << (bit & 7);
    }
    this.count++;
  }

  /** Returns true if value MIGHT exist, false if definitely not */
  test(value: string): boolean {
    for (let i = 0; i < this.numHashes; i++) {
      const bit = this.hash(value, i * 0x9e3779b9);
      if (!(this.bits[bit >> 3] & (1 << (bit & 7)))) return false;
    }
    return true;
  }

  /** Add only if not already present. Returns true if newly added. */
  addIfAbsent(value: string): boolean {
    if (this.test(value)) return false;
    this.add(value);
    return true;
  }

  get itemCount(): number { return this.count; }
  get bitCount(): number { return this.size; }

  /** Estimated false positive rate given current fill */
  get estimatedFPR(): number {
    const fillRatio = this.count / this.size;
    return Math.pow(1 - Math.exp(-this.numHashes * fillRatio), this.numHashes);
  }

  clear(): void {
    this.bits.fill(0);
    this.count = 0;
  }
}

/** Pre-built filter for substrate event deduplication */
export const eventDedup = new BloomFilter(50000, 0.001);
