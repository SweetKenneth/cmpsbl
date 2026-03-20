/**
 * GOAL Module Adapter — RIPPLE
 * Pulls live numeric state from brain events (ripple = event propagation).
 * Optimized: count-only queries instead of fetching 500 rows.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const rippleAdapter: ModuleAdapter = {
  moduleId: 'ripple',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, successRes] = await Promise.allSettled([
      supabase
        .from('brain_events')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('brain_events')
        .select('id', { count: 'exact', head: true })
        .eq('outcome', 'succeeded')
        .gte('created_at', since),
    ]);

    const totalEvents = totalRes.status === 'fulfilled' ? (totalRes.value.count ?? 0) : 0;
    const successCount = successRes.status === 'fulfilled' ? (successRes.value.count ?? 0) : 0;
    const failureCount = totalEvents - successCount;
    const successRate = totalEvents > 0 ? successCount / totalEvents : 1;

    return {
      counters: { totalEvents, successCount, failureCount },
      rates: { successRate, eventThroughput: totalEvents / 24 },
      healthScore: Math.round(successRate * 100),
      lastUpdated: new Date().toISOString(),
    };
  },
};
