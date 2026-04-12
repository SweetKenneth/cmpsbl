/**
 * CMPSBL® Autonomous Product Compiler
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Reads discoveries from the vault, identifies groups of 5-10 whose
 * primitive chains are compatible, and compiles them into software suites.
 *
 * AUTO-MODE (v2.0): No governor review needed. Products are auto-scored
 * on rarity, uniqueness, and usefulness — then priced by ECONOMY and
 * rotated through the Marketplace autonomously.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// §1 — PRIMITIVE AFFINITY MAP (shared with mutation engine)
// ═══════════════════════════════════════════════════════════════

const PRIMITIVE_AFFINITIES: Record<string, string[]> = {
  CORE: ['SYSTEM', 'BRAIN', 'NERVE'],
  SYSTEM: ['CORE', 'INTEGRATION', 'ATLAS'],
  BRAIN: ['CORTEX', 'MEMORY', 'CONSCIENCE'],
  MEMORY: ['BRAIN', 'ANCHOR', 'ARCHIVE'],
  NERVE: ['RELAY', 'REFLEX', 'CORE'],
  NEXUS: ['RELAY', 'INTEGRATION', 'CORE'],
  IDENTITY: ['SOVEREIGN', 'ACCESS', 'CONSCIENCE'],
  SOVEREIGN: ['IDENTITY', 'GOVERNANCE', 'TREATY'],
  ATLAS: ['COMPASS', 'SYSTEM', 'INTEGRATION'],
  MEDIC: ['BEACON', 'INSPECTOR', 'SYSTEM'],
  RELAY: ['NERVE', 'NEXUS', 'UPLINK'],
  CONSCIENCE: ['BRAIN', 'GOVERNANCE', 'IDENTITY'],
  DEFENSE: ['IMMUNITY', 'BASTION', 'AEGIS'],
  IMMUNITY: ['DEFENSE', 'IRONCLAD', 'CITADEL'],
  GOVERNANCE: ['TREATY', 'SOVEREIGN', 'WARDEN'],
  TREATY: ['GOVERNANCE', 'DIPLOMAT', 'SOVEREIGN'],
  EVOLUTION: ['FORGE', 'DREAM', 'REFLEX'],
  REFLEX: ['NERVE', 'EVOLUTION', 'COMPASS'],
  COMPASS: ['ATLAS', 'REFLEX', 'INTENT'],
  INTEGRATION: ['SYSTEM', 'NEXUS', 'ATLAS'],
  INTENT: ['COMPASS', 'BRAIN', 'REASON'],
  ACCESS: ['IDENTITY', 'SOVEREIGN', 'CITADEL'],
  BEACON: ['MEDIC', 'INSPECTOR', 'WATCHTOWER'],
  SHADOW: ['PHANTOM', 'SHADE', 'SPECTER'],
  DREAM: ['PHANTOM', 'EVOLUTION', 'HARVEST'],
  HARVEST: ['DREAM', 'FORGE', 'RECON'],
  FORGE: ['EVOLUTION', 'FABRICATOR', 'HARVEST'],
  LINGUA: ['LEXICON', 'CLARITY', 'ECHO'],
  ECHO: ['LINGUA', 'VOICE', 'RELAY'],
  PHANTOM: ['SHADOW', 'DREAM', 'SPECTER'],
  SANDBOX: ['SIMULATE', 'FORGE', 'PIONEER'],
  RIPPLE: ['RELAY', 'ECHO', 'FLUX'],
  ENCODE: ['DECODE', 'CIPHER', 'CORTEX'],
  DECODE: ['ENCODE', 'CORTEX', 'SIEVE'],
  AUDIT: ['WARDEN', 'GOVERNANCE', 'TRACER'],
  ECONOMY: ['INCENTIVE', 'DISPATCH', 'ATLAS'],
  INCLUSIVE: ['CONSCIENCE', 'DIPLOMAT', 'ENVOY'],
  CORTEX: ['BRAIN', 'ENCODE', 'DECODE'],
  ORACLE: ['BRAIN', 'SKEPTIC', 'VERITAS'],
  ENGINEER: ['FABRICATOR', 'FORGE', 'PIONEER'],
};

// ═══════════════════════════════════════════════════════════════
// §2 — CAPABILITY DIMENSIONS (for coherence scoring)
// ═══════════════════════════════════════════════════════════════

const CAPABILITY_DIMENSIONS: Record<string, string[]> = {
  detection:   ['BEACON', 'RECON', 'WATCHTOWER', 'LIDAR', 'INSPECTOR', 'ENVIRON', 'ONYX', 'TRACER', 'MEASURE', 'RECONN'],
  response:    ['REFLEX', 'DEFENSE', 'IMMUNITY', 'BASTION', 'AEGIS', 'IRONCLAD', 'CITADEL', 'VANGUARD', 'RAMPART', 'GAUNTLET'],
  governance:  ['GOVERNANCE', 'TREATY', 'SOVEREIGN', 'AUDIT', 'WARDEN', 'CUSTODIAN', 'TRIBUNAL', 'MANDATE', 'OVERSEER'],
  memory:      ['MEMORY', 'BRAIN', 'CORTEX', 'DREAM', 'ANCHOR', 'SCHOLAR', 'ARCHIVE', 'LINEAGE'],
  output:      ['RELAY', 'NEXUS', 'ECHO', 'BROADCAST', 'HERALD', 'ENVOY', 'UPLINK', 'SCRIBE'],
  synthesis:   ['FORGE', 'HARVEST', 'EVOLUTION', 'FABRICATOR', 'ENGINEER', 'SANDBOX', 'PIONEER', 'TOOLKIT'],
  identity:    ['IDENTITY', 'ACCESS', 'ENCODE', 'DECODE', 'CIPHER', 'SHADE', 'SHADOW', 'PHANTOM'],
  intelligence:['ORACLE', 'REASON', 'INTENT', 'COMPASS', 'ATLAS', 'VERITAS', 'SKEPTIC', 'SYLLOGISM'],
};

// ═══════════════════════════════════════════════════════════════
// §3 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface DiscoveryCandidate {
  id: string;
  name: string;
  description: string;
  cjpi: number;
  module_chain: string[];
  vertical: string;
  tier: string;
  status: string;
}

export interface CompiledProductProposal {
  id?: string;
  vertical: string;
  name: string;
  description: string;
  discoveryIds: string[];
  combinedChain: string[];
  coherenceScore: number;
  compatibilityScore: number;
  estimatedValueCents: number;
  componentCount: number;
}

// ═══════════════════════════════════════════════════════════════
// §4 — COMPATIBILITY SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Learned weights from governor feedback — loaded from DB.
 * Falls back to 1.0 for unweighted pairs.
 */
