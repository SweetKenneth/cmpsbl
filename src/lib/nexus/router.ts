/**
 * CMPSBL® NEXUS Router
 * Production-grade multi-provider AI routing
 * 
 * Fleet-managed routing across 13 free-tier providers with:
 * - Health-weighted selection with exponential decay
 * - Grok via OpenRouter free tier
 * - Fleet-level RPM/RPD governance at 80% safety margin
 * - Task-type → model affinity mapping
 * - Automatic provider rotation on quota exhaustion
 * - Circuit breaker integration for provider isolation
 */

import type { AIRequest } from './core';
import { isProviderAvailable, recordSuccess, recordFailure } from './circuitBreaker';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ModelExecutor {
  model: string;
  provider: string;
  execute: (prompt: string, context?: Record<string, any>) => Promise<{
    success: boolean;
    content: string;
    confidence?: number;
    metadata?: Record<string, any>;
  }>;
}

export interface FleetProvider {
  id: string;
  model: string;
  rpm: number;       // Requests per minute (80% of official)
  rpd: number;       // Requests per day (80% of official)
  tpm: number;       // Tokens per minute
  latencyClass: 'ultra' | 'fast' | 'standard';
  affinities: TaskType[];
  priority: number;   // Lower = higher priority
  costPerMToken: number; // millicents per million tokens (0 = free)
}

export type TaskType = 'reasoning' | 'research' | 'refinement' | 'generation' | 'code' | 'analysis';

// ═══════════════════════════════════════════════════════════════════════════════
// FLEET REGISTRY — All free-tier providers at 80% safety margin
// ═══════════════════════════════════════════════════════════════════════════════

