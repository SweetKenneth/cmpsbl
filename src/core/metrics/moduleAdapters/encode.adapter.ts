/**
 * GOAL Module Adapter — ENCODE
 * Code generation pipeline health and throughput metrics.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const encodeAdapter: ModuleAdapter = {
  moduleId: 'encode',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [genRes] = await Promise.allSettled([
      supabase
        .from('ai_usage_log')
        .select('id, success, tokens_used', { count: 'exact' })
        .eq('category', 'code_generation')
        .gte('created_at', since)
        .limit(200),
    ]);

    let totalGenerations = 0;
    let successGenerations = 0;
    let totalTokens = 0;

    if (genRes.status === 'fulfilled' && genRes.value.data) {
      totalGenerations = genRes.value.count ?? genRes.value.data.length;
      successGenerations = genRes.value.data.filter((r: any) => r.success).length;
      totalTokens = genRes.value.data.reduce((s: number, r: any) => s + (r.tokens_used ?? 0), 0);
    }

    const successRate = totalGenerations > 0 ? successGenerations / totalGenerations : 1;
    const healthScore = Math.round(successRate * 100);

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
      healthScore,
      lastUpdated: new Date().toISOString(),
    };
  },
};
