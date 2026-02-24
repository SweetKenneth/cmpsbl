/**
 * NEXUS Module Enhancements — SPARTA Epoch
 * BudgetGovernance, LoadBalancer, RequestQueue, CostArbitrage
 */

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET GOVERNANCE — Token limits with emergency kill switch
// ═══════════════════════════════════════════════════════════════════════════════

interface BudgetAllocation {
  module: string;
  dailyLimit: number;
  used: number;
  reserved: number;
  priority: number;
}

interface BudgetState {
  totalDaily: number;
  totalUsed: number;
  allocations: Map<string, BudgetAllocation>;
  killSwitchActive: boolean;
  emergencyReserve: number;
}

export class BudgetGovernance {
  private state: BudgetState = {
    totalDaily: 1000000, // 1M tokens default
    totalUsed: 0,
    allocations: new Map(),
    killSwitchActive: false,
    emergencyReserve: 50000, // 50K emergency reserve
  };

  /** Allocate budget to a module */
  allocate(module: string, dailyLimit: number, priority: number = 1): BudgetAllocation {
    const allocation: BudgetAllocation = {
      module,
      dailyLimit,
      used: 0,
      reserved: 0,
      priority,
    };
    this.state.allocations.set(module, allocation);
    return allocation;
  }

  /** Request tokens from budget */
  request(module: string, tokens: number): { approved: boolean; reason?: string } {
    if (this.state.killSwitchActive) {
      return { approved: false, reason: 'Kill switch active' };
    }

    const allocation = this.state.allocations.get(module);
    if (!allocation) {
      return { approved: false, reason: 'Module not allocated' };
    }

    const remaining = allocation.dailyLimit - allocation.used;
    if (tokens > remaining) {
      return { approved: false, reason: `Exceeds limit: ${remaining} remaining` };
    }

    const globalRemaining = this.state.totalDaily - this.state.totalUsed - this.state.emergencyReserve;
    if (tokens > globalRemaining) {
      return { approved: false, reason: 'Global budget exhausted' };
    }

    allocation.used += tokens;
    this.state.totalUsed += tokens;
    return { approved: true };
  }

  /** Activate emergency kill switch */
  activateKillSwitch(reason: string): void {
    this.state.killSwitchActive = true;
    console.warn(`[NEXUS] Kill switch activated: ${reason}`);
  }

  /** Deactivate kill switch */
  deactivateKillSwitch(): void {
    this.state.killSwitchActive = false;
  }

  /** Get budget status */
  getStatus(): { utilization: number; remaining: number; isHealthy: boolean } {
    const utilization = this.state.totalUsed / this.state.totalDaily;
    return {
      utilization,
      remaining: this.state.totalDaily - this.state.totalUsed,
      isHealthy: utilization < 0.8 && !this.state.killSwitchActive,
    };
  }

