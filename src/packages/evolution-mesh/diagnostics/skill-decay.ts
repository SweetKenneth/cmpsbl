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

// ── #9 Skill-Weighted Decay ──

export interface SkillWeightConfig {
  skillKey: string;
  /** How critical this skill is (higher = more sensitive to decay). Default 1.0 */
  criticalityWeight: number;
  /** Custom decay threshold override (default uses global DECAY_THRESHOLD) */
  customDecayThreshold?: number;
  /** Custom inactivity threshold in days */
  customInactivityDays?: number;
}

const skillWeights = new Map<string, SkillWeightConfig>();

/**
 * Set domain-weighted decay sensitivity for a skill.
 * Higher criticality = lower tolerance for decay.
 */
export function setSkillWeight(config: SkillWeightConfig): void {
  skillWeights.set(config.skillKey, config);
}

/**
 * Get the effective decay threshold for a skill, factoring in its weight.
 */
export function getEffectiveDecayThreshold(skillKey: string): { decayThreshold: number; inactivityDays: number } {
  const weight = skillWeights.get(skillKey);
  if (!weight) return { decayThreshold: DECAY_THRESHOLD, inactivityDays: INACTIVITY_THRESHOLD_DAYS };

  // Higher criticality → lower threshold (more sensitive)
  const adjustedDecay = weight.customDecayThreshold ?? DECAY_THRESHOLD / weight.criticalityWeight;
  const adjustedInactivity = weight.customInactivityDays ?? Math.round(INACTIVITY_THRESHOLD_DAYS / weight.criticalityWeight);

  return {
    decayThreshold: Math.max(0.03, Math.min(0.5, adjustedDecay)),
    inactivityDays: Math.max(3, adjustedInactivity),
  };
}

/**
 * Analyze skill decay with domain-weighted thresholds.
 */
export function analyzeWeightedSkillDecay(executorId: string, skillKey: string): SkillProfile & { weightedSeverity: 'normal' | 'elevated' | 'critical' } {
  const profile = analyzeSkillDecay(executorId, skillKey);
  const effective = getEffectiveDecayThreshold(skillKey);
  const weight = skillWeights.get(skillKey);

  let weightedSeverity: 'normal' | 'elevated' | 'critical' = 'normal';
  if (profile.decayMagnitude >= effective.decayThreshold * 2 || profile.inactivityDays >= effective.inactivityDays * 2) {
    weightedSeverity = 'critical';
  } else if (profile.decayMagnitude >= effective.decayThreshold || profile.inactivityDays >= effective.inactivityDays) {
    weightedSeverity = 'elevated';
  }

  return { ...profile, weightedSeverity };
}

// ── #10 Recovery Tracking ──

export interface RecoveryRecord {
  executorId: string;
  skillKey: string;
  decayDetectedAt: number;
  recoveryStartedAt: number;
  recoveredAt?: number;
  recoveryDurationMs?: number;
  preDecayRate: number;
  troughRate: number;
  currentRate: number;
  recovered: boolean;
  /** How close to peak was the recovery (1.0 = full recovery) */
  recoveryCompleteness: number;
}

const recoveryRecords: RecoveryRecord[] = [];
const MAX_RECOVERY_RECORDS = 2000;

/**
 * Begin tracking a recovery attempt after decay is detected.
 */
export function startRecoveryTracking(executorId: string, skillKey: string, preDecayRate: number, troughRate: number): RecoveryRecord {
  const record: RecoveryRecord = {
    executorId,
    skillKey,
    decayDetectedAt: Date.now(),
    recoveryStartedAt: Date.now(),
    preDecayRate,
    troughRate,
    currentRate: troughRate,
    recovered: false,
    recoveryCompleteness: 0,
  };
  recoveryRecords.push(record);
  if (recoveryRecords.length > MAX_RECOVERY_RECORDS) recoveryRecords.splice(0, recoveryRecords.length - MAX_RECOVERY_RECORDS);
  return record;
}

/**
 * Update recovery progress for an active recovery.
 */
export function updateRecoveryProgress(executorId: string, skillKey: string, currentRate: number): RecoveryRecord | null {
  const record = recoveryRecords.find(r => r.executorId === executorId && r.skillKey === skillKey && !r.recovered);
  if (!record) return null;

  record.currentRate = currentRate;
  const rangeDiff = record.preDecayRate - record.troughRate;
  record.recoveryCompleteness = rangeDiff > 0
    ? Math.min(1, (currentRate - record.troughRate) / rangeDiff)
    : currentRate >= record.preDecayRate ? 1 : 0;

  if (record.recoveryCompleteness >= 0.9) {
    record.recovered = true;
    record.recoveredAt = Date.now();
    record.recoveryDurationMs = record.recoveredAt - record.recoveryStartedAt;
  }

  return record;
}

/**
 * Get recovery records for an executor.
 */
export function getRecoveryRecords(executorId?: string): RecoveryRecord[] {
  return recoveryRecords
    .filter(r => !executorId || r.executorId === executorId)
    .slice(-50);
}

/**
 * Get aggregate recovery metrics.
 */
export function getRecoveryMetrics(executorId?: string): {
  totalRecoveries: number;
  successfulRecoveries: number;
  avgRecoveryDurationMs: number;
  avgRecoveryCompleteness: number;
  recoveryRate: number;
} {
  const records = recoveryRecords.filter(r => !executorId || r.executorId === executorId);
  const successful = records.filter(r => r.recovered);
  const durations = successful.filter(r => r.recoveryDurationMs).map(r => r.recoveryDurationMs!);

  return {
    totalRecoveries: records.length,
    successfulRecoveries: successful.length,
    avgRecoveryDurationMs: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
    avgRecoveryCompleteness: records.length > 0
      ? Math.round((records.reduce((a, r) => a + r.recoveryCompleteness, 0) / records.length) * 1000) / 1000
      : 0,
    recoveryRate: records.length > 0 ? successful.length / records.length : 0,
  };
}
