/**
 * Foundry Pricing Engine — Client-side interface for commercialization pricing
 * Calls the pf-nexus-pricing edge function for Claude-backed market analysis
 * Falls back to local estimation when Claude is unavailable
 */
import { supabase } from '@/integrations/supabase/client';

export interface CommercializationPricing {
  recommended_resale_price: number;
  indie_price: number;
  standard_price: number;
  enterprise_price: number;
  estimated_market_range_low: number;
  estimated_market_range_high: number;
  pricing_confidence: number;
  market_category: string;
  comparable_summary: string;
  suggested_marketplaces: string[];
  commercialization_notes: string;
  pricing_source: 'claude-haiku' | 'local' | 'local-fallback';
}

export interface PricingArtifact {
  vault_id?: string;
  pipeline_name: string;
  pipeline_score: number;
  pipeline_tier: string;
  pipeline_category?: string | null;
  system_chain?: string[] | null;
  valuation_display?: number | null;
}

/**
 * Price a single artifact via the NEXUS pricing engine
 */
export async function priceArtifact(artifact: PricingArtifact): Promise<CommercializationPricing> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-nexus-pricing', {
      body: {
        action: 'price',
        artifact: {
          pipeline_name: artifact.pipeline_name,
          pipeline_score: artifact.pipeline_score,
          pipeline_tier: artifact.pipeline_tier,
          pipeline_category: artifact.pipeline_category,
          system_chain: artifact.system_chain,
          valuation_display: artifact.valuation_display,
        },
      },
    });

    if (error) throw error;
    return data as CommercializationPricing;
  } catch (err) {
    console.error('[PricingEngine] Failed, using local fallback:', err);
    return computeLocalFallback(artifact);
  }
}

/**
 * Batch reprice multiple artifacts and persist results to DB
 */
export async function batchReprice(
  artifacts: PricingArtifact[],
  onProgress?: (completed: number, total: number) => void,
): Promise<{ success: number; failed: number }> {
  const batchSize = 10;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < artifacts.length; i += batchSize) {
    const batch = artifacts.slice(i, i + batchSize);
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-pricing', {
        body: {
          action: 'batch-reprice',
          artifacts: batch.map(a => ({
            vault_id: a.vault_id,
            pipeline_name: a.pipeline_name,
            pipeline_score: a.pipeline_score,
            pipeline_tier: a.pipeline_tier,
            pipeline_category: a.pipeline_category,
            system_chain: a.system_chain,
            valuation_display: a.valuation_display,
          })),
        },
      });

      if (error) throw error;
      const results = data?.results || [];
      success += results.filter((r: any) => r.success).length;
      failed += results.filter((r: any) => !r.success).length;
    } catch {
      failed += batch.length;
    }
    onProgress?.(Math.min(i + batchSize, artifacts.length), artifacts.length);
  }

  return { success, failed };
}

/**
 * Client-side fallback pricing when edge function is unavailable
 */
function computeLocalFallback(artifact: PricingArtifact): CommercializationPricing {
  const score = artifact.pipeline_score;
  const internalValue = artifact.valuation_display || 0;
  const normalizedInternal = Math.min(Math.max(internalValue * 0.001, 5), 2000);

  let cjpiMultiplier = 1.0;
  if (score >= 100) cjpiMultiplier = 2.5;
  else if (score >= 94) cjpiMultiplier = 2.0;
  else if (score >= 90) cjpiMultiplier = 1.6;
  else if (score >= 80) cjpiMultiplier = 1.3;
  else if (score >= 68) cjpiMultiplier = 1.0;
  else cjpiMultiplier = 0.7;

  const moduleCount = artifact.system_chain?.length || 1;
  const complexityBonus = 1 + (Math.min(moduleCount, 10) * 0.05);
  const basePrice = normalizedInternal * cjpiMultiplier * complexityBonus;
  const recommended = Math.round(basePrice * 100) / 100;

  return {
    recommended_resale_price: recommended,
    indie_price: Math.round(recommended * 0.6 * 100) / 100,
    standard_price: recommended,
    enterprise_price: Math.round(recommended * 3.5 * 100) / 100,
    estimated_market_range_low: Math.round(recommended * 0.5 * 100) / 100,
    estimated_market_range_high: Math.round(recommended * 2 * 100) / 100,
    pricing_confidence: 0.3,
    market_category: 'Software Tool',
    comparable_summary: 'Local estimate — enable Claude Haiku for market-grounded pricing.',
    suggested_marketplaces: score >= 90 ? ['Gumroad', 'GitHub Marketplace'] : ['Gumroad'],
    commercialization_notes: 'Fallback pricing from internal signals only.',
    pricing_source: 'local-fallback',
  };
}

/**
 * Format pricing for display
 */
export function formatPrice(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  if (amount >= 100) return `$${Math.round(amount)}`;
  return `$${amount.toFixed(2)}`;
}

/**
 * Get confidence label
 */
export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.5) return 'Medium';
  return 'Low';
}
