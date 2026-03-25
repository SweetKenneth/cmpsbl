/**
 * CMPSBL Health Engine v2.0.0 — "Vital Signs"
 * 
 * Criticality-Tiered, 4-Category (Organ/Layer/Engine/Agent) health aggregation
 * with circuit breakers, auto-heal triggers, graceful degradation, and subsystem tracking.
 * 
 * Architecture:
 *   Tier 1 (35%): Mission-critical primitives (CORE, BRAIN, NEXUS, SYSTEM, MEMORY, NERVE, DEFENSE)
 *   Tier 2 (25%): Infrastructure primitives (IDENTITY, RELAY, IMMUNITY, GOVERNANCE, CORTEX, EVOLUTION, INTENT, ACCESS)
 *   Tier 3 (25%): Operational primitives (DECODE, ENCODE, VISION, ECONOMY, DREAM, RIPPLE, INTEGRATION, INCLUSIVE, MEDIC, ATLAS)
 *   Tier 4 (15%): Expansion primitives + subsystems (SOVEREIGN, ORACLE, etc. + Autoblog, CLM, CDM, SEBA, Email, Agency, Edge, DB, Auth, Storage)
 * 
 * Each primitive reports a 0-100 health score. The global score is a weighted composite.
 * A "weakest link" indicator always shows the single lowest-scoring primitive.
 */

// ═══════════════════════════════════════════════════════════════
// TAXONOMY — 12·12·8·8 Symmetric Matrix
// ═══════════════════════════════════════════════════════════════

export type PrimitiveCategory = 'organ' | 'layer' | 'engine' | 'agent';

export interface PrimitiveDefinition {
  id: string;
  name: string;
  category: PrimitiveCategory;
  tier: 1 | 2 | 3 | 4;
  /** Weight within its tier (relative, normalized at calc time) */
  weight: number;
}

// 12 Organs
const ORGANS: PrimitiveDefinition[] = [
  { id: 'core',      name: 'CORE',      category: 'organ', tier: 1, weight: 10 },
  { id: 'system',    name: 'SYSTEM',    category: 'organ', tier: 1, weight: 9 },
  { id: 'brain',     name: 'BRAIN',     category: 'organ', tier: 1, weight: 10 },
  { id: 'memory',    name: 'MEMORY',    category: 'organ', tier: 1, weight: 9 },
  { id: 'nerve',     name: 'NERVE',     category: 'organ', tier: 1, weight: 8 },
  { id: 'nexus',     name: 'NEXUS',     category: 'organ', tier: 1, weight: 10 },
  { id: 'identity',  name: 'IDENTITY',  category: 'organ', tier: 2, weight: 6 },
  { id: 'sovereign', name: 'SOVEREIGN', category: 'organ', tier: 4, weight: 4 },
  { id: 'atlas',     name: 'ATLAS',     category: 'organ', tier: 3, weight: 5 },
  { id: 'medic',     name: 'MEDIC',     category: 'organ', tier: 3, weight: 6 },
  { id: 'relay',     name: 'RELAY',     category: 'organ', tier: 2, weight: 6 },
  { id: 'conscience',name: 'CONSCIENCE',category: 'organ', tier: 4, weight: 3 },
];

// 12 Layers
const LAYERS: PrimitiveDefinition[] = [
  { id: 'defense',    name: 'DEFENSE',    category: 'layer', tier: 1, weight: 10 },
  { id: 'immunity',   name: 'IMMUNITY',   category: 'layer', tier: 2, weight: 7 },
  { id: 'governance', name: 'GOVERNANCE', category: 'layer', tier: 2, weight: 7 },
  { id: 'treaty',     name: 'TREATY',     category: 'layer', tier: 4, weight: 3 },
  { id: 'evolution',  name: 'EVOLUTION',  category: 'layer', tier: 2, weight: 7 },
  { id: 'reflex',     name: 'REFLEX',     category: 'layer', tier: 4, weight: 4 },
  { id: 'compass',    name: 'COMPASS',    category: 'layer', tier: 4, weight: 3 },
  { id: 'integration',name: 'INTEGRATION',category: 'layer', tier: 3, weight: 5 },
  { id: 'intent',     name: 'INTENT',     category: 'layer', tier: 2, weight: 7 },
  { id: 'access',     name: 'ACCESS',     category: 'layer', tier: 2, weight: 7 },
  { id: 'vision',     name: 'VISION',     category: 'layer', tier: 3, weight: 5 },
  { id: 'shadow',     name: 'SHADOW',     category: 'layer', tier: 4, weight: 4 },
];