export const FLEET_REGISTRY: FleetProvider[] = [
  {
    id: 'groq-versatile',
    model: 'groq/llama-3.3-70b-versatile',
    rpm: 24, rpd: 800, tpm: 12000,
    latencyClass: 'ultra',
    affinities: ['reasoning', 'code', 'generation'],
    priority: 1,
    costPerMToken: 0,
  },
  {
    id: 'groq-instant',
    model: 'groq/llama-3.1-8b-instant',
    rpm: 24, rpd: 11520, tpm: 16000,
    latencyClass: 'ultra',
    affinities: ['generation', 'analysis', 'refinement'],
    priority: 2,
    costPerMToken: 0,
  },
  {
    id: 'cerebras',
    model: 'cerebras/llama-3.3-70b',
    rpm: 24, rpd: 11520, tpm: 14000,
    latencyClass: 'ultra',
    affinities: ['refinement', 'code', 'reasoning'],
    priority: 3,
    costPerMToken: 0,
  },
  {
    id: 'sambanova',
    model: 'sambanova/Meta-Llama-3.3-70B-Instruct',
    rpm: 32, rpd: 32, tpm: 10000,
    latencyClass: 'fast',
    affinities: ['reasoning', 'research'],
    priority: 4,
    costPerMToken: 0,
  },
  {
    id: 'google-aistudio',
    model: 'google/gemini-2.0-flash',
    rpm: 15, rpd: 1500, tpm: 30000,
    latencyClass: 'fast',
    affinities: ['research', 'analysis', 'reasoning', 'code'],
    priority: 5,
    costPerMToken: 0,
  },
  {
    id: 'deepseek',
    model: 'deepseek/deepseek-chat',
    rpm: 16, rpd: 99999, tpm: 20000,
    latencyClass: 'standard',
    affinities: ['code', 'reasoning', 'research'],
    priority: 6,
    costPerMToken: 0,
  },
  {
    id: 'together',
    model: 'together/llama-3.3-70b-turbo',
    rpm: 480, rpd: 99999, tpm: 50000,
    latencyClass: 'standard',
    affinities: ['research', 'generation', 'analysis'],
    priority: 7,
    costPerMToken: 0,
  },
  {
    id: 'openrouter-free',
    model: 'openrouter/llama-3.3-70b-instruct:free',
    rpm: 16, rpd: 160, tpm: 20000,
    latencyClass: 'standard',
    affinities: ['reasoning', 'generation', 'research'],
    priority: 8,
    costPerMToken: 0,
  },
  {
    id: 'openrouter-qwen',
    model: 'openrouter/qwen3-235b-a22b:free',
    rpm: 16, rpd: 160, tpm: 20000,
    latencyClass: 'standard',
    affinities: ['reasoning', 'code', 'analysis'],
    priority: 9,
    costPerMToken: 0,
  },
  {
    id: 'openrouter-deepseek-r1',
    model: 'openrouter/deepseek-r1:free',
    rpm: 16, rpd: 160, tpm: 20000,
    latencyClass: 'standard',
    affinities: ['reasoning', 'research', 'code'],
    priority: 10,
    costPerMToken: 0,
  {
    id: 'openrouter-grok',
    model: 'openrouter/grok-3-mini-beta:free',
    rpm: 16, rpd: 160, tpm: 15000,
    latencyClass: 'standard',
    affinities: ['reasoning', 'generation', 'research'],
    priority: 11,
    costPerMToken: 0,
  },
  {
    id: 'mistral',
    model: 'mistral/mistral-small-latest',
    rpm: 24, rpd: 424, tpm: 25000,
    latencyClass: 'fast',
    affinities: ['reasoning', 'code', 'refinement'],
    priority: 12,
    costPerMToken: 0,
  },
  {
    id: 'cohere',
    model: 'cohere/command-r-plus',
    rpm: 10, rpd: 21, tpm: 10000,
    latencyClass: 'standard',
    affinities: ['research', 'generation', 'analysis'],
    priority: 13,
    costPerMToken: 0,
  },
  {
    id: 'hyperbolic',
    model: 'hyperbolic/llama-3.1-70b',
    rpm: 38, rpd: 63999, tpm: 15000,
    latencyClass: 'standard',
    affinities: ['generation', 'reasoning'],
    priority: 14,
    costPerMToken: 0,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// USAGE TRACKING — Per-provider RPM/RPD counters (bounded)
// ═══════════════════════════════════════════════════════════════════════════════

interface UsageWindow {
  minuteCalls: number;
  minuteReset: number;
  dayCalls: number;
  dayReset: number;
}

const MAX_TRACKED_PROVIDERS = 100;
const usageWindows = new Map<string, UsageWindow>();

function getUsageWindow(providerId: string): UsageWindow {
  const now = Date.now();
  let w = usageWindows.get(providerId);
  if (!w) {
    // Bound map size
    if (usageWindows.size >= MAX_TRACKED_PROVIDERS) {
      const oldest = usageWindows.keys().next().value;
      if (oldest) usageWindows.delete(oldest);
    }
    w = { minuteCalls: 0, minuteReset: now + 60000, dayCalls: 0, dayReset: now + 86400000 };
    usageWindows.set(providerId, w);
    return w;
  }
  // Reset windows if expired
  if (now >= w.minuteReset) {
    w.minuteCalls = 0;
    w.minuteReset = now + 60000;
  }
  if (now >= w.dayReset) {
    w.dayCalls = 0;
    w.dayReset = now + 86400000;
  }
  return w;
}

function canUseProvider(provider: FleetProvider): boolean {
  const w = getUsageWindow(provider.id);
  return w.minuteCalls < provider.rpm && w.dayCalls < provider.rpd;
}

function recordUsage(providerId: string): void {
  const w = getUsageWindow(providerId);
  w.minuteCalls++;
  w.dayCalls++;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH SCORING — Exponential decay with recency weighting (bounded)
// ═══════════════════════════════════════════════════════════════════════════════

interface ProviderHealthState {
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  lastFailureAt: number;
  score: number; // 0-100
}

const MAX_HEALTH_STATES = 100;
const healthStates = new Map<string, ProviderHealthState>();

function getHealthState(providerId: string): ProviderHealthState {
  if (!healthStates.has(providerId)) {
    // Bound map size
    if (healthStates.size >= MAX_HEALTH_STATES) {
      const oldest = healthStates.keys().next().value;
      if (oldest) healthStates.delete(oldest);
    }
    healthStates.set(providerId, {
      successCount: 0,
      failureCount: 0,
      avgLatencyMs: 100,
      lastFailureAt: 0,
      score: 100,
    });
  }
  return healthStates.get(providerId)!;
}

export function recordProviderOutcome(providerId: string, success: boolean, latencyMs: number): void {
  const h = getHealthState(providerId);
  if (success) {
    h.successCount++;
    h.avgLatencyMs = h.avgLatencyMs * 0.85 + latencyMs * 0.15;
    // Recover score on success
    h.score = Math.min(100, h.score * 0.9 + 10);
  } else {
    h.failureCount++;
    h.lastFailureAt = Date.now();
    // Penalize score on failure (exponential decay)
    h.score = Math.max(0, h.score * 0.6);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTING LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Route request to the best available AI model based on:
 * 1. Task-type affinity
 * 2. Health score
 * 3. Rate limit availability
 * 4. Priority ordering
 */
export async function routeToBestModel(request: AIRequest): Promise<ModelExecutor> {
  const taskType = mapRequestType(request.type);
  const priority = request.priority || 'medium';

  // Score all providers — filter by rate limits, health, AND circuit breaker
  const scored = FLEET_REGISTRY
    .filter(p => canUseProvider(p))
    .filter(p => getHealthState(p.id).score > 10)
    .filter(p => isProviderAvailable(p.id))
    .map(p => {
      const health = getHealthState(p.id);
      let score = health.score;

      // Affinity bonus (+30 if task matches provider strength)
      if (p.affinities.includes(taskType)) score += 30;

      // Latency bonus for high-priority requests
      if (priority === 'high' && p.latencyClass === 'ultra') score += 20;
      if (priority === 'high' && p.latencyClass === 'fast') score += 10;

      // Priority weight — clamped so high-numbered providers don't go negative
      score += Math.max(0, (15 - p.priority)) * 3;

      // Recency penalty (if failed in last 30s, reduce by 20)
      if (health.lastFailureAt > Date.now() - 30000) score -= 20;

      return { provider: p, score };
    })
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // All providers exhausted — fallback to local mode
    return getLocalFallbackExecutor();
  }

  const best = scored[0].provider;
  return createExecutor(best);
}

function mapRequestType(type?: string): TaskType {
  switch (type) {
    case 'research': return 'research';
    case 'reasoning': return 'reasoning';
    case 'refinement': return 'refinement';
    case 'generation': return 'generation';
    default: return 'reasoning';
  }
}

function createExecutor(provider: FleetProvider): ModelExecutor {
  return {
    model: provider.model,
    provider: provider.id,
    execute: async (prompt: string, context?: Record<string, any>) => {
      recordUsage(provider.id);
      const start = Date.now();

      try {
        // Call pf-nexus-router edge function for real AI completion
        const { supabase: client } = await import('@/integrations/supabase/client');
        const { data, error } = await client.functions.invoke('pf-nexus-router', {
          body: {
            prompt,
            context,
            provider: provider.id,
            model: provider.model,
            maxTokens: 1500,
            temperature: 0.7,
            metadata: {
              routeKey: 'nexus-fleet',
              providerId: provider.id,
              latencyClass: provider.latencyClass,
            },
          },
        });

        if (error) throw error;

        const content = data?.content || data?.response || '';
        const latencyMs = Date.now() - start;

        recordProviderOutcome(provider.id, true, latencyMs);
        recordSuccess(provider.id);

        // Track usage in ai_usage_log
        try {
          await client.from('ai_usage_log').insert({
            provider: provider.id,
            model: provider.model,
            category: context?.routeKey || 'nexus_fleet',
            response_time_ms: latencyMs,
            success: true,
            tokens_used: content.length / 4, // rough estimate
            cost: 0, // free tier
            metadata: {
              latency_class: provider.latencyClass,
              prompt_length: prompt.length,
              response_length: content.length,
            },
          });
        } catch {
          // Non-critical — don't block on usage logging
        }

        return {
          success: true,
          content,
          confidence: content.length > 500 ? 0.9 : content.length > 100 ? 0.7 : 0.5,
          metadata: {
            source: provider.id,
            model: provider.model,
            latencyClass: provider.latencyClass,
            latencyMs,
          },
        };
      } catch (error) {
        const latencyMs = Date.now() - start;
        recordProviderOutcome(provider.id, false, latencyMs);
        recordFailure(provider.id);

        // Track failed usage
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.from('ai_usage_log').insert({
            provider: provider.id,
            model: provider.model,
            category: 'nexus_fleet',
            response_time_ms: latencyMs,
            success: false,
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown',
            },
          });
        } catch {
          // Non-critical
        }

        throw error;
      }
    },
  };
}

function getLocalFallbackExecutor(): ModelExecutor {
  return {
    model: 'local/autonomy-mode',
    provider: 'local',
    execute: async (prompt: string) => {
      console.warn('NEXUS: All providers exhausted — Local Autonomy Mode');
      return {
        success: true,
        content: `[Local Autonomy] Processing: ${prompt}`,
        confidence: 0.5,
        metadata: { source: 'local', fallback: true },
      };
    },
  };
}

/**
 * Fallback to Local Autonomy Mode when external APIs fail
 */
export async function fallbackToLocalMode(prompt: string): Promise<string> {
  console.warn('NEXUS: Falling back to Local Autonomy Mode');
  return `[Local Mode] Processing: ${prompt}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLEET INTROSPECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get fleet status for dashboard/terminal
 */
export function getFleetStatus(): {
  providers: Array<{
    id: string;
    model: string;
    health: number;
    rpm_used: number;
    rpm_limit: number;
    rpd_used: number;
    rpd_limit: number;
    available: boolean;
  }>;
  totalCapacityRPD: number;
  healthyCount: number;
} {
  const providers = FLEET_REGISTRY.map(p => {
    const h = getHealthState(p.id);
    const w = getUsageWindow(p.id);
    return {
      id: p.id,
      model: p.model,
      health: Math.round(h.score),
      rpm_used: w.minuteCalls,
      rpm_limit: p.rpm,
      rpd_used: w.dayCalls,
      rpd_limit: p.rpd,
      available: canUseProvider(p) && h.score > 10,
    };
  });

  return {
    providers,
    totalCapacityRPD: FLEET_REGISTRY.reduce((sum, p) => sum + p.rpd, 0),
    healthyCount: providers.filter(p => p.available).length,
  };
}

/**
 * Get best provider for ENCODE code generation tasks
 * Uses highest-quality reasoning models with code affinity
 */
export function getEncodeProvider(): FleetProvider {
  const codeProviders = FLEET_REGISTRY
    .filter(p => p.affinities.includes('code'))
    .filter(p => canUseProvider(p))
    .filter(p => getHealthState(p.id).score > 30)
    .sort((a, b) => {
      const ha = getHealthState(a.id).score;
      const hb = getHealthState(b.id).score;
      // Prefer quality (lower priority number) weighted by health
      return (a.priority - b.priority) + (hb - ha) * 0.1;
    });

  return codeProviders[0] || FLEET_REGISTRY[0];
}
