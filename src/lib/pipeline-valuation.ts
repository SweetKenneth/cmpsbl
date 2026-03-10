/**
 * Pipeline Valuation Utility
 * Shared deterministic market value estimation for pipeline exports and UI.
 * 
 * IMPORTANT: These are heuristic estimates based on technical scoring.
 * They are NOT financial advice and may not reflect actual market value.
 */

export const CATEGORY_MARKET_MULTIPLIERS: Record<string, number> = {
  security: 1.8, governance: 1.6, cognitive: 1.5, evolution: 1.4,
  orchestration: 1.3, routing: 1.2, learning: 1.3, observability: 1.1, integration: 1.0,
  compliance: 1.7, prediction: 1.5, ethics: 1.4, privacy: 1.6, synthesis: 1.5,
  localization: 1.1, geospatial: 1.3, simulation: 1.4, contracts: 1.5, acquisition: 1.2, edge: 1.3,
  architecture: 1.4, core: 1.2,
};

/**
 * Estimate market value of a pipeline based on CJPI score, category, and complexity.
 * Enterprise-grade scaling: no artificial ceiling.
 * 
 * Score 100 w/ security + 6-module chain → ~$2.7M
 * Score 98 w/ architecture → ~$925K  
 * Score 80 w/ general → ~$42K
 */
export function estimateMarketValue(cjpi: number, category: string, moduleChainLength: number): number {
  const normalized = Math.max(0, cjpi - 60) / 40;
  // Base range: $5K (floor) → $1M (score 100)
  const baseValue = 5000 + Math.pow(normalized, 2.5) * 995000;
  const catMult = CATEGORY_MARKET_MULTIPLIERS[category.toLowerCase()] ?? 1.0;
  const complexityMult = 1 + (Math.min(moduleChainLength, 6) - 1) * 0.12;
  // No apex/tier multiplier here — tier premiums are applied only in computeBlendedValuation
  return Math.round(baseValue * catMult * complexityMult);
}

/** Format a numeric value as a human-readable USD string */
export function formatMarketValue(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

/**
 * Compute the blended valuation (no-consensus fallback).
 * FinalPrice = (CJPIValue × 0.75) + (NormalizedInternal × 0.25)
 */
export function computeBlendedValuation(score: number, category: string, moduleChainLength: number): number {
  const internalValue = estimateMarketValue(score, category, moduleChainLength);
  const normalizedInternal = internalValue * 0.001;
  const baseValue = getExponentialBase(score);
  const tier = getTierFromScore(score);
  const cjpiMultiplier = getCJPIMultiplier(tier);
  const cjpiValue = baseValue * cjpiMultiplier;
  return Math.round((cjpiValue * 0.75) + (normalizedInternal * 0.25));
}

/**
 * Get suggested marketplaces based on tier and category
 */
export function getSuggestedMarketplaces(score: number, category: string): string[] {
  const tier = getTierFromScore(score);
  const cat = category.toLowerCase();
  const markets: string[] = [];
  if (tier === 'Apex' || tier === 'Mythic') {
    markets.push('AWS Marketplace', 'Azure Marketplace', 'Enterprise Direct');
  }
  if (tier === 'Relic' || tier === 'Prime') {
    markets.push('GitHub Marketplace', 'Vercel Templates');
  }
  markets.push('Gumroad', 'Lemon Squeezy');
  if (cat === 'security' || cat === 'compliance' || cat === 'privacy') markets.push('Google Cloud Marketplace');
  if (cat === 'cognitive' || cat === 'learning' || cat === 'prediction') markets.push('Hugging Face');
  return [...new Set(markets)].slice(0, 4);
}

/** Get the category multiplier label for display */
export function getCategoryMultiplierLabel(category: string): string {
  const mult = CATEGORY_MARKET_MULTIPLIERS[category.toLowerCase()];
  if (!mult || mult === 1.0) return '';
  return `${mult}x ${category} premium`;
}

/** Get tier label from CJPI score — graduated 6-tier system */
export function getTierFromScore(cjpi: number): string {
  if (cjpi >= 100) return 'Apex';
  if (cjpi >= 94) return 'Mythic';
  if (cjpi >= 90) return 'Relic';
  if (cjpi >= 80) return 'Prime';
  if (cjpi >= 68) return 'Mint';
  return 'Raw';
}

/** 6-tier CJPI multiplier for blended pricing formula */
export function getCJPIMultiplier(tier: string): number {
  switch (tier.toLowerCase()) {
    case 'apex': return 4.0;
    case 'mythic': return 3.0;
    case 'relic': return 2.0;
    case 'prime': return 1.5;
    case 'mint': return 1.2;
    case 'raw': default: return 1.0;
  }
}

/**
 * Extract the exponential base value from a CJPI score (before category/complexity multipliers).
 * This is the "BaseValue" term in the blended pricing formula.
 */
export function getExponentialBase(cjpi: number): number {
  const normalized = Math.max(0, cjpi - 60) / 40;
  return 5000 + Math.pow(normalized, 2.5) * 995000;
}
