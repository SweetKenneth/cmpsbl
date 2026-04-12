/**
 * COMPILER™ Auto-Scoring Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Scores compiled products on 3 axes:
 *   Rarity      — How uncommon is this primitive combination?
 *   Uniqueness  — How different from existing compilations?
 *   Usefulness  — Dimension coverage + component quality
 *
 * Products scoring ≥ 60 auto-approve → ECONOMY prices → Marketplace rotation.
 * The scoring model improves with each compilation via feedback integration.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import { calculateMarketplacePrice, generateSlug } from '@/agents/merchant/merchant-engine';

// ═══════════════════════════════════════════════════════════════
// §1 — SCORING THRESHOLDS
// ═══════════════════════════════════════════════════════════════

/** Auto-approve threshold — products at or above skip governor review */
const AUTO_APPROVE_THRESHOLD = 60;

/** Minimum score to even list (below = rejected automatically) */
const MINIMUM_VIABLE_SCORE = 35;

/** Forge price range: $50–$99 */
const FORGE_FLOOR_CENTS = 5000;
const FORGE_CEILING_CENTS = 9900;

// ═══════════════════════════════════════════════════════════════
// §2 — RARITY SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Score how rare a primitive combination is.
 * Rare = primitives that appear infrequently across all compiled products.
 */
export async function scoreRarity(combinedChain: string[]): Promise<number> {
  // Fetch all existing compiled chains
  const { data } = await supabase
    .from('compiled_products')
    .select('combined_chain')
    .in('status', ['approved', 'listed', 'pending']);

  if (!data || data.length === 0) return 85; // first compilation = high rarity

  // Count frequency of each primitive across all compilations
  const freq = new Map<string, number>();
  let totalChains = 0;

  for (const row of data) {
    const chain = (row.combined_chain ?? []) as string[];
    totalChains++;
    const seen = new Set<string>();
    for (const p of chain) {
      const key = p.toUpperCase();
      if (!seen.has(key)) {
        freq.set(key, (freq.get(key) ?? 0) + 1);
        seen.add(key);
      }
    }
  }

  // Score: average inverse frequency of this chain's primitives
  const upper = combinedChain.map(p => p.toUpperCase());
  let raritySum = 0;

  for (const p of upper) {
    const appearances = freq.get(p) ?? 0;
    // Inverse frequency: never seen = 100, seen in every chain = 10
    const inverseFreq = 100 - Math.min(90, (appearances / Math.max(1, totalChains)) * 100);
    raritySum += inverseFreq;
  }

  return Math.round(raritySum / Math.max(1, upper.length));
}

// ═══════════════════════════════════════════════════════════════
// §3 — UNIQUENESS SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Score how different this compilation is from existing ones.
 * Uses Jaccard distance against all approved/listed compilations.
 */
export async function scoreUniqueness(combinedChain: string[]): Promise<number> {
  const { data } = await supabase
    .from('compiled_products')
    .select('combined_chain')
    .in('status', ['approved', 'listed']);

  if (!data || data.length === 0) return 95; // first = maximally unique

  const thisSet = new Set(combinedChain.map(p => p.toUpperCase()));
  let maxSimilarity = 0;

  for (const row of data) {
    const otherChain = (row.combined_chain ?? []) as string[];
    const otherSet = new Set(otherChain.map(p => p.toUpperCase()));

    // Jaccard similarity
    let intersection = 0;
    for (const p of thisSet) {
      if (otherSet.has(p)) intersection++;
    }
    const union = new Set([...thisSet, ...otherSet]).size;
    const similarity = union > 0 ? intersection / union : 0;

    if (similarity > maxSimilarity) maxSimilarity = similarity;
  }

  // Convert: 0% similar = 100 uniqueness, 100% similar = 0
  return Math.round((1 - maxSimilarity) * 100);
}

// ═══════════════════════════════════════════════════════════════
// §4 — USEFULNESS SCORING
// ═══════════════════════════════════════════════════════════════

