/**
 * @cmpsbl/discovery — Pipeline Discovery Engine
 * CJPI scoring, crystallization, and foundry pipeline management.
 * Includes first-contact Memory Stream integration.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { CrystallizedTier, DiscoveryCategory, DiscoveryPipeline, CJPIInput, FirstContactConfig } from '@cmpsbl/types';
import { computeCJPI, tierFromCJPI } from '@cmpsbl/runtime';

export type { CrystallizedTier, DiscoveryCategory, DiscoveryPipeline };

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
