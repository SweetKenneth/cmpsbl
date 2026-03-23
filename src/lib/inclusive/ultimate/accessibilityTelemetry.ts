/**
 * INCLUSIVE Ultimate — System 10: Accessibility Telemetry & Learning Loop
 * 
 * Tracks scan→repair→validate cycles, learns which repair strategies work
 * for which issue patterns. Hebbian learning on fix→outcome edges.
 * 
 * @module inclusive/ultimate/accessibilityTelemetry
 */

// ── Types ────────────────────────────────────────────────────────

export type CyclePhase = 'scan' | 'classify' | 'repair' | 'validate' | 'report' | 'monitor';

export interface CycleEvent {
  cycleId: string;
  phase: CyclePhase;
  durationMs: number;
  success: boolean;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface CompleteCycle {
  id: string;
  target: string;
  events: CycleEvent[];
  totalDurationMs: number;
  issuesFound: number;
  issuesFixed: number;
  fixRate: number;
  success: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface FixPattern {
  issueType: string;
  repairStrategy: string;
  attempts: number;
  successes: number;
  successRate: number;  // EMA-weighted
  avgDurationMs: number;
  weight: number;       // Hebbian weight
  lastUsed: string;
}

export interface LearningSnapshot {
  timestamp: string;
  totalCycles: number;
  avgFixRate: number;
  topPatterns: FixPattern[];
  overallSuccessRate: number;
}

// ── State ────────────────────────────────────────────────────────

const cycles: Map<string, CompleteCycle> = new Map();
const fixPatterns: Map<string, FixPattern> = new Map();
const learningSnapshots: LearningSnapshot[] = [];
const MAX_CYCLES = 500;
const MAX_PATTERNS = 300;
const MAX_SNAPSHOTS = 100;
const EMA_ALPHA = 0.15;
const HEBBIAN_STRENGTHEN = 0.08;
const HEBBIAN_WEAKEN = 0.04;

// ── Hebbian Learning ─────────────────────────────────────────────

function patternKey(issueType: string, strategy: string): string {
  return `${issueType}::${strategy}`;
}

function updatePattern(issueType: string, strategy: string, success: boolean, durationMs: number): void {
  const key = patternKey(issueType, strategy);
  const existing = fixPatterns.get(key);

  if (existing) {
    existing.attempts++;
    if (success) existing.successes++;
    existing.successRate = existing.successRate * (1 - EMA_ALPHA) + (success ? 1 : 0) * EMA_ALPHA;
    existing.avgDurationMs = existing.avgDurationMs * 0.8 + durationMs * 0.2;
    existing.weight = success
      ? Math.min(1, existing.weight + HEBBIAN_STRENGTHEN * (1 - existing.weight))
      : Math.max(0.01, existing.weight - HEBBIAN_WEAKEN);
    existing.lastUsed = new Date().toISOString();
  } else {
    fixPatterns.set(key, {
      issueType,
      repairStrategy: strategy,
      attempts: 1,
      successes: success ? 1 : 0,
      successRate: success ? 0.85 : 0.15,
      avgDurationMs: durationMs,
      weight: 0.5,
      lastUsed: new Date().toISOString(),
    });
    if (fixPatterns.size > MAX_PATTERNS) {
      // Evict lowest weight
      let minKey = '';
      let minWeight = Infinity;
      for (const [k, v] of fixPatterns) {
        if (v.weight < minWeight) { minWeight = v.weight; minKey = k; }
      }
      if (minKey) fixPatterns.delete(minKey);
    }
  }
}

// ── Core API ────────────────────────────────────────────────────

/** Begin tracking a scan→repair→validate cycle */
export function beginCycle(target: string): string {
  const cycleId = crypto.randomUUID();
  const cycle: CompleteCycle = {
    id: cycleId,
    target,
    events: [],
    totalDurationMs: 0,
    issuesFound: 0,
    issuesFixed: 0,
    fixRate: 0,
    success: false,
    startedAt: new Date().toISOString(),
  };

  cycles.set(cycleId, cycle);
  if (cycles.size > MAX_CYCLES) {
    const oldest = cycles.keys().next().value;
    if (oldest) cycles.delete(oldest);
  }

  return cycleId;
}

/** Record a phase in a cycle */
export function recordCyclePhase(
  cycleId: string,
  phase: CyclePhase,
  durationMs: number,
  success: boolean,
  metadata?: Record<string, unknown>,
): void {
  const cycle = cycles.get(cycleId);
  if (!cycle) return;

  cycle.events.push({
    cycleId,
    phase,
    durationMs,
    success,
    metadata,
    timestamp: new Date().toISOString(),
  });

  cycle.totalDurationMs += durationMs;

  if (phase === 'scan' && metadata?.issuesFound !== undefined) {
    cycle.issuesFound = metadata.issuesFound as number;
  }
  if (phase === 'repair' && metadata?.issuesFixed !== undefined) {
    cycle.issuesFixed = metadata.issuesFixed as number;
    cycle.fixRate = cycle.issuesFound > 0
      ? Math.round((cycle.issuesFixed / cycle.issuesFound) * 100) / 100
      : 1;
  }
  if (phase === 'validate') {
    cycle.success = success;
    cycle.completedAt = new Date().toISOString();
  }
}

/** Record a fix outcome for learning */
export function recordFixOutcome(issueType: string, strategy: string, success: boolean, durationMs: number): void {
  updatePattern(issueType, strategy, success, durationMs);
}

/** Get the best repair strategy for an issue type */
export function getBestStrategy(issueType: string): { strategy: string; confidence: number } | null {
  const candidates: FixPattern[] = [];
  for (const pattern of fixPatterns.values()) {
    if (pattern.issueType === issueType) {
      candidates.push(pattern);
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.weight - a.weight);
  return {
    strategy: candidates[0].repairStrategy,
    confidence: candidates[0].weight,
  };
}

/** Generate a learning snapshot */
export function generateLearningSnapshot(): LearningSnapshot {
  const allCycles = Array.from(cycles.values());
  const completedCycles = allCycles.filter(c => c.completedAt);
  const avgFixRate = completedCycles.length > 0
    ? Math.round((completedCycles.reduce((s, c) => s + c.fixRate, 0) / completedCycles.length) * 100) / 100
    : 0;

  const topPatterns = Array.from(fixPatterns.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);

  const successCount = completedCycles.filter(c => c.success).length;

  const snapshot: LearningSnapshot = {
    timestamp: new Date().toISOString(),
    totalCycles: allCycles.length,
    avgFixRate,
    topPatterns,
    overallSuccessRate: completedCycles.length > 0
      ? Math.round((successCount / completedCycles.length) * 100)
      : 100,
  };

  learningSnapshots.push(snapshot);
  if (learningSnapshots.length > MAX_SNAPSHOTS) learningSnapshots.splice(0, learningSnapshots.length - MAX_SNAPSHOTS);

  return snapshot;
}

/** Get telemetry health */
export function getAccessibilityTelemetryHealth() {
  const allCycles = Array.from(cycles.values());
  const completed = allCycles.filter(c => c.completedAt);

  return {
    totalCycles: allCycles.length,
    activeCycles: allCycles.filter(c => !c.completedAt).length,
    learnedPatterns: fixPatterns.size,
    strongPatterns: Array.from(fixPatterns.values()).filter(p => p.weight > 0.7).length,
    overallSuccessRate: completed.length > 0
      ? Math.round((completed.filter(c => c.success).length / completed.length) * 100)
      : 100,
    snapshotCount: learningSnapshots.length,
  };
}

/** Reset */
export function resetAccessibilityTelemetry(): void {
  cycles.clear();
  fixPatterns.clear();
  learningSnapshots.length = 0;
}
