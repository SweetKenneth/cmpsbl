/**
 * Evolution Mesh — Warm-Up Sequences
 * Pre-mutation warm-up routines to prime executors before high-stakes operations.
 * Runs lightweight validation passes to ensure executor readiness.
 */

export type WarmUpPhase = 'schema_check' | 'repair_check' | 'shadow_dry_run' | 'rollback_verify';

export interface WarmUpStep {
  phase: WarmUpPhase;
  label: string;
  description: string;
  required: boolean;
  timeoutMs: number;
}

export interface WarmUpResult {
  executorId: string;
  steps: Array<{
    phase: WarmUpPhase;
    passed: boolean;
    durationMs: number;
    error?: string;
  }>;
  allPassed: boolean;
  totalDurationMs: number;
  readyForMutation: boolean;
  timestamp: number;
}

const WARMUP_SEQUENCE: WarmUpStep[] = [
  {
    phase: 'schema_check',
    label: 'Schema Validation',
    description: 'Verify executor can parse and validate input schemas',
    required: true,
    timeoutMs: 1000,
  },
  {
    phase: 'repair_check',
    label: 'Repair Engine',
    description: 'Confirm deterministic repair strategies are loaded',
    required: true,
    timeoutMs: 1000,
  },
  {
    phase: 'shadow_dry_run',
    label: 'Shadow Dry Run',
    description: 'Execute a no-op shadow pass to verify pipeline connectivity',
    required: false,
    timeoutMs: 2000,
  },
  {
    phase: 'rollback_verify',
    label: 'Rollback Readiness',
    description: 'Confirm rollback snapshot capability is available',
    required: true,
    timeoutMs: 500,
  },
];

const warmUpHistory: WarmUpResult[] = [];
const MAX_HISTORY = 500;

export type WarmUpCheck = (phase: WarmUpPhase) => Promise<boolean>;

/**
 * Run warm-up sequence for an executor before mutation.
 */
export async function runWarmUp(
  executorId: string,
  checker: WarmUpCheck,
): Promise<WarmUpResult> {
  const steps: WarmUpResult['steps'] = [];
  const totalStart = performance.now();

  for (const step of WARMUP_SEQUENCE) {
    const stepStart = performance.now();
    try {
      const passed = await Promise.race([
        checker(step.phase),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), step.timeoutMs)
        ),
      ]);
      steps.push({
        phase: step.phase,
        passed,
        durationMs: Math.round(performance.now() - stepStart),
      });
    } catch (err) {
      steps.push({
        phase: step.phase,
        passed: false,
        durationMs: Math.round(performance.now() - stepStart),
        error: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  const requiredPassed = WARMUP_SEQUENCE
    .filter(s => s.required)
    .every(s => steps.find(r => r.phase === s.phase)?.passed === true);

  const result: WarmUpResult = {
    executorId,
    steps,
    allPassed: steps.every(s => s.passed),
    totalDurationMs: Math.round(performance.now() - totalStart),
    readyForMutation: requiredPassed,
    timestamp: Date.now(),
  };

  warmUpHistory.push(result);
  if (warmUpHistory.length > MAX_HISTORY) warmUpHistory.splice(0, warmUpHistory.length - MAX_HISTORY);

  return result;
}

/**
 * Get warm-up history for an executor.
 */
export function getWarmUpHistory(executorId?: string): WarmUpResult[] {
  return warmUpHistory
    .filter(r => !executorId || r.executorId === executorId)
    .slice(-50);
}

/**
 * Get the warm-up sequence definition.
 */
export function getWarmUpSequence(): WarmUpStep[] {
  return [...WARMUP_SEQUENCE];
}
