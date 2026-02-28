/**
 * Feature Flags — Runtime toggles for substrate capabilities
 * Supports local overrides, remote sync, and percentage rollouts
 */

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercent: number; // 0-100
  metadata?: Record<string, unknown>;
  updatedAt: number;
}

const flags = new Map<string, FeatureFlag>();
const overrides = new Map<string, boolean>();
const listeners = new Set<(key: string, enabled: boolean) => void>();

/** Seed a consistent hash from user/session ID for rollout */
function hashPercent(key: string, seed: string): number {
  let h = 0;
  const combined = `${key}:${seed}`;
  for (let i = 0; i < combined.length; i++) {
    h = ((h << 5) - h + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 100;
}

export function defineFlag(key: string, enabled = false, rolloutPercent = 100): void {
  flags.set(key, { key, enabled, rolloutPercent, updatedAt: Date.now() });
}

export function isEnabled(key: string, userId?: string): boolean {
  const override = overrides.get(key);
  if (override !== undefined) return override;

  const flag = flags.get(key);
  if (!flag) return false;
  if (!flag.enabled) return false;
  if (flag.rolloutPercent >= 100) return true;
  if (!userId) return flag.rolloutPercent > 50; // default bucket
  return hashPercent(key, userId) < flag.rolloutPercent;
}

export function setOverride(key: string, enabled: boolean): void {
  overrides.set(key, enabled);
  listeners.forEach(fn => fn(key, enabled));
}

export function clearOverride(key: string): void {
  overrides.delete(key);
}

export function clearAllOverrides(): void {
  overrides.clear();
}

export function onFlagChange(cb: (key: string, enabled: boolean) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getAllFlags(): FeatureFlag[] {
  return Array.from(flags.values());
}

export function bulkDefine(defs: Record<string, boolean>): void {
  for (const [k, v] of Object.entries(defs)) {
    defineFlag(k, v);
  }
}

// Predefine substrate flags
bulkDefine({
  'substrate.warmup': true,
  'substrate.dlq': true,
  'substrate.canary': false,
  'substrate.chaos': false,
  'substrate.adaptive_polling': true,
  'substrate.request_coalescing': true,
  'substrate.cascade_detection': true,
});
