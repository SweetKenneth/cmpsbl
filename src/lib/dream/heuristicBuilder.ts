/**
 * CMPSBL® DREAM — Heuristic Builder
 * Creates structured DreamHeuristics with confidence decay and counter-example tracking.
 * Confidence formula: min(parent_conf) × 0.85
 */

import { registerDerived, type LineageNode } from './lineageTracker';

export const CONFIDENCE_DECAY_FACTOR = 0.85;
export const MAX_COUNTER_EXAMPLES = 3; // auto-flag threshold

export interface DreamHeuristic {
  id: string;
  rule: string;
  sourceMemoryIds: string[];
  generation: number;
  confidence: number;
  domain: string;
  counterExamples: number;
  flaggedForReview: boolean;
  validatedBy: string | null;
  validatedAt: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

// Bounded store
const MAX_HEURISTICS = 2000;
const heuristics = new Map<string, DreamHeuristic>();

/**
 * Build a new heuristic from parent memories
 */
export function buildHeuristic(
  rule: string,
  parentIds: string[],
  parentConfidences: number[],
  domain: string = 'general',
  metadata: Record<string, unknown> = {}
): DreamHeuristic | null {
  // Confidence = min(parent confidences) × decay factor
  const minParentConf = parentConfidences.length > 0
    ? Math.min(...parentConfidences)
    : 0.5;
  const confidence = Math.round(minParentConf * CONFIDENCE_DECAY_FACTOR * 1000) / 1000;

  const id = `heur_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  // Register in lineage tracker
  const lineageNode = registerDerived(id, parentIds, rule, confidence, domain);
  if (!lineageNode) {
    // MAX_GENERATION exceeded
    return null;
  }

  const heuristic: DreamHeuristic = {
    id,
    rule,
    sourceMemoryIds: parentIds,
    generation: lineageNode.generation,
    confidence,
    domain,
    counterExamples: 0,
    flaggedForReview: false,
    validatedBy: null,
    validatedAt: null,
    createdAt: new Date().toISOString(),
    metadata,
  };

  if (heuristics.size >= MAX_HEURISTICS) {
    // Evict lowest-confidence flagged heuristic
    let evictKey = '';
    let lowestConf = Infinity;
    for (const [k, h] of heuristics) {
      if (h.flaggedForReview && h.confidence < lowestConf) {
        lowestConf = h.confidence;
        evictKey = k;
      }
    }
    if (!evictKey) {
      // Evict oldest
      evictKey = heuristics.keys().next().value || '';
    }
    if (evictKey) heuristics.delete(evictKey);
  }

  heuristics.set(id, heuristic);
  return heuristic;
}

/**
 * Record a counter-example against a heuristic
 */
export function recordCounterExample(heuristicId: string): DreamHeuristic | null {
  const h = heuristics.get(heuristicId);
  if (!h) return null;

  h.counterExamples++;
  if (h.counterExamples > MAX_COUNTER_EXAMPLES && !h.flaggedForReview) {
    h.flaggedForReview = true;
  }

  return h;
}

/**
 * Validate a heuristic (after human/BRAIN review)
 */
export function validateHeuristic(heuristicId: string, validatedBy: string): boolean {
  const h = heuristics.get(heuristicId);
  if (!h) return false;

  h.flaggedForReview = false;
  h.validatedBy = validatedBy;
  h.validatedAt = new Date().toISOString();
  return true;
}

/**
 * Get heuristics by domain
 */
export function getHeuristics(options?: {
  domain?: string;
  flaggedOnly?: boolean;
  minConfidence?: number;
  limit?: number;
}): DreamHeuristic[] {
  let results = Array.from(heuristics.values());

  if (options?.domain) results = results.filter(h => h.domain === options.domain);
  if (options?.flaggedOnly) results = results.filter(h => h.flaggedForReview);
  if (options?.minConfidence) results = results.filter(h => h.confidence >= options.minConfidence!);

  results.sort((a, b) => b.confidence - a.confidence);
  return results.slice(0, options?.limit || 100);
}

/**
 * Get heuristic stats
 */
export function getHeuristicStats(): {
  total: number;
  flaggedForReview: number;
  validated: number;
  avgConfidence: number;
  byGeneration: Record<number, number>;
} {
  const all = Array.from(heuristics.values());
  const flagged = all.filter(h => h.flaggedForReview).length;
  const validated = all.filter(h => h.validatedBy !== null).length;
  const avgConf = all.length > 0 ? all.reduce((sum, h) => sum + h.confidence, 0) / all.length : 0;
  const byGen: Record<number, number> = {};
  for (const h of all) {
    byGen[h.generation] = (byGen[h.generation] || 0) + 1;
  }

  return {
    total: all.length,
    flaggedForReview: flagged,
    validated,
    avgConfidence: Math.round(avgConf * 1000) / 1000,
    byGeneration: byGen,
  };
}