// 8 Engines
const ENGINES: PrimitiveDefinition[] = [
  { id: 'dream',   name: 'DREAM',   category: 'engine', tier: 3, weight: 6 },
  { id: 'harvest', name: 'HARVEST', category: 'engine', tier: 4, weight: 4 },
  { id: 'forge',   name: 'FORGE',   category: 'engine', tier: 4, weight: 4 },
  { id: 'lingua',  name: 'LINGUA',  category: 'engine', tier: 4, weight: 3 },
  { id: 'echo',    name: 'ECHO',    category: 'engine', tier: 4, weight: 3 },
  { id: 'phantom', name: 'PHANTOM', category: 'engine', tier: 4, weight: 3 },
  { id: 'sandbox', name: 'SANDBOX', category: 'engine', tier: 3, weight: 5 },
  { id: 'ripple',  name: 'RIPPLE',  category: 'engine', tier: 3, weight: 6 },
];

// 8 Agents
const AGENTS: PrimitiveDefinition[] = [
  { id: 'encode',    name: 'ENCODE',    category: 'agent', tier: 3, weight: 6 },
  { id: 'decode',    name: 'DECODE',    category: 'agent', tier: 3, weight: 7 },
  { id: 'audit',     name: 'AUDIT',     category: 'agent', tier: 3, weight: 5 },
  { id: 'economy',   name: 'ECONOMY',   category: 'agent', tier: 3, weight: 6 },
  { id: 'inclusive',  name: 'INCLUSIVE',  category: 'agent', tier: 3, weight: 5 },
  { id: 'cortex',    name: 'CORTEX',    category: 'agent', tier: 2, weight: 7 },
  { id: 'oracle',    name: 'ORACLE',    category: 'agent', tier: 4, weight: 3 },
  { id: 'engineer',  name: 'ENGINEER',  category: 'agent', tier: 4, weight: 4 },
];

export const ALL_PRIMITIVES: PrimitiveDefinition[] = [...ORGANS, ...LAYERS, ...ENGINES, ...AGENTS];

// Pre-built lookup maps for O(1) access — avoids repeated .find() / .filter() calls
const PRIMITIVE_BY_ID = new Map<string, PrimitiveDefinition>(ALL_PRIMITIVES.map(p => [p.id, p]));
const PRIMITIVES_BY_CATEGORY = new Map<PrimitiveCategory, PrimitiveDefinition[]>();
const PRIMITIVES_BY_TIER = new Map<number, PrimitiveDefinition[]>();

for (const p of ALL_PRIMITIVES) {
  if (!PRIMITIVES_BY_CATEGORY.has(p.category)) PRIMITIVES_BY_CATEGORY.set(p.category, []);
  PRIMITIVES_BY_CATEGORY.get(p.category)!.push(p);
  if (!PRIMITIVES_BY_TIER.has(p.tier)) PRIMITIVES_BY_TIER.set(p.tier, []);
  PRIMITIVES_BY_TIER.get(p.tier)!.push(p);
}

// Pre-compute category weights for computeCompositeHealth — avoids recalculating every call
const CATEGORY_WEIGHTS = new Map<PrimitiveCategory, { members: PrimitiveDefinition[]; totalWeight: number }>();
for (const cat of ['organ', 'layer', 'engine', 'agent'] as PrimitiveCategory[]) {
  const members = PRIMITIVES_BY_CATEGORY.get(cat) ?? [];
  CATEGORY_WEIGHTS.set(cat, { members, totalWeight: members.reduce((s, m) => s + m.weight, 0) });
}



