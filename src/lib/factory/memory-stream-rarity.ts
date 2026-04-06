/**
 * CMPSBL® — Dynamic Rarity Weighting for Memory Stream
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Computes pull weights based on the actual distribution of CJPI
 * scores in the Memory Stream pool, persists them to memory_stream_config,
 * and provides a weighted pull function.
 *
 * Pool: discoveries WHERE status IN ('showroom','discovered')
 *       AND is_crown_jewel = false.
 * Registry items and Crown Jewels are NEVER in the Memory Stream pool.
 *
 * Recomputed every CDM cycle so weights stay current as the pool evolves.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// §1 — TIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export interface RarityTier {
  label: string;
  cjpiMin: number;
  cjpiMax: number;
  targetWeight: number; // Target percentage of pulls (0-100)
}

/** Canonical tier definitions with target rarity weights */
export const RARITY_TIERS: RarityTier[] = [
  { label: 'common',    cjpiMin: 68,  cjpiMax: 75,  targetWeight: 40 },
  { label: 'uncommon',  cjpiMin: 76,  cjpiMax: 82,  targetWeight: 25 },
  { label: 'rare',      cjpiMin: 83,  cjpiMax: 89,  targetWeight: 15 },
  { label: 'epic',      cjpiMin: 90,  cjpiMax: 94,  targetWeight: 10 },
  { label: 'legendary', cjpiMin: 95,  cjpiMax: 99,  targetWeight: 8 },
  { label: 'apex',      cjpiMin: 100, cjpiMax: 100, targetWeight: 2 },
];

// ═══════════════════════════════════════════════════════════════
// §2 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface ComputedWeight {
  label: string;
  cjpiMin: number;
  cjpiMax: number;
  targetWeight: number;
  computedWeight: number;
  itemCount: number;
}

export interface RarityWeightResult {
  vertical: string;
  tiers: ComputedWeight[];
  totalPoolSize: number;
  computedAt: string;
}

export interface MemoryStreamPull {
  id: string;
  name: string;
  description: string;
  cjpi: number;
  tier: string;
  vertical: string;
  moduleChain: string[];
  category: string;
}

// ═══════════════════════════════════════════════════════════════
// §3 — WEIGHT COMPUTATION
// ═══════════════════════════════════════════════════════════════

/**
 * Query the discoveries table and compute pull weights based on
 * the actual distribution of CJPI scores in the Memory Stream pool.
 *
 * If a tier has zero items, its weight is redistributed proportionally
 * to tiers that DO have items.
 */
