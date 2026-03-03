/**
 * PFV Port → Adaptive Quota Manager
 * Header-aware quota parsing, category budgeting, dynamic throttling
 * Benefits: NEXUS, ECONOMY
 * Source: PromptFluid-Vision brain/perplexity-manager.ts
 */

import { supabase } from '@/integrations/supabase/client';

export type QueryCategory = 'learn' | 'user' | 'reserve';

export interface QuotaStatus {
  remaining: number;
  limit: number;
  resetAt: Date | null;
  throttleDelay: number;
}

/**
 * Parse quota from X-RateLimit-* response headers
 */
export function getQuotaFromHeaders(headers: Headers): QuotaStatus {
  const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '1000', 10);
  const limit = parseInt(headers.get('X-RateLimit-Limit') || '25000', 10);
  const resetTime = headers.get('X-RateLimit-Reset');
  const resetAt = resetTime ? new Date(parseInt(resetTime) * 1000) : null;

  // Dynamic throttle: slower as quota depletes
  const throttleDelay = Math.max(0, ((limit - remaining) / limit) * 1000);

  return { remaining, limit, resetAt, throttleDelay };
}

/**
 * Dynamic throttle delay based on remaining quota percentage
 */
export function dynamicThrottle(remaining: number, limit: number = 25000): number {
  const ratio = remaining / limit;
  if (ratio > 0.8) return 0;       // > 80%: no delay
  if (ratio > 0.5) return 100;     // > 50%: 100ms
  if (ratio > 0.2) return 250;     // > 20%: 250ms
  if (remaining > 100) return 500; // > 100 calls: 500ms
  return 1000;                     // Critical: 1s
}

/**
 * Categorize API call for budget allocation
 */
export function categorizeCall(
  queryText: string,
  metadata?: Record<string, any>
): QueryCategory {
  const lower = queryText.toLowerCase();

  if (
    lower.includes('code') || lower.includes('implement') ||
    lower.includes('architecture') || lower.includes('best practice') ||
    lower.includes('pattern') ||
    metadata?.type === 'training' || metadata?.source_module === 'brain'
  ) return 'learn';

  if (
    metadata?.source_module === 'defense' ||
    metadata?.source_module === 'vision' ||
    metadata?.type === 'user_request'
  ) return 'user';

  return 'reserve';
}

/**
 * Enforce daily budget by category
 */
export async function enforceDailyBudget(category: QueryCategory): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, calls_budget')
      .eq('provider', 'nexus')
      .eq('category', category)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (error || !data) return true; // Allow on missing data
    return (data.calls_used ?? 0) < (data.calls_budget ?? Infinity);
  } catch {
    return true;
  }
}

/**
 * Get current quota status
 */
export async function getQuotaStatusForCategory(category: QueryCategory): Promise<{
  used: number;
  budget: number;
  remaining: number;
  percentage: number;
}> {
  try {
    const { data } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, calls_budget')
      .eq('provider', 'nexus')
      .eq('category', category)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (!data) return { used: 0, budget: 0, remaining: 0, percentage: 0 };

    const used = data.calls_used ?? 0;
    const budget = data.calls_budget ?? 0;
    return {
      used,
      budget,
      remaining: budget - used,
      percentage: budget > 0 ? (used / budget) * 100 : 0,
    };
  } catch {
    return { used: 0, budget: 0, remaining: 0, percentage: 0 };
  }
}

/**
 * Determine if fallback provider is needed
 */
export function shouldUseFallback(remaining: number): boolean {
  return remaining < 100;
}

/**
 * Select fallback provider by category
 */
export function getFallbackProvider(category: QueryCategory): string {
  switch (category) {
    case 'learn': return 'groq';      // Fast for learning
    case 'user': return 'anthropic';   // Quality for user-facing
    case 'reserve': return 'openai';   // Balanced
    default: return 'groq';
  }
}