/** Capability dimensions a product should cover */
const USEFULNESS_DIMENSIONS: Record<string, string[]> = {
  detection:     ['BEACON', 'RECON', 'WATCHTOWER', 'LIDAR', 'INSPECTOR', 'TRACER', 'MEASURE'],
  response:      ['REFLEX', 'DEFENSE', 'IMMUNITY', 'BASTION', 'AEGIS', 'IRONCLAD', 'CITADEL'],
  governance:    ['GOVERNANCE', 'TREATY', 'SOVEREIGN', 'AUDIT', 'WARDEN', 'MANDATE'],
  memory:        ['MEMORY', 'BRAIN', 'CORTEX', 'DREAM', 'ANCHOR', 'ARCHIVE'],
  output:        ['RELAY', 'NEXUS', 'ECHO', 'BROADCAST', 'HERALD', 'ENVOY', 'UPLINK'],
  synthesis:     ['FORGE', 'HARVEST', 'EVOLUTION', 'FABRICATOR', 'ENGINEER', 'SANDBOX'],
  identity:      ['IDENTITY', 'ACCESS', 'ENCODE', 'DECODE', 'CIPHER', 'SHADOW'],
  intelligence:  ['ORACLE', 'REASON', 'INTENT', 'COMPASS', 'ATLAS', 'VERITAS', 'SKEPTIC'],
};

/**
 * Score how useful a compiled product is based on:
 * - Dimension coverage (breadth)
 * - Component CJPI quality (depth)
 * - Chain length (complexity = more value)
 */
export function scoreUsefulness(
  combinedChain: string[],
  coherenceScore: number,
  compatibilityScore: number,
  componentCount: number,
): number {
  const upper = new Set(combinedChain.map(p => p.toUpperCase()));

  // Dimension coverage: 0-8 dims → 0-40 pts
  let coveredDims = 0;
  for (const prims of Object.values(USEFULNESS_DIMENSIONS)) {
    if (prims.some(p => upper.has(p))) coveredDims++;
  }
  const dimScore = (coveredDims / 8) * 40;

  // Coherence contribution: 0-30 pts
  const coherenceContrib = (coherenceScore / 100) * 30;

  // Complexity bonus: 5-10 components → 0-15 pts
  const complexityBonus = Math.min(15, (Math.max(0, componentCount - 4) / 6) * 15);

  // Chain richness: more unique primitives = better → 0-15 pts
  const chainRichness = Math.min(15, (upper.size / 20) * 15);

  return Math.round(dimScore + coherenceContrib + complexityBonus + chainRichness);
}

// ═══════════════════════════════════════════════════════════════
// §5 — COMPOSITE AUTO-SCORE
// ═══════════════════════════════════════════════════════════════

export interface AutoScoreResult {
  rarity: number;
  uniqueness: number;
  usefulness: number;
  composite: number;
  autoApproved: boolean;
  autoRejected: boolean;
  priceCents: number;
}

/**
 * Compute the full auto-score for a compiled product.
 * Weights: Usefulness 45%, Rarity 30%, Uniqueness 25%
 */
export async function computeAutoScore(
  combinedChain: string[],
  coherenceScore: number,
  compatibilityScore: number,
  componentCount: number,
): Promise<AutoScoreResult> {
  const [rarity, uniqueness] = await Promise.all([
    scoreRarity(combinedChain),
    scoreUniqueness(combinedChain),
  ]);

  const usefulness = scoreUsefulness(
    combinedChain,
    coherenceScore,
    compatibilityScore,
    componentCount,
  );

  // Weighted composite: usefulness matters most
  const composite = Math.round(
    usefulness * 0.45 +
    rarity * 0.30 +
    uniqueness * 0.25
  );

  // ECONOMY pricing: map auto_score 60-100 → $50-$99
  const normalizedScore = Math.max(0, Math.min(1, (composite - 60) / 40));
  const priceCents = Math.round(
    (FORGE_FLOOR_CENTS + normalizedScore * (FORGE_CEILING_CENTS - FORGE_FLOOR_CENTS)) / 100
  ) * 100;

  return {
    rarity,
    uniqueness,
    usefulness,
    composite,
    autoApproved: composite >= AUTO_APPROVE_THRESHOLD,
    autoRejected: composite < MINIMUM_VIABLE_SCORE,
    priceCents: Math.max(FORGE_FLOOR_CENTS, priceCents),
  };
}

// ═══════════════════════════════════════════════════════════════
// §6 — AUTO-MODE CYCLE
// ═══════════════════════════════════════════════════════════════

