/**
 * CMPSBL® DEFENSE — Consolidated Rate Limiting
 * Unified rate limiting middleware with adaptive thresholds
 * Guarded by Phase 2 threshold clamping system
 */

import { supabase } from '@/integrations/supabase/client';
import { registerThreshold, clamp as guardClamp } from './guardrail';

export interface RateLimitConfig {
  endpoint: string;
  windowMs: number;
  maxRequests: number;
  burstLimit?: number;
  adaptiveEnabled?: boolean;
}

export interface RateLimitStatus {
  endpoint: string;
  currentCount: number;
  maxAllowed: number;
  windowReset: string;
  isLimited: boolean;
  remainingRequests: number;
}

export interface AdaptiveThreshold {
  baseLimit: number;
  currentLimit: number;
  adjustment: number;
  reason: string;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  'pf-substrate': { endpoint: 'pf-substrate', windowMs: 60000, maxRequests: 100, burstLimit: 20 },
  'pf-nexus-router': { endpoint: 'pf-nexus-router', windowMs: 60000, maxRequests: 30, burstLimit: 10 },
  'pf-brain-learn': { endpoint: 'pf-brain-learn', windowMs: 60000, maxRequests: 20, burstLimit: 5 },
  'pf-decode-chat': { endpoint: 'pf-decode-chat', windowMs: 60000, maxRequests: 50, burstLimit: 15 },
  'pf-defense-analyze': { endpoint: 'pf-defense-analyze', windowMs: 60000, maxRequests: 200, burstLimit: 50 },
};

// ── Register all adaptive thresholds with guardrail bounds ──────
for (const [key, cfg] of Object.entries(DEFAULT_LIMITS)) {
  registerThreshold(
    {
      key: `rate_limit:${key}`,
      bounds: { min: Math.round(cfg.maxRequests * 0.5), max: Math.round(cfg.maxRequests * 2) },
      maxDailyDeltaPct: 0.25,    // Max 25% change per day
      cooldownMs: 5 * 60_000,    // 5 minute cooldown between adjustments
      requiredConfirmations: 2,  // 2 consecutive same-direction confirmations
    },
    cfg.maxRequests
  );
}

/**
 * Get consolidated rate limit status across all endpoints
 */
export async function getConsolidatedLimits(): Promise<{
  endpoints: RateLimitStatus[];
  summary: {
    totalEndpoints: number;
    limitedEndpoints: number;
    averageUtilization: number;
  };
}> {
  try {
    const { data: limits } = await supabase
      .from('edge_rate_limits')
      .select('*')
      .gte('window_start', new Date(Date.now() - 60000).toISOString());
    
    const endpoints: RateLimitStatus[] = [];
    
    for (const [name, config] of Object.entries(DEFAULT_LIMITS)) {
      const record = limits?.find(l => l.function_name === name);
      const currentCount = record?.request_count || 0;
      
      endpoints.push({
        endpoint: name,
        currentCount,
        maxAllowed: config.maxRequests,
        windowReset: new Date(Date.now() + config.windowMs).toISOString(),
        isLimited: currentCount >= config.maxRequests,
        remainingRequests: Math.max(0, config.maxRequests - currentCount),
      });
    }
    
    const limitedCount = endpoints.filter(e => e.isLimited).length;
    const avgUtilization = endpoints.reduce((sum, e) => 
      sum + (e.currentCount / e.maxAllowed), 0) / endpoints.length;
    
    return {
      endpoints,
      summary: {
        totalEndpoints: endpoints.length,
        limitedEndpoints: limitedCount,
        averageUtilization: avgUtilization,
      },
    };
  } catch (error) {
    console.error('Error getting consolidated limits:', error);
    return {
      endpoints: [],
      summary: { totalEndpoints: 0, limitedEndpoints: 0, averageUtilization: 0 },
    };
  }
}

/**
 * Calculate adaptive threshold based on system load
 */
export async function calculateAdaptiveThreshold(
  endpoint: string
): Promise<AdaptiveThreshold> {
  const baseConfig = DEFAULT_LIMITS[endpoint] || { maxRequests: 100 };
  
  // ── Guardrail: Absolute bounds & delta cap ────────────────────
  const ABSOLUTE_MIN_MULTIPLIER = 0.5;  // Never drop below 50% of base
  const ABSOLUTE_MAX_MULTIPLIER = 2.0;  // Never exceed 200% of base
  const MAX_ADJUSTMENT_MAGNITUDE = 0.3; // Max ±30% per calculation
  
  try {
    // Get recent error rates
    const { data: errors } = await supabase
      .from('ai_usage_log')
      .select('success')
      .gte('created_at', new Date(Date.now() - 300000).toISOString())
      .limit(100);
    
    const errorRate = errors?.length 
      ? errors.filter(e => !e.success).length / errors.length 
      : 0;
    
    // Get average response time
    const { data: timings } = await supabase
      .from('ai_usage_log')
      .select('response_time_ms')
      .gte('created_at', new Date(Date.now() - 300000).toISOString())
      .limit(50);
    
    const avgTime = timings?.length
      ? timings.reduce((s, t) => s + (t.response_time_ms || 0), 0) / timings.length
      : 0;
    
    // Calculate adjustment
    let adjustment = 0;
    let reason = 'Normal operating conditions';
    
    if (errorRate > 0.2) {
      adjustment = -0.3;
      reason = 'High error rate detected';
    } else if (errorRate > 0.1) {
      adjustment = -0.15;
      reason = 'Elevated error rate';
    } else if (avgTime > 2000) {
      adjustment = -0.2;
      reason = 'High response latency';
    } else if (errorRate < 0.02 && avgTime < 500) {
      adjustment = 0.2;
      reason = 'Excellent system health';
    }
    
    // ── Guardrail: Clamp adjustment magnitude ───────────────────
    adjustment = Math.max(-MAX_ADJUSTMENT_MAGNITUDE, Math.min(MAX_ADJUSTMENT_MAGNITUDE, adjustment));
    
    // ── Guardrail: Clamp final limit to absolute bounds ─────────
    const rawLimit = Math.round(baseConfig.maxRequests * (1 + adjustment));
    const minLimit = Math.round(baseConfig.maxRequests * ABSOLUTE_MIN_MULTIPLIER);
    const maxLimit = Math.round(baseConfig.maxRequests * ABSOLUTE_MAX_MULTIPLIER);
    const currentLimit = Math.max(minLimit, Math.min(maxLimit, rawLimit));
    
    return {
      baseLimit: baseConfig.maxRequests,
      currentLimit,
      adjustment,
      reason,
    };
  } catch (error) {
    return {
      baseLimit: baseConfig.maxRequests,
      currentLimit: baseConfig.maxRequests,
      adjustment: 0,
      reason: 'Using default limits',
    };
  }
}

