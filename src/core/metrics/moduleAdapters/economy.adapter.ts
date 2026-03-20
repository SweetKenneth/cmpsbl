/**
 * GOAL Module Adapter — ECONOMY
 * Tracks API usage costs, quota health, and billing metrics.
 * Optimized: count-only for totals, small sample for cost aggregation.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const economyAdapter: ModuleAdapter = {
  moduleId: 'economy',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [countRes, sampleRes, quotaRes] = await Promise.allSettled([
      supabase
        .from('access_usage')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('access_usage')
        .select('cost_millicents, tokens_used')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('ai_daily_quota')
        .select('calls_used, calls_budget')
        .gte('date', new Date().toISOString().slice(0, 10))
        .limit(10),
    ]);

    const totalUsageEvents = countRes.status === 'fulfilled' ? (countRes.value.count ?? 0) : 0;

    let totalCost = 0;
    let totalTokens = 0;
    if (sampleRes.status === 'fulfilled' && sampleRes.value.data) {
      for (const row of sampleRes.value.data) {
        totalCost += (row as any).cost_millicents ?? 0;
        totalTokens += (row as any).tokens_used ?? 0;
      }
    }

    let quotaUtilization = 0;
    if (quotaRes.status === 'fulfilled' && quotaRes.value.data) {
      const quotas = quotaRes.value.data;
      const totalUsed = quotas.reduce((s: number, q: any) => s + (q.calls_used ?? 0), 0);
      const totalBudget = quotas.reduce((s: number, q: any) => s + (q.calls_budget ?? 100), 0);
      quotaUtilization = totalBudget > 0 ? totalUsed / totalBudget : 0;
    }

    const healthScore = quotaUtilization > 0.95 ? 30 : quotaUtilization > 0.8 ? 60 : quotaUtilization > 0.5 ? 85 : 100;

    return {
      counters: {
        totalUsageEvents,
        totalCostMillicents: totalCost,
        totalTokensUsed: totalTokens,
      },
      rates: {
        quotaUtilization,
        costPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
      },
      healthScore,
      lastUpdated: new Date().toISOString(),
    };
  },
};
