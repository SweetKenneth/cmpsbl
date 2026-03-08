/**
 * CMPSBL® NEXUS — Health-Weighted Provider Routing
 * Intelligent provider selection based on health scores
 * 
 * Supports 13 free-tier providers with automatic failover and cost optimization
 */

import { supabase } from '@/integrations/supabase/client';

export interface ProviderHealth {
  provider: string;
  healthScore: number;
  avgResponseTime: number;
  successRate: number;
  lastError: string | null;
  lastSuccess: string | null;
  weight: number;
}

export interface RoutingDecision {
  selectedProvider: string;
  reason: string;
  alternatives: string[];
  confidence: number;
}

export interface ProviderMetrics {
  provider: string;
  calls24h: number;
  successRate: number;
  avgLatency: number;
  totalTokens: number;
  estimatedCost: number;
}

// All fleet providers — must match FLEET_REGISTRY
const PROVIDERS = ['groq', 'together', 'cerebras', 'openrouter', 'stability', 'fal', 'google', 'deepseek', 'sambanova', 'mistral', 'cohere', 'hyperbolic'];

const PROVIDER_CAPABILITIES: Record<string, { types: string[]; priority: number; costFactor: number }> = {
  groq: { types: ['text', 'reasoning', 'generation', 'code'], priority: 1, costFactor: 0.8 },
  together: { types: ['text', 'research', 'reasoning', 'generation'], priority: 2, costFactor: 1.0 },
  cerebras: { types: ['text', 'refinement', 'reasoning', 'code'], priority: 3, costFactor: 0.9 },
  openrouter: { types: ['text', 'research', 'generation', 'reasoning'], priority: 4, costFactor: 1.2 },
  stability: { types: ['image', 'generation'], priority: 1, costFactor: 1.0 },
  fal: { types: ['image', 'video', 'generation'], priority: 2, costFactor: 1.1 },
  google: { types: ['text', 'image', 'multimodal', 'code', 'reasoning'], priority: 2, costFactor: 1.0 },
  deepseek: { types: ['text', 'reasoning', 'code', 'research'], priority: 3, costFactor: 0.7 },
  sambanova: { types: ['text', 'reasoning'], priority: 4, costFactor: 0.0 },
  mistral: { types: ['text', 'reasoning', 'code', 'refinement'], priority: 5, costFactor: 0.9 },
  cohere: { types: ['text', 'research', 'generation', 'analysis'], priority: 6, costFactor: 1.0 },
  hyperbolic: { types: ['text', 'reasoning', 'generation'], priority: 7, costFactor: 0.8 },
};

/**
 * Get health metrics for all providers
 */
export async function getProviderHealthMetrics(): Promise<ProviderHealth[]> {
  const healthData: ProviderHealth[] = [];
  
  try {
    const since = new Date(Date.now() - 3600000).toISOString(); // Last hour
    
    const { data: usage } = await supabase
      .from('ai_usage_log')
      .select('provider, success, response_time_ms, created_at')
      .gte('created_at', since)
      .limit(1000);
    
    for (const provider of PROVIDERS) {
      const providerLogs = usage?.filter(u => u.provider === provider) || [];
      
      const totalCalls = providerLogs.length;
      const successfulCalls = providerLogs.filter(u => u.success).length;
      const successRate = totalCalls > 0 ? successfulCalls / totalCalls : 1;
      
      const avgResponseTime = totalCalls > 0
        ? providerLogs.reduce((s, u) => s + (u.response_time_ms || 0), 0) / totalCalls
        : 0;
      
      const lastSuccess = providerLogs
        .filter(u => u.success)
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())[0];
      
      const lastError = providerLogs
        .filter(u => !u.success)
        .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())[0];
      
      // Calculate health score (0-100)
      let healthScore = 100;
      healthScore -= (1 - successRate) * 50; // Up to -50 for failures
      healthScore -= Math.min(30, avgResponseTime / 100); // Up to -30 for slow responses
      
      // Penalty for recent errors
      if (lastError && new Date(lastError.created_at!).getTime() > Date.now() - 300000) {
        healthScore -= 15;
      }
      
      // Calculate routing weight
      const capabilities = PROVIDER_CAPABILITIES[provider];
      const weight = Math.max(0, healthScore / 100) * (1 / capabilities.priority) * (1 / capabilities.costFactor);
      
      healthData.push({
        provider,
        healthScore: Math.max(0, Math.min(100, healthScore)),
        avgResponseTime,
        successRate,
        lastError: lastError ? lastError.created_at! : null,
        lastSuccess: lastSuccess ? lastSuccess.created_at! : null,
        weight,
      });
    }
    
    return healthData.sort((a, b) => b.weight - a.weight);
    
  } catch (error) {
    console.error('Error getting provider health:', error);
    return PROVIDERS.map(p => ({
      provider: p,
      healthScore: 100,
      avgResponseTime: 0,
      successRate: 1,
      lastError: null,
      lastSuccess: null,
      weight: 1,
    }));
  }
}

