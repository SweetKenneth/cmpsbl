/**
 * usePricingEngine — Hook for artifact pricing and batch repricing
 * v2.0: Supports consensus pricing with multi-model evidence
 */
import { useState, useCallback } from 'react';
import {
  priceArtifact,
  batchReprice,
  type CommercializationPricing,
  type PricingArtifact,
} from '@/lib/foundry/pricing-engine';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function usePricingEngine() {
  const { user } = useAuth();
  const [pricing, setPricing] = useState<CommercializationPricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ completed: number; total: number } | null>(null);

  const priceOne = useCallback(async (artifact: PricingArtifact) => {
    setLoading(true);
    try {
      const result = await priceArtifact(artifact);
      setPricing(result);

      // Persist if vault_id provided
      if (artifact.vault_id) {
        const pricingUpdate: Record<string, any> = {
          recommended_resale_price: result.recommended_resale_price,
          indie_price: result.indie_price,
          standard_price: result.standard_price,
          enterprise_price: result.enterprise_price,
          estimated_market_range_low: result.estimated_market_range_low,
          estimated_market_range_high: result.estimated_market_range_high,
          pricing_confidence: result.pricing_confidence,
          market_category: result.market_category,
          comparable_summary: result.comparable_summary,
          suggested_marketplaces: result.suggested_marketplaces,
          commercialization_notes: result.commercialization_notes,
          pricing_last_updated_at: new Date().toISOString(),
          pricing_source: result.pricing_source,
          pricing_source_version: result.pricing_source_version || '2.0.0',
        };

        // Include evidence if available
        if (result.pricing_evidence) {
          pricingUpdate.pricing_evidence = result.pricing_evidence;
        }

        const table = artifact.source_table || 'pipeline_vault';
        await supabase.from(table).update(pricingUpdate as any).eq('id', artifact.vault_id);
      }

      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const repriceAll = useCallback(async (artifacts: PricingArtifact[]) => {
    setLoading(true);
    setBatchProgress({ completed: 0, total: artifacts.length });
    try {
      const result = await batchReprice(artifacts, (completed, total) => {
        setBatchProgress({ completed, total });
      });
      return result;
    } finally {
      setLoading(false);
      setBatchProgress(null);
    }
  }, []);

  const repriceUnpriced = useCallback(async () => {
    if (!user) return { success: 0, failed: 0 };
    setLoading(true);
    try {
      const { data } = await supabase
        .from('pipeline_vault')
        .select('id, pipeline_name, pipeline_score, pipeline_tier, pipeline_category, system_chain, valuation_display')
        .eq('user_id', user.id)
        .is('recommended_resale_price' as any, null);

      if (!data || data.length === 0) return { success: 0, failed: 0 };

      const artifacts: PricingArtifact[] = data.map((d: any) => ({
        vault_id: d.id,
        pipeline_name: d.pipeline_name,
        pipeline_score: d.pipeline_score,
        pipeline_tier: d.pipeline_tier,
        pipeline_category: d.pipeline_category,
        system_chain: d.system_chain,
        valuation_display: d.valuation_display,
      }));

      return await repriceAll(artifacts);
    } finally {
      setLoading(false);
    }
  }, [user, repriceAll]);

  /**
   * Reprice ALL discoveries across foundry_inventory, pipeline_vault, AND vault_promotions
   */
  const repriceAllDiscoveries = useCallback(async () => {
    if (!user) return { success: 0, failed: 0 };
    setLoading(true);
    try {
      // Fetch ONLY unpriced items from all tables
      const [inventoryRes, vaultRes] = await Promise.all([
        supabase
          .from('foundry_inventory')
          .select('id, artifact_name, score, category, system_chain, valuation_display, public_tier, recommended_resale_price')
          .eq('user_id', user.id)
          .is('recommended_resale_price' as any, null),
        supabase
          .from('pipeline_vault')
          .select('id, pipeline_name, pipeline_score, pipeline_tier, pipeline_category, system_chain, valuation_display, recommended_resale_price')
          .eq('user_id', user.id)
          .is('recommended_resale_price' as any, null),
      ]);

      // Paginate vault_promotions — only unpriced
      const allPromotions: any[] = [];
      let offset = 0;
      const pageSize = 1000;
      while (true) {
        const { data } = await supabase
          .from('vault_promotions')
          .select('id, name, cjpi, category, module_chain, tier, description, recommended_resale_price')
          .eq('export_ready', true)
          .is('recommended_resale_price' as any, null)
          .range(offset, offset + pageSize - 1);
        if (!data || data.length === 0) break;
        allPromotions.push(...data);
        if (data.length < pageSize) break;
        offset += pageSize;
      }

      const artifacts: PricingArtifact[] = [];

      for (const d of (inventoryRes.data ?? []) as any[]) {
        artifacts.push({
          vault_id: d.id,
          source_table: 'foundry_inventory',
          pipeline_name: d.artifact_name,
          pipeline_score: d.score,
          pipeline_tier: d.public_tier || 'Raw',
          pipeline_category: d.category,
          system_chain: d.system_chain,
          valuation_display: d.valuation_display,
        });
      }

      const existingIds = new Set(artifacts.map(a => a.vault_id));
      for (const d of (vaultRes.data ?? []) as any[]) {
        if (!existingIds.has(d.id)) {
          artifacts.push({
            vault_id: d.id,
            source_table: 'pipeline_vault',
            pipeline_name: d.pipeline_name,
            pipeline_score: d.pipeline_score,
            pipeline_tier: d.pipeline_tier,
            pipeline_category: d.pipeline_category,
            system_chain: d.system_chain,
            valuation_display: d.valuation_display,
          });
          existingIds.add(d.id);
        }
      }

      for (const d of allPromotions as any[]) {
        if (!existingIds.has(d.id)) {
          artifacts.push({
            vault_id: d.id,
            source_table: 'vault_promotions',
            pipeline_name: d.name,
            pipeline_score: d.cjpi,
            pipeline_tier: d.tier || 'Apex',
            pipeline_category: d.category,
            system_chain: d.module_chain,
            valuation_display: null,
          });
          existingIds.add(d.id);
        }
      }

      if (artifacts.length === 0) return { success: 0, failed: 0 };

      return await repriceAll(artifacts);
    } finally {
      setLoading(false);
    }
  }, [user, repriceAll]);

  return {
    pricing,
    loading,
    batchProgress,
    priceOne,
    repriceAll,
    repriceUnpriced,
    repriceAllDiscoveries,
  };
}
