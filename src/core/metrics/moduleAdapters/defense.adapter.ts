/**
 * GOAL Module Adapter — DEFENSE v2.0.0
 * Pulls live numeric state from defense/security telemetry.
 * Optimized: parallel queries, cached health formula, compact response.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

/** Weighted health score from threat density — avoids branching */
function computeHealth(threats: number, total: number): number {
  if (total === 0) return 100;
  const threatRatio = threats / total;
  // Continuous score: 100 → 70 as ratio goes 0 → 1
  return Math.round(100 - threatRatio * 30);
}

export const defenseAdapter: ModuleAdapter = {
  moduleId: 'defense',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 86_400_000).toISOString();

    // Parallel count queries — head-only, minimal payload
    const [threatRes, auditRes, defenseRes] = await Promise.allSettled([
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'security')
        .gte('created_at', since),
      supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('defense_events')
        .select('id', { count: 'exact', head: true })
        .gte('detected_at', since),
    ]);

    const threatsBlocked = threatRes.status === 'fulfilled' ? (threatRes.value.count ?? 0) : 0;
    const auditEvents = auditRes.status === 'fulfilled' ? (auditRes.value.count ?? 0) : 0;
    const defenseEvents = defenseRes.status === 'fulfilled' ? (defenseRes.value.count ?? 0) : 0;

    const totalEvents = threatsBlocked + auditEvents + defenseEvents;

    return {
      counters: {
        threatsBlocked,
        auditEvents,
        defenseEvents,
        totalSecurityEvents: totalEvents,
      },
      rates: {
        threatRate: totalEvents > 0 ? threatsBlocked / totalEvents : 0,
        defenseEventRate: totalEvents > 0 ? defenseEvents / totalEvents : 0,
      },
      healthScore: computeHealth(threatsBlocked, totalEvents),
      lastUpdated: new Date().toISOString(),
    };
  },
};