/**
 * Score all pending compiled products and auto-approve/reject.
 * Returns count of products listed to marketplace.
 */
export async function runAutoScoreCycle(): Promise<{
  scored: number;
  approved: number;
  rejected: number;
  listed: number;
}> {
  const { data: pending } = await supabase
    .from('compiled_products')
    .select('*')
    .eq('status', 'pending');

  if (!pending || pending.length === 0) {
    return { scored: 0, approved: 0, rejected: 0, listed: 0 };
  }

  let approved = 0;
  let rejected = 0;
  let listed = 0;

  for (const product of pending) {
    const chain = (product.combined_chain ?? []) as string[];
    const result = await computeAutoScore(
      chain,
      product.coherence_score ?? 0,
      product.compatibility_score ?? 0,
      product.component_count ?? 0,
    );

    const slug = generateSlug(product.name) + '-' + product.id.slice(0, 8);
    const now = new Date().toISOString();

    if (result.autoRejected) {
      // Below minimum — reject silently
      await supabase.from('compiled_products').update({
        status: 'rejected',
        rarity_score: result.rarity,
        uniqueness_score: result.uniqueness,
        usefulness_score: result.usefulness,
        auto_score: result.composite,
        rating: result.composite / 10, // normalize to 0-10 scale
        notes: `Auto-rejected: score ${result.composite} below threshold ${MINIMUM_VIABLE_SCORE}`,
        rated_at: now,
        updated_at: now,
      }).eq('id', product.id);

      rejected++;
    } else if (result.autoApproved) {
      // Score high enough — approve and list directly
      await supabase.from('compiled_products').update({
        status: 'listed',
        rarity_score: result.rarity,
        uniqueness_score: result.uniqueness,
        usefulness_score: result.usefulness,
        auto_score: result.composite,
        marketplace_price_cents: result.priceCents,
        marketplace_slug: slug,
        marketplace_listed_at: now,
        rotation_priority: result.composite, // higher score = higher rotation priority
        rating: result.composite / 10,
        notes: `Auto-approved: score ${result.composite} (R:${result.rarity} U:${result.uniqueness} F:${result.usefulness})`,
        rated_at: now,
        updated_at: now,
      }).eq('id', product.id);

      // Write feedback record for the learning loop
      await supabase.from('compiler_feedback').insert({
        compilation_id: product.id,
        rating: Math.round(result.composite / 10),
        notes: `Auto-scored: ${result.composite}`,
        discovery_ids: product.discovery_ids ?? [],
        combined_chain: chain,
        coherence_score: product.coherence_score ?? 0,
        compatibility_score: product.compatibility_score ?? 0,
      });

      approved++;
      listed++;
    } else {
      // Mid-range — approve but hold for rotation
      await supabase.from('compiled_products').update({
        status: 'approved',
        rarity_score: result.rarity,
        uniqueness_score: result.uniqueness,
        usefulness_score: result.usefulness,
        auto_score: result.composite,
        marketplace_price_cents: result.priceCents,
        marketplace_slug: slug,
        rotation_priority: result.composite,
        rating: result.composite / 10,
        notes: `Auto-scored: ${result.composite} (below auto-list threshold, queued for rotation)`,
        rated_at: now,
        updated_at: now,
      }).eq('id', product.id);

      approved++;
    }
  }

  return { scored: pending.length, approved, rejected, listed };
}

// ═══════════════════════════════════════════════════════════════
// §7 — MARKETPLACE ROTATION
// ═══════════════════════════════════════════════════════════════

/** Max Forge items active in marketplace at once */
const MAX_ACTIVE_FORGE_ITEMS = 20;

/**
 * Rotate compiled products through the marketplace.
 * Highest auto_score products get listed first.
 * Products that have been listed longest get cycled out if new ones are better.
 */
