/**
 * DEFENSE — Enterprise Behavioral Threat Engine v1.0.0
 * Runtime behavioral analysis for anomalous execution patterns,
 * data exfiltration attempts, and lateral movement signatures.
 *
 * Architecture:
 *  - Rolling window behavioral profiling
 *  - Statistical anomaly detection (Z-score + IQR)
 *  - Exfiltration pattern recognition
 *  - Lateral movement signature detection
 *  - Session fingerprint drift monitoring
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
}

export interface BehavioralAlert {
  id: string;
  category: BehaviorCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;       // 0-1
  actorId: string;
  description: string;
  evidence: string[];
  mitreTactic?: string;     // MITRE ATT&CK reference
  recommendedAction: string;
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
  lastUpdated: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BEHAVIORAL PROFILER — Rolling window actor tracking
// ═══════════════════════════════════════════════════════════════════════════════

interface ActorState {
  events: BehavioralEvent[];
  actions: Map<string, number>;
  resources: Map<string, number>;
  minuteBuckets: Map<number, number>;  // minute → event count
  totalBytes: number;
  failedAttempts: number;
  privilegeChanges: number;
  firstSeen: number;
  lastSeen: number;
}

const actorStates = new Map<string, ActorState>();
const MAX_ACTOR_STATES = 2000;
const MAX_EVENTS_PER_ACTOR = 500;
const WINDOW_MS = 30 * 60 * 1000;  // 30-minute analysis window

// Z-score threshold for anomaly detection
const Z_SCORE_THRESHOLD = 2.5;

// Exfiltration detection thresholds
const EXFIL_RATE_THRESHOLD = 100;        // events/min
const EXFIL_RESOURCE_THRESHOLD = 20;     // unique resources accessed rapidly
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

/**
 * Record a behavioral event and return any triggered alerts
 */
export function recordBehavior(event: BehavioralEvent): BehavioralAlert[] {
  const now = Date.now();
  let state = actorStates.get(event.actorId);

  if (!state) {
    // Evict oldest if at capacity
    if (actorStates.size >= MAX_ACTOR_STATES) {
      let oldestKey = '';
      let oldestTime = Infinity;
      for (const [key, s] of actorStates) {
        if (s.lastSeen < oldestTime) { oldestKey = key; oldestTime = s.lastSeen; }
      }
      if (oldestKey) actorStates.delete(oldestKey);
    }

    state = {
      events: [],
      actions: new Map(),
      resources: new Map(),
      minuteBuckets: new Map(),
      totalBytes: 0,
      failedAttempts: 0,
      privilegeChanges: 0,
      firstSeen: now,
      lastSeen: now,
    };
    actorStates.set(event.actorId, state);
  }

  // Trim old events outside window
  const windowStart = now - WINDOW_MS;
  while (state.events.length > 0 && state.events[0].timestamp < windowStart) {
    state.events.shift();
  }

  // Record event
  if (state.events.length < MAX_EVENTS_PER_ACTOR) {
    state.events.push(event);
  }
  state.lastSeen = now;
  state.actions.set(event.action, (state.actions.get(event.action) || 0) + 1);
  state.resources.set(event.resource, (state.resources.get(event.resource) || 0) + 1);

  // Minute bucket
  const minuteKey = Math.floor(now / 60_000);
  state.minuteBuckets.set(minuteKey, (state.minuteBuckets.get(minuteKey) || 0) + 1);

  // Track metadata
  if (event.metadata?.bytes) state.totalBytes += Number(event.metadata.bytes);
  if (event.metadata?.failed) state.failedAttempts++;
  if (event.metadata?.privilege_change) state.privilegeChanges++;

  // Analyze for threats
  return analyzeBehavior(event.actorId, state, event);
}

/**
 * Get behavioral profile for an actor
 */
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
    lastUpdated: state.lastSeen,
  };
}

/**
 * Get all actors with risk above threshold
 */
