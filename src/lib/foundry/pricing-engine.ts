/**
 * Foundry Pricing Engine — Client-side interface for consensus commercialization pricing
 * Calls the pf-nexus-pricing edge function for multi-model market analysis
 * Falls back to local estimation when all providers are unavailable
 * 
 * ECONOMY Node Primitive: All pricing runs are recorded through ECONOMY
 * for cost attribution, anomaly detection, and governance.
 */
import { supabase } from '@/integrations/supabase/client';
import type { PricingEvidence, ProviderEstimate } from './consensus-pricing';
import {
  recordPricingRun,
  startBatchRepricing,
  recordBatchItem,
  completeBatchRepricing,
  canExecutePricingRun,
} from '@/lib/substrate/economy-module/pricingGovernance';

export type { PricingEvidence, ProviderEstimate };

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
  pricing_source: 'consensus' | 'partial-consensus' | 'single-provider' | 'claude-haiku' | 'local' | 'local-fallback';
  pricing_source_version?: string;
  pricing_evidence?: PricingEvidence;
}

export interface PricingArtifact {
  vault_id?: string;
  source_table?: 'foundry_inventory' | 'pipeline_vault' | 'vault_promotions';
  pipeline_name: string;
  pipeline_score: number;
  pipeline_tier: string;
  pipeline_category?: string | null;
  system_chain?: string[] | null;
  valuation_display?: number | null;
}

/**
 * Price a single artifact via the NEXUS consensus pricing engine
 */
export async function priceArtifact(artifact: PricingArtifact): Promise<CommercializationPricing> {
  // ECONOMY budget gate
  const budgetCheck = canExecutePricingRun();
  if (!budgetCheck.allowed) {
    console.warn('[PricingEngine] ECONOMY budget gate rejected:', budgetCheck.reason);
    return computeLocalFallback(artifact);
  }

  const startTime = Date.now();
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
    const result = data as CommercializationPricing;

    // Record through ECONOMY governance primitive
    try {
      const evidence = result.pricing_evidence;
      recordPricingRun({
        artifact_id: artifact.vault_id || 'unknown',
        artifact_name: artifact.pipeline_name,
        source_table: artifact.source_table || 'pipeline_vault',
        providers_queried: evidence?.providers?.map((p: any) => p.provider) || [],
        providers_succeeded: evidence?.providers_used || [],
        providers_failed: evidence?.providers_failed || [],
        outliers_rejected: evidence?.outliers_rejected || [],
        pricing_source: result.pricing_source,
        recommended_price: result.recommended_resale_price,
        consensus_mid: evidence?.consensus_mid ?? null,
        confidence: result.pricing_confidence,
        total_latency_ms: Date.now() - startTime,
        per_provider_latency: extractProviderLatencies(evidence),
        estimated_cost_millicents: estimatePricingCost(evidence),
      });
    } catch {
      // ECONOMY tracking failure should never block pricing
    }

    return result;
  } catch (err) {
    console.error('[PricingEngine] Consensus failed, using local fallback:', err);
    const fallback = computeLocalFallback(artifact);

    // Record fallback through ECONOMY
    try {
      recordPricingRun({
        artifact_id: artifact.vault_id || 'unknown',
        artifact_name: artifact.pipeline_name,
        source_table: artifact.source_table || 'pipeline_vault',
        providers_queried: [],
        providers_succeeded: [],
        providers_failed: ['edge-function'],
        outliers_rejected: [],
        pricing_source: 'local-fallback',
        recommended_price: fallback.recommended_resale_price,
        consensus_mid: null,
        confidence: fallback.pricing_confidence,
        total_latency_ms: Date.now() - startTime,
        per_provider_latency: {},
        estimated_cost_millicents: 0,
      });
    } catch {
      // silent
    }

    return fallback;
  }
}

/**
 * Batch reprice multiple artifacts and persist results to DB
 * ECONOMY governance: tracks batch lifecycle and per-item costs
 */
export async function batchReprice(
  artifacts: PricingArtifact[],
  onProgress?: (completed: number, total: number) => void,
): Promise<{ success: number; failed: number }> {
  const batchSize = 10;
  let success = 0;
  let failed = 0;

  // Start ECONOMY batch tracking
  startBatchRepricing(artifacts.length);

  for (let i = 0; i < artifacts.length; i += batchSize) {
    const batch = artifacts.slice(i, i + batchSize);
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-pricing', {
        body: {
          action: 'batch-reprice',
          artifacts: batch.map(a => ({
            vault_id: a.vault_id,
            source_table: a.source_table,
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
      const batchSuccess = results.filter((r: any) => r.success).length;
      const batchFailed = results.filter((r: any) => !r.success).length;
      success += batchSuccess;
      failed += batchFailed;

      // Record each batch item through ECONOMY
      for (const r of results) {
        try {
          recordBatchItem(
            r.success,
            r.recommended_resale_price || 0,
            r.pricing_confidence || 0,
            estimatePricingCost(r.pricing_evidence),
            r.pricing_evidence?.providers_used || [],
          );
        } catch {
          // silent
        }
      }
    } catch {
      failed += batch.length;
      for (const a of batch) {
        try { recordBatchItem(false, 0, 0, 0, []); } catch { /* silent */ }
      }
    }
    onProgress?.(Math.min(i + batchSize, artifacts.length), artifacts.length);
  }

  // Complete ECONOMY batch tracking
  completeBatchRepricing();

  return { success, failed };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ECONOMY Helpers
// ═══════════════════════════════════════════════════════════════════════════════

function extractProviderLatencies(evidence: PricingEvidence | undefined): Record<string, number> {
  if (!evidence?.providers) return {};
  const latencies: Record<string, number> = {};
  for (const p of evidence.providers) {
    if (p.latency_ms) latencies[p.provider] = p.latency_ms;
  }
  return latencies;
}

function estimatePricingCost(evidence: PricingEvidence | undefined): number {
  if (!evidence?.providers) return 0;
  // Estimate ~50 millicents per successful provider query (free-tier = 0, paid ~100 tokens)
  const successfulCount = evidence.providers.filter((p: any) => p.success).length;
  return successfulCount * 50;
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
    comparable_summary: 'Local estimate — enable consensus pricing for market-grounded analysis.',
    suggested_marketplaces: score >= 90 ? ['Gumroad', 'GitHub Marketplace'] : ['Gumroad'],
    commercialization_notes: 'Fallback pricing from internal signals only.',
    pricing_source: 'local-fallback',
    pricing_source_version: '2.0.0',
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
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.4) return 'Medium';
  return 'Low';
}

/**
 * Get pricing source display label
 */
export function pricingSourceLabel(source: string): string {
  switch (source) {
    case 'consensus': return 'Multi-Model Consensus';
    case 'partial-consensus': return 'Partial Consensus';
    case 'single-provider': return 'Single Provider';
    case 'claude-haiku': return 'Claude Haiku';
    case 'local': return 'Internal Estimate';
    case 'local-fallback': return 'Local Fallback';
    default: return source;
  }
}