let learnedWeights = new Map<string, number>();

function makePairKey(a: string, b: string): string {
  return [a, b].sort().join('::');
}

/**
 * Score compatibility between two discoveries.
 * Two discoveries are compatible if their chains share at least one primitive
 * or if primitives in one chain have affinity with primitives in the other.
 */
function scoreCompatibility(chainA: string[], chainB: string[]): number {
  if (chainA.length === 0 || chainB.length === 0) return 0;

  const setA = new Set(chainA.map(p => p.toUpperCase()));
  const setB = new Set(chainB.map(p => p.toUpperCase()));

  // Direct overlap — strongest signal
  let sharedCount = 0;
  for (const p of setA) {
    if (setB.has(p)) sharedCount++;
  }

  // Affinity connections
  let affinityCount = 0;
  for (const pA of setA) {
    const affinities = PRIMITIVE_AFFINITIES[pA] ?? [];
    for (const aff of affinities) {
      if (setB.has(aff)) affinityCount++;
    }
  }

  // Apply learned weights
  let weightBonus = 0;
  let weightCount = 0;
  for (const pA of setA) {
    for (const pB of setB) {
      const key = makePairKey(pA, pB);
      const w = learnedWeights.get(key);
      if (w !== undefined) {
        weightBonus += w - 1.0; // deviation from baseline
        weightCount++;
      }
    }
  }

  const maxPossible = setA.size * setB.size;
  const overlapScore = sharedCount / Math.min(setA.size, setB.size);
  const affinityScore = affinityCount / maxPossible;
  const learnedScore = weightCount > 0 ? weightBonus / weightCount : 0;

  // Weighted combination: overlap matters most, then affinity, then learning
  return Math.min(Math.round((overlapScore * 50 + affinityScore * 35 + learnedScore * 15) * 100) / 100, 100);
}

/**
 * Score average pairwise compatibility for a group of discoveries.
 */
function scoreGroupCompatibility(discoveries: DiscoveryCandidate[]): number {
  if (discoveries.length < 2) return 0;

  let totalScore = 0;
  let pairs = 0;

  for (let i = 0; i < discoveries.length; i++) {
    for (let j = i + 1; j < discoveries.length; j++) {
      totalScore += scoreCompatibility(
        discoveries[i].module_chain ?? [],
        discoveries[j].module_chain ?? []
      );
      pairs++;
    }
  }

  return pairs > 0 ? Math.round((totalScore / pairs) * 100) / 100 : 0;
}

