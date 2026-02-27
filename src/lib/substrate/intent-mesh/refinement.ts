/**
 * Intent Mesh — Multi-Turn Intent Refinement
 * Enables iterative intent resolution with feedback loops
 * 
 * When a module broadcasts an intent and gets partial results, the refinement
 * engine can automatically re-broadcast with narrowed domains, adjusted inputs,
 * or explicit resolver targeting to improve resolution quality.
 * 
 * Flow: Intent → Partial Response → Refine → Re-broadcast → Richer Response
 */

import { broadcastIntent } from './router';
import type { MeshIntent, MeshResolution, ResolverResponse } from './types';

// ─── Types ───

export interface RefinementContext {
  /** Original intent that triggered refinement */
  originalIntentId: string;
  /** Current refinement turn (1-based) */
  turn: number;
  /** Maximum turns allowed */
  maxTurns: number;
  /** Results accumulated across turns */
  accumulatedResults: Record<string, unknown>;
  /** Resolvers that already responded (avoid re-querying) */
  respondedResolvers: Set<string>;
  /** Domains already explored */
  exploredDomains: Set<string>;
  /** Intent history for learning */
  history: RefinementTurn[];
}

export interface RefinementTurn {
  turn: number;
  intentType: string;
  domains: string[];
  resolversMatched: number;
  resolversResponded: number;
  newDataKeys: string[];
  durationMs: number;
}

export interface RefinementResult {
  /** Final composed result across all turns */
  composedResult: Record<string, unknown>;
  /** How many refinement turns were needed */
  totalTurns: number;
  /** Total resolvers that contributed */
  totalResolversUsed: number;
  /** All turns taken */
  turns: RefinementTurn[];
  /** Whether refinement improved upon the initial result */
  improved: boolean;
  /** Total time across all turns */
  totalDurationMs: number;
}

// ─── Refinement Strategies ───

type RefinementStrategy = (
  resolution: MeshResolution,
  context: RefinementContext,
  originalIntent: Omit<MeshIntent, 'id' | 'timestamp'>
) => Omit<MeshIntent, 'id' | 'timestamp'> | null;

/**
 * Strategy: Expand domains based on partial results
 * If we got security data but not identity, add identity-related domains
 */
const expandDomainsStrategy: RefinementStrategy = (resolution, context, original) => {
  const respondedModules = new Set(resolution.responses.filter(r => r.success).map(r => r.module));
  
  // Infer related domains from what responded
  const domainExpansions: Record<string, string[]> = {
    security: ['identity', 'behavior', 'anomaly'],
    identity: ['trust', 'authentication', 'authorization'],
    behavior: ['anomaly', 'session', 'analytics'],
    threat: ['geo', 'fingerprint', 'reputation'],
    economy: ['cost', 'quota', 'usage'],
    memory: ['context', 'knowledge', 'semantic'],
    audit: ['compliance', 'governance', 'accountability'],
    orchestration: ['pipeline', 'scheduling', 'workflow'],
  };

  const newDomains: string[] = [];
  for (const domain of original.domains) {
    const expansions = domainExpansions[domain] || [];
    for (const expanded of expansions) {
      if (!context.exploredDomains.has(expanded)) {
        newDomains.push(expanded);
      }
    }
  }

  if (newDomains.length === 0) return null;

  return {
    ...original,
    domains: [...new Set([...original.domains, ...newDomains.slice(0, 4)])],
    input: {
      ...original.input,
      ...context.accumulatedResults, // Feed previous results as new input
      _refinementTurn: context.turn + 1,
      _excludeResolvers: Array.from(context.respondedResolvers),
    },
  };
};

/**
 * Strategy: Deepen existing results by asking for more specific data
 * If we got a threat_score, now ask for threat_timeline and attack_vector
 */
const deepenResultsStrategy: RefinementStrategy = (resolution, context, original) => {
  const receivedKeys = Object.keys(context.accumulatedResults);
  
  // Map received data to deeper follow-up domains
  const deepenMap: Record<string, { domains: string[]; intentType: string }> = {
    threat_score: { domains: ['threat', 'history', 'fingerprint'], intentType: 'threat_deep_analysis' },
    actor_id: { domains: ['identity', 'trust', 'authentication'], intentType: 'actor_enrichment' },
    anomaly_score: { domains: ['behavior', 'session', 'timeline'], intentType: 'anomaly_investigation' },
    compliance_score: { domains: ['governance', 'audit', 'accountability'], intentType: 'compliance_deep_dive' },
    engagement_score: { domains: ['communication', 'behavior', 'usage'], intentType: 'engagement_analysis' },
  };

  let bestFollow: { domains: string[]; intentType: string } | null = null;
  for (const key of receivedKeys) {
    if (deepenMap[key] && !context.exploredDomains.has(deepenMap[key].domains[0])) {
      bestFollow = deepenMap[key];
      break;
    }
  }

  if (!bestFollow) return null;

  return {
    sourceModule: original.sourceModule,
    intentType: bestFollow.intentType,
    domains: bestFollow.domains,
    input: {
      ...original.input,
      ...context.accumulatedResults,
      _refinementTurn: context.turn + 1,
    },
    governanceMode: original.governanceMode,
  };
};

/**
 * Strategy: Cross-pollinate by feeding one module's output as another's input
 */
