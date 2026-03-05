/**
 * Dream Candidate Filter
 * Enforces generation depth limits during dream cycles.
 * Prevents runaway abstraction by filtering out over-derived memories
 * and forcing the engine to refresh from raw observations.
 */

import { MAX_GENERATION } from './types';
import { memoryWeight } from './memoryWeighting';

export interface DreamCandidate {
  id: string;
  generation?: number;
  lineage_confidence?: number;
  [key: string]: unknown;
}

/**
 * Filter dream candidates, removing those that exceed generation depth.
 * Returns only memories eligible for further synthesis.
 */
export function filterDreamCandidates<T extends DreamCandidate>(
  memories: T[]
): T[] {
  return memories.filter((m) => {
    const gen = m.generation ?? 0;
    if (gen > MAX_GENERATION) {
      return false; // Over-derived — needs raw refresh
    }
    return true;
  });
}

/**
 * Score and rank candidates for dream synthesis.
 * Raw memories score highest; deeply derived ones score lowest.
 */
export function rankDreamCandidates<T extends DreamCandidate>(
  memories: T[]
): T[] {
  const eligible = filterDreamCandidates(memories);
  return eligible.sort((a, b) => {
    const scoreA = memoryWeight(a) * (a.lineage_confidence ?? 1);
    const scoreB = memoryWeight(b) * (b.lineage_confidence ?? 1);
    return scoreB - scoreA;
  });
}
