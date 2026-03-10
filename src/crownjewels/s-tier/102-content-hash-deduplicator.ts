/**
 * S-Tier 102 — Content-Hash Deduplicator
 * ID: S-87 | CJPI: 89 | Module: RELAY
 * 
 * Content-addressable deduplication with hash-based identity and reference counting.
 */

export interface ContentEntry {
  hash: string;
  content: unknown;
  refCount: number;
  firstSeen: string;
  lastAccessed: string;
  sizeBytes: number;
}

export interface DeduplicationStats {
  totalEntries: number;
  uniqueEntries: number;
  duplicatesAvoided: number;
  storageSavedBytes: number;
}

export class ContentHashDeduplicator {
  private store: Map<string, ContentEntry> = new Map();
  private duplicatesAvoided = 0;

  private async computeHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async insert(content: unknown): Promise<{ hash: string; isDuplicate: boolean }> {
    const serialized = JSON.stringify(content);
    const hash = await this.computeHash(serialized);
    const existing = this.store.get(hash);

    if (existing) {
      existing.refCount++;
      existing.lastAccessed = new Date().toISOString();
      this.duplicatesAvoided++;
      return { hash, isDuplicate: true };
    }

    this.store.set(hash, {
      hash,
      content,
      refCount: 1,
      firstSeen: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      sizeBytes: new TextEncoder().encode(serialized).length,
    });

    return { hash, isDuplicate: false };
  }

  get(hash: string): unknown | null {
    const entry = this.store.get(hash);
    if (entry) {
      entry.lastAccessed = new Date().toISOString();
      return entry.content;
    }
    return null;
  }

  release(hash: string): boolean {
    const entry = this.store.get(hash);
    if (!entry) return false;
    entry.refCount--;
    if (entry.refCount <= 0) {
      this.store.delete(hash);
    }
    return true;
  }

  getStats(): DeduplicationStats {
    let totalSize = 0;
    for (const entry of this.store.values()) {
      totalSize += entry.sizeBytes * (entry.refCount - 1);
    }
    return {
      totalEntries: [...this.store.values()].reduce((s, e) => s + e.refCount, 0),
      uniqueEntries: this.store.size,
      duplicatesAvoided: this.duplicatesAvoided,
      storageSavedBytes: totalSize,
    };
  }
}
