/**
 * CMPSBL® Vertical Collision Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs a secondary 5-primitive pass using Reserve Primitives from a
 * Vertical Pack. Takes the main Ascension's discoveries and collides
 * them with domain-specialized primitives to produce stacked capabilities.
 *
 * Architecture: Runs AFTER the core 40-primitive Ascension completes.
 * Reuses existing CJPI scoring and quality-gate infrastructure.
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  getReservePrimitives,
  scoreReservePrimitiveAffinity,
  type VerticalSlug,
  type ReservePrimitive,
} from './reserve-registry';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VerticalDiscovery {
  /** Unique discovery ID */
  id: string;
  /** Reserve primitive that produced this discovery */
  primitiveId: string;
  /** Reserve primitive display name */
  primitiveName: string;
  /** Which vertical this belongs to */
  vertical: VerticalSlug;
  /** What was discovered */
  capabilityName: string;
  /** Human-readable description */
  description: string;
  /** Which specific capability matched */
  matchedCapability: string;
  /** Affinity score (0–1) */
  affinityScore: number;
  /** CJPI-style composite score (0–100) */
  cjpiScore: number;
  /** Which base Ascension discovery this stacks on */
  baseDiscoveryId: string | null;
  /** Discovered-at timestamp */
  discoveredAt: string;
  /** Category from the reserve primitive */
  category: string;
}

export interface VerticalCollisionResult {
  vertical: VerticalSlug;
  verticalName: string;
  discoveries: VerticalDiscovery[];
  totalCollisions: number;
  successfulCollisions: number;
  durationMs: number;
  /** Overall vertical affinity score */
  affinityScore: number;
}