// ═══════════════════════════════════════════════════════════════
// SUBSYSTEMS — Autonomous pipelines beyond the 40 primitives
// ═══════════════════════════════════════════════════════════════

export interface SubsystemDefinition {
  id: string;
  name: string;
  group: 'autonomous' | 'infrastructure';
  /** Weight within Tier 4 subsystem pool */
  weight: number;
}

export const SUBSYSTEMS: SubsystemDefinition[] = [
  // Autonomous systems
  { id: 'clm',       name: 'Constant Learning Mode',    group: 'autonomous',      weight: 6 },
  { id: 'cdm',       name: 'Constant Discovery Mode',   group: 'autonomous',      weight: 5 },
  { id: 'seba',      name: 'SEBA Pipeline',             group: 'autonomous',      weight: 5 },
  { id: 'autoblog',  name: 'Autoblog Pipeline',         group: 'autonomous',      weight: 4 },
  { id: 'agency',    name: 'Agency Orchestrator',        group: 'autonomous',      weight: 4 },
  // Infrastructure
  { id: 'edge',      name: 'Edge Functions',             group: 'infrastructure',  weight: 7 },
  { id: 'database',  name: 'Database',                   group: 'infrastructure',  weight: 8 },
  { id: 'auth',      name: 'Auth System',                group: 'infrastructure',  weight: 6 },
  { id: 'storage',   name: 'Storage',                    group: 'infrastructure',  weight: 5 },
  { id: 'email',     name: 'Email Pipeline',             group: 'infrastructure',  weight: 4 },
  { id: 'scheduler', name: 'Scheduled Tasks',            group: 'infrastructure',  weight: 4 },
];

const SUBSYSTEM_TOTAL_WEIGHT = SUBSYSTEMS.reduce((s, sub) => s + sub.weight, 0);

// ═══════════════════════════════════════════════════════════════
// TIER WEIGHTS — Criticality-based global distribution
// ═══════════════════════════════════════════════════════════════

const TIER_WEIGHTS = {
  1: 0.35,  // Mission-critical: CORE, BRAIN, NEXUS, SYSTEM, MEMORY, NERVE, DEFENSE
  2: 0.25,  // Infrastructure: IDENTITY, RELAY, IMMUNITY, GOVERNANCE, CORTEX, EVOLUTION, INTENT, ACCESS
  3: 0.25,  // Operational: DECODE, ENCODE, VISION, ECONOMY, DREAM, RIPPLE, etc.
  4: 0.15,  // Expansion + subsystems
} as const;

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKERS — Per-primitive health circuit state
// ═══════════════════════════════════════════════════════════════

export type CircuitState = 'closed' | 'half-open' | 'open';

export interface HealthCircuitBreaker {
  state: CircuitState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastFailure: number | null;
  lastSuccess: number | null;
  /** Threshold for consecutive failures before opening */
  failureThreshold: number;
  /** Successes needed in half-open to close */
  recoveryThreshold: number;
  /** Cooldown before half-open (ms) */
  cooldownMs: number;
}

const breakers = new Map<string, HealthCircuitBreaker>();

function getOrCreateBreaker(id: string, tier: number): HealthCircuitBreaker {
  if (!breakers.has(id)) {
    breakers.set(id, {
      state: 'closed',
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastFailure: null,
      lastSuccess: null,
      // Tier 1 is more sensitive (opens faster)
      failureThreshold: tier === 1 ? 2 : tier === 2 ? 3 : 4,
      recoveryThreshold: tier === 1 ? 1 : 2,
      cooldownMs: tier === 1 ? 15_000 : 30_000,
    });
  }
  return breakers.get(id)!;
}

function recordHealthSuccess(id: string, tier: number): void {
  const b = getOrCreateBreaker(id, tier);
  b.consecutiveFailures = 0;
  b.consecutiveSuccesses++;
  b.lastSuccess = Date.now();
  if (b.state === 'half-open' && b.consecutiveSuccesses >= b.recoveryThreshold) {
    b.state = 'closed';
  }
}

