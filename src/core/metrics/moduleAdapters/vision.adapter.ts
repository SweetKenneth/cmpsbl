/**
 * GOAL Module Adapter — VISION
 * Pulls live numeric state from accessibility scans + learning queries.
 * No narrative. Only structured numeric state.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const visionAdapter: ModuleAdapter = {
  moduleId: 'vision',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [scansRes, learningRes] = await Promise.allSettled([
      supabase
        .from('accessibility_scans')
        .select('score, scan_status')
        .gte('created_at', since)
        .limit(200),
      supabase
        .from('learning_queries')
        .select('status')
        .gte('created_at', since)
        .limit(500),
    ]);

    const scans = scansRes.status === 'fulfilled' ? (scansRes.value.data ?? []) : [];
    const queries = learningRes.status === 'fulfilled' ? (learningRes.value.data ?? []) : [];

    const totalScans = scans.length;
    const completedScans = scans.filter(s => s.scan_status === 'completed').length;
    const avgScanScore = totalScans > 0
      ? Math.round(scans.reduce((s, d) => s + (d.score ?? 0), 0) / totalScans)
      : 0;

    const totalQueries = queries.length;
    const completedQueries = queries.filter(q => q.status === 'completed').length;

    const scanCompletionRate = totalScans > 0 ? completedScans / totalScans : 1;
    const queryCompletionRate = totalQueries > 0 ? completedQueries / totalQueries : 1;

    return {
      counters: { totalScans, completedScans, avgScanScore, totalQueries, completedQueries },
      rates: { scanCompletionRate, queryCompletionRate },
      healthScore: Math.round(((scanCompletionRate + queryCompletionRate) / 2) * 100),
      lastUpdated: new Date().toISOString(),
    };
  },
};
