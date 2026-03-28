/**
 * Expansion Primitive Auto-Discovery Gate
 * 
 * Runs CJPI scoring on capabilities surfaced by expansion primitives
 * (TREATY, HARVEST, FORGE, SHADOW, COMPASS, PHANTOM, OBSERVER)
 * and auto-classifies them into subscription tiers.
 * 
 * Flow: Capability surfaces → CJPI scoring → tier classification → registry injection
 */

import type { ProductTier } from '@/lib/quarry/types';

// ═══════════════════════════════════════════════════════════════════════════════
// CJPI SCORING — Crown Jewel Pipeline Index
// ═══════════════════════════════════════════════════════════════════════════════

/** CJPI dimensions (weights hex-encoded for IP protection) */
const _W = [0x1E, 0x1E, 0x14, 0x14]; // Novelty, Utility, Complexity, Composability

export interface CJPIScore {
  novelty: number;       // 0-100: How unique is this capability?
  utility: number;       // 0-100: How broadly useful?
  complexity: number;    // 0-100: How architecturally deep?
  composability: number; // 0-100: How well does it compose with other primitives?
  total: number;         // Weighted composite (0-100)
}

export interface DiscoveredCapability {
  id: string;
  name: string;
  primitive: string;
  description: string;
  modules: string[];
  cjpiScore: CJPIScore;
  autoTier: ProductTier;
  classification: 'experience' | 'architecture';
  isCrownJewel: boolean;       // CJPI >= 75
  isSTier: boolean;             // CJPI >= 95
  discoveredAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Calculate CJPI score for a capability.
 * Uses hex-encoded weights for IP protection.
 */
export function calculateCJPI(
  novelty: number,
  utility: number,
  complexity: number,
  composability: number
): CJPIScore {
  const n = Math.max(0, Math.min(100, novelty));
  const u = Math.max(0, Math.min(100, utility));
  const cx = Math.max(0, Math.min(100, complexity));
  const co = Math.max(0, Math.min(100, composability));

  const totalWeight = _W[0] + _W[1] + _W[2] + _W[3];
  const total = Math.round(
    (n * _W[0] + u * _W[1] + cx * _W[2] + co * _W[3]) / totalWeight
  );

  return { novelty: n, utility: u, complexity: cx, composability: co, total };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER AUTO-CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

/** CJPI thresholds for tier assignment (hex-encoded for IP protection) */
const _T = [0x5F, 0x50, 0x3C, 0x28]; // 95, 80, 60, 40

/**
 * Auto-classify a capability into a subscription tier based on CJPI score.
 * 
 * Enterprise: CJPI >= 95 (S-Tier, highest value)
 * Architect:  CJPI >= 80 (High value, complex)
 * Creator:    CJPI >= 60 (Moderate value)
 * Studio:     CJPI >= 40 (Entry premium)
 * Builder:    CJPI < 40  (Foundational)
 */
export function classifyTier(cjpi: number): ProductTier {
  if (cjpi >= _T[0]) return 'enterprise';
  if (cjpi >= _T[1]) return 'architect';
  if (cjpi >= _T[2]) return 'creator';
  if (cjpi >= _T[3]) return 'studio';
  return 'builder';
}

/**
 * Determine if a capability should be classified as architecture (internal IP)
 * based on its characteristics.
 */
function shouldBeArchitecture(
  modules: string[],
  complexity: number,
  composability: number
): boolean {
  // Multi-primitive compound → architecture
  if (modules.length >= 3) return true;

  // Core governance/evolution primitives → architecture
  const archPrimitives = new Set([
    'EVOLUTION', 'GOVERNANCE', 'CORTEX', 'SYSTEM', 'CORE',
    'SEBA', 'BRAIN', 'DREAM',
  ]);
  if (modules.some(m => archPrimitives.has(m.toUpperCase())) && complexity >= 85) {
    return true;
  }

  // Extremely high composability + complexity = structural dependency
  if (composability >= 90 && complexity >= 90) return true;

  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPANSION PRIMITIVE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

/** Expansion primitives — newest, need capability surfacing */
export const EXPANSION_PRIMITIVES = [
  'TREATY', 'HARVEST', 'FORGE', 'SHADOW', 'COMPASS', 'PHANTOM',
  'ECHO', 'LINGUA', 'ORACLE', 'SOVEREIGN', 'REFLEX',
] as const;

export type ExpansionPrimitive = typeof EXPANSION_PRIMITIVES[number];

/** In-memory discovery store */
const discoveryStore: DiscoveredCapability[] = [];

/**
 * Score and classify a newly surfaced capability from an expansion primitive.
 * Returns the discovery entry with auto-classification.
 */
export function scoreExpansionCapability(
  id: string,
  name: string,
  primitive: string,
  description: string,
  modules: string[],
  scores: { novelty: number; utility: number; complexity: number; composability: number }
): DiscoveredCapability {
  const cjpiScore = calculateCJPI(
    scores.novelty,
    scores.utility,
    scores.complexity,
    scores.composability
  );

  const isArch = shouldBeArchitecture(modules, scores.complexity, scores.composability);
  const autoTier = isArch ? 'enterprise' : classifyTier(cjpiScore.total);

  const discovery: DiscoveredCapability = {
    id,
    name,
    primitive,
    description,
    modules,
    cjpiScore,
    autoTier,
    classification: isArch ? 'architecture' : 'experience',
    isCrownJewel: cjpiScore.total >= 75,
    isSTier: cjpiScore.total >= 95,
    discoveredAt: new Date().toISOString(),
    status: 'pending', // Awaits governor auto-approval
  };

  discoveryStore.push(discovery);
  return discovery;
}

/**
 * Batch score all capabilities from a given expansion primitive.
 */
export function batchScoreExpansionCapabilities(
  capabilities: Array<{
    id: string;
    name: string;
    primitive: string;
    description: string;
    modules: string[];
    scores: { novelty: number; utility: number; complexity: number; composability: number };
  }>
): DiscoveredCapability[] {
  return capabilities.map(cap =>
    scoreExpansionCapability(
      cap.id, cap.name, cap.primitive, cap.description, cap.modules, cap.scores
    )
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISCOVERY QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all pending discoveries awaiting approval */
export function getPendingDiscoveries(): DiscoveredCapability[] {
  return discoveryStore.filter(d => d.status === 'pending');
}

/** Get discoveries by primitive */
export function getDiscoveriesByPrimitive(primitive: string): DiscoveredCapability[] {
  return discoveryStore.filter(d => d.primitive.toUpperCase() === primitive.toUpperCase());
}

/** Get S-Tier discoveries (CJPI >= 95) */
export function getSTierDiscoveries(): DiscoveredCapability[] {
  return discoveryStore.filter(d => d.isSTier);
}

/** Get discovery stats for admin dashboard */
export function getDiscoveryStats() {
  const byPrimitive: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  const byClassification: Record<string, number> = { architecture: 0, experience: 0 };

  for (const d of discoveryStore) {
    byPrimitive[d.primitive] = (byPrimitive[d.primitive] ?? 0) + 1;
    byTier[d.autoTier] = (byTier[d.autoTier] ?? 0) + 1;
    byClassification[d.classification]++;
  }

  return {
    total: discoveryStore.length,
    pending: discoveryStore.filter(d => d.status === 'pending').length,
    approved: discoveryStore.filter(d => d.status === 'approved').length,
    rejected: discoveryStore.filter(d => d.status === 'rejected').length,
    crownJewels: discoveryStore.filter(d => d.isCrownJewel).length,
    sTier: discoveryStore.filter(d => d.isSTier).length,
    byPrimitive,
    byTier,
    byClassification,
    averageCJPI: discoveryStore.length > 0
      ? Math.round(discoveryStore.reduce((sum, d) => sum + d.cjpiScore.total, 0) / discoveryStore.length)
      : 0,
  };
}

/** Approve a pending discovery (governor action) */
export function approveDiscovery(id: string): boolean {
  const discovery = discoveryStore.find(d => d.id === id);
  if (!discovery || discovery.status !== 'pending') return false;
  discovery.status = 'approved';
  return true;
}

/** Reject a pending discovery (governor action) */
export function rejectDiscovery(id: string): boolean {
  const discovery = discoveryStore.find(d => d.id === id);
  if (!discovery || discovery.status !== 'pending') return false;
  discovery.status = 'rejected';
  return true;
}

/** Clear all discoveries (testing only) */
export function clearDiscoveries(): void {
  discoveryStore.length = 0;
}
