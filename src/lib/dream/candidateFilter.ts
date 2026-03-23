/**
 * CMPSBL® DREAM — Dream Candidate Filter Pipeline
 * Selects eligible memories for dream synthesis.
 * Excludes: generation >= MAX_GENERATION, recently accessed (<4h), low importance.
 */

import { MAX_GENERATION } from './lineageTracker';

export interface DreamCandidate {
  id: string;
  content: string;
  generation: number;
  importance: number;
  lastAccessedAt: string;
  domain: string;
  confidence: number;
  synthesisCompatibility: number; // 0-1 score of how well this pairs with others
}

export interface FilterResult {
  eligible: DreamCandidate[];
  filtered: number;
  reasons: Record<string, number>;
  timestamp: string;
}

export interface FilterConfig {
  maxGeneration: number;
  recentAccessWindowMs: number;    // exclude memories accessed within this window
  minImportance: number;           // 0-1
  minConfidence: number;           // 0-1
  maxCandidates: number;           // cap output size
}

const DEFAULT_FILTER_CONFIG: FilterConfig = {
  maxGeneration: MAX_GENERATION,
  recentAccessWindowMs: 4 * 60 * 60 * 1000, // 4 hours
  minImportance: 0.2,
  minConfidence: 0.3,
  maxCandidates: 50,
};

/**
 * Filter memories for dream synthesis eligibility
 */
export function filterDreamCandidates(
  memories: Array<{
    id: string;
    content: string;
    generation?: number;
    importance?: number;
    lastAccessedAt?: string;
    domain?: string;
    confidence?: number;
  }>,
  config?: Partial<FilterConfig>
): FilterResult {
  const cfg = { ...DEFAULT_FILTER_CONFIG, ...config };
  const now = Date.now();
  const reasons: Record<string, number> = {};
  const eligible: DreamCandidate[] = [];

  for (const mem of memories) {
    const generation = mem.generation ?? 0;
    const importance = mem.importance ?? 0.5;
    const confidence = mem.confidence ?? 0.5;
    const lastAccessed = mem.lastAccessedAt ? new Date(mem.lastAccessedAt).getTime() : 0;

    // Filter 1: Generation depth
    if (generation >= cfg.maxGeneration) {
      reasons['generation_exceeded'] = (reasons['generation_exceeded'] || 0) + 1;
      continue;
    }

    // Filter 2: Recently accessed
    if (lastAccessed > 0 && (now - lastAccessed) < cfg.recentAccessWindowMs) {
      reasons['recently_accessed'] = (reasons['recently_accessed'] || 0) + 1;
      continue;
    }

    // Filter 3: Minimum importance
    if (importance < cfg.minImportance) {
      reasons['low_importance'] = (reasons['low_importance'] || 0) + 1;
      continue;
    }

    // Filter 4: Minimum confidence
    if (confidence < cfg.minConfidence) {
      reasons['low_confidence'] = (reasons['low_confidence'] || 0) + 1;
      continue;
    }

    // Calculate synthesis compatibility
    const synthesisCompatibility = calculateCompatibility(generation, importance, confidence);

    eligible.push({
      id: mem.id,
      content: mem.content,
      generation,
      importance,
      lastAccessedAt: mem.lastAccessedAt || '',
      domain: mem.domain || 'general',
      confidence,
      synthesisCompatibility,
    });
  }

  // Sort by synthesis priority (compatibility * importance * confidence)
  eligible.sort((a, b) => {
    const scoreA = a.synthesisCompatibility * a.importance * a.confidence;
    const scoreB = b.synthesisCompatibility * b.importance * b.confidence;
    return scoreB - scoreA;
  });

  // Cap output
  const capped = eligible.slice(0, cfg.maxCandidates);

  return {
    eligible: capped,
    filtered: memories.length - capped.length,
    reasons,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate synthesis compatibility score
 * Lower generation + higher importance = better candidate
 */
function calculateCompatibility(generation: number, importance: number, confidence: number): number {
  const genFactor = 1 - (generation / MAX_GENERATION); // favors lower generation
  return Math.round((genFactor * 0.4 + importance * 0.35 + confidence * 0.25) * 1000) / 1000;
}

/**
 * Find optimal pairs from candidates for synthesis
 */
export function pairCandidates(
  candidates: DreamCandidate[],
  maxPairs: number = 25
): Array<[DreamCandidate, DreamCandidate]> {
  const pairs: Array<[DreamCandidate, DreamCandidate]> = [];
  const used = new Set<string>();

  // Prefer cross-domain pairs for novel synthesis
  const sorted = [...candidates].sort((a, b) => b.synthesisCompatibility - a.synthesisCompatibility);

  for (let i = 0; i < sorted.length && pairs.length < maxPairs; i++) {
    if (used.has(sorted[i].id)) continue;

    for (let j = i + 1; j < sorted.length && pairs.length < maxPairs; j++) {
      if (used.has(sorted[j].id)) continue;

      // Prefer cross-domain
      if (sorted[i].domain !== sorted[j].domain) {
        pairs.push([sorted[i], sorted[j]]);
        used.add(sorted[i].id);
        used.add(sorted[j].id);
        break;
      }
    }
  }

  // Fill remaining with same-domain pairs
  for (let i = 0; i < sorted.length && pairs.length < maxPairs; i++) {
    if (used.has(sorted[i].id)) continue;
    for (let j = i + 1; j < sorted.length && pairs.length < maxPairs; j++) {
      if (used.has(sorted[j].id)) continue;
      pairs.push([sorted[i], sorted[j]]);
      used.add(sorted[i].id);
      used.add(sorted[j].id);
      break;
    }
  }

  return pairs;
}
