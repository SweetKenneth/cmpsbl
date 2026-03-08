/**
 * NEXUS Learning
 * Adaptive learning and performance optimization
 */

import { supabase } from '@/integrations/supabase/client';
import { secureGet, secureSet } from '@/lib/system/secureStorage';
import type { AIRequest } from './core';

interface LearningData {
  request: AIRequest;
  response: string;
  model: string;
  latency: number;
  success: boolean;
  feedback_score?: number;
}

interface LocalMetrics {
  total_calls: number;
  avg_latency: number;
  success_rate: number;
}

/**
 * Learn from AI request result to improve future routing
 */
export async function learnFromResult(data: LearningData): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_learning_data')
      .insert([{
        provider: 'nexus',
        model: data.model,
        success: data.success,
        input_data: {
          prompt: data.request.prompt,
          type: data.request.type || null,
          priority: data.request.priority || null,
          context: (data.request.context || null) as Record<string, string> | null,
        },
        output_data: {
          model: data.model,
          latency: data.latency,
          response: data.response,
          success: data.success,
        },
        metadata: {
          success: data.success,
          response_length: data.response?.length || 0,
          feedback_score: data.feedback_score,
          model_version: 'v1.0',
        }
      }]);

    if (error) {
      console.error('Failed to store learning data:', error);
      return;
    }

    try {
      await supabase.functions.invoke('pf-learning-log', {
        body: {
          event_type: 'ai_completion',
          project_id: data.request.context?.project_id || 'nexus',
          payload: {
            model: data.model,
            latency: data.latency,
            success: data.success,
            response_length: data.response?.length || 0,
          },
          success: data.success,
        }
      });
    } catch {
      /* Non-critical: logging edge function unavailable */
    }

    updateLocalMetrics(data);
  } catch (error) {
    console.error('Learning error:', error);
  }
}

/**
 * Update local performance metrics for quick access — secure storage
 */
function updateLocalMetrics(data: LearningData): void {
  const metricsKey = `nexus_metrics_${data.model}`;
  const metrics: LocalMetrics = secureGet<LocalMetrics>(metricsKey) || {
    total_calls: 0,
    avg_latency: 0,
    success_rate: 0,
  };

  metrics.total_calls++;
  metrics.avg_latency = (metrics.avg_latency * (metrics.total_calls - 1) + data.latency) / metrics.total_calls;
  metrics.success_rate = ((metrics.success_rate * (metrics.total_calls - 1)) + (data.success ? 1 : 0)) / metrics.total_calls;

  secureSet(metricsKey, metrics);
}

/**
 * Get learning insights for dashboard
 */
export async function getLearningInsights() {
  try {
    const { data, error } = await supabase
      .from('ai_learning_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const insights = {
      total_learning_cycles: data?.length || 0,
      model_performance: analyzeModelPerformance((data || []) as any[]),
      optimization_suggestions: generateOptimizations((data || []) as any[]),
    };

    return insights;
  } catch (error) {
    console.error('Failed to get learning insights:', error);
    return null;
  }
}

interface LearningEntry {
  model: string;
  model_name?: string;
  output_data?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
}

function analyzeModelPerformance(data: LearningEntry[]) {
  const performance: Record<string, { calls: number; avg_latency: number }> = {};
  
  data.forEach((entry) => {
    // FIX: Use 'model' column (not 'model_name') and 'output_data.latency' (not 'prediction.latency')
    const model = entry.model || entry.model_name || 'unknown';
    if (!performance[model]) {
      performance[model] = { calls: 0, avg_latency: 0 };
    }
    performance[model].calls++;
    const latency = (entry.output_data as any)?.latency || 0;
    performance[model].avg_latency += latency;
  });

  Object.keys(performance).forEach((model) => {
    if (performance[model].calls > 0) {
      performance[model].avg_latency /= performance[model].calls;
    }
  });

  return performance;
}

function generateOptimizations(_data: LearningEntry[]) {
  return [
    'Consider caching frequent queries',
    'Route heavy reasoning tasks to Groq',
    'Use Together AI for complex multi-step requests',
  ];
}
