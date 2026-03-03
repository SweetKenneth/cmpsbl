/**
 * Module State Machine & Self-Repair — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Formal phase transitions with heartbeat monitoring,
 * error windowing, and auto-heal recovery.
 * 
 * Consumers: NERVE, ENGINEER, EVOLUTION, SHADOW, PHANTOM, IMMUNITY,
 *            MEDIC, RELAY, BRAIN
 * Origin: orchestrator-v3.ts
 */

// ── Types ─────────────────────────────────────────────────────────

export type ModulePhase =
  | 'idle'
  | 'initializing'
  | 'processing'
  | 'reflecting'
  | 'recovering'
  | 'degraded'
  | 'shutdown';

export interface PhaseTransition {
  from: ModulePhase | ModulePhase[];
  to: ModulePhase;
  event: string;
  guard?: (state: ModuleState) => boolean;
  onTransition?: (state: ModuleState) => void;
}

export interface ModuleState {
  phase: ModulePhase;
  module: string;
  healthScore: number;
  errorWindow: ErrorEvent[];
  lastHeartbeat: number;
  uptime: number;
  startedAt: number;
  transitionHistory: Array<{ from: ModulePhase; to: ModulePhase; event: string; at: number }>;
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  metadata: Record<string, unknown>;
}

export interface ErrorEvent {
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface HeartbeatConfig {
  intervalMs: number;
  timeoutMs: number;
  onMissed: (state: ModuleState) => void;
}

export interface SelfRepairConfig {
  /** Window size for error rate calculation (ms) */
  errorWindowMs: number;
  /** Max errors in window before triggering recovery */
  maxErrorsInWindow: number;
  /** Max consecutive recovery attempts */
  maxRecoveryAttempts: number;
  /** Cooldown between recovery attempts (ms) */
  recoveryCooldownMs: number;
  /** Callback for auto-heal actions */
  onAutoHeal?: (state: ModuleState) => Promise<boolean>;
  /** Callback when recovery is exhausted */
  onRecoveryExhausted?: (state: ModuleState) => void;
}

// ── Default Transitions ───────────────────────────────────────────

export const STANDARD_TRANSITIONS: PhaseTransition[] = [
  { from: 'idle', to: 'initializing', event: 'BOOT' },
  { from: 'initializing', to: 'processing', event: 'READY' },
  { from: 'processing', to: 'reflecting', event: 'REFLECT' },
  { from: 'reflecting', to: 'processing', event: 'RESUME' },
  { from: 'processing', to: 'recovering', event: 'ERROR',
    guard: (s) => s.recoveryAttempts < s.maxRecoveryAttempts },
  { from: 'recovering', to: 'processing', event: 'HEALED' },
  { from: 'recovering', to: 'degraded', event: 'RECOVERY_FAILED',
    guard: (s) => s.recoveryAttempts >= s.maxRecoveryAttempts },
  { from: 'degraded', to: 'recovering', event: 'RETRY',
    guard: (s) => s.recoveryAttempts < s.maxRecoveryAttempts },
  { from: ['processing', 'reflecting', 'degraded'], to: 'shutdown', event: 'SHUTDOWN' },
  { from: 'shutdown', to: 'idle', event: 'RESET' },
  { from: 'idle', to: 'idle', event: 'NOOP' },
];

// ── Module State Machine ──────────────────────────────────────────

export function createModuleStateMachine(
  moduleName: string,
  transitions: PhaseTransition[] = STANDARD_TRANSITIONS,
  repairConfig: SelfRepairConfig = {
    errorWindowMs: 120_000,
    maxErrorsInWindow: 5,
    maxRecoveryAttempts: 3,
    recoveryCooldownMs: 10_000,
  }
) {
  const state: ModuleState = {
    phase: 'idle',
    module: moduleName,
    healthScore: 100,
    errorWindow: [],
    lastHeartbeat: Date.now(),
    uptime: 0,
    startedAt: Date.now(),
    transitionHistory: [],
    recoveryAttempts: 0,
    maxRecoveryAttempts: repairConfig.maxRecoveryAttempts,
    metadata: {},
  };

  const listeners = new Set<(phase: ModulePhase, state: ModuleState) => void>();
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  // ── Send Event ────────────────────────────────────────────────

  function send(event: string): boolean {
    const candidates = transitions.filter(t => {
      const froms = Array.isArray(t.from) ? t.from : [t.from];
      return froms.includes(state.phase) && t.event === event;
    });

    for (const t of candidates) {
      if (t.guard && !t.guard(state)) continue;

      const from = state.phase;
      state.phase = t.to;
      state.transitionHistory.push({ from, to: t.to, event, at: Date.now() });
      if (state.transitionHistory.length > 50) {
        state.transitionHistory.splice(0, state.transitionHistory.length - 50);
      }

      t.onTransition?.(state);
      listeners.forEach(fn => fn(state.phase, state));
      return true;
    }
    return false;
  }

  // ── Error Tracking ────────────────────────────────────────────

  function recordError(message: string, severity: ErrorEvent['severity'] = 'medium'): void {
    const now = Date.now();
    state.errorWindow.push({ message, severity, timestamp: now });

    // Prune old errors outside window
    state.errorWindow = state.errorWindow.filter(
      e => now - e.timestamp < repairConfig.errorWindowMs
    );

    // Update health score
    const errorWeight = { low: 2, medium: 5, high: 15, critical: 30 };
    const totalPenalty = state.errorWindow.reduce(
      (sum, e) => sum + errorWeight[e.severity], 0
    );
    state.healthScore = Math.max(0, 100 - totalPenalty);

    // Check if auto-recovery should trigger
    if (state.errorWindow.length >= repairConfig.maxErrorsInWindow) {
      triggerRecovery();
    }
  }

  async function triggerRecovery(): Promise<void> {
    if (state.phase === 'recovering') return;
    if (state.recoveryAttempts >= repairConfig.maxRecoveryAttempts) {
      send('RECOVERY_FAILED');
      repairConfig.onRecoveryExhausted?.(state);
      return;
    }

    state.recoveryAttempts++;
    send('ERROR');

    if (repairConfig.onAutoHeal) {
      const healed = await repairConfig.onAutoHeal(state);
      if (healed) {
        state.recoveryAttempts = 0;
        state.errorWindow = [];
        state.healthScore = Math.min(100, state.healthScore + 30);
        send('HEALED');
      } else {
        send('RECOVERY_FAILED');
      }
    }
  }

  // ── Heartbeat ─────────────────────────────────────────────────

  function startHeartbeat(config: HeartbeatConfig): void {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      const now = Date.now();
      state.lastHeartbeat = now;
      state.uptime = now - state.startedAt;

      // Check for missed heartbeats
      if (now - state.lastHeartbeat > config.timeoutMs) {
        config.onMissed(state);
        recordError('Heartbeat timeout', 'high');
      }
    }, config.intervalMs);
  }

  function stopHeartbeat(): void {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function pulse(): void {
    state.lastHeartbeat = Date.now();
  }

  // ── Queries ───────────────────────────────────────────────────

  function getState(): Readonly<ModuleState> { return { ...state }; }
  function getPhase(): ModulePhase { return state.phase; }
  function isHealthy(): boolean { return state.healthScore > 60; }
  function canAccept(event: string): boolean {
    return transitions.some(t => {
      const froms = Array.isArray(t.from) ? t.from : [t.from];
      return froms.includes(state.phase) && t.event === event &&
        (!t.guard || t.guard(state));
    });
  }

  function subscribe(fn: (phase: ModulePhase, state: ModuleState) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function reset(): void {
    state.phase = 'idle';
    state.healthScore = 100;
    state.errorWindow = [];
    state.recoveryAttempts = 0;
    state.transitionHistory = [];
    state.startedAt = Date.now();
    state.uptime = 0;
    stopHeartbeat();
  }

  return {
    send,
    recordError,
    startHeartbeat,
    stopHeartbeat,
    pulse,
    getState,
    getPhase,
    isHealthy,
    canAccept,
    subscribe,
    reset,
  };
}

export type ModuleStateMachine = ReturnType<typeof createModuleStateMachine>;
