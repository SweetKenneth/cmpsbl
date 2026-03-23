/**
 * DEFENSE — Enterprise Behavioral Threat Engine v2.0.0 (Hardened)
 * Runtime behavioral analysis for anomalous execution patterns.
 *
 * v2.0.0 Hardening:
 *  - Actor quarantine with auto-release timer
 *  - Time-decayed risk scoring (recent events weighted higher)
 *  - Session binding: fingerprint drift detection
 *  - Bounded memory: generational GC for actor eviction
 *  - Frozen alert objects to prevent post-analysis tampering
 *  - Persistence detection (cron-like patterns)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type BehaviorCategory =
  | 'normal'
  | 'anomalous'
  | 'exfiltration'
  | 'lateral_movement'
  | 'privilege_escalation'
  | 'reconnaissance'
  | 'persistence'
  | 'evasion';

export interface BehavioralEvent {
  actorId: string;
  action: string;
  resource: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  sessionFingerprint?: string;
}

export interface BehavioralAlert {
  readonly id: string;
  readonly category: BehaviorCategory;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly confidence: number;
  readonly actorId: string;
  readonly description: string;
  readonly evidence: readonly string[];
  readonly mitreTactic?: string;
  readonly recommendedAction: string;
}

export interface BehavioralProfile {
  actorId: string;
  eventCount: number;
  uniqueResources: number;
  uniqueActions: number;
  avgEventsPerMinute: number;
  peakEventsPerMinute: number;
  riskScore: number;
  alerts: BehavioralAlert[];
  quarantined: boolean;
  quarantineReason?: string;
  lastUpdated: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTOR STATE — bounded, time-windowed
// ═══════════════════════════════════════════════════════════════════════════════

interface ActorState {
  events: BehavioralEvent[];
  actions: Map<string, number>;
  resources: Map<string, number>;
  minuteBuckets: Map<number, number>;
  totalBytes: number;
  failedAttempts: number;
  privilegeChanges: number;
  firstSeen: number;
  lastSeen: number;
  // v2.0.0 hardening fields
  sessionFingerprint: string | null;
  fingerprintDrifts: number;
  quarantined: boolean;
  quarantineReason: string;
  quarantineUntil: number;
  alertCount: number;
}

const actorStates = new Map<string, ActorState>();
const MAX_ACTOR_STATES = 2000;
const MAX_EVENTS_PER_ACTOR = 500;
const WINDOW_MS = 30 * 60 * 1000;
const Z_SCORE_THRESHOLD = 2.5;
const QUARANTINE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Exfiltration detection thresholds
const EXFIL_RATE_THRESHOLD = 100;
const EXFIL_RESOURCE_THRESHOLD = 20;
const EXFIL_SENSITIVE_KEYWORDS = new Set([
  'export', 'download', 'backup', 'dump', 'extract', 'copy', 'transfer',
  'api_key', 'secret', 'token', 'password', 'credential', 'private',
]);

// Lateral movement indicators
const LATERAL_ACTIONS = new Set([
  'access_module', 'query_table', 'invoke_function', 'read_secret',
  'list_users', 'list_roles', 'list_keys', 'scan_network',
]);

// Reconnaissance indicators
const RECON_PATTERNS = new Set([
  'list', 'describe', 'get_schema', 'show_tables', 'show_columns',
  'enumerate', 'discover', 'probe', 'scan',
]);

// Persistence indicators (v2.0.0)
const PERSISTENCE_ACTIONS = new Set([
  'create_schedule', 'add_cron', 'register_webhook', 'install_trigger',
  'create_user', 'add_key', 'set_startup', 'modify_config',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// GC — Generational eviction
// ═══════════════════════════════════════════════════════════════════════════════

let gcCounter = 0;
const GC_INTERVAL = 100; // run every 100 events

function maybeGC(): void {
  if (++gcCounter < GC_INTERVAL) return;
  gcCounter = 0;

  if (actorStates.size <= MAX_ACTOR_STATES * 0.8) return;

  // Evict actors: quarantine-expired first, then oldest
  const now = Date.now();
  const candidates: Array<[string, number]> = [];
  for (const [key, s] of actorStates) {
    if (s.quarantined && s.quarantineUntil > 0 && now > s.quarantineUntil) {
      actorStates.delete(key); // expired quarantine
      continue;
    }
    candidates.push([key, s.lastSeen]);
  }

  if (actorStates.size > MAX_ACTOR_STATES) {
    candidates.sort((a, b) => a[1] - b[1]);
    const toRemove = actorStates.size - MAX_ACTOR_STATES;
    for (let i = 0; i < toRemove && i < candidates.length; i++) {
      actorStates.delete(candidates[i][0]);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN API
// ═══════════════════════════════════════════════════════════════════════════════

let alertCounter = 0;

/**
 * Record a behavioral event and return any triggered alerts.
 * Quarantined actors get immediate block alerts.
 */
