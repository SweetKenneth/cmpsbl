/**
 * GOAL Module Adapter — RIPPLE
 * Pulls live numeric state from brain events (ripple = event propagation).
 * No narrative. Only structured numeric state.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const rippleAdapter: ModuleAdapter = {
  moduleId: 'ripple',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('brain_events')
      .select('module, outcome')
      .gte('created_at', since)
      .limit(500);

    if (error || !data) {
      return {
        counters: { totalEvents: 0, successCount: 0, failureCount: 0 },
        rates: { successRate: 1, eventThroughput: 0 },
        healthScore: 100,
        lastUpdated: new Date().toISOString(),
      };
    }

    const totalEvents = data.length;
    const successCount = data.filter(d => d.outcome === 'succeeded').length;
    const failureCount = totalEvents - successCount;
    const successRate = totalEvents > 0 ? successCount / totalEvents : 1;

    // Module distribution
    const moduleCounts: Record<string, number> = {};
    data.forEach(d => { moduleCounts[d.module] = (moduleCounts[d.module] || 0) + 1; });

    return {
      counters: { totalEvents, successCount, failureCount, ...moduleCounts },
      rates: { successRate, eventThroughput: totalEvents / 24 },
      healthScore: Math.round(successRate * 100),
      lastUpdated: new Date().toISOString(),
    };
  },
};
