/**
 * Evolution Mesh — Rollback Drills
 * Structured practice sessions for executors to rehearse rollback operations.
 * Builds muscle memory for high-pressure revert scenarios.
 */

export interface RollbackScenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Simulated modules affected */
  modulesAffected: number;
  /** Whether partial state corruption is simulated */
  partialCorruption: boolean;
  /** Time pressure in ms (0 = no pressure) */
  timePressureMs: number;
}

export interface DrillAttempt {
  scenarioId: string;
  executorId: string;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  success: boolean;
  stepsCompleted: string[];
  errors: string[];
  withinTimePressure: boolean;
}

export interface DrillStats {
  totalDrills: number;
  successRate: number;
  avgDurationMs: number;
  fastestDrillMs: number;
  timePressureSuccessRate: number;
  byDifficulty: Record<string, { attempts: number; successes: number }>;
}

const ROLLBACK_SCENARIOS: RollbackScenario[] = [
  {
    id: 'rb_single_prompt',
    name: 'Single Prompt Revert',
    description: 'Revert a system prompt change that caused quality degradation.',
    difficulty: 'easy',
    modulesAffected: 1,
    partialCorruption: false,
    timePressureMs: 0,
  },
  {
    id: 'rb_routing_weight',
    name: 'Routing Weight Rollback',
    description: 'Revert provider weight changes causing latency spikes.',
    difficulty: 'easy',
    modulesAffected: 2,
    partialCorruption: false,
    timePressureMs: 30000,
  },
  {
    id: 'rb_memory_decay',
    name: 'Memory Decay Correction',
    description: 'Revert memory strategy change causing premature context loss.',
    difficulty: 'medium',
    modulesAffected: 3,
    partialCorruption: false,
    timePressureMs: 20000,
  },
  {
    id: 'rb_defense_rule',
    name: 'Defense Rule Revert',
    description: 'Revert a defense rule that is blocking legitimate traffic.',
    difficulty: 'medium',
    modulesAffected: 4,
    partialCorruption: true,
    timePressureMs: 15000,
  },
  {
    id: 'rb_pipeline_cascade',
    name: 'Pipeline Cascade Failure',
    description: 'Full pipeline rollback after cascading failure across modules.',
    difficulty: 'hard',
    modulesAffected: 8,
    partialCorruption: true,
    timePressureMs: 10000,
  },
  {
    id: 'rb_multi_evolution',
    name: 'Multi-Evolution Stack Unwind',
    description: 'Unwind 3 stacked evolutions to restore stable baseline.',
    difficulty: 'hard',
    modulesAffected: 12,
    partialCorruption: true,
    timePressureMs: 8000,
  },
];

const drillHistory: DrillAttempt[] = [];
const MAX_HISTORY = 1000;

/**
 * Start a rollback drill.
 */
export function startDrill(scenarioId: string, executorId: string): DrillAttempt | null {
  const scenario = ROLLBACK_SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return null;

  const attempt: DrillAttempt = {
    scenarioId,
    executorId,
    startedAt: Date.now(),
    success: false,
    stepsCompleted: [],
    errors: [],
    withinTimePressure: false,
  };

  return attempt;
}

/**
 * Complete a drill attempt.
 */
export function completeDrill(
  attempt: DrillAttempt,
  stepsCompleted: string[],
  success: boolean,
  errors: string[] = [],
): DrillAttempt {
  const scenario = ROLLBACK_SCENARIOS.find(s => s.id === attempt.scenarioId);
  attempt.completedAt = Date.now();
  attempt.durationMs = attempt.completedAt - attempt.startedAt;
  attempt.success = success;
  attempt.stepsCompleted = stepsCompleted;
  attempt.errors = errors;
  attempt.withinTimePressure = scenario
    ? scenario.timePressureMs === 0 || (attempt.durationMs ?? Infinity) <= scenario.timePressureMs
    : false;

  drillHistory.push(attempt);
  if (drillHistory.length > MAX_HISTORY) drillHistory.splice(0, drillHistory.length - MAX_HISTORY);

  return attempt;
}

/**
 * Get drill statistics for an executor.
 */
export function getDrillStats(executorId?: string): DrillStats {
  const relevant = drillHistory.filter(d => !executorId || d.executorId === executorId);
  const successes = relevant.filter(d => d.success);
  const durations = relevant.filter(d => d.durationMs != null).map(d => d.durationMs!);
  const timePressure = relevant.filter(d => {
    const scenario = ROLLBACK_SCENARIOS.find(s => s.id === d.scenarioId);
    return scenario && scenario.timePressureMs > 0;
  });
  const timePressureSuccesses = timePressure.filter(d => d.withinTimePressure && d.success);

  const byDifficulty: Record<string, { attempts: number; successes: number }> = {};
  for (const d of relevant) {
    const scenario = ROLLBACK_SCENARIOS.find(s => s.id === d.scenarioId);
    const diff = scenario?.difficulty ?? 'unknown';
    if (!byDifficulty[diff]) byDifficulty[diff] = { attempts: 0, successes: 0 };
    byDifficulty[diff].attempts++;
    if (d.success) byDifficulty[diff].successes++;
  }

  return {
    totalDrills: relevant.length,
    successRate: relevant.length > 0 ? successes.length / relevant.length : 0,
    avgDurationMs: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
    fastestDrillMs: durations.length > 0 ? Math.min(...durations) : 0,
    timePressureSuccessRate: timePressure.length > 0 ? timePressureSuccesses.length / timePressure.length : 0,
    byDifficulty,
  };
}

/**
 * Get all available rollback scenarios.
 */
export function getRollbackScenarios(): RollbackScenario[] {
  return [...ROLLBACK_SCENARIOS];
}