export function recordBehavior(event: BehavioralEvent): BehavioralAlert[] {
  const now = Date.now();
  let state = actorStates.get(event.actorId);

  // Check quarantine
  if (state?.quarantined) {
    if (state.quarantineUntil > 0 && now > state.quarantineUntil) {
      state.quarantined = false;
      state.quarantineReason = '';
    } else {
      return [Object.freeze({
        id: `BEH-${++alertCounter}`,
        category: 'anomalous' as BehaviorCategory,
        severity: 'critical' as const,
        confidence: 1,
        actorId: event.actorId,
        description: `Actor is quarantined: ${state.quarantineReason}`,
        evidence: Object.freeze([`quarantine_until=${new Date(state.quarantineUntil).toISOString()}`]),
        mitreTactic: 'TA0040',
        recommendedAction: 'Block all requests until quarantine expires',
      })];
    }
  }

  if (!state) {
    maybeGC();
    state = {
      events: [], actions: new Map(), resources: new Map(), minuteBuckets: new Map(),
      totalBytes: 0, failedAttempts: 0, privilegeChanges: 0,
      firstSeen: now, lastSeen: now,
      sessionFingerprint: event.sessionFingerprint || null,
      fingerprintDrifts: 0, quarantined: false, quarantineReason: '', quarantineUntil: 0, alertCount: 0,
    };
    actorStates.set(event.actorId, state);
  }

  // Trim old events outside window
  const windowStart = now - WINDOW_MS;
  while (state.events.length > 0 && state.events[0].timestamp < windowStart) {
    state.events.shift();
  }

  if (state.events.length < MAX_EVENTS_PER_ACTOR) {
    state.events.push(event);
  }
  state.lastSeen = now;
  state.actions.set(event.action, (state.actions.get(event.action) || 0) + 1);
  state.resources.set(event.resource, (state.resources.get(event.resource) || 0) + 1);

  const minuteKey = Math.floor(now / 60_000);
  state.minuteBuckets.set(minuteKey, (state.minuteBuckets.get(minuteKey) || 0) + 1);

  if (event.metadata?.bytes) state.totalBytes += Number(event.metadata.bytes);
  if (event.metadata?.failed) state.failedAttempts++;
  if (event.metadata?.privilege_change) state.privilegeChanges++;

  // Session fingerprint drift detection
  if (event.sessionFingerprint && state.sessionFingerprint) {
    if (event.sessionFingerprint !== state.sessionFingerprint) {
      state.fingerprintDrifts++;
      state.sessionFingerprint = event.sessionFingerprint;
    }
  } else if (event.sessionFingerprint) {
    state.sessionFingerprint = event.sessionFingerprint;
  }

  const alerts = analyzeBehavior(event.actorId, state, event);

  // Auto-quarantine on critical alerts
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  if (criticalAlerts.length > 0) {
    state.alertCount += criticalAlerts.length;
    if (state.alertCount >= 3 && !state.quarantined) {
      state.quarantined = true;
      state.quarantineReason = `${state.alertCount} critical alerts triggered`;
      state.quarantineUntil = now + QUARANTINE_DURATION_MS;
    }
  }

  return alerts;
}

