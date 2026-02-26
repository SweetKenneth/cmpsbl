/**
 * Adaptive Budget Allocation — Dynamic 4-Hour Cycle
 * 
 * Replaces hardcoded 80% CLM rule. Every 4 hours, NEXUS:
 *   1. Checks remaining daily calls across all providers
 *   2. Estimates substrate operational needs for rest of day
 *   3. Allocates surplus equally to all learning entities
 *   4. Entities rapid-fire learn until allocation exhausted or next cycle
 *
 * Fleet capacity (80% of raw free-tier RPD):
 *   Groq: 640 | Cerebras: 9,216 | SambaNova: 26 | Google AI Studio: 1,200
 *   DeepSeek: 79,999 | Together: 79,999 | OpenRouter×3: 384 
 *   Mistral Studio: 424 | Cohere Trial: 21 | Hyperbolic: 63,999
 *   Total governed RPD: ~235,908
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CycleAllocation {
  cycleId: string;
  cycleStartedAt: string;
  cycleEndsAt: string;
  totalDailyCapacity: number;
  usedToday: number;
  remainingToday: number;
  estimatedSubstrateNeeds: number;
  availableForLearning: number;
  perEntityAllocation: number;
  entityCount: number;
  providers: ProviderHealth[];
}

export interface ProviderHealth {
  provider: string;
  callsBudget: number;
  callsUsed: number;
  failureCount: number;
  failureRate: number;
  avgLatencyMs: number;
  status: 'healthy' | 'degraded' | 'unreliable' | 'new';
  recommendation: string | null;
}

export interface EntityBudget {
  entityId: string;
  allocation: number;
  used: number;
  remaining: number;
  cycleId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TOTAL_DAILY_RPD = 235908; // Fleet total at 80% safety
const CYCLE_HOURS = 4;
const CYCLES_PER_DAY = 24 / CYCLE_HOURS; // 6 cycles

// Entities that receive learning allocations
const LEARNING_ENTITIES = [
  'brain', 'decode', 'dream', 'encode', 'defense',
  'nexus', 'vision', 'cortex', 'integration', 'inclusive',
];

// Substrate operational consumers (always-on, non-learning)
const OPERATIONAL_CONSUMERS = [
  'core', 'system', 'relay', 'audit', 'identity',
  'access', 'economy', 'sandbox', 'memory', 'ripple',
];

const STORAGE_KEY = 'nexus_cycle_allocation';

// ═══════════════════════════════════════════════════════════════════════════════
// CYCLE ALLOCATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Compute the current 4-hour cycle allocation
 * Called by NEXUS every 4 hours to rebalance
 */