export async function rotateMarketplaceListings(): Promise<{
  promoted: number;
  cycledOut: number;
}> {
  // Get currently listed Forge products
  const { data: currentlyListed } = await supabase
    .from('compiled_products')
    .select('id, auto_score, marketplace_listed_at')
    .eq('status', 'listed')
    .order('auto_score', { ascending: false });

  // Get approved but not yet listed (queued)
  const { data: queued } = await supabase
    .from('compiled_products')
    .select('id, auto_score, marketplace_slug')
    .eq('status', 'approved')
    .gt('auto_score', MINIMUM_VIABLE_SCORE)
    .order('auto_score', { ascending: false });

  const listed = currentlyListed ?? [];
  const waiting = queued ?? [];

  if (waiting.length === 0) return { promoted: 0, cycledOut: 0 };

  let promoted = 0;
  let cycledOut = 0;
  const now = new Date().toISOString();

  // If under capacity, promote top queued items
  const openSlots = MAX_ACTIVE_FORGE_ITEMS - listed.length;
  if (openSlots > 0) {
    const toPromote = waiting.slice(0, openSlots);
    for (const item of toPromote) {
      await supabase.from('compiled_products').update({
        status: 'listed',
        marketplace_listed_at: now,
        updated_at: now,
      }).eq('id', item.id);
      promoted++;
    }
  }

  // If at capacity, check if any queued items outscore the weakest listed
  if (listed.length >= MAX_ACTIVE_FORGE_ITEMS && waiting.length > 0) {
    const weakest = [...listed].sort((a, b) => (a.auto_score ?? 0) - (b.auto_score ?? 0));
    const strongestWaiting = waiting[0];

    for (const weak of weakest) {
      if ((strongestWaiting.auto_score ?? 0) > (weak.auto_score ?? 0) + 5) {
        // Cycle out the weaker one
        await supabase.from('compiled_products').update({
          status: 'approved', // back to approved pool
          updated_at: now,
        }).eq('id', weak.id);

        await supabase.from('compiled_products').update({
          status: 'listed',
          marketplace_listed_at: now,
          updated_at: now,
        }).eq('id', strongestWaiting.id);

        promoted++;
        cycledOut++;
        break; // one swap per cycle to prevent thrashing
      }
    }
  }

  return { promoted, cycledOut };
}

// ═══════════════════════════════════════════════════════════════
// §8 — RETROACTIVE SCORING (for existing products)
// ═══════════════════════════════════════════════════════════════

/**
 * Score all existing compiled products that haven't been auto-scored yet.
 * This backfills the rarity/uniqueness/usefulness scores and
 * auto-approves + lists eligible ones.
 */
export async function retroactivelyScoreExisting(): Promise<{
  total: number;
  listed: number;
  rejected: number;
}> {
  const { data } = await supabase
    .from('compiled_products')
    .select('*')
    .or('auto_score.eq.0,auto_score.is.null');

  if (!data || data.length === 0) {
    return { total: 0, listed: 0, rejected: 0 };
  }

  let listed = 0;
  let rejected = 0;

  for (const product of data) {
    const chain = (product.combined_chain ?? []) as string[];
    const result = await computeAutoScore(
      chain,
      product.coherence_score ?? 0,
      product.compatibility_score ?? 0,
      product.component_count ?? 0,
    );

    const slug = generateSlug(product.name) + '-' + product.id.slice(0, 8);
    const now = new Date().toISOString();

    if (result.autoRejected) {
      await supabase.from('compiled_products').update({
        status: 'rejected',
        rarity_score: result.rarity,
        uniqueness_score: result.uniqueness,
        usefulness_score: result.usefulness,
        auto_score: result.composite,
        marketplace_price_cents: 0,
        notes: `Retroactive auto-reject: score ${result.composite}`,
        rated_at: now,
        updated_at: now,
      }).eq('id', product.id);
      rejected++;
    } else {
      const newStatus = result.autoApproved ? 'listed' : 'approved';
      await supabase.from('compiled_products').update({
        status: newStatus,
        rarity_score: result.rarity,
        uniqueness_score: result.uniqueness,
        usefulness_score: result.usefulness,
        auto_score: result.composite,
        marketplace_price_cents: result.priceCents,
        marketplace_slug: slug,
        marketplace_listed_at: newStatus === 'listed' ? now : null,
        rotation_priority: result.composite,
        rating: result.composite / 10,
        notes: `Retroactive auto-score: ${result.composite} (R:${result.rarity} U:${result.uniqueness} F:${result.usefulness})`,
        rated_at: now,
        updated_at: now,
      }).eq('id', product.id);
      if (newStatus === 'listed') listed++;
    }
  }

  return { total: data.length, listed, rejected };
}