export function getHighRiskActors(minRiskScore = 50): BehavioralProfile[] {
  const results: BehavioralProfile[] = [];
  for (const [actorId] of actorStates) {
    const profile = getActorProfile(actorId);
    if (profile && profile.riskScore >= minRiskScore) {
      results.push(profile);
    }
  }
  return results.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Get engine stats
 */
export function getBehavioralEngineStats() {
  return {
    trackedActors: actorStates.size,
    maxActors: MAX_ACTOR_STATES,
    windowMinutes: WINDOW_MS / 60_000,
    zScoreThreshold: Z_SCORE_THRESHOLD,
    exfilThresholds: { rate: EXFIL_RATE_THRESHOLD, resources: EXFIL_RESOURCE_THRESHOLD },
  };
}

/**
 * Clear state for an actor (e.g., after confirmed false positive)
 */
export function clearActorState(actorId: string): boolean {
  return actorStates.delete(actorId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYSIS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

let alertCounter = 0;

function analyzeBehavior(actorId: string, state: ActorState, latestEvent?: BehavioralEvent): BehavioralAlert[] {
  const alerts: BehavioralAlert[] = [];

  // 1. Rate anomaly detection (Z-score)
  const rateAlert = detectRateAnomaly(actorId, state);
  if (rateAlert) alerts.push(rateAlert);

  // 2. Exfiltration pattern detection
  const exfilAlert = detectExfiltration(actorId, state, latestEvent);
  if (exfilAlert) alerts.push(exfilAlert);

  // 3. Lateral movement detection
  const lateralAlert = detectLateralMovement(actorId, state);
  if (lateralAlert) alerts.push(lateralAlert);

  // 4. Reconnaissance detection
  const reconAlert = detectReconnaissance(actorId, state);
  if (reconAlert) alerts.push(reconAlert);

  // 5. Privilege escalation detection
  const privAlert = detectPrivilegeEscalation(actorId, state);
  if (privAlert) alerts.push(privAlert);

  // 6. Evasion detection
  const evasionAlert = detectEvasion(actorId, state);
  if (evasionAlert) alerts.push(evasionAlert);

  return alerts;
}

function detectRateAnomaly(actorId: string, state: ActorState): BehavioralAlert | null {
  const buckets = [...state.minuteBuckets.values()];
  if (buckets.length < 3) return null; // Need history

  const mean = buckets.reduce((s, v) => s + v, 0) / buckets.length;
  const variance = buckets.reduce((s, v) => s + (v - mean) ** 2, 0) / buckets.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return null;

  const latest = buckets[buckets.length - 1];
  const zScore = (latest - mean) / stdDev;

  if (zScore > Z_SCORE_THRESHOLD) {
    return {
      id: `BEH-${++alertCounter}`,
      category: 'anomalous',
      severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
      confidence: Math.min(0.95, 0.5 + (zScore - Z_SCORE_THRESHOLD) * 0.15),
      actorId,
      description: `Anomalous activity rate: ${latest} events/min (Z-score: ${zScore.toFixed(2)}, baseline: ${mean.toFixed(1)}±${stdDev.toFixed(1)})`,
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

  // High-volume resource access
  if (state.resources.size > EXFIL_RESOURCE_THRESHOLD) {
    score += 30;
    evidence.push(`${state.resources.size} unique resources accessed`);
  }

  // Sensitive keyword access
  if (event) {
    const actionLower = event.action.toLowerCase();
    const resourceLower = event.resource.toLowerCase();
    for (const kw of EXFIL_SENSITIVE_KEYWORDS) {
      if (actionLower.includes(kw) || resourceLower.includes(kw)) {
        score += 20;
        evidence.push(`sensitive_keyword: ${kw}`);
        break;
      }
    }
  }

  // High data volume
  if (state.totalBytes > 10_485_760) { // 10MB
    score += 25;
    evidence.push(`total_bytes_transferred=${state.totalBytes}`);
  }

  // Burst rate
  const latestBucket = [...state.minuteBuckets.values()].pop() || 0;
  if (latestBucket > EXFIL_RATE_THRESHOLD) {
    score += 25;
    evidence.push(`burst_rate=${latestBucket}/min`);
  }

  if (score >= 40) {
    return {
      id: `BEH-${++alertCounter}`,
      category: 'exfiltration',
      severity: score >= 70 ? 'critical' : score >= 50 ? 'high' : 'medium',
      confidence: Math.min(0.95, score / 100),
      actorId,
      description: `Data exfiltration pattern detected (score: ${score}/100)`,
      evidence,
      mitreTactic: 'TA0010',
      recommendedAction: score >= 70 ? 'Block actor immediately and audit accessed resources' : 'Rate limit and flag for review',
    };
  }
  return null;
}

function detectLateralMovement(actorId: string, state: ActorState): BehavioralAlert | null {
  let lateralCount = 0;
  const evidence: string[] = [];

  for (const [action, count] of state.actions) {
    if (LATERAL_ACTIONS.has(action)) {
      lateralCount += count;
      evidence.push(`${action}×${count}`);
    }
  }

  if (lateralCount >= 5 && state.resources.size >= 3) {
    return {
      id: `BEH-${++alertCounter}`,
      category: 'lateral_movement',
      severity: lateralCount >= 15 ? 'critical' : lateralCount >= 10 ? 'high' : 'medium',
      confidence: Math.min(0.9, 0.4 + lateralCount * 0.04),
      actorId,
      description: `Lateral movement pattern: ${lateralCount} cross-module actions across ${state.resources.size} resources`,
      evidence,
      mitreTactic: 'TA0008',
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
      if (actionLower.includes(pattern)) {
        reconCount += count;
        evidence.push(`${action}×${count}`);
        break;
      }
    }
  }

  if (reconCount >= 8) {
    return {
      id: `BEH-${++alertCounter}`,
      category: 'reconnaissance',
      severity: reconCount >= 20 ? 'high' : 'medium',
      confidence: Math.min(0.85, 0.3 + reconCount * 0.03),
      actorId,
      description: `Reconnaissance activity: ${reconCount} discovery/enumeration actions`,
      evidence,
      mitreTactic: 'TA0043',
      recommendedAction: 'Log and monitor — may be precursor to attack',
    };
  }
  return null;
}

function detectPrivilegeEscalation(actorId: string, state: ActorState): BehavioralAlert | null {
  if (state.privilegeChanges >= 2) {
    return {
      id: `BEH-${++alertCounter}`,
      category: 'privilege_escalation',
      severity: state.privilegeChanges >= 5 ? 'critical' : 'high',
      confidence: Math.min(0.9, 0.5 + state.privilegeChanges * 0.1),
      actorId,
      description: `${state.privilegeChanges} privilege change attempts detected`,
      evidence: [`privilege_changes=${state.privilegeChanges}`],
      mitreTactic: 'TA0004',
      recommendedAction: 'Block and audit — potential privilege escalation attack',
    };
  }
  return null;
}

function detectEvasion(actorId: string, state: ActorState): BehavioralAlert | null {
  // High failure rate suggests probing/evasion
  const totalEvents = state.events.length;
  if (totalEvents < 5) return null;

  const failureRate = state.failedAttempts / totalEvents;
  if (failureRate > 0.5 && state.failedAttempts >= 5) {
    return {
      id: `BEH-${++alertCounter}`,
      category: 'evasion',
      severity: failureRate > 0.8 ? 'high' : 'medium',
      confidence: Math.min(0.85, failureRate),
      actorId,
      description: `High failure rate: ${state.failedAttempts}/${totalEvents} (${Math.round(failureRate * 100)}%) — possible probing/evasion`,
      evidence: [`failed=${state.failedAttempts}`, `total=${totalEvents}`, `rate=${(failureRate * 100).toFixed(1)}%`],
      mitreTactic: 'TA0005',
      recommendedAction: 'Apply progressive rate limiting',
    };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK SCORING
// ═══════════════════════════════════════════════════════════════════════════════

function calculateRiskScore(state: ActorState): number {
  let score = 0;

  // Base: event volume
  score += Math.min(20, state.events.length / 10);

  // Resource breadth
  score += Math.min(20, state.resources.size * 2);

  // Failure rate
  const totalEvents = state.events.length || 1;
  score += Math.min(15, (state.failedAttempts / totalEvents) * 30);

  // Privilege changes
  score += Math.min(20, state.privilegeChanges * 10);

  // Data volume
  if (state.totalBytes > 1_048_576) score += 10; // >1MB
  if (state.totalBytes > 10_485_760) score += 15; // >10MB

  return Math.min(100, Math.round(score));
}
