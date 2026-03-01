/**
 * Meta-Engine #11 — Progressive Delivery Platform
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Composes: Feature Flags + State Machine + Event Sourcing + Anomaly + Pipeline
 *
 * End-to-end release management. Define rollout stages as state machines,
 * gate transitions with feature flag evaluations, detect deployment
 * anomalies, and produce full rollout event history.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export type RolloutPhase = 'canary' | 'limited' | 'progressive' | 'general' | 'full' | 'rolled_back';

export interface RolloutConfig {
  id: string;
  feature: string;
  stages: Array<{
    phase: RolloutPhase;
    percentage: number;
    minDurationMs: number;
    successThreshold: number;
    autoAdvance?: boolean;
  }>;
  onAdvance?: (from: RolloutPhase, to: RolloutPhase) => void;
  onRollback?: (from: RolloutPhase, reason: string) => void;
}

export interface RolloutInstance {
  id: string;
  feature: string;
  currentPhase: RolloutPhase;
  currentPercentage: number;
  stageIndex: number;
  phaseStartedAt: number;
  metrics: { success: number; failure: number; total: number };
  events: Array<{ type: string; phase: RolloutPhase; timestamp: number; data?: unknown }>;
  status: 'active' | 'completed' | 'rolled_back' | 'paused';
  createdAt: number;
}

export interface DeliveryStats {
  activeRollouts: number;
  completedRollouts: number;
  rolledBack: number;
  avgTimeToFullRollout: number;
  rollbackRate: number;
}

export function createProgressiveDelivery() {
  const rollouts = new Map<string, { config: RolloutConfig; instance: RolloutInstance }>();
  const completed: RolloutInstance[] = [];

  // ── Feature Flag (inline) ──────────────────────────────────────
  const flags = new Map<string, { enabled: boolean; percentage: number; targetUsers: Set<string> }>();

  function flagEval(feature: string, userId?: string): boolean {
    const f = flags.get(feature);
    if (!f || !f.enabled) return false;
    if (userId && f.targetUsers.has(userId)) return true;
    if (userId && f.percentage < 100) {
      let h = 0; const s = `${userId}:${feature}`; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return Math.abs(h) % 100 < f.percentage;
    }
    return f.enabled;
  }

  function flagSet(feature: string, enabled: boolean, percentage: number) {
    const existing = flags.get(feature);
    flags.set(feature, { enabled, percentage, targetUsers: existing?.targetUsers ?? new Set() });
  }

  // ── Anomaly Detection (inline) ─────────────────────────────────
  function detectAnomaly(metrics: { success: number; failure: number; total: number }, threshold: number): { anomalous: boolean; successRate: number } {
    const rate = metrics.total > 0 ? metrics.success / metrics.total : 1;
    return { anomalous: rate < threshold, successRate: rate };
  }

  // ── Rollout Management ─────────────────────────────────────────

  function startRollout(config: RolloutConfig): RolloutInstance {
    if (config.stages.length === 0) throw new Error('Rollout must have at least one stage');

    const firstStage = config.stages[0];
    const instance: RolloutInstance = {
      id: `rollout_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      feature: config.feature,
      currentPhase: firstStage.phase,
      currentPercentage: firstStage.percentage,
      stageIndex: 0,
      phaseStartedAt: Date.now(),
      metrics: { success: 0, failure: 0, total: 0 },
      events: [{ type: 'rollout_started', phase: firstStage.phase, timestamp: Date.now(), data: { percentage: firstStage.percentage } }],
      status: 'active',
      createdAt: Date.now(),
    };

    flagSet(config.feature, true, firstStage.percentage);
    rollouts.set(config.id, { config, instance });
    return instance;
  }

  function recordMetric(rolloutId: string, success: boolean) {
    const r = rollouts.get(rolloutId);
    if (!r || r.instance.status !== 'active') return;
    r.instance.metrics.total++;
    if (success) r.instance.metrics.success++; else r.instance.metrics.failure++;
  }

  function evaluate(rolloutId: string): { action: 'hold' | 'advance' | 'rollback'; reason: string } {
    const r = rollouts.get(rolloutId);
    if (!r || r.instance.status !== 'active') return { action: 'hold', reason: 'not_active' };

    const stage = r.config.stages[r.instance.stageIndex];
    const elapsed = Date.now() - r.instance.phaseStartedAt;

    // Check for anomalies
    if (r.instance.metrics.total >= 10) {
      const check = detectAnomaly(r.instance.metrics, stage.successThreshold);
      if (check.anomalous) {
        return { action: 'rollback', reason: `Success rate ${(check.successRate * 100).toFixed(1)}% below threshold ${stage.successThreshold * 100}%` };
      }
    }

    // Check if ready to advance
    if (elapsed >= stage.minDurationMs && r.instance.stageIndex < r.config.stages.length - 1) {
      if (r.instance.metrics.total >= 10) {
        const check = detectAnomaly(r.instance.metrics, stage.successThreshold);
        if (!check.anomalous) return { action: 'advance', reason: 'Metrics healthy, min duration elapsed' };
      }
    }

    // At final stage and healthy
    if (r.instance.stageIndex >= r.config.stages.length - 1 && elapsed >= stage.minDurationMs) {
      return { action: 'advance', reason: 'Final stage complete' };
    }

    return { action: 'hold', reason: 'Collecting metrics' };
  }

  function advance(rolloutId: string): RolloutInstance | null {
    const r = rollouts.get(rolloutId);
    if (!r || r.instance.status !== 'active') return null;

    const nextIdx = r.instance.stageIndex + 1;
    if (nextIdx >= r.config.stages.length) {
      // Complete
      r.instance.status = 'completed';
      r.instance.currentPercentage = 100;
      flagSet(r.config.feature, true, 100);
      r.instance.events.push({ type: 'rollout_completed', phase: r.instance.currentPhase, timestamp: Date.now() });
      completed.push(r.instance);
      return r.instance;
    }

    const nextStage = r.config.stages[nextIdx];
    const prevPhase = r.instance.currentPhase;
    r.instance.stageIndex = nextIdx;
    r.instance.currentPhase = nextStage.phase;
    r.instance.currentPercentage = nextStage.percentage;
    r.instance.phaseStartedAt = Date.now();
    r.instance.metrics = { success: 0, failure: 0, total: 0 };

    flagSet(r.config.feature, true, nextStage.percentage);
    r.instance.events.push({ type: 'phase_advanced', phase: nextStage.phase, timestamp: Date.now(), data: { from: prevPhase, percentage: nextStage.percentage } });
    r.config.onAdvance?.(prevPhase, nextStage.phase);

    return r.instance;
  }

  function rollback(rolloutId: string, reason: string): RolloutInstance | null {
    const r = rollouts.get(rolloutId);
    if (!r) return null;

    const prevPhase = r.instance.currentPhase;
    r.instance.status = 'rolled_back';
    r.instance.currentPhase = 'rolled_back';
    r.instance.currentPercentage = 0;
    flagSet(r.config.feature, false, 0);
    r.instance.events.push({ type: 'rollout_rolled_back', phase: 'rolled_back', timestamp: Date.now(), data: { from: prevPhase, reason } });
    r.config.onRollback?.(prevPhase, reason);
    completed.push(r.instance);

    return r.instance;
  }

  function tick(): Array<{ rolloutId: string; action: string; reason: string }> {
    const actions: Array<{ rolloutId: string; action: string; reason: string }> = [];
    for (const [id, r] of rollouts) {
      if (r.instance.status !== 'active') continue;
      const stage = r.config.stages[r.instance.stageIndex];
      if (!stage?.autoAdvance) continue;

      const evaluation = evaluate(id);
      if (evaluation.action === 'advance') { advance(id); actions.push({ rolloutId: id, action: 'advanced', reason: evaluation.reason }); }
      else if (evaluation.action === 'rollback') { rollback(id, evaluation.reason); actions.push({ rolloutId: id, action: 'rolled_back', reason: evaluation.reason }); }
    }
    return actions;
  }

  function isEnabled(feature: string, userId?: string): boolean { return flagEval(feature, userId); }

  function getStats(): DeliveryStats {
    const all = [...completed];
    const completedOk = all.filter(r => r.status === 'completed');
    const rolledBack = all.filter(r => r.status === 'rolled_back');
    const avgTime = completedOk.length > 0 ? completedOk.reduce((s, r) => s + (Date.now() - r.createdAt), 0) / completedOk.length : 0;

    return {
      activeRollouts: [...rollouts.values()].filter(r => r.instance.status === 'active').length,
      completedRollouts: completedOk.length,
      rolledBack: rolledBack.length,
      avgTimeToFullRollout: avgTime,
      rollbackRate: all.length > 0 ? rolledBack.length / all.length : 0,
    };
  }

  return { startRollout, recordMetric, evaluate, advance, rollback, tick, isEnabled, getStats };
}