const crossPollinateStrategy: RefinementStrategy = (resolution, context, original) => {
  const successfulResponses = resolution.responses.filter(r => r.success && r.data);
  if (successfulResponses.length < 1) return null;

  // Collect all produced data as enriched input for next round
  const enrichedInput: Record<string, unknown> = { ...original.input };
  for (const resp of successfulResponses) {
    if (resp.data) {
      for (const [key, value] of Object.entries(resp.data)) {
        if (!key.startsWith('_') && typeof value !== 'undefined') {
          enrichedInput[key] = value;
        }
      }
    }
  }

  // Find domains not yet explored
  const allDomains = new Set(original.domains);
  const unexploredDomains = ['intelligence', 'prediction', 'learning', 'context', 'coordination']
    .filter(d => !context.exploredDomains.has(d) && !allDomains.has(d));

  if (unexploredDomains.length === 0) return null;

  return {
    sourceModule: original.sourceModule,
    intentType: `${original.intentType}_enriched`,
    domains: unexploredDomains.slice(0, 3),
    input: {
      ...enrichedInput,
      _refinementTurn: context.turn + 1,
      _enrichedFrom: successfulResponses.map(r => r.module),
    },
    governanceMode: original.governanceMode,
  };
};

// All strategies in priority order
const REFINEMENT_STRATEGIES: RefinementStrategy[] = [
  deepenResultsStrategy,
  expandDomainsStrategy,
  crossPollinateStrategy,
];

// ─── Core Refinement Engine ───

/**
 * Execute a multi-turn refined intent resolution
 * Starts with the initial broadcast, then iteratively refines based on results
 */
export async function resolveWithRefinement(
  intent: Omit<MeshIntent, 'id' | 'timestamp'>,
  options: { maxTurns?: number } = {}
): Promise<RefinementResult> {
  const maxTurns = Math.min(options.maxTurns ?? 3, 5); // Cap at 5 turns
  const totalStart = performance.now();

  // Initial broadcast
  const initialResolution = await broadcastIntent(intent);
  
  const context: RefinementContext = {
    originalIntentId: initialResolution.intentId,
    turn: 1,
    maxTurns,
    accumulatedResults: { ...initialResolution.composedResult },
    respondedResolvers: new Set(
      initialResolution.responses.filter(r => r.success).map(r => r.resolverId)
    ),
    exploredDomains: new Set(intent.domains),
    history: [{
      turn: 1,
      intentType: intent.intentType,
      domains: intent.domains,
      resolversMatched: initialResolution.resolversMatched,
      resolversResponded: initialResolution.resolversResponded,
      newDataKeys: Object.keys(initialResolution.composedResult).filter(k => !k.startsWith('_')),
      durationMs: initialResolution.totalDurationMs,
    }],
  };

  const initialKeyCount = Object.keys(initialResolution.composedResult).filter(k => !k.startsWith('_')).length;

  // Refinement loop
  while (context.turn < maxTurns) {
    let refined: Omit<MeshIntent, 'id' | 'timestamp'> | null = null;

    // Try each strategy until one produces a refinement
    for (const strategy of REFINEMENT_STRATEGIES) {
      refined = strategy(initialResolution, context, intent);
      if (refined) break;
    }

    if (!refined) break; // No strategy could refine further

    // Execute refined intent
    const refinedResolution = await broadcastIntent(refined);
    context.turn++;

    // Track new domains explored
    for (const d of refined.domains) context.exploredDomains.add(d);

    // Merge new results (don't overwrite existing)
    const newKeys: string[] = [];
    for (const [key, value] of Object.entries(refinedResolution.composedResult)) {
      if (!key.startsWith('_') && !(key in context.accumulatedResults)) {
        context.accumulatedResults[key] = value;
        newKeys.push(key);
      }
    }

    // Track responded resolvers
    for (const resp of refinedResolution.responses) {
      if (resp.success) context.respondedResolvers.add(resp.resolverId);
    }

    context.history.push({
      turn: context.turn,
      intentType: refined.intentType,
      domains: refined.domains,
      resolversMatched: refinedResolution.resolversMatched,
      resolversResponded: refinedResolution.resolversResponded,
      newDataKeys: newKeys,
      durationMs: refinedResolution.totalDurationMs,
    });

    // Stop if no new data was discovered this turn
    if (newKeys.length === 0) break;
  }

  const finalKeyCount = Object.keys(context.accumulatedResults).filter(k => !k.startsWith('_')).length;

  return {
    composedResult: context.accumulatedResults,
    totalTurns: context.turn,
    totalResolversUsed: context.respondedResolvers.size,
    turns: context.history,
    improved: finalKeyCount > initialKeyCount,
    totalDurationMs: Math.round(performance.now() - totalStart),
  };
}

/**
 * Quick check: would refinement be useful for this intent?
 * Returns true if the initial resolution is partial/weak
 */
export function shouldRefine(resolution: MeshResolution): boolean {
  // Refine if fewer than half the matched resolvers responded
  if (resolution.resolversMatched > 0 && resolution.resolversResponded < resolution.resolversMatched * 0.5) {
    return true;
  }
  // Refine if no resolvers matched at all
  if (resolution.resolversMatched === 0) return true;
  // Refine if composed result has very few keys
  const resultKeys = Object.keys(resolution.composedResult).filter(k => !k.startsWith('_'));
  if (resultKeys.length < 3) return true;
  
  return false;
}
