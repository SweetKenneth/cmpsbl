/**
 * NEXUS Batch Routing Engine
 * Concurrent Request Management & Provider Failover
 * 
 * Missing capability: Batch request processing with
 * intelligent load balancing and failover chains.
 */

import { supabase } from '@/integrations/supabase/client';
import type { SupportedProvider } from './index';
import { estimateCost, checkBudget } from './costEstimation';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BatchRequest {
  id: string;
  prompt: string;
  taskType: 'text' | 'code' | 'research' | 'image';
  priority: 'low' | 'normal' | 'high' | 'critical';
  maxCost?: number;
  preferredProvider?: SupportedProvider;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export interface BatchResult {
  id: string;
  success: boolean;
  provider: SupportedProvider;
  response?: unknown;
  error?: string;
  latency: number;
  cost: number;
  retryCount: number;
}

export interface BatchSummary {
  totalRequests: number;
  succeeded: number;
  failed: number;
  totalLatency: number;
  totalCost: number;
  providerBreakdown: Record<string, { count: number; avgLatency: number }>;
  results: BatchResult[];
}

export interface FailoverChain {
  primary: SupportedProvider;
  secondary: SupportedProvider[];
  maxRetries: number;
  retryDelay: number;
}

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-latency' | 'cost-optimized' | 'availability';
  maxConcurrent: number;
  healthThreshold: number;
}

// Provider health tracking
const providerHealth = new Map<SupportedProvider, {
  healthy: boolean;
  lastSuccess: Date | null;
  lastFailure: Date | null;
  successRate: number;
  avgLatency: number;
}>();

// Initialize health tracking — include ALL providers that appear in failover chains
const providers: SupportedProvider[] = ['groq', 'together', 'cerebras', 'openrouter', 'google', 'deepseek', 'sambanova', 'fal', 'stability', 'mistral', 'cohere', 'hyperbolic'];
providers.forEach(p => {
  providerHealth.set(p, {
    healthy: true,
    lastSuccess: null,
    lastFailure: null,
    successRate: 1.0,
    avgLatency: 500,
  });
});

// Default failover chains
const DEFAULT_FAILOVER_CHAINS: Record<string, FailoverChain> = {
  text: {
    primary: 'groq',
    secondary: ['cerebras', 'together', 'google'],
    maxRetries: 3,
    retryDelay: 500,
  },
  code: {
    primary: 'groq',
    secondary: ['cerebras', 'deepseek'],
    maxRetries: 3,
    retryDelay: 500,
  },
  research: {
    primary: 'together',
    secondary: ['groq', 'google'],
    maxRetries: 2,
    retryDelay: 1000,
  },
  image: {
    primary: 'fal',
    secondary: ['stability', 'google'],
    maxRetries: 2,
    retryDelay: 2000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process multiple requests in parallel with load balancing
 */
export async function processBatch(
  requests: BatchRequest[],
  config?: Partial<LoadBalancerConfig>
): Promise<BatchSummary> {
  const startTime = Date.now();
  const mergedConfig: LoadBalancerConfig = {
    strategy: config?.strategy ?? 'cost-optimized',
    maxConcurrent: config?.maxConcurrent ?? 5,
    healthThreshold: config?.healthThreshold ?? 0.5,
  };

  const results: BatchResult[] = [];
  
  // Sort by priority
  const sortedRequests = [...requests].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Process in batches respecting maxConcurrent
  for (let i = 0; i < sortedRequests.length; i += mergedConfig.maxConcurrent) {
    const batch = sortedRequests.slice(i, i + mergedConfig.maxConcurrent);
    
    const batchResults = await Promise.all(
      batch.map(req => processWithFailover(req, mergedConfig))
    );
    
    results.push(...batchResults);
  }

  // Calculate summary
  const succeeded = results.filter(r => r.success).length;
  const failed = results.length - succeeded;
  const totalLatency = results.reduce((sum, r) => sum + r.latency, 0);
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);

  const providerBreakdown: Record<string, { count: number; avgLatency: number; totalLatency: number }> = {};
  for (const result of results.filter(r => r.success)) {
    if (!providerBreakdown[result.provider]) {
      providerBreakdown[result.provider] = { count: 0, avgLatency: 0, totalLatency: 0 };
    }
    providerBreakdown[result.provider].count++;
    providerBreakdown[result.provider].totalLatency += result.latency;
    providerBreakdown[result.provider].avgLatency = 
      providerBreakdown[result.provider].totalLatency / providerBreakdown[result.provider].count;
  }

  // Log batch processing
  await supabase.from('brain_events').insert({
    module: 'nexus',
    event_type: 'batch.completed',
    data: {
      totalRequests: requests.length,
      succeeded,
      failed,
      totalLatency,
      totalCost,
      duration: Date.now() - startTime,
    } as unknown as Record<string, never>,
    outcome: failed === 0 ? 'success' : 'partial',
  });

  return {
    totalRequests: requests.length,
    succeeded,
    failed,
    totalLatency,
    totalCost,
    providerBreakdown,
    results,
  };
}

/**
 * Process single request with failover chain
 */
async function processWithFailover(
  request: BatchRequest,
  config: LoadBalancerConfig
): Promise<BatchResult> {
  const startTime = Date.now();
  const chain = DEFAULT_FAILOVER_CHAINS[request.taskType] || DEFAULT_FAILOVER_CHAINS.text;
  
  let provider: SupportedProvider = request.preferredProvider || chain.primary;
  let retryCount = 0;
  let lastError: string | undefined;

  // Get all providers in failover order
  const providers = [provider, ...chain.secondary.filter(p => p !== provider)];

  for (const currentProvider of providers) {
    if (retryCount >= chain.maxRetries) break;

    // Check provider health
    const health = providerHealth.get(currentProvider);
    if (health && !health.healthy && health.successRate < config.healthThreshold) {
      continue;
    }

    // Check budget
    const estimate = estimateCost(currentProvider, 'default', request.prompt);
    if (request.maxCost && estimate.estimatedCost > request.maxCost) {
      continue;
    }

    const budgetCheck = await checkBudget(estimate.estimatedCost);
    if (!budgetCheck.allowed) {
      continue;
    }

    try {
      // Simulate request (in production, would call actual provider)
      const response = await simulateRequest(currentProvider, request);
      
      // Update health tracking
      updateProviderHealth(currentProvider, true, Date.now() - startTime);

      return {
        id: request.id,
        success: true,
        provider: currentProvider,
        response,
        latency: Date.now() - startTime,
        cost: estimate.estimatedCost,
        retryCount,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Request failed';
      updateProviderHealth(currentProvider, false, Date.now() - startTime);
      retryCount++;
      
      // Wait before retry
      if (retryCount < chain.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, chain.retryDelay));
      }
    }
  }

  return {
    id: request.id,
    success: false,
    provider: provider,
    error: lastError || 'All providers exhausted',
    latency: Date.now() - startTime,
    cost: 0,
    retryCount,
  };
}

