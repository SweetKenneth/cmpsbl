/**
 * Memory Weighting for Dream Synthesis
 * Raw observations always outweigh derived abstractions.
 * Prevents semantic drift by down-weighting high-generation memories.
 */

/** Weight multiplier based on generation depth */
const GENERATION_WEIGHTS: Record<number, number> = {
  0: 1.0,   // Raw event — full weight
  1: 0.6,   // First-order synthesis
  2: 0.4,   // Second-order
  3: 0.2,   // Third-order (max allowed)
};

/**
 * Returns synthesis weight for a memory based on its generation depth.
 * Raw memories (generation 0) get full weight.
 * Deeper derivations are progressively down-weighted.
 */
export function memoryWeight(memory: { generation?: number }): number {
  const gen = memory.generation ?? 0;
  return GENERATION_WEIGHTS[gen] ?? 0.1;
}

/**
 * Sort memories by synthesis priority (raw first, then by confidence).
 */
export function sortBySynthesisPriority<T extends { generation?: number; lineage_confidence?: number }>(
  memories: T[]
): T[] {
  return [...memories].sort((a, b) => {
    const wA = memoryWeight(a);
    const wB = memoryWeight(b);
    if (wA !== wB) return wB - wA; // Higher weight first
    return (b.lineage_confidence ?? 1) - (a.lineage_confidence ?? 1);
  });
}
