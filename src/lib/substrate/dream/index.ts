/**
 * Dream Lineage & Semantic Drift Protection — Public API
 *
 * Provides lineage tracking, generation depth enforcement,
 * memory weighting, and heuristic provenance for the
 * Node Dreaming system.
 */

export type { MemoryLineage, DreamMetrics } from './types';
export { MAX_GENERATION } from './types';

export { buildLineage, isOverDerived, getRootSources } from './lineage';
export { memoryWeight, sortBySynthesisPriority } from './memoryWeighting';
export { createHeuristic, type DreamHeuristic } from './heuristicBuilder';
export { filterDreamCandidates, rankDreamCandidates } from './dreamCandidateFilter';
export { fetchDreamMetrics } from './dreamMetrics';
