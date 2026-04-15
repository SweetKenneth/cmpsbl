/**
 * Ascension V2 — Capability Deduplication Engine
 * U.S. Patent App. No. 64/029,678
 *
 * Reduces raw discoveries to the top 4–7 unique capabilities by:
 *   1. String-similarity grouping (normalized Levenshtein on names)
 *   2. Keeping the highest-scoring member of each group
 *   3. Sorting by CJPI descending
 *   4. Capping at MAX_CAPS (7)
 *
 * © CMPSBL® — All rights reserved.
 */

import type { DiscoveredCapability } from './orchestrator';

const MIN_CAPS = 4;
const MAX_CAPS = 7;
const SIMILARITY_THRESHOLD = 0.55; // below = "same group"

// ═══════════════════════════════════════════════════════════════
// Normalised Levenshtein distance (0 = identical, 1 = nothing in common)
// ═══════════════════════════════════════════════════════════════

function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(capability|engine|layer|primitive|agent|module|system)/g, '');
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) {
    matrix[i] = [i];
    for (let j = 1; j <= lb; j++) {
      matrix[i][j] = i === 0
        ? j
        : Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
          );
    }
  }
  return matrix[la][lb];
}

function similarity(a: string, b: string): number {
  const na = normalise(a);
  const nb = normalise(b);
  if (na === nb) return 0;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 0;
  return levenshtein(na, nb) / maxLen;
}

// ═══════════════════════════════════════════════════════════════
// Group-and-pick algorithm
// ═══════════════════════════════════════════════════════════════

interface CapGroup {
  representative: DiscoveredCapability;
  members: DiscoveredCapability[];
}

function groupBySimilarity(caps: DiscoveredCapability[]): CapGroup[] {
  const groups: CapGroup[] = [];

  for (const cap of caps) {
    let placed = false;
    for (const group of groups) {
      if (similarity(cap.name, group.representative.name) < SIMILARITY_THRESHOLD) {
        group.members.push(cap);
        // Promote if higher score
        if (cap.cjpiScore > group.representative.cjpiScore) {
          group.representative = cap;
        }
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push({ representative: cap, members: [cap] });
    }
  }

  return groups;
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export interface DedupResult {
  /** The final unique capabilities (4–7) */
  readonly capabilities: ReadonlyArray<DiscoveredCapability>;
  /** How many raw discoveries were collapsed */
  readonly rawCount: number;
  /** How many groups were formed before cap */
  readonly groupCount: number;
}

/**
 * Deduplicate raw discoveries into 4–7 unique, top-scoring capabilities.
 */
export function deduplicateCapabilities(
  raw: ReadonlyArray<DiscoveredCapability>,
): DedupResult {
  if (raw.length === 0) {
    return { capabilities: [], rawCount: 0, groupCount: 0 };
  }

  // Sort by score descending first so groups inherit the best representative early
  const sorted = [...raw].sort((a, b) => b.cjpiScore - a.cjpiScore);
  const groups = groupBySimilarity(sorted);

  // Sort groups by representative score descending
  groups.sort((a, b) => b.representative.cjpiScore - a.representative.cjpiScore);

  // Take top MAX_CAPS groups, ensure at least MIN_CAPS if available
  const count = Math.max(MIN_CAPS, Math.min(groups.length, MAX_CAPS));
  const final = groups.slice(0, count).map(g => g.representative);

  return {
    capabilities: Object.freeze(final),
    rawCount: raw.length,
    groupCount: groups.length,
  };
}
