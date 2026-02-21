/**
 * GOAL Module Adapter — DEFENSE
 * Pulls live numeric state from defense/security telemetry.
 * No narrative. Only structured numeric state.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const defenseAdapter: ModuleAdapter = {
  moduleId: 'defense',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [threatRes, auditRes] = await Promise.allSettled([
      supabase
        .from('ai_usage_log')
        .select('id', { count: 'exact', head: true })
        .eq('category', 'security')
        .gte('created_at', since),
      supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
    ]);

    const threatsBlocked = threatRes.status === 'fulfilled' ? (threatRes.value.count ?? 0) : 0;
    const auditEvents = auditRes.status === 'fulfilled' ? (auditRes.value.count ?? 0) : 0;

    const totalEvents = threatsBlocked + auditEvents;
    const healthScore = threatsBlocked > 10 ? 70 : threatsBlocked > 0 ? 85 : 100;

    return {
      counters: {
        threatsBlocked,
        auditEvents,
        totalSecurityEvents: totalEvents,
      },
      rates: {
        threatRate: totalEvents > 0 ? threatsBlocked / totalEvents : 0,
      },
      healthScore,
      lastUpdated: new Date().toISOString(),
    };
  },
};
