/**
 * S-Tier 029 — Nocturne Consolidation Engine
 * CJPI: 94 | Node: DREAM | ID: S-73
 *
 * Offline "dream cycle" processor that consolidates fragmented learnings,
 * prunes low-value memory entries, and strengthens high-recall patterns.
 */

export interface MemoryFragment {
  id: string;
  topic: string;
  strength: number;     // 0-1
  lastAccessed: number; // epoch ms
  accessCount: number;
  associations: string[];
}

export interface ConsolidationResult {
  pruned: string[];
  strengthened: string[];
  merged: Array<{ from: string[]; into: string }>;
  totalProcessed: number;
  durationMs: number;
}

const PRUNE_THRESHOLD = 0.15;
const STRENGTHEN_THRESHOLD = 0.7;
const MERGE_SIMILARITY_THRESHOLD = 0.8;
const DECAY_RATE = 0.02; // per hour since last access

function computeDecayedStrength(fragment: MemoryFragment, now: number): number {
  const hoursSinceAccess = (now - fragment.lastAccessed) / 3_600_000;
  const decay = Math.exp(-DECAY_RATE * hoursSinceAccess);
  const accessBoost = Math.min(fragment.accessCount / 20, 1) * 0.2;
  return Math.max(0, fragment.strength * decay + accessBoost);
}

function associationOverlap(a: MemoryFragment, b: MemoryFragment): number {
  const setA = new Set(a.associations);
  const setB = new Set(b.associations);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function runConsolidationCycle(fragments: MemoryFragment[]): ConsolidationResult {
  const start = Date.now();
  const now = start;
  const pruned: string[] = [];
  const strengthened: string[] = [];
  const merged: Array<{ from: string[]; into: string }> = [];

  // Phase 1: Decay & classify
  const active: Array<MemoryFragment & { effectiveStrength: number }> = [];
  for (const f of fragments) {
    const eff = computeDecayedStrength(f, now);
    if (eff < PRUNE_THRESHOLD) {
      pruned.push(f.id);
    } else {
      active.push({ ...f, effectiveStrength: eff });
      if (eff >= STRENGTHEN_THRESHOLD) strengthened.push(f.id);
    }
  }

  // Phase 2: Merge highly-overlapping fragments
  const mergedSet = new Set<string>();
  for (let i = 0; i < active.length; i++) {
    if (mergedSet.has(active[i].id)) continue;
    const cluster = [active[i].id];
    for (let j = i + 1; j < active.length; j++) {
      if (mergedSet.has(active[j].id)) continue;
      if (associationOverlap(active[i], active[j]) >= MERGE_SIMILARITY_THRESHOLD) {
        cluster.push(active[j].id);
        mergedSet.add(active[j].id);
      }
    }
    if (cluster.length > 1) {
      merged.push({ from: cluster, into: `merged-${active[i].id}` });
    }
  }

  return {
    pruned,
    strengthened,
    merged,
    totalProcessed: fragments.length,
    durationMs: Date.now() - start,
  };
}
