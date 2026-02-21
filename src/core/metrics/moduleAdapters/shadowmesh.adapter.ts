/**
 * GOAL Module Adapter — SHADOW MESH (ENCODE/Immune)
 * Pulls live numeric state from immune_metrics and immune_escalations.
 * No narrative. Only structured numeric state.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const shadowmeshAdapter: ModuleAdapter = {
  moduleId: 'shadowmesh',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const [metricsRes, escalationsRes] = await Promise.allSettled([
      supabase
        .from('immune_metrics')
        .select('executor, total_runs, repair_successes, escalations, safe_failures')
        .gte('run_at', since),
      supabase
        .from('immune_escalations')
        .select('status, claimed_by, resolved_at')
        .limit(500),
    ]);

    const metricsData = metricsRes.status === 'fulfilled' ? ((metricsRes.value.data ?? []) as any[]) : [];
    const escalationData = escalationsRes.status === 'fulfilled' ? ((escalationsRes.value.data ?? []) as any[]) : [];

    let totalRuns = 0, repairSuccesses = 0, escalations = 0, safeFailures = 0;
    for (const row of metricsData) {
      totalRuns += row.total_runs ?? 0;
      repairSuccesses += row.repair_successes ?? 0;
      escalations += row.escalations ?? 0;
      safeFailures += row.safe_failures ?? 0;
    }

    const encodeResolved = escalationData.filter(d => d.claimed_by === 'ENCODE' && d.status === 'resolved').length;
    const encodeClaimed = escalationData.filter(d => d.claimed_by === 'ENCODE').length;
    const openEscalations = escalationData.filter(d => d.status === 'open').length;

    const denom = repairSuccesses + escalations + safeFailures;
    const repairRate = denom > 0 ? repairSuccesses / denom : 0;
    const encodeResolutionRate = encodeClaimed > 0 ? encodeResolved / encodeClaimed : 0;

    const healthScore = Math.round(
      (repairRate * 60) + (encodeResolutionRate * 30) + (openEscalations === 0 ? 10 : 0)
    );

    return {
      counters: {
        totalRuns,
        repairSuccesses,
        escalations,
        safeFailures,
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
