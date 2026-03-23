/**
 * NEXUS — Request Deduplication Layer
 * Content-hash-based dedup that coalesces identical concurrent requests.
 */

export interface DedupEntry {
  hash: string;
  promise: Promise<unknown>;
  createdAt: number;
  hitCount: number;
}

export interface DedupStats {
  totalRequests: number;
  deduplicatedCount: number;
  savingsRatio: number;
  activeEntries: number;
}

const inflight = new Map<string, DedupEntry>();
const TTL_MS = 30_000; // entries expire after 30s
let totalRequests = 0;
let deduplicatedCount = 0;

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `dedup-${Math.abs(hash).toString(36)}`;
}

export function generateContentHash(payload: unknown): string {
  try {
    const normalized = JSON.stringify(payload, Object.keys(payload as object).sort());
    return simpleHash(normalized);
  } catch {
    return simpleHash(String(payload));
  }
}

export async function deduplicatedCall<T>(
  contentHash: string,
  executor: () => Promise<T>
): Promise<T> {
  totalRequests++;

  // Cleanup expired entries
  const now = Date.now();
  for (const [key, entry] of inflight) {
    if (now - entry.createdAt > TTL_MS) {
      inflight.delete(key);
    }
  }

  // Check for existing inflight request
  const existing = inflight.get(contentHash);
  if (existing) {
    existing.hitCount++;
    deduplicatedCount++;
    return existing.promise as Promise<T>;
  }

  // Create new inflight entry
  const promise = executor().finally(() => {
    // Remove after completion (with small grace period for late duplicates)
    setTimeout(() => inflight.delete(contentHash), 500);
  });

  inflight.set(contentHash, {
    hash: contentHash,
    promise,
    createdAt: now,
    hitCount: 1,
  });

  return promise;
}

export function getDedupStats(): DedupStats {
  return {
    totalRequests,
    deduplicatedCount,
    savingsRatio: totalRequests > 0 ? deduplicatedCount / totalRequests : 0,
    activeEntries: inflight.size,
  };
}

export function resetDedupStats(): void {
  totalRequests = 0;
  deduplicatedCount = 0;
  inflight.clear();
}
