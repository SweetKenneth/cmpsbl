/**
 * Evolution Mesh — Micro-Feedback Loops
 * Step-by-step reasoning analysis for executor operations.
 * Captures granular decision points within a single mutation lifecycle.
 */

export type FeedbackSignal = 'positive' | 'negative' | 'neutral' | 'inconclusive';

export interface MicroStep {
  stepId: string;
  phase: string;
  description: string;
  signal: FeedbackSignal;
  durationMs: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export interface FeedbackSession {
  sessionId: string;
  executorId: string;
  mutationType: string;
  steps: MicroStep[];
  overallSignal: FeedbackSignal;
  startedAt: number;
  completedAt?: number;
  totalDurationMs?: number;
  insights: string[];
}

const feedbackSessions: FeedbackSession[] = [];
const MAX_SESSIONS = 2000;
let sessionCounter = 0;

/**
 * Start a new micro-feedback session.
 */
export function startFeedbackSession(executorId: string, mutationType: string): FeedbackSession {
  const session: FeedbackSession = {
    sessionId: `mfb_${++sessionCounter}_${Date.now()}`,
    executorId,
    mutationType,
    steps: [],
    overallSignal: 'neutral',
    startedAt: Date.now(),
    insights: [],
  };
  return session;
}

/**
 * Record a micro-step within a feedback session.
 */
export function recordStep(
  session: FeedbackSession,
  phase: string,
  description: string,
  signal: FeedbackSignal,
  durationMs: number,
  metadata?: Record<string, unknown>,
): void {
  session.steps.push({
    stepId: `step_${session.steps.length + 1}`,
    phase,
    description,
    signal,
    durationMs,
    metadata,
    timestamp: Date.now(),
  });
}

/**
 * Complete a feedback session and derive insights.
 */
export function completeFeedbackSession(session: FeedbackSession): FeedbackSession {
  session.completedAt = Date.now();
  session.totalDurationMs = session.completedAt - session.startedAt;

  // Derive overall signal
  const signals = session.steps.map(s => s.signal);
  const negCount = signals.filter(s => s === 'negative').length;
  const posCount = signals.filter(s => s === 'positive').length;

  if (negCount > signals.length * 0.3) session.overallSignal = 'negative';
  else if (posCount > signals.length * 0.6) session.overallSignal = 'positive';
  else if (negCount > 0 || posCount > 0) session.overallSignal = 'neutral';
  else session.overallSignal = 'inconclusive';

  // Generate insights
  session.insights = deriveInsights(session);

  feedbackSessions.push(session);
  if (feedbackSessions.length > MAX_SESSIONS) feedbackSessions.splice(0, feedbackSessions.length - MAX_SESSIONS);

  return session;
}

function deriveInsights(session: FeedbackSession): string[] {
  const insights: string[] = [];

  // Slowest step detection
  const slowest = [...session.steps].sort((a, b) => b.durationMs - a.durationMs)[0];
  if (slowest && slowest.durationMs > 500) {
    insights.push(`Bottleneck detected at "${slowest.phase}" (${slowest.durationMs}ms)`);
  }

  // Consecutive negative signals
  let consecutiveNeg = 0;
  let maxConsecutiveNeg = 0;
  for (const step of session.steps) {
    if (step.signal === 'negative') { consecutiveNeg++; maxConsecutiveNeg = Math.max(maxConsecutiveNeg, consecutiveNeg); }
    else consecutiveNeg = 0;
  }
  if (maxConsecutiveNeg >= 3) {
    insights.push(`${maxConsecutiveNeg} consecutive negative signals — possible cascade failure pattern`);
  }

  // Early failure detection
  if (session.steps.length >= 2 && session.steps[0].signal === 'negative') {
    insights.push('First step failed — possible input quality issue');
  }

  // Recovery pattern
  const negIdx = session.steps.findIndex(s => s.signal === 'negative');
  if (negIdx >= 0 && negIdx < session.steps.length - 1) {
    const afterNeg = session.steps.slice(negIdx + 1);
    if (afterNeg.every(s => s.signal === 'positive')) {
      insights.push('Recovery pattern detected — executor self-corrected after failure');
    }
  }

  return insights;
}

/**
 * Get feedback sessions for analysis.
 */
export function getFeedbackSessions(executorId?: string): FeedbackSession[] {
  return feedbackSessions
    .filter(s => !executorId || s.executorId === executorId)
    .slice(-100);
}

/**
 * Get aggregate feedback metrics.
 */
export function getFeedbackMetrics(executorId?: string): {
  totalSessions: number;
  positiveRate: number;
  negativeRate: number;
  avgStepsPerSession: number;
  avgDurationMs: number;
  commonBottlenecks: Array<{ phase: string; avgMs: number; count: number }>;
} {
  const sessions = feedbackSessions.filter(s => !executorId || s.executorId === executorId);

  const phaseTimings = new Map<string, { totalMs: number; count: number }>();
  for (const s of sessions) {
    for (const step of s.steps) {
      const existing = phaseTimings.get(step.phase) ?? { totalMs: 0, count: 0 };
      existing.totalMs += step.durationMs;
      existing.count++;
      phaseTimings.set(step.phase, existing);
    }
  }

  const bottlenecks = Array.from(phaseTimings.entries())
    .map(([phase, data]) => ({ phase, avgMs: Math.round(data.totalMs / data.count), count: data.count }))
    .sort((a, b) => b.avgMs - a.avgMs)
    .slice(0, 5);

  return {
    totalSessions: sessions.length,
    positiveRate: sessions.length > 0 ? sessions.filter(s => s.overallSignal === 'positive').length / sessions.length : 0,
    negativeRate: sessions.length > 0 ? sessions.filter(s => s.overallSignal === 'negative').length / sessions.length : 0,
    avgStepsPerSession: sessions.length > 0 ? Math.round(sessions.reduce((a, s) => a + s.steps.length, 0) / sessions.length) : 0,
    avgDurationMs: sessions.length > 0
      ? Math.round(sessions.filter(s => s.totalDurationMs).reduce((a, s) => a + (s.totalDurationMs ?? 0), 0) / sessions.length)
      : 0,
    commonBottlenecks: bottlenecks,
  };
}