export async function computeCycleAllocation(): Promise<CycleAllocation> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentHour = now.getHours();
  const cycleIndex = Math.floor(currentHour / CYCLE_HOURS);
  const cycleStart = new Date(now);
  cycleStart.setHours(cycleIndex * CYCLE_HOURS, 0, 0, 0);
  const cycleEnd = new Date(cycleStart);
  cycleEnd.setHours(cycleEnd.getHours() + CYCLE_HOURS);

  // 1. Get today's usage from ai_daily_quota
  const { data: quotas } = await supabase
    .from('ai_daily_quota')
    .select('provider, calls_budget, calls_used, tokens_used')
    .eq('date', today);

  const totalUsed = (quotas || []).reduce((s, q) => s + (q.calls_used || 0), 0);
  const totalBudget = (quotas || []).reduce((s, q) => s + (q.calls_budget || 0), 0) || TOTAL_DAILY_RPD;
  const remainingToday = Math.max(0, totalBudget - totalUsed);

  // 2. Get provider health from ai_usage_log (last 24h)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data: usageLogs } = await supabase
    .from('ai_usage_log')
    .select('provider, success, response_time_ms')
    .gte('created_at', twentyFourHoursAgo)
    .limit(1000);

  const providerStats: Record<string, { total: number; failures: number; latencies: number[] }> = {};
  for (const log of usageLogs || []) {
    if (!providerStats[log.provider]) providerStats[log.provider] = { total: 0, failures: 0, latencies: [] };
    providerStats[log.provider].total++;
    if (!log.success) providerStats[log.provider].failures++;
    if (log.response_time_ms) providerStats[log.provider].latencies.push(log.response_time_ms);
  }

  // 3. Build provider health report
  const providers: ProviderHealth[] = (quotas || []).map(q => {
    const stats = providerStats[q.provider] || { total: 0, failures: 0, latencies: [] };
    const failureRate = stats.total > 0 ? stats.failures / stats.total : 0;
    const avgLatency = stats.latencies.length > 0
      ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
      : 0;

    let status: ProviderHealth['status'] = 'healthy';
    let recommendation: string | null = null;

    if (stats.total === 0) {
      status = 'new';
      recommendation = 'New provider — monitoring for reliability data';
    } else if (failureRate > 0.3) {
      status = 'unreliable';
      recommendation = `${Math.round(failureRate * 100)}% failure rate — consider removal`;
    } else if (failureRate > 0.1 || avgLatency > 5000) {
      status = 'degraded';
      recommendation = failureRate > 0.1
        ? `Elevated failure rate (${Math.round(failureRate * 100)}%)`
        : `High latency (${avgLatency}ms avg)`;
    } else if (failureRate < 0.02 && stats.total > 50) {
      recommendation = `Excellent reliability (${(100 - failureRate * 100).toFixed(1)}% success, ${avgLatency}ms avg)`;
    }

    return {
      provider: q.provider,
      callsBudget: q.calls_budget || 0,
      callsUsed: q.calls_used || 0,
      failureCount: stats.failures,
      failureRate,
      avgLatencyMs: avgLatency,
      status,
      recommendation,
    };
  });

  // 4. Estimate substrate operational needs for rest of day
  const hoursRemainingInDay = Math.max(1, 24 - currentHour);
  const hoursElapsed = Math.max(1, currentHour || 1);
  
  // Average operational calls per hour (from today's non-learning usage)
  const operationalCallsPerHour = Math.ceil(totalUsed / hoursElapsed * 0.3); // ~30% is operational
  const estimatedSubstrateNeeds = operationalCallsPerHour * hoursRemainingInDay;

  // 5. Calculate available for learning with safety buffer
  const safetyBuffer = Math.ceil(remainingToday * 0.1); // 10% safety
  const availableForLearning = Math.max(0, remainingToday - estimatedSubstrateNeeds - safetyBuffer);
  
  // Divide equally among learning entities
  const perEntity = Math.floor(availableForLearning / LEARNING_ENTITIES.length);

  const cycleId = `cycle_${today}_${cycleIndex}`;

  const allocation: CycleAllocation = {
    cycleId,
    cycleStartedAt: cycleStart.toISOString(),
    cycleEndsAt: cycleEnd.toISOString(),
    totalDailyCapacity: totalBudget,
    usedToday: totalUsed,
    remainingToday,
    estimatedSubstrateNeeds,
    availableForLearning,
    perEntityAllocation: perEntity,
    entityCount: LEARNING_ENTITIES.length,
    providers,
  };

  // Persist allocation
  try {
    const { secureSet } = await import('@/lib/system/secureStorage');
    secureSet(STORAGE_KEY, allocation);
  } catch { /* Quota exceeded — non-critical */ }

  return allocation;
}

/**
 * Get cached allocation or compute fresh
 */
export async function getCurrentAllocation(): Promise<CycleAllocation> {
  try {
    const { secureGet } = await import('@/lib/system/secureStorage');
    const parsed = secureGet<CycleAllocation>(STORAGE_KEY);
    if (parsed) {
      const cycleEnd = new Date(parsed.cycleEndsAt);
      if (new Date() < cycleEnd) return parsed; // Still valid
    }
  } catch { /* Storage unavailable — recompute */ }

  return computeCycleAllocation();
}

/**
 * Check if an entity has budget remaining in current cycle
 */
export async function hasEntityBudget(entityId: string): Promise<boolean> {
  const allocation = await getCurrentAllocation();
  if (!LEARNING_ENTITIES.includes(entityId)) return true; // Operational = always allowed
  return allocation.perEntityAllocation > 0;
}

/**
 * Get all provider health summaries for email reporting
 */
export async function getProviderHealthReport(): Promise<ProviderHealth[]> {
  const allocation = await getCurrentAllocation();
  return allocation.providers;
}

/**
 * Get learning entities list
 */
export function getLearningEntities(): string[] {
  return [...LEARNING_ENTITIES];
}

/**
 * Legacy compat — maps to new dynamic system
 */
export interface ModuleBudget {
  module: string;
  dailyTokenLimit: number;
  tokensUsedToday: number;
  utilizationRate: number;
  valueScore: number;
  adjustedLimit: number;
}

export async function getAdaptiveBudgets(): Promise<ModuleBudget[]> {
  const allocation = await getCurrentAllocation();
  const allModules = [...LEARNING_ENTITIES, ...OPERATIONAL_CONSUMERS];
  
  return allModules.map(module => {
    const isLearning = LEARNING_ENTITIES.includes(module);
    const limit = isLearning ? allocation.perEntityAllocation : Math.ceil(allocation.estimatedSubstrateNeeds / OPERATIONAL_CONSUMERS.length);
    
    return {
      module,
      dailyTokenLimit: limit,
      tokensUsedToday: 0,
      utilizationRate: 0,
      valueScore: isLearning ? 0.8 : 0.5,
      adjustedLimit: limit,
    };
  });
}

export async function hasBudget(module: string): Promise<boolean> {
  return hasEntityBudget(module);
}
