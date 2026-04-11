/**
 * CMPSBL® Capability Seed — Unified Initialization
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single entry point to seed ALL capability tiers:
 *   - Tier 0: 10 core Phase 2 seeds (auto-loaded by capability-registry.ts)
 *   - Tier 2: ~38 decomposed sub-capabilities
 *   - Tier 3: ~250+ vertical capability templates
 *
 * Call seedAllCapabilities() once at runtime initialization.
 *
 * © CMPSBL® — All rights reserved.
 */

import { getRegistrySummary } from './capability-registry';
import { seedDecomposedCapabilities, getDecompositionCount } from './capability-decomposition';
import { seedVerticalCapabilities, getTotalTemplateCount } from './vertical-capability-templates';

export interface SeedResult {
  readonly tier0Core: number;
  readonly tier2Decomposed: number;
  readonly tier3Vertical: number;
  readonly totalRegistered: number;
  readonly totalEnforcing: number;
  readonly totalObserving: number;
  readonly categories: readonly string[];
}

let _seeded = false;

/**
 * Seed all capability tiers. Idempotent.
 */
export function seedAllCapabilities(): SeedResult {
  if (_seeded) {
    const summary = getRegistrySummary();
    return {
      tier0Core: 10,
      tier2Decomposed: getDecompositionCount(),
      tier3Vertical: getTotalTemplateCount(),
      totalRegistered: summary.totalCapabilities,
      totalEnforcing: summary.enforcingCapabilities,
      totalObserving: summary.observingCapabilities,
      categories: summary.categories,
    };
  }

  // Tier 0 is auto-seeded by capability-registry.ts on import
  // Tier 2: Decomposed sub-capabilities
  const t2 = seedDecomposedCapabilities();

  // Tier 3: Vertical capability templates
  const t3 = seedVerticalCapabilities();

  _seeded = true;

  const summary = getRegistrySummary();
  return {
    tier0Core: 10,
    tier2Decomposed: t2,
    tier3Vertical: t3,
    totalRegistered: summary.totalCapabilities,
    totalEnforcing: summary.enforcingCapabilities,
    totalObserving: summary.observingCapabilities,
    categories: summary.categories,
  };
}

/** Check if seeding has been performed */
export function isCapabilitySeeded(): boolean {
  return _seeded;
}

/** Reset seed state (testing only) */
export function resetCapabilitySeed(): void {
  _seeded = false;
}
