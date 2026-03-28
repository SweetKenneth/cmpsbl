/**
 * Compound IP Guard — Expanded Black-Box Enforcement
 * 
 * Cross-primitive compound jewels (CORTEX×BRAIN, DEFENSE×EVOLUTION, etc.)
 * represent the substrate's most dangerous IP — they reveal the inter-primitive
 * topology and coordination patterns that form the competitive moat.
 * 
 * These are PERMANENTLY guarded regardless of tier:
 * - Never in API catalogs
 * - Never in exports
 * - Never visible in store
 * - Governor-only access
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOUND CROWN JEWEL IDS — Cross-primitive synergies, NEVER released
// ═══════════════════════════════════════════════════════════════════════════════

export const COMPOUND_CROWN_JEWEL_IDS = new Set<string>([
  // ── CORTEX × BRAIN — Cognitive orchestration topology ──
  'compound-cortex-brain-recursive-planning',
  'compound-cortex-brain-cognitive-scheduling',
  'compound-cortex-brain-attention-routing',
  'compound-cortex-brain-semantic-orchestration',
  'compound-cortex-brain-goal-decomposition',

  // ── DEFENSE × EVOLUTION — Security-aware mutation ──
  'compound-defense-evolution-adversarial-hardening',
  'compound-defense-evolution-threat-aware-mutation',
  'compound-defense-evolution-rollback-consensus',
  'compound-defense-evolution-patch-verification',

  // ── MEMORY × DREAM — Knowledge compounding ──
  'compound-memory-dream-consolidation-loop',
  'compound-memory-dream-cross-session-synthesis',
  'compound-memory-dream-pattern-crystallization',
  'compound-memory-dream-selective-forgetting',

  // ── BRAIN × ORACLE — Predictive reasoning ──
  'compound-brain-oracle-causal-inference',
  'compound-brain-oracle-hypothesis-validation',
  'compound-brain-oracle-probabilistic-planning',

  // ── CORTEX × NEXUS — Multi-model orchestration ──
  'compound-cortex-nexus-fleet-coordination',
  'compound-cortex-nexus-cost-aware-scheduling',
  'compound-cortex-nexus-consensus-routing',

  // ── CONSCIENCE × SOVEREIGN — Ethical governance ──
  'compound-conscience-sovereign-policy-arbitration',
  'compound-conscience-sovereign-jurisdiction-resolution',
  'compound-conscience-sovereign-ethical-override',

  // ── ENCODE × FORGE — Code generation topology ──
  'compound-encode-forge-sandboxed-compilation',
  'compound-encode-forge-mutation-verification',
  'compound-encode-forge-artifact-versioning',

  // ── IDENTITY × DEFENSE — Trust mesh ──
  'compound-identity-defense-behavioral-trust',
  'compound-identity-defense-zero-trust-fabric',
  'compound-identity-defense-session-integrity',

  // ── EVOLUTION × SHADOW — Canary validation ──
  'compound-evolution-shadow-divergence-analysis',
  'compound-evolution-shadow-canary-promotion',
  'compound-evolution-shadow-regression-detection',

  // ── TREATY × ECONOMY — Contract economics ──
  'compound-treaty-economy-sla-pricing',
  'compound-treaty-economy-penalty-optimization',
  'compound-treaty-economy-value-arbitration',

  // ── HARVEST × ORACLE — Data acquisition intelligence ──
  'compound-harvest-oracle-source-prediction',
  'compound-harvest-oracle-etl-optimization',
  'compound-harvest-oracle-data-quality-scoring',

  // ── AUDIT × GOVERNANCE — Compliance enforcement ──
  'compound-audit-governance-regulatory-proof',
  'compound-audit-governance-policy-enforcement',
  'compound-audit-governance-tamper-detection',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOUND DETECTION — Pattern-based identification
// ═══════════════════════════════════════════════════════════════════════════════

/** Known cross-primitive compound patterns */
const COMPOUND_PATTERNS = [
  /^compound-/,
  /×/,                     // Unicode multiplication sign
  /\bcross[-_]primitive\b/i,
  /\bmulti[-_]primitive\b/i,
  /\binter[-_]node\b/i,
];

/**
 * Check if an ID represents a cross-primitive compound jewel.
 * Uses both the explicit set and pattern detection.
 */
export function isCompoundCrownJewel(id: string): boolean {
  if (COMPOUND_CROWN_JEWEL_IDS.has(id)) return true;
  return COMPOUND_PATTERNS.some(p => p.test(id));
}

/**
 * Extract the primitive pairs from a compound jewel ID.
 * e.g., 'compound-cortex-brain-recursive-planning' → ['CORTEX', 'BRAIN']
 */
export function extractCompoundPrimitives(id: string): string[] {
  if (!id.startsWith('compound-')) return [];
  const parts = id.replace('compound-', '').split('-');
  // First two parts are the primitive names
  return parts.slice(0, 2).map(p => p.toUpperCase());
}

/**
 * Get compound jewels that involve a specific primitive.
 * Useful for admin dashboards showing primitive coupling.
 */
export function getCompoundJewelsForPrimitive(primitive: string): string[] {
  const normalized = primitive.toLowerCase();
  return Array.from(COMPOUND_CROWN_JEWEL_IDS).filter(id => {
    const parts = extractCompoundPrimitives(id);
    return parts.some(p => p.toLowerCase() === normalized);
  });
}

/** Get all unique primitive pairs across compound jewels */
export function getCompoundTopologyMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const id of COMPOUND_CROWN_JEWEL_IDS) {
    const [a, b] = extractCompoundPrimitives(id);
    if (!a || !b) continue;
    const key = `${a}×${b}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(id);
  }
  return map;
}

/** Stats for admin dashboard */
export function getCompoundGuardStats() {
  const topology = getCompoundTopologyMap();
  return {
    totalCompoundJewels: COMPOUND_CROWN_JEWEL_IDS.size,
    uniquePrimitivePairs: topology.size,
    topologyEntries: Array.from(topology.entries()).map(([pair, ids]) => ({
      pair,
      count: ids.length,
      ids,
    })),
  };
}
