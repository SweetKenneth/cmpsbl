/**
 * Bundle Suggestions — Sprint 2 (Ascension V2 · final S2 deliverable)
 *
 * Co-attached layer bundles → discounted SKU.
 *
 * Strategy:
 *   1. Group all available layers by their canonical primitive family
 *      (ORGANS / LAYERS / ENGINES / AGENTS).
 *   2. Within each family, pick the top-CJPI layers per primitive (one per
 *      primitive) to form a "Family Pack" of 3–5 layers.
 *   3. Apply a deterministic family discount tier:
 *        3 layers  → 10% off
 *        4 layers  → 15% off
 *        5+ layers → 20% off
 *      (free layers contribute $0 to total; bundles with 100% free layers
 *       are skipped — no SKU to discount.)
 *   4. Never recommend a bundle that is fully covered by `selectedLayerIds`
 *      (i.e. the user already added every layer in it).
 *
 * Pure data-layer, deterministic, no DB / network calls. Used by the
 * Enhance step alongside V2SmartRecommendations.
 *
 * © CMPSBL® · PromptFluid™
 */

import {
  getAvailableLayers,
  type CmpsblLayerDefinition,
} from '@/lib/export/cmpsbl-layers';
import {
  ORGANS,
  LAYERS,
  ENGINES,
  AGENTS,
} from '@/lib/ascension-v2/canonical-primitives';

export type BundleFamily = 'ORGANS' | 'LAYERS' | 'ENGINES' | 'AGENTS';

export interface BundleSku {
  id: string;
  family: BundleFamily;
  /** Display name (e.g. "Engines Family Pack") */
  name: string;
  /** Layers in this bundle (ordered by CJPI desc, deduped by primitive) */
  layers: CmpsblLayerDefinition[];
  /** Sum of individual layer.priceCents (cents) */
  subtotalCents: number;
  /** Discount percentage applied (0–100) */
  discountPercent: number;
  /** Final price (cents) after discount */
  totalCents: number;
  /** Savings (cents) */
  savingsCents: number;
  /** Average CJPI of bundled layers */
  avgCjpi: number;
  /** Short rationale */
  rationale: string;
}

const FAMILY_LISTS: Record<BundleFamily, readonly string[]> = {
  ORGANS: ORGANS as unknown as string[],
  LAYERS: LAYERS as unknown as string[],
  ENGINES: ENGINES as unknown as string[],
  AGENTS: AGENTS as unknown as string[],
};

const FAMILY_LABELS: Record<BundleFamily, string> = {
  ORGANS: 'Organs Family Pack',
  LAYERS: 'Layers Family Pack',
  ENGINES: 'Engines Family Pack',
  AGENTS: 'Agents Family Pack',
};

/** Discount tier ladder. Deterministic, no rounding surprises. */
function discountTier(layerCount: number): number {
  if (layerCount >= 5) return 20;
  if (layerCount === 4) return 15;
  if (layerCount === 3) return 10;
  return 0;
}

function normalize(p: string): string {
  return p.trim().toUpperCase();
}

export interface BundleInput {
  /** Layer IDs already selected — used to skip fully-covered bundles */
  selectedLayerIds?: string[];
  /** Cap on bundles returned (default = all 4 families that qualify) */
  limit?: number;
}

/**
 * Compute available bundle SKUs across the four canonical families.
 * Returns ordered by total savings desc.
 */
export function suggestBundles(input: BundleInput = {}): BundleSku[] {
  const selected = new Set(input.selectedLayerIds ?? []);
  const all = getAvailableLayers();

  // Index layers by canonical primitive for fast top-CJPI pick per primitive
  const byPrimitive = new Map<string, CmpsblLayerDefinition[]>();
  for (const layer of all) {
    const key = normalize(layer.module);
    if (!byPrimitive.has(key)) byPrimitive.set(key, []);
    byPrimitive.get(key)!.push(layer);
  }
  byPrimitive.forEach((list) => list.sort((a, b) => b.cjpi - a.cjpi));

  const skus: BundleSku[] = [];

  for (const family of Object.keys(FAMILY_LISTS) as BundleFamily[]) {
    const primitives = FAMILY_LISTS[family];

    // Pick top-CJPI layer per primitive in this family (one per primitive)
    const candidates: CmpsblLayerDefinition[] = [];
    for (const prim of primitives) {
      const layers = byPrimitive.get(normalize(prim));
      if (!layers || layers.length === 0) continue;
      candidates.push(layers[0]);
    }

    // Need at least 3 layers to form a bundle
    if (candidates.length < 3) continue;

    // Cap bundle at top 5 by CJPI for display sanity
    const ranked = candidates.sort((a, b) => b.cjpi - a.cjpi).slice(0, 5);

    // If user has every layer already selected, skip
    const allSelected = ranked.every((l) => selected.has(l.id));
    if (allSelected) continue;

    const subtotalCents = ranked.reduce((s, l) => s + l.priceCents, 0);
    // No SKU on a fully-free bundle (nothing to discount)
    if (subtotalCents === 0) continue;

    const discountPercent = discountTier(ranked.length);
    const savingsCents = Math.round((subtotalCents * discountPercent) / 100);
    const totalCents = subtotalCents - savingsCents;
    const avgCjpi = Math.round(
      ranked.reduce((s, l) => s + l.cjpi, 0) / ranked.length,
    );

    skus.push({
      id: `bundle-${family.toLowerCase()}`,
      family,
      name: FAMILY_LABELS[family],
      layers: ranked,
      subtotalCents,
      discountPercent,
      totalCents,
      savingsCents,
      avgCjpi,
      rationale: `${ranked.length} top-CJPI ${family.toLowerCase()} layers — ${discountPercent}% off when attached together.`,
    });
  }

  skus.sort((a, b) => b.savingsCents - a.savingsCents);

  return typeof input.limit === 'number' ? skus.slice(0, input.limit) : skus;
}

/** Format cents → $X.XX (USD), no trailing-zero shenanigans. */
export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}`;
}
