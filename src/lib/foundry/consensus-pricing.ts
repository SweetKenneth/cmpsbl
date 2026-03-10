/**
 * Consensus Pricing Engine
 * Multi-model outlier-resistant pricing with median merge logic
 * 
 * Combines estimates from multiple AI providers with internal valuation
 * and CJPI signals to produce grounded, defensible software pricing.
 */

// ── Types ──

export interface ProviderEstimate {
  provider: string;
  model: string;
  price_range_low: number;
  price_range_high: number;
  estimated_mid_price: number;
  market_category: string;
  comparable_product_types: string;
  suggested_marketplaces: string[];
  pricing_confidence: number;
  commercialization_rationale: string;
  success: boolean;
  excluded_as_outlier: boolean;
  error?: string;
  latency_ms?: number;
  timestamp: string;
}

export interface ConsensusPricingResult {
  // Final pricing
  recommended_resale_price: number;
  indie_price: number;
  standard_price: number;
  enterprise_price: number;
  estimated_market_range_low: number;
  estimated_market_range_high: number;

  // Consensus metadata
  pricing_confidence: number;
  confidence_label: 'Low' | 'Medium' | 'High';
  market_category: string;
  comparable_summary: string;
  suggested_marketplaces: string[];
  commercialization_notes: string;
  pricing_source: 'consensus' | 'partial-consensus' | 'single-provider' | 'local-fallback';
  pricing_source_version: string;

  // Evidence
  pricing_evidence: PricingEvidence;
}

export interface PricingEvidence {
  providers: ProviderEstimate[];
  consensus_mid: number | null;
  internal_value_contribution: number;
  cjpi_contribution: number;
  outliers_rejected: string[];
  providers_used: string[];
  providers_failed: string[];
  formula_weights: {
    internal: number;
    consensus_market: number;
    cjpi_premium: number;
  };
  computed_at: string;
}

export interface ConsensusInput {
  artifact_name: string;
  artifact_description?: string;
  cjpi_score: number;
  internal_value: number;
  modules: string[];
  tier: string;
  category?: string;
  has_hardware_export?: boolean;
  export_targets?: string[];
  runtime_type?: string;
}

// ── Constants ──

export const CONSENSUS_VERSION = '2.0.0';
const OUTLIER_THRESHOLD = 2.5; // IQR multiplier for outlier detection
const MIN_PROVIDERS_FOR_HIGH_CONFIDENCE = 3;

// ── Outlier Rejection ──

/**
 * Reject outlier estimates using modified IQR method.
 * Returns estimates with excluded_as_outlier flag set.
 */
export function rejectOutliers(estimates: ProviderEstimate[]): ProviderEstimate[] {
  const successful = estimates.filter(e => e.success);
  if (successful.length <= 2) {
    // Too few to reject outliers
    return estimates;
  }

  const midPrices = successful.map(e => e.estimated_mid_price).sort((a, b) => a - b);
  const q1 = midPrices[Math.floor(midPrices.length * 0.25)];
  const q3 = midPrices[Math.floor(midPrices.length * 0.75)];
  const iqr = q3 - q1;
  
  // If IQR is very small (high agreement), use percentage-based threshold
  const lowerBound = iqr > 1 ? q1 - OUTLIER_THRESHOLD * iqr : q1 * 0.3;
  const upperBound = iqr > 1 ? q3 + OUTLIER_THRESHOLD * iqr : q3 * 3.0;

  return estimates.map(e => {
    if (!e.success) return e;
    const isOutlier = e.estimated_mid_price < lowerBound || e.estimated_mid_price > upperBound;
    return { ...e, excluded_as_outlier: isOutlier };
  });
}

// ── Consensus Computation ──

/**
 * Compute consensus market estimate from multiple provider estimates.
 * Uses trimmed median for robustness.
 */
export function computeConsensusEstimate(estimates: ProviderEstimate[]): {
  consensusMid: number | null;
  consensusLow: number | null;
  consensusHigh: number | null;
  marketCategory: string;
  marketplaces: string[];
  comparableSummary: string;
  rationale: string;
  providersUsed: string[];
  outliersRejected: string[];
} {
  const included = estimates.filter(e => e.success && !e.excluded_as_outlier);
  
  if (included.length === 0) {
    return {
      consensusMid: null,
      consensusLow: null,
      consensusHigh: null,
      marketCategory: 'Software Tool',
      marketplaces: ['Gumroad'],
      comparableSummary: '',
      rationale: 'No external estimates available.',
      providersUsed: [],
      outliersRejected: estimates.filter(e => e.excluded_as_outlier).map(e => e.provider),
    };
  }

  // Trimmed median for mid prices
  const mids = included.map(e => e.estimated_mid_price).sort((a, b) => a - b);
  const consensusMid = median(mids);

  // Aggregate ranges
  const lows = included.map(e => e.price_range_low).sort((a, b) => a - b);
  const highs = included.map(e => e.price_range_high).sort((a, b) => a - b);
  const consensusLow = median(lows);
  const consensusHigh = median(highs);

  // Most common market category
  const categories = included.map(e => e.market_category);
  const marketCategory = mode(categories) || 'Software Tool';

  // Merge marketplaces (union, sorted by frequency)
  const allMarketplaces = included.flatMap(e => e.suggested_marketplaces);
  const marketplaces = [...new Set(allMarketplaces)].slice(0, 5);

  // Best comparable summary (from highest-confidence provider)
  const bestProvider = included.sort((a, b) => b.pricing_confidence - a.pricing_confidence)[0];
  const comparableSummary = bestProvider?.comparable_product_types || '';
  const rationale = bestProvider?.commercialization_rationale || '';

  return {
    consensusMid,
    consensusLow,
    consensusHigh,
    marketCategory,
    marketplaces,
    comparableSummary,
    rationale,
    providersUsed: included.map(e => e.provider),
    outliersRejected: estimates.filter(e => e.excluded_as_outlier).map(e => e.provider),
  };
}

