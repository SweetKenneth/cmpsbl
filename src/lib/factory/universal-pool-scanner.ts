/**
 * CMPSBL® Universal Pool Scanner
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The brain of the Ultimate substrate. Aggregates ALL expansion primitives
 * from every vertical (Cyber, Robotics, Quantum, LLM, Agency) plus the
 * 16 Universal gap-filler primitives into a single candidate pool.
 * 
 * During Ascension, it scores every candidate against the uploaded code
 * and selects the optimal 16 (to fill 24 spine + 16 expansion = 40) that
 * produce the maximum compounding effect.
 * 
 * If the scanner finds 6 strong matches, it picks 6. If it finds 41
 * opportunities, it selects the top 16 by compounding score. The result
 * is always the highest-impact subset possible.
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive } from './vertical-substrate';
import { getSpinePrimitives } from './vertical-substrate';
import { getCyberSecurityEngines, getCyberSecurityAgents } from './verticals/cybersecurity';
import { getRoboticsEngines, getRoboticsAgents } from './verticals/robotics';
import { getQuantumEngines, getQuantumAgents } from './verticals/quantum';
import { getLLMEngines, getLLMAgents } from './verticals/llm';
import { getAgencyEngines, getAgencyAgents } from './verticals/agency';
import {
  ULTIMATE_ALL_ENGINES,
  ULTIMATE_ALL_AGENTS,
  ULTIMATE_AFFINITY_SIGNALS,
} from './verticals/ultimate';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PoolCandidate {
  primitive: VerticalPrimitive;
  sourceVertical: string;
  affinityScore: number;
  signalHits: number;
  totalSignals: number;
  compoundingScore: number;
}

export interface UniversalScanResult {
  /** The selected 16 expansion primitives (optimal fit for this code) */
  selectedExpansion: PoolCandidate[];
  /** Full 40-primitive surface (24 spine + selected expansion) */
  fullSurface: VerticalPrimitive[];
  /** All candidates that were evaluated */
  totalCandidatesEvaluated: number;
  /** How many passed the affinity threshold */
  candidatesAboveThreshold: number;
  /** Source vertical distribution in the selection */
  verticalDistribution: Record<string, number>;
  /** Duration of the scan in ms */
  durationMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — AFFINITY SIGNAL MAPS (per-vertical)
// ═══════════════════════════════════════════════════════════════════════════════

