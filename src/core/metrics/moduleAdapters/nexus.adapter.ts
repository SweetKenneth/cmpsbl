/**
 * GOAL Module Adapter — NEXUS
 * Pulls live numeric state from AI usage / routing telemetry.
 * No narrative. Only structured numeric state.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const nexusAdapter: ModuleAdapter = {
  moduleId: 'nexus',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('ai_usage_log')
      .select('provider, tokens_used, success, response_time_ms')
      .gte('created_at', since)
      .limit(500);

    if (error || !data) {
      return {
        counters: { totalCalls: 0, successCount: 0, failureCount: 0, totalTokens: 0 },
        rates: { successRate: 1, avgResponseTimeMs: 0 },
        healthScore: 100,
        lastUpdated: new Date().toISOString(),
      };
    }

    const totalCalls = data.length;
    const successCount = data.filter(d => d.success).length;
    const failureCount = totalCalls - successCount;
    const totalTokens = data.reduce((s, d) => s + (d.tokens_used || 0), 0);
    const avgResponseTimeMs = totalCalls > 0
      ? Math.round(data.reduce((s, d) => s + (d.response_time_ms || 0), 0) / totalCalls)
      : 0;
    const successRate = totalCalls > 0 ? successCount / totalCalls : 1;

    return {
      counters: { totalCalls, successCount, failureCount, totalTokens },
      rates: { successRate, avgResponseTimeMs },
      healthScore: Math.round(successRate * 100),
      lastUpdated: new Date().toISOString(),
    };
  },
};
