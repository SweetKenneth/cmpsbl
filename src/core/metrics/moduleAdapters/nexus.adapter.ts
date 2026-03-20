/**
 * GOAL Module Adapter — NEXUS
 * Pulls live numeric state from AI usage / routing telemetry.
 * Optimized: uses count-only + small sample for aggregation.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const nexusAdapter: ModuleAdapter = {
  moduleId: 'nexus',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Parallel: count-only for totals + small sample for rate metrics
    const [countRes, successRes, sampleRes] = await Promise.allSettled([
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('success', true)
        .gte('created_at', since),
      supabase
        .from('ai_usage_log')
        .select('tokens_used, response_time_ms')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    const totalCalls = countRes.status === 'fulfilled' ? (countRes.value.count ?? 0) : 0;
    const successCount = successRes.status === 'fulfilled' ? (successRes.value.count ?? 0) : 0;
    const failureCount = totalCalls - successCount;
    const successRate = totalCalls > 0 ? successCount / totalCalls : 1;

    let totalTokens = 0;
    let avgResponseTimeMs = 0;
    if (sampleRes.status === 'fulfilled' && sampleRes.value.data) {
      const rows = sampleRes.value.data;
      totalTokens = rows.reduce((s, d) => s + (d.tokens_used || 0), 0);
      const latencies = rows.map(d => d.response_time_ms ?? 0).filter(v => v > 0);
      avgResponseTimeMs = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    }

    return {
      counters: { totalCalls, successCount, failureCount, totalTokens },
      rates: { successRate, avgResponseTimeMs },
      healthScore: Math.round(successRate * 100),
      lastUpdated: new Date().toISOString(),
    };
  },
};
