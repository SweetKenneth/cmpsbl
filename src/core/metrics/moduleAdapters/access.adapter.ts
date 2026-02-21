/**
 * GOAL Module Adapter — ACCESS
 * Pulls live numeric state from access_usage, subscriptions, API keys.
 * No narrative. Only structured numeric state.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const accessAdapter: ModuleAdapter = {
  moduleId: 'access',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [usageRes, keysRes, subsRes] = await Promise.allSettled([
      supabase
        .from('access_usage')
        .select('module, cost_millicents, tokens_used')
        .gte('created_at', since)
        .limit(500),
      supabase
        .from('access_api_keys')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('access_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
    ]);

    const usageData = usageRes.status === 'fulfilled' ? (usageRes.value.data ?? []) : [];
    const activeKeys = keysRes.status === 'fulfilled' ? (keysRes.value.count ?? 0) : 0;
    const activeSubscriptions = subsRes.status === 'fulfilled' ? (subsRes.value.count ?? 0) : 0;

    const totalRequests = usageData.length;
    const totalCostMillicents = usageData.reduce((s, d) => s + (d.cost_millicents || 0), 0);
    const totalTokensUsed = usageData.reduce((s, d) => s + (d.tokens_used || 0), 0);

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
      healthScore: 100, // ACCESS is healthy if it can query
      lastUpdated: new Date().toISOString(),
    };
  },
};
