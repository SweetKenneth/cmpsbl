/**
 * Minds Intelligence Layer — Memory Consolidation Cycles
 * GATED: INTERNAL_ONLY
 * Background compression pass: deduplicate + strengthen high-value memory.
 * No visible "sleep cycle" UI.
 */

import { isFeatureAvailable } from './featureFlags';

export interface ConsolidationResult {
  duplicatesRemoved: number;
  memoriesStrengthened: number;
  memoriesCompressed: number;
  totalProcessed: number;
  durationMs: number;
}

export interface MemoryFragment {
  id: string;
  content: string;
  valueScore: number;
  accessCount: number;
  createdAt: number;
  tags: string[];
}

/** Simple string similarity using trigram overlap */
function trigramSimilarity(a: string, b: string): number {
  const trigramsA = new Set<string>();
  const trigramsB = new Set<string>();
  const la = a.toLowerCase();
  const lb = b.toLowerCase();

  for (let i = 0; i <= la.length - 3; i++) trigramsA.add(la.slice(i, i + 3));
  for (let i = 0; i <= lb.length - 3; i++) trigramsB.add(lb.slice(i, i + 3));

  if (trigramsA.size === 0 || trigramsB.size === 0) return 0;

  let overlap = 0;
  for (const t of trigramsA) if (trigramsB.has(t)) overlap++;

  return (2 * overlap) / (trigramsA.size + trigramsB.size);
}

/** Identify duplicate clusters */
function findDuplicateClusters(
  memories: MemoryFragment[],
  threshold: number = 0.75
): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  const assigned = new Set<string>();

  for (let i = 0; i < memories.length; i++) {
    if (assigned.has(memories[i].id)) continue;

    const cluster: string[] = [memories[i].id];
    assigned.add(memories[i].id);

    for (let j = i + 1; j < memories.length; j++) {
      if (assigned.has(memories[j].id)) continue;

      const sim = trigramSimilarity(memories[i].content, memories[j].content);
      if (sim >= threshold) {
        cluster.push(memories[j].id);
        assigned.add(memories[j].id);
      }
    }

    if (cluster.length > 1) {
      clusters.set(memories[i].id, cluster);
    }
  }

  return clusters;
}

/** Compress a memory fragment by extracting core information */
function compressContent(content: string, maxWords: number = 50): string {
  const words = content.split(/\s+/);
  if (words.length <= maxWords) return content;
  return words.slice(0, maxWords).join(' ') + '…';
}

/** Run a consolidation cycle on a set of memories */
export function runConsolidation(
  memories: MemoryFragment[],
  options?: {
    deduplicationThreshold?: number;
    compressionMaxWords?: number;
    strengthenThreshold?: number;
  }
): ConsolidationResult {
  if (!isFeatureAvailable('consolidation')) {
    return { duplicatesRemoved: 0, memoriesStrengthened: 0, memoriesCompressed: 0, totalProcessed: 0, durationMs: 0 };
  }

  const startTime = Date.now();
  const threshold = options?.deduplicationThreshold ?? 0.75;
  const maxWords = options?.compressionMaxWords ?? 50;
  const strengthenMin = options?.strengthenThreshold ?? 0.7;

  let duplicatesRemoved = 0;
  let memoriesStrengthened = 0;
  let memoriesCompressed = 0;

  // Phase 1: Deduplication
  const clusters = findDuplicateClusters(memories, threshold);
  const toRemove = new Set<string>();

  for (const [primaryId, clusterIds] of clusters) {
    const primary = memories.find(m => m.id === primaryId);
    if (!primary) continue;

    // Keep highest-value entry, remove rest
    const clusterMemories = clusterIds
      .map(id => memories.find(m => m.id === id))
      .filter(Boolean) as MemoryFragment[];

    clusterMemories.sort((a, b) => b.valueScore - a.valueScore);

    // Merge access counts into winner
    const winner = clusterMemories[0];
    for (let i = 1; i < clusterMemories.length; i++) {
      winner.accessCount += clusterMemories[i].accessCount;
      toRemove.add(clusterMemories[i].id);
      duplicatesRemoved++;
    }
  }

  // Phase 2: Strengthen high-value memories
  for (const memory of memories) {
    if (toRemove.has(memory.id)) continue;
    if (memory.valueScore >= strengthenMin && memory.accessCount >= 3) {
      memory.valueScore = Math.min(1, memory.valueScore + 0.05);
      memoriesStrengthened++;
    }
  }

  // Phase 3: Compress long memories
  for (const memory of memories) {
    if (toRemove.has(memory.id)) continue;
    const wordCount = memory.content.split(/\s+/).length;
    if (wordCount > maxWords * 2) {
      memory.content = compressContent(memory.content, maxWords);
      memoriesCompressed++;
    }
  }

  // Remove duplicates from array (mutate in place)
  for (let i = memories.length - 1; i >= 0; i--) {
    if (toRemove.has(memories[i].id)) {
      memories.splice(i, 1);
    }
  }

  return {
    duplicatesRemoved,
    memoriesStrengthened,
    memoriesCompressed,
    totalProcessed: memories.length + duplicatesRemoved,
    durationMs: Date.now() - startTime,
  };
}

/** Check if consolidation is needed based on memory count and age */
export function shouldConsolidate(
  memoryCount: number,
  lastConsolidationMs: number | null,
  intervalMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  if (!isFeatureAvailable('consolidation')) return false;
  if (memoryCount < 20) return false;
  if (!lastConsolidationMs) return true;
  return Date.now() - lastConsolidationMs > intervalMs;
}
