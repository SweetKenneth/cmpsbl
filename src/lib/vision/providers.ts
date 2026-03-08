/**
 * CMPSBL® VISION "Vee" — Provider Analytics
 * Track AI provider usage, costs, and performance
 */

import { supabase } from '@/integrations/supabase/client';

export interface ProviderStats {
  calls_by_provider: Record<string, number>;
  errors_by_provider: Record<string, number>;
  avg_latency_by_provider: Record<string, number>;
  total_tokens_by_provider: Record<string, number>;
  total_cost_by_provider: Record<string, number>;
  routes_per_provider: Record<string, number>;
}

export interface ProviderSkewResult {
  skew_risk: 'low' | 'medium' | 'high';
  dominant_provider?: string;
  dominant_share?: number;
  recommendation?: string;
}

/**
 * Get provider statistics for a time period
 */
export async function getProviderStats(
  period: '24h' | '7d' = '24h'
): Promise<ProviderStats> {
  const periodMs = period === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - periodMs).toISOString();

  const stats: ProviderStats = {
    calls_by_provider: {},
    errors_by_provider: {},
    avg_latency_by_provider: {},
    total_tokens_by_provider: {},
    total_cost_by_provider: {},
    routes_per_provider: {},
  };

  try {
    // Query ai_usage_log for provider stats (explicit limit to avoid silent 1000-row cap)
    const { data: usageLogs } = await supabase
      .from('ai_usage_log')
      .select('provider, tokens_used, cost, response_time_ms, success')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (usageLogs) {
      const latencyAccum: Record<string, { total: number; count: number }> = {};

      for (const log of usageLogs) {
        const provider = log.provider || 'unknown';

        // Calls
        stats.calls_by_provider[provider] = (stats.calls_by_provider[provider] || 0) + 1;

        // Errors
        if (!log.success) {
          stats.errors_by_provider[provider] = (stats.errors_by_provider[provider] || 0) + 1;
        }

        // Tokens
        if (log.tokens_used) {
          stats.total_tokens_by_provider[provider] =
            (stats.total_tokens_by_provider[provider] || 0) + log.tokens_used;
        }

        // Cost
        if (log.cost) {
          stats.total_cost_by_provider[provider] =
            (stats.total_cost_by_provider[provider] || 0) + Number(log.cost);
        }

        // Latency accumulation
        if (log.response_time_ms) {
          if (!latencyAccum[provider]) {
            latencyAccum[provider] = { total: 0, count: 0 };
          }
          latencyAccum[provider].total += log.response_time_ms;
          latencyAccum[provider].count++;
        }
      }

      // Calculate average latency
      for (const [provider, accum] of Object.entries(latencyAccum)) {
        stats.avg_latency_by_provider[provider] = Math.round(accum.total / accum.count);
      }
    }

    // Query brain_events for routing events
    const { data: routeEvents } = await supabase
      .from('brain_events')
      .select('data')
      .in('event_type', ['nexus_route', 'ai_generation', 'text_generation'])
      .gte('created_at', since);

    if (routeEvents) {
      for (const event of routeEvents) {
        const provider = (event.data as any)?.provider || (event.data as any)?.ai_provider;
        if (provider) {
          stats.routes_per_provider[provider] = (stats.routes_per_provider[provider] || 0) + 1;
        }
      }
    }
  } catch (error) {
    console.error('Error fetching provider stats:', error);
  }

  return stats;
}

/**
 * Detect provider skew (over-reliance on single provider)
 */
export function getProviderSkew(stats: ProviderStats): ProviderSkewResult {
  const totalCalls = Object.values(stats.calls_by_provider).reduce((a, b) => a + b, 0);
  
  if (totalCalls === 0) {
    return { skew_risk: 'low' };
  }

  // Find dominant provider
  let dominantProvider = '';
  let maxCalls = 0;
  
  for (const [provider, calls] of Object.entries(stats.calls_by_provider)) {
    if (calls > maxCalls) {
      maxCalls = calls;
      dominantProvider = provider;
    }
  }

  const dominantShare = maxCalls / totalCalls;

  if (dominantShare > 0.9) {
    return {
      skew_risk: 'high',
      dominant_provider: dominantProvider,
      dominant_share: Math.round(dominantShare * 100),
      recommendation: `Over 90% of calls go to ${dominantProvider}. Consider distributing load.`,
    };
  }

  if (dominantShare > 0.7) {
    return {
      skew_risk: 'medium',
      dominant_provider: dominantProvider,
      dominant_share: Math.round(dominantShare * 100),
      recommendation: `${dominantProvider} handles ${Math.round(dominantShare * 100)}% of traffic.`,
    };
  }

  return {
    skew_risk: 'low',
    dominant_provider: dominantProvider,
    dominant_share: Math.round(dominantShare * 100),
  };
}

/**
 * Get combined provider analytics for vision.analytics
 */
export async function getProviderAnalytics(): Promise<{
  providers: ProviderStats & { skew_risk: string };
}> {
  const stats = await getProviderStats('24h');
  const skew = getProviderSkew(stats);

  return {
    providers: {
      ...stats,
      skew_risk: skew.skew_risk,
    },
  };
}