// ═══════════════════════════════════════════════════════════════
// §5 — COHERENCE SCORING
// ═══════════════════════════════════════════════════════════════

/**
 * Score how many capability dimensions a combined chain covers.
 * A compiled product must tell a complete story — not just bundle one thing.
 */
function scoreCoherence(combinedChain: string[]): number {
  const upper = new Set(combinedChain.map(p => p.toUpperCase()));
  let coveredDimensions = 0;
  const totalDimensions = Object.keys(CAPABILITY_DIMENSIONS).length;

  for (const [, primitives] of Object.entries(CAPABILITY_DIMENSIONS)) {
    if (primitives.some(p => upper.has(p))) {
      coveredDimensions++;
    }
  }

  // Require at least 3 dimensions for a viable product
  // Score scales from 0 (1-2 dims) to 100 (all 8)
  if (coveredDimensions < 3) return Math.round((coveredDimensions / 3) * 30);
  return Math.round((coveredDimensions / totalDimensions) * 100);
}

// ═══════════════════════════════════════════════════════════════
// §6 — PRODUCT NAME & DESCRIPTION GENERATION
// ═══════════════════════════════════════════════════════════════

const PRODUCT_PREFIXES = [
  'Sentinel', 'Guardian', 'Shield', 'Forge', 'Cortex', 'Nexus',
  'Beacon', 'Architect', 'Catalyst', 'Vector', 'Prism', 'Vanguard',
  'Atlas', 'Oracle', 'Matrix', 'Citadel', 'Echo', 'Phantom',
  'Sovereign', 'Compass', 'Relay', 'Anchor', 'Frontier', 'Apex',
];

const PRODUCT_SUFFIXES = [
  'Suite', 'Platform', 'Stack', 'Engine', 'Module', 'Core',
  'Pro', 'System', 'Intelligence', 'Defense', 'Framework', 'Kit',
];

function generateProductName(combinedChain: string[], seed: number): string {
  const prefix = PRODUCT_PREFIXES[seed % PRODUCT_PREFIXES.length];
  const suffix = PRODUCT_SUFFIXES[Math.floor(seed / PRODUCT_PREFIXES.length) % PRODUCT_SUFFIXES.length];
  return `${prefix} ${suffix}`;
}

function generateProductDescription(
  discoveries: DiscoveryCandidate[],
  combinedChain: string[],
  coherence: number,
): string {
  const dims = Object.entries(CAPABILITY_DIMENSIONS)
    .filter(([, prims]) => prims.some(p => combinedChain.map(c => c.toUpperCase()).includes(p)))
    .map(([dim]) => dim);

  const count = discoveries.length;
  const topCjpi = Math.max(...discoveries.map(d => d.cjpi ?? 0));

  return `Compiled from ${count} discoveries (peak CJPI: ${topCjpi}). ` +
    `Covers ${dims.length} capability dimensions: ${dims.join(', ')}. ` +
    `${combinedChain.length} unique primitives in the combined chain.`;
}

// ═══════════════════════════════════════════════════════════════
// §7 — PROPOSAL GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * Load learned weights from compiler_weights table.
 */
async function loadLearnedWeights(): Promise<void> {
  const { data } = await supabase
    .from('compiler_weights')
    .select('primitive_pair, weight');

  learnedWeights.clear();
  if (data) {
    for (const row of data) {
      learnedWeights.set(row.primitive_pair, Number(row.weight));
    }
  }
}

/**
 * Fetch discoveries eligible for compilation from a vertical.
 * Uses showroom and discovered status items with CJPI >= 70.
 */