export function getActorProfile(actorId: string): BehavioralProfile | null {
  const state = actorStates.get(actorId);
  if (!state) return null;

  const bucketValues = [...state.minuteBuckets.values()];
  const avgPerMin = bucketValues.length > 0
    ? bucketValues.reduce((s, v) => s + v, 0) / bucketValues.length
    : 0;
  const peakPerMin = bucketValues.length > 0 ? Math.max(...bucketValues) : 0;

  return {
    actorId,
    eventCount: state.events.length,
    uniqueResources: state.resources.size,
    uniqueActions: state.actions.size,
    avgEventsPerMinute: Math.round(avgPerMin * 100) / 100,
    peakEventsPerMinute: peakPerMin,
    riskScore: calculateRiskScore(state),
    alerts: analyzeBehavior(actorId, state),
    quarantined: state.quarantined,
    quarantineReason: state.quarantined ? state.quarantineReason : undefined,
    lastUpdated: state.lastSeen,
  };
}

export function getHighRiskActors(minRiskScore = 50): BehavioralProfile[] {
  const results: BehavioralProfile[] = [];
  for (const [actorId] of actorStates) {
    const profile = getActorProfile(actorId);
    if (profile && profile.riskScore >= minRiskScore) results.push(profile);
  }
  return results.sort((a, b) => b.riskScore - a.riskScore);
}

/** Manually quarantine an actor */
export function quarantineActor(actorId: string, reason: string, durationMs = QUARANTINE_DURATION_MS): boolean {
  const state = actorStates.get(actorId);
  if (!state) return false;
  state.quarantined = true;
  state.quarantineReason = reason;
  state.quarantineUntil = Date.now() + durationMs;
  return true;
}

/** Release an actor from quarantine */
export function releaseActor(actorId: string): boolean {
  const state = actorStates.get(actorId);
  if (!state) return false;
  state.quarantined = false;
  state.quarantineReason = '';
  state.quarantineUntil = 0;
  state.alertCount = 0;
  return true;
}

export function getBehavioralEngineStats() {
  let quarantinedCount = 0;
  for (const s of actorStates.values()) {
    if (s.quarantined) quarantinedCount++;
  }
  return {
    version: '2.0.0',
    trackedActors: actorStates.size,
    quarantinedActors: quarantinedCount,
    maxActors: MAX_ACTOR_STATES,
    windowMinutes: WINDOW_MS / 60_000,
    zScoreThreshold: Z_SCORE_THRESHOLD,
    quarantineDurationMinutes: QUARANTINE_DURATION_MS / 60_000,
  };
}

