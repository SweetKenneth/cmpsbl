/**
 * GOAL Module Adapter — SHADOW MESH (ENCODE/Immune)
 * Pulls live numeric state from immune_metrics and immune_escalations.
 * Optimized: count-only for escalation stats, reduced row fetches.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const shadowmeshAdapter: ModuleAdapter = {
  moduleId: 'shadowmesh',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const [metricsRes, openRes, encodeClaimedRes, encodeResolvedRes] = await Promise.allSettled([
      supabase
        .from('immune_metrics')
        .select('executor, total_runs, repair_successes, escalations, safe_failures')
        .gte('run_at', since)
        .limit(100),
      supabase
        .from('immune_escalations')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open'),
      supabase
        .from('immune_escalations')
        .select('id', { count: 'exact', head: true })
        .eq('claimed_by', 'ENCODE'),
      supabase
        .from('immune_escalations')
        .select('id', { count: 'exact', head: true })
        .eq('claimed_by', 'ENCODE')
        .eq('status', 'resolved'),
    ]);

    const metricsData = metricsRes.status === 'fulfilled' ? ((metricsRes.value.data ?? []) as any[]) : [];

    let totalRuns = 0, repairSuccesses = 0, escalations = 0, safeFailures = 0;
    for (const row of metricsData) {
      totalRuns += row.total_runs ?? 0;
      repairSuccesses += row.repair_successes ?? 0;
      escalations += row.escalations ?? 0;
      safeFailures += row.safe_failures ?? 0;
    }

    const openEscalations = openRes.status === 'fulfilled' ? (openRes.value.count ?? 0) : 0;
    const encodeClaimed = encodeClaimedRes.status === 'fulfilled' ? (encodeClaimedRes.value.count ?? 0) : 0;
    const encodeResolved = encodeResolvedRes.status === 'fulfilled' ? (encodeResolvedRes.value.count ?? 0) : 0;

    const repairAttempts = repairSuccesses + escalations;
    const repairRate = repairAttempts > 0 ? repairSuccesses / repairAttempts : 0;
    const encodeResolutionRate = encodeClaimed > 0 ? encodeResolved / encodeClaimed : 0;

    const healthScore = Math.round(
      (repairRate * 60) + (encodeResolutionRate * 30) + (openEscalations === 0 ? 10 : 0)
    );

    return {
      counters: {
        totalRuns,
        totalProbes: totalRuns,
        repairSuccesses,
        repairedProbes: repairSuccesses,
        escalations,
        safeFailures,
        failedProbes: escalations + safeFailures,
        encodeResolved,
        encodeClaimed,
        openEscalations,
      },
      rates: {
        repairRate,
        encodeResolutionRate,
      },
      healthScore: Math.min(100, Math.max(0, healthScore)),
      lastUpdated: new Date().toISOString(),
    };
  },
};