// ── Final Price Computation ──

/**
 * Compute final grounded pricing combining consensus + internal + CJPI.
 */
export function computeConsensusPricing(
  input: ConsensusInput,
  estimates: ProviderEstimate[],
): ConsensusPricingResult {
  // Step 1: Reject outliers
  const processed = rejectOutliers(estimates);

  // Step 2: Compute consensus
  const consensus = computeConsensusEstimate(processed);

   // Step 3: Internal value normalization — scale but preserve magnitude
  const normalizedInternal = Math.max(input.internal_value * 0.001, 5);

  // Step 4: CJPI multiplier
  const cjpiMultiplier = getCJPIMultiplier(input.cjpi_score);

  // Step 5: Module complexity bonus
  const moduleCount = input.modules?.length || 1;
  const complexityBonus = 1 + (Math.min(moduleCount, 10) * 0.05);

  // Step 6: Hardware export premium
  const hardwarePremium = input.has_hardware_export ? 1.3 : 1.0;

  // Step 7: Determine weights based on consensus availability
  let weights: { internal: number; consensus_market: number; cjpi_premium: number };
  let pricingSource: ConsensusPricingResult['pricing_source'];

  const successCount = consensus.providersUsed.length;

  if (successCount >= 3) {
    // Strong consensus: market-dominant
    weights = { internal: 0.20, consensus_market: 0.55, cjpi_premium: 0.25 };
    pricingSource = 'consensus';
  } else if (successCount === 2) {
    // Partial consensus: balanced
    weights = { internal: 0.25, consensus_market: 0.50, cjpi_premium: 0.25 };
    pricingSource = 'partial-consensus';
  } else if (successCount === 1) {
    // Single provider: still useful but less dominant
    weights = { internal: 0.30, consensus_market: 0.45, cjpi_premium: 0.25 };
    pricingSource = 'single-provider';
  } else {
    // No external: full internal/CJPI
    weights = { internal: 0.55, consensus_market: 0.0, cjpi_premium: 0.45 };
    pricingSource = 'local-fallback';
  }

  // Step 8: Compute base price
  const marketAnchor = consensus.consensusMid ?? normalizedInternal;
  const basePrice =
    normalizedInternal * weights.internal +
    marketAnchor * weights.consensus_market +
    normalizedInternal * cjpiMultiplier * weights.cjpi_premium;

  const adjustedPrice = basePrice * complexityBonus * hardwarePremium;

  // Step 9: Clamp to reasonable range ($1 - $50,000)
  const recommended = Math.round(Math.min(Math.max(adjustedPrice, 1), 50000) * 100) / 100;

  // Step 10: Confidence scoring
  const confidence = computeConfidence(processed, consensus, input);
  const confidenceLabel = confidence >= 0.7 ? 'High' : confidence >= 0.4 ? 'Medium' : 'Low';

  // Market range from consensus or internal
  const rangeLow = consensus.consensusLow ?? recommended * 0.5;
  const rangeHigh = consensus.consensusHigh ?? recommended * 2.0;

  return {
    recommended_resale_price: recommended,
    indie_price: round2(recommended * 0.6),
    standard_price: recommended,
    enterprise_price: round2(recommended * 3.5),
    estimated_market_range_low: round2(rangeLow),
    estimated_market_range_high: round2(rangeHigh),

    pricing_confidence: round2(confidence),
    confidence_label: confidenceLabel,
    market_category: consensus.marketCategory,
    comparable_summary: consensus.comparableSummary,
    suggested_marketplaces: consensus.marketplaces,
    commercialization_notes: consensus.rationale,
    pricing_source: pricingSource,
    pricing_source_version: CONSENSUS_VERSION,

    pricing_evidence: {
      providers: processed,
      consensus_mid: consensus.consensusMid,
      internal_value_contribution: round2(normalizedInternal),
      cjpi_contribution: round2(cjpiMultiplier),
      outliers_rejected: consensus.outliersRejected,
      providers_used: consensus.providersUsed,
      providers_failed: processed.filter(e => !e.success).map(e => e.provider),
      formula_weights: weights,
      computed_at: new Date().toISOString(),
    },
  };
}

