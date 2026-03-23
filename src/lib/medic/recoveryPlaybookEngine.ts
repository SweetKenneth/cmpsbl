/**
 * MEDIC — Recovery Playbook Engine
 * Parameterized recovery procedures with conditional branching.
 * Playbooks selected by matching symptom fingerprints to historical success.
 * @module medic/recoveryPlaybookEngine
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type PlaybookAction =
  | 'restart'
  | 'cache_flush'
  | 'breaker_reset'
  | 'rollback'
  | 'quarantine'
  | 'scale_up'
  | 'drain'
  | 'failover';

export interface PlaybookStep {
  action: PlaybookAction;
  targetNodeId: string;
  params: Record<string, unknown>;
  condition?: (ctx: PlaybookContext) => boolean;
  timeoutMs: number;
}

export interface Playbook {
  id: string;
  name: string;
  symptomFingerprints: string[];
  steps: PlaybookStep[];
  priority: number;
  successRate: number;
  attempts: number;
}

export interface PlaybookContext {
  nodeId: string;
  symptom: string;
  healthScore: number;
  previousAttempts: number;
  metadata: Record<string, unknown>;
}

export interface PlaybookExecution {
  playbookId: string;
  stepsExecuted: number;
  stepsSkipped: number;
  success: boolean;
  durationMs: number;
  actions: PlaybookAction[];
}

// ── Constants ──────────────────────────────────────────────────────────────

const EMA_ALPHA = 0.3;

// ── State ──────────────────────────────────────────────────────────────────

const playbookRegistry = new Map<string, Playbook>();
const executionLog: PlaybookExecution[] = [];

// ── Built-in Playbooks ────────────────────────────────────────────────────

const BUILT_IN_PLAYBOOKS: Omit<Playbook, 'successRate' | 'attempts'>[] = [
  {
    id: 'pb-restart-degraded',
    name: 'Restart Degraded Node',
    symptomFingerprints: ['health_degraded', 'slow_response', 'memory_pressure'],
    priority: 5,
    steps: [
      { action: 'drain', targetNodeId: '$nodeId', params: {}, timeoutMs: 5000 },
      { action: 'restart', targetNodeId: '$nodeId', params: { graceful: true }, timeoutMs: 10000 },
    ],
  },
  {
    id: 'pb-breaker-cascade',
    name: 'Reset Circuit Breaker Cascade',
    symptomFingerprints: ['breaker_open', 'cascade_failure', 'timeout_spike'],
    priority: 8,
    steps: [
      { action: 'cache_flush', targetNodeId: '$nodeId', params: { scope: 'stale' }, timeoutMs: 3000 },
      { action: 'breaker_reset', targetNodeId: '$nodeId', params: {}, timeoutMs: 2000 },
      {
        action: 'scale_up', targetNodeId: '$nodeId', params: { factor: 1.5 },
        condition: (ctx) => ctx.healthScore < 40,
        timeoutMs: 8000,
      },
    ],
  },
  {
    id: 'pb-quarantine-critical',
    name: 'Quarantine Critical Node',
    symptomFingerprints: ['unresponsive', 'data_corruption', 'security_breach'],
    priority: 10,
    steps: [
      { action: 'quarantine', targetNodeId: '$nodeId', params: { isolate: true }, timeoutMs: 2000 },
      { action: 'failover', targetNodeId: '$nodeId', params: {}, timeoutMs: 5000 },
      { action: 'rollback', targetNodeId: '$nodeId', params: { toLastKnownGood: true }, timeoutMs: 15000 },
    ],
  },
];

// ── Core ───────────────────────────────────────────────────────────────────

export function initializePlaybooks(): void {
  for (const pb of BUILT_IN_PLAYBOOKS) {
    if (!playbookRegistry.has(pb.id)) {
      playbookRegistry.set(pb.id, { ...pb, successRate: 0.5, attempts: 0 });
    }
  }
}

export function registerPlaybook(playbook: Playbook): void {
  playbookRegistry.set(playbook.id, playbook);
}

export function selectPlaybook(symptomFingerprint: string): Playbook | null {
  const candidates = Array.from(playbookRegistry.values())
    .filter(pb => pb.symptomFingerprints.includes(symptomFingerprint))
    .sort((a, b) => {
      // Sort by priority * success rate (weighted selection)
      const scoreA = a.priority * (0.5 + a.successRate * 0.5);
      const scoreB = b.priority * (0.5 + b.successRate * 0.5);
      return scoreB - scoreA;
    });

  return candidates[0] ?? null;
}

export function executePlaybook(playbook: Playbook, ctx: PlaybookContext): PlaybookExecution {
  const start = performance.now();
  const actions: PlaybookAction[] = [];
  let stepsExecuted = 0;
  let stepsSkipped = 0;

  for (const step of playbook.steps) {
    if (step.condition && !step.condition(ctx)) {
      stepsSkipped++;
      continue;
    }
    actions.push(step.action);
    stepsExecuted++;
  }

  const success = stepsExecuted > 0;
  const execution: PlaybookExecution = {
    playbookId: playbook.id,
    stepsExecuted,
    stepsSkipped,
    success,
    durationMs: Math.round(performance.now() - start),
    actions,
  };

  executionLog.push(execution);

  // Update success rate with EMA
  playbook.attempts++;
  playbook.successRate = EMA_ALPHA * (success ? 1 : 0) + (1 - EMA_ALPHA) * playbook.successRate;

  return execution;
}

export function getPlaybooks(): Playbook[] {
  return Array.from(playbookRegistry.values());
}

export function getExecutionLog(): PlaybookExecution[] {
  return [...executionLog];
}

export function resetPlaybooks(): void {
  playbookRegistry.clear();
  executionLog.length = 0;
}
