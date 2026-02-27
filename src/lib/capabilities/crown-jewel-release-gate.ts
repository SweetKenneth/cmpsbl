/**
 * Crown Jewel Release Gate — Strategic Asset Availability Control
 * 
 * Controls which top-tier Crown Jewels are publicly available.
 * Only items explicitly included in an Artifact Pack are "released."
 * Everything else is gatekept for future pack additions.
 *
 * This covers: engines, meta-engines, templates, capabilities,
 * pipelines, and crystallized pipelines at the top tier.
 */

import { ARTIFACT_PACKS } from '@/lib/quarry/types';
import {
  EXPERIENCE_CROWN_JEWEL_IDS,
  ARCHITECTURE_CROWN_JEWEL_IDS,
} from './crown-jewel-registry';

// ═══════════════════════════════════════════════════════════════════════════════
// RELEASED CROWN JEWELS — Items included in active artifact packs
// ═══════════════════════════════════════════════════════════════════════════════

/** Collect all component IDs referenced by the 24 artifact packs */
function buildReleasedSet(): Set<string> {
  const released = new Set<string>();
  for (const pack of ARTIFACT_PACKS) {
    for (const comp of pack.components) {
      released.add(comp);
    }
    // Crystallized pipelines are internal — but mark them as "pack-referenced"
    for (const cp of pack._crystallizedPipelines) {
      released.add(cp);
    }
  }
  return released;
}

const RELEASED_COMPONENTS = buildReleasedSet();

/**
 * Check if a top-tier Crown Jewel has been released via an artifact pack.
 * Returns true if the item is included in a pack's components or pipelines.
 * Architecture jewels are NEVER released regardless.
 */
export function isCrownJewelReleased(id: string): boolean {
  // Architecture jewels are permanently gatekept
  if (ARCHITECTURE_CROWN_JEWEL_IDS.has(id)) return false;

  // If it's in a pack, it's released
  if (RELEASED_COMPONENTS.has(id)) return true;

  // Experience jewels not in a pack are gatekept for future release
  if (EXPERIENCE_CROWN_JEWEL_IDS.has(id)) return false;

  // Non-crown-jewel items are always available
  return true;
}

/**
 * Check if an item is gatekept (top-tier but not yet in a pack).
 * Use this to hide items from public surfaces.
 */
export function isGatekept(id: string): boolean {
  // Architecture jewels are always hidden (separate system)
  if (ARCHITECTURE_CROWN_JEWEL_IDS.has(id)) return true;

  // Experience jewels not in a pack → gatekept
  if (EXPERIENCE_CROWN_JEWEL_IDS.has(id) && !RELEASED_COMPONENTS.has(id)) {
    return true;
  }

  return false;
}

/**
 * Get the count of released vs gatekept experience crown jewels.
 * Useful for admin dashboards.
 */
export function getCrownJewelStats() {
  let released = 0;
  let gatekept = 0;

  for (const id of EXPERIENCE_CROWN_JEWEL_IDS) {
    if (RELEASED_COMPONENTS.has(id)) {
      released++;
    } else {
      gatekept++;
    }
  }

  return {
    totalExperience: EXPERIENCE_CROWN_JEWEL_IDS.size,
    totalArchitecture: ARCHITECTURE_CROWN_JEWEL_IDS.size,
    released,
    gatekept,
    packCount: ARTIFACT_PACKS.length,
    totalPackComponents: RELEASED_COMPONENTS.size,
  };
}

/**
 * Get all gatekept experience jewel IDs (for admin review / future pack planning)
 */
export function getGatekeptJewelIds(): string[] {
  const result: string[] = [];
  for (const id of EXPERIENCE_CROWN_JEWEL_IDS) {
    if (!RELEASED_COMPONENTS.has(id)) {
      result.push(id);
    }
  }
  return result.sort();
}

/**
 * Get all released experience jewel IDs
 */
export function getReleasedJewelIds(): string[] {
  const result: string[] = [];
  for (const id of EXPERIENCE_CROWN_JEWEL_IDS) {
    if (RELEASED_COMPONENTS.has(id)) {
      result.push(id);
    }
  }
  return result.sort();
}
