/**
 * ACCESS Ultimate — System 5: Subscription Lifecycle Manager
 * 
 * Tier transitions, grace periods, quota rollover, and
 * entitlement diffing between subscription states.
 * 
 * @module access/ultimate/subscriptionLifecycle
 */

// ── Types ────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'grace' | 'past_due' | 'cancelled' | 'expired';

export interface TierConfig {
  tier: SubscriptionTier;
  monthlyQuota: number;
  ratePerMinute: number;
  ratePerDay: number;
  features: string[];
  priceMillicents: number;
}

export interface ManagedSubscription {
  id: string;
  developerId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  periodStart: number;
  periodEnd: number;
  gracePeriodMs: number;
  quotaUsed: number;
  quotaRollover: number;        // Carried from previous period
  entitlements: string[];
  transitionHistory: TierTransition[];
  createdAt: number;
}

export interface TierTransition {
  fromTier: SubscriptionTier;
  toTier: SubscriptionTier;
  reason: string;
  timestamp: number;
  entitlementsDiff: { added: string[]; removed: string[] };
}

export interface SubscriptionLifecycleStats {
  totalSubscriptions: number;
  byTier: Record<string, number>;
  byStatus: Record<string, number>;
  totalTransitions: number;
  avgQuotaUtilization: number;
}

// ── Constants ────────────────────────────────────────────────────

const TIER_CONFIGS: TierConfig[] = [
  { tier: 'free', monthlyQuota: 1_000, ratePerMinute: 10, ratePerDay: 1_000, features: ['brain:read', 'decode:chat', 'memory:read'], priceMillicents: 0 },
  { tier: 'starter', monthlyQuota: 50_000, ratePerMinute: 60, ratePerDay: 50_000, features: ['brain:*', 'decode:*', 'memory:*', 'encode:code_analysis'], priceMillicents: 2_900_000 },
  { tier: 'pro', monthlyQuota: 500_000, ratePerMinute: 120, ratePerDay: 500_000, features: ['brain:*', 'decode:*', 'memory:*', 'encode:*', 'evolution:propose', 'system:read'], priceMillicents: 9_900_000 },
  { tier: 'enterprise', monthlyQuota: -1, ratePerMinute: 300, ratePerDay: -1, features: ['*:*'], priceMillicents: 49_900_000 },
];

const DEFAULT_GRACE_MS = 7 * 24 * 3_600_000; // 7 days
const MAX_ROLLOVER_PERCENT = 0.1; // 10% of quota

// ── State ────────────────────────────────────────────────────────

const subscriptions: Map<string, ManagedSubscription> = new Map();

// ── Core API ────────────────────────────────────────────────────

/** Create a new subscription */
export function createSubscription(developerId: string, tier: SubscriptionTier = 'free'): ManagedSubscription {
  const config = getTierConfig(tier);
  const now = Date.now();
  const periodEnd = now + 30 * 24 * 3_600_000; // 30 days

  const sub: ManagedSubscription = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    developerId, tier, status: 'active',
    periodStart: now, periodEnd,
    gracePeriodMs: DEFAULT_GRACE_MS,
    quotaUsed: 0, quotaRollover: 0,
    entitlements: config.features,
    transitionHistory: [],
    createdAt: now,
  };

  subscriptions.set(sub.id, sub);
  return sub;
}

/** Transition to a new tier */
export function transitionTier(
  subId: string,
  newTier: SubscriptionTier,
  reason: string = 'user_upgrade',
): { success: boolean; transition?: TierTransition; error?: string } {
  const sub = subscriptions.get(subId);
  if (!sub) return { success: false, error: 'subscription_not_found' };

  const oldConfig = getTierConfig(sub.tier);
  const newConfig = getTierConfig(newTier);

  const added = newConfig.features.filter(f => !oldConfig.features.includes(f));
  const removed = oldConfig.features.filter(f => !newConfig.features.includes(f));

  const transition: TierTransition = {
    fromTier: sub.tier,
    toTier: newTier,
    reason,
    timestamp: Date.now(),
    entitlementsDiff: { added, removed },
  };

  sub.tier = newTier;
  sub.entitlements = newConfig.features;
  sub.transitionHistory.push(transition);

  return { success: true, transition };
}

