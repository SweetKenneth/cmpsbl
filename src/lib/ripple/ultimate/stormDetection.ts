/**
 * RIPPLE Cascade Storm Detection — v9.0.0 "Tsunami"
 * 
 * Monitors event velocity per topic — if rate exceeds 10x baseline in 1s window,
 * triggers storm alert. Auto-throttles runaway publishers. Integrates with
 * NERVE cascade depth tracking.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type StormSeverity = 'watch' | 'warning' | 'storm' | 'critical';

export interface StormAlert {
  id: string;
  topic: string;
  severity: StormSeverity;
  currentRate: number;     // events/sec
  baselineRate: number;    // events/sec
  multiplier: number;      // currentRate / baselineRate
  startedAt: string;
  resolvedAt: string | null;
  throttleApplied: boolean;
  affectedPublishers: string[];
}

export interface TopicVelocity {
  topic: string;
  windowCounts: number[];  // sliding window buckets (1s each)
  currentRate: number;
  baselineRate: number;    // EMA baseline
  peakRate: number;
  isThrottled: boolean;
  throttleUntil: number;
}

export interface StormDetectionStats {
  monitoredTopics: number;
  activeAlerts: number;
  totalAlertsTriggered: number;
  totalThrottlesApplied: number;
  topStormTopics: Array<{ topic: string; count: number }>;
  systemVelocity: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const WINDOW_BUCKETS = 10;              // 10 x 1s buckets = 10s window
const BUCKET_MS = 1000;
const WATCH_MULTIPLIER = 3;             // 3x baseline
const WARNING_MULTIPLIER = 5;           // 5x
const STORM_MULTIPLIER = 10;            // 10x
const CRITICAL_MULTIPLIER = 25;         // 25x
const THROTTLE_DURATION_MS = 10000;     // 10s throttle
const BASELINE_EMA_ALPHA = 0.05;        // Slow-moving baseline
const MAX_ALERTS = 500;
const MAX_TOPICS = 1000;

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const velocities = new Map<string, TopicVelocity>();
const activeAlerts = new Map<string, StormAlert>();
const alertHistory: StormAlert[] = [];
let totalAlertsTriggered = 0;
let totalThrottles = 0;
let lastTickMs = Date.now();

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Record an event for a topic. Call on every publish. */
export function recordEvent(topic: string, source: string): void {
  const vel = getOrCreateVelocity(topic);
  tickBuckets(vel);

  // Increment current bucket
  vel.windowCounts[vel.windowCounts.length - 1]++;

  // Recalculate current rate
  vel.currentRate = vel.windowCounts.reduce((s, c) => s + c, 0) / WINDOW_BUCKETS;

  // Update baseline (only when not storming)
  if (!activeAlerts.has(topic)) {
    if (vel.baselineRate === 0) {
      vel.baselineRate = vel.currentRate;
    } else {
      vel.baselineRate = BASELINE_EMA_ALPHA * vel.currentRate + (1 - BASELINE_EMA_ALPHA) * vel.baselineRate;
    }
  }

  // Peak tracking
  vel.peakRate = Math.max(vel.peakRate, vel.currentRate);

  // Check storm conditions
  evaluateStorm(topic, vel, source);
}

/** Check if a topic is currently throttled. */
export function isThrottled(topic: string): boolean {
  const vel = velocities.get(topic);
  if (!vel) return false;
  if (!vel.isThrottled) return false;
  if (Date.now() > vel.throttleUntil) {
    vel.isThrottled = false;
    return false;
  }
  return true;
}

/** Manually throttle a topic. */
export function throttleTopic(topic: string, durationMs: number = THROTTLE_DURATION_MS): void {
  const vel = getOrCreateVelocity(topic);
  vel.isThrottled = true;
  vel.throttleUntil = Date.now() + durationMs;
  totalThrottles++;
}

/** Manually release throttle on a topic. */
export function releaseThrottle(topic: string): void {
  const vel = velocities.get(topic);
  if (vel) {
    vel.isThrottled = false;
    vel.throttleUntil = 0;
  }
}

/** Resolve an active alert. */
export function resolveAlert(alertId: string): boolean {
  for (const [topic, alert] of activeAlerts.entries()) {
    if (alert.id === alertId) {
      alert.resolvedAt = new Date().toISOString();
      activeAlerts.delete(topic);
      return true;
    }
  }
  return false;
}

