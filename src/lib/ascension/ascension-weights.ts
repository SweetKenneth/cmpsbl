/**
 * CMPSBL® Ascension Weight Matrix
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Dual-matrix architecture: substrate weights govern boot order
 * and chain stability; Ascension weights govern scanning priority
 * for code augmentation.
 *
 * Two scoring dimensions:
 *   • Gap Closure (0–1): How universally absent is this capability
 *     from real-world software? Higher = almost nobody implements it.
 *   • Wow Factor (0–1): How category-defining is this capability?
 *     Higher = only CMPSBL delivers this, strong brand impression.
 *
 * The Ascension boost = weighted blend that replaces the static
 * structural bonus in the scanner.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface AscensionWeight {
  /** Primitive name (uppercase) */
  primitive: string;
  /** How universally missing this capability is from real software (0–1) */
  gapClosure: number;
  /** How category-defining / brand-differentiating this is (0–1) */
  wowFactor: number;
  /** Brief rationale for the rating */
  rationale: string;
}

export type AscensionMode = 'ascension' | 'memorystream' | 'substrate';

/**
 * Blend weights per mode.
 * Ascension: heavily gap + wow weighted (augmenting external code)
 * Memory Stream: balanced (autonomous discovery benefits from both)
 * Substrate: structural bonus only (boot order, chain integrity)
 */
const MODE_BLEND: Record<AscensionMode, { gap: number; wow: number }> = {
  ascension:    { gap: 0.65, wow: 0.35 },
  memorystream: { gap: 0.50, wow: 0.50 },
  substrate:    { gap: 0.00, wow: 0.00 }, // Falls back to structural bonus
};

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SPINE PRIMITIVES — ASCENSION PERSPECTIVE
// ═══════════════════════════════════════════════════════════════════════════════
//
// These ratings answer: "When scanning external code for augmentation,
// how valuable is this primitive?" — NOT "How important is it to substrate
// boot order?"
//
// Gap Closure: based on empirical analysis of what ALL software tends to
// lack (error handling, observability, governance, cost control).
//
// Wow Factor: based on differentiation — things only CMPSBL delivers that
// create "how did it know to do that?" moments.
// ═══════════════════════════════════════════════════════════════════════════════

