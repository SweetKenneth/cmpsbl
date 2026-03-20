/**
 * GOAL Module Adapter — ACCESS
 * Pulls live numeric state from access_usage, subscriptions, API keys.
 * Optimized: count-only queries, small sample for cost aggregation.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const accessAdapter: ModuleAdapter = {
  moduleId: 'access',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [countRes, keysRes, subsRes, sampleRes] = await Promise.allSettled([
      supabase
        .from('access_usage')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('access_api_keys')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('access_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('access_usage')
        .select('cost_millicents, tokens_used')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

    const totalRequests = countRes.status === 'fulfilled' ? (countRes.value.count ?? 0) : 0;
    const activeKeys = keysRes.status === 'fulfilled' ? (keysRes.value.count ?? 0) : 0;
    const activeSubscriptions = subsRes.status === 'fulfilled' ? (subsRes.value.count ?? 0) : 0;

    let totalCostMillicents = 0;
    let totalTokensUsed = 0;
    if (sampleRes.status === 'fulfilled' && sampleRes.value.data) {
      for (const d of sampleRes.value.data) {
        totalCostMillicents += d.cost_millicents || 0;
        totalTokensUsed += d.tokens_used || 0;
      }
    }

    return {
      counters: {
        totalRequests,
        activeKeys,
        activeSubscriptions,
        totalCostMillicents,
        totalTokensUsed,
      },
      rates: {
        avgCostPerRequest: totalRequests > 0 ? totalCostMillicents / totalRequests : 0,
        avgTokensPerRequest: totalRequests > 0 ? totalTokensUsed / totalRequests : 0,
      },
      healthScore: 100,
      lastUpdated: new Date().toISOString(),
    };
  },
};
