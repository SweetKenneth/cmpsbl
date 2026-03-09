/**
 * EVOLUTION CLM — Continuous Learning Module
 * Monitors cycle success rates, rollback frequency, duration anomalies,
 * and active cycle stalls for autonomous self-healing.
 */

export interface EvolutionCLMDiagnostic {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  message: string;
  metric?: number;
  threshold?: number;
  timestamp: number;
}

export interface EvolutionCLMReport {
  diagnostics: EvolutionCLMDiagnostic[];
  score: number;
  timestamp: number;
}

const THRESHOLDS = {
  /** Success rate below this triggers warning */
  LOW_SUCCESS_RATE: 60,
  /** Critical success rate */
  CRITICAL_SUCCESS_RATE: 30,
  /** Rollback ratio above this is concerning */
  HIGH_ROLLBACK_RATIO: 0.2,
  /** Active cycle running longer than this is stalled */
  STALL_DURATION_MS: 300_000, // 5 min
  /** Consecutive failures before critical alert */
  CONSECUTIVE_FAILURE_LIMIT: 3,
  /** Average cycle duration spike (ms) */
  DURATION_SPIKE_MS: 120_000, // 2 min avg
  /** Min cycles for meaningful metrics */
  MIN_SAMPLE_SIZE: 3,
  /** Max stored cycles capacity */
  CAPACITY_WARN: 80,
  CAPACITY_MAX: 100,
};

interface EvolutionStateShape {
  initialized: boolean;
  totalCycles: number;
  appliedCycles: number;
  failedCycles: number;
  rolledBackCycles: number;
  activeCycle: { startedAt: number; phase: string } | null;
  recentCycles: Array<{ phase: string; startedAt: number; completedAt: number | null }>;
  successRate: number;
  avgCycleDurationMs: number;
}

export function runEvolutionCLM(state: EvolutionStateShape): EvolutionCLMReport {
  const diagnostics: EvolutionCLMDiagnostic[] = [];
  let deductions = 0;

  if (!state.initialized) {
    diagnostics.push({ id: 'evo-not-init', severity: 'critical', category: 'lifecycle', message: 'EVOLUTION module not initialized', timestamp: Date.now() });
    return { diagnostics, score: 0, timestamp: Date.now() };
  }

  // 1. Success rate
  if (state.totalCycles >= THRESHOLDS.MIN_SAMPLE_SIZE) {
    if (state.successRate < THRESHOLDS.CRITICAL_SUCCESS_RATE) {
      diagnostics.push({ id: 'evo-critical-success', severity: 'critical', category: 'reliability', message: `Success rate ${state.successRate}% below critical threshold ${THRESHOLDS.CRITICAL_SUCCESS_RATE}%`, metric: state.successRate, threshold: THRESHOLDS.CRITICAL_SUCCESS_RATE, timestamp: Date.now() });
      deductions += 30;
    } else if (state.successRate < THRESHOLDS.LOW_SUCCESS_RATE) {
      diagnostics.push({ id: 'evo-low-success', severity: 'warning', category: 'reliability', message: `Success rate ${state.successRate}% below ${THRESHOLDS.LOW_SUCCESS_RATE}%`, metric: state.successRate, threshold: THRESHOLDS.LOW_SUCCESS_RATE, timestamp: Date.now() });
      deductions += 15;
    }
  }

  // 2. Rollback ratio
  if (state.totalCycles >= THRESHOLDS.MIN_SAMPLE_SIZE && state.rolledBackCycles > 0) {
    const rollbackRatio = state.rolledBackCycles / state.totalCycles;
    if (rollbackRatio >= THRESHOLDS.HIGH_ROLLBACK_RATIO) {
      diagnostics.push({ id: 'evo-high-rollback', severity: 'warning', category: 'stability', message: `${(rollbackRatio * 100).toFixed(0)}% of cycles rolled back`, metric: rollbackRatio, threshold: THRESHOLDS.HIGH_ROLLBACK_RATIO, timestamp: Date.now() });
      deductions += 10;
    }
  }

  // 3. Consecutive failures
  const recent = state.recentCycles.slice(-THRESHOLDS.CONSECUTIVE_FAILURE_LIMIT);
  if (recent.length >= THRESHOLDS.CONSECUTIVE_FAILURE_LIMIT && recent.every(c => c.phase === 'failed')) {
    diagnostics.push({ id: 'evo-consecutive-fail', severity: 'critical', category: 'reliability', message: `${THRESHOLDS.CONSECUTIVE_FAILURE_LIMIT} consecutive cycle failures`, metric: THRESHOLDS.CONSECUTIVE_FAILURE_LIMIT, timestamp: Date.now() });
    deductions += 20;
  }

  // 4. Active cycle stall
  if (state.activeCycle) {
    const elapsed = Date.now() - state.activeCycle.startedAt;
    if (elapsed > THRESHOLDS.STALL_DURATION_MS) {
      diagnostics.push({ id: 'evo-stall', severity: 'warning', category: 'performance', message: `Active cycle stalled for ${Math.round(elapsed / 1000)}s (phase: ${state.activeCycle.phase})`, metric: elapsed, threshold: THRESHOLDS.STALL_DURATION_MS, timestamp: Date.now() });
      deductions += 10;
    }
  }

  // 5. Average duration spike
  if (state.avgCycleDurationMs > THRESHOLDS.DURATION_SPIKE_MS && state.totalCycles >= THRESHOLDS.MIN_SAMPLE_SIZE) {
    diagnostics.push({ id: 'evo-slow-cycles', severity: 'info', category: 'performance', message: `Avg cycle duration ${Math.round(state.avgCycleDurationMs / 1000)}s exceeds ${THRESHOLDS.DURATION_SPIKE_MS / 1000}s`, metric: state.avgCycleDurationMs, threshold: THRESHOLDS.DURATION_SPIKE_MS, timestamp: Date.now() });
    deductions += 5;
  }

  // 6. Capacity
  if (state.totalCycles >= THRESHOLDS.CAPACITY_WARN) {
    const severity = state.totalCycles >= THRESHOLDS.CAPACITY_MAX ? 'critical' : 'warning';
    diagnostics.push({ id: 'evo-capacity', severity, category: 'capacity', message: `Cycle store at ${state.totalCycles}/${THRESHOLDS.CAPACITY_MAX}`, metric: state.totalCycles, threshold: THRESHOLDS.CAPACITY_MAX, timestamp: Date.now() });
    deductions += severity === 'critical' ? 10 : 5;
  }

  const score = Math.max(0, Math.min(100, 100 - deductions));
  return { diagnostics, score, timestamp: Date.now() };
}
