/**
 * NEXUS Brain Core
 * Central AI orchestration with hardened input validation
 */

import { routeToBestModel } from './router';
import { cacheResponse, getCachedResponse } from './cache';
import { learnFromResult } from './learning';
import { recordMetric } from './metrics';
import { canSpend, recordSpend } from './budgetGovernance';
import { validateStringInput } from '@/lib/system/hardening';
import { secureGet } from '@/lib/system/secureStorage';

export interface AIRequest {
  prompt: string;
  context?: Record<string, unknown>;
  type?: 'research' | 'reasoning' | 'refinement' | 'generation';
  priority?: 'low' | 'medium' | 'high';
  useCache?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  latency: number;
  cached: boolean;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

interface MetricEntry {
  name: string;
}

export async function processAIRequest(request: AIRequest): Promise<AIResponse> {
  const safePrompt = validateStringInput(request.prompt, { maxLength: 100_000, minLength: 1, label: 'nexus.prompt' });
  if (!safePrompt) {
    throw new Error('[NEXUS] Invalid prompt: must be 1-100,000 characters');
  }

  const startTime = Date.now();
  
  try {
    if (request.useCache !== false) {
      const cached = await getCachedResponse(safePrompt);
      if (cached) {
        await recordMetric('cache_hit', { type: request.type });
        return {
          content: cached.content,
          model: cached.model,
          latency: Date.now() - startTime,
          cached: true,
        };
      }
    }

    // Pre-flight budget check — blocks requests if daily/monthly budget is exhausted
    const budgetCheck = await canSpend(1, request.type); // 1 cent estimate for free-tier
    if (!budgetCheck.allowed) {
      throw new Error(`[NEXUS] Budget exceeded: ${budgetCheck.reason}`);
    }

    const hardenedRequest = { ...request, prompt: safePrompt };
    const { model, execute } = await routeToBestModel(hardenedRequest);
    
    const result = await execute(safePrompt, request.context);
    
    const latency = Date.now() - startTime;

    // Record spend for budget tracking (0 for free tier, actual cost for paid)
    recordSpend(0, request.type);
    
    if (result.success) {
      // Cache and learn in parallel — both are independent post-processing
      await Promise.allSettled([
        cacheResponse(safePrompt, {
          content: result.content,
          model,
          timestamp: Date.now(),
        }),
        learnFromResult({
          request,
          response: result.content,
          model,
          latency,
          success: result.success,
        }),
        recordMetric('ai_request_completed', {
          model,
          latency,
          type: request.type,
          cached: false,
        }),
      ]);
    } else {
      await Promise.allSettled([
        learnFromResult({
          request,
          response: result.content,
          model,
          latency,
          success: result.success,
        }),
        recordMetric('ai_request_completed', {
          model,
          latency,
          type: request.type,
          cached: false,
        }),
      ]);
    }

    return {
      content: result.content,
      model,
      latency,
      cached: false,
      confidence: result.confidence,
      metadata: result.metadata,
    };
  } catch (error) {
    await recordMetric('ai_request_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: request.type,
    });
    throw error;
  }
}

export async function getNexusStatus() {
  // Single parse of metrics — avoid 3 separate scans
  const allMetrics = getMetricsFromStorage();
  let cached = 0;
  let completed = 0;
  let failed = 0;
  for (const m of allMetrics) {
    if (m.name === 'cache_hit') cached++;
    else if (m.name === 'ai_request_completed') completed++;
    else if (m.name === 'ai_request_failed') failed++;
  }
  const total = completed + failed;
  
  return {
    active: true,
    models: ['groq', 'cerebras', 'google-ai-studio', 'together', 'deepseek', 'hyperbolic'],
    uptime: total > 0 ? (completed / total * 100) : 100,
    cached_responses: cached,
    total_requests: total,
  };
}

function getMetricsFromStorage(): MetricEntry[] {
  return secureGet<MetricEntry[]>('nexus_metrics') || [];
}
