/**
 * GOAL Module Adapter — BRAIN
 * Pulls live numeric state from cognitive/learning telemetry.
 */

import { supabase } from '@/integrations/supabase/client';
import type { ModuleAdapter, ModuleLiveMetrics } from '../metricsSchema';

export const brainAdapter: ModuleAdapter = {
  moduleId: 'brain',

  async getLiveMetrics(): Promise<ModuleLiveMetrics> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [learningRes, knowledgeRes] = await Promise.allSettled([
      supabase
        .from('ai_learning_data')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since),
      supabase
        .from('ai_learning_data')
        .select('id', { count: 'exact', head: true })
        .eq('success', true)
        .gte('created_at', since),
    ]);

    const totalLearning = learningRes.status === 'fulfilled' ? (learningRes.value.count ?? 0) : 0;
    const successfulLearning = knowledgeRes.status === 'fulfilled' ? (knowledgeRes.value.count ?? 0) : 0;
    const successRate = totalLearning > 0 ? successfulLearning / totalLearning : 1;
    const healthScore = Math.round(Math.min(100, successRate * 100));

    return {
      counters: {
        totalLearningEvents: totalLearning,
        successfulLearning,
        failedLearning: totalLearning - successfulLearning,
      },
      rates: {
        learningSuccessRate: successRate,
      },
      healthScore,
      lastUpdated: new Date().toISOString(),
    };
  },
};
