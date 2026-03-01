/**
 * S-Tier Crown Jewel #15 — DECODE Feature Flag Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 15 | CJPI: 93 | Module: DECODE | Type: Architecture
 *
 * Runtime feature toggling with percentage rollouts, user targeting,
 * A/B cohort assignment, kill switches, dependency chains, and
 * evaluation analytics. No external service required.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targetUsers?: string[];
  excludeUsers?: string[];
  dependencies?: string[];
  metadata?: Record<string, unknown>;
  variants?: Array<{ id: string; weight: number }>;
  killSwitch?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface EvalContext {
  userId?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface EvalResult {
  enabled: boolean;
  variant?: string;
  reason: 'kill_switch' | 'disabled' | 'target_match' | 'excluded' | 'rollout' | 'dependency_failed' | 'default';
}

export function createFeatureFlagEngine() {
  const flags = new Map<string, FeatureFlag>();
  const evaluations: Array<{ key: string; result: boolean; userId?: string; timestamp: number }> = [];

  // ── Flag Management ──────────────────────────────────────────────

  function register(key: string, config: Partial<Omit<FeatureFlag, 'key' | 'createdAt' | 'updatedAt'>> = {}): FeatureFlag {
    const flag: FeatureFlag = {
      key,
      enabled: config.enabled ?? false,
      rolloutPercentage: config.rolloutPercentage,
      targetUsers: config.targetUsers,
      excludeUsers: config.excludeUsers,
      dependencies: config.dependencies,
      metadata: config.metadata,
      variants: config.variants,
      killSwitch: config.killSwitch,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    flags.set(key, flag);
    return flag;
  }

  function update(key: string, changes: Partial<Omit<FeatureFlag, 'key' | 'createdAt'>>): FeatureFlag | null {
    const flag = flags.get(key);
    if (!flag) return null;
    Object.assign(flag, changes, { updatedAt: Date.now() });
    return flag;
  }

  function kill(key: string): boolean {
    const flag = flags.get(key);
    if (!flag) return false;
    flag.killSwitch = true;
    flag.updatedAt = Date.now();
    return true;
  }

  function revive(key: string): boolean {
    const flag = flags.get(key);
    if (!flag) return false;
    flag.killSwitch = false;
    flag.updatedAt = Date.now();
    return true;
  }

  // ── Evaluation ───────────────────────────────────────────────────

  function hashUser(userId: string, key: string): number {
    let h = 0;
    const s = `${userId}:${key}`;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return Math.abs(h) % 100;
  }

  function evaluate(key: string, ctx: EvalContext = {}): EvalResult {
    const flag = flags.get(key);
    if (!flag) return { enabled: false, reason: 'disabled' };

    // Kill switch overrides everything
    if (flag.killSwitch) {
      record(key, false, ctx.userId);
      return { enabled: false, reason: 'kill_switch' };
    }

    // Base enabled check
    if (!flag.enabled) {
      record(key, false, ctx.userId);
      return { enabled: false, reason: 'disabled' };
    }

    // Dependency check
    if (flag.dependencies?.length) {
      const depsFailed = flag.dependencies.some(dep => !evaluate(dep, ctx).enabled);
      if (depsFailed) {
        record(key, false, ctx.userId);
        return { enabled: false, reason: 'dependency_failed' };
      }
    }

    // User exclusion
    if (ctx.userId && flag.excludeUsers?.includes(ctx.userId)) {
      record(key, false, ctx.userId);
      return { enabled: false, reason: 'excluded' };
    }

    // User targeting
    if (ctx.userId && flag.targetUsers?.length) {
      if (flag.targetUsers.includes(ctx.userId)) {
        const variant = selectVariant(flag, ctx.userId);
        record(key, true, ctx.userId);
        return { enabled: true, variant, reason: 'target_match' };
      }
    }

    // Percentage rollout
    if (flag.rolloutPercentage !== undefined && ctx.userId) {
      const bucket = hashUser(ctx.userId, key);
      if (bucket >= flag.rolloutPercentage) {
        record(key, false, ctx.userId);
        return { enabled: false, reason: 'rollout' };
      }
    }

    const variant = ctx.userId ? selectVariant(flag, ctx.userId) : undefined;
    record(key, true, ctx.userId);
    return { enabled: true, variant, reason: flag.targetUsers?.length ? 'rollout' : 'default' };
  }

  function selectVariant(flag: FeatureFlag, userId: string): string | undefined {
    if (!flag.variants?.length) return undefined;
    const h = hashUser(userId, flag.key + ':variant');
    const totalWeight = flag.variants.reduce((s, v) => s + v.weight, 0);
    const normalized = (h / 100) * totalWeight;
    let acc = 0;
    for (const v of flag.variants) { acc += v.weight; if (normalized <= acc) return v.id; }
    return flag.variants[flag.variants.length - 1].id;
  }

  function record(key: string, result: boolean, userId?: string) {
    evaluations.push({ key, result, userId, timestamp: Date.now() });
    if (evaluations.length > 10_000) evaluations.splice(0, evaluations.length - 10_000);
  }

  // ── Analytics ────────────────────────────────────────────────────

  function getAnalytics(key?: string) {
    const relevant = key ? evaluations.filter(e => e.key === key) : evaluations;
    const enabled = relevant.filter(e => e.result).length;
    return {
      totalEvaluations: relevant.length,
      enabledCount: enabled,
      disabledCount: relevant.length - enabled,
      enableRate: relevant.length > 0 ? enabled / relevant.length : 0,
    };
  }

  function listFlags(): FeatureFlag[] { return [...flags.values()]; }

  return { register, update, kill, revive, evaluate, getAnalytics, listFlags };
}
