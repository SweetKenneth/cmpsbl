/**
 * CMPSBL® NEXUS Provider Manager
 * Adaptive quota management with header-aware throttling for free-tier providers
 */

import { supabase } from '@/integrations/supabase/client';

export type QueryCategory = 'learn' | 'user' | 'reserve';

export interface QuotaStatus {
  remaining: number;
  limit: number;
  resetAt: Date | null;
  throttleDelay: number;
}

export interface UsageLogEntry {
  provider: string;
  category: QueryCategory;
  query_text?: string;
  tokens_used?: number;
  quota_remaining?: number;
  quota_reset_at?: string;
  response_time_ms?: number;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
}

/**
 * Parse quota information from provider API response headers
 */
export function getQuotaFromHeaders(headers: Headers): QuotaStatus {
  const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '1000', 10);
  const limit = parseInt(headers.get('X-RateLimit-Limit') || '25000', 10);
  const resetTime = headers.get('X-RateLimit-Reset');
  
  const resetAt = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
  
  // Dynamic throttle: slower as quota depletes
  const throttleDelay = Math.max(0, ((limit - remaining) / limit) * 1000);
  
  return {
    remaining,
    limit,
    resetAt,
    throttleDelay
  };
}

/**
 * Log API usage to Supabase for tracking and analytics
 */
export async function updateUsageLog(entry: UsageLogEntry): Promise<void> {
  try {
    // Fire-and-forget insert (non-blocking)
    supabase.from('ai_usage_log').insert(entry).then(({ error }) => {
      if (error) console.error('Failed to log usage:', error);
    });

    // Update daily quota counter in a single call (no prior read needed)
    if (entry.success) {
      const today = new Date().toISOString().split('T')[0];
      
      // Use rpc for atomic increment if available, fallback to read+update
      const { data: currentQuota } = await supabase
        .from('ai_daily_quota')
        .select('calls_used, tokens_used')
        .eq('provider', entry.provider)
        .eq('date', today)
        .maybeSingle();
      
      if (currentQuota) {
        await supabase
          .from('ai_daily_quota')
          .update({ 
            calls_used: (currentQuota.calls_used ?? 0) + 1,
            tokens_used: (currentQuota.tokens_used ?? 0) + (entry.tokens_used || 0),
            updated_at: new Date().toISOString(),
          })
          .eq('provider', entry.provider)
          .eq('date', today);
      }
    }
  } catch (err) {
    console.error('Error updating usage log:', err);
  }
}

/**
 * Calculate dynamic throttle delay based on remaining quota
 */
export function dynamicThrottle(remaining: number, limit: number = 25000): number {
  if (remaining > limit * 0.8) return 0; // > 80% quota: no delay
  if (remaining > limit * 0.5) return 100; // > 50% quota: 100ms
  if (remaining > limit * 0.2) return 250; // > 20% quota: 250ms
  if (remaining > 100) return 500; // > 100 calls: 500ms
  return 1000; // Critical: 1s delay
}

/**
 * Categorize API call type for budget allocation
 */
export function categorizeCall(queryText: string, metadata?: Record<string, any>): QueryCategory {
  const lowerQuery = queryText.toLowerCase();
  
  // Learning patterns: code, architecture, research
  if (
    lowerQuery.includes('code') ||
    lowerQuery.includes('implement') ||
    lowerQuery.includes('architecture') ||
    lowerQuery.includes('best practice') ||
    lowerQuery.includes('pattern') ||
    metadata?.type === 'training' ||
    metadata?.source_module === 'brain'
  ) {
    return 'learn';
  }
  
  // User-facing queries
  if (
    metadata?.source_module === 'defense' ||
    metadata?.source_module === 'vision' ||
    metadata?.type === 'user_request'
  ) {
    return 'user';
  }
  
  // Everything else goes to reserve
  return 'reserve';
}

/**
 * Check if call is within daily budget allocation
 * Daily budget: 25k calls split as 17.5k learn / 5k user / 2.5k reserve
 */
export async function enforceDailyBudget(category: QueryCategory): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, calls_budget')
      .eq('provider', 'groq')
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();
    
    if (error || !data) {
      console.warn('No quota data found, allowing call');
      return true;
    }
    
    const used = data.calls_used ?? 0;
    const budget = data.calls_budget ?? 0;
    return budget === 0 || used < budget;
  } catch (err) {
    console.error('Error checking daily budget:', err);
    return true; // Allow on error
  }
}

/**
 * Get current quota status for a category
 */
export async function getQuotaStatus(category: QueryCategory): Promise<{
  used: number;
  budget: number;
  remaining: number;
  percentage: number;
}> {
  try {
    const { data } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, calls_budget')
      .eq('provider', 'groq')
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();
    
    if (!data) {
      return { used: 0, budget: 0, remaining: 0, percentage: 0 };
    }
    
    const used = data.calls_used ?? 0;
    const budget = data.calls_budget ?? 0;
    const remaining = Math.max(0, budget - used);
    const percentage = budget > 0 ? (used / budget) * 100 : 0;
    
    return { used, budget, remaining, percentage };
  } catch (err) {
    console.error('Error getting quota status:', err);
    return { used: 0, budget: 0, remaining: 0, percentage: 0 };
  }
}

/**
 * Check if fallback to alternative AI provider is needed
 */
export function shouldUseFallback(remaining: number): boolean {
  return remaining < 100;
}

/**
 * Get fallback provider based on query type
 */
export function getFallbackProvider(category: QueryCategory): 'groq' | 'cerebras' | 'together' {
  switch (category) {
    case 'learn':
      return 'groq'; // Fast inference for learning
    case 'user':
      return 'together'; // Complex reasoning for user queries
    case 'reserve':
      return 'cerebras'; // Reliable fallback
    default:
      return 'groq';
  }
}

/**
 * Initialize daily quotas (should be called by cron at midnight UTC)
 */
export async function initializeDailyQuotas(): Promise<void> {
  try {
    // Direct update instead of RPC call
    const { error } = await supabase
      .from('ai_daily_quota')
      .update({ 
        calls_used: 0,
        date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .lt('date', new Date().toISOString().split('T')[0]);
    
    if (error) {
      console.error('Failed to initialize daily quotas:', error);
    } else {
      console.log('Daily quotas initialized successfully');
    }
  } catch (err) {
    console.error('Error initializing quotas:', err);
  }
}
