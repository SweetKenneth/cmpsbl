/**
 * Pipeline Valuation Utility
 * Shared AI-driven market value estimation for pipeline exports and UI.
 * 
 * IMPORTANT: These are AI-generated estimates based on heuristic scoring.
 * They are NOT financial advice and may not reflect actual market value.
 */

export const CATEGORY_MARKET_MULTIPLIERS: Record<string, number> = {
  security: 1.8, governance: 1.6, cognitive: 1.5, evolution: 1.4,
  orchestration: 1.3, routing: 1.2, learning: 1.3, observability: 1.1, integration: 1.0,
  compliance: 1.7, prediction: 1.5, ethics: 1.4, privacy: 1.6, synthesis: 1.5,
  localization: 1.1, geospatial: 1.3, simulation: 1.4, contracts: 1.5, acquisition: 1.2, edge: 1.3,
};

/**
 * Estimate market value of a pipeline based on CJPI score, category, and complexity.
 * Returns value in USD cents-equivalent (integer).
 */
export function estimateMarketValue(cjpi: number, category: string, moduleChainLength: number): number {
  const normalized = Math.max(0, cjpi - 60) / 40;
  const baseValue = 5000 + Math.pow(normalized, 2.5) * 495000;
  const catMult = CATEGORY_MARKET_MULTIPLIERS[category.toLowerCase()] ?? 1.0;
  const complexityMult = 1 + (Math.min(moduleChainLength, 6) - 1) * 0.08;
  const apexMult = cjpi >= 95 ? 1.5 : cjpi >= 92 ? 1.2 : 1.0;
  return Math.round(baseValue * catMult * complexityMult * apexMult);
}

/** Format a numeric value as a human-readable USD string */
export function formatMarketValue(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

/** Get the category multiplier label for display */
export function getCategoryMultiplierLabel(category: string): string {
  const mult = CATEGORY_MARKET_MULTIPLIERS[category.toLowerCase()];
  if (!mult || mult === 1.0) return '';
  return `${mult}x ${category} premium`;
}

/** Get tier label from CJPI score */
export function getTierFromScore(cjpi: number): string {
  if (cjpi >= 95) return 'Apex';
  if (cjpi >= 85) return 'Enterprise';
  if (cjpi >= 70) return 'Architect';
  return 'Creator';
}
