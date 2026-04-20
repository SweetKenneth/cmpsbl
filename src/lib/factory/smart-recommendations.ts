/**
 * Smart Recommendations — Sprint 2 (Ascension V2 Phase 1: Trust & Visibility)
 *
 * Read-only recommendation engine that surfaces the most relevant CMPSBL Layers
 * for a given run, based on:
 *   1. GAPS — primitives the run did NOT cover (highest priority)
 *   2. ADJACENCY — primitives in the same family as covered ones
 *
 * Pure data-layer computation. No engine, DB-write, Lex, or Mana code touched.
 * Used by V2EnhanceStep (pre-run) and V2ResultsStep (post-run).
 */

import { getAvailableLayers, type CmpsblLayerDefinition } from '@/lib/export/cmpsbl-layers';
import {
  ORGANS, LAYERS, ENGINES, AGENTS, CANONICAL_PRIMITIVES,
} from '@/lib/ascension-v2/canonical-primitives';

export type RecoReason = 'gap' | 'adjacency';

export interface LayerRecommendation {
  layer: CmpsblLayerDefinition;
  reason: RecoReason;
  /** Primitive that drove the recommendation */
  driverPrimitive: string;
  /** One-liner explaining why this layer was picked */
  rationale: string;
}

export interface RecommendationInput {
  /** Primitives the run already covered (uppercase canonical names) */
  coveredPrimitives: string[];
  /** Layer IDs the user has already selected — never recommend these again */
  selectedLayerIds?: string[];
  /** Max recommendations to return (default 5) */
  limit?: number;
}

/** Adjacency families — primitives that commonly appear together. */
const FAMILIES: Record<string, readonly string[]> = {
  ORGANS: ORGANS as unknown as string[],
  LAYERS: LAYERS as unknown as string[],
  ENGINES: ENGINES as unknown as string[],
  AGENTS: AGENTS as unknown as string[],
};

function familyOf(primitive: string): string | null {
  for (const [name, list] of Object.entries(FAMILIES)) {
    if ((list as string[]).includes(primitive)) return name;
  }
  return null;
}

function normalize(p: string): string {
  return p.trim().toUpperCase();
}

/**
 * Compute Balanced (gaps + adjacency) recommendations.
 * - Stage 1: gap-fillers (primitives NOT covered, ranked by CJPI desc)
 * - Stage 2: adjacency (primitives in same family as covered ones, fill remainder)
 */
export function recommendLayers(input: RecommendationInput): LayerRecommendation[] {
  const limit = input.limit ?? 5;
  const covered = new Set(input.coveredPrimitives.map(normalize));
  const excluded = new Set(input.selectedLayerIds ?? []);

  const allLayers = getAvailableLayers().filter((l) => !excluded.has(l.id));

  // Group layers by primitive (module) for fast lookup
  const byPrimitive = new Map<string, CmpsblLayerDefinition[]>();
  for (const layer of allLayers) {
    const mod = normalize(layer.module);
    if (!byPrimitive.has(mod)) byPrimitive.set(mod, []);
    byPrimitive.get(mod)!.push(layer);
  }
  // Sort each bucket by CJPI desc for deterministic top-pick
  byPrimitive.forEach((list) => list.sort((a, b) => b.cjpi - a.cjpi));

  const picked: LayerRecommendation[] = [];
  const usedLayerIds = new Set<string>();

  // ── Stage 1: gap-fillers ───────────────────────────────────────────────
  // Walk primitives in canonical order, pick top-CJPI layer for each gap.
  const gapPrimitives = CANONICAL_PRIMITIVES.filter((p) => !covered.has(normalize(p)));
  // Sort gaps by max-CJPI of their best available layer (highest impact first)
  gapPrimitives
    .map((p) => ({ p, best: byPrimitive.get(normalize(p))?.[0] }))
    .filter((x): x is { p: string; best: CmpsblLayerDefinition } => !!x.best)
    .sort((a, b) => b.best.cjpi - a.best.cjpi)
    .forEach(({ p, best }) => {
      if (picked.length >= limit) return;
      if (usedLayerIds.has(best.id)) return;
      picked.push({
        layer: best,
        reason: 'gap',
        driverPrimitive: p,
        rationale: `Fills uncovered ${p} primitive — adds ${best.name.toLowerCase()} to your artifact.`,
      });
      usedLayerIds.add(best.id);
    });

  if (picked.length >= limit) return picked.slice(0, limit);

  // ── Stage 2: adjacency ─────────────────────────────────────────────────
  // For each covered primitive, suggest top-CJPI layer from the same family
  // whose primitive isn't already covered or already recommended.
  const recommendedPrimitives = new Set(picked.map((r) => normalize(r.driverPrimitive)));
  const adjacencyCandidates: LayerRecommendation[] = [];

  for (const cov of covered) {
    const fam = familyOf(cov);
    if (!fam) continue;
    const peers = FAMILIES[fam] as readonly string[];
    for (const peer of peers) {
      const peerKey = normalize(peer);
      if (covered.has(peerKey) || recommendedPrimitives.has(peerKey)) continue;
      const layers = byPrimitive.get(peerKey);
      if (!layers || layers.length === 0) continue;
      const best = layers[0];
      if (usedLayerIds.has(best.id)) continue;
      adjacencyCandidates.push({
        layer: best,
        reason: 'adjacency',
        driverPrimitive: peer,
        rationale: `Pairs with covered ${cov} (same ${fam.toLowerCase()} family).`,
      });
      usedLayerIds.add(best.id);
      recommendedPrimitives.add(peerKey);
    }
  }

  // Sort adjacency picks by CJPI desc, append until limit
  adjacencyCandidates
    .sort((a, b) => b.layer.cjpi - a.layer.cjpi)
    .forEach((r) => { if (picked.length < limit) picked.push(r); });

  return picked.slice(0, limit);
}
