/**
 * Feature Flag Manager
 * Runtime feature toggles with gradual rollout and targeting
 * 
 * Manages feature flags with percentage-based rollout,
 * targeting rules, and kill-switch capabilities.
 */

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  rolloutPercent: number; // 0-100
  targetTiers: string[]; // which tiers see this feature
  killSwitch: boolean;
  createdAt: number;
  updatedAt: number;
  metadata: Record<string, string>;
}

const flags = new Map<string, FeatureFlag>();

export function createFlag(id: string, name: string, enabled: boolean = false, rolloutPercent: number = 0): FeatureFlag {
  // Clamp rollout to valid range
  const clampedRollout = Math.max(0, Math.min(100, rolloutPercent));
  const flag: FeatureFlag = {
    id, name, enabled, rolloutPercent: clampedRollout,
    targetTiers: ['free', 'builder', 'pro', 'enterprise'],
    killSwitch: false,
    createdAt: Date.now(), updatedAt: Date.now(), metadata: {},
  };
  flags.set(id, flag);
  return flag;
}

export function isEnabled(flagId: string, userTier?: string, userId?: string): boolean {
  const flag = flags.get(flagId);
  if (!flag || !flag.enabled || flag.killSwitch) return false;
  if (userTier && !flag.targetTiers.includes(userTier)) return false;
  if (flag.rolloutPercent >= 100) return true;
  if (flag.rolloutPercent <= 0) return false;
  // Deterministic hash-based rollout
  const hash = (userId ?? 'default').split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return (Math.abs(hash) % 100) < flag.rolloutPercent;
}

export function updateFlag(flagId: string, updates: Partial<Pick<FeatureFlag, 'enabled' | 'rolloutPercent' | 'targetTiers' | 'killSwitch'>>): FeatureFlag | null {
  const flag = flags.get(flagId);
  if (!flag) return null;
  Object.assign(flag, updates, { updatedAt: Date.now() });
  return flag;
}

export function killFlag(flagId: string): boolean {
  const flag = flags.get(flagId);
  if (!flag) return false;
  flag.killSwitch = true;
  flag.updatedAt = Date.now();
  return true;
}

export function getFlags(): FeatureFlag[] { return Array.from(flags.values()); }
export function getFlag(id: string): FeatureFlag | undefined { return flags.get(id); }
export function getActiveFlags(): FeatureFlag[] { return Array.from(flags.values()).filter(f => f.enabled && !f.killSwitch); }
