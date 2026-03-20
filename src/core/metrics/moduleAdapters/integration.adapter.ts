/**
 * GOAL Module Adapter — INTEGRATION
 * External service connectivity and reliability metrics.
 * Optimized: count-only for totals + small sample for latency/provider metrics.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const integrationAdapter: ModuleAdapter = {
  moduleId: 'integration',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, successRes, sampleRes] = await Promise.allSettled([
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
        .select('provider, response_time_ms')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    const totalCalls = totalRes.status === 'fulfilled' ? (totalRes.value.count ?? 0) : 0;
    const successCalls = successRes.status === 'fulfilled' ? (successRes.value.count ?? 0) : 0;
    let providers = new Set<string>();
    let avgLatency = 0;

    if (sampleRes.status === 'fulfilled' && sampleRes.value.data) {
      const rows = sampleRes.value.data;
      rows.forEach((r: any) => providers.add(r.provider));
      const latencies = rows.map((r: any) => r.response_time_ms ?? 0).filter((v: number) => v > 0);
      avgLatency = latencies.length > 0 ? latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length : 0;
    }

    const successRate = totalCalls > 0 ? successCalls / totalCalls : 1;
    const healthScore = Math.round(Math.min(100, successRate * 85 + (providers.size > 0 ? 15 : 0)));

    return {
      counters: {
        totalApiCalls: totalCalls,
        successApiCalls: successCalls,
        failedApiCalls: totalCalls - successCalls,
        activeProviders: providers.size,
      },
      rates: {
        apiSuccessRate: successRate,
        avgResponseMs: Math.round(avgLatency),
      },
      healthScore,
      lastUpdated: new Date().toISOString(),
    };
  },
};