/** Tick: advance sliding windows for all topics. Call periodically. */
export function tickAll(): void {
  for (const vel of velocities.values()) {
    tickBuckets(vel);
    vel.currentRate = vel.windowCounts.reduce((s, c) => s + c, 0) / WINDOW_BUCKETS;
  }

  // Auto-resolve alerts where rate has dropped
  for (const [topic, alert] of activeAlerts.entries()) {
    const vel = velocities.get(topic);
    if (!vel) continue;
    const multiplier = vel.baselineRate > 0 ? vel.currentRate / vel.baselineRate : 0;
    if (multiplier < WATCH_MULTIPLIER) {
      alert.resolvedAt = new Date().toISOString();
      activeAlerts.delete(topic);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNALS
// ═══════════════════════════════════════════════════════════════════════════════

function getOrCreateVelocity(topic: string): TopicVelocity {
  let vel = velocities.get(topic);
  if (!vel) {
    if (velocities.size >= MAX_TOPICS) {
      // Evict lowest-rate topic
      const lowest = Array.from(velocities.entries())
        .sort(([, a], [, b]) => a.currentRate - b.currentRate)[0];
      if (lowest) velocities.delete(lowest[0]);
    }

    vel = {
      topic,
      windowCounts: new Array(WINDOW_BUCKETS).fill(0),
      currentRate: 0,
      baselineRate: 0,
      peakRate: 0,
      isThrottled: false,
      throttleUntil: 0,
    };
    velocities.set(topic, vel);
  }
  return vel;
}

function tickBuckets(vel: TopicVelocity): void {
  const now = Date.now();
  const elapsed = now - lastTickMs;
  const bucketsToAdvance = Math.min(Math.floor(elapsed / BUCKET_MS), WINDOW_BUCKETS);

  if (bucketsToAdvance > 0) {
    // Shift window
    for (let i = 0; i < bucketsToAdvance; i++) {
      vel.windowCounts.shift();
      vel.windowCounts.push(0);
    }
    lastTickMs = now;
  }
}

function evaluateStorm(topic: string, vel: TopicVelocity, source: string): void {
  if (vel.baselineRate <= 0.1) return; // Not enough baseline data

  const multiplier = vel.currentRate / vel.baselineRate;
  let severity: StormSeverity | null = null;

  if (multiplier >= CRITICAL_MULTIPLIER) severity = 'critical';
  else if (multiplier >= STORM_MULTIPLIER) severity = 'storm';
  else if (multiplier >= WARNING_MULTIPLIER) severity = 'warning';
  else if (multiplier >= WATCH_MULTIPLIER) severity = 'watch';

  if (!severity) return;

  const existing = activeAlerts.get(topic);
  if (existing) {
    // Upgrade severity if needed
    const severityRank: Record<StormSeverity, number> = { watch: 1, warning: 2, storm: 3, critical: 4 };
    if (severityRank[severity] > severityRank[existing.severity]) {
      existing.severity = severity;
      existing.currentRate = vel.currentRate;
      existing.multiplier = multiplier;
      if (!existing.affectedPublishers.includes(source)) {
        existing.affectedPublishers.push(source);
      }
    }
    return;
  }

  // New alert
  const alert: StormAlert = {
    id: crypto.randomUUID(),
    topic,
    severity,
    currentRate: vel.currentRate,
    baselineRate: vel.baselineRate,
    multiplier,
    startedAt: new Date().toISOString(),
    resolvedAt: null,
    throttleApplied: false,
    affectedPublishers: [source],
  };

  activeAlerts.set(topic, alert);
  alertHistory.push(alert);
  if (alertHistory.length > MAX_ALERTS) alertHistory.splice(0, alertHistory.length - MAX_ALERTS);
  totalAlertsTriggered++;

  // Auto-throttle on storm or critical
  if (severity === 'storm' || severity === 'critical') {
    throttleTopic(topic);
    alert.throttleApplied = true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all active alerts. */
export function getActiveAlerts(): StormAlert[] {
  return Array.from(activeAlerts.values());
}

/** Get alert history. */
export function getAlertHistory(limit: number = 50): StormAlert[] {
  return alertHistory.slice(-limit);
}

/** Get velocity for a specific topic. */
export function getTopicVelocity(topic: string): TopicVelocity | null {
  return velocities.get(topic) ?? null;
}

/** Get system-wide storm detection stats. */
export function getStormDetectionStats(): StormDetectionStats {
  const topicCounts = new Map<string, number>();
  for (const alert of alertHistory) {
    topicCounts.set(alert.topic, (topicCounts.get(alert.topic) ?? 0) + 1);
  }

  const systemVelocity = Array.from(velocities.values())
    .reduce((s, v) => s + v.currentRate, 0);

  return {
    monitoredTopics: velocities.size,
    activeAlerts: activeAlerts.size,
    totalAlertsTriggered,
    totalThrottlesApplied: totalThrottles,
    topStormTopics: Array.from(topicCounts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    systemVelocity: Math.round(systemVelocity * 10) / 10,
  };
}

/** Reset all storm detection state. */
export function resetStormDetectionState(): void {
  velocities.clear();
  activeAlerts.clear();
  alertHistory.length = 0;
  totalAlertsTriggered = 0;
  totalThrottles = 0;
}
