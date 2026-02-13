/**
 * promptfluid® Nexus Module v9.1.0
 * ARCHITECT Epoch — Multi-Provider AI Routing & Health-Weighted Selection
 * 
 * The nervous system for all AI provider interactions:
 * - Health-weighted provider selection across 8 providers
 * - Multi-provider fallback chains with circuit breakers
 * - Real-time performance tracking and cost optimization
 * - Budget governance integration with daily/monthly limits
 */

// Core routing
export {
  routeToBestModel,
  fallbackToLocalMode,
  type ModelExecutor,
} from './router';

// Health-weighted routing
export {
  getProviderHealthMetrics,
  selectOptimalProvider,
  getProviderStats,
  recordProviderPerformance,
  getProviderMatrix,
  type ProviderHealth,
  type RoutingDecision,
  type ProviderMetrics,
} from './healthRouter';

// Core AI interface
export {
  processAIRequest,
  getNexusStatus,
  type AIRequest,
  type AIResponse,
} from './core';

// Caching layer
export {
  getCachedResponse,
  cacheResponse,
  clearCache,
  clearExpiredCache,
  getCacheStats,
} from './cache';

// Learning integration
export {
  learnFromResult,
  getLearningInsights,
} from './learning';

// Metrics & analytics
export {
  recordMetric,
  flushMetrics,
  getMetricsSummary,
  startMetricsCollection,
  clearMetrics,
} from './metrics';

// Cost estimation & budget governance
export * from './costEstimation';

// Budget governance
export {
  canSpend,
  recordSpend,
  updateBudgetConfig,
  getBudgetConfig,
  resetDailySpending,
  type BudgetConfig as NexusBudgetConfig,
  type BudgetStatus as NexusBudgetStatus,
  type BudgetAlert,
} from './budgetGovernance';
export { getBudgetStatus as getNexusBudgetStatus } from './budgetGovernance';

// Batch routing & failover
export {
  processBatch,
  getProviderHealthStatus,
  resetProviderHealth,
  selectProvider,
  type BatchRequest,
  type BatchResult,
  type BatchSummary,
  type FailoverChain,
} from './batchRouting';
 
// Load balancer
export {
  registerProvider,
  unregisterProvider,
  getOptimalProvider,
  acquireSlot,
  releaseSlot,
  getLoadBalancerStatus,
  configureLoadBalancer,
  drainRequests,
  type ProviderLoad,
  type BalancingStrategy,
  type LoadBalancerConfig as NexusLoadBalancerConfig,
} from './loadBalancer';

// Circuit breaker
export * from './circuitBreaker';

// Version info
export const NEXUS_VERSION = '8.0.0';
export const NEXUS_CODENAME = 'SYNERGY+ Router';

// Provider registry
export const SUPPORTED_PROVIDERS = [
  'groq',
  'together', 
  'cerebras',
  'openrouter',
  'stability',
  'fal',
  'google',
  'lovable',
] as const;

export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number];

// Provider capabilities map
export const PROVIDER_CAPABILITIES: Record<SupportedProvider, {
  types: string[];
  freeTier: boolean;
  latency: 'low' | 'medium' | 'high';
  quality: 'standard' | 'high' | 'premium';
}> = {
  groq: { types: ['text', 'reasoning'], freeTier: true, latency: 'low', quality: 'high' },
  together: { types: ['text', 'research'], freeTier: true, latency: 'medium', quality: 'high' },
  cerebras: { types: ['text', 'refinement'], freeTier: true, latency: 'low', quality: 'high' },
  openrouter: { types: ['text', 'research'], freeTier: false, latency: 'medium', quality: 'premium' },
  stability: { types: ['image'], freeTier: false, latency: 'medium', quality: 'premium' },
  fal: { types: ['image', 'video'], freeTier: false, latency: 'medium', quality: 'high' },
  google: { types: ['text', 'image', 'multimodal'], freeTier: true, latency: 'medium', quality: 'premium' },
  lovable: { types: ['text', 'reasoning', 'code'], freeTier: true, latency: 'low', quality: 'premium' },
};

/**
 * Quick provider selection helper
 */
export function getQuickProvider(taskType: 'text' | 'image' | 'code' | 'research'): SupportedProvider {
  switch (taskType) {
    case 'text':
    case 'code':
      return 'groq';
    case 'research':
      return 'together';
    case 'image':
      return 'fal';
    default:
      return 'groq';
  }
}

/**
 * Check if provider supports a capability
 */
export function providerSupports(provider: SupportedProvider, capability: string): boolean {
  return PROVIDER_CAPABILITIES[provider]?.types.includes(capability) ?? false;
}

/**
 * Get all free-tier providers
 */
export function getFreeTierProviders(): SupportedProvider[] {
  return SUPPORTED_PROVIDERS.filter(p => PROVIDER_CAPABILITIES[p].freeTier);
}
