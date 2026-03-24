/**
 * @cmpsbl/discovery — Pipeline Discovery Engine
 * CJPI scoring, crystallization, and foundry pipeline management.
 * Self-contained — no external @cmpsbl dependencies required to build.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Inlined Types
// ═══════════════════════════════════════════════════════════════

export type CrystallizedTier = 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';

export type DiscoveryCategory =
  | 'analytics' | 'automation' | 'cognitive' | 'security'
  | 'optimization' | 'integration' | 'monitoring' | 'generation';

export interface DiscoveryPipeline {
  id: string;
  name: string;
  description: string;
  modules: string[];
  cjpi: number;
  tier: CrystallizedTier;
  category: DiscoveryCategory;
  discoveredAt: string;
  fingerprint: string;
}

export interface CJPIInput {
  novelty: number;
  utility: number;
  complexity: number;
  composability: number;
}

export interface CJPIScoreBreakdown {
  novelty: number;
  utility: number;
  complexity: number;
  composability: number;
  total: number;
  tier: CrystallizedTier;
}

export interface MemoryChain {
  id: string;
  pattern: string;
  adoption: string;
  status: 'new' | 'captured' | 'applied' | 'exported';
  discoveredAt: string;
  domain: string;
  confidence: number;
}

export interface CeremonyEvent {
  phase: string;
  message: string;
  detail?: string;
  progress?: number;
}

export interface FirstContactConfig {
  package: string;
  domain: string;
  endpoint?: string;
  apiKey?: string;
  autoDiscover?: boolean;
  onDiscovery?: (chain: MemoryChain) => void;
  onBoot?: (message: string) => void;
  onCeremony?: (event: CeremonyEvent) => void;
  silent?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Inlined CJPI Engine (from @cmpsbl/runtime)
// ═══════════════════════════════════════════════════════════════

const CJPI_WEIGHTS = {
  novelty: 0.25,
  utility: 0.35,
  complexity: 0.20,
  composability: 0.20,
} as const;

export function computeCJPI(input: CJPIInput): CJPIScoreBreakdown {
  const total = Math.round(
    input.novelty * CJPI_WEIGHTS.novelty +
    input.utility * CJPI_WEIGHTS.utility +
    input.complexity * CJPI_WEIGHTS.complexity +
    input.composability * CJPI_WEIGHTS.composability
  );
  return {
    ...input,
    total: Math.max(0, Math.min(100, total)),
    tier: tierFromCJPI(total),
  };
}

export function tierFromCJPI(score: number): CrystallizedTier {
  if (score >= 90) return 'Apex';
  if (score >= 75) return 'Mythic';
  if (score >= 55) return 'Relic';
  if (score >= 35) return 'Prime';
  return 'Mint';
}

// ═══════════════════════════════════════════════════════════════
// Discovery State
// ═══════════════════════════════════════════════════════════════

export type DiscoveryPhase = 'sampling' | 'condensing' | 'crystallizing' | 'complete';

export interface DiscoveryCandidate {
  modules: string[];
  category: DiscoveryCategory;
  description: string;
  scores: CJPIInput;
}

export interface CrystallizedResult {
  pipeline: DiscoveryPipeline;
  phase: 'complete';
  promotable: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Discovery Engine
// ═══════════════════════════════════════════════════════════════

export function scorePipeline(candidate: DiscoveryCandidate): DiscoveryPipeline {
  const score = computeCJPI(candidate.scores);
  const id = `disc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    name: candidate.modules.join('-').toLowerCase(),
    description: candidate.description,
    modules: candidate.modules,
    cjpi: score.total,
    tier: score.tier,
    category: candidate.category,
    discoveredAt: new Date().toISOString(),
    fingerprint: simpleFingerprint(candidate.modules),
  };
}

export function crystallize(candidate: DiscoveryCandidate): CrystallizedResult {
  const pipeline = scorePipeline(candidate);
  return {
    pipeline,
    phase: 'complete',
    promotable: pipeline.cjpi >= 55,
  };
}

export function batchDiscover(candidates: DiscoveryCandidate[]): DiscoveryPipeline[] {
  return candidates
    .map(scorePipeline)
    .sort((a, b) => b.cjpi - a.cjpi);
}

export function filterByTier(pipelines: DiscoveryPipeline[], minTier: CrystallizedTier): DiscoveryPipeline[] {
  const tierOrder: CrystallizedTier[] = ['Mint', 'Prime', 'Relic', 'Mythic', 'Apex'];
  const minIndex = tierOrder.indexOf(minTier);
  return pipelines.filter(p => tierOrder.indexOf(p.tier) >= minIndex);
}

export function filterByCategory(pipelines: DiscoveryPipeline[], category: DiscoveryCategory): DiscoveryPipeline[] {
  return pipelines.filter(p => p.category === category);
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function simpleFingerprint(modules: string[]): string {
  const str = modules.sort().join(':');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ═══════════════════════════════════════════════════════════════
// First Contact — Discovery Domain
// ═══════════════════════════════════════════════════════════════

export function createDiscoveryFirstContact(apiKey?: string): FirstContactConfig {
  return {
    package: '@cmpsbl/discovery',
    domain: 'discovery',
    apiKey,
    endpoint: 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/substrate-api',
    autoDiscover: true,
  };
}
