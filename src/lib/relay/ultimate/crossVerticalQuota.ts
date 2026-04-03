/**
 * Cross-Vertical Quota System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Shared rate limits across all CMPSBL vertical substrates.
 * Follows the 3/6/9/12 rule:
 *   Builder (Free): 3 uses/day per API action across all verticals
 *   Studio ($29):   6 uses/day
 *   Creator ($49):  9 uses/day
 *   Architect ($79): 12 uses/day
 *
 * Buying in the Showroom is unlimited — quotas only govern compute actions.
 *
 * © CMPSBL® — All rights reserved.
 */

export type SubscriptionTier = 'builder' | 'studio' | 'creator' | 'architect' | 'governor';

export interface QuotaAction {
  /** e.g. 'ascension', 'clm_cycle', 'memory_stream_scan' */
  action: string;
  /** Which vertical used it: 'security', 'robotics', 'cmpsbl' etc. */
  vertical: string;
  /** Timestamp of use */
  usedAt: number;
}

export interface QuotaStatus {
  tier: SubscriptionTier;
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  actions: QuotaAction[];
  resetAt: number;
}

/** 3/6/9/12 daily limits per tier */
const TIER_LIMITS: Record<SubscriptionTier, number> = {
  builder: 3,
  studio: 6,
  creator: 9,
  architect: 12,
  governor: Infinity,
};

/** Rate-limited API actions (buying is NOT rate-limited) */
const RATE_LIMITED_ACTIONS = new Set([
  'ascension',
  'clm_cycle',
  'memory_stream_scan',
  'restoration',
  'diagnostic',
  'export',
]);

/** In-memory quota tracker (production would use Supabase) */
const quotaStore = new Map<string, QuotaAction[]>();

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUserKey(userId: string): string {
  return `${userId}:${getTodayKey()}`;
}

function getResetTimestamp(): number {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Check if a user can perform a rate-limited action
 */
export function checkVerticalQuota(
  userId: string,
  tier: SubscriptionTier,
  action: string,
  vertical: string,
): QuotaStatus {
  const limit = TIER_LIMITS[tier];
  const key = getUserKey(userId);
  const actions = quotaStore.get(key) ?? [];

  // Only count rate-limited actions
  const rateLimitedActions = actions.filter(a => RATE_LIMITED_ACTIONS.has(a.action));

  return {
    tier,
    dailyLimit: limit === Infinity ? 999 : limit,
    usedToday: rateLimitedActions.length,
    remaining: Math.max(0, (limit === Infinity ? 999 : limit) - rateLimitedActions.length),
    actions: rateLimitedActions,
    resetAt: getResetTimestamp(),
  };
}

/**
 * Consume a quota action across any vertical
 * Returns true if allowed, false if quota exhausted
 */
export function consumeVerticalQuota(
  userId: string,
  tier: SubscriptionTier,
  action: string,
  vertical: string,
): { allowed: boolean; status: QuotaStatus } {
  // Purchases are always allowed — no rate limit
  if (!RATE_LIMITED_ACTIONS.has(action)) {
    const status = checkVerticalQuota(userId, tier, action, vertical);
    return { allowed: true, status };
  }

  const limit = TIER_LIMITS[tier];
  const key = getUserKey(userId);
  const actions = quotaStore.get(key) ?? [];
  const rateLimitedActions = actions.filter(a => RATE_LIMITED_ACTIONS.has(a.action));

  if (rateLimitedActions.length >= limit) {
    return {
      allowed: false,
      status: checkVerticalQuota(userId, tier, action, vertical),
    };
  }

  const newAction: QuotaAction = { action, vertical, usedAt: Date.now() };
  actions.push(newAction);
  quotaStore.set(key, actions);

  return {
    allowed: true,
    status: checkVerticalQuota(userId, tier, action, vertical),
  };
}

/**
 * Get quota status for a user across all verticals
 */
export function getQuotaStatus(userId: string, tier: SubscriptionTier): QuotaStatus {
  return checkVerticalQuota(userId, tier, '', '');
}

/**
 * Get quota breakdown by vertical
 */
export function getQuotaByVertical(userId: string): Record<string, number> {
  const key = getUserKey(userId);
  const actions = quotaStore.get(key) ?? [];
  const breakdown: Record<string, number> = {};

  for (const a of actions) {
    if (RATE_LIMITED_ACTIONS.has(a.action)) {
      breakdown[a.vertical] = (breakdown[a.vertical] ?? 0) + 1;
    }
  }

  return breakdown;
}

/** Check if an action is rate-limited (purchases are not) */
export function isRateLimitedAction(action: string): boolean {
  return RATE_LIMITED_ACTIONS.has(action);
}

/** Reset quota state (for testing) */
export function resetQuotaState(): void {
  quotaStore.clear();
}
