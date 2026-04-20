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
import { INVENTORY_LAYERS } from '@/lib/export/layers/inventory';
import {
  ORGANS, LAYERS, ENGINES, AGENTS, CANONICAL_PRIMITIVES,
} from '@/lib/ascension-v2/canonical-primitives';
import { TIER_ORDER, type LayerTier } from '@/lib/ascension-v2/tier-layers';

/** Set of layer IDs that come from the /store inventory (purchase per-SKU). */
const STORE_LAYER_IDS: ReadonlySet<string> = new Set(
  INVENTORY_LAYERS.map((l) => l.id),
);

/** True if a layer is sold individually in /store (vs. tier-included or free core). */
export function isStoreLayer(layerId: string): boolean {
  return STORE_LAYER_IDS.has(layerId);
}

/**
 * Bundle-discount tier for a co-purchased set of store layers.
 * Mirrors the prior bundle ladder but only ever applies inside one source
 * (store). Tier-included layers never carry a discount.
 */
export function storeBundleDiscountPercent(count: number): number {
  if (count >= 5) return 20;
  if (count === 4) return 15;
  if (count === 3) return 10;
  return 0;
}

export interface StoreBundleSummary {
  /** Store layer IDs included in the bundle */
  layerIds: string[];
  /** Sum of individual layer.priceCents */
  subtotalCents: number;
  /** Discount percentage (0 if <3 layers) */
  discountPercent: number;
  /** Final price after discount */
  totalCents: number;
  /** Savings in cents */
  savingsCents: number;
}

/**
 * Compute a single, opt-in bundle summary for the store layers in a
 * recommendation set. Caller decides whether to surface it (UX rule:
 * only show when count ≥ 3 so the discount is real).
 */
export function summarizeStoreBundle(
  layers: CmpsblLayerDefinition[],
): StoreBundleSummary {
  const storeLayers = layers.filter((l) => STORE_LAYER_IDS.has(l.id));
  const subtotalCents = storeLayers.reduce((s, l) => s + l.priceCents, 0);
  const discountPercent = storeBundleDiscountPercent(storeLayers.length);
  const savingsCents = Math.round((subtotalCents * discountPercent) / 100);
  return {
    layerIds: storeLayers.map((l) => l.id),
    subtotalCents,
    discountPercent,
    totalCents: subtotalCents - savingsCents,
    savingsCents,
  };
}

export type RecoReason = 'gap' | 'adjacency';

export interface LayerRecommendation {
  layer: CmpsblLayerDefinition;
  reason: RecoReason;
  /** Primitive that drove the recommendation */
  driverPrimitive: string;
  /** One-liner explaining why this layer was picked */
  rationale: string;
  /**
   * Set when the caller passed `userTier` and this layer requires a higher
   * plan than the viewer currently has. UI uses this to render a soft
   * upgrade chip instead of a free "Add" toggle.
   */
  upgradeRequired?: LayerTier;
}

export interface RecommendationInput {
  /** Primitives the run already covered (uppercase canonical names) */
  coveredPrimitives: string[];
  /** Layer IDs the user has already selected — never recommend these again */
  selectedLayerIds?: string[];
  /** Max recommendations to return (default 5) */
  limit?: number;
  /**
   * The viewer's current tier. When provided, the recommender prioritizes
   * layers the user can attach RIGHT NOW (tier-included) before surfacing
   * upgrade-gated layers — so Free users always see a "win first, upgrade
   * later" mix instead of an all-paywall list.
   */
  userTier?: LayerTier;
}

/**
 * Build a one-time index from layer-name → required tier, sourced from
 * TIER_LAYERS (the single source of truth for unlock rules).
 */
import { TIER_LAYERS } from '@/lib/ascension-v2/tier-layers';
const NAME_TO_REQUIRED_TIER: ReadonlyMap<string, LayerTier> = (() => {
  const m = new Map<string, LayerTier>();
  for (const tier of ['builder', 'studio', 'creator', 'architect'] as const) {
    for (const entry of TIER_LAYERS[tier]) {
      m.set(entry.name.toLowerCase(), tier);
    }
  }
  return m;
})();

/** Required tier for a layer, or null if not in the launch-layer ladder. */
function requiredTierForLayer(layer: CmpsblLayerDefinition): LayerTier | null {
  return NAME_TO_REQUIRED_TIER.get(layer.name.toLowerCase()) ?? null;
}

/**
 * Returns true if a layer is unlocked for `tier`. Store layers (per-SKU
 * purchase) and core/baseline layers not in the launch ladder are treated
 * as attachable so we never gate something the user already owns.
 */
function isLayerAttachableForTier(layer: CmpsblLayerDefinition, tier: LayerTier): boolean {
  if (STORE_LAYER_IDS.has(layer.id)) return true;
  const required = requiredTierForLayer(layer);
  if (!required) return true; // not in the launch ladder = baseline / always-on
  if (required === 'enterprise') return tier === 'enterprise';
  return TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(required);
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

  // ── Pre-run mode: no covered primitives means we have no real signal.
  // Surface top-CJPI layers across all primitives instead of labeling
  // everything as a "gap" (which is technically true but misleading UX).
  if (covered.size === 0) {
    const ranked = allLayers.slice().sort((a, b) => b.cjpi - a.cjpi);
    const seenPrimitive = new Set<string>();
    for (const layer of ranked) {
      if (picked.length >= limit) break;
      const prim = normalize(layer.module);
      if (seenPrimitive.has(prim)) continue;
      seenPrimitive.add(prim);
      picked.push({
        layer,
        reason: 'adjacency',
        driverPrimitive: layer.module,
        rationale: `Top-impact ${layer.module} layer — adds ${layer.name.toLowerCase()} to your artifact.`,
      });
      usedLayerIds.add(layer.id);
    }
    return applyTierOrdering(picked, input.userTier).slice(0, limit);
  }

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

  return applyTierOrdering(picked, input.userTier).slice(0, limit);
}

/**
 * Reorder picks so layers attachable-now (per the viewer's tier) appear
 * first, with locked ones annotated via `upgradeRequired`. Pre-run mode
 * also calls this so Free users always see attachable wins on top.
 */
function applyTierOrdering(
  picks: LayerRecommendation[],
  userTier: LayerTier | undefined,
): LayerRecommendation[] {
  if (!userTier) return picks;
  const annotated = picks.map((r) => {
    if (isLayerAttachableForTier(r.layer, userTier)) return r;
    const required = requiredTierForLayer(r.layer);
    return required ? { ...r, upgradeRequired: required } : r;
  });
  const attachable = annotated.filter((r) => !r.upgradeRequired);
  const gated = annotated.filter((r) => r.upgradeRequired);
  return [...attachable, ...gated];
}