/**
 * Execute a provider request using the Nexus routing system
 */
async function simulateRequest(
  provider: SupportedProvider,
  request: BatchRequest
): Promise<unknown> {
  const startTime = Date.now();
  
  try {
    // Import the nexus router dynamically to avoid circular deps
    const { processAIRequest } = await import('./core');
    
    // Route the request through nexus
    const result = await processAIRequest({
      prompt: request.prompt,
      type: request.taskType === 'text' ? 'generation' : 
            request.taskType === 'code' ? 'generation' :
            request.taskType === 'research' ? 'research' : 'generation',
      priority: request.priority === 'critical' ? 'high' : 
                request.priority === 'high' ? 'high' : 
                request.priority === 'low' ? 'low' : 'medium',
      context: { provider, timeout: request.timeout || 30000 },
    });
    
    return {
      provider,
      response: result.content,
      model: result.model,
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // Check provider health and throw with context
    const health = providerHealth.get(provider);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    throw new Error(`Provider ${provider} failed (health: ${health?.successRate.toFixed(2) || 'unknown'}): ${errorMsg}`);
  }
}

/**
 * Update provider health tracking
 */
function updateProviderHealth(
  provider: SupportedProvider,
  success: boolean,
  latency: number
): void {
  const health = providerHealth.get(provider);
  if (!health) return;

  const now = new Date();
  
  if (success) {
    health.lastSuccess = now;
    health.successRate = health.successRate * 0.9 + 0.1; // Exponential moving average
    health.avgLatency = health.avgLatency * 0.8 + latency * 0.2;
    health.healthy = true;
  } else {
    health.lastFailure = now;
    health.successRate = health.successRate * 0.9; // Decay on failure
    health.healthy = health.successRate > 0.5;
  }

  providerHealth.set(provider, health);
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD BALANCING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Select optimal provider based on strategy
 */
export function selectProvider(
  taskType: string,
  strategy: LoadBalancerConfig['strategy']
): SupportedProvider {
  const healthyProviders = Array.from(providerHealth.entries())
    .filter(([, h]) => h.healthy)
    .map(([p]) => p);

  if (healthyProviders.length === 0) {
    return 'groq'; // Fallback
  }

  switch (strategy) {
    case 'round-robin':
      // Simple round-robin (would need state tracking for real implementation)
      return healthyProviders[Date.now() % healthyProviders.length];
    
    case 'least-latency':
      return healthyProviders.reduce((best, p) => {
        const current = providerHealth.get(p)!;
        const bestHealth = providerHealth.get(best)!;
        return current.avgLatency < bestHealth.avgLatency ? p : best;
      });
    
    case 'cost-optimized':
      // Prefer free tier providers
      if (healthyProviders.includes('groq')) return 'groq';
      if (healthyProviders.includes('cerebras')) return 'cerebras';
      if (healthyProviders.includes('deepseek')) return 'deepseek';
      return healthyProviders[0];
    
    case 'availability':
      return healthyProviders.reduce((best, p) => {
        const current = providerHealth.get(p)!;
        const bestHealth = providerHealth.get(best)!;
        return current.successRate > bestHealth.successRate ? p : best;
      });
    
    default:
      return healthyProviders[0];
  }
}

/**
 * Get current provider health status
 */
export function getProviderHealthStatus(): Record<SupportedProvider, {
  healthy: boolean;
  successRate: number;
  avgLatency: number;
}> {
  const status: Record<string, any> = {};
  
  for (const [provider, health] of providerHealth.entries()) {
    status[provider] = {
      healthy: health.healthy,
      successRate: Math.round(health.successRate * 100) / 100,
      avgLatency: Math.round(health.avgLatency),
    };
  }

  return status as Record<SupportedProvider, { healthy: boolean; successRate: number; avgLatency: number }>;
}

/**
 * Reset provider health (for testing or recovery)
 */
export function resetProviderHealth(provider?: SupportedProvider): void {
  const reset = (p: SupportedProvider) => {
    providerHealth.set(p, {
      healthy: true,
      lastSuccess: null,
      lastFailure: null,
      successRate: 1.0,
      avgLatency: 500,
    });
  };

  if (provider) {
    reset(provider);
  } else {
    providers.forEach(reset);
  }
}
