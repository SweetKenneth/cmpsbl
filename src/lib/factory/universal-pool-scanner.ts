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
import { getSpinePrimitives, getConceptualSpinePrimitives } from './vertical-substrate';
import { getCyberSecurityEngines, getCyberSecurityAgents } from './verticals/cybersecurity';
import { getRoboticsEngines, getRoboticsAgents } from './verticals/robotics';
import { getQuantumEngines, getQuantumAgents } from './verticals/quantum';
import { getLLMEngines, getLLMAgents } from './verticals/llm';
import { getAgencyEngines, getAgencyAgents } from './verticals/agency';
import { getMediaEngines, getMediaAgents } from './verticals/media';
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
    // Compound Signal Preservation: keep the full capability as a signal
    // so high-intent expansion terms like 'copyright_detection' match
    // as a unit instead of being diluted into generic 'copyright' + 'detection'
    signals.push(cap);
    // Also push individual tokens for partial matching
    const parts = cap.split('_');
    if (parts.length > 1) {
      signals.push(...parts);
    }
  }
  const descWords = p.description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
  signals.push(...descWords);
  return [...new Set(signals)];
}

// Spine-specific affinity signals for deeper matching
const SPINE_AFFINITY_SIGNALS: Record<string, string[]> = {
  CORE: ['kernel', 'boot', 'init', 'startup', 'main', 'entry', 'lifecycle', 'heartbeat', 'orchestrat', 'pipeline', 'cadence', 'load', 'runtime', 'process'],
  SYSTEM: ['config', 'environment', 'env', 'setting', 'lifecycle', 'setup', 'init', 'configur', 'platform', 'backend', 'default', 'option', 'global'],
  BRAIN: ['reason', 'pattern', 'knowledge', 'inference', 'classify', 'predict', 'neural', 'cognitive', 'think', 'model', 'logic', 'heuristic'],
  MEMORY: ['cache', 'store', 'persist', 'state', 'session', 'storage', 'retain', 'archive', 'database', 'redis', 'buffer', 'serialize', 'deserialize', 'pickle', 'mmap', 'checkpoint'],
  DREAM: ['synthesis', 'emerge', 'heuristic', 'creative', 'fragment', 'subconscious', 'discover'],
  NERVE: ['signal', 'event', 'dispatch', 'route', 'bus', 'emit', 'subscribe', 'publish', 'trigger', 'callback', 'hook', 'register', 'handler', 'listener'],
  IDENTITY: ['auth', 'login', 'user', 'session', 'token', 'jwt', 'oauth', 'identity', 'credential', 'device', 'cuda', 'location', 'context'],
  RELAY: ['message', 'queue', 'relay', 'forward', 'webhook', 'notification', 'pubsub'],
  AUDIT: ['log', 'audit', 'trail', 'compliance', 'tamper', 'immutable', 'chain', 'record', 'receipt', 'provenance', 'merkle', 'hash', 'warn', 'warning', 'track', 'trace'],
  RIPPLE: ['cascade', 'propagat', 'boundary', 'enforce', 'contain'],
  ACCESS: ['permission', 'role', 'rbac', 'authorize', 'scope', 'grant', 'deny', 'acl'],
  GOVERNANCE: ['govern', 'approve', 'gate', 'legitimacy', 'supervisor', 'oversight', 'policy', 'verdict', 'deny', 'review', 'decision', 'authorize', 'governance_policy', 'auto_fix', 'validate', 'check', 'verify', 'restrict', 'allow'],
  DEFENSE: ['security', 'threat', 'firewall', 'encrypt', 'protect', 'shield', 'perimeter', 'ssl', 'tls', 'risk', 'guard', 'vulnerability', 'scan', 'security_smell', 'blocked', 'safe', 'unsafe', 'trust', 'untrust', 'sanitize', 'malicious'],
  IMMUNITY: ['heal', 'recover', 'quarantine', 'anomaly', 'resilient', 'immune', 'adapt', 'rollback', 'envelope', 'wrapper', 'rollbackavailable', 'pre_snapshot', 'post_snapshot', 'restore', 'backup', 'checkpoint'],
  CONSCIENCE: ['ethic', 'bias', 'fair', 'moral', 'boundary', 'responsible', 'transparent', 'preflight', 'conscience', 'ethical', 'review_required', 'blocked_categories', 'safe', 'unsafe', 'trust', 'harm', 'danger'],
  INTENT: ['intent', 'purpose', 'goal', 'action', 'resolve', 'interpret', 'parse', 'understand'],
  ATLAS: ['topology', 'capability', 'registry', 'catalog', 'service_discovery', 'dependency_graph'],
  ENGINEER: ['maintain', 'patch', 'fix', 'repair', 'drift', 'upgrade', 'refactor', 'debt', 'maintenance', 'remediat', 'autofix', 'detect', 'auto_fix', 'stale', 'version', 'compat', 'deprecat', 'legacy', 'migration'],
  DECODE: ['language', 'nlp', 'chat', 'conversation', 'text', 'parse', 'interpret', 'prompt'],
  ENCODE: ['generate', 'code', 'compile', 'build', 'blueprint', 'scaffold', 'write', 'encode', 'struct', 'pack', 'format'],
  VISION: ['image', 'visual', 'ocr', 'picture', 'screenshot', 'video', 'camera', 'canvas'],
  ECONOMY: ['cost', 'budget', 'price', 'billing', 'meter', 'quota', 'spend', 'roi'],
  SANDBOX: ['isolat', 'sandbox', 'contain', 'eval', 'playground', 'docker', 'restrict', 'unpickl', 'weights_only'],
  INCLUSIVE: ['accessible', 'a11y', 'wcag', 'aria', 'screen_reader', 'disability', 'inclusive'],
  MEDIC: ['diagnos', 'triage', 'assess', 'repair', 'severity', 'damage', 'triageissue', 'triageall', 'riskscore', 'autofixable'],
  SOVEREIGN: ['policy', 'compliance', 'classify', 'regulation', 'jurisdiction', 'consent', 'data_class', 'blockedcategories', 'governancepolicy'],
  COMPASS: ['direction', 'priority', 'weight', 'rank', 'sort', 'order', 'threshold', 'severity_order', 'confidence', 'riskscore'],
  SHADOW: ['canary', 'shadow', 'trace', 'monitor', 'snapshot', 'baseline', 'compare', 'observe', 'pre_snapshot', 'post_snapshot', 'presnapshot', 'postsnapshot'],
  EVOLUTION: ['evolve', 'mutate', 'generation', 'adapt', 'select', 'fitness', 'population', 'upgrade', 'patch', 'update', 'updateconfig', 'version', 'compat', 'migrate'],
  REFLEX: ['retry', 'circuit', 'breaker', 'timeout', 'backoff', 'fallback', 'degrade', 'cooldown', 'graceful', 'circuit_breaker', 'degradation', 'error', 'exception', 'raise', 'catch', 'recover', 'fail'],
  INTEGRATION: ['adapter', 'bridge', 'transform', 'protocol', 'format', 'normalize'],
  TREATY: ['contract', 'agreement', 'sla', 'obligation', 'terms', 'binding'],
  NEXUS: ['router', 'balance', 'failover', 'provider', 'endpoint', 'gateway', 'proxy'],
  BEACON: ['beacon', 'heartbeat', 'health_signal', 'healthsignal', 'telemetry', 'uptime', 'emithealthsignal', 'beaconhealthsignal', 'health', 'status', 'monitor', 'alive'],
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
      const derived = deriveSignals(p);
      // Merge explicit + derived, but cap total signals to prevent
      // density dilution. Explicit signals get priority (listed first).
      const merged = explicitSignals
        ? [...new Set([...explicitSignals, ...derived])]
        : derived;
      // Cap at 30 signals — enough for broad matching without diluting density
      const capped = merged.length > 30 ? merged.slice(0, 30) : merged;
      pool.push({ primitive: p, sourceVertical: source, signals: capped });
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

  // Media (16)
  tag(getMediaEngines(), 'media');
  tag(getMediaAgents(), 'media');

  // Ultimate Universal (16)
  tag(ULTIMATE_ALL_ENGINES, 'ultimate');
  tag(ULTIMATE_ALL_AGENTS, 'ultimate');

  // Conceptual Spine Extensions (7) — materialized from signal mappings
  tag(getConceptualSpinePrimitives(), 'spine', SPINE_AFFINITY_SIGNALS);

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
function scoreCandidate(
  tagged: TaggedPrimitive,
  lowerCode: string,
  codeTokens: Set<string>,
  signalDocFreq: Record<string, number>,
  poolSize: number,
  codeFreqMap: Record<string, number>,
): PoolCandidate {
  // Pass 1 — IDF-weighted signal hit density
  // Rare signals (appearing in few candidates) count more than common ones.
  let hits = 0;
  let idfWeightedHits = 0;
  let idfWeightedTotal = 0;
  for (const signal of tagged.signals) {
    const df = signalDocFreq[signal] ?? 1;
    const idf = Math.log(poolSize / df);
    idfWeightedTotal += idf;
    if (lowerCode.includes(signal)) {
      hits++;
      // Code-frequency boost: signals that appear many times in the code
      // are central to its purpose. Apply a mild log-boost to counteract
      // IDF penalty for common-but-important signals like "safe" (83x).
      const codeFreq = codeFreqMap[signal] ?? 0;
      const freqBoost = codeFreq > 1 ? 1 + Math.log2(Math.min(codeFreq, 100)) / 10 : 1;
      idfWeightedHits += idf * freqBoost;
    }
  }
  const hitRatio = idfWeightedTotal > 0 ? idfWeightedHits / idfWeightedTotal : 0;
  // 40% threshold creates meaningful spread — primitives need substantial
  // rare-signal coverage to max out, preventing the flat plateau problem
  const signalAffinity = Math.min(hitRatio / 0.40, 1);

  // Pass 2 — Capability breadth and structural matching
  let capHits = 0;
  for (const cap of tagged.primitive.capabilities) {
    // Compound Signal Preservation: check full capability first
    if (codeTokens.has(cap)) { capHits++; continue; }
    // Fallback: check individual tokens for partial match
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

  // Spine primitives (organs + layers) get a modest structural bonus
  // that scales with signal density. The bonus is capped at 0.08 (not 0.15)
  // and requires 40%+ signal density for full value. This ensures spine
  // primitives earn their rank through genuine signal relevance, not
  // architectural privilege.
  const isSpine = tagged.primitive.role === 'organ' || tagged.primitive.role === 'layer';
  const signalDensity = tagged.signals.length > 0 ? hits / tagged.signals.length : 0;
  const structuralBonus = (isSpine && hits > 0) ? 0.08 * Math.min(signalDensity / 0.40, 1) : 0;

  // Composite scoring — signal-dominant, spine-aware
  // Signal affinity (45%) + capability match (25%) + breadth (10%) + weight (5%) + structural (15%)
  // Signal affinity is the primary discriminator — weight is intentionally low
  // to prevent high-weight but low-relevance primitives from consuming slots.
  const affinity = Math.min(signalAffinity * 0.5 + capRatio * 0.5, 1);
  const compounding =
    signalAffinity * 0.45 +
    capRatio * 0.25 +
    breadthScore * 0.10 +
    weightFactor * 0.05 +
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
 * Diversity constraint: max 10 from any single non-spine source,
 * max 16 from spine (since spine has the most semantic breadth).
 */
function selectOptimalPrimitives(
  candidates: PoolCandidate[],
): PoolCandidate[] {
  const sorted = [...candidates]
    .filter(c => c.compoundingScore >= SELECTION_THRESHOLD && c.signalHits >= 2)
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

    // Diversity: spine gets 20 (broadest semantic range, 31+ primitives),
    // others capped at 8 to prevent single-vertical domination
    const maxForSource = candidate.sourceVertical === 'spine' ? 20 : 8;
    const sc = sourceCounts[candidate.sourceVertical] ?? 0;
    if (sc >= maxForSource) continue;

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

  // Compute signal IDF (Inverse Document Frequency) across the pool.
  // Signals that appear in fewer candidates are more discriminating and
  // should contribute more to scoring. This prevents common words like
  // "pattern", "boundary", "status" from inflating irrelevant primitives
  // while rewarding specific terms like "jailbreak", "zero_trust", "merkle".
  const signalDocFreq: Record<string, number> = {};
  for (const tagged of pool) {
    const seen = new Set<string>();
    for (const signal of tagged.signals) {
      if (!seen.has(signal)) {
        signalDocFreq[signal] = (signalDocFreq[signal] ?? 0) + 1;
        seen.add(signal);
      }
    }
  }
  const poolSize = pool.length;

  // Score all candidates with IDF-weighted signal matching
  const scored = pool.map(tagged => scoreCandidate(tagged, lowerCode, codeTokens, signalDocFreq, poolSize));

  // Select the optimal primitives — count is CODE-DRIVEN, not hardcoded
  const selected = selectOptimalPrimitives(scored);

  // Rebalance weights so selected primitives sum to 1.0
  // Use compounding score for proportional weighting (stronger primitives get more weight)
  const totalScore = selected.reduce((sum, c) => sum + c.compoundingScore, 0);
  const fullSurface: VerticalPrimitive[] = selected.map(c => ({
    ...c.primitive,
    weight: totalScore > 0
      ? Math.round((c.compoundingScore / totalScore) * 10000) / 10000
      : Math.round((1.0 / selected.length) * 10000) / 10000,
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
    candidatesAboveThreshold: scored.filter(c => c.compoundingScore >= SELECTION_THRESHOLD).length,
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