async function fetchCandidates(vertical: string): Promise<DiscoveryCandidate[]> {
  const { data, error } = await supabase
    .from('discoveries')
    .select('id, name, description, cjpi, module_chain, vertical, tier, status')
    .eq('vertical', vertical)
    .in('status', ['showroom', 'discovered', 'registry'])
    .gte('cjpi', 70)
    .order('cjpi', { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data as DiscoveryCandidate[];
}

/**
 * Fetch IDs of proposals already pending review to avoid duplicates.
 */
async function fetchPendingFingerprints(): Promise<Set<string>> {
  const { data } = await supabase
    .from('compiled_products')
    .select('discovery_ids')
    .eq('status', 'pending');

  const prints = new Set<string>();
  if (data) {
    for (const row of data) {
      const sorted = [...(row.discovery_ids ?? [])].sort().join(',');
      prints.add(sorted);
    }
  }
  return prints;
}

/**
 * Simple seeded random for deterministic but varied selection.
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Generate up to maxProposals compiled product proposals for a vertical.
 */
export async function generateProposals(
  vertical: string,
  maxProposals: number = 20,
): Promise<CompiledProductProposal[]> {
  await loadLearnedWeights();

  const candidates = await fetchCandidates(vertical);
  if (candidates.length < 5) return [];

  const pendingFingerprints = await fetchPendingFingerprints();
  const proposals: CompiledProductProposal[] = [];
  const rand = seededRandom(Date.now());
  const usedIds = new Set<string>();

  let attempts = 0;
  const maxAttempts = maxProposals * 10;

  while (proposals.length < maxProposals && attempts < maxAttempts) {
    attempts++;

    // Pick a random group size between 5-10
    const groupSize = 5 + Math.floor(rand() * 6);

    // Pick a seed discovery
    const seedIdx = Math.floor(rand() * candidates.length);
    const seed = candidates[seedIdx];
    if (usedIds.has(seed.id)) continue;

    // Build group by compatibility — greedy approach
    const group: DiscoveryCandidate[] = [seed];
    const groupIds = new Set([seed.id]);

    // Sort remaining by compatibility with the seed
    const scored = candidates
      .filter(c => c.id !== seed.id && !usedIds.has(c.id))
      .map(c => ({
        candidate: c,
        compat: scoreCompatibility(seed.module_chain ?? [], c.module_chain ?? []),
      }))
      .sort((a, b) => b.compat - a.compat);

    for (const { candidate } of scored) {
      if (group.length >= groupSize) break;
      if (groupIds.has(candidate.id)) continue;

      // Check compatibility with existing group members
      const avgCompat = group.reduce(
        (sum, g) => sum + scoreCompatibility(g.module_chain ?? [], candidate.module_chain ?? []),
        0
      ) / group.length;

      if (avgCompat >= 5) { // minimum threshold
        group.push(candidate);
        groupIds.add(candidate.id);
      }
    }

    if (group.length < 5) continue;

    // Check for duplicate proposal
    const fingerprint = [...groupIds].sort().join(',');
    if (pendingFingerprints.has(fingerprint)) continue;

    // Score the group
    const combinedChain = [...new Set(group.flatMap(d => d.module_chain ?? []))];
    const compatibilityScore = scoreGroupCompatibility(group);
    const coherenceScore = scoreCoherence(combinedChain);

    // Skip low-coherence proposals (must cover at least 3 dimensions)
    if (coherenceScore < 30) continue;

    // Estimate value from component CJPIs
    const avgCjpi = group.reduce((s, d) => s + (d.cjpi ?? 0), 0) / group.length;
    const estimatedValueCents = Math.round(avgCjpi * group.length * 100);

    const proposal: CompiledProductProposal = {
      vertical,
      name: generateProductName(combinedChain, Math.floor(rand() * 10000)),
      description: generateProductDescription(group, combinedChain, coherenceScore),
      discoveryIds: [...groupIds],
      combinedChain,
      coherenceScore,
      compatibilityScore,
      estimatedValueCents,
      componentCount: group.length,
    };

    proposals.push(proposal);
    pendingFingerprints.add(fingerprint);

    // Mark IDs as used for this cycle to encourage variety
    for (const id of groupIds) usedIds.add(id);
  }

  return proposals;
}

// ═══════════════════════════════════════════════════════════════
// §8 — PERSISTENCE
// ═══════════════════════════════════════════════════════════════

/**
 * Persist proposals to compiled_products table.
 */
export async function persistProposals(
  proposals: CompiledProductProposal[],
  cycleId?: string,
): Promise<number> {
  if (proposals.length === 0) return 0;

  const rows = proposals.map(p => ({
    vertical: p.vertical,
    name: p.name,
    description: p.description,
    discovery_ids: p.discoveryIds,
    combined_chain: p.combinedChain,
    coherence_score: p.coherenceScore,
    compatibility_score: p.compatibilityScore,
    estimated_value_cents: p.estimatedValueCents,
    component_count: p.componentCount,
    status: 'pending',
    cdm_cycle_id: cycleId ?? `compiler-${Date.now()}`,
  }));

  const { error } = await supabase
    .from('compiled_products')
    .insert(rows);

  if (error) {
    console.warn('[Compiler] Failed to persist proposals:', error.message);
    return 0;
  }

  return rows.length;
}

// ═══════════════════════════════════════════════════════════════
// §9 — RATING & LEARNING LOOP
// ═══════════════════════════════════════════════════════════════

/**
 * Submit a governor rating for a compiled product.
 * Scores below 5 → rejected. Scores 5+ → approved.
 */
export async function rateCompilation(
  compilationId: string,
  rating: number,
  notes?: string,
): Promise<boolean> {
  // Fetch the compilation
  const { data: compilation } = await supabase
    .from('compiled_products')
    .select('*')
    .eq('id', compilationId)
    .single();

  if (!compilation) return false;

  const status = rating >= 5 ? 'approved' : 'rejected';

  // Update the compilation
  const { error: updateError } = await supabase
    .from('compiled_products')
    .update({
      status,
      rating,
      notes: notes ?? null,
      rated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', compilationId);

  if (updateError) return false;

  // Write feedback record
  await supabase.from('compiler_feedback').insert({
    compilation_id: compilationId,
    rating,
    notes: notes ?? null,
    discovery_ids: compilation.discovery_ids ?? [],
    combined_chain: compilation.combined_chain ?? [],
    coherence_score: compilation.coherence_score ?? 0,
    compatibility_score: compilation.compatibility_score ?? 0,
  });

  // Check if we've hit 10 decisions — trigger weight recomputation
  const { count } = await supabase
    .from('compiler_feedback')
    .select('id', { count: 'exact', head: true });

  if (count && count % 10 === 0) {
    await recomputeWeights();
  }

  return true;
}

/**
 * Recompute learned affinity weights from all feedback.
 * Positive ratings (7-10) boost pair weights. Negative (1-4) reduce them.
 */
async function recomputeWeights(): Promise<void> {
  const { data: feedback } = await supabase
    .from('compiler_feedback')
    .select('combined_chain, rating')
    .order('created_at', { ascending: true });

  if (!feedback || feedback.length === 0) return;

  const pairScores = new Map<string, { positive: number; negative: number }>();

  for (const fb of feedback) {
    const chain = (fb.combined_chain ?? []) as string[];
    const rating = fb.rating as number;

    // Generate all pairs from the chain
    for (let i = 0; i < chain.length; i++) {
      for (let j = i + 1; j < chain.length; j++) {
        const key = makePairKey(chain[i].toUpperCase(), chain[j].toUpperCase());
        const entry = pairScores.get(key) ?? { positive: 0, negative: 0 };

        if (rating >= 7) {
          entry.positive += (rating - 6) / 4; // 7→0.25, 8→0.5, 9→0.75, 10→1.0
        } else if (rating <= 4) {
          entry.negative += (5 - rating) / 4; // 4→0.25, 3→0.5, 2→0.75, 1→1.0
        }

        pairScores.set(key, entry);
      }
    }
  }

  // Upsert weights
  for (const [pair, scores] of pairScores) {
    const weight = Math.max(0.1, Math.min(3.0,
      1.0 + (scores.positive * 0.15) - (scores.negative * 0.15)
    ));

    await supabase.from('compiler_weights').upsert({
      primitive_pair: pair,
      weight: Math.round(weight * 1000) / 1000,
      positive_signals: Math.round(scores.positive * 100),
      negative_signals: Math.round(scores.negative * 100),
      last_updated: new Date().toISOString(),
    }, { onConflict: 'primitive_pair' });
  }
}

// ═══════════════════════════════════════════════════════════════
// §10 — CDM INTEGRATION
// ═══════════════════════════════════════════════════════════════

/**
 * Run a full compiler cycle for all verticals.
 * Called during the CDM reactor cycle.
 */
export async function runCompilerCycle(): Promise<{
  proposalsGenerated: number;
  verticals: string[];
  durationMs: number;
}> {
  const start = Date.now();
  const verticals = ['primary', 'cyber', 'robotics', 'llm', 'quantum', 'agency', 'media'];
  let totalProposals = 0;

  for (const v of verticals) {
    const proposals = await generateProposals(v, 3); // ~3 per vertical × 7 = ~21 total
    const persisted = await persistProposals(proposals, `cdm-${Date.now()}`);
    totalProposals += persisted;
  }

  return {
    proposalsGenerated: totalProposals,
    verticals,
    durationMs: Date.now() - start,
  };
}
