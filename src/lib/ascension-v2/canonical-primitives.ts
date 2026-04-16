/**
 * Canonical 40-Primitive Matrix — Single Source of Truth for Ascension V2
 *
 * Mirrors docs/libraries/internal/15-primitive-specifications.md
 *   12 Organs · 12 Layers · 8 Engines · 8 Agents = 40 Primitives
 *
 * Used by the V2 collision pipeline to ensure every Ascension run
 * fires against the full canonical matrix.
 */

export const ORGANS = [
  'CORE', 'SYSTEM', 'BRAIN', 'MEMORY', 'NERVE', 'NEXUS',
  'IDENTITY', 'SOVEREIGN', 'ATLAS', 'MEDIC', 'RELAY', 'CONSCIENCE',
] as const;

export const LAYERS = [
  'DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'TREATY', 'EVOLUTION', 'REFLEX',
  'COMPASS', 'INTEGRATION', 'INTENT', 'ACCESS', 'VISION', 'SHADOW',
] as const;

export const ENGINES = [
  'DREAM', 'HARVEST', 'FORGE', 'LINGUA',
  'ECHO', 'PHANTOM', 'SANDBOX', 'RIPPLE',
] as const;

export const AGENTS = [
  'ENCODE', 'DECODE', 'AUDIT', 'ECONOMY',
  'INCLUSIVE', 'CORTEX', 'ORACLE', 'ENGINEER',
] as const;

export const CANONICAL_PRIMITIVES: readonly string[] = [
  ...ORGANS, ...LAYERS, ...ENGINES, ...AGENTS,
];

// Build-time guarantee — fail fast if the matrix ever drifts.
if (CANONICAL_PRIMITIVES.length !== 40) {
  throw new Error(
    `[canonical-primitives] Expected 40 primitives, found ${CANONICAL_PRIMITIVES.length}`,
  );
}
