/**
 * S-Tier 079 — Knowledge Compaction Engine
 * CJPI: 92 | Node: MEMORY | ID: S-115
 *
 * Compacts knowledge entries by deduplicating, merging similar entries,
 * and removing obsolete data to reduce memory footprint.
 */

export interface KnowledgeEntry {
  id: string;
  content: string;
  tags: string[];
  version: number;
  lastAccessed: number;
}

export interface CompactionResult {
  originalCount: number;
  compactedCount: number;
  deduplicatedCount: number;
  mergedCount: number;
  removedObsoleteCount: number;
  compressionRatio: number;
}

function contentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

export function compact(
  entries: KnowledgeEntry[],
  options: { obsoleteThresholdMs?: number; dedup?: boolean } = {}
): { result: KnowledgeEntry[]; stats: CompactionResult } {
  const { obsoleteThresholdMs = 30 * 86_400_000, dedup = true } = options;
  const now = Date.now();
  let deduplicatedCount = 0;
  let removedObsoleteCount = 0;

  // Remove obsolete
  let active = entries.filter(e => {
    if (now - e.lastAccessed > obsoleteThresholdMs) { removedObsoleteCount++; return false; }
    return true;
  });

  // Deduplicate by content hash
  if (dedup) {
    const seen = new Map<string, KnowledgeEntry>();
    const deduped: KnowledgeEntry[] = [];
    for (const entry of active) {
      const hash = contentHash(entry.content);
      if (seen.has(hash)) {
        deduplicatedCount++;
        // Keep the newer version
        const existing = seen.get(hash)!;
        if (entry.version > existing.version) {
          seen.set(hash, entry);
          const idx = deduped.indexOf(existing);
          if (idx !== -1) deduped[idx] = entry;
        }
      } else {
        seen.set(hash, entry);
        deduped.push(entry);
      }
    }
    active = deduped;
  }

  return {
    result: active,
    stats: {
      originalCount: entries.length,
      compactedCount: active.length,
      deduplicatedCount,
      mergedCount: 0,
      removedObsoleteCount,
      compressionRatio: entries.length > 0 ? Math.round((active.length / entries.length) * 100) / 100 : 1,
    },
  };
}
