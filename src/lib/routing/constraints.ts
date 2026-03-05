/**
 * Provider Routing Constraints — Hard constraint filter before scoring
 */

export interface ProviderCapabilities {
  id: string;
  context_window: number;
  supports_tools: boolean;
  supports_vision: boolean;
  max_output_tokens: number;
  cost_per_1k_tokens: number;
  health_score: number;       // 0–100
}

export interface RoutingRequirements {
  min_context_window: number;
  requires_tools: boolean;
  requires_vision: boolean;
  min_output_tokens: number;
  budget_ceiling_cents: number;
  min_health_score: number;
}

/** Filter providers by hard constraints. Returns only eligible providers. */
export function filterByConstraints(
  providers: ProviderCapabilities[],
  requirements: RoutingRequirements
): ProviderCapabilities[] {
  return providers.filter(p => {
    if (p.context_window < requirements.min_context_window) return false;
    if (requirements.requires_tools && !p.supports_tools) return false;
    if (requirements.requires_vision && !p.supports_vision) return false;
    if (p.max_output_tokens < requirements.min_output_tokens) return false;
    if (p.cost_per_1k_tokens > requirements.budget_ceiling_cents) return false;
    if (p.health_score < requirements.min_health_score) return false;
    return true;
  });
}

export const DEFAULT_REQUIREMENTS: RoutingRequirements = {
  min_context_window: 4096,
  requires_tools: false,
  requires_vision: false,
  min_output_tokens: 1024,
  budget_ceiling_cents: 100,
  min_health_score: 30,
};