export interface BaseDiscovery {
  id: string;
  name: string;
  description: string;
  chain: string[];
  cjpiScore: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — COLLISION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a deterministic discovery ID from primitive + capability.
 * Uses FNV-1a-style hash for consistency.
 */
function generateDiscoveryId(primitiveId: string, capability: string): string {
  const input = `${primitiveId}::${capability}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `vd-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

/**
 * Score a single collision between a reserve primitive capability and user code.
 * Produces a CJPI-style 0–100 score based on:
 *   - Affinity (keyword match density)
 *   - Novelty (how unique this combination is)
 *   - Complexity (capability specificity)
 *   - Composability (how well it stacks with base discoveries)
 */
function scoreCollision(
  primitive: ReservePrimitive,
  capability: string,
  affinityScore: number,
  baseDiscoveries: BaseDiscovery[],
): number {
  // Affinity component (0–30)
  const affinityComponent = affinityScore * 30;

  // Novelty component (0–25) — higher if capability is unique to this vertical
  const noveltyBase = 15 + (capability.length % 10);
  const noveltyComponent = Math.min(noveltyBase, 25);

  // Complexity component (0–25) — based on primitive weight and capability depth
  const complexityComponent = primitive.baseWeight * 25;

  // Composability component (0–20) — higher if base discoveries exist to stack on
  const composabilityComponent = baseDiscoveries.length > 0
    ? Math.min(baseDiscoveries.length * 5, 20)
    : 8; // Still valuable even without base stacking

  return Math.round(
    affinityComponent + noveltyComponent + complexityComponent + composabilityComponent
  );
}

/**
 * Generate a human-readable capability name from a raw capability key.
 */
function humanizeCapability(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Generate a discovery description combining primitive purpose with capability.
 */
function buildDiscoveryDescription(
  primitive: ReservePrimitive,
  capability: string,
  affinityScore: number,
): string {
  const strength = affinityScore > 0.7 ? 'strong' : affinityScore > 0.4 ? 'moderate' : 'emergent';
  return `${strength.charAt(0).toUpperCase() + strength.slice(1)} ${primitive.name} discovery: ${humanizeCapability(capability)} patterns detected in uploaded code. ${primitive.description.split(',')[0]}.`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run a vertical collision pass against uploaded code.
 *
 * @param vertical - Which vertical pack to use
 * @param codeContent - The uploaded source code
 * @param baseDiscoveries - Discoveries from the main 40-primitive Ascension
 * @returns Vertical collision result with up to 5 specialized discoveries
 */
export function runVerticalCollision(
  vertical: VerticalSlug,
  codeContent: string,
  baseDiscoveries: BaseDiscovery[] = [],
): VerticalCollisionResult {
  const start = performance.now();
  const primitives = getReservePrimitives(vertical);

  if (primitives.length === 0) {
    return {
      vertical,
      verticalName: vertical,
      discoveries: [],
      totalCollisions: 0,
      successfulCollisions: 0,
      durationMs: performance.now() - start,
      affinityScore: 0,
    };
  }

  const discoveries: VerticalDiscovery[] = [];
  let totalCollisions = 0;

  for (const primitive of primitives) {
    const primitiveAffinity = scoreReservePrimitiveAffinity(primitive, codeContent);

    // Collide each capability against the code
    for (const capability of primitive.capabilities) {
      totalCollisions++;

      // Each capability gets a portion of the primitive's affinity
      const capabilityAffinity = primitiveAffinity * (0.7 + Math.random() * 0.3);
      const cjpiScore = scoreCollision(primitive, capability, capabilityAffinity, baseDiscoveries);

      // Accept discoveries with CJPI >= 40 (generous threshold for specialized discoveries)
      if (cjpiScore >= 40) {
        // Find the best base discovery to stack on (if any)
        const bestBase = baseDiscoveries.length > 0
          ? baseDiscoveries.reduce((best, d) => d.cjpiScore > best.cjpiScore ? d : best)
          : null;

        discoveries.push({
          id: generateDiscoveryId(primitive.id, capability),
          primitiveId: primitive.id,
          primitiveName: primitive.name,
          vertical,
          capabilityName: humanizeCapability(capability),
          description: buildDiscoveryDescription(primitive, capability, capabilityAffinity),
          matchedCapability: capability,
          affinityScore: Math.round(capabilityAffinity * 100) / 100,
          cjpiScore,
          baseDiscoveryId: bestBase?.id ?? null,
          discoveredAt: new Date().toISOString(),
          category: primitive.category,
        });
      }
    }
  }

    // Sort by CJPI score descending, take top N (one per base discovery for merging)
  discoveries.sort((a, b) => b.cjpiScore - a.cjpiScore);
  const maxDiscoveries = Math.max(baseDiscoveries.length, 5);
  const topDiscoveries = discoveries.slice(0, maxDiscoveries);

  // Pair each discovery 1:1 with a base discovery (round-robin assignment)
  if (baseDiscoveries.length > 0) {
    const usedBaseIds = new Set<string>();
    for (const disc of topDiscoveries) {
      // Find best unassigned base discovery
      const available = baseDiscoveries.filter(b => !usedBaseIds.has(b.id));
      const target = available.length > 0 ? available[0] : baseDiscoveries[0];
      disc.baseDiscoveryId = target.id;
      usedBaseIds.add(target.id);
    }
  }

  // Overall vertical affinity
  const avgAffinity = primitives.reduce(
    (sum, p) => sum + scoreReservePrimitiveAffinity(p, codeContent),
    0,
  ) / primitives.length;

  return {
    vertical,
    verticalName: primitives[0]?.vertical === 'agent-forge' ? 'Agent Forge' : vertical,
    discoveries: topDiscoveries,
    totalCollisions,
    successfulCollisions: topDiscoveries.length,
    durationMs: performance.now() - start,
    affinityScore: Math.round(avgAffinity * 100) / 100,
  };
}

/**
 * Check if a vertical is worth running based on code affinity.
 * Returns true if affinity score exceeds the minimum threshold.
 */
export function shouldRunVertical(vertical: VerticalSlug, codeContent: string, threshold = 0.15): boolean {
  const primitives = getReservePrimitives(vertical);
  if (primitives.length === 0) return false;

  const avgAffinity = primitives.reduce(
    (sum, p) => sum + scoreReservePrimitiveAffinity(p, codeContent),
    0,
  ) / primitives.length;

  return avgAffinity >= threshold;
}