/**
 * Select optimal provider for a task type
 */
export async function selectOptimalProvider(
  taskType: 'text' | 'image' | 'video' | 'research' | 'reasoning' | 'generation' | 'refinement',
  options?: {
    excludeProviders?: string[];
    preferLowCost?: boolean;
    preferSpeed?: boolean;
  }
): Promise<RoutingDecision> {
  const health = await getProviderHealthMetrics();
  const { excludeProviders = [], preferLowCost = false, preferSpeed = false } = options || {};
  
  // Filter to capable providers
  const capable = health.filter(h => {
    const caps = PROVIDER_CAPABILITIES[h.provider];
    return caps?.types.includes(taskType) && !excludeProviders.includes(h.provider);
  });
  
  if (capable.length === 0) {
    // Fallback to any healthy provider
    const fallback = health.find(h => h.healthScore > 50 && !excludeProviders.includes(h.provider));
    return {
      selectedProvider: fallback?.provider || 'groq',
      reason: 'No optimal provider available, using fallback',
      alternatives: [],
      confidence: 0.3,
    };
  }
  
  // Score and sort
  const scored = capable.map(h => {
    let score = h.weight;
    
    if (preferLowCost) {
      score *= 1 / PROVIDER_CAPABILITIES[h.provider].costFactor;
    }
    
    if (preferSpeed) {
      score *= h.avgResponseTime > 0 ? 1000 / h.avgResponseTime : 1;
    }
    
    return { ...h, finalScore: score };
  }).sort((a, b) => b.finalScore - a.finalScore);
  
  const selected = scored[0];
  const alternatives = scored.slice(1, 4).map(s => s.provider);
  
  let reason = `Best health-weighted option for ${taskType}`;
  if (preferLowCost) reason += ' (cost-optimized)';
  if (preferSpeed) reason += ' (speed-optimized)';
  
  return {
    selectedProvider: selected.provider,
    reason,
    alternatives,
    confidence: Math.min(0.95, selected.healthScore / 100 * selected.successRate),
  };
}

/**
 * Get 24-hour provider statistics
 */
export async function getProviderStats(): Promise<ProviderMetrics[]> {
  try {
    const since = new Date(Date.now() - 24 * 3600000).toISOString();
    
    const { data: usage } = await supabase
      .from('ai_usage_log')
      .select('*')
      .gte('created_at', since);
    
    return PROVIDERS.map(provider => {
      const logs = usage?.filter(u => u.provider === provider) || [];
      const successful = logs.filter(u => u.success);
      
      return {
        provider,
        calls24h: logs.length,
        successRate: logs.length > 0 ? successful.length / logs.length : 1,
        avgLatency: logs.length > 0
          ? logs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / logs.length
          : 0,
        totalTokens: logs.reduce((s, l) => s + (l.tokens_used || 0), 0),
        estimatedCost: logs.reduce((s, l) => s + (l.cost || 0), 0),
      };
    }).sort((a, b) => b.calls24h - a.calls24h);
    
  } catch (error) {
    console.error('Error getting provider stats:', error);
    return [];
  }
}

/**
 * Record provider performance for learning
 */
export async function recordProviderPerformance(
  provider: string,
  taskType: string,
  success: boolean,
  responseTimeMs: number,
  tokensUsed?: number
): Promise<void> {
  try {
    await supabase.from('ai_usage_log').insert({
      provider,
      category: taskType,
      success,
      response_time_ms: responseTimeMs,
      tokens_used: tokensUsed,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording provider performance:', error);
  }
}

/**
 * Get provider availability matrix
 */
export async function getProviderMatrix(): Promise<{
  matrix: Array<{
    provider: string;
    text: boolean;
    image: boolean;
    video: boolean;
    health: number;
    recommended: boolean;
  }>;
  summary: {
    healthyProviders: number;
    degradedProviders: number;
    offlineProviders: number;
  };
}> {
  const health = await getProviderHealthMetrics();
  
  const matrix = PROVIDERS.map(provider => {
    const h = health.find(ph => ph.provider === provider);
    const caps = PROVIDER_CAPABILITIES[provider];
    
    return {
      provider,
      text: caps?.types.includes('text') || caps?.types.includes('reasoning') || false,
      image: caps?.types.includes('image') || false,
      video: caps?.types.includes('video') || false,
      health: h?.healthScore || 0,
      recommended: (h?.healthScore || 0) > 70 && (h?.successRate || 0) > 0.9,
    };
  });
  
  const healthy = matrix.filter(m => m.health > 80).length;
  const degraded = matrix.filter(m => m.health > 30 && m.health <= 80).length;
  const offline = matrix.filter(m => m.health <= 30).length;
  
  return {
    matrix,
    summary: {
      healthyProviders: healthy,
      degradedProviders: degraded,
      offlineProviders: offline,
    },
  };
}
