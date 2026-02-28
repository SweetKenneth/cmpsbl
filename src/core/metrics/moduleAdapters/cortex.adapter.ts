/**
 * GOAL Module Adapter — CORTEX
 * Pulls orchestration pipeline health metrics.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const cortexAdapter: ModuleAdapter = {
  moduleId: 'cortex',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [usageRes] = await Promise.allSettled([
      supabase
        .from('ai_usage_log')
        .select('id, success, response_time_ms', { count: 'exact' })
        .eq('category', 'orchestration')
        .gte('created_at', since)
        .limit(500),
    ]);

    let totalCalls = 0;
    let successCalls = 0;
    let avgLatency = 0;

    if (usageRes.status === 'fulfilled' && usageRes.value.data) {
      const rows = usageRes.value.data;
      totalCalls = usageRes.value.count ?? rows.length;
      successCalls = rows.filter((r: any) => r.success).length;
      const latencies = rows.map((r: any) => r.response_time_ms ?? 0).filter((v: number) => v > 0);
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
