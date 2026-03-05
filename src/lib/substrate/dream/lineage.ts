/**
 * Lineage Builder
 * Constructs provenance metadata for dream-synthesized memories.
 * Enforces MAX_GENERATION to prevent semantic drift.
 */

import type { MemoryLineage } from './types';
import { MAX_GENERATION } from './types';

/**
 * Build lineage for a new synthesized memory from its parent memories.
 * Generation is capped at MAX_GENERATION to prevent runaway abstraction.
 * Confidence degrades as generation depth increases.
 */
export function buildLineage(parents: MemoryLineage[]): MemoryLineage {
  if (!parents.length) {
    return {
      source_events: [],
      derived_from: [],
      generation: 0,
      confidence: 1.0,
    };
  }

  const maxParentGen = Math.max(...parents.map((p) => p.generation));
  const generation = Math.min(maxParentGen + 1, MAX_GENERATION);

  const sourceEvents = new Set<string>();
  const derivedFrom = new Set<string>();

  for (const p of parents) {
    p.source_events.forEach((e) => sourceEvents.add(e));
    p.derived_from.forEach((d) => derivedFrom.add(d));
  }

  // Average parent confidence with generation decay penalty
  const avgConfidence =
    parents.reduce((sum, p) => sum + p.confidence, 0) / parents.length;
  const decayFactor = 1 - generation * 0.15; // 15% decay per generation
  const confidence = Math.max(0.1, avgConfidence * decayFactor);

  return {
    source_events: Array.from(sourceEvents),
    derived_from: Array.from(derivedFrom),
    generation,
    confidence: Math.round(confidence * 1000) / 1000,
  };
}

/**
 * Check whether a memory has exceeded generation depth limits.
 */
export function isOverDerived(lineage: MemoryLineage): boolean {
  return lineage.generation > MAX_GENERATION;
}

/**
 * Extract the root source event IDs from a lineage chain.
 */
export function getRootSources(lineage: MemoryLineage): string[] {
  return lineage.source_events.length > 0
    ? lineage.source_events
    : lineage.derived_from;
}
