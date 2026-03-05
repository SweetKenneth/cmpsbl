/**
 * Constraints-First Provider Router
 * 1) Hard constraints filter → 2) Score remaining → 3) Sticky routing → 4) Failover ladder
 */

import { filterByConstraints, type ProviderCapabilities, type RoutingRequirements, DEFAULT_REQUIREMENTS } from './constraints';
import { getStickyProvider, pinProvider } from './sticky';
import { getFailoverAction, type FailoverConfig } from './failover';

export interface RouteDecision {
  provider_id: string;
  reason: 'sticky' | 'scored' | 'failover';
  score?: number;
  candidates_count: number;
  filtered_count: number;
}

/** Score a provider (higher = better). Simple weighted scoring. */
function scoreProvider(p: ProviderCapabilities): number {
  const healthScore = p.health_score / 100;
  const costScore = 1 - Math.min(p.cost_per_1k_tokens / 50, 1); // cheaper = higher score
  const capScore = (p.context_window / 128000); // larger context = higher
  return healthScore * 0.5 + costScore * 0.3 + capScore * 0.2;
}

/** Route a request to the best available provider */
export function routeRequest(
  providers: ProviderCapabilities[],
  taskType: string,
  sessionKey: string,
  requirements?: Partial<RoutingRequirements>
): RouteDecision | null {
  const reqs = { ...DEFAULT_REQUIREMENTS, ...requirements };

  // Step 1: Check sticky route first
  const sticky = getStickyProvider(taskType, sessionKey);
  if (sticky) {
    const provider = providers.find(p => p.id === sticky);
    if (provider && provider.health_score >= reqs.min_health_score) {
      return {
        provider_id: sticky,
        reason: 'sticky',
        candidates_count: providers.length,
        filtered_count: providers.length,
      };
    }
  }

  // Step 2: Hard constraints filter
  const eligible = filterByConstraints(providers, reqs);
  if (eligible.length === 0) return null;

  // Step 3: Score remaining candidates
  const scored = eligible
    .map(p => ({ provider: p, score: scoreProvider(p) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  // Pin the choice for stability
  pinProvider(best.provider.id, taskType, sessionKey);

  return {
    provider_id: best.provider.id,
    reason: 'scored',
    score: best.score,
    candidates_count: providers.length,
    filtered_count: eligible.length,
  };
}
