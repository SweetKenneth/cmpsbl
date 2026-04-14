/**
 * 40-Primitive Topology — Canonical Substrate Architecture
 * 
 * The definitive shape of the living substrate.
 * 12 Organs · 12 Layers · 8 Engines · 8 Agents = 40 Primitives
 * 
 * © CMPSBL® · PromptFluid™
 */

// ═══════════════════════════════════════════════════════════════
// Primitive Categories
// ═══════════════════════════════════════════════════════════════

export type PrimitiveCategory = 'organ' | 'layer' | 'engine' | 'agent';

export interface PrimitiveDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: PrimitiveCategory;
  readonly description: string;
  readonly ironLaw: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 40-Primitive Matrix
// ═══════════════════════════════════════════════════════════════

export const ORGANS = [
  'core', 'system', 'brain', 'memory', 'dream', 'nerve',
  'identity', 'relay', 'audit', 'ripple', 'access', 'governance',
] as const;

export const LAYERS = [
  'defense', 'immunity', 'intent', 'atlas', 'engineer', 'decode',
  'encode', 'vision', 'economy', 'sandbox', 'inclusive', 'medic',
] as const;

export const ENGINES = [
  'cortex', 'nexus', 'evolution', 'conscience',
  'sovereign', 'shadow', 'reflex', 'compass',
] as const;

export const AGENTS = [
  'beacon', 'watchtower', 'integration', 'dispatch',
  'marshal', 'pioneer', 'herald', 'overseer',
] as const;

export type Organ = typeof ORGANS[number];
export type Layer = typeof LAYERS[number];
export type SubstrateEngine = typeof ENGINES[number];
export type Agent = typeof AGENTS[number];
export type Primitive = Organ | Layer | SubstrateEngine | Agent;

export const ALL_PRIMITIVES: readonly Primitive[] = [
  ...ORGANS, ...LAYERS, ...ENGINES, ...AGENTS,
];

/** Iron Law primitives — mandatory architectural invariants */
export const IRON_LAW_PRIMITIVES = [
  'core', 'defense', 'governance', 'conscience', 'audit',
  'failsafe', 'memory', 'brain', 'dream',
] as const;

export function getPrimitiveCategory(primitive: Primitive): PrimitiveCategory {
  if ((ORGANS as readonly string[]).includes(primitive)) return 'organ';
  if ((LAYERS as readonly string[]).includes(primitive)) return 'layer';
  if ((ENGINES as readonly string[]).includes(primitive)) return 'engine';
  return 'agent';
}

export function getPrimitiveCounts(): Record<PrimitiveCategory, number> {
  return { organ: 12, layer: 12, engine: 8, agent: 8 };
}

// ═══════════════════════════════════════════════════════════════
// 6-Tier Access Model
// ═══════════════════════════════════════════════════════════════

export type AccessTier = 'builder' | 'studio' | 'creator' | 'architect' | 'enterprise' | 'governor';

export interface TierDefinition {
  readonly tier: AccessTier;
  readonly label: string;
  readonly price: string;
  readonly engines: readonly string[];
  readonly unlimited: boolean;
}

export const TIER_DEFINITIONS: readonly TierDefinition[] = [
  { tier: 'builder',    label: 'Builder',    price: 'Free',     engines: ['FAILSAFE', 'BEACON', 'PRIMITIVE'],                                         unlimited: false },
  { tier: 'studio',     label: 'Studio',     price: '$29/mo',   engines: ['FAILSAFE', 'BEACON', 'PRIMITIVE', 'AUTOMATON', 'WRAITH'],                   unlimited: false },
  { tier: 'creator',    label: 'Creator',    price: '$49/mo',   engines: ['FAILSAFE', 'BEACON', 'PRIMITIVE', 'AUTOMATON', 'WRAITH', 'CORTEX', 'OBSIDIAN'], unlimited: false },
  { tier: 'architect',  label: 'Architect',  price: '$79/mo',   engines: ['FAILSAFE', 'BEACON', 'PRIMITIVE', 'AUTOMATON', 'WRAITH', 'CORTEX', 'OBSIDIAN', 'NEXUS', 'MONOLITH', 'ARCHITECT', 'RAPTOR'], unlimited: false },
  { tier: 'enterprise', label: 'Enterprise', price: '$999+/mo', engines: ['ALL — Full substrate authority'], unlimited: true },
  { tier: 'governor',   label: 'Governor',   price: '1 of 1',   engines: ['ALL — Unlimited · Supreme substrate authority · 1 of 1'], unlimited: true },
] as const;

export function getTierDefinition(tier: AccessTier): TierDefinition {
  return TIER_DEFINITIONS.find(t => t.tier === tier) ?? TIER_DEFINITIONS[0];
}

export function tierHasAccess(userTier: AccessTier, requiredTier: AccessTier): boolean {
  const order: AccessTier[] = ['builder', 'studio', 'creator', 'architect', 'enterprise', 'governor'];
  return order.indexOf(userTier) >= order.indexOf(requiredTier);
}

// ═══════════════════════════════════════════════════════════════
// Cognitive Loop — Memory · Dream · Discover · Stream
// ═══════════════════════════════════════════════════════════════

export type CognitiveAction =
  | 'memory.store'
  | 'memory.recall'
  | 'memory.stream'
  | 'memory.prune'
  | 'dream.digest'
  | 'dream.synthesize'
  | 'discover.scan'
  | 'discover.crystallize'
  | 'brain.remember'
  | 'brain.think';

export interface CognitiveRequest {
  action: CognitiveAction;
  input?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

export interface CognitiveResponse {
  success: boolean;
  action: CognitiveAction;
  data: unknown;
  timestamp: string;
}

export interface MemoryEntry {
  id: string;
  content: string;
  category: string;
  confidence: number;
  createdAt: string;
  userId: string;
}

export interface DreamEntry {
  id: string;
  title: string;
  synthesis: string;
  confidence: number;
  createdAt: string;
  memoryIds: string[];
}

export interface StreamEntry {
  id: string;
  type: 'memory' | 'dream' | 'discovery';
  content: string;
  timestamp: string;
  source: string;
}

// ═══════════════════════════════════════════════════════════════
// Substrate Command Registry
// ═══════════════════════════════════════════════════════════════

export interface SubstrateCommand {
  module: string;
  action: string;
  description?: string;
  tier: AccessTier;
}

export interface SubstrateResponse<T = unknown> {
  success: boolean;
  module: string;
  action: string;
  data: T;
  latencyMs: number;
  timestamp: string;
}

export interface SubstrateHealthReport {
  overall: number;
  primitives: Record<string, {
    status: 'online' | 'degraded' | 'offline';
    latencyMs: number;
  }>;
  timestamp: string;
}
