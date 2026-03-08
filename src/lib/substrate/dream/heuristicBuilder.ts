/**
 * Heuristic Builder with Lineage
 * All dream-generated heuristics maintain full provenance
 * back to the original observations that produced them.
 */

import { buildLineage } from './lineage';
import type { MemoryLineage } from './types';
import { MAX_GENERATION } from './types';

export interface DreamHeuristic {
  id: string;
  rule: string;
  lineage: MemoryLineage;
  confidence: number;
  created_at: number;
  auto_applicable: boolean;
}

/**
 * Create a heuristic from parent memories.
 * Refuses to create if parents exceed generation depth.
 */
export function createHeuristic(
  rule: string,
  parents: { lineage: MemoryLineage }[]
): DreamHeuristic | null {
  // Block heuristic generation from over-derived memories
  if (parents.length === 0) {
    console.warn('[DREAM] Refused heuristic: no parent memories provided.');
    return null;
  }
  const maxGen = Math.max(...parents.map((p) => p.lineage.generation));
  if (maxGen >= MAX_GENERATION) {
    console.warn(
      `[DREAM] Refused heuristic: parent generation ${maxGen} >= limit ${MAX_GENERATION}. Needs raw memory refresh.`
    );
    return null;
  }

  const lineage = buildLineage(parents.map((p) => p.lineage));

  return {
    id: `heur-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    rule,
    lineage,
    confidence: lineage.confidence,
    created_at: Date.now(),
    auto_applicable: lineage.confidence >= 0.85,
  };
}
