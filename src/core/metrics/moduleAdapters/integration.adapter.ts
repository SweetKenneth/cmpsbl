/**
 * GOAL Module Adapter — INTEGRATION
 * External service connectivity and reliability metrics.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const integrationAdapter: ModuleAdapter = {
  moduleId: 'integration',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [apiRes] = await Promise.allSettled([
      supabase
        .from('ai_usage_log')
        .select('id, success, provider, response_time_ms', { count: 'exact' })
        .gte('created_at', since)
        .limit(500),
    ]);

    let totalCalls = 0;
    let successCalls = 0;
    let providers = new Set<string>();
    let avgLatency = 0;

    if (apiRes.status === 'fulfilled' && apiRes.value.data) {
      const rows = apiRes.value.data;
      totalCalls = apiRes.value.count ?? rows.length;
      successCalls = rows.filter((r: any) => r.success).length;
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
