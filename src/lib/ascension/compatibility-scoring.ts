/**
 * CMPSBL® 4-Axis Compatibility Scoring
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Replaces the single composite score with four individually measurable
 * axes, making the scanner explainable and tunable.
 *
 * Axes:
 *   1. Signal Fit (40%)     — Do the interfaces align?
 *   2. Dependency Coherence (20%) — Does it introduce conflicts?
 *   3. Synergy Multiplier (25%)   — Does it unlock latent capabilities?
 *   4. Gap Closure (15%)    — Does it patch a known vulnerability?
 *
 * Each axis produces a 0–1 score. The weighted sum becomes the
 * compatibility score that feeds into the scanner's ranking.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { InterfaceContract, EnvironmentProfile } from './contract-extractor';
import type { StructuralMatch } from './structural-signatures';
import { getAscensionWeight } from './ascension-weights';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AxisScores {
  /** Do the primitive's signals match the code's patterns? */
  signalFit: number;
  /** Does the primitive's dependencies align with the target's stack? */
  dependencyCoherence: number;
  /** Does adding this primitive unlock capabilities already partially present? */
  synergyMultiplier: number;
  /** Does this primitive close a known gap in the target code? */
  gapClosure: number;
  /** Weighted composite */
  composite: number;
}

export interface CompatibilityReport {
  primitive: string;
  axes: AxisScores;
  /** Which gaps this primitive would close */
  closedGaps: string[];
  /** Which synergies it would unlock */
  unlockedSynergies: string[];
  /** Potential conflicts it might introduce */
  potentialConflicts: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — AXIS WEIGHTS
// ═══════════════════════════════════════════════════════════════════════════════

const AXIS_WEIGHTS = {
  signalFit: 0.40,
  dependencyCoherence: 0.20,
  synergyMultiplier: 0.25,
  gapClosure: 0.15,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SYNERGY MAP
// ═══════════════════════════════════════════════════════════════════════════════
//
// When primitive A is PARTIAL, adding primitive B may complete it.
// These synergy pairs mean: "if B is selected and A is partial, A gets
// a boost because B fills the gap A needs."
// ═══════════════════════════════════════════════════════════════════════════════

const SYNERGY_PAIRS: Record<string, string[]> = {
  // Adding DEFENSE completes partial ACCESS, IDENTITY, SOVEREIGN
  DEFENSE: ['ACCESS', 'IDENTITY', 'SOVEREIGN', 'GOVERNANCE'],
  // Adding AUDIT completes partial GOVERNANCE, ECONOMY, COMPLIANCE
  AUDIT: ['GOVERNANCE', 'ECONOMY', 'CONSCIENCE', 'SOVEREIGN'],
  // Adding MEMORY completes partial DREAM, BRAIN, ECHO
  MEMORY: ['DREAM', 'BRAIN', 'ECHO', 'EVOLUTION'],
  // Adding REFLEX completes partial DEFENSE, MEDIC, VISION
  REFLEX: ['DEFENSE', 'MEDIC', 'VISION', 'NERVE'],
  // Adding DREAM unlocks EVOLUTION, BRAIN, ORACLE
  DREAM: ['EVOLUTION', 'BRAIN', 'ORACLE', 'FORGE'],
  // Adding CORTEX orchestrates ENCODE, DECODE, HARVEST
  CORTEX: ['ENCODE', 'DECODE', 'HARVEST', 'FORGE'],
  // Adding ECONOMY completes partial ACCESS, GOVERNANCE
  ECONOMY: ['ACCESS', 'GOVERNANCE', 'AUDIT', 'TREATY'],
  // Adding SANDBOX completes partial ECHO, SHADOW, PHANTOM
  SANDBOX: ['ECHO', 'SHADOW', 'PHANTOM', 'EVOLUTION'],
  // Adding ORACLE completes partial BRAIN, COMPASS, VISION
  ORACLE: ['BRAIN', 'COMPASS', 'VISION', 'DREAM'],
  // Adding PHANTOM completes partial DEFENSE, SHADOW
  PHANTOM: ['DEFENSE', 'SHADOW', 'IDENTITY', 'CONSCIENCE'],
  // Adding EVOLUTION completes partial ENGINEER, DREAM
  EVOLUTION: ['ENGINEER', 'DREAM', 'FORGE', 'SHADOW'],
  // Adding CONSCIENCE completes partial INCLUSIVE, GOVERNANCE
  CONSCIENCE: ['INCLUSIVE', 'GOVERNANCE', 'SOVEREIGN', 'AUDIT'],
  // Adding MEDIC completes partial ENGINEER, REFLEX, VISION
  MEDIC: ['ENGINEER', 'REFLEX', 'VISION', 'BEACON'],
  // Adding NEXUS completes partial CORTEX, RELAY, INTEGRATION
  NEXUS: ['CORTEX', 'RELAY', 'INTEGRATION', 'BRAIN'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — GAP DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════
//
// Universal gaps that most software has. If the structural analysis
// shows these as ABSENT, primitives that close them get a boost.
// ═══════════════════════════════════════════════════════════════════════════════

const GAP_TO_PRIMITIVE: Record<string, string[]> = {
  'no-input-validation': ['DEFENSE', 'ACCESS'],
  'no-error-recovery': ['REFLEX', 'MEDIC', 'IMMUNITY'],
  'no-logging': ['AUDIT', 'VISION'],
  'no-auth': ['ACCESS', 'IDENTITY'],
  'no-cost-tracking': ['ECONOMY', 'GOVERNANCE'],
  'no-encryption': ['DEFENSE', 'SOVEREIGN', 'PHANTOM'],
  'no-testing': ['SANDBOX', 'ECHO', 'SHADOW'],
  'no-compliance': ['SOVEREIGN', 'CONSCIENCE', 'GOVERNANCE'],
  'no-accessibility': ['INCLUSIVE', 'CONSCIENCE'],
  'no-observability': ['VISION', 'AUDIT', 'REFLEX'],
  'no-caching': ['MEMORY', 'CORE'],
  'no-concurrency': ['CORTEX', 'NERVE', 'RIPPLE'],
  'no-self-healing': ['MEDIC', 'EVOLUTION', 'REFLEX'],
  'no-rate-limiting': ['ACCESS', 'REFLEX', 'ECONOMY'],
  'no-data-pipeline': ['HARVEST', 'FORGE', 'CORTEX'],
  'no-prediction': ['ORACLE', 'BRAIN', 'DREAM'],
  'no-i18n': ['LINGUA', 'COMPASS', 'INCLUSIVE'],
  'no-deception': ['PHANTOM', 'DEFENSE', 'SHADOW'],
};

const ARCHETYPE_TO_GAP: Record<string, string> = {
  'input-validation': 'no-input-validation',
  'error-recovery': 'no-error-recovery',
  'observability': 'no-logging',
  'auth-control': 'no-auth',
  'cost-governance': 'no-cost-tracking',
  'encryption': 'no-encryption',
  'testing': 'no-testing',
  'data-sovereignty': 'no-compliance',
  'accessibility': 'no-accessibility',
  'state-persistence': 'no-caching',
  'concurrency': 'no-concurrency',
  'data-pipeline': 'no-data-pipeline',
  'predictive-analysis': 'no-prediction',
  'i18n': 'no-i18n',
  'deception': 'no-deception',
  'rate-limiting': 'no-rate-limiting',
  'self-evolution': 'no-self-healing',
  'simulation': 'no-testing',
  'heuristic-synthesis': 'no-prediction',
};

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — SCORING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute 4-axis compatibility score for a primitive.
 */
export function computeCompatibility(
  primitiveName: string,
  signalScore: number,
  contract: InterfaceContract,
  profile: EnvironmentProfile,
  structuralMatches: StructuralMatch[],
  selectedPrimitives: Set<string>,
): CompatibilityReport {
  const upper = primitiveName.toUpperCase();

  // ── Axis 1: Signal Fit ──
  const signalFit = Math.min(signalScore, 1);

  // ── Axis 2: Dependency Coherence ──
  const depCoherence = computeDependencyCoherence(upper, contract, profile);

  // ── Axis 3: Synergy Multiplier ──
  const { score: synergyScore, unlocked } = computeSynergy(upper, structuralMatches, selectedPrimitives);

  // ── Axis 4: Gap Closure ──
  const { score: gapScore, closedGaps } = computeGapClosure(upper, structuralMatches);

  // Weighted composite
  const composite = Math.round((
    signalFit * AXIS_WEIGHTS.signalFit +
    depCoherence.score * AXIS_WEIGHTS.dependencyCoherence +
    synergyScore * AXIS_WEIGHTS.synergyMultiplier +
    gapScore * AXIS_WEIGHTS.gapClosure
  ) * 1000) / 1000;

  return {
    primitive: upper,
    axes: {
      signalFit: Math.round(signalFit * 1000) / 1000,
      dependencyCoherence: Math.round(depCoherence.score * 1000) / 1000,
      synergyMultiplier: Math.round(synergyScore * 1000) / 1000,
      gapClosure: Math.round(gapScore * 1000) / 1000,
      composite,
    },
    closedGaps,
    unlockedSynergies: unlocked,
    potentialConflicts: depCoherence.conflicts,
  };
}

function computeDependencyCoherence(
  primitive: string,
  contract: InterfaceContract,
  profile: EnvironmentProfile,
): { score: number; conflicts: string[] } {
  const conflicts: string[] = [];
  let score = 0.7; // Default neutral — most primitives don't introduce conflicts

  // Primitives that need specific runtime assumptions
  const runtimeNeeds: Record<string, string[]> = {
    RELAY: ['io:network'],
    HARVEST: ['io:network', 'io:filesystem'],
    MEMORY: ['io:database'],
    FORGE: ['io:filesystem'],
    INTEGRATION: ['io:network'],
  };

  const needs = runtimeNeeds[primitive];
  if (needs) {
    const met = needs.filter(n => contract.runtimeAssumptions.includes(n)).length;
    const ratio = met / needs.length;
    score = 0.5 + ratio * 0.5; // 0.5 (no match) to 1.0 (all met)
    if (ratio < 0.5) {
      conflicts.push(`${primitive} needs ${needs.filter(n => !contract.runtimeAssumptions.includes(n)).join(', ')}`);
    }
  }

  // Bonus for framework alignment
  if (profile.frameworks.length > 0) {
    score = Math.min(1, score + 0.1);
  }

  // Bonus for matching async patterns
  if (contract.asyncPatterns.length > 0) {
    score = Math.min(1, score + 0.05);
  }

  return { score, conflicts };
}

function computeSynergy(
  primitive: string,
  structuralMatches: StructuralMatch[],
  selectedPrimitives: Set<string>,
): { score: number; unlocked: string[] } {
  const synergies = SYNERGY_PAIRS[primitive] ?? [];
  if (synergies.length === 0) return { score: 0.3, unlocked: [] };

  const unlocked: string[] = [];
  let synergyPoints = 0;

  // Check which synergy targets are PARTIAL in the structural analysis
  const partialPrimitives = new Set<string>();
  for (const match of structuralMatches) {
    if (match.state === 'partial') {
      for (const p of match.primitives) partialPrimitives.add(p.toUpperCase());
    }
  }

  for (const target of synergies) {
    if (partialPrimitives.has(target)) {
      // Target is partial — adding this primitive could complete it
      synergyPoints += 0.3;
      unlocked.push(target);
    } else if (selectedPrimitives.has(target)) {
      // Target is already selected — mutual reinforcement
      synergyPoints += 0.15;
      unlocked.push(`${target} (reinforced)`);
    }
  }

  const score = Math.min(1, 0.2 + synergyPoints);
  return { score, unlocked };
}

function computeGapClosure(
  primitive: string,
  structuralMatches: StructuralMatch[],
): { score: number; closedGaps: string[] } {
  // Find which archetypes are ABSENT
  const absentArchetypes = new Set<string>();
  const presentArchetypes = new Set<string>();

  // Archetypes that matched get added to present
  for (const match of structuralMatches) {
    if (match.state === 'present') {
      presentArchetypes.add(match.archetypeId);
    }
  }

  // All archetypes not in structural matches are potentially absent
  for (const [archetype] of Object.entries(ARCHETYPE_TO_GAP)) {
    if (!presentArchetypes.has(archetype)) {
      absentArchetypes.add(archetype);
    }
  }

  // Find gaps that this primitive closes
  const closedGaps: string[] = [];
  for (const archetype of absentArchetypes) {
    const gap = ARCHETYPE_TO_GAP[archetype];
    if (!gap) continue;
    const closers = GAP_TO_PRIMITIVE[gap] ?? [];
    if (closers.includes(primitive)) {
      closedGaps.push(gap);
    }
  }

  // Use Ascension weights for gap value
  const ascWeight = getAscensionWeight(primitive);
  const baseGap = ascWeight?.gapClosure ?? 0.4;

  // Score: base gap closure × number of gaps closed (diminishing returns)
  const gapMultiplier = closedGaps.length > 0
    ? Math.min(1, 0.3 + closedGaps.length * 0.2)
    : 0;
  const score = Math.min(1, baseGap * 0.6 + gapMultiplier * 0.4);

  return { score, closedGaps };
}

/**
 * Batch-compute compatibility for all selected primitives.
 */
export function batchCompatibility(
  primitives: Array<{ name: string; signalScore: number }>,
  contract: InterfaceContract,
  profile: EnvironmentProfile,
  structuralMatches: StructuralMatch[],
): CompatibilityReport[] {
  const selectedSet = new Set(primitives.map(p => p.name.toUpperCase()));

  return primitives
    .map(p => computeCompatibility(
      p.name, p.signalScore, contract, profile, structuralMatches, selectedSet,
    ))
    .sort((a, b) => b.axes.composite - a.axes.composite);
}
