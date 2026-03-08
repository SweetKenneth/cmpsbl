/**
 * NEXUS Load Balancer
 * Intelligent request distribution across 13 AI providers
 */
 
 // Provider load state
 export interface ProviderLoad {
   providerId: string;
   activeRequests: number;
   queuedRequests: number;
   avgResponseTime: number;
   errorRate: number;
   lastHealthCheck: string;
   weight: number;
   maxConcurrency: number;
 }
 
 // Load balancing strategy
 export type BalancingStrategy = 
   | 'round_robin'
   | 'weighted_round_robin'
   | 'least_connections'
   | 'response_time'
   | 'adaptive';
 
 // Request queue entry
 interface QueuedRequest {
   id: string;
   priority: number;
   timestamp: number;
   taskType: string;
   resolver: (providerId: string) => void;
   rejecter: (error: Error) => void;
 }
 
 // Load balancer configuration
 export interface LoadBalancerConfig {
   strategy: BalancingStrategy;
   maxQueueSize: number;
   maxWaitMs: number;
   healthCheckIntervalMs: number;
   adaptiveWindowMs: number;
 }
 
 // Provider state tracking
  const MAX_PROVIDER_LOADS = 100;
  const providerLoads = new Map<string, ProviderLoad>();
  const requestQueue: QueuedRequest[] = [];
 let roundRobinIndex = 0;
 
 // Default configuration
 let config: LoadBalancerConfig = {
   strategy: 'adaptive',
   maxQueueSize: 100,
   maxWaitMs: 30000,
   healthCheckIntervalMs: 10000,
   adaptiveWindowMs: 60000,
 };
 
 /**
  * Register a provider with the load balancer
  */
 export function registerProvider(
   providerId: string,
   options?: {
     weight?: number;
     maxConcurrency?: number;
   }
 ): void {
   providerLoads.set(providerId, {
     providerId,
     activeRequests: 0,
     queuedRequests: 0,
     avgResponseTime: 100,
     errorRate: 0,
     lastHealthCheck: new Date().toISOString(),
     weight: options?.weight ?? 1,
     maxConcurrency: options?.maxConcurrency ?? 10,
   });
 }
 
 /**
  * Unregister a provider
  */
 export function unregisterProvider(providerId: string): boolean {
   return providerLoads.delete(providerId);
 }
 
 /**
  * Get optimal provider based on current strategy
  */
 export function getOptimalProvider(
   taskType?: string,
   preferredProviders?: string[]
 ): string | null {
   const available = getAvailableProviders(preferredProviders);
   if (available.length === 0) return null;
   
   switch (config.strategy) {
     case 'round_robin':
       return selectRoundRobin(available);
     case 'weighted_round_robin':
       return selectWeightedRoundRobin(available);
     case 'least_connections':
       return selectLeastConnections(available);
     case 'response_time':
       return selectByResponseTime(available);
     case 'adaptive':
     default:
       return selectAdaptive(available, taskType);
   }
 }
 
 /**
  * Get available providers (not overloaded)
  */
 function getAvailableProviders(preferred?: string[]): ProviderLoad[] {
   const all = Array.from(providerLoads.values())
     .filter(p => p.activeRequests < p.maxConcurrency)
     .filter(p => p.errorRate < 0.5);
   
   if (preferred?.length) {
     const preferredLoads = all.filter(p => preferred.includes(p.providerId));
     if (preferredLoads.length > 0) return preferredLoads;
   }
   
   return all;
 }
 
 function selectRoundRobin(providers: ProviderLoad[]): string {
   roundRobinIndex = (roundRobinIndex + 1) % providers.length;
   return providers[roundRobinIndex].providerId;
 }
 
 function selectWeightedRoundRobin(providers: ProviderLoad[]): string {
   const totalWeight = providers.reduce((sum, p) => sum + p.weight, 0);
   let random = Math.random() * totalWeight;
   
   for (const provider of providers) {
     random -= provider.weight;
     if (random <= 0) return provider.providerId;
   }
   
   return providers[0].providerId;
 }
 
 function selectLeastConnections(providers: ProviderLoad[]): string {
   return providers.reduce((min, p) => 
     p.activeRequests < min.activeRequests ? p : min
   ).providerId;
 }
 
 function selectByResponseTime(providers: ProviderLoad[]): string {
   return providers.reduce((fastest, p) => 
     p.avgResponseTime < fastest.avgResponseTime ? p : fastest
   ).providerId;
 }
 
  function selectAdaptive(providers: ProviderLoad[], taskType?: string): string {
   // Score each provider based on multiple factors
   const scored = providers.map(p => {
     const loadScore = 1 - (p.activeRequests / Math.max(p.maxConcurrency, 1));
     const latencyScore = 100 / Math.max(p.avgResponseTime, 1); // Avoid division by zero
     const reliabilityScore = 1 - p.errorRate;
     
     const total = (loadScore * 0.3) + (latencyScore * 0.3) + (reliabilityScore * 0.4);
     
     return { provider: p, score: total * p.weight };
   });
   
   scored.sort((a, b) => b.score - a.score);
   return scored[0].provider.providerId;
 }
 
 /**
  * Acquire a slot for a request
  */
 export async function acquireSlot(
   taskType: string,
   options?: {
     priority?: number;
     timeoutMs?: number;
     preferredProviders?: string[];
   }
 ): Promise<{ providerId: string; slotId: string }> {
   const provider = getOptimalProvider(taskType, options?.preferredProviders);
   
   if (provider) {
     const load = providerLoads.get(provider)!;
     load.activeRequests++;
     return { providerId: provider, slotId: `slot_${Date.now()}_${provider}` };
   }
   
   // Queue the request if all providers are busy
   if (requestQueue.length >= config.maxQueueSize) {
     throw new Error('Request queue is full');
   }
   
  return new Promise((resolve, reject) => {
    const requestId = `req_${Date.now()}`;

    const timeout = setTimeout(() => {
      const idx = requestQueue.findIndex(r => r.id === requestId);
      if (idx !== -1) requestQueue.splice(idx, 1);
      reject(new Error('Request timed out waiting for available provider'));
    }, options?.timeoutMs ?? config.maxWaitMs);
    
    requestQueue.push({
      id: requestId,
      priority: options?.priority ?? 0,
      timestamp: Date.now(),
      taskType,
      resolver: (providerId) => {
        clearTimeout(timeout);
        resolve({ providerId, slotId: `slot_${Date.now()}_${providerId}` });
      },
      rejecter: (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    });
    
    // Sort by priority
    requestQueue.sort((a, b) => b.priority - a.priority);
  });
 }
 
 /**
  * Release a slot after request completion
  */
 export function releaseSlot(
   providerId: string,
   metrics: {
     responseTimeMs: number;
     success: boolean;
   }
 ): void {
   const load = providerLoads.get(providerId);
   if (!load) return;
   
   load.activeRequests = Math.max(0, load.activeRequests - 1);
   
   // Update running averages
   load.avgResponseTime = (load.avgResponseTime * 0.9) + (metrics.responseTimeMs * 0.1);
   load.errorRate = (load.errorRate * 0.95) + (metrics.success ? 0 : 0.05);
   
   // Process queued requests
   if (requestQueue.length > 0 && load.activeRequests < load.maxConcurrency) {
     const next = requestQueue.shift();
     if (next) {
       load.activeRequests++;
       next.resolver(providerId);
     }
   }
 }
 
 /**
  * Get load balancer status
  */
 export function getLoadBalancerStatus(): {
   strategy: BalancingStrategy;
   providers: ProviderLoad[];
   queueLength: number;
   totalActiveRequests: number;
 } {
   const providers = Array.from(providerLoads.values());
   return {
     strategy: config.strategy,
     providers,
     queueLength: requestQueue.length,
     totalActiveRequests: providers.reduce((sum, p) => sum + p.activeRequests, 0),
   };
 }
 
 /**
  * Update load balancer configuration
  */
 export function configureLoadBalancer(updates: Partial<LoadBalancerConfig>): LoadBalancerConfig {
   config = { ...config, ...updates };
   return config;
 }
 
 /**
  * Drain all pending requests (graceful shutdown)
  */
 export async function drainRequests(): Promise<{ drained: number; failed: number }> {
   const toReject = [...requestQueue];
   requestQueue.length = 0;
   
   toReject.forEach(req => {
     req.rejecter(new Error('Load balancer is draining'));
   });
   
   return { drained: toReject.length, failed: toReject.length };
 }