/**
 * useVaultState — Server-side vault storage & daily pull tracking
 * All enforcement happens via DB functions + RLS. No client-side cheating.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { MineResult } from '@/lib/foundry/public-mining-engine';

export interface VaultPipeline {
  id: string;
  pipelineName: string;
  pipelineScore: number;
  pipelineTier: string;
  pipelineCategory: string | null;
  systemChain: string[] | null;
  pipelineFingerprint: string | null;
  valuationDisplay: number | null;
  createdAt: string;
}

export function useVaultState() {
  const { user } = useAuth();
  const [vaultCount, setVaultCount] = useState(0);
  const [pullsToday, setPullsToday] = useState(0);
  const [vault, setVault] = useState<VaultPipeline[]>([]);
  const [loading, setLoading] = useState(true);

  // Load vault count + daily pulls from DB
  const refresh = useCallback(async () => {
    if (!user) {
      setVaultCount(0);
      setPullsToday(0);
      setVault([]);
      setLoading(false);
      return;
    }

    try {
      const [countRes, pullsRes, vaultRes] = await Promise.all([
        supabase.rpc('get_vault_count', { p_user_id: user.id }),
        supabase.rpc('get_daily_pulls', { p_user_id: user.id }),
        supabase
          .from('pipeline_vault')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setVaultCount(countRes.data ?? 0);
      setPullsToday(pullsRes.data ?? 0);
      setVault(
        (vaultRes.data ?? []).map((r: any) => ({
          id: r.id,
          pipelineName: r.pipeline_name,
          pipelineScore: r.pipeline_score,
          pipelineTier: r.pipeline_tier,
          pipelineCategory: r.pipeline_category,
          systemChain: r.system_chain,
          pipelineFingerprint: r.pipeline_fingerprint,
          valuationDisplay: r.valuation_display,
          createdAt: r.created_at,
        }))
      );
    } catch (err) {
      console.error('[useVaultState] refresh failed', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Store a pipeline in the vault (server-side insert)
  const keepPipeline = useCallback(
    async (result: MineResult): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'Not authenticated' };

      const { error } = await supabase.from('pipeline_vault').insert({
        user_id: user.id,
        pipeline_name: result.name,
        pipeline_score: result.score,
        pipeline_tier: result.publicTier,
        pipeline_category: result.category ?? null,
        system_chain: result.systemChain ?? null,
        pipeline_fingerprint: (result as any).fingerprint ?? null,
        pipeline_steps: (result as any).pipelineSteps ?? null,
        valuation_display: result.valuationDisplay ?? null,
        mine_result_id: result.id,
      });

      if (error) {
        console.error('[useVaultState] keepPipeline failed', error);
        return { success: false, error: error.message };
      }

      // Refresh counts
      await refresh();
      return { success: true };
    },
    [user, refresh]
  );

  // Remove a pipeline from the vault
  const removePipeline = useCallback(
    async (pipelineId: string): Promise<boolean> => {
      if (!user) return false;
      const { error } = await supabase
        .from('pipeline_vault')
        .delete()
        .eq('id', pipelineId)
        .eq('user_id', user.id);
      if (error) {
        console.error('[useVaultState] removePipeline failed', error);
        return false;
      }
      await refresh();
      return true;
    },
    [user, refresh]
  );

  // Increment pull counter server-side and return new count
  const recordPull = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    const { data, error } = await supabase.rpc('increment_daily_pull', {
      p_user_id: user.id,
    });
    if (error) {
      console.error('[useVaultState] recordPull failed', error);
      return pullsToday;
    }
    const newCount = data ?? pullsToday + 1;
    setPullsToday(newCount);
    return newCount;
  }, [user, pullsToday]);

  return {
    vaultCount,
    pullsToday,
    vault,
    loading,
    refresh,
    keepPipeline,
    removePipeline,
    recordPull,
  };
}