export function clearActorState(actorId: string): boolean {
  return actorStates.delete(actorId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

function analyzeBehavior(actorId: string, state: ActorState, latestEvent?: BehavioralEvent): BehavioralAlert[] {
  const alerts: BehavioralAlert[] = [];

  const rateAlert = detectRateAnomaly(actorId, state);
  if (rateAlert) alerts.push(rateAlert);

  const exfilAlert = detectExfiltration(actorId, state, latestEvent);
  if (exfilAlert) alerts.push(exfilAlert);

  const lateralAlert = detectLateralMovement(actorId, state);
  if (lateralAlert) alerts.push(lateralAlert);

  const reconAlert = detectReconnaissance(actorId, state);
  if (reconAlert) alerts.push(reconAlert);

  const privAlert = detectPrivilegeEscalation(actorId, state);
  if (privAlert) alerts.push(privAlert);

  const evasionAlert = detectEvasion(actorId, state);
  if (evasionAlert) alerts.push(evasionAlert);

  // v2.0.0 — session drift detection
  const driftAlert = detectSessionDrift(actorId, state);
  if (driftAlert) alerts.push(driftAlert);

  // v2.0.0 — persistence detection
  const persistAlert = detectPersistence(actorId, state);
  if (persistAlert) alerts.push(persistAlert);

  return alerts.map(a => Object.freeze(a));
}

function detectRateAnomaly(actorId: string, state: ActorState): BehavioralAlert | null {
  const buckets = [...state.minuteBuckets.values()];
  if (buckets.length < 3) return null;

  const mean = buckets.reduce((s, v) => s + v, 0) / buckets.length;
  const variance = buckets.reduce((s, v) => s + (v - mean) ** 2, 0) / buckets.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return null;

  const latest = buckets[buckets.length - 1];
  const zScore = (latest - mean) / stdDev;

  if (zScore > Z_SCORE_THRESHOLD) {
    return {
      id: `BEH-${++alertCounter}`, category: 'anomalous',
      severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
      confidence: Math.min(0.95, 0.5 + (zScore - Z_SCORE_THRESHOLD) * 0.15),
      actorId,
      description: `Anomalous activity rate: ${latest} events/min (Z=${zScore.toFixed(2)}, baseline: ${mean.toFixed(1)}±${stdDev.toFixed(1)})`,
      evidence: [`current_rate=${latest}`, `mean=${mean.toFixed(1)}`, `z_score=${zScore.toFixed(2)}`],
      mitreTactic: 'TA0040',
      recommendedAction: zScore > 4 ? 'Immediate rate limit and session review' : 'Monitor and apply temporary rate limit',
    };
  }
  return null;
}

function detectExfiltration(actorId: string, state: ActorState, event?: BehavioralEvent): BehavioralAlert | null {
  const evidence: string[] = [];
  let score = 0;

  if (state.resources.size > EXFIL_RESOURCE_THRESHOLD) {
    score += 30;
    evidence.push(`${state.resources.size} unique resources accessed`);
  }

  if (event) {
    const combined = `${event.action} ${event.resource}`.toLowerCase();
    for (const kw of EXFIL_SENSITIVE_KEYWORDS) {
      if (combined.includes(kw)) { score += 20; evidence.push(`sensitive_keyword: ${kw}`); break; }
    }
  }

  if (state.totalBytes > 10_485_760) {
    score += 25;
    evidence.push(`total_bytes_transferred=${state.totalBytes}`);
  }

  const latestBucket = [...state.minuteBuckets.values()].pop() || 0;
  if (latestBucket > EXFIL_RATE_THRESHOLD) {
    score += 25;
    evidence.push(`burst_rate=${latestBucket}/min`);
  }

  if (score >= 40) {
    return {
      id: `BEH-${++alertCounter}`, category: 'exfiltration',
      severity: score >= 70 ? 'critical' : score >= 50 ? 'high' : 'medium',
      confidence: Math.min(0.95, score / 100), actorId,
      description: `Data exfiltration pattern detected (score: ${score}/100)`,
      evidence, mitreTactic: 'TA0010',
      recommendedAction: score >= 70 ? 'Block actor immediately and audit accessed resources' : 'Rate limit and flag for review',
    };
  }
  return null;
}

function detectLateralMovement(actorId: string, state: ActorState): BehavioralAlert | null {
  let lateralCount = 0;
  const evidence: string[] = [];
  for (const [action, count] of state.actions) {
    if (LATERAL_ACTIONS.has(action)) { lateralCount += count; evidence.push(`${action}×${count}`); }
  }
  if (lateralCount >= 5 && state.resources.size >= 3) {
    return {
      id: `BEH-${++alertCounter}`, category: 'lateral_movement',
      severity: lateralCount >= 15 ? 'critical' : lateralCount >= 10 ? 'high' : 'medium',
      confidence: Math.min(0.9, 0.4 + lateralCount * 0.04), actorId,
      description: `Lateral movement pattern: ${lateralCount} cross-module actions across ${state.resources.size} resources`,
      evidence, mitreTactic: 'TA0008',
      recommendedAction: 'Isolate actor session and review access pattern',
    };
  }
  return null;
}

function detectReconnaissance(actorId: string, state: ActorState): BehavioralAlert | null {
  let reconCount = 0;
  const evidence: string[] = [];
  for (const [action, count] of state.actions) {
    const actionLower = action.toLowerCase();
    for (const pattern of RECON_PATTERNS) {
      if (actionLower.includes(pattern)) { reconCount += count; evidence.push(`${action}×${count}`); break; }
    }
  }
  if (reconCount >= 8) {
    return {
      id: `BEH-${++alertCounter}`, category: 'reconnaissance',
      severity: reconCount >= 20 ? 'high' : 'medium',
      confidence: Math.min(0.85, 0.3 + reconCount * 0.03), actorId,
      description: `Reconnaissance activity: ${reconCount} discovery/enumeration actions`,
      evidence, mitreTactic: 'TA0043',
      recommendedAction: 'Log and monitor — may be precursor to attack',
    };
  }
  return null;
}

function detectPrivilegeEscalation(actorId: string, state: ActorState): BehavioralAlert | null {
  if (state.privilegeChanges >= 2) {
    return {
      id: `BEH-${++alertCounter}`, category: 'privilege_escalation',
      severity: state.privilegeChanges >= 5 ? 'critical' : 'high',
      confidence: Math.min(0.9, 0.5 + state.privilegeChanges * 0.1), actorId,
      description: `${state.privilegeChanges} privilege change attempts detected`,
      evidence: [`privilege_changes=${state.privilegeChanges}`], mitreTactic: 'TA0004',
      recommendedAction: 'Block and audit — potential privilege escalation attack',
    };
  }
  return null;
}

function detectEvasion(actorId: string, state: ActorState): BehavioralAlert | null {
  const totalEvents = state.events.length;
  if (totalEvents < 5) return null;
  const failureRate = state.failedAttempts / totalEvents;
  if (failureRate > 0.5 && state.failedAttempts >= 5) {
    return {
      id: `BEH-${++alertCounter}`, category: 'evasion',
      severity: failureRate > 0.8 ? 'high' : 'medium',
      confidence: Math.min(0.85, failureRate), actorId,
      description: `High failure rate: ${state.failedAttempts}/${totalEvents} (${Math.round(failureRate * 100)}%) — possible probing/evasion`,
      evidence: [`failed=${state.failedAttempts}`, `total=${totalEvents}`, `rate=${(failureRate * 100).toFixed(1)}%`],
      mitreTactic: 'TA0005',
      recommendedAction: 'Apply progressive rate limiting',
    };
  }
  return null;
}

/** v2.0.0 — Detect session fingerprint drift (session hijacking indicator) */
function detectSessionDrift(actorId: string, state: ActorState): BehavioralAlert | null {
  if (state.fingerprintDrifts >= 2) {
    return {
      id: `BEH-${++alertCounter}`, category: 'evasion',
      severity: state.fingerprintDrifts >= 4 ? 'critical' : 'high',
      confidence: Math.min(0.95, 0.5 + state.fingerprintDrifts * 0.12), actorId,
      description: `Session fingerprint changed ${state.fingerprintDrifts} times — possible session hijacking`,
      evidence: [`fingerprint_drifts=${state.fingerprintDrifts}`],
      mitreTactic: 'TA0008',
      recommendedAction: 'Invalidate session and require re-authentication',
    };
  }
  return null;
}

/** v2.0.0 — Detect persistence establishment attempts */
function detectPersistence(actorId: string, state: ActorState): BehavioralAlert | null {
  let persistCount = 0;
  const evidence: string[] = [];
  for (const [action, count] of state.actions) {
    if (PERSISTENCE_ACTIONS.has(action)) { persistCount += count; evidence.push(`${action}×${count}`); }
  }
  if (persistCount >= 2) {
    return {
      id: `BEH-${++alertCounter}`, category: 'persistence',
      severity: persistCount >= 5 ? 'critical' : persistCount >= 3 ? 'high' : 'medium',
      confidence: Math.min(0.9, 0.4 + persistCount * 0.1), actorId,
      description: `Persistence establishment: ${persistCount} persistence-related actions`,
      evidence, mitreTactic: 'TA0003',
      recommendedAction: 'Review and revoke created schedules/webhooks/keys',
    };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK SCORING — Time-decayed
// ═══════════════════════════════════════════════════════════════════════════════

function calculateRiskScore(state: ActorState): number {
  let score = 0;
  const now = Date.now();

  // Base: event volume (recent events weighted 2x)
  const recentEvents = state.events.filter(e => now - e.timestamp < 5 * 60_000).length;
  score += Math.min(15, state.events.length / 15);
  score += Math.min(15, recentEvents / 5);

  // Resource breadth
  score += Math.min(20, state.resources.size * 2);

  // Failure rate
  const totalEvents = state.events.length || 1;
  score += Math.min(15, (state.failedAttempts / totalEvents) * 30);

  // Privilege changes
  score += Math.min(20, state.privilegeChanges * 10);

  // Data volume
  if (state.totalBytes > 1_048_576) score += 10;
  if (state.totalBytes > 10_485_760) score += 15;

  // Fingerprint drifts (v2.0.0)
  score += Math.min(10, state.fingerprintDrifts * 5);

  // Quarantine history
  if (state.alertCount > 0) score += Math.min(10, state.alertCount * 3);

  return Math.min(100, Math.round(score));
}