// ── Confidence Scoring ──

function computeConfidence(
  estimates: ProviderEstimate[],
  consensus: ReturnType<typeof computeConsensusEstimate>,
  input: ConsensusInput,
): number {
  let score = 0.2; // Base confidence

  const successCount = consensus.providersUsed.length;

  // Provider count contribution (up to 0.3)
  score += Math.min(successCount / MIN_PROVIDERS_FOR_HIGH_CONFIDENCE, 1) * 0.3;

  // Agreement contribution (up to 0.25)
  if (consensus.consensusMid && successCount >= 2) {
    const included = estimates.filter(e => e.success && !e.excluded_as_outlier);
    const mids = included.map(e => e.estimated_mid_price);
    const avgDeviation = mids.reduce((sum, m) => sum + Math.abs(m - consensus.consensusMid!) / consensus.consensusMid!, 0) / mids.length;
    const agreementScore = Math.max(0, 1 - avgDeviation);
    score += agreementScore * 0.25;
  }

  // Marketplace overlap contribution (up to 0.1)
  if (successCount >= 2) {
    const included = estimates.filter(e => e.success && !e.excluded_as_outlier);
    const allMarkets = included.map(e => new Set(e.suggested_marketplaces));
    if (allMarkets.length >= 2) {
      const intersection = [...allMarkets[0]].filter(m => allMarkets.slice(1).every(s => s.has(m)));
      score += Math.min(intersection.length / 3, 1) * 0.1;
    }
  }

  // Metadata signal strength (up to 0.15)
  if (input.cjpi_score > 0) score += 0.05;
  if (input.internal_value > 0) score += 0.05;
  if (input.modules?.length > 1) score += 0.05;

  return Math.min(score, 1.0);
}

// ── Shared Pricing Prompt ──

export function buildConsensusPricingPrompt(input: ConsensusInput): string {
  const complexitySignal = (input.internal_value || 0) > 10000 ? 'very high'
    : (input.internal_value || 0) > 5000 ? 'high'
    : (input.internal_value || 0) > 1000 ? 'moderate'
    : 'standard';

  return `Price this software artifact for sale on indie developer marketplaces (Gumroad, GitHub Marketplace, npm).

ARTIFACT: ${input.artifact_name}
DESCRIPTION: ${input.artifact_description || 'Crystallized software pipeline / reusable code module'}
MODULES: ${input.modules.join(', ')} (${input.modules.length} total)
CJPI SCORE: ${input.cjpi_score}/100 (higher = more sophisticated)
TIER: ${input.tier}
CATEGORY: ${input.category || 'general'}
ENGINEERING COMPLEXITY: ${complexitySignal}
HARDWARE EXPORT: ${input.has_hardware_export ? 'Yes' : 'No'}
EXPORT TARGETS: ${(input.export_targets || ['source']).join(', ')}
RUNTIME: ${input.runtime_type || 'JavaScript/TypeScript'}

CRITICAL PRICING GUIDELINES — follow these ranges strictly:
- A single reusable module/library: $10-$80
- A multi-module developer toolkit (2-5 modules): $30-$200
- A comprehensive framework or platform (5+ modules): $100-$500
- Only very large enterprise infrastructure should exceed $500
- Do NOT exceed $1,000 unless the artifact is a complete enterprise platform with 8+ modules
- Think about what a solo developer or small team would actually pay on Gumroad

Return a JSON object with EXACTLY these fields (no markdown, no explanation):
{
  "price_range_low": number (realistic minimum retail price in USD),
  "price_range_high": number (realistic maximum retail price in USD),
  "estimated_mid_price": number (best single retail price in USD),
  "market_category": "string — most fitting software market category",
  "comparable_product_types": "string — 1-2 sentences naming real comparable products at similar price points",
  "suggested_marketplaces": ["array of 2-4 best-fit platforms from: Gumroad, Lemon Squeezy, GitHub Marketplace, npm, Docker Hub, Hugging Face, Vercel Templates, AWS Marketplace"],
  "pricing_confidence": number between 0 and 1,
  "commercialization_rationale": "string — 1-2 sentences on best commercialization path"
}`;
}

// ── Helpers ──

function getCJPIMultiplier(score: number): number {
  if (score >= 100) return 2.5;
  if (score >= 94) return 2.0;
  if (score >= 90) return 1.6;
  if (score >= 80) return 1.3;
  if (score >= 68) return 1.0;
  return 0.7;
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mode(arr: string[]): string | undefined {
  const freq = new Map<string, number>();
  for (const v of arr) freq.set(v, (freq.get(v) || 0) + 1);
  let best: string | undefined;
  let bestCount = 0;
  for (const [k, v] of freq) {
    if (v > bestCount) { best = k; bestCount = v; }
  }
  return best;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