  /** Reset daily budgets */
  resetDaily(): void {
    this.state.totalUsed = 0;
    for (const allocation of this.state.allocations.values()) {
      allocation.used = 0;
      allocation.reserved = 0;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOAD BALANCER — Provider health-aware routing
// ═══════════════════════════════════════════════════════════════════════════════

interface ProviderHealth {
  provider: string;
  latency: number;      // ms average
  errorRate: number;    // 0-1
  available: boolean;
  weight: number;       // Routing weight
  lastCheck: number;
}

interface RoutingDecision {
  provider: string;
  confidence: number;
  fallbacks: string[];
}

export class LoadBalancer {
  private providers: Map<string, ProviderHealth> = new Map();
  private requestCounts: Map<string, number> = new Map();

  /** Register a provider */
  registerProvider(provider: string, initialWeight: number = 1.0): void {
    this.providers.set(provider, {
      provider,
      latency: 0,
      errorRate: 0,
      available: true,
      weight: initialWeight,
      lastCheck: Date.now(),
    });
    this.requestCounts.set(provider, 0);
  }

  /** Update provider health metrics */
  updateHealth(provider: string, latency: number, success: boolean): void {
    const health = this.providers.get(provider);
    if (!health) return;

    // Exponential moving average for latency
    health.latency = health.latency * 0.7 + latency * 0.3;
    
    // Update error rate
    const currentCount = this.requestCounts.get(provider) || 0;
    if (!success) {
      health.errorRate = Math.min(1, health.errorRate + 0.1);
    } else {
      health.errorRate = Math.max(0, health.errorRate - 0.02);
    }

    // Auto-disable if too many errors
    health.available = health.errorRate < 0.5;
    health.lastCheck = Date.now();

    this.requestCounts.set(provider, currentCount + 1);
  }

  /** Get routing decision based on current health */
  route(preferredProvider?: string): RoutingDecision {
    const available = Array.from(this.providers.values())
      .filter(p => p.available)
      .sort((a, b) => {
        // Score: lower latency + lower error rate + higher weight = better
        const scoreA = (1000 - a.latency) * (1 - a.errorRate) * a.weight;
        const scoreB = (1000 - b.latency) * (1 - b.errorRate) * b.weight;
        return scoreB - scoreA;
      });

    if (available.length === 0) {
      return { provider: 'fallback', confidence: 0, fallbacks: [] };
    }

    // Prefer requested provider if healthy
    if (preferredProvider) {
      const preferred = this.providers.get(preferredProvider);
      if (preferred?.available && preferred.errorRate < 0.2) {
        return {
          provider: preferredProvider,
          confidence: 1 - preferred.errorRate,
          fallbacks: available.filter(p => p.provider !== preferredProvider).map(p => p.provider),
        };
      }
    }

    const best = available[0];
    return {
      provider: best.provider,
      confidence: 1 - best.errorRate,
      fallbacks: available.slice(1).map(p => p.provider),
    };
  }

  /** Get all provider statuses */
  getProviderStatuses(): ProviderHealth[] {
    return Array.from(this.providers.values());
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST QUEUE — Priority-based request management with TTL
// ═══════════════════════════════════════════════════════════════════════════════

interface QueuedRequest {
  id: string;
  priority: number;     // Higher = more urgent
  payload: unknown;
  createdAt: number;
  ttl: number;          // ms until expiry
  retries: number;
  maxRetries: number;
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  expired: number;
  avgWaitTime: number;
}

export class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing: Set<string> = new Set();
  private completed: number = 0;
  private expired: number = 0;
  private waitTimes: number[] = [];

  /** Enqueue a request */
  enqueue(payload: unknown, priority: number = 1, ttl: number = 30000): string {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request: QueuedRequest = {
      id,
      priority,
      payload,
      createdAt: Date.now(),
      ttl,
      retries: 0,
      maxRetries: 3,
    };

    // Insert in priority order
    const insertIdx = this.queue.findIndex(r => r.priority < priority);
    if (insertIdx === -1) {
      this.queue.push(request);
    } else {
      this.queue.splice(insertIdx, 0, request);
    }

    return id;
  }

  /** Dequeue highest priority request */
  dequeue(): QueuedRequest | null {
    this.pruneExpired();
    
    const request = this.queue.shift();
    if (!request) return null;

    this.processing.add(request.id);
    const waitTime = Date.now() - request.createdAt;
    this.waitTimes.push(waitTime);
    if (this.waitTimes.length > 100) this.waitTimes.shift();

    return request;
  }

  /** Mark request as complete */
  complete(id: string): void {
    this.processing.delete(id);
    this.completed++;
  }

  /** Retry a failed request */
  retry(id: string): boolean {
    const request = this.queue.find(r => r.id === id);
    if (!request) return false;

    if (request.retries >= request.maxRetries) {
      return false;
    }

    request.retries++;
    request.priority += 1; // Boost priority on retry
    return true;
  }

  /** Get queue statistics */
  getStats(): QueueStats {
    this.pruneExpired();
    return {
      pending: this.queue.length,
      processing: this.processing.size,
      completed: this.completed,
      expired: this.expired,
      avgWaitTime: this.waitTimes.length > 0
        ? this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length
        : 0,
    };
  }

  private pruneExpired(): void {
    const now = Date.now();
    const originalLength = this.queue.length;
    this.queue = this.queue.filter(r => now - r.createdAt < r.ttl);
    this.expired += originalLength - this.queue.length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COST ARBITRAGE — Provider cost optimization
// ═══════════════════════════════════════════════════════════════════════════════

interface ProviderPricing {
  provider: string;
  inputCostPer1K: number;
  outputCostPer1K: number;
  qualityScore: number;  // 0-1
  speedScore: number;    // 0-1
}

interface ArbitrageResult {
  selectedProvider: string;
  estimatedCost: number;
  savings: number;
  reason: string;
}

export class CostArbitrage {
  private pricing: Map<string, ProviderPricing> = new Map();
  private historicalCosts: Map<string, number[]> = new Map();

  /** Register provider pricing */
  registerPricing(pricing: ProviderPricing): void {
    this.pricing.set(pricing.provider, pricing);
    this.historicalCosts.set(pricing.provider, []);
  }

  /** Find optimal provider for request */
  arbitrage(
    estimatedInputTokens: number,
    estimatedOutputTokens: number,
    qualityRequired: number = 0.7,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): ArbitrageResult {
    const candidates = Array.from(this.pricing.values())
      .filter(p => p.qualityScore >= qualityRequired)
      .filter(p => urgency !== 'high' || p.speedScore >= 0.7);

    if (candidates.length === 0) {
      const fallback = Array.from(this.pricing.values())[0];
      return {
        selectedProvider: fallback?.provider || 'default',
        estimatedCost: 0,
        savings: 0,
        reason: 'No qualifying providers',
      };
    }

    // Calculate costs
    const costs = candidates.map(p => ({
      provider: p.provider,
      cost: (estimatedInputTokens / 1000 * p.inputCostPer1K) +
            (estimatedOutputTokens / 1000 * p.outputCostPer1K),
      quality: p.qualityScore,
      speed: p.speedScore,
    }));

    // Sort by cost (with quality tie-breaker)
    costs.sort((a, b) => a.cost - b.cost || b.quality - a.quality);

    const selected = costs[0];
    const mostExpensive = costs[costs.length - 1];

    return {
      selectedProvider: selected.provider,
      estimatedCost: selected.cost,
      savings: mostExpensive.cost - selected.cost,
      reason: `${((1 - selected.cost / mostExpensive.cost) * 100).toFixed(1)}% cost reduction`,
    };
  }

  /** Record actual cost for learning */
  recordCost(provider: string, actualCost: number): void {
    const history = this.historicalCosts.get(provider) || [];
    history.push(actualCost);
    if (history.length > 100) history.shift();
    this.historicalCosts.set(provider, history);
  }

  /** Get cost trends */
  getCostTrends(): Map<string, { avg: number; trend: 'up' | 'down' | 'stable' }> {
    const trends = new Map<string, { avg: number; trend: 'up' | 'down' | 'stable' }>();
    
    for (const [provider, history] of this.historicalCosts.entries()) {
      if (history.length < 2) {
        trends.set(provider, { avg: history[0] || 0, trend: 'stable' });
        continue;
      }

      const avg = history.reduce((a, b) => a + b, 0) / history.length;
      const recentAvg = history.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, history.length);
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > avg * 1.1) trend = 'up';
      else if (recentAvg < avg * 0.9) trend = 'down';

      trends.set(provider, { avg, trend });
    }

    return trends;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const nexusEnhancements = {
  BudgetGovernance,
  LoadBalancer,
  RequestQueue,
  CostArbitrage,
};

export type {
  BudgetAllocation,
  BudgetState,
  ProviderHealth,
  RoutingDecision,
  QueuedRequest,
  QueueStats,
  ProviderPricing,
  ArbitrageResult,
};