function recordHealthFailure(id: string, tier: number): void {
  const b = getOrCreateBreaker(id, tier);
  b.consecutiveSuccesses = 0;
  b.consecutiveFailures++;
  b.lastFailure = Date.now();
  if (b.state === 'closed' && b.consecutiveFailures >= b.failureThreshold) {
    b.state = 'open';
  }
}

function shouldProbe(id: string, tier: number): boolean {
  const b = getOrCreateBreaker(id, tier);
  if (b.state === 'closed') return true;
  if (b.state === 'open' && b.lastFailure && Date.now() - b.lastFailure > b.cooldownMs) {
    b.state = 'half-open';
    return true;
  }
  return b.state === 'half-open';
}

export function getBreakers(): Map<string, HealthCircuitBreaker> {
  return new Map(breakers);
}

export function resetBreaker(id: string): void {
  breakers.delete(id);
}

// ═══════════════════════════════════════════════════════════════
// DEGRADATION LEVELS — Graceful degradation thresholds
// ═══════════════════════════════════════════════════════════════

export type DegradationLevel = 'L0_NOMINAL' | 'L1_ADVISORY' | 'L2_DEGRADED' | 'L3_CRITICAL' | 'L4_EMERGENCY';

export function getDegradationLevel(score: number): DegradationLevel {
  if (score >= 90) return 'L0_NOMINAL';
  if (score >= 75) return 'L1_ADVISORY';
  if (score >= 50) return 'L2_DEGRADED';
  if (score >= 25) return 'L3_CRITICAL';
  return 'L4_EMERGENCY';
}

export const DEGRADATION_LABELS: Record<DegradationLevel, string> = {
  L0_NOMINAL: 'Nominal',
  L1_ADVISORY: 'Advisory',
  L2_DEGRADED: 'Degraded',
  L3_CRITICAL: 'Critical',
  L4_EMERGENCY: 'Emergency',
};

// ═══════════════════════════════════════════════════════════════
// AUTO-HEAL TRIGGERS — When health drops, queue repair actions
// ═══════════════════════════════════════════════════════════════

export interface HealAction {
  primitiveId: string;
  action: string;
  reason: string;
  timestamp: number;
  executed: boolean;
}

const healQueue: HealAction[] = [];
const MAX_HEAL_QUEUE = 50;

function queueHealAction(primitiveId: string, health: number, previousHealth: number): void {
  // Only queue if health dropped significantly
  if (health >= 50 || previousHealth - health < 10) return;
  
  const action: HealAction = {
    primitiveId,
    action: health < 25 ? 'restart' : 'repair',
    reason: `Health dropped from ${previousHealth} to ${health}`,
    timestamp: Date.now(),
    executed: false,
  };
  
  healQueue.push(action);
  if (healQueue.length > MAX_HEAL_QUEUE) healQueue.shift();
}

export function getHealQueue(): HealAction[] {
  return [...healQueue];
}

export function clearHealQueue(): void {
  healQueue.length = 0;
}

// ═══════════════════════════════════════════════════════════════
// HEALTH SNAPSHOT — Latest scores per primitive/subsystem
// ═══════════════════════════════════════════════════════════════

export interface PrimitiveHealthSnapshot {
  id: string;
  health: number;
  category: PrimitiveCategory | 'subsystem';
  tier: 1 | 2 | 3 | 4;
  circuitState: CircuitState;
  degradationLevel: DegradationLevel;
  lastUpdated: number;
}

const healthScores = new Map<string, number>();
const previousScores = new Map<string, number>();

export function updatePrimitiveHealth(id: string, health: number): void {
  const prev = healthScores.get(id) ?? 100;
  previousScores.set(id, prev);
  const clamped = health < 0 ? 0 : health > 100 ? 100 : health;
  healthScores.set(id, clamped);
  
  // O(1) lookup instead of O(n) .find()
  const def = PRIMITIVE_BY_ID.get(id);
  const tier = def?.tier ?? 4;
  
  if (clamped >= 50) {
    recordHealthSuccess(id, tier);
  } else {
    recordHealthFailure(id, tier);
    queueHealAction(id, clamped, prev);
  }
}

export function getPrimitiveHealth(id: string): number {
  return healthScores.get(id) ?? 100;
}