const SPINE_WEIGHTS: AscensionWeight[] = [
  // ── ORGANS ──────────────────────────────────────────────────────────────────

  {
    primitive: 'CORE',
    gapClosure: 0.20,
    wowFactor: 0.15,
    rationale: 'Kernel integrity is foundational but most code already has a main entry point. Low augmentation value.',
  },
  {
    primitive: 'SYSTEM',
    gapClosure: 0.25,
    wowFactor: 0.10,
    rationale: 'Config management is common (dotenv, yaml). Low gap, low wow.',
  },
  {
    primitive: 'BRAIN',
    gapClosure: 0.55,
    wowFactor: 0.70,
    rationale: 'Reasoning and pattern recognition is rare in user code. High wow — "it thinks about your code."',
  },
  {
    primitive: 'MEMORY',
    gapClosure: 0.65,
    wowFactor: 0.60,
    rationale: 'Structured persistent state with semantic search is almost never implemented. Strong gap + wow.',
  },
  {
    primitive: 'NERVE',
    gapClosure: 0.30,
    wowFactor: 0.20,
    rationale: 'Event routing exists in most frameworks. Structural primitive, not augmentative.',
  },
  {
    primitive: 'NEXUS',
    gapClosure: 0.50,
    wowFactor: 0.55,
    rationale: 'Multi-model AI routing with failover is rare. Good gap closure, good wow for AI-heavy code.',
  },
  {
    primitive: 'IDENTITY',
    gapClosure: 0.45,
    wowFactor: 0.30,
    rationale: 'Identity resolution beyond basic auth (fingerprinting, behavioral hashing) is uncommon.',
  },
  {
    primitive: 'SOVEREIGN',
    gapClosure: 0.85,
    wowFactor: 0.65,
    rationale: 'GDPR/HIPAA data sovereignty is almost universally absent. Massive gap, strong brand signal.',
  },
  {
    primitive: 'ATLAS',
    gapClosure: 0.35,
    wowFactor: 0.40,
    rationale: 'Governance hubs are niche. Moderate gap, moderate wow.',
  },
  {
    primitive: 'MEDIC',
    gapClosure: 0.75,
    wowFactor: 0.80,
    rationale: 'Self-healing diagnostics are extremely rare. "It fixed itself" is peak wow.',
  },
  {
    primitive: 'RELAY',
    gapClosure: 0.30,
    wowFactor: 0.15,
    rationale: 'Message relay is infrastructure plumbing. Common in microservices, low augmentation value.',
  },
  {
    primitive: 'CONSCIENCE',
    gapClosure: 0.90,
    wowFactor: 0.85,
    rationale: 'Ethical bias detection in code is virtually nonexistent. Maximum gap, maximum differentiation.',
  },

  // ── LAYERS ──────────────────────────────────────────────────────────────────

  {
    primitive: 'DEFENSE',
    gapClosure: 0.80,
    wowFactor: 0.50,
    rationale: 'Input validation and security boundaries are chronically missing. Huge gap, expected-but-valued wow.',
  },
  {
    primitive: 'IMMUNITY',
    gapClosure: 0.75,
    wowFactor: 0.60,
    rationale: 'Adaptive threat resilience beyond basic try/catch is rare. Strong gap, good wow.',
  },
  {
    primitive: 'GOVERNANCE',
    gapClosure: 0.70,
    wowFactor: 0.45,
    rationale: 'Policy enforcement and supervisory control is almost never built into app code.',
  },
  {
    primitive: 'TREATY',
    gapClosure: 0.60,
    wowFactor: 0.40,
    rationale: 'SLA management and contract compliance is typically external tooling, not embedded.',
  },
  {
    primitive: 'EVOLUTION',
    gapClosure: 0.70,
    wowFactor: 0.75,
    rationale: 'Self-evolving code with version management is extremely rare. High wow — "it upgrades itself."',
  },
  {
    primitive: 'REFLEX',
    gapClosure: 0.80,
    wowFactor: 0.45,
    rationale: 'Circuit breakers, anomaly alerting at edge — chronically missing from most codebases.',
  },
  {
    primitive: 'COMPASS',
    gapClosure: 0.40,
    wowFactor: 0.35,
    rationale: 'Geospatial analysis is domain-specific. Moderate gap for general code.',
  },
  {
    primitive: 'INTEGRATION',
    gapClosure: 0.35,
    wowFactor: 0.20,
    rationale: 'External connectivity is table stakes. Most frameworks handle this.',
  },
  {
    primitive: 'INTENT',
    gapClosure: 0.65,
    wowFactor: 0.55,
    rationale: 'Cross-signal translation and goal decomposition is rare outside AI pipelines.',
  },
  {
    primitive: 'ACCESS',
    gapClosure: 0.70,
    wowFactor: 0.30,
    rationale: 'Proper auth/quota enforcement is frequently bolted on poorly. High gap, expected wow.',
  },
  {
    primitive: 'VISION',
    gapClosure: 0.75,
    wowFactor: 0.50,
    rationale: 'Telemetry and observability is typically an afterthought. Strong gap closure.',
  },
  {
    primitive: 'SHADOW',
    gapClosure: 0.55,
    wowFactor: 0.70,
    rationale: 'Shadow runs and A/B testing at the primitive level is unique to CMPSBL. High wow.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — EXPANSION PRIMITIVES — ASCENSION PERSPECTIVE
// ═══════════════════════════════════════════════════════════════════════════════

const EXPANSION_WEIGHTS: AscensionWeight[] = [
  // ── ENGINES ─────────────────────────────────────────────────────────────────

  {
    primitive: 'DREAM',
    gapClosure: 0.50,
    wowFactor: 0.95,
    rationale: 'Category-defining. No competitor offers autonomous heuristic synthesis. Peak brand magic.',
  },
  {
    primitive: 'HARVEST',
    gapClosure: 0.55,
    wowFactor: 0.35,
    rationale: 'Data acquisition/ETL is common but rarely embedded. Moderate gap, functional wow.',
  },
  {
    primitive: 'FORGE',
    gapClosure: 0.60,
    wowFactor: 0.65,
    rationale: 'Artifact manufacturing and cognitive minting is unique. "It builds things from your code."',
  },
  {
    primitive: 'LINGUA',
    gapClosure: 0.45,
    wowFactor: 0.40,
    rationale: 'Translation/i18n is well-served by existing tools. Moderate gap.',
  },
  {
    primitive: 'ECHO',
    gapClosure: 0.65,
    wowFactor: 0.75,
    rationale: 'Digital twin simulation and scenario replay is rare. Strong wow — "it simulates your system."',
  },
  {
    primitive: 'PHANTOM',
    gapClosure: 0.70,
    wowFactor: 0.80,
    rationale: 'Decoy operations and counter-intelligence is virtually nonexistent in app code. Peak differentiation.',
  },
  {
    primitive: 'SANDBOX',
    gapClosure: 0.75,
    wowFactor: 0.45,
    rationale: 'Safe isolated execution is chronically missing. High gap, expected wow.',
  },
  {
    primitive: 'RIPPLE',
    gapClosure: 0.40,
    wowFactor: 0.30,
    rationale: 'Event cascade management exists in message brokers. Lower augmentation priority.',
  },

  // ── AGENTS ──────────────────────────────────────────────────────────────────

  {
    primitive: 'ENCODE',
    gapClosure: 0.45,
    wowFactor: 0.55,
    rationale: 'Code generation is not a gap per se, but AST-aware build planning is differentiated.',
  },
  {
    primitive: 'DECODE',
    gapClosure: 0.50,
    wowFactor: 0.50,
    rationale: 'NLU and intent classification adds value but is available via third-party APIs.',
  },
  {
    primitive: 'AUDIT',
    gapClosure: 0.85,
    wowFactor: 0.55,
    rationale: 'Tamper-evident logging with Merkle chain integrity is almost never implemented. Massive gap.',
  },
  {
    primitive: 'ECONOMY',
    gapClosure: 0.80,
    wowFactor: 0.60,
    rationale: 'Cost tracking and budget governance is universally missing from developer code.',
  },
  {
    primitive: 'INCLUSIVE',
    gapClosure: 0.85,
    wowFactor: 0.50,
    rationale: 'Accessibility scanning is chronically absent. Huge gap. Increasingly regulated.',
  },
  {
    primitive: 'CORTEX',
    gapClosure: 0.55,
    wowFactor: 0.65,
    rationale: 'Multi-step pipeline orchestration with SLA monitoring is rare outside enterprise.',
  },
  {
    primitive: 'ORACLE',
    gapClosure: 0.70,
    wowFactor: 0.80,
    rationale: 'Bayesian inference and Monte Carlo simulation embedded in app code is unique. High wow.',
  },
  {
    primitive: 'ENGINEER',
    gapClosure: 0.60,
    wowFactor: 0.55,
    rationale: 'Maintenance intelligence and health scanning is uncommon. Good gap, good wow.',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — LOOKUP & COMPUTATION
// ═══════════════════════════════════════════════════════════════════════════════

/** Indexed lookup for O(1) access */
const _index = new Map<string, AscensionWeight>();

function ensureIndex(): void {
  if (_index.size > 0) return;
  for (const w of [...SPINE_WEIGHTS, ...EXPANSION_WEIGHTS]) {
    _index.set(w.primitive.toUpperCase(), w);
  }
}

/**
 * Get the Ascension weight entry for a primitive.
 * Returns null for vertical expansion primitives that don't have
 * explicit ratings — those use a default moderate profile.
 */
export function getAscensionWeight(primitiveName: string): AscensionWeight | null {
  ensureIndex();
  return _index.get(primitiveName.toUpperCase()) ?? null;
}

/**
 * Compute the Ascension boost for a primitive in a given mode.
 *
 * Returns a value from 0.00 to 0.15 that replaces the static
 * structural bonus in the scanner.
 *
 * For substrate mode, returns 0 — the scanner falls back to
 * its existing structural bonus logic.
 */
export function computeAscensionBoost(
  primitiveName: string,
  mode: AscensionMode,
): number {
  if (mode === 'substrate') return 0;

  const blend = MODE_BLEND[mode];
  const w = getAscensionWeight(primitiveName);

  if (!w) {
    // Vertical expansion primitives without explicit ratings
    // get a moderate default (0.40 gap, 0.30 wow)
    const defaultScore = 0.40 * blend.gap + 0.30 * blend.wow;
    return Math.round(defaultScore * 0.15 * 1000) / 1000;
  }

  // Weighted blend capped at 0.15 (replaces the old 0.08 structural max)
  const raw = w.gapClosure * blend.gap + w.wowFactor * blend.wow;
  return Math.round(Math.min(raw * 0.15, 0.15) * 1000) / 1000;
}

/**
 * Get all spine + expansion weights sorted by Ascension priority.
 * Useful for diagnostics and the Governor dashboard.
 */
export function getAscensionRankings(mode: AscensionMode = 'ascension'): Array<{
  primitive: string;
  boost: number;
  gapClosure: number;
  wowFactor: number;
  rationale: string;
}> {
  ensureIndex();
  const blend = MODE_BLEND[mode];

  return [..._index.values()]
    .map(w => ({
      primitive: w.primitive,
      boost: computeAscensionBoost(w.primitive, mode),
      gapClosure: w.gapClosure,
      wowFactor: w.wowFactor,
      rationale: w.rationale,
    }))
    .sort((a, b) => b.boost - a.boost);
}

/** Get all weights for a specific dimension */
export function getTopByDimension(
  dimension: 'gapClosure' | 'wowFactor',
  limit = 10,
): AscensionWeight[] {
  ensureIndex();
  return [..._index.values()]
    .sort((a, b) => b[dimension] - a[dimension])
    .slice(0, limit);
}

/** All registered weights */
export function getAllAscensionWeights(): AscensionWeight[] {
  return [...SPINE_WEIGHTS, ...EXPANSION_WEIGHTS];
}