/** Renew subscription period with optional rollover */
export function renewPeriod(subId: string): { success: boolean; rollover: number } {
  const sub = subscriptions.get(subId);
  if (!sub) return { success: false, rollover: 0 };

  const config = getTierConfig(sub.tier);
  const maxRollover = config.monthlyQuota > 0
    ? Math.floor(config.monthlyQuota * MAX_ROLLOVER_PERCENT)
    : 0;

  const unused = config.monthlyQuota > 0
    ? Math.max(0, config.monthlyQuota - sub.quotaUsed)
    : 0;
  const rollover = Math.min(unused, maxRollover);

  sub.periodStart = Date.now();
  sub.periodEnd = Date.now() + 30 * 24 * 3_600_000;
  sub.quotaUsed = 0;
  sub.quotaRollover = rollover;
  sub.status = 'active';

  return { success: true, rollover };
}

/** Mark subscription as expired/grace */
export function expireSubscription(subId: string): boolean {
  const sub = subscriptions.get(subId);
  if (!sub) return false;

  const now = Date.now();
  if (now > sub.periodEnd + sub.gracePeriodMs) {
    sub.status = 'expired';
  } else if (now > sub.periodEnd) {
    sub.status = 'grace';
  }
  return true;
}

/** Cancel subscription */
export function cancelSubscription(subId: string): boolean {
  const sub = subscriptions.get(subId);
  if (!sub) return false;
  sub.status = 'cancelled';
  return true;
}

/** Record quota usage */
export function recordQuotaUsage(subId: string, amount: number): { allowed: boolean; remaining: number } {
  const sub = subscriptions.get(subId);
  if (!sub) return { allowed: false, remaining: 0 };

  const config = getTierConfig(sub.tier);
  const effectiveQuota = config.monthlyQuota > 0
    ? config.monthlyQuota + sub.quotaRollover
    : Infinity;

  if (sub.quotaUsed + amount > effectiveQuota) {
    return { allowed: false, remaining: Math.max(0, effectiveQuota - sub.quotaUsed) };
  }

  sub.quotaUsed += amount;
  return { allowed: true, remaining: Math.max(0, effectiveQuota - sub.quotaUsed) };
}

// ── Helpers ──────────────────────────────────────────────────────

export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return TIER_CONFIGS.find(t => t.tier === tier) ?? TIER_CONFIGS[0];
}

export function getAllTierConfigs(): TierConfig[] { return [...TIER_CONFIGS]; }

// ── Query ────────────────────────────────────────────────────────

export function getSubscriptionById(id: string): ManagedSubscription | undefined { return subscriptions.get(id); }
export function getSubscriptionsByDeveloper(developerId: string): ManagedSubscription[] {
  return [...subscriptions.values()].filter(s => s.developerId === developerId);
}

export function getSubscriptionLifecycleStats(): SubscriptionLifecycleStats {
  const all = [...subscriptions.values()];
  const byTier: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalTransitions = 0;
  let quotaUtil = 0;
  let quotaCount = 0;

  for (const sub of all) {
    byTier[sub.tier] = (byTier[sub.tier] || 0) + 1;
    byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;
    totalTransitions += sub.transitionHistory.length;
    const config = getTierConfig(sub.tier);
    if (config.monthlyQuota > 0) {
      quotaUtil += sub.quotaUsed / config.monthlyQuota;
      quotaCount++;
    }
  }

  return {
    totalSubscriptions: all.length,
    byTier, byStatus, totalTransitions,
    avgQuotaUtilization: quotaCount > 0 ? Math.round((quotaUtil / quotaCount) * 100) : 0,
  };
}

export function resetSubscriptionLifecycle(): void {
  subscriptions.clear();
}
