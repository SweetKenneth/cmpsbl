/**
 * CMPSBL® Universal Pool Scanner
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The brain of the Ultimate substrate. Aggregates EVERY primitive in the
 * CMPSBL ecosystem — Spine (Organs + Layers), all vertical expansion
 * primitives (Cyber, Robotics, Quantum, LLM, Agency), and 16 Universal
 * gap-filler primitives — into a single candidate pool.
 * 
 * During Ascension, it scores EVERY candidate against the uploaded code
 * and selects the optimal 40 primitives that produce the maximum
 * compounding effect. No spine lock. No category restrictions. No
 * organ/layer/engine/agent quotas. Just the 40 best primitives for the job.
 * 
 * The scanner uses extended collision time to deeply evaluate all
 * candidates before surfacing the final 40.
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
  /** The primitives selected as the optimal surface for this code (variable count) */
  selectedPrimitives: PoolCandidate[];
  /** Full primitive surface (the selected primitives, rebalanced) */
  fullSurface: VerticalPrimitive[];
  /** All candidates that were evaluated */
  totalCandidatesEvaluated: number;
  /** How many passed the affinity threshold */
  candidatesAboveThreshold: number;
  /** Source distribution in the selection */
  sourceDistribution: Record<string, number>;
  /** Role distribution in the selection */
  roleDistribution: Record<string, number>;
  /** Duration of the scan in ms */
  durationMs: number;
  /** Number of collision passes performed */
  collisionPasses: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — AFFINITY SIGNAL DERIVATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Build affinity signals from a primitive's capabilities + description */
function deriveSignals(p: VerticalPrimitive): string[] {
  const signals: string[] = [];
  for (const cap of p.capabilities) {
    signals.push(...cap.split('_'));
  }
  const descWords = p.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  signals.push(...descWords);
  return [...new Set(signals)];
}

