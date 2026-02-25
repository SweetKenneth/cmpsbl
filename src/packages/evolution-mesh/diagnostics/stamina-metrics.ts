/**
 * Evolution Mesh — Evolution Stamina Metrics
 * Tracks executor quality degradation over extended mutation sessions.
 * Detects fatigue patterns and recommends cooldowns.
 */

export interface StaminaCheckpoint {
  executorId: string;
  sessionId: string;
  checkpointIndex: number;
  mutationsCompleted: number;
  successRate: number;
  avgLatencyMs: number;
  repairRate: number;
  timestamp: number;
}

export interface StaminaSession {
  sessionId: string;
  executorId: string;
  startedAt: number;
  endedAt?: number;
  checkpoints: StaminaCheckpoint[];
  fatigueDetected: boolean;
  fatigueOnsetMutation?: number;
  recommendedCooldownMs?: number;
}

export interface StaminaReport {
  executorId: string;
  totalSessions: number;
  avgMutationsBeforeFatigue: number;
  fatigueRate: number;
  avgSessionDurationMs: number;
  bestStreakMutations: number;
  optimalSessionLength: number;
}

const staminaSessions: StaminaSession[] = [];
const MAX_SESSIONS = 500;
let staminaSessionCounter = 0;

const FATIGUE_INDICATORS = {
  successRateDropThreshold: 0.15,
  latencyIncreaseThreshold: 0.25,
  repairRateIncreaseThreshold: 0.20,
  minCheckpointsForDetection: 3,
};

/**
 * Start a stamina tracking session.
 */
export function startStaminaSession(executorId: string): StaminaSession {
  const session: StaminaSession = {
    sessionId: `stm_${++staminaSessionCounter}_${Date.now()}`,
    executorId,
    startedAt: Date.now(),
    checkpoints: [],
    fatigueDetected: false,
  };
  return session;
}

/**
 * Record a stamina checkpoint mid-session.
 */
export function recordCheckpoint(
  session: StaminaSession,
  mutationsCompleted: number,
  successRate: number,
  avgLatencyMs: number,
  repairRate: number,
): void {
  session.checkpoints.push({
    executorId: session.executorId,
    sessionId: session.sessionId,
    checkpointIndex: session.checkpoints.length,
    mutationsCompleted,
    successRate,
    avgLatencyMs,
    repairRate,
    timestamp: Date.now(),
  });

  // Check for fatigue
  if (session.checkpoints.length >= FATIGUE_INDICATORS.minCheckpointsForDetection) {
    detectFatigue(session);
  }
}

function detectFatigue(session: StaminaSession): void {
  const cps = session.checkpoints;
  if (cps.length < FATIGUE_INDICATORS.minCheckpointsForDetection) return;

  const baseline = cps[0];
  const latest = cps[cps.length - 1];

  const successDrop = baseline.successRate - latest.successRate;
  const latencyIncrease = baseline.avgLatencyMs > 0
    ? (latest.avgLatencyMs - baseline.avgLatencyMs) / baseline.avgLatencyMs
    : 0;
  const repairIncrease = latest.repairRate - baseline.repairRate;

  const fatigueSignals = [
    successDrop >= FATIGUE_INDICATORS.successRateDropThreshold,
    latencyIncrease >= FATIGUE_INDICATORS.latencyIncreaseThreshold,
    repairIncrease >= FATIGUE_INDICATORS.repairRateIncreaseThreshold,
  ].filter(Boolean).length;

  if (fatigueSignals >= 2 && !session.fatigueDetected) {
    session.fatigueDetected = true;
    session.fatigueOnsetMutation = latest.mutationsCompleted;

    // Recommend cooldown proportional to session length
    const sessionDuration = Date.now() - session.startedAt;
    session.recommendedCooldownMs = Math.min(
      6 * 60 * 60 * 1000, // Max 6 hours
      Math.round(sessionDuration * 0.25) // 25% of session duration
    );
  }
}

/**
 * End a stamina session and archive.
 */
export function endStaminaSession(session: StaminaSession): StaminaSession {
  session.endedAt = Date.now();

  staminaSessions.push(session);
  if (staminaSessions.length > MAX_SESSIONS) staminaSessions.splice(0, staminaSessions.length - MAX_SESSIONS);

  return session;
}

/**
 * Get stamina report for an executor.
 */
export function getStaminaReport(executorId: string): StaminaReport {
  const sessions = staminaSessions.filter(s => s.executorId === executorId);
  const fatigued = sessions.filter(s => s.fatigueDetected);

  const avgMutations = fatigued.length > 0
    ? fatigued.reduce((s, f) => s + (f.fatigueOnsetMutation ?? 0), 0) / fatigued.length
    : 0;

  const durations = sessions
    .filter(s => s.endedAt)
    .map(s => (s.endedAt! - s.startedAt));

  const bestStreak = sessions.reduce((max, s) => {
    const last = s.checkpoints[s.checkpoints.length - 1];
    return last ? Math.max(max, last.mutationsCompleted) : max;
  }, 0);

  // Optimal session length = avg mutations before fatigue onset, or max if no fatigue
  const optimalLength = avgMutations > 0 ? Math.floor(avgMutations * 0.8) : bestStreak;

  return {
    executorId,
    totalSessions: sessions.length,
    avgMutationsBeforeFatigue: Math.round(avgMutations),
    fatigueRate: sessions.length > 0 ? fatigued.length / sessions.length : 0,
    avgSessionDurationMs: durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0,
    bestStreakMutations: bestStreak,
    optimalSessionLength: optimalLength,
  };
}
