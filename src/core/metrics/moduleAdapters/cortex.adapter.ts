/**
 * GOAL Module Adapter — CORTEX
 * Pulls orchestration pipeline health metrics.
 * Optimized: count-only queries + small sample for latency.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const cortexAdapter: ModuleAdapter = {
  moduleId: 'cortex',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, successRes, latencyRes] = await Promise.allSettled([
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'orchestration')
        .gte('created_at', since),
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'orchestration')
        .eq('success', true)
        .gte('created_at', since),
      supabase
        .from('ai_usage_log')
        .select('response_time_ms')
        .eq('category', 'orchestration')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const totalCalls = totalRes.status === 'fulfilled' ? (totalRes.value.count ?? 0) : 0;
    const successCalls = successRes.status === 'fulfilled' ? (successRes.value.count ?? 0) : 0;

    let avgLatency = 0;
    if (latencyRes.status === 'fulfilled' && latencyRes.value.data) {
      const latencies = latencyRes.value.data.map((r: any) => r.response_time_ms ?? 0).filter((v: number) => v > 0);
      avgLatency = latencies.length > 0 ? latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length : 0;
    }

    const successRate = totalCalls > 0 ? successCalls / totalCalls : 1;
    const healthScore = Math.round(Math.min(100, successRate * 90 + (avgLatency < 2000 ? 10 : 0)));

    return {
      counters: {
        totalPipelines: totalCalls,
        successPipelines: successCalls,
        failedPipelines: totalCalls - successCalls,
      },
      rates: {
        pipelineSuccessRate: successRate,
        avgLatencyMs: Math.round(avgLatency),
      },
      healthScore,
      lastUpdated: new Date().toISOString(),
    };
  },
};
