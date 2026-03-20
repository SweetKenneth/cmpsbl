/**
 * GOAL Module Adapter — VISION
 * Pulls live numeric state from accessibility scans + learning queries.
 * Optimized: count-only queries for totals, small sample for score averaging.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const visionAdapter: ModuleAdapter = {
  moduleId: 'vision',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [totalScansRes, completedScansRes, scoreSampleRes, totalQueriesRes, completedQueriesRes] = await Promise.allSettled([
      supabase
        .from('accessibility_scans')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('accessibility_scans')
        .select('id', { count: 'exact', head: true })
        .eq('scan_status', 'completed')
        .gte('created_at', since),
      supabase
        .from('accessibility_scans')
        .select('score')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('learning_queries')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('learning_queries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', since),
    ]);

    const totalScans = totalScansRes.status === 'fulfilled' ? (totalScansRes.value.count ?? 0) : 0;
    const completedScans = completedScansRes.status === 'fulfilled' ? (completedScansRes.value.count ?? 0) : 0;
    const totalQueries = totalQueriesRes.status === 'fulfilled' ? (totalQueriesRes.value.count ?? 0) : 0;
    const completedQueries = completedQueriesRes.status === 'fulfilled' ? (completedQueriesRes.value.count ?? 0) : 0;

    let avgScanScore = 0;
    if (scoreSampleRes.status === 'fulfilled' && scoreSampleRes.value.data?.length) {
      const scores = scoreSampleRes.value.data;
      avgScanScore = Math.round(scores.reduce((s, d) => s + (d.score ?? 0), 0) / scores.length);
    }

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
