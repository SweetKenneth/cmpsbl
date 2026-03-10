/**
 * CMPSBL® Nexus Module
 * Free-Tier Multi-Provider AI Routing & Fleet Governance
 * 
 * The nervous system for all AI provider interactions:
 * - Fleet-managed routing across 13 free-tier providers
 * - Health-weighted selection with exponential decay scoring
 * - RPM/RPD governance at 80% safety margin
 * - Task-type → model affinity mapping
 * - Real-time fleet introspection and cost tracking
 * - Zero paid AI dependencies
 */

// Core routing (v5.0.0 fleet-managed)
export {
  routeToBestModel,
  fallbackToLocalMode,
  recordProviderOutcome,
  getFleetStatus,
  getEncodeProvider,
  FLEET_REGISTRY,
  type ModelExecutor,
  type FleetProvider,
  type TaskType,
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

// Version info — wired to central store
import { SUBSTRATE_VERSION as _NV, SUBSTRATE_EPOCH as _NE } from '@/lib/substrate/versions';
export const NEXUS_VERSION = _NV;
export const NEXUS_CODENAME = `${_NE} Fleet Intelligence Engine`;
export const NEXUS_ROUTER_VERSION = '3.0.0';

// Provider registry — free-tier only, zero paid dependencies
export const SUPPORTED_PROVIDERS = [
  'groq',
  'cerebras',
  'sambanova',
  'google',
  'deepseek',
  'together',
  'openrouter',
  'mistral',
  'cohere',
  'hyperbolic',
  'stability',
  'fal',
  'anthropic',
] as const;

export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number];

// Provider capabilities map
export const PROVIDER_CAPABILITIES: Record<SupportedProvider, {
  types: string[];
  freeTier: boolean;
  latency: 'low' | 'medium' | 'high';
  quality: 'standard' | 'high' | 'premium';
}> = {
  groq: { types: ['text', 'reasoning', 'code'], freeTier: true, latency: 'low', quality: 'high' },
  cerebras: { types: ['text', 'refinement', 'code'], freeTier: true, latency: 'low', quality: 'high' },
  sambanova: { types: ['text', 'reasoning'], freeTier: true, latency: 'low', quality: 'high' },
  google: { types: ['text', 'image', 'multimodal', 'code'], freeTier: true, latency: 'medium', quality: 'premium' },
  deepseek: { types: ['text', 'reasoning', 'code'], freeTier: true, latency: 'medium', quality: 'high' },
  together: { types: ['text', 'research'], freeTier: true, latency: 'medium', quality: 'high' },
  openrouter: { types: ['text', 'research', 'reasoning'], freeTier: true, latency: 'medium', quality: 'high' },
  mistral: { types: ['text', 'reasoning', 'code'], freeTier: true, latency: 'medium', quality: 'high' },
  cohere: { types: ['text', 'research', 'generation'], freeTier: true, latency: 'medium', quality: 'high' },
  hyperbolic: { types: ['text', 'reasoning'], freeTier: true, latency: 'medium', quality: 'high' },
  stability: { types: ['image'], freeTier: false, latency: 'medium', quality: 'premium' },
  fal: { types: ['image', 'video'], freeTier: false, latency: 'medium', quality: 'high' },
  anthropic: { types: ['text', 'analysis', 'pricing', 'research'], freeTier: false, latency: 'fast', quality: 'premium' },
};

/**
 * Quick provider selection helper — routes to best free-tier provider
 */
export function getQuickProvider(taskType: 'text' | 'image' | 'code' | 'research'): SupportedProvider {
  switch (taskType) {
    case 'text':
      return 'groq';
    case 'code':
      return 'groq'; // Best for code: ultra-fast Llama 3.3 70B
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