export async function computeRarityWeights(
  vertical: string,
): Promise<RarityWeightResult> {
  // Count items per tier for this vertical's pool
  const tierCounts = await Promise.all(
    RARITY_TIERS.map(async (tier) => {
      const { count, error } = await supabase
        .from('discoveries')
        .select('*', { count: 'exact', head: true })
        .in('status', ['showroom', 'discovered'])
        .eq('is_crown_jewel', false)
        .eq('vertical', vertical)
        .gte('cjpi', tier.cjpiMin)
        .lte('cjpi', tier.cjpiMax);

      return {
        ...tier,
        itemCount: error ? 0 : (count ?? 0),
      };
    }),
  );

  const totalPoolSize = tierCounts.reduce((s, t) => s + t.itemCount, 0);

  // Redistribute weights from empty tiers to populated tiers
  const populated = tierCounts.filter(t => t.itemCount > 0);
  const emptyWeight = tierCounts
    .filter(t => t.itemCount === 0)
    .reduce((s, t) => s + t.targetWeight, 0);

  const populatedTotalTarget = populated.reduce((s, t) => s + t.targetWeight, 0);

  const tiers: ComputedWeight[] = tierCounts.map(t => {
    if (t.itemCount === 0) {
      return {
        label: t.label,
        cjpiMin: t.cjpiMin,
        cjpiMax: t.cjpiMax,
        targetWeight: t.targetWeight,
        computedWeight: 0,
        itemCount: 0,
      };
    }

    // This tier's share of redistributed weight
    const redistributed = populatedTotalTarget > 0
      ? (t.targetWeight / populatedTotalTarget) * emptyWeight
      : 0;

    return {
      label: t.label,
      cjpiMin: t.cjpiMin,
      cjpiMax: t.cjpiMax,
      targetWeight: t.targetWeight,
      computedWeight: Math.round((t.targetWeight + redistributed) * 100) / 100,
      itemCount: t.itemCount,
    };
  });

  return {
    vertical,
    tiers,
    totalPoolSize,
    computedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// §4 — WEIGHTED PULL
// ═══════════════════════════════════════════════════════════════

/**
 * Pull one discovery from the Memory Stream using dynamic rarity weights.
 *
 * 1. Compute (or read cached) weights for the vertical.
 * 2. Roll a weighted random tier selection.
 * 3. Fetch a random discovery from that tier.
 * 4. If the tier is empty, fall back to the next tier down.
 */
export async function pullFromMemoryStream(
  vertical: string,
): Promise<MemoryStreamPull | null> {
  const weights = await computeRarityWeights(vertical);

  if (weights.totalPoolSize === 0) return null;

  // Weighted tier selection
  const populated = weights.tiers.filter(t => t.computedWeight > 0);
  if (populated.length === 0) return null;

  const totalWeight = populated.reduce((s, t) => s + t.computedWeight, 0);
  let roll = Math.random() * totalWeight;
  let selectedTier: ComputedWeight | null = null;

  for (const tier of populated) {
    roll -= tier.computedWeight;
    if (roll <= 0) {
      selectedTier = tier;
      break;
    }
  }

  // Safety fallback
  if (!selectedTier) selectedTier = populated[populated.length - 1];

  // Try to pull from the selected tier, fall back to next tier down
  const tiersToTry = [
    selectedTier,
    ...populated.filter(t => t.label !== selectedTier!.label).reverse(),
  ];

  for (const tier of tiersToTry) {
    const { data, error } = await supabase
      .from('discoveries')
      .select('id, name, description, cjpi, vertical, module_chain, category')
      .in('status', ['showroom', 'discovered'])
      .eq('is_crown_jewel', false)
      .eq('vertical', vertical)
      .gte('cjpi', tier.cjpiMin)
      .lte('cjpi', tier.cjpiMax)
      .limit(50);

    if (error || !data || data.length === 0) continue;

    // Random selection from results
    const pick = data[Math.floor(Math.random() * data.length)];
    return {
      id: pick.id,
      name: pick.name,
      description: pick.description ?? '',
      cjpi: pick.cjpi,
      tier: tier.label,
      vertical: pick.vertical,
      moduleChain: Array.isArray(pick.module_chain) ? pick.module_chain : [],
      category: pick.category ?? 'general',
    };
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// §5 — PERSISTENCE
// ═══════════════════════════════════════════════════════════════

const ALL_VERTICALS = [
  'primary', 'cyber', 'robotics', 'llm', 'quantum', 'agency', 'media', 'ultimate',
];

/**
 * Recompute rarity weights for ALL verticals and persist to
 * memory_stream_config. Called each CDM cycle after the mutation engine.
 */
export async function recomputeMemoryStreamWeights(): Promise<{
  verticals: number;
  totalPoolSize: number;
  durationMs: number;
}> {
  const start = Date.now();
  let totalPoolSize = 0;

  for (const vertical of ALL_VERTICALS) {
    const result = await computeRarityWeights(vertical);
    totalPoolSize += result.totalPoolSize;

    // Upsert each tier into memory_stream_config
    const rows = result.tiers.map(t => ({
      vertical,
      tier_label: t.label,
      cjpi_min: t.cjpiMin,
      cjpi_max: t.cjpiMax,
      target_weight: t.targetWeight,
      computed_weight: t.computedWeight,
      item_count: t.itemCount,
      updated_at: result.computedAt,
    }));

    await supabase
      .from('memory_stream_config')
      .upsert(rows as never[], { onConflict: 'vertical,tier_label' });
  }

  return {
    verticals: ALL_VERTICALS.length,
    totalPoolSize,
    durationMs: Date.now() - start,
  };
}

/**
 * Read the persisted weights for a given vertical.
 * Returns null if no weights have been computed yet.
 */
export async function getPersistedWeights(
  vertical: string,
): Promise<ComputedWeight[] | null> {
  const { data, error } = await supabase
    .from('memory_stream_config')
    .select('tier_label, cjpi_min, cjpi_max, target_weight, computed_weight, item_count')
    .eq('vertical', vertical)
    .order('cjpi_min', { ascending: true });

  if (error || !data || data.length === 0) return null;

  return data.map(row => ({
    label: row.tier_label,
    cjpiMin: row.cjpi_min,
    cjpiMax: row.cjpi_max,
    targetWeight: Number(row.target_weight),
    computedWeight: Number(row.computed_weight),
    itemCount: row.item_count,
  }));
}
