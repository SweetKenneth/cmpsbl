/**
 * ACCESS Persistent Quota Store
 * Database-backed quota tracking with in-memory caching
 */

import { supabase } from '@/integrations/supabase/client';

// ============ Types ============

export interface QuotaPeriod {
  developer_id: string;
  resource_type: string;
  period_key: string; // e.g., "2024-03-09" for daily, "2024-03-09T14" for hourly
  usage_count: number;
  usage_tokens: number;
  limit_count: number;
  limit_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface QuotaSnapshot {
  developer_id: string;
  period: 'minute' | 'hour' | 'day' | 'month';
  current_usage: number;
  limit: number;
  remaining: number;
  percent_used: number;
  reset_at: string;
  is_throttled: boolean;
  is_blocked: boolean;
}

// ============ In-Memory Cache ============

const quotaCache = new Map<string, { data: QuotaPeriod; cachedAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 second cache
const MAX_CACHE_ENTRIES = 1000;

// ============ Period Key Generation ============

export function generatePeriodKey(period: 'minute' | 'hour' | 'day' | 'month'): string {
  const now = new Date();
  switch (period) {
    case 'minute':
      return `${now.toISOString().slice(0, 16)}`; // "2024-03-09T14:30"
    case 'hour':
      return `${now.toISOString().slice(0, 13)}`; // "2024-03-09T14"
    case 'day':
      return now.toISOString().slice(0, 10); // "2024-03-09"
    case 'month':
      return now.toISOString().slice(0, 7); // "2024-03"
    default:
      return now.toISOString().slice(0, 10);
  }
}

export function getPeriodResetTime(period: 'minute' | 'hour' | 'day' | 'month'): Date {
  const now = new Date();
  switch (period) {
    case 'minute':
      return new Date(now.getTime() + (60 - now.getSeconds()) * 1000);
    case 'hour':
      return new Date(now.getTime() + (60 - now.getMinutes()) * 60 * 1000);
    case 'day':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    case 'month':
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      return nextMonth;
    default:
      return new Date(now.getTime() + 86_400_000);
  }
}

// ============ Cache Management ============

function getCacheKey(developerId: string, resourceType: string, periodKey: string): string {
  return `${developerId}:${resourceType}:${periodKey}`;
}

function getCachedQuota(key: string): QuotaPeriod | null {
  const cached = quotaCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
    quotaCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedQuota(key: string, data: QuotaPeriod): void {
  // Evict old entries if at capacity
  if (quotaCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = quotaCache.keys().next().value;
    if (oldestKey) quotaCache.delete(oldestKey);
  }
  quotaCache.set(key, { data, cachedAt: Date.now() });
}

// ============ Database Operations ============

/**
 * Get or create quota period record
 */
export async function getOrCreateQuotaPeriod(
  developerId: string,
  resourceType: string,
  period: 'minute' | 'hour' | 'day' | 'month',
  defaultLimit: number = 10000
): Promise<QuotaPeriod> {
  const periodKey = generatePeriodKey(period);
  const cacheKey = getCacheKey(developerId, resourceType, periodKey);
  
  // Check cache first
  const cached = getCachedQuota(cacheKey);
  if (cached) return cached;
  
  try {
    // Try to get existing record
    const { data: existing } = await supabase
      .from('access_quotas')
      .select('*')
      .eq('api_key_id', developerId) // Using api_key_id for developer tracking
      .eq('date', periodKey)
      .single();
    
    if (existing) {
      const quotaPeriod: QuotaPeriod = {
        developer_id: developerId,
        resource_type: resourceType,
        period_key: periodKey,
        usage_count: existing.calls_used ?? 0,
        usage_tokens: existing.tokens_used ?? 0,
        limit_count: defaultLimit,
        limit_tokens: defaultLimit * 100,
        created_at: periodKey,
        updated_at: new Date().toISOString(),
      };
      setCachedQuota(cacheKey, quotaPeriod);
      return quotaPeriod;
    }
    
    // Create new record
    const { data: created } = await supabase
      .from('access_quotas')
      .insert({
        api_key_id: developerId,
        date: periodKey,
        calls_used: 0,
        tokens_used: 0,
      })
      .select()
      .single();
    
    const newPeriod: QuotaPeriod = {
      developer_id: developerId,
      resource_type: resourceType,
      period_key: periodKey,
      usage_count: 0,
      usage_tokens: 0,
      limit_count: defaultLimit,
      limit_tokens: defaultLimit * 100,
      created_at: created?.date || periodKey,
      updated_at: new Date().toISOString(),
    };
    
    setCachedQuota(cacheKey, newPeriod);
    return newPeriod;
  } catch (error) {
    // Return in-memory fallback on error
    console.error('Quota persistence error:', error);
    return {
      developer_id: developerId,
      resource_type: resourceType,
      period_key: periodKey,
      usage_count: 0,
      usage_tokens: 0,
      limit_count: defaultLimit,
      limit_tokens: defaultLimit * 100,
      created_at: periodKey,
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Increment quota usage with persistence
 */
export async function incrementQuotaUsage(
  developerId: string,
  resourceType: string,
  period: 'minute' | 'hour' | 'day' | 'month',
  incrementCalls: number = 1,
  incrementTokens: number = 0
): Promise<{ success: boolean; newUsage: number; limit: number; blocked: boolean }> {
  const periodKey = generatePeriodKey(period);
  const cacheKey = getCacheKey(developerId, resourceType, periodKey);
  
  try {
    // Get current state
    const current = await getOrCreateQuotaPeriod(developerId, resourceType, period);
    const newUsage = current.usage_count + incrementCalls;
    const blocked = newUsage > current.limit_count;
    
    // Update database
    await supabase
      .from('access_quotas')
      .upsert({
        api_key_id: developerId,
        date: periodKey,
        calls_used: newUsage,
        tokens_used: (current.usage_tokens || 0) + incrementTokens,
      }, {
        onConflict: 'api_key_id,date',
      });
    
    // Update cache
    const updated: QuotaPeriod = {
      ...current,
      usage_count: newUsage,
      usage_tokens: current.usage_tokens + incrementTokens,
      updated_at: new Date().toISOString(),
    };
    setCachedQuota(cacheKey, updated);
    
    return {
      success: true,
      newUsage,
      limit: current.limit_count,
      blocked,
    };
  } catch (error) {
    console.error('Quota increment error:', error);
    return { success: false, newUsage: 0, limit: 0, blocked: false };
  }
}

/**
 * Get comprehensive quota snapshot
 */
export async function getQuotaSnapshot(
  developerId: string,
  period: 'minute' | 'hour' | 'day' | 'month' = 'day'
): Promise<QuotaSnapshot> {
  const current = await getOrCreateQuotaPeriod(developerId, 'api_calls', period);
  const resetAt = getPeriodResetTime(period);
  
  const remaining = Math.max(0, current.limit_count - current.usage_count);
  const percentUsed = current.limit_count > 0 
    ? (current.usage_count / current.limit_count) * 100 
    : 0;
  
  return {
    developer_id: developerId,
    period,
    current_usage: current.usage_count,
    limit: current.limit_count,
    remaining,
    percent_used: Math.round(percentUsed * 100) / 100,
    reset_at: resetAt.toISOString(),
    is_throttled: percentUsed >= 80,
    is_blocked: percentUsed >= 100,
  };
}

/**
 * Check if request should be allowed based on quota
 */
export async function checkQuotaAllowance(
  developerId: string,
  resourceType: string = 'api_calls',
  requestedAmount: number = 1
): Promise<{ 
  allowed: boolean; 
  remaining: number; 
  throttleDelay: number;
  reason?: string;
}> {
  const dailyQuota = await getOrCreateQuotaPeriod(developerId, resourceType, 'day');
  const minuteQuota = await getOrCreateQuotaPeriod(developerId, resourceType, 'minute', 60);
  
  // Check daily limit
  if (dailyQuota.usage_count + requestedAmount > dailyQuota.limit_count) {
    return {
      allowed: false,
      remaining: Math.max(0, dailyQuota.limit_count - dailyQuota.usage_count),
      throttleDelay: 0,
      reason: `Daily quota exceeded: ${dailyQuota.usage_count}/${dailyQuota.limit_count}`,
    };
  }
  
  // Check rate limit (per minute)
  if (minuteQuota.usage_count + requestedAmount > minuteQuota.limit_count) {
    const resetAt = getPeriodResetTime('minute');
    const delayMs = resetAt.getTime() - Date.now();
    return {
      allowed: false,
      remaining: 0,
      throttleDelay: delayMs,
      reason: `Rate limit exceeded: ${minuteQuota.usage_count}/${minuteQuota.limit_count} per minute`,
    };
  }
  
  // Calculate adaptive throttle delay
  const usagePercent = dailyQuota.usage_count / dailyQuota.limit_count;
  let throttleDelay = 0;
  if (usagePercent > 0.9) throttleDelay = 500;
  else if (usagePercent > 0.8) throttleDelay = 200;
  else if (usagePercent > 0.7) throttleDelay = 100;
  
  return {
    allowed: true,
    remaining: dailyQuota.limit_count - dailyQuota.usage_count,
    throttleDelay,
  };
}

/**
 * Reset quota for a developer (admin operation)
 */
export async function resetDeveloperQuota(
  developerId: string,
  period?: 'minute' | 'hour' | 'day' | 'month'
): Promise<boolean> {
  try {
    if (period) {
      const periodKey = generatePeriodKey(period);
      await supabase
        .from('access_quotas')
        .delete()
        .eq('api_key_id', developerId)
        .eq('date', periodKey);
      
      // Clear specific cache entry
      const cacheKey = getCacheKey(developerId, 'api_calls', periodKey);
      quotaCache.delete(cacheKey);
    } else {
      // Reset all quotas for developer
      await supabase
        .from('access_quotas')
        .delete()
        .eq('api_key_id', developerId);
      
      // Clear all cache entries for this developer
      for (const key of quotaCache.keys()) {
        if (key.startsWith(`${developerId}:`)) {
          quotaCache.delete(key);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Quota reset error:', error);
    return false;
  }
}

/**
 * Get quota analytics across all developers
 */
export async function getQuotaAnalytics(): Promise<{
  total_developers: number;
  total_usage_today: number;
  approaching_limit_count: number;
  blocked_count: number;
  avg_utilization: number;
}> {
  try {
    const today = generatePeriodKey('day');
    
    const { data } = await supabase
      .from('access_quotas')
      .select('api_key_id, calls_used')
      .eq('date', today);
    
    if (!data || data.length === 0) {
      return {
        total_developers: 0,
        total_usage_today: 0,
        approaching_limit_count: 0,
        blocked_count: 0,
        avg_utilization: 0,
      };
    }
    
    const defaultLimit = 10000;
    let totalUsage = 0;
    let approachingLimit = 0;
    let blocked = 0;
    
    for (const record of data) {
      const usage = record.calls_used ?? 0;
      totalUsage += usage;
      
      const utilization = usage / defaultLimit;
      if (utilization >= 1) blocked++;
      else if (utilization >= 0.8) approachingLimit++;
    }
    
    return {
      total_developers: data.length,
      total_usage_today: totalUsage,
      approaching_limit_count: approachingLimit,
      blocked_count: blocked,
      avg_utilization: Math.round((totalUsage / (data.length * defaultLimit)) * 100),
    };
  } catch (error) {
    console.error('Quota analytics error:', error);
    return {
      total_developers: 0,
      total_usage_today: 0,
      approaching_limit_count: 0,
      blocked_count: 0,
      avg_utilization: 0,
    };
  }
}
