/**
 * Evolution Mesh — Skill Decay Detection
 * Monitors executor skill degradation over time.
 * Triggers re-training alerts when performance drops below thresholds.
 */

export interface SkillWindow {
  windowStart: number;
  windowEnd: number;
  attempts: number;
  successes: number;
  successRate: number;
}

export interface SkillProfile {
  executorId: string;
  skillKey: string;
  windows: SkillWindow[];
  currentRate: number;
  peakRate: number;
  decayDetected: boolean;
  decayMagnitude: number;
  lastActiveAt: number;
  inactivityDays: number;
}

export interface DecayAlert {
  executorId: string;
  skillKey: string;
  alertType: 'performance_decay' | 'inactivity_decay' | 'sudden_drop';
  severity: 'low' | 'medium' | 'high';
  currentRate: number;
  peakRate: number;
  decayPercent: number;
  recommendation: string;
  detectedAt: number;
}

const WINDOW_SIZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const INACTIVITY_THRESHOLD_DAYS = 14;
const DECAY_THRESHOLD = 0.15; // 15% drop from peak
const SUDDEN_DROP_THRESHOLD = 0.25; // 25% drop in a single window

interface SkillEvent {
  executorId: string;
  skillKey: string;
  success: boolean;
  timestamp: number;
}

const skillEvents: SkillEvent[] = [];
const decayAlerts: DecayAlert[] = [];
const MAX_EVENTS = 50_000;
const MAX_ALERTS = 500;

/**
 * Record a skill execution event.
 */
export function recordSkillEvent(executorId: string, skillKey: string, success: boolean): void {
  skillEvents.push({ executorId, skillKey, success, timestamp: Date.now() });
  if (skillEvents.length > MAX_EVENTS) skillEvents.splice(0, skillEvents.length - MAX_EVENTS);
}

/**
 * Analyze skill profile and detect decay.
 */
export function analyzeSkillDecay(executorId: string, skillKey: string): SkillProfile {
  const events = skillEvents.filter(e => e.executorId === executorId && e.skillKey === skillKey);

  if (events.length === 0) {
    return {
      executorId, skillKey, windows: [], currentRate: 0, peakRate: 0,
      decayDetected: false, decayMagnitude: 0, lastActiveAt: 0, inactivityDays: Infinity,
    };
  }

  // Build time windows
  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const firstTime = sorted[0].timestamp;
  const now = Date.now();
  const windows: SkillWindow[] = [];

  let windowStart = firstTime;
  while (windowStart < now) {
    const windowEnd = windowStart + WINDOW_SIZE_MS;
    const windowEvents = sorted.filter(e => e.timestamp >= windowStart && e.timestamp < windowEnd);
    if (windowEvents.length > 0) {
      windows.push({
        windowStart,
        windowEnd,
        attempts: windowEvents.length,
        successes: windowEvents.filter(e => e.success).length,
        successRate: windowEvents.filter(e => e.success).length / windowEvents.length,
      });
    }
    windowStart = windowEnd;
  }

  const lastEvent = sorted[sorted.length - 1];
  const inactivityDays = (now - lastEvent.timestamp) / (24 * 60 * 60 * 1000);
  const peakRate = windows.length > 0 ? Math.max(...windows.map(w => w.successRate)) : 0;
  const currentRate = windows.length > 0 ? windows[windows.length - 1].successRate : 0;
  const decayMagnitude = peakRate > 0 ? (peakRate - currentRate) / peakRate : 0;
  const decayDetected = decayMagnitude >= DECAY_THRESHOLD || inactivityDays >= INACTIVITY_THRESHOLD_DAYS;

  const profile: SkillProfile = {
    executorId, skillKey, windows, currentRate, peakRate,
    decayDetected, decayMagnitude,
    lastActiveAt: lastEvent.timestamp,
    inactivityDays: Math.round(inactivityDays * 10) / 10,
  };

  // Generate alerts
  if (decayDetected) {
    generateDecayAlert(profile, windows);
  }

  return profile;
}

function generateDecayAlert(profile: SkillProfile, windows: SkillWindow[]): void {
  let alertType: DecayAlert['alertType'] = 'performance_decay';
  let severity: DecayAlert['severity'] = 'low';
  let recommendation = '';

  if (profile.inactivityDays >= INACTIVITY_THRESHOLD_DAYS) {
    alertType = 'inactivity_decay';
    severity = profile.inactivityDays >= 30 ? 'high' : 'medium';
    recommendation = `Executor inactive for ${Math.round(profile.inactivityDays)} days. Schedule refresh drills for ${profile.skillKey}.`;
  } else if (windows.length >= 2) {
    const prev = windows[windows.length - 2].successRate;
    const curr = windows[windows.length - 1].successRate;
    if (prev - curr >= SUDDEN_DROP_THRESHOLD) {
      alertType = 'sudden_drop';
      severity = 'high';
      recommendation = `Sudden ${Math.round((prev - curr) * 100)}% drop in ${profile.skillKey}. Investigate recent mutations and consider rollback drill.`;
    } else {
      severity = profile.decayMagnitude >= 0.3 ? 'high' : 'medium';
      recommendation = `Gradual decay in ${profile.skillKey} (${Math.round(profile.decayMagnitude * 100)}% from peak). Assign targeted practice.`;
    }
  }

  const alert: DecayAlert = {
    executorId: profile.executorId,
    skillKey: profile.skillKey,
    alertType,
    severity,
    currentRate: profile.currentRate,
    peakRate: profile.peakRate,
    decayPercent: Math.round(profile.decayMagnitude * 100),
    recommendation,
    detectedAt: Date.now(),
  };

  decayAlerts.push(alert);
  if (decayAlerts.length > MAX_ALERTS) decayAlerts.splice(0, decayAlerts.length - MAX_ALERTS);
}

/**
 * Get all decay alerts.
 */
export function getDecayAlerts(executorId?: string): DecayAlert[] {
  return decayAlerts
    .filter(a => !executorId || a.executorId === executorId)
    .slice(-50);
}

/**
 * Get all skill profiles for an executor.
 */
export function getExecutorSkillProfiles(executorId: string): SkillProfile[] {
  const skillKeys = [...new Set(
    skillEvents.filter(e => e.executorId === executorId).map(e => e.skillKey)
  )];
  return skillKeys.map(sk => analyzeSkillDecay(executorId, sk));
}
