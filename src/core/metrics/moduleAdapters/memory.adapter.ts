/**
 * GOAL Module Adapter — MEMORY (BRAIN)
 * Pulls live numeric state from all four brain memory tiers.
 * No narrative. Only structured numeric state.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const memoryAdapter: ModuleAdapter = {
  moduleId: 'memory',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const [hotRes, warmRes, coldRes, glacierRes] = await Promise.allSettled([
      supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
      supabase.from('brain_memory_archive').select('id', { count: 'exact', head: true }),
    ]);

    const hotCount = hotRes.status === 'fulfilled' ? (hotRes.value.count ?? 0) : 0;
    const warmCount = warmRes.status === 'fulfilled' ? (warmRes.value.count ?? 0) : 0;
    const coldCount = coldRes.status === 'fulfilled' ? (coldRes.value.count ?? 0) : 0;
    const glacierCount = glacierRes.status === 'fulfilled' ? (glacierRes.value.count ?? 0) : 0;
    const totalMemories = hotCount + warmCount + coldCount + glacierCount;

    // Utilization: ratio of hot to total (higher = more active memory)
    const hotRatio = totalMemories > 0 ? hotCount / totalMemories : 0;

    return {
      counters: { hotCount, warmCount, coldCount, glacierCount, totalMemories },
      rates: { hotRatio, memoriesPerTier: totalMemories / 4 },
      healthScore: totalMemories > 0 ? 100 : 50,
      lastUpdated: new Date().toISOString(),
    };
  },
};