/** Build affinity signals from a primitive's capabilities + description */
function deriveSignals(p: VerticalPrimitive): string[] {
  const signals: string[] = [];
  // Extract keywords from capabilities
  for (const cap of p.capabilities) {
    signals.push(...cap.split('_'));
  }
  // Extract keywords from description
  const descWords = p.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  signals.push(...descWords);
  // Deduplicate
  return [...new Set(signals)];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — POOL ASSEMBLY
// ═══════════════════════════════════════════════════════════════════════════════

interface TaggedPrimitive {
  primitive: VerticalPrimitive;
  sourceVertical: string;
  signals: string[];
}

/** Assemble the full universal pool — ALL expansion primitives from every vertical */
function assembleUniversalPool(): TaggedPrimitive[] {
  const pool: TaggedPrimitive[] = [];

  const tag = (prims: VerticalPrimitive[], source: string) => {
    for (const p of prims) {
      const explicitSignals = ULTIMATE_AFFINITY_SIGNALS[p.id];
      pool.push({
        primitive: p,
        sourceVertical: source,
        signals: explicitSignals ?? deriveSignals(p),
      });
    }
  };

  // Cyber (16)
  tag(getCyberSecurityEngines(), 'cyber');
  tag(getCyberSecurityAgents(), 'cyber');

  // Robotics (16)
  tag(getRoboticsEngines(), 'robotics');
  tag(getRoboticsAgents(), 'robotics');

  // Quantum (16)
  tag(getQuantumEngines(), 'quantum');
  tag(getQuantumAgents(), 'quantum');

  // LLM (16)
  tag(getLLMEngines(), 'llm');
  tag(getLLMAgents(), 'llm');

  // Agency (16)
  tag(getAgencyEngines(), 'agency');
  tag(getAgencyAgents(), 'agency');

  // Ultimate Universal (16)
  tag(ULTIMATE_ALL_ENGINES, 'ultimate');
  tag(ULTIMATE_ALL_AGENTS, 'ultimate');

  return pool;
}

// Pre-compute pool on first access
let _cachedPool: TaggedPrimitive[] | null = null;
function getPool(): TaggedPrimitive[] {
  if (!_cachedPool) _cachedPool = assembleUniversalPool();
  return _cachedPool;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — SCORING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Score a single candidate primitive against the uploaded code.
 * Returns 0–1 affinity and a compounding score that factors in:
 *   - Signal hit density (how many keywords match)
 *   - Capability breadth (more capabilities = more compounding potential)
 *   - Weight (inherent importance from the source vertical)
 */
function scoreCandidate(tagged: TaggedPrimitive, lowerCode: string): PoolCandidate {
  let hits = 0;
  for (const signal of tagged.signals) {
    if (lowerCode.includes(signal)) hits++;
  }

  const hitRatio = tagged.signals.length > 0 ? hits / tagged.signals.length : 0;
  const affinity = Math.min(hitRatio / 0.25, 1); // Normalize: 25% hits = 1.0

  // Compounding score: affinity × capability breadth × weight
  const breadthFactor = Math.min(tagged.primitive.capabilities.length / 7, 1);
  const weightFactor = tagged.primitive.weight / 0.035; // Normalized against typical weight
  const compounding = affinity * 0.5 + breadthFactor * 0.25 + Math.min(weightFactor, 1) * 0.25;

  return {
    primitive: tagged.primitive,
    sourceVertical: tagged.sourceVertical,
    affinityScore: Math.round(affinity * 1000) / 1000,
    signalHits: hits,
    totalSignals: tagged.signals.length,
    compoundingScore: Math.round(compounding * 1000) / 1000,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — SELECTION ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Select the optimal expansion primitives from the universal pool.
 * 
 * Strategy:
 * 1. Score all 96 candidates against the code
 * 2. Filter by minimum affinity threshold (0.1)
 * 3. Sort by compounding score descending
 * 4. Select top 16 with diversity constraint (max 6 from any single vertical)
 * 5. Rebalance weights to sum to the expansion budget (0.415)
 */
function selectOptimalExpansion(
  candidates: PoolCandidate[],
  maxSlots: number = 16,
  maxPerVertical: number = 6,
): PoolCandidate[] {
  // Sort by compounding score
  const sorted = [...candidates]
    .filter(c => c.affinityScore > 0.05)
    .sort((a, b) => b.compoundingScore - a.compoundingScore);

  const selected: PoolCandidate[] = [];
  const verticalCounts: Record<string, number> = {};
  const usedIds = new Set<string>();

  for (const candidate of sorted) {
    if (selected.length >= maxSlots) break;

    // Diversity: cap per-vertical representation
    const vc = verticalCounts[candidate.sourceVertical] ?? 0;
    if (vc >= maxPerVertical) continue;

    // Dedup by primitive ID
    if (usedIds.has(candidate.primitive.id)) continue;

    selected.push(candidate);
    verticalCounts[candidate.sourceVertical] = vc + 1;
    usedIds.add(candidate.primitive.id);
  }

  return selected;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run the Universal Pool Scanner against uploaded code.
 * Returns the optimal 40-primitive surface for maximum Ascension impact.
 */
export function runUniversalPoolScan(codeContent: string): UniversalScanResult {
  const start = performance.now();
  const pool = getPool();
  const lowerCode = codeContent.toLowerCase();

  // Score all candidates
  const scored = pool.map(tagged => scoreCandidate(tagged, lowerCode));

  // Select optimal expansion
  const selected = selectOptimalExpansion(scored);

  // Rebalance weights for the selected set
  const expansionWeightBudget = 0.415; // Total weight available for expansion
  const perWeight = selected.length > 0
    ? Math.round((expansionWeightBudget / selected.length) * 1000) / 1000
    : 0;

  // Build the rebalanced primitives
  const rebalancedExpansion: VerticalPrimitive[] = selected.map(c => ({
    ...c.primitive,
    weight: perWeight,
    inherited: false,
  }));

  // Assemble full 40-primitive surface
  const spine = getSpinePrimitives();
  const fullSurface = [...spine, ...rebalancedExpansion];

  // Compute vertical distribution
  const distribution: Record<string, number> = {};
  for (const s of selected) {
    distribution[s.sourceVertical] = (distribution[s.sourceVertical] ?? 0) + 1;
  }

  return {
    selectedExpansion: selected,
    fullSurface,
    totalCandidatesEvaluated: pool.length,
    candidatesAboveThreshold: scored.filter(c => c.affinityScore > 0.05).length,
    verticalDistribution: distribution,
    durationMs: Math.round(performance.now() - start),
  };
}

/** Get the total number of primitives in the universal pool */
export function getUniversalPoolSize(): number {
  return getPool().length;
}

/** Get pool breakdown by source vertical */
export function getUniversalPoolBreakdown(): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const tagged of getPool()) {
    breakdown[tagged.sourceVertical] = (breakdown[tagged.sourceVertical] ?? 0) + 1;
  }
  return breakdown;
}

/** Clear cached pool (for testing) */
export function resetUniversalPool(): void {
  _cachedPool = null;
}
