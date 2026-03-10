/**
 * S-Tier 078 — Fallback Chain Architect
 * CJPI: 92 | Node: NEXUS | ID: S-112
 *
 * Builds dynamic fallback chains for AI provider routing.
 * Selects alternatives based on degradation scores and capability matching.
 */

export interface ProviderSpec {
  id: string;
  capabilities: string[];
  health: number;       // 0-100
  costPerToken: number; // millicents
  latencyMs: number;
}

export interface FallbackChain {
  primary: string;
  fallbacks: string[];
  reason: string;
  generatedAt: string;
}

export function buildFallbackChain(
  providers: ProviderSpec[],
  requiredCapability: string,
  maxFallbacks = 3
): FallbackChain {
  const eligible = providers
    .filter(p => p.capabilities.includes(requiredCapability))
    .sort((a, b) => {
      // Score: health (50%) + inverse-cost (25%) + inverse-latency (25%)
      const scoreA = a.health * 0.5 + (1000 / (a.costPerToken + 1)) * 0.25 + (1000 / (a.latencyMs + 1)) * 0.25;
      const scoreB = b.health * 0.5 + (1000 / (b.costPerToken + 1)) * 0.25 + (1000 / (b.latencyMs + 1)) * 0.25;
      return scoreB - scoreA;
    });

  if (eligible.length === 0) {
    return { primary: 'none', fallbacks: [], reason: `No providers support ${requiredCapability}`, generatedAt: new Date().toISOString() };
  }

  return {
    primary: eligible[0].id,
    fallbacks: eligible.slice(1, maxFallbacks + 1).map(p => p.id),
    reason: `${eligible.length} eligible providers ranked by composite score`,
    generatedAt: new Date().toISOString(),
  };
}
