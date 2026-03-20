/**
 * GOAL Module Adapter — ENCODE
 * Code generation pipeline health and throughput metrics.
 * Optimized: count-only queries instead of fetching rows.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const encodeAdapter: ModuleAdapter = {
  moduleId: 'encode',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, successRes, tokenSampleRes] = await Promise.allSettled([
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'code_generation')
        .gte('created_at', since),
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'code_generation')
        .eq('success', true)
        .gte('created_at', since),
      supabase
        .from('ai_usage_log')
        .select('tokens_used')
        .eq('category', 'code_generation')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const totalGenerations = totalRes.status === 'fulfilled' ? (totalRes.value.count ?? 0) : 0;
    const successGenerations = successRes.status === 'fulfilled' ? (successRes.value.count ?? 0) : 0;

    let totalTokens = 0;
    if (tokenSampleRes.status === 'fulfilled' && tokenSampleRes.value.data) {
      totalTokens = tokenSampleRes.value.data.reduce((s: number, r: any) => s + (r.tokens_used ?? 0), 0);
    }

    const successRate = totalGenerations > 0 ? successGenerations / totalGenerations : 1;

    return {
      counters: {
        totalGenerations,
        successGenerations,
        failedGenerations: totalGenerations - successGenerations,
        tokensConsumed: totalTokens,
      },
      rates: {
        generationSuccessRate: successRate,
      },
      healthScore: Math.round(successRate * 100),
      lastUpdated: new Date().toISOString(),
    };
  },
};
