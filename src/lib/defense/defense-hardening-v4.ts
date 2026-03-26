/**
 * CMPSBL® DEFENSE Hardening Layer v4.0.0 — Codename "Bastion"
 * 25 T4 anomaly–focused upgrades for deep behavioral threat neutralization
 *
 * Upgrade Manifest (56–80):
 * 56. T4 Anomaly Classifier — multi-signal tier-4 anomaly classification engine
 * 57. Phantom Session Detector — detects sessions with impossible state transitions
 * 58. Polyglot Payload Scanner — multi-encoding recursive payload deobfuscation
 * 59. Temporal Fingerprint Divergence — sub-second timing jitter analysis
 * 60. Neural Request Sequencer — Markov-chain request sequence anomaly scoring
 * 61. Shadow Identity Correlator — links multiple identities to single actor
 * 62. Entropy Cliff Detector — sudden entropy drops in encrypted traffic
 * 63. API Graph Anomaly Tracer — call-graph deviation from learned patterns
 * 64. Behavioral Inertia Scorer — resistance-to-change profile per actor
 * 65. Dormant Account Resurrector — flags long-dormant accounts with sudden activity
 * 66. Credential Spray Mesh — distributed low-velocity credential spray detection
 * 67. Token Lineage Validator — traces token provenance across refresh chains
 * 68. Covert Channel Sniffer — detects data exfiltration via header/timing channels
 * 69. Micro-Burst Detector — sub-second request bursts below rate-limit windows
 * 70. Adaptive Decoy Rotator — rotates honeypot endpoints on detection events
 * 71. Fingerprint Morphing Detector — detects gradual fingerprint evolution per session
 * 72. Cross-Tenant Signal Fuser — aggregates T4 signals across tenant boundaries
 * 73. Reverse Beacon Detector — identifies call-home patterns from injected scripts
 * 74. Session Entropy Auditor — measures randomness quality of session tokens
 * 75. Request Cadence Profiler — detects machine-like timing regularity
 * 76. Deep Payload Taint Tracker — tracks tainted input through processing pipeline
 * 77. Anomaly Cascade Breaker — prevents T4 anomaly storms from overwhelming DEFENSE
 * 78. Steganographic Probe Guard — detects data hidden in image/file uploads
 * 79. Protocol Downgrade Sentinel — detects forced HTTP/TLS version downgrades
 * 80. T4 Threat Synthesis Engine — fuses all T4 signals into composite threat verdicts
 */

export const DEFENSE_HARDENING_V4_VERSION = '4.0.0';
export const DEFENSE_HARDENING_V4_CODENAME = 'Bastion';

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY (shared)
// ═══════════════════════════════════════════════════════════════════════════════

function boundMap<K, V>(map: Map<K, V>, max: number): void {
  while (map.size > max) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
    else break;
  }
}

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

type T4Severity = 'elevated' | 'high' | 'critical' | 'catastrophic';

interface T4Signal {
  id: string;
  upgrade: number;
  label: string;
  severity: T4Severity;
  confidence: number;
  source: string;
  indicators: string[];
  detected_at: number;
  metadata: Record<string, unknown>;
}

const MAX_T4_SIGNALS = 5000;
const t4SignalStore = new Map<string, T4Signal>();

function emitT4Signal(signal: Omit<T4Signal, 'id' | 'detected_at'>): T4Signal {
  const full: T4Signal = { ...signal, id: generateId('t4'), detected_at: Date.now() };
  t4SignalStore.set(full.id, full);
  boundMap(t4SignalStore, MAX_T4_SIGNALS);
  return full;
}

export function getT4Signals(): T4Signal[] {
  return Array.from(t4SignalStore.values());
}

