/**
 * CMPSBL® Merge Simulation Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Before flagging anything as a compatible match, dry-runs the
 * integration by simulating what happens when a candidate primitive
 * is "injected" into the target codebase profile.
 *
 * Questions answered:
 *   - Did the gap close?
 *   - Did new gaps open?
 *   - Did any existing capabilities degrade?
 *   - What's the net improvement score?
 *
 * © CMPSBL® — All rights reserved.
 */

import type { StructuralMatch, PresenceState } from './structural-signatures';
import type { CompatibilityReport } from './compatibility-scoring';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MergeSimulation {
  /** Primitive being simulated */
  primitive: string;
  /** Overall verdict */
  verdict: 'beneficial' | 'neutral' | 'risky';
  /** Net improvement score (-1 to +1) */
  netImprovement: number;
  /** Gaps that would be closed by adding this primitive */
  gapsClosedCount: number;
  /** New gaps that might open (dependency requirements not met) */
  gapsOpenedCount: number;
  /** Capabilities that would be degraded (conflict) */
  degradedCapabilities: string[];
  /** Capabilities that would be strengthened (synergy) */
  strengthenedCapabilities: string[];
  /** The final recommendation */
  recommendation: string;
}

export interface MergeReport {
  /** All simulations sorted by net improvement */
  simulations: MergeSimulation[];
  /** Summary statistics */
  totalBeneficial: number;
  totalNeutral: number;
  totalRisky: number;
  /** Top 3 highest-impact primitives */
  topImpact: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — CONFLICT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Primitives that may conflict when both are heavily active.
 * Conflict doesn't mean "can't coexist" — it means "one might
 * shadow the other's signals if both are at full weight."
 */
const TENSION_PAIRS: Array<[string, string, string]> = [
  ['PHANTOM', 'AUDIT', 'Deception ops may conflict with transparent audit trails'],
  ['SHADOW', 'CORE', 'Shadow runs may conflict with core integrity assertions'],
  ['EVOLUTION', 'GOVERNANCE', 'Self-evolution may resist governance constraints'],
  ['DREAM', 'ECONOMY', 'Autonomous synthesis may generate uncapped costs'],
  ['PHANTOM', 'INCLUSIVE', 'Deception patterns may reduce accessibility clarity'],
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SIMULATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simulate merging a primitive into the current selection.
 */
export function simulateMerge(
  primitive: string,
  compatibility: CompatibilityReport,
  structuralMatches: StructuralMatch[],
  currentSelection: Set<string>,
): MergeSimulation {
  const upper = primitive.toUpperCase();

  // Count gaps closed
  const gapsClosedCount = compatibility.closedGaps.length;

  // Check for tension with existing selection
  const degraded: string[] = [];
  const strengthened: string[] = [];

  for (const [a, b, reason] of TENSION_PAIRS) {
    if (upper === a && currentSelection.has(b)) {
      degraded.push(`${b}: ${reason}`);
    } else if (upper === b && currentSelection.has(a)) {
      degraded.push(`${a}: ${reason}`);
    }
  }

  // Count synergies (strengthened capabilities)
  for (const synergy of compatibility.unlockedSynergies) {
    strengthened.push(synergy);
  }

  // Estimate new gaps opened (dependencies not met → creates fragile points)
  const gapsOpenedCount = compatibility.potentialConflicts.length;

  // Net improvement calculation
  const positiveImpact = gapsClosedCount * 0.25 + strengthened.length * 0.15;
  const negativeImpact = gapsOpenedCount * 0.20 + degraded.length * 0.15;
  const baseScore = compatibility.axes.composite;

  const netImprovement = Math.round(
    Math.max(-1, Math.min(1, (baseScore * 0.5 + positiveImpact - negativeImpact))) * 1000
  ) / 1000;

  // Verdict
  const verdict: MergeSimulation['verdict'] =
    netImprovement >= 0.3 ? 'beneficial'
    : netImprovement >= 0 ? 'neutral'
    : 'risky';

  // Recommendation
  const recommendation = verdict === 'beneficial'
    ? `${upper} closes ${gapsClosedCount} gap(s) and unlocks ${strengthened.length} synergy(ies). Recommended.`
    : verdict === 'neutral'
    ? `${upper} has minimal net impact. Include only if signal fit is strong.`
    : `${upper} introduces ${degraded.length} tension(s). Review before inclusion.`;

  return {
    primitive: upper,
    verdict,
    netImprovement,
    gapsClosedCount,
    gapsOpenedCount,
    degradedCapabilities: degraded,
    strengthenedCapabilities: strengthened,
    recommendation,
  };
}

/**
 * Run merge simulation for all compatibility reports.
 * Returns a full merge report with rankings and summaries.
 */
export function runMergeSimulation(
  compatibilityReports: CompatibilityReport[],
  structuralMatches: StructuralMatch[],
  currentSelection: Set<string>,
): MergeReport {
  const simulations = compatibilityReports
    .map(r => simulateMerge(r.primitive, r, structuralMatches, currentSelection))
    .sort((a, b) => b.netImprovement - a.netImprovement);

  return {
    simulations,
    totalBeneficial: simulations.filter(s => s.verdict === 'beneficial').length,
    totalNeutral: simulations.filter(s => s.verdict === 'neutral').length,
    totalRisky: simulations.filter(s => s.verdict === 'risky').length,
    topImpact: simulations.slice(0, 3).map(s => s.primitive),
  };
}