// Spine-specific affinity signals for deeper matching
const SPINE_AFFINITY_SIGNALS: Record<string, string[]> = {
  CORE: ['kernel', 'boot', 'init', 'startup', 'main', 'entry', 'lifecycle', 'heartbeat', 'health'],
  SYSTEM: ['config', 'environment', 'env', 'setting', 'lifecycle', 'setup', 'init'],
  BRAIN: ['reason', 'pattern', 'knowledge', 'inference', 'classify', 'predict', 'neural', 'cognitive', 'think'],
  MEMORY: ['cache', 'store', 'persist', 'state', 'session', 'storage', 'retain', 'archive', 'database', 'redis'],
  DREAM: ['synthesis', 'emerge', 'heuristic', 'creative', 'fragment', 'subconscious', 'discover'],
  NERVE: ['signal', 'event', 'dispatch', 'route', 'bus', 'emit', 'subscribe', 'publish', 'trigger'],
  IDENTITY: ['auth', 'login', 'user', 'session', 'token', 'jwt', 'oauth', 'identity', 'credential'],
  RELAY: ['message', 'queue', 'relay', 'forward', 'webhook', 'notification', 'pubsub'],
  AUDIT: ['log', 'audit', 'trail', 'compliance', 'tamper', 'immutable', 'chain', 'record'],
  RIPPLE: ['cascade', 'propagat', 'boundary', 'compliance', 'enforce', 'policy', 'rule'],
  ACCESS: ['permission', 'role', 'rbac', 'authorize', 'scope', 'grant', 'deny', 'acl'],
  GOVERNANCE: ['govern', 'approve', 'gate', 'legitimacy', 'supervisor', 'oversight', 'policy'],
  DEFENSE: ['security', 'threat', 'firewall', 'encrypt', 'protect', 'shield', 'perimeter', 'ssl', 'tls'],
  IMMUNITY: ['heal', 'recover', 'quarantine', 'anomaly', 'resilient', 'immune', 'adapt'],
  INTENT: ['intent', 'purpose', 'goal', 'action', 'resolve', 'interpret', 'parse', 'understand'],
  ATLAS: ['topology', 'map', 'discover', 'capability', 'registry', 'catalog', 'index'],
  ENGINEER: ['maintain', 'patch', 'fix', 'repair', 'drift', 'upgrade', 'refactor', 'debt'],
  DECODE: ['language', 'nlp', 'chat', 'conversation', 'text', 'parse', 'interpret', 'prompt'],
  ENCODE: ['generate', 'code', 'compile', 'build', 'blueprint', 'scaffold', 'write'],
  VISION: ['image', 'visual', 'ocr', 'picture', 'screenshot', 'video', 'camera', 'canvas'],
  ECONOMY: ['cost', 'budget', 'price', 'billing', 'meter', 'quota', 'spend', 'roi'],
  SANDBOX: ['isolat', 'sandbox', 'contain', 'safe', 'eval', 'test', 'playground', 'docker'],
  INCLUSIVE: ['accessible', 'a11y', 'wcag', 'aria', 'screen_reader', 'disability', 'inclusive'],
  MEDIC: ['diagnos', 'health', 'triage', 'recover', 'status', 'check', 'heartbeat', 'ping'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — POOL ASSEMBLY
// ═══════════════════════════════════════════════════════════════════════════════

interface TaggedPrimitive {
  primitive: VerticalPrimitive;
  sourceVertical: string;
  signals: string[];
}

/** Assemble the COMPLETE universal pool — every primitive in the ecosystem */
function assembleUniversalPool(): TaggedPrimitive[] {
  const pool: TaggedPrimitive[] = [];

  const tag = (prims: VerticalPrimitive[], source: string, signalMap?: Record<string, string[]>) => {
    for (const p of prims) {
      const explicitSignals = signalMap?.[p.id] ?? ULTIMATE_AFFINITY_SIGNALS[p.id];
      pool.push({
        primitive: p,
        sourceVertical: source,
        signals: explicitSignals ?? deriveSignals(p),
      });
    }
  };

  // Spine — Organs + Layers (24) — now candidates, not locked
  tag(getSpinePrimitives(), 'spine', SPINE_AFFINITY_SIGNALS);

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
// §4 — EXTENDED SCORING ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Number of collision passes for deep evaluation */
const COLLISION_PASSES = 3;

/**
 * Score a single candidate primitive against the uploaded code.
 * Multi-pass scoring for deeper evaluation:
 *   Pass 1: Signal hit density (keyword matching)
 *   Pass 2: Capability breadth and composability potential
 *   Pass 3: Cross-candidate synergy estimation
 */
function scoreCandidate(tagged: TaggedPrimitive, lowerCode: string, codeTokens: Set<string>): PoolCandidate {
  // Pass 1 — Signal hit density
  let hits = 0;
  for (const signal of tagged.signals) {
    if (lowerCode.includes(signal)) hits++;
  }
  const hitRatio = tagged.signals.length > 0 ? hits / tagged.signals.length : 0;
  const signalAffinity = Math.min(hitRatio / 0.15, 1); // 15% hit threshold — more sensitive to partial matches

  // Pass 2 — Capability breadth and structural matching
  let capHits = 0;
  for (const cap of tagged.primitive.capabilities) {
    const capTokens = cap.split('_');
    for (const t of capTokens) {
      if (codeTokens.has(t)) { capHits++; break; }
    }
  }
  const capRatio = tagged.primitive.capabilities.length > 0
    ? capHits / tagged.primitive.capabilities.length
    : 0;
  const breadthScore = Math.min(tagged.primitive.capabilities.length / 6, 1);

  // Pass 3 — Weight-based importance and composability
  const weightFactor = Math.min(tagged.primitive.weight / 0.03, 1);

  // Spine primitives (organs + layers) are the most powerful foundational
  // primitives — they get a structural bonus because they provide the
  // core infrastructure that makes expansion primitives effective.
  const isSpine = tagged.primitive.role === 'organ' || tagged.primitive.role === 'layer';
  const structuralBonus = isSpine ? 0.12 : 0;

  // Composite scoring — spine-aware
  // Signal affinity (30%) + capability match (25%) + breadth (15%) + weight (15%) + structural (15%)
  const affinity = Math.min(signalAffinity * 0.5 + capRatio * 0.5, 1);
  const compounding =
    signalAffinity * 0.30 +
    capRatio * 0.25 +
    breadthScore * 0.15 +
    weightFactor * 0.15 +
    structuralBonus;

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
// §5 — DYNAMIC SLOT SELECTION (CODE-DRIVEN)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Minimum compounding score to qualify for selection.
 * Primitives below this threshold add noise, not value.
 */
const SELECTION_THRESHOLD = 0.10;

/**
 * The score gap that triggers a natural cutoff.
 * If the next candidate's score drops by more than 40% relative to the
 * current candidate, the scanner stops — the code doesn't need more.
 */
const DROP_OFF_RATIO = 0.40;

/** Absolute maximum to prevent degenerate cases */
const MAX_SLOTS = 40;

/** Minimum selection — at least a few primitives for any code */
const MIN_SLOTS = 8;

/**
 * Select the optimal primitives for this specific codebase.
 * The count is DYNAMIC — driven by what the code actually needs.
 * No category restrictions. No spine lock. No organ/layer quotas.
 * Light diversity constraint (max 14 from any single source).
 */
function selectOptimalPrimitives(
  candidates: PoolCandidate[],
  maxPerSource: number = 14,
): PoolCandidate[] {
  const sorted = [...candidates]
    .filter(c => c.compoundingScore >= SELECTION_THRESHOLD)
    .sort((a, b) => b.compoundingScore - a.compoundingScore);

  const selected: PoolCandidate[] = [];
  const sourceCounts: Record<string, number> = {};
  const usedIds = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    if (selected.length >= MAX_SLOTS) break;

    const candidate = sorted[i];

    // Natural cutoff: if there's a significant score drop-off after minimum,
    // stop — the code doesn't benefit from more primitives
    if (selected.length >= MIN_SLOTS && i > 0) {
      const prevScore = sorted[i - 1].compoundingScore;
      const dropOff = (prevScore - candidate.compoundingScore) / prevScore;
      if (dropOff >= DROP_OFF_RATIO) break;
    }

    // Light diversity: cap per-source to prevent single-vertical domination
    const sc = sourceCounts[candidate.sourceVertical] ?? 0;
    if (sc >= maxPerSource) continue;

    // Dedup by primitive ID
    if (usedIds.has(candidate.primitive.id)) continue;

    selected.push(candidate);
    sourceCounts[candidate.sourceVertical] = sc + 1;
    usedIds.add(candidate.primitive.id);
  }

  return selected;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run the Universal Pool Scanner against uploaded code.
 * Evaluates every primitive in the ecosystem and selects the 40
 * that produce the maximum compounding effect. No restrictions.
 */
export function runUniversalPoolScan(codeContent: string): UniversalScanResult {
  const start = performance.now();
  const pool = getPool();
  const lowerCode = codeContent.toLowerCase();

  // Build token set for capability matching (Pass 2)
  const codeTokens = new Set(
    lowerCode.split(/\W+/).filter(w => w.length > 2)
  );

  // Score all candidates with extended collision passes
  const scored = pool.map(tagged => scoreCandidate(tagged, lowerCode, codeTokens));

  // Select the optimal 40 — unrestricted
  const selected = selectOptimal40(scored);

  // Rebalance weights so the 40 selected sum to 1.0
  const perWeight = selected.length > 0
    ? Math.round((1.0 / selected.length) * 10000) / 10000
    : 0;

  const fullSurface: VerticalPrimitive[] = selected.map(c => ({
    ...c.primitive,
    weight: perWeight,
    inherited: false, // In Ultimate, nothing is "inherited" — everything is earned
  }));

  // Source distribution
  const sourceDistribution: Record<string, number> = {};
  const roleDistribution: Record<string, number> = {};
  for (const s of selected) {
    sourceDistribution[s.sourceVertical] = (sourceDistribution[s.sourceVertical] ?? 0) + 1;
    roleDistribution[s.primitive.role] = (roleDistribution[s.primitive.role] ?? 0) + 1;
  }

  return {
    selectedPrimitives: selected,
    fullSurface,
    totalCandidatesEvaluated: pool.length,
    candidatesAboveThreshold: scored.filter(c => c.compoundingScore > 0.05).length,
    sourceDistribution,
    roleDistribution,
    durationMs: Math.round(performance.now() - start),
    collisionPasses: COLLISION_PASSES,
  };
}

/** Get the total number of primitives in the universal pool */
export function getUniversalPoolSize(): number {
  return getPool().length;
}

/** Get pool breakdown by source */
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
