/**
 * PromptFluid Nexus Brain Core
 * SPARTA Epoch — Central AI orchestration with hardened input validation
 */

import { routeToBestModel } from './router';
import { cacheResponse, getCachedResponse } from './cache';
import { learnFromResult } from './learning';
import { recordMetric } from './metrics';
import { validateStringInput, safeParse } from '@/lib/system/hardening';

export interface AIRequest {
  prompt: string;
  context?: Record<string, any>;
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
  metadata?: Record<string, any>;
}

export async function processAIRequest(request: AIRequest): Promise<AIResponse> {
  // Validate prompt input — reject empty or oversized prompts
  const safePrompt = validateStringInput(request.prompt, { maxLength: 100_000, minLength: 1, label: 'nexus.prompt' });
  if (!safePrompt) {
    throw new Error('[NEXUS] Invalid prompt: must be 1-100,000 characters');
  }

  const startTime = Date.now();
  
  try {
    // Check cache first if enabled
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

    // Route to best model based on request type
    const hardenedRequest = { ...request, prompt: safePrompt };
    const { model, execute } = await routeToBestModel(hardenedRequest);
    
    // Execute AI request
    const result = await execute(safePrompt, request.context);
    
    const latency = Date.now() - startTime;
    
    // Cache successful response
    if (result.success) {
      await cacheResponse(safePrompt, {
        content: result.content,
        model,
        timestamp: Date.now(),
      });
    }

    // Learn from result
    await learnFromResult({
      request,
      response: result.content,
      model,
      latency,
      success: result.success,
    });

    // Record metrics
    await recordMetric('ai_request_completed', {
      model,
      latency,
      type: request.type,
      cached: false,
    });

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
  const cached = await getCachedResponseCount();
  const total = await getTotalRequests();
  
  return {
    active: cached >= 0 && total >= 0,
    models: ['groq', 'cerebras', 'google-ai-studio', 'together', 'deepseek', 'hyperbolic'],
    uptime: total > 0 ? ((total - (await getFailedRequests())) / total * 100) : 100,
    cached_responses: cached,
    total_requests: total,
  };
}

async function getCachedResponseCount(): Promise<number> {
  const stored = localStorage.getItem('nexus_metrics');
  if (!stored) return 0;
  const metrics = safeParse<any[]>(stored, 500_000);
  if (!Array.isArray(metrics)) return 0;
  return metrics.filter(m => m.name === 'cache_hit').length;
}

async function getTotalRequests(): Promise<number> {
  const stored = localStorage.getItem('nexus_metrics');
  if (!stored) return 0;
  const metrics = safeParse<any[]>(stored, 500_000);
  if (!Array.isArray(metrics)) return 0;
  return metrics.filter(m => m.name === 'ai_request_completed').length;
}

async function getFailedRequests(): Promise<number> {
  const stored = localStorage.getItem('nexus_metrics');
  if (!stored) return 0;
  const metrics = safeParse<any[]>(stored, 500_000);
  if (!Array.isArray(metrics)) return 0;
  return metrics.filter(m => m.name === 'ai_request_failed').length;
}