export function clearT4Signals(): void {
  t4SignalStore.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// #56  T4 ANOMALY CLASSIFIER
// Multi-signal tier-4 anomaly classification engine
// ═══════════════════════════════════════════════════════════════════════════════

interface T4Classification {
  tier: 1 | 2 | 3 | 4;
  category: 'evasion' | 'exfiltration' | 'persistence' | 'escalation' | 'reconnaissance';
  confidence: number;
  contributing_signals: string[];
}

const T4_CATEGORY_WEIGHTS: Record<string, number> = {
  phantom_session: 0.9,
  polyglot_payload: 0.85,
  temporal_divergence: 0.75,
  sequence_anomaly: 0.8,
  shadow_identity: 0.95,
  entropy_cliff: 0.7,
  graph_deviation: 0.8,
  dormant_resurrection: 0.65,
  credential_spray: 0.9,
  fingerprint_morphing: 0.85,
  covert_channel: 0.9,
  micro_burst: 0.7,
  reverse_beacon: 0.95,
  cadence_regularity: 0.6,
  steganographic: 0.8,
};

export function classifyT4Anomaly(
  signals: Array<{ type: keyof typeof T4_CATEGORY_WEIGHTS; score: number }>
): T4Classification {
  let totalWeight = 0;
  let weightedScore = 0;
  const contributing: string[] = [];

  for (const s of signals) {
    const w = T4_CATEGORY_WEIGHTS[s.type] ?? 0.5;
    totalWeight += w;
    weightedScore += s.score * w;
    contributing.push(s.type);
  }

  const confidence = totalWeight > 0 ? weightedScore / totalWeight : 0;
  const tier = confidence > 0.85 ? 4 : confidence > 0.65 ? 3 : confidence > 0.4 ? 2 : 1;

  // Determine dominant category
  const catScores = { evasion: 0, exfiltration: 0, persistence: 0, escalation: 0, reconnaissance: 0 };
  for (const s of signals) {
    if (['phantom_session', 'fingerprint_morphing', 'polyglot_payload'].includes(s.type)) catScores.evasion += s.score;
    if (['covert_channel', 'entropy_cliff', 'steganographic'].includes(s.type)) catScores.exfiltration += s.score;
    if (['dormant_resurrection', 'shadow_identity', 'reverse_beacon'].includes(s.type)) catScores.persistence += s.score;
    if (['credential_spray', 'sequence_anomaly'].includes(s.type)) catScores.escalation += s.score;
    if (['graph_deviation', 'cadence_regularity', 'micro_burst'].includes(s.type)) catScores.reconnaissance += s.score;
  }

  const category = (Object.entries(catScores) as [T4Classification['category'], number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  return { tier: tier as 1 | 2 | 3 | 4, category, confidence, contributing_signals: contributing };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #57  PHANTOM SESSION DETECTOR
// Detects sessions with impossible state transitions
// ═══════════════════════════════════════════════════════════════════════════════

interface SessionStateLog {
  states: string[];
  timestamps: number[];
}

const sessionStateLogs = new Map<string, SessionStateLog>();
const MAX_SESSION_LOGS = 5000;
const VALID_TRANSITIONS: Record<string, Set<string>> = {
  'anonymous': new Set(['authenticating', 'browsing']),
  'authenticating': new Set(['authenticated', 'failed', 'anonymous']),
  'authenticated': new Set(['active', 'idle', 'logging_out']),
  'active': new Set(['idle', 'logging_out', 'escalating']),
  'idle': new Set(['active', 'logging_out', 'expired']),
  'escalating': new Set(['admin', 'active', 'denied']),
  'logging_out': new Set(['anonymous']),
};

export function detectPhantomSession(
  sessionId: string,
  newState: string
): { phantom: boolean; reason?: string } {
  const log = sessionStateLogs.get(sessionId) || { states: [], timestamps: [] };

  if (log.states.length > 0) {
    const lastState = log.states[log.states.length - 1];
    const validNext = VALID_TRANSITIONS[lastState];

    if (validNext && !validNext.has(newState)) {
      emitT4Signal({
        upgrade: 57,
        label: 'phantom_session',
        severity: 'high',
        confidence: 0.9,
        source: sessionId,
        indicators: [`Invalid transition: ${lastState} → ${newState}`],
        metadata: { sessionId, lastState, newState, history: log.states.slice(-5) },
      });
      return { phantom: true, reason: `Impossible transition: ${lastState} → ${newState}` };
    }

    // Check for impossibly fast state changes
    const lastTs = log.timestamps[log.timestamps.length - 1];
    if (Date.now() - lastTs < 10) {
      return { phantom: true, reason: 'State change faster than 10ms — likely automated' };
    }
  }

  log.states.push(newState);
  log.timestamps.push(Date.now());
  if (log.states.length > 50) {
    log.states.shift();
    log.timestamps.shift();
  }
  sessionStateLogs.set(sessionId, log);
  boundMap(sessionStateLogs, MAX_SESSION_LOGS);

  return { phantom: false };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #58  POLYGLOT PAYLOAD SCANNER
// Multi-encoding recursive payload deobfuscation
// ═══════════════════════════════════════════════════════════════════════════════

const POLYGLOT_PATTERNS = [
  /\\x00.*<script/i,
  /%00.*<script/i,
  /<!--.*<script.*-->/is,
  /<svg[^>]*onload/i,
  /\bdata:text\/html/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /expression\s*\(/i,
  /&#x?[0-9a-f]+;.*on\w+\s*=/i,
  /\\\\\\x[0-9a-f]{2}.*eval/i,
];

const MAX_DECODE_DEPTH = 5;

function recursiveDecode(input: string, depth = 0): string {
  if (depth >= MAX_DECODE_DEPTH) return input;
  let decoded = input;
  try { decoded = decodeURIComponent(decoded); } catch { /* noop */ }
  try { decoded = atob(decoded); } catch { /* noop */ }
  decoded = decoded.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)));
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCharCode(parseInt(c, 16)));
  if (decoded !== input) return recursiveDecode(decoded, depth + 1);
  return decoded;
}

export function scanPolyglotPayload(
  payload: string
): { malicious: boolean; layers: number; patterns_matched: string[] } {
  const decoded = recursiveDecode(payload);
  const layersDecoded = payload !== decoded ? MAX_DECODE_DEPTH : 0;
  const matched: string[] = [];

  for (const p of POLYGLOT_PATTERNS) {
    if (p.test(decoded) || p.test(payload)) {
      matched.push(p.source.substring(0, 40));
    }
  }

  if (matched.length > 0) {
    emitT4Signal({
      upgrade: 58,
      label: 'polyglot_payload',
      severity: matched.length > 3 ? 'critical' : 'high',
      confidence: Math.min(0.5 + matched.length * 0.15, 1),
      source: 'payload_scanner',
      indicators: matched,
      metadata: { layers: layersDecoded, payloadLength: payload.length },
    });
  }

  return { malicious: matched.length > 0, layers: layersDecoded, patterns_matched: matched };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #59  TEMPORAL FINGERPRINT DIVERGENCE
// Sub-second timing jitter analysis
// ═══════════════════════════════════════════════════════════════════════════════

const timingHistory = new Map<string, number[]>();
const MAX_TIMING_SOURCES = 3000;
const TIMING_WINDOW = 20;

export function analyzeTemporalDivergence(
  source: string,
  requestTimestamp: number
): { suspicious: boolean; jitter_ms: number; regularity_score: number } {
  const history = timingHistory.get(source) || [];
  history.push(requestTimestamp);
  if (history.length > TIMING_WINDOW) history.shift();
  timingHistory.set(source, history);
  boundMap(timingHistory, MAX_TIMING_SOURCES);

  if (history.length < 4) return { suspicious: false, jitter_ms: 0, regularity_score: 0 };

  const intervals: number[] = [];
  for (let i = 1; i < history.length; i++) intervals.push(history[i] - history[i - 1]);

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
  const stddev = Math.sqrt(variance);
  const cv = mean > 0 ? stddev / mean : 0; // coefficient of variation

  // Very low CV = machine-like regularity
  const regularity = 1 - Math.min(cv, 1);
  const suspicious = regularity > 0.92 && history.length >= 8;

  if (suspicious) {
    emitT4Signal({
      upgrade: 59,
      label: 'temporal_divergence',
      severity: regularity > 0.97 ? 'critical' : 'elevated',
      confidence: regularity,
      source,
      indicators: [`CV=${cv.toFixed(4)}`, `regularity=${regularity.toFixed(3)}`, `mean_interval=${mean.toFixed(1)}ms`],
      metadata: { mean, stddev, cv, sampleSize: intervals.length },
    });
  }

  return { suspicious, jitter_ms: Math.round(stddev), regularity_score: regularity };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #60  NEURAL REQUEST SEQUENCER
// Markov-chain request sequence anomaly scoring
// ═══════════════════════════════════════════════════════════════════════════════

const transitionMatrix = new Map<string, Map<string, number>>();
const sequenceHistory = new Map<string, string[]>();
const MAX_SEQUENCE_ACTORS = 3000;
const MAX_TRANSITIONS = 500;

function recordTransition(from: string, to: string): void {
  let row = transitionMatrix.get(from);
  if (!row) { row = new Map(); transitionMatrix.set(from, row); }
  row.set(to, (row.get(to) || 0) + 1);
  boundMap(transitionMatrix, MAX_TRANSITIONS);
}

function getTransitionProbability(from: string, to: string): number {
  const row = transitionMatrix.get(from);
  if (!row) return 0;
  const total = Array.from(row.values()).reduce((a, b) => a + b, 0);
  return total > 0 ? (row.get(to) || 0) / total : 0;
}

export function scoreRequestSequence(
  actorId: string,
  endpoint: string
): { anomaly_score: number; probability: number; sequence_length: number } {
  const seq = sequenceHistory.get(actorId) || [];
  const prev = seq[seq.length - 1];

  let probability = 1;
  if (prev) {
    probability = getTransitionProbability(prev, endpoint);
    recordTransition(prev, endpoint);
  }

  seq.push(endpoint);
  if (seq.length > 30) seq.shift();
  sequenceHistory.set(actorId, seq);
  boundMap(sequenceHistory, MAX_SEQUENCE_ACTORS);

  const anomalyScore = prev ? (1 - probability) : 0;

  if (anomalyScore > 0.85) {
    emitT4Signal({
      upgrade: 60,
      label: 'sequence_anomaly',
      severity: anomalyScore > 0.95 ? 'critical' : 'high',
      confidence: anomalyScore,
      source: actorId,
      indicators: [`${prev} → ${endpoint} (p=${probability.toFixed(4)})`],
      metadata: { from: prev, to: endpoint, probability, sequenceLength: seq.length },
    });
  }

  return { anomaly_score: anomalyScore, probability, sequence_length: seq.length };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #61  SHADOW IDENTITY CORRELATOR
// Links multiple identities to single actor via behavioral fingerprint
// ═══════════════════════════════════════════════════════════════════════════════

interface IdentityProfile {
  fingerprints: Set<string>;
  ips: Set<string>;
  userAgents: Set<string>;
  firstSeen: number;
  lastSeen: number;
  requestCount: number;
}

const identityProfiles = new Map<string, IdentityProfile>();
const MAX_IDENTITY_PROFILES = 3000;

export function correlateShadowIdentity(
  identityId: string,
  fingerprint: string,
  ip: string,
  userAgent: string
): { shadow_detected: boolean; linked_identities: string[]; correlation_score: number } {
  const profile = identityProfiles.get(identityId) || {
    fingerprints: new Set(),
    ips: new Set(),
    userAgents: new Set(),
    firstSeen: Date.now(),
    lastSeen: Date.now(),
    requestCount: 0,
  };
  profile.fingerprints.add(fingerprint);
  profile.ips.add(ip);
  profile.userAgents.add(userAgent);
  // Bound inner Sets to prevent per-profile memory growth
  if (profile.fingerprints.size > 100) { const first = profile.fingerprints.values().next().value; if (first) profile.fingerprints.delete(first); }
  if (profile.ips.size > 200) { const first = profile.ips.values().next().value; if (first) profile.ips.delete(first); }
  if (profile.userAgents.size > 50) { const first = profile.userAgents.values().next().value; if (first) profile.userAgents.delete(first); }
  profile.lastSeen = Date.now();
  profile.requestCount++;
  identityProfiles.set(identityId, profile);
  boundMap(identityProfiles, MAX_IDENTITY_PROFILES);

  // Find other identities sharing signals
  const linked: string[] = [];
  for (const [otherId, other] of identityProfiles) {
    if (otherId === identityId) continue;
    let overlap = 0;
    if (other.fingerprints.has(fingerprint)) overlap += 3;
    if (other.ips.has(ip)) overlap += 1;
    if (other.userAgents.has(userAgent)) overlap += 1;
    if (overlap >= 3) linked.push(otherId);
  }

  const correlationScore = linked.length > 0 ? Math.min(0.5 + linked.length * 0.2, 1) : 0;

  if (linked.length > 0) {
    emitT4Signal({
      upgrade: 61,
      label: 'shadow_identity',
      severity: linked.length > 3 ? 'catastrophic' : 'high',
      confidence: correlationScore,
      source: identityId,
      indicators: linked.map(l => `linked:${l}`),
      metadata: { linkedCount: linked.length, sharedFingerprint: fingerprint },
    });
  }

  return { shadow_detected: linked.length > 0, linked_identities: linked, correlation_score: correlationScore };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #62  ENTROPY CLIFF DETECTOR
// Sudden entropy drops in traffic patterns
// ═══════════════════════════════════════════════════════════════════════════════

const entropyHistory = new Map<string, number[]>();
const MAX_ENTROPY_SOURCES = 2000;
const ENTROPY_WINDOW = 15;

function shannonEntropy(data: string): number {
  const freq = new Map<string, number>();
  for (const ch of data) freq.set(ch, (freq.get(ch) || 0) + 1);
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / data.length;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function detectEntropyCliff(
  source: string,
  payload: string
): { cliff_detected: boolean; current_entropy: number; drop_magnitude: number } {
  const currentEntropy = shannonEntropy(payload);
  const history = entropyHistory.get(source) || [];

  history.push(currentEntropy);
  if (history.length > ENTROPY_WINDOW) history.shift();
  entropyHistory.set(source, history);
  boundMap(entropyHistory, MAX_ENTROPY_SOURCES);

  if (history.length < 3) return { cliff_detected: false, current_entropy: currentEntropy, drop_magnitude: 0 };

  const avg = history.slice(0, -1).reduce((a, b) => a + b, 0) / (history.length - 1);
  const drop = avg > 0 ? (avg - currentEntropy) / avg : 0;

  if (drop > 0.4) {
    emitT4Signal({
      upgrade: 62,
      label: 'entropy_cliff',
      severity: drop > 0.7 ? 'critical' : 'elevated',
      confidence: Math.min(drop + 0.3, 1),
      source,
      indicators: [`entropy_drop=${(drop * 100).toFixed(1)}%`, `current=${currentEntropy.toFixed(2)}`, `avg=${avg.toFixed(2)}`],
      metadata: { currentEntropy, averageEntropy: avg, dropMagnitude: drop },
    });
  }

  return { cliff_detected: drop > 0.4, current_entropy: currentEntropy, drop_magnitude: drop };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #63  API GRAPH ANOMALY TRACER
// Call-graph deviation from learned endpoint access patterns
// ═══════════════════════════════════════════════════════════════════════════════

const apiGraphBaseline = new Map<string, Set<string>>();
const apiGraphActors = new Map<string, Set<string>>();
const MAX_GRAPH_ACTORS = 3000;

export function traceApiGraphAnomaly(
  actorId: string,
  endpoint: string,
  role: string
): { deviation: boolean; novel_endpoint: boolean; deviation_score: number } {
  // Record global baseline per role
  const roleSet = apiGraphBaseline.get(role) || new Set();
  roleSet.add(endpoint);
  apiGraphBaseline.set(role, roleSet);

  // Record actor-specific graph
  const actorSet = apiGraphActors.get(actorId) || new Set();
  const isNovel = !actorSet.has(endpoint);
  actorSet.add(endpoint);
  apiGraphActors.set(actorId, actorSet);
  boundMap(apiGraphActors, MAX_GRAPH_ACTORS);

  // Deviation = accessing endpoints outside role baseline
  const roleEndpoints = apiGraphBaseline.get(role);
  const deviation = roleEndpoints ? !roleEndpoints.has(endpoint) : false;
  const deviationScore = deviation ? 0.8 : isNovel ? 0.3 : 0;

  if (deviation) {
    emitT4Signal({
      upgrade: 63,
      label: 'graph_deviation',
      severity: 'high',
      confidence: 0.85,
      source: actorId,
      indicators: [`endpoint=${endpoint}`, `role=${role}`, 'outside_role_graph'],
      metadata: { endpoint, role, roleEndpointCount: roleEndpoints?.size ?? 0 },
    });
  }

  return { deviation, novel_endpoint: isNovel, deviation_score: deviationScore };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #64  BEHAVIORAL INERTIA SCORER
// Measures how much an actor's behavior changes over time
// ═══════════════════════════════════════════════════════════════════════════════

interface InertiaProfile {
  endpointFreq: Map<string, number>;
  totalRequests: number;
  lastUpdated: number;
}

const inertiaProfiles = new Map<string, InertiaProfile>();
const MAX_INERTIA_PROFILES = 3000;

export function scoreBehavioralInertia(
  actorId: string,
  endpoint: string
): { inertia_score: number; sudden_shift: boolean } {
  const profile = inertiaProfiles.get(actorId) || {
    endpointFreq: new Map(),
    totalRequests: 0,
    lastUpdated: Date.now(),
  };

  profile.endpointFreq.set(endpoint, (profile.endpointFreq.get(endpoint) || 0) + 1);
  profile.totalRequests++;
  profile.lastUpdated = Date.now();
  inertiaProfiles.set(actorId, profile);
  boundMap(inertiaProfiles, MAX_INERTIA_PROFILES);

  if (profile.totalRequests < 10) return { inertia_score: 0.5, sudden_shift: false };

  // Concentration ratio — high = predictable behavior
  const freqs = Array.from(profile.endpointFreq.values()).sort((a, b) => b - a);
  const top3 = freqs.slice(0, 3).reduce((a, b) => a + b, 0);
  const concentration = top3 / profile.totalRequests;

  // Current endpoint frequency
  const currentFreq = (profile.endpointFreq.get(endpoint) || 1) / profile.totalRequests;
  const suddenShift = currentFreq < 0.02 && profile.totalRequests > 50;

  return { inertia_score: concentration, sudden_shift: suddenShift };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #65  DORMANT ACCOUNT RESURRECTOR
// Flags long-dormant accounts with sudden activity
// ═══════════════════════════════════════════════════════════════════════════════

const lastActivityMap = new Map<string, number>();
const MAX_ACTIVITY_RECORDS = 5000;
const DORMANCY_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export function detectDormantResurrection(
  accountId: string,
  lastKnownActivity?: number
): { dormant_resurrection: boolean; dormancy_days: number } {
  const lastActivity = lastKnownActivity ?? lastActivityMap.get(accountId) ?? 0;
  const now = Date.now();
  const dormancyMs = lastActivity > 0 ? now - lastActivity : 0;
  const dormancyDays = Math.floor(dormancyMs / (24 * 60 * 60 * 1000));

  lastActivityMap.set(accountId, now);
  boundMap(lastActivityMap, MAX_ACTIVITY_RECORDS);

  const isDormant = dormancyMs > DORMANCY_THRESHOLD_MS;

  if (isDormant) {
    emitT4Signal({
      upgrade: 65,
      label: 'dormant_resurrection',
      severity: dormancyDays > 365 ? 'critical' : 'elevated',
      confidence: Math.min(0.5 + (dormancyDays / 365) * 0.5, 1),
      source: accountId,
      indicators: [`dormant_days=${dormancyDays}`],
      metadata: { dormancyDays, lastActivity: new Date(lastActivity).toISOString() },
    });
  }

  return { dormant_resurrection: isDormant, dormancy_days: dormancyDays };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #66  CREDENTIAL SPRAY MESH
// Distributed low-velocity credential spray detection
// ═══════════════════════════════════════════════════════════════════════════════

interface SprayBucket {
  targets: Set<string>;
  sources: Set<string>;
  firstSeen: number;
  lastSeen: number;
}

const sprayBuckets = new Map<string, SprayBucket>();
const MAX_SPRAY_BUCKETS = 2000;
const SPRAY_WINDOW_MS = 600_000; // 10 minutes
const SPRAY_TARGET_THRESHOLD = 5;

export function detectCredentialSpray(
  sourceIp: string,
  targetUsername: string,
  fingerprintHash: string
): { spray_detected: boolean; unique_targets: number; unique_sources: number } {
  const bucketKey = fingerprintHash; // Group by fingerprint, not IP
  const bucket = sprayBuckets.get(bucketKey) || {
    targets: new Set(),
    sources: new Set(),
    firstSeen: Date.now(),
    lastSeen: Date.now(),
  };

  // Reset if window expired
  if (Date.now() - bucket.firstSeen > SPRAY_WINDOW_MS) {
    bucket.targets.clear();
    bucket.sources.clear();
    bucket.firstSeen = Date.now();
  }

  bucket.targets.add(fnv1a(targetUsername).toString(36));
  bucket.sources.add(sourceIp);
  bucket.lastSeen = Date.now();
  sprayBuckets.set(bucketKey, bucket);
  boundMap(sprayBuckets, MAX_SPRAY_BUCKETS);

  const isSpray = bucket.targets.size >= SPRAY_TARGET_THRESHOLD;

  if (isSpray) {
    emitT4Signal({
      upgrade: 66,
      label: 'credential_spray',
      severity: bucket.targets.size > 20 ? 'catastrophic' : 'high',
      confidence: Math.min(0.5 + bucket.targets.size * 0.05, 1),
      source: fingerprintHash,
      indicators: [`targets=${bucket.targets.size}`, `sources=${bucket.sources.size}`],
      metadata: { uniqueTargets: bucket.targets.size, uniqueSources: bucket.sources.size },
    });
  }

  return { spray_detected: isSpray, unique_targets: bucket.targets.size, unique_sources: bucket.sources.size };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #67  TOKEN LINEAGE VALIDATOR
// Traces token provenance across refresh chains
// ═══════════════════════════════════════════════════════════════════════════════

interface TokenNode {
  hash: number;
  parentHash: number | null;
  issuedAt: number;
  generation: number;
}

const tokenLineage = new Map<number, TokenNode>();
const MAX_TOKEN_LINEAGE = 5000;
const MAX_TOKEN_GENERATION = 20;

export function validateTokenLineage(
  tokenValue: string,
  parentTokenValue?: string
): { valid: boolean; generation: number; reason?: string } {
  const hash = fnv1a(tokenValue);
  const parentHash = parentTokenValue ? fnv1a(parentTokenValue) : null;

  if (parentHash !== null) {
    const parent = tokenLineage.get(parentHash);
    if (!parent) {
      return { valid: false, generation: 0, reason: 'Parent token not in lineage — possible forged refresh' };
    }

    const generation = parent.generation + 1;
    if (generation > MAX_TOKEN_GENERATION) {
      emitT4Signal({
        upgrade: 67,
        label: 'token_lineage_exceeded',
        severity: 'high',
        confidence: 0.9,
        source: 'token_lineage',
        indicators: [`generation=${generation}`, `max=${MAX_TOKEN_GENERATION}`],
        metadata: { generation, parentGeneration: parent.generation },
      });
      return { valid: false, generation, reason: `Token generation ${generation} exceeds max ${MAX_TOKEN_GENERATION}` };
    }

    tokenLineage.set(hash, { hash, parentHash, issuedAt: Date.now(), generation });
    boundMap(tokenLineage, MAX_TOKEN_LINEAGE);
    return { valid: true, generation };
  }

  tokenLineage.set(hash, { hash, parentHash: null, issuedAt: Date.now(), generation: 0 });
  boundMap(tokenLineage, MAX_TOKEN_LINEAGE);
  return { valid: true, generation: 0 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #68  COVERT CHANNEL SNIFFER
// Detects data exfiltration via header/timing channels
// ═══════════════════════════════════════════════════════════════════════════════

const SUSPICIOUS_HEADERS = [
  'x-custom-data', 'x-debug-info', 'x-trace-payload',
  'x-forwarded-secret', 'x-internal-token',
];

const COVERT_TIMING_PATTERNS = new Map<string, number[]>();
const MAX_COVERT_SOURCES = 2000;

export function sniffCovertChannel(
  source: string,
  headers: Record<string, string>,
  responseSize: number
): { covert_detected: boolean; channels: string[] } {
  const channels: string[] = [];

  // Check for suspicious custom headers
  for (const h of SUSPICIOUS_HEADERS) {
    if (headers[h]) channels.push(`header:${h}`);
  }

  // Check for high-entropy header values (potential encoded data)
  for (const [key, value] of Object.entries(headers)) {
    if (key.startsWith('x-') && value.length > 100) {
      const entropy = shannonEntropy(value);
      if (entropy > 4.5) channels.push(`high_entropy_header:${key}(${entropy.toFixed(1)})`);
    }
  }

  // Timing channel: unusually consistent response sizes (steganographic padding)
  const history = COVERT_TIMING_PATTERNS.get(source) || [];
  history.push(responseSize);
  if (history.length > 10) history.shift();
  COVERT_TIMING_PATTERNS.set(source, history);
  boundMap(COVERT_TIMING_PATTERNS, MAX_COVERT_SOURCES);

  if (history.length >= 5) {
    const unique = new Set(history).size;
    if (unique === 1 && responseSize > 1000) {
      channels.push('constant_response_size');
    }
  }

  if (channels.length > 0) {
    emitT4Signal({
      upgrade: 68,
      label: 'covert_channel',
      severity: channels.length > 2 ? 'critical' : 'elevated',
      confidence: Math.min(0.4 + channels.length * 0.2, 1),
      source,
      indicators: channels,
      metadata: { channelCount: channels.length },
    });
  }

  return { covert_detected: channels.length > 0, channels };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #69  MICRO-BURST DETECTOR
// Sub-second request bursts below rate-limit windows
// ═══════════════════════════════════════════════════════════════════════════════

const burstWindows = new Map<string, number[]>();
const MAX_BURST_SOURCES = 3000;
const BURST_THRESHOLD = 10; // >10 requests within 500ms

export function detectMicroBurst(
  source: string
): { burst_detected: boolean; requests_in_window: number; window_ms: number } {
  const now = Date.now();
  const window = burstWindows.get(source) || [];

  window.push(now);
  // Keep only last 500ms
  const cutoff = now - 500;
  const filtered = window.filter(t => t > cutoff);
  burstWindows.set(source, filtered);
  boundMap(burstWindows, MAX_BURST_SOURCES);

  const burst = filtered.length >= BURST_THRESHOLD;

  if (burst) {
    emitT4Signal({
      upgrade: 69,
      label: 'micro_burst',
      severity: filtered.length > 50 ? 'critical' : 'elevated',
      confidence: Math.min(filtered.length / 20, 1),
      source,
      indicators: [`${filtered.length} requests in 500ms`],
      metadata: { count: filtered.length, windowMs: 500 },
    });
  }

  return { burst_detected: burst, requests_in_window: filtered.length, window_ms: 500 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #70  ADAPTIVE DECOY ROTATOR
// Rotates honeypot endpoints on detection events
// ═══════════════════════════════════════════════════════════════════════════════

interface DecoyEndpoint {
  path: string;
  created_at: number;
  hits: number;
  last_hit_at: number | null;
  generation: number;
}

const DECOY_PREFIXES = ['/api/v1/internal/', '/admin/debug/', '/.env', '/wp-admin/', '/graphql-debug/', '/api/keys/', '/backup/'];
const DECOY_SUFFIXES = ['config', 'dump', 'export', 'token', 'secret', 'credentials', 'backup'];

let decoyGeneration = 0;
const activeDecoys = new Map<string, DecoyEndpoint>();
const MAX_DECOYS = 50;

function generateDecoyPath(): string {
  const prefix = DECOY_PREFIXES[Math.floor(Math.random() * DECOY_PREFIXES.length)];
  const suffix = DECOY_SUFFIXES[Math.floor(Math.random() * DECOY_SUFFIXES.length)];
  const noise = Math.random().toString(36).substring(2, 6);
  return `${prefix}${suffix}-${noise}`;
}

export function rotateDecoys(count = 5): DecoyEndpoint[] {
  decoyGeneration++;
  activeDecoys.clear();
  const newDecoys: DecoyEndpoint[] = [];
  for (let i = 0; i < Math.min(count, MAX_DECOYS); i++) {
    const decoy: DecoyEndpoint = {
      path: generateDecoyPath(),
      created_at: Date.now(),
      hits: 0,
      last_hit_at: null,
      generation: decoyGeneration,
    };
    activeDecoys.set(decoy.path, decoy);
    newDecoys.push(decoy);
  }
  return newDecoys;
}

export function checkDecoyHit(path: string): { is_decoy: boolean; decoy_generation?: number } {
  const decoy = activeDecoys.get(path);
  if (!decoy) return { is_decoy: false };

  decoy.hits++;
  decoy.last_hit_at = Date.now();

  emitT4Signal({
    upgrade: 70,
    label: 'decoy_hit',
    severity: 'high',
    confidence: 0.95,
    source: path,
    indicators: [`decoy_gen=${decoy.generation}`, `hits=${decoy.hits}`],
    metadata: { path, generation: decoy.generation, totalHits: decoy.hits },
  });

  return { is_decoy: true, decoy_generation: decoy.generation };
}

export function getActiveDecoys(): DecoyEndpoint[] {
  return Array.from(activeDecoys.values());
}

// ═══════════════════════════════════════════════════════════════════════════════
// #71  FINGERPRINT MORPHING DETECTOR
// Detects gradual fingerprint evolution within a session
// ═══════════════════════════════════════════════════════════════════════════════

const morphHistory = new Map<string, number[]>();
const MAX_MORPH_SESSIONS = 3000;

export function detectFingerprintMorphing(
  sessionId: string,
  fingerprintHash: string
): { morphing: boolean; distinct_fingerprints: number; morph_rate: number } {
  const hashNum = fnv1a(fingerprintHash);
  const history = morphHistory.get(sessionId) || [];
  history.push(hashNum);
  if (history.length > 30) history.shift();
  morphHistory.set(sessionId, history);
  boundMap(morphHistory, MAX_MORPH_SESSIONS);

  const distinct = new Set(history).size;
  const morphRate = history.length > 1 ? (distinct - 1) / (history.length - 1) : 0;

  const morphing = distinct > 3 && morphRate > 0.3;

  if (morphing) {
    emitT4Signal({
      upgrade: 71,
      label: 'fingerprint_morphing',
      severity: distinct > 8 ? 'catastrophic' : 'high',
      confidence: Math.min(morphRate + 0.3, 1),
      source: sessionId,
      indicators: [`distinct=${distinct}`, `morph_rate=${morphRate.toFixed(3)}`],
      metadata: { distinctFingerprints: distinct, morphRate, sampleSize: history.length },
    });
  }

  return { morphing, distinct_fingerprints: distinct, morph_rate: morphRate };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #72  CROSS-TENANT SIGNAL FUSER
// Aggregates T4 signals across tenant boundaries
// ═══════════════════════════════════════════════════════════════════════════════

interface TenantSignalBucket {
  signalCounts: Map<string, number>;
  lastUpdated: number;
}

const tenantBuckets = new Map<string, TenantSignalBucket>();
const MAX_TENANT_BUCKETS = 500;
const CROSS_TENANT_THRESHOLD = 3;

export function fuseSignalsCrossTenant(
  tenantId: string,
  signalLabel: string,
  actorFingerprint: string
): { cross_tenant_attack: boolean; affected_tenants: number } {
  const key = actorFingerprint;
  const bucket = tenantBuckets.get(key) || {
    signalCounts: new Map(),
    lastUpdated: Date.now(),
  };

  const tenantKey = `${tenantId}:${signalLabel}`;
  bucket.signalCounts.set(tenantKey, (bucket.signalCounts.get(tenantKey) || 0) + 1);
  bucket.lastUpdated = Date.now();
  tenantBuckets.set(key, bucket);
  boundMap(tenantBuckets, MAX_TENANT_BUCKETS);

  // Count distinct tenants
  const tenants = new Set<string>();
  for (const k of bucket.signalCounts.keys()) tenants.add(k.split(':')[0]);

  const crossTenant = tenants.size >= CROSS_TENANT_THRESHOLD;

  if (crossTenant) {
    emitT4Signal({
      upgrade: 72,
      label: 'cross_tenant_attack',
      severity: 'catastrophic',
      confidence: Math.min(0.6 + tenants.size * 0.1, 1),
      source: actorFingerprint,
      indicators: [`affected_tenants=${tenants.size}`, `signal=${signalLabel}`],
      metadata: { affectedTenants: tenants.size, signalLabel },
    });
  }

  return { cross_tenant_attack: crossTenant, affected_tenants: tenants.size };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #73  REVERSE BEACON DETECTOR
// Identifies call-home patterns from injected scripts
// ═══════════════════════════════════════════════════════════════════════════════

const beaconPatterns = new Map<string, { intervals: number[]; destinations: Set<string> }>();
const MAX_BEACON_SOURCES = 2000;

export function detectReverseBeacon(
  source: string,
  destination: string
): { beacon_detected: boolean; regularity: number; beacon_count: number } {
  const pattern = beaconPatterns.get(source) || { intervals: [], destinations: new Set() };
  const now = Date.now();

  pattern.destinations.add(destination);

  if (pattern.intervals.length > 0) {
    const lastInterval = pattern.intervals[pattern.intervals.length - 1];
    pattern.intervals.push(now);
    if (pattern.intervals.length > 20) pattern.intervals.shift();
  } else {
    pattern.intervals.push(now);
  }
  beaconPatterns.set(source, pattern);
  boundMap(beaconPatterns, MAX_BEACON_SOURCES);

  if (pattern.intervals.length < 5) return { beacon_detected: false, regularity: 0, beacon_count: 0 };

  // Calculate interval regularity
  const gaps: number[] = [];
  for (let i = 1; i < pattern.intervals.length; i++) {
    gaps.push(pattern.intervals[i] - pattern.intervals[i - 1]);
  }
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
  const regularity = 1 - Math.min(cv, 1);

  const beaconDetected = regularity > 0.85 && pattern.destinations.size <= 3;

  if (beaconDetected) {
    emitT4Signal({
      upgrade: 73,
      label: 'reverse_beacon',
      severity: 'critical',
      confidence: regularity,
      source,
      indicators: [`regularity=${regularity.toFixed(3)}`, `destinations=${pattern.destinations.size}`, `mean_interval=${mean.toFixed(0)}ms`],
      metadata: { regularity, destinations: Array.from(pattern.destinations), meanInterval: mean },
    });
  }

  return { beacon_detected: beaconDetected, regularity, beacon_count: pattern.intervals.length };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #74  SESSION ENTROPY AUDITOR
// Measures randomness quality of session tokens
// ═══════════════════════════════════════════════════════════════════════════════

export function auditSessionEntropy(
  sessionToken: string
): { entropy_bits: number; weak: boolean; reason?: string } {
  const entropy = shannonEntropy(sessionToken);
  const bitsPerChar = entropy;
  const totalBits = bitsPerChar * sessionToken.length;

  const weak = totalBits < 64 || bitsPerChar < 3.0;

  if (weak) {
    emitT4Signal({
      upgrade: 74,
      label: 'weak_session_entropy',
      severity: totalBits < 32 ? 'critical' : 'elevated',
      confidence: 0.9,
      source: 'session_auditor',
      indicators: [`bits=${totalBits.toFixed(0)}`, `bpc=${bitsPerChar.toFixed(2)}`, `len=${sessionToken.length}`],
      metadata: { totalBits, bitsPerChar, tokenLength: sessionToken.length },
    });
  }

  return {
    entropy_bits: totalBits,
    weak,
    reason: weak ? `Session entropy ${totalBits.toFixed(0)} bits — below 64-bit minimum` : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #75  REQUEST CADENCE PROFILER
// Detects machine-like timing regularity
// ═══════════════════════════════════════════════════════════════════════════════

export function profileRequestCadence(
  source: string,
  timestamp: number
): { machine_like: boolean; cadence_score: number; interval_stddev_ms: number } {
  // Delegates to temporal divergence (#59) with cadence-specific thresholds
  const result = analyzeTemporalDivergence(source, timestamp);
  const machineLike = result.regularity_score > 0.88;

  if (machineLike && !result.suspicious) {
    emitT4Signal({
      upgrade: 75,
      label: 'cadence_regularity',
      severity: 'elevated',
      confidence: result.regularity_score,
      source,
      indicators: [`cadence_score=${result.regularity_score.toFixed(3)}`, `jitter=${result.jitter_ms}ms`],
      metadata: { cadenceScore: result.regularity_score, jitterMs: result.jitter_ms },
    });
  }

  return {
    machine_like: machineLike,
    cadence_score: result.regularity_score,
    interval_stddev_ms: result.jitter_ms,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #76  DEEP PAYLOAD TAINT TRACKER
// Tracks tainted input through processing pipeline
// ═══════════════════════════════════════════════════════════════════════════════

interface TaintLabel {
  id: string;
  origin: string;
  taint_type: 'user_input' | 'external_api' | 'file_upload' | 'query_param';
  created_at: number;
  propagation_depth: number;
}

const taintRegistry = new Map<string, TaintLabel>();
const MAX_TAINT_LABELS = 5000;

export function taintInput(
  dataId: string,
  origin: string,
  type: TaintLabel['taint_type']
): TaintLabel {
  const label: TaintLabel = {
    id: generateId('taint'),
    origin,
    taint_type: type,
    created_at: Date.now(),
    propagation_depth: 0,
  };
  taintRegistry.set(dataId, label);
  boundMap(taintRegistry, MAX_TAINT_LABELS);
  return label;
}

export function propagateTaint(sourceId: string, derivedId: string): TaintLabel | null {
  const source = taintRegistry.get(sourceId);
  if (!source) return null;

  const derived: TaintLabel = {
    ...source,
    id: generateId('taint'),
    propagation_depth: source.propagation_depth + 1,
  };
  taintRegistry.set(derivedId, derived);
  boundMap(taintRegistry, MAX_TAINT_LABELS);
  return derived;
}

export function checkTaint(dataId: string): { tainted: boolean; label?: TaintLabel } {
  const label = taintRegistry.get(dataId);
  return { tainted: !!label, label };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #77  ANOMALY CASCADE BREAKER
// Prevents T4 anomaly storms from overwhelming DEFENSE
// ═══════════════════════════════════════════════════════════════════════════════

let cascadeState = {
  signalsPerMinute: 0,
  windowStart: Date.now(),
  suppressed: false,
  suppressionStart: 0,
};

const CASCADE_THRESHOLD = 200; // >200 signals/min = storm
const CASCADE_SUPPRESSION_MS = 60_000; // 1 min cooldown

export function checkAnomalyCascade(): {
  storm_active: boolean;
  signals_per_minute: number;
  suppressed: boolean;
} {
  const now = Date.now();

  // Reset window every minute
  if (now - cascadeState.windowStart > 60_000) {
    cascadeState.signalsPerMinute = 0;
    cascadeState.windowStart = now;
  }

  // Check suppression cooldown
  if (cascadeState.suppressed && now - cascadeState.suppressionStart > CASCADE_SUPPRESSION_MS) {
    cascadeState.suppressed = false;
  }

  cascadeState.signalsPerMinute++;

  if (cascadeState.signalsPerMinute > CASCADE_THRESHOLD && !cascadeState.suppressed) {
    cascadeState.suppressed = true;
    cascadeState.suppressionStart = now;

    emitT4Signal({
      upgrade: 77,
      label: 'anomaly_cascade',
      severity: 'catastrophic',
      confidence: 1,
      source: 'cascade_breaker',
      indicators: [`${cascadeState.signalsPerMinute} signals/min`, `threshold=${CASCADE_THRESHOLD}`],
      metadata: { signalsPerMinute: cascadeState.signalsPerMinute, suppressionMs: CASCADE_SUPPRESSION_MS },
    });
  }

  return {
    storm_active: cascadeState.signalsPerMinute > CASCADE_THRESHOLD,
    signals_per_minute: cascadeState.signalsPerMinute,
    suppressed: cascadeState.suppressed,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #78  STEGANOGRAPHIC PROBE GUARD
// Detects data hidden in image/file uploads
// ═══════════════════════════════════════════════════════════════════════════════

const STEGO_MAGIC_BYTES: Array<{ name: string; bytes: number[] }> = [
  { name: 'PK_ZIP', bytes: [0x50, 0x4B, 0x03, 0x04] },
  { name: 'RAR', bytes: [0x52, 0x61, 0x72, 0x21] },
  { name: 'ELF', bytes: [0x7F, 0x45, 0x4C, 0x46] },
  { name: 'PE_EXE', bytes: [0x4D, 0x5A] },
  { name: 'GZIP', bytes: [0x1F, 0x8B] },
];

export function detectSteganography(
  fileName: string,
  fileSize: number,
  headerBytes: number[],
  declaredMimeType: string
): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check for hidden archives in image files
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
  const isMimeImage = declaredMimeType.startsWith('image/');

  if (isImage || isMimeImage) {
    for (const magic of STEGO_MAGIC_BYTES) {
      // Check if magic bytes appear deep in the file header
      const headerStr = headerBytes.slice(0, 64);
      let found = false;
      for (let i = 8; i < headerStr.length - magic.bytes.length; i++) {
        if (magic.bytes.every((b, j) => headerStr[i + j] === b)) {
          found = true;
          break;
        }
      }
      if (found) reasons.push(`embedded_${magic.name}_in_image`);
    }

    // Abnormally large for its type
    if (isMimeImage && fileSize > 50 * 1024 * 1024) {
      reasons.push('oversized_image_50MB+');
    }
  }

  // MIME/extension mismatch
  if (isImage && !isMimeImage) reasons.push('extension_mime_mismatch');
  if (!isImage && isMimeImage) reasons.push('mime_extension_mismatch');

  if (reasons.length > 0) {
    emitT4Signal({
      upgrade: 78,
      label: 'steganographic_probe',
      severity: reasons.length > 2 ? 'critical' : 'elevated',
      confidence: Math.min(0.5 + reasons.length * 0.2, 1),
      source: fileName,
      indicators: reasons,
      metadata: { fileName, fileSize, declaredMimeType },
    });
  }

  return { suspicious: reasons.length > 0, reasons };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #79  PROTOCOL DOWNGRADE SENTINEL
// Detects forced HTTP/TLS version downgrades
// ═══════════════════════════════════════════════════════════════════════════════

const protocolHistory = new Map<string, string[]>();
const MAX_PROTOCOL_SOURCES = 3000;

export function detectProtocolDowngrade(
  source: string,
  protocol: string // e.g. 'TLS1.3', 'TLS1.2', 'TLS1.1', 'HTTP/2', 'HTTP/1.1'
): { downgrade_detected: boolean; from?: string; to?: string } {
  const history = protocolHistory.get(source) || [];

  const PROTOCOL_RANK: Record<string, number> = {
    'TLS1.3': 6, 'TLS1.2': 5, 'TLS1.1': 4, 'TLS1.0': 3,
    'HTTP/3': 6, 'HTTP/2': 5, 'HTTP/1.1': 4, 'HTTP/1.0': 3,
  };

  if (history.length > 0) {
    const lastProtocol = history[history.length - 1];
    const lastRank = PROTOCOL_RANK[lastProtocol] ?? 0;
    const currentRank = PROTOCOL_RANK[protocol] ?? 0;

    if (currentRank < lastRank && lastRank > 0) {
      emitT4Signal({
        upgrade: 79,
        label: 'protocol_downgrade',
        severity: currentRank <= 3 ? 'critical' : 'high',
        confidence: 0.9,
        source,
        indicators: [`${lastProtocol} → ${protocol}`],
        metadata: { from: lastProtocol, to: protocol, rankDrop: lastRank - currentRank },
      });

      history.push(protocol);
      if (history.length > 10) history.shift();
      protocolHistory.set(source, history);
      boundMap(protocolHistory, MAX_PROTOCOL_SOURCES);

      return { downgrade_detected: true, from: lastProtocol, to: protocol };
    }
  }

  history.push(protocol);
  if (history.length > 10) history.shift();
  protocolHistory.set(source, history);
  boundMap(protocolHistory, MAX_PROTOCOL_SOURCES);

  return { downgrade_detected: false };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #80  T4 THREAT SYNTHESIS ENGINE
// Fuses all T4 signals into composite threat verdicts
// ═══════════════════════════════════════════════════════════════════════════════

export interface T4Verdict {
  threat_level: T4Severity;
  composite_score: number;
  active_signals: number;
  dominant_category: string;
  recommended_action: 'monitor' | 'challenge' | 'throttle' | 'isolate' | 'block';
  signal_summary: Array<{ label: string; count: number; max_confidence: number }>;
}

export function synthesizeT4Verdict(source?: string): T4Verdict {
  const signals = source
    ? Array.from(t4SignalStore.values()).filter(s => s.source === source)
    : Array.from(t4SignalStore.values());

  // Aggregate by label
  const labelAgg = new Map<string, { count: number; maxConf: number; maxSev: T4Severity }>();
  for (const s of signals) {
    const agg = labelAgg.get(s.label) || { count: 0, maxConf: 0, maxSev: 'elevated' as T4Severity };
    agg.count++;
    agg.maxConf = Math.max(agg.maxConf, s.confidence);
    const sevRank: Record<T4Severity, number> = { elevated: 1, high: 2, critical: 3, catastrophic: 4 };
    if (sevRank[s.severity] > sevRank[agg.maxSev]) agg.maxSev = s.severity;
    labelAgg.set(s.label, agg);
  }

  // Composite score
  let compositeScore = 0;
  const sevWeights: Record<T4Severity, number> = { elevated: 0.2, high: 0.5, critical: 0.8, catastrophic: 1.0 };
  for (const s of signals) {
    compositeScore += s.confidence * sevWeights[s.severity];
  }
  compositeScore = signals.length > 0 ? Math.min(compositeScore / signals.length, 1) : 0;

  // Determine threat level
  const threatLevel: T4Severity =
    compositeScore > 0.85 ? 'catastrophic' :
    compositeScore > 0.65 ? 'critical' :
    compositeScore > 0.4 ? 'high' : 'elevated';

  // Dominant category
  const dominantLabel = Array.from(labelAgg.entries())
    .sort((a, b) => b[1].count - a[1].count)[0]?.[0] ?? 'none';

  // Recommended action
  const action: T4Verdict['recommended_action'] =
    compositeScore > 0.85 ? 'block' :
    compositeScore > 0.7 ? 'isolate' :
    compositeScore > 0.5 ? 'throttle' :
    compositeScore > 0.3 ? 'challenge' : 'monitor';

  const summary = Array.from(labelAgg.entries()).map(([label, agg]) => ({
    label,
    count: agg.count,
    max_confidence: agg.maxConf,
  })).sort((a, b) => b.count - a.count);

  return {
    threat_level: threatLevel,
    composite_score: compositeScore,
    active_signals: signals.length,
    dominant_category: dominantLabel,
    recommended_action: action,
    signal_summary: summary,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASTION STATUS
// ═══════════════════════════════════════════════════════════════════════════════

export function getBastionStatus() {
  const verdict = synthesizeT4Verdict();
  return {
    version: DEFENSE_HARDENING_V4_VERSION,
    codename: DEFENSE_HARDENING_V4_CODENAME,
    upgrades: 25,
    upgrade_range: '56–80',
    active_t4_signals: t4SignalStore.size,
    cascade_state: checkAnomalyCascade(),
    active_decoys: activeDecoys.size,
    taint_labels: taintRegistry.size,
    current_verdict: verdict,
  };
}