export function getAllHealthSnapshots(): PrimitiveHealthSnapshot[] {
  const result: PrimitiveHealthSnapshot[] = [];
  
  for (const p of ALL_PRIMITIVES) {
    const health = healthScores.get(p.id) ?? 100;
    const breaker = getOrCreateBreaker(p.id, p.tier);
    result.push({
      id: p.id,
      health,
      category: p.category,
      tier: p.tier,
      circuitState: breaker.state,
      degradationLevel: getDegradationLevel(health),
      lastUpdated: breaker.lastSuccess ?? breaker.lastFailure ?? 0,
    });
  }
  
  for (const s of SUBSYSTEMS) {
    const health = healthScores.get(s.id) ?? 100;
    const breaker = getOrCreateBreaker(s.id, 4);
    result.push({
      id: s.id,
      health,
      category: 'subsystem',
      tier: 4,
      circuitState: breaker.state,
      degradationLevel: getDegradationLevel(health),
      lastUpdated: breaker.lastSuccess ?? breaker.lastFailure ?? 0,
    });
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// COMPOSITE HEALTH CALCULATION — Tier-weighted with weakest link
// ═══════════════════════════════════════════════════════════════

export interface CompositeHealthResult {
  /** Weighted composite score 0-100 */
  compositeScore: number;
  /** Degradation level for the composite */
  degradationLevel: DegradationLevel;
  /** Weakest primitive ID */
  weakestLink: string;
  /** Weakest primitive health score */
  weakestScore: number;
  /** Weakest primitive category */
  weakestCategory: PrimitiveCategory | 'subsystem';
  /** Breakdown by tier */
  tiers: Record<1 | 2 | 3 | 4, { score: number; count: number; healthy: number }>;
  /** Breakdown by category */
  categories: Record<PrimitiveCategory, { score: number; count: number }>;
  /** Subsystem aggregate */
  subsystemScore: number;
  /** Total tracked entities */
  totalTracked: number;
  /** Count of healthy (>=50) entities */
  healthyCount: number;
  /** Open circuit breakers */
  openBreakers: string[];
  /** Pending heal actions */
  pendingHeals: number;
}

export function computeCompositeHealth(): CompositeHealthResult {
  // Group primitives by tier
  const tierGroups: Record<number, { id: string; health: number; weight: number }[]> = { 1: [], 2: [], 3: [], 4: [] };
  
  for (const p of ALL_PRIMITIVES) {
    tierGroups[p.tier].push({
      id: p.id,
      health: healthScores.get(p.id) ?? 100,
      weight: p.weight,
    });
  }
  
  // Add subsystems to tier 4
  for (const s of SUBSYSTEMS) {
    tierGroups[4].push({
      id: s.id,
      health: healthScores.get(s.id) ?? 100,
      weight: s.weight,
    });
  }
  
  // Weighted average within each tier
  const tierScores: Record<number, number> = {};
  const tierCounts: Record<number, { count: number; healthy: number }> = {};
  
  for (const tier of [1, 2, 3, 4] as const) {
    const group = tierGroups[tier];
    const totalWeight = group.reduce((s, g) => s + g.weight, 0);
    if (totalWeight === 0) {
      tierScores[tier] = 100;
      tierCounts[tier] = { count: 0, healthy: 0 };
      continue;
    }
    tierScores[tier] = Math.round(
      group.reduce((s, g) => s + g.health * (g.weight / totalWeight), 0)
    );
    tierCounts[tier] = {
      count: group.length,
      healthy: group.filter(g => g.health >= 50).length,
    };
  }
  
  // Global composite: tier-weighted
  const compositeScore = Math.round(
    tierScores[1] * TIER_WEIGHTS[1] +
    tierScores[2] * TIER_WEIGHTS[2] +
    tierScores[3] * TIER_WEIGHTS[3] +
    tierScores[4] * TIER_WEIGHTS[4]
  );
  
  // Weakest link — find the single lowest score
  let weakestLink = 'core';
  let weakestScore = 100;
  let weakestCategory: PrimitiveCategory | 'subsystem' = 'organ';
  
  for (const p of ALL_PRIMITIVES) {
    const h = healthScores.get(p.id) ?? 100;
    if (h < weakestScore) {
      weakestScore = h;
      weakestLink = p.id;
      weakestCategory = p.category;
    }
  }
  for (const s of SUBSYSTEMS) {
    const h = healthScores.get(s.id) ?? 100;
    if (h < weakestScore) {
      weakestScore = h;
      weakestLink = s.id;
      weakestCategory = 'subsystem';
    }
  }
  
  // Category breakdown — uses pre-computed weights for O(1) per category
  const categories: Record<PrimitiveCategory, { score: number; count: number }> = {
    organ: { score: 0, count: 0 },
    layer: { score: 0, count: 0 },
    engine: { score: 0, count: 0 },
    agent: { score: 0, count: 0 },
  };
  
  for (const cat of ['organ', 'layer', 'engine', 'agent'] as PrimitiveCategory[]) {
    const cached = CATEGORY_WEIGHTS.get(cat)!;
    categories[cat] = {
      count: cached.members.length,
      score: cached.totalWeight > 0
        ? Math.round(cached.members.reduce((s, m) => s + (healthScores.get(m.id) ?? 100) * (m.weight / cached.totalWeight), 0))
        : 100,
    };
  }
  
  // Subsystem aggregate — uses pre-computed total weight
  const subsystemScore = SUBSYSTEM_TOTAL_WEIGHT > 0
    ? Math.round(SUBSYSTEMS.reduce((s, sub) => s + (healthScores.get(sub.id) ?? 100) * (sub.weight / SUBSYSTEM_TOTAL_WEIGHT), 0))
    : 100;
  
  // Open breakers
  const openBreakers: string[] = [];
  for (const [id, b] of breakers) {
    if (b.state === 'open') openBreakers.push(id);
  }
  
  // Single-pass count instead of creating a merged array + filter
  const totalTracked = ALL_PRIMITIVES.length + SUBSYSTEMS.length;
  let healthyCount = 0;
  for (const p of ALL_PRIMITIVES) {
    if ((healthScores.get(p.id) ?? 100) >= 50) healthyCount++;
  }
  for (const s of SUBSYSTEMS) {
    if ((healthScores.get(s.id) ?? 100) >= 50) healthyCount++;
  }
  
  return {
    compositeScore,
    degradationLevel: getDegradationLevel(compositeScore),
    weakestLink,
    weakestScore,
    weakestCategory,
    tiers: {
      1: { score: tierScores[1], ...tierCounts[1] },
      2: { score: tierScores[2], ...tierCounts[2] },
      3: { score: tierScores[3], ...tierCounts[3] },
      4: { score: tierScores[4], ...tierCounts[4] },
    },
    categories,
    subsystemScore,
    totalTracked,
    healthyCount,
    openBreakers,
    pendingHeals: healQueue.filter(h => !h.executed).length,
  };
}

// ═══════════════════════════════════════════════════════════════
// HEALTH PROBE — Extract health from module response
// ═══════════════════════════════════════════════════════════════

export function extractHealth(result: any): number {
  if (!result) return 50;
  if (typeof result.health === 'number') return result.health;
  if (typeof result.health_score === 'number') return result.health_score;
  if (typeof result.health?.healthScore === 'number') return result.health.healthScore;
  if (result.success === false) return 0;
  if (result.healthy === false) return 0;
  if (result.healthy === true) return 100;
  if (result.success === true) return 100;
  return 75; // Unknown response shape — assume operational but not verified
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS — Helper queries
// ═══════════════════════════════════════════════════════════════

export function getPrimitivesByCategory(cat: PrimitiveCategory): PrimitiveDefinition[] {
  return PRIMITIVES_BY_CATEGORY.get(cat) ?? [];
}

export function getPrimitivesByTier(tier: 1 | 2 | 3 | 4): PrimitiveDefinition[] {
  return PRIMITIVES_BY_TIER.get(tier) ?? [];
}

export function getPrimitiveDef(id: string): PrimitiveDefinition | undefined {
  return PRIMITIVE_BY_ID.get(id);
}

export { shouldProbe };