/**
 * Check if a request should be rate limited
 */
export async function checkRateLimit(
  endpoint: string,
  identifier: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: string;
  retryAfter?: number;
}> {
  const config = DEFAULT_LIMITS[endpoint] || { 
    endpoint, 
    windowMs: 60000, 
    maxRequests: 100 
  };
  
  try {
    const windowStart = new Date(Date.now() - config.windowMs).toISOString();
    
    // Get current count
    const { data } = await supabase
      .from('edge_rate_limits')
      .select('request_count, window_start')
      .eq('function_name', endpoint)
      .eq('identifier', identifier)
      .gte('window_start', windowStart)
      .maybeSingle();
    
    const currentCount = data?.request_count || 0;
    const adaptive = await calculateAdaptiveThreshold(endpoint);
    
    const allowed = currentCount < adaptive.currentLimit;
    const remaining = Math.max(0, adaptive.currentLimit - currentCount);
    const resetAt = new Date(Date.now() + config.windowMs).toISOString();
    
    return {
      allowed,
      remaining,
      resetAt,
      retryAfter: allowed ? undefined : Math.ceil(config.windowMs / 1000),
    };
  } catch (error) {
    // Fail open to avoid blocking legitimate traffic
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs).toISOString(),
    };
  }
}

/**
 * Record a request for rate limiting
 */
export async function recordRequest(
  endpoint: string,
  identifier: string
): Promise<void> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 60000);
    
    // Upsert rate limit record
    const { data: existing } = await supabase
      .from('edge_rate_limits')
      .select('id, request_count')
      .eq('function_name', endpoint)
      .eq('identifier', identifier)
      .gte('window_start', windowStart.toISOString())
      .maybeSingle();
    
    if (existing) {
      await supabase
        .from('edge_rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('edge_rate_limits')
        .insert({
          function_name: endpoint,
          identifier,
          request_count: 1,
          window_start: now.toISOString(),
        });
    }
  } catch (error) {
    // Don't block on rate limit errors
    console.error('Rate limit record error:', error);
  }
}

/**
 * Get rate limit analytics
 */
export async function getRateLimitAnalytics(hours: number = 24): Promise<{
  totalRequests: number;
  blockedRequests: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  topIdentifiers: Array<{ identifier: string; count: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
}> {
  try {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    
    const { data: limits } = await supabase
      .from('edge_rate_limits')
      .select('*')
      .gte('window_start', since);
    
    if (!limits || limits.length === 0) {
      return {
        totalRequests: 0,
        blockedRequests: 0,
        topEndpoints: [],
        topIdentifiers: [],
        hourlyDistribution: [],
      };
    }
    
    const totalRequests = limits.reduce((s, l) => s + (l.request_count || 0), 0);
    
    // Calculate blocked (over limit)
    let blocked = 0;
    const endpointCounts: Record<string, number> = {};
    const identifierCounts: Record<string, number> = {};
    const hourlyCounts: Record<number, number> = {};
    
    for (const limit of limits) {
      const config = DEFAULT_LIMITS[limit.function_name];
      if (config && limit.request_count > config.maxRequests) {
        blocked += limit.request_count - config.maxRequests;
      }
      
      endpointCounts[limit.function_name] = (endpointCounts[limit.function_name] || 0) + limit.request_count;
      identifierCounts[limit.identifier] = (identifierCounts[limit.identifier] || 0) + limit.request_count;
      
      const hour = new Date(limit.window_start).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + limit.request_count;
    }
    
    const topEndpoints = Object.entries(endpointCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));
    
    const topIdentifiers = Object.entries(identifierCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([identifier, count]) => ({ identifier, count }));
    
    const hourlyDistribution = Object.entries(hourlyCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);
    
    return {
      totalRequests,
      blockedRequests: blocked,
      topEndpoints,
      topIdentifiers,
      hourlyDistribution,
    };
  } catch (error) {
    console.error('Rate limit analytics error:', error);
    return {
      totalRequests: 0,
      blockedRequests: 0,
      topEndpoints: [],
      topIdentifiers: [],
      hourlyDistribution: [],
    };
  }
}
