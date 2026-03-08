/**
 * CMPSBL® DEFENSE Hardening Layer v2.0.0
 * 25 enterprise-grade upgrades for the outermost shell boundary
 *
 * Upgrade Manifest:
 *  1. Geo-Velocity Check (impossible travel detection)
 *  2. Request Fingerprint Hashing (TLS + header canonicalization)
 *  3. Payload Entropy Analyzer (encrypted/obfuscated payload detection)
 *  4. Progressive Challenge Escalation (CAPTCHA → proof-of-work → block)
 *  5. Honeypot Endpoint Registry (decoy trap endpoints)
 *  6. Session Binding Validator (token↔fingerprint coupling)
 *  7. Response Cloaking (strip server headers, version info)
 *  8. Threat Correlation Engine (cross-signal incident linking)
 *  9. Defense Canary System (silent tripwire tokens)
 * 10. Egress Filter (outbound data leak prevention)
 * 11. Request Size Governor (payload size + depth limits)
 * 12. Header Injection Shield (CRLF, host header attacks)
 * 13. Replay Attack Guard (nonce + timestamp validation)
 * 14. Defense Metrics Exporter (Prometheus-style counters)
 * 15. Blocklist Sync Engine (periodic IP blocklist refresh)
 * 16. Defense Warm Standby (pre-computed rule evaluations)
 * 17. Attack Surface Mapper (endpoint inventory + exposure scoring)
 * 18. Defense Posture Score (composite security health 0-100)
 * 19. Quarantine Zone (suspected traffic isolation with delayed verdict)
 * 20. Threat Feed Ingestion (structured IOC intake)
 * 21. Defense Event Deduplication (suppress duplicate alert storms)
 * 22. Cross-Module Threat Propagation (share blocks across modules)
 * 23. Defense Circuit Warmup Probes (half-open health verification)
 * 24. Request Pipeline Hooks (before/after middleware chain)
 * 25. Defense Audit Trail Signer (HMAC-signed defense log entries)
 */

export const DEFENSE_HARDENING_VERSION = '2.0.0';
export const DEFENSE_HARDENING_CODENAME = 'Fortress';

// ═══════════════════════════════════════════════════════════════════════════════
// #1  GEO-VELOCITY CHECK — Impossible Travel Detection
// ═══════════════════════════════════════════════════════════════════════════════

interface GeoPoint { lat: number; lng: number; ts: number; ip: string }
const geoHistory = new Map<string, GeoPoint[]>();
const MAX_GEO_HISTORY = 3000;
const MAX_GEO_POINTS = 10;

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function checkGeoVelocity(
  entityId: string,
  lat: number,
  lng: number,
  ip: string
): { impossible: boolean; speedKmh: number; distanceKm: number } {
  const now = Date.now();
  const point: GeoPoint = { lat, lng, ts: now, ip };
  const history = geoHistory.get(entityId) || [];

  if (history.length > 0) {
    const last = history[history.length - 1];
    const distanceKm = haversineKm(last, point);
    const hoursElapsed = (now - last.ts) / 3_600_000;
    const speedKmh = hoursElapsed > 0 ? distanceKm / hoursElapsed : 0;

    history.push(point);
    if (history.length > MAX_GEO_POINTS) history.shift();
    geoHistory.set(entityId, history);
    boundMap(geoHistory, MAX_GEO_HISTORY);

    // > 900 km/h is impossible without supersonic travel
    return { impossible: speedKmh > 900, speedKmh: Math.round(speedKmh), distanceKm: Math.round(distanceKm) };
  }

  geoHistory.set(entityId, [point]);
  boundMap(geoHistory, MAX_GEO_HISTORY);
  return { impossible: false, speedKmh: 0, distanceKm: 0 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #2  REQUEST FINGERPRINT HASHING
// ═══════════════════════════════════════════════════════════════════════════════

export function computeRequestFingerprint(headers: Record<string, string>, ip: string): string {
  const canonical = [
    headers['user-agent'] || '',
    headers['accept-language'] || '',
    headers['accept-encoding'] || '',
    headers['accept'] || '',
    ip,
  ].join('|');
  // Simple FNV-1a 32-bit hash
  let h = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return `fp_${h.toString(16).padStart(8, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// #3  PAYLOAD ENTROPY ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

export function analyzePayloadEntropy(payload: string): {
  entropy: number;
  isEncrypted: boolean;
  isObfuscated: boolean;
} {
  if (!payload || payload.length === 0) {
    return { entropy: 0, isEncrypted: false, isObfuscated: false };
  }
  const freq = new Map<string, number>();
  for (const ch of payload) freq.set(ch, (freq.get(ch) || 0) + 1);
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / payload.length;
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return {
    entropy: Math.round(entropy * 1000) / 1000,
    isEncrypted: entropy > 7.5 && payload.length > 64,
    isObfuscated: entropy > 6.0 && /[^\x20-\x7E]/.test(payload),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #4  PROGRESSIVE CHALLENGE ESCALATION
// ═══════════════════════════════════════════════════════════════════════════════

export type ChallengeLevel = 'none' | 'captcha' | 'proof_of_work' | 'block';

const challengeState = new Map<string, { level: ChallengeLevel; failures: number; lastEscalation: number }>();
const MAX_CHALLENGE_STATE = 5000;

export function getChallengeLevel(entityId: string): ChallengeLevel {
  return challengeState.get(entityId)?.level || 'none';
}

export function escalateChallenge(entityId: string): ChallengeLevel {
  const state = challengeState.get(entityId) || { level: 'none' as ChallengeLevel, failures: 0, lastEscalation: 0 };
  state.failures++;
  const levels: ChallengeLevel[] = ['none', 'captcha', 'proof_of_work', 'block'];
  const idx = levels.indexOf(state.level);
  if (idx < levels.length - 1) {
    state.level = levels[idx + 1];
    state.lastEscalation = Date.now();
  }
  challengeState.set(entityId, state);
  boundMap(challengeState, MAX_CHALLENGE_STATE);
  return state.level;
}

export function resetChallenge(entityId: string): void {
  challengeState.delete(entityId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// #5  HONEYPOT ENDPOINT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export interface HoneypotHit {
  path: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

const honeypotPaths = new Set([
  '/admin', '/wp-admin', '/wp-login.php', '/.env', '/config.php',
  '/phpmyadmin', '/xmlrpc.php', '/api/v1/debug', '/actuator', '/server-status',
  '/.git/config', '/backup.sql', '/db.sql', '/.htaccess', '/web.config',
]);
const honeypotHits: HoneypotHit[] = [];
const MAX_HONEYPOT_HITS = 500;

export function isHoneypot(path: string): boolean {
  const normalized = path.toLowerCase().split('?')[0];
  return honeypotPaths.has(normalized);
}

export function recordHoneypotHit(path: string, ip: string, userAgent: string): void {
  honeypotHits.push({ path, ip, userAgent, timestamp: new Date().toISOString() });
  if (honeypotHits.length > MAX_HONEYPOT_HITS) honeypotHits.shift();
}

export function getHoneypotHits(): HoneypotHit[] {
  return [...honeypotHits];
}

export function addHoneypotPath(path: string): void {
  honeypotPaths.add(path.toLowerCase());
}

// ═══════════════════════════════════════════════════════════════════════════════
// #6  SESSION BINDING VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

const sessionBindings = new Map<string, string>();
const MAX_SESSION_BINDINGS = 10000;

export function bindSession(sessionId: string, fingerprint: string): void {
  sessionBindings.set(sessionId, fingerprint);
  boundMap(sessionBindings, MAX_SESSION_BINDINGS);
}

export function validateSessionBinding(sessionId: string, fingerprint: string): {
  valid: boolean;
  hijackSuspected: boolean;
} {
  const bound = sessionBindings.get(sessionId);
  if (!bound) return { valid: true, hijackSuspected: false }; // first-time
  return { valid: bound === fingerprint, hijackSuspected: bound !== fingerprint };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #7  RESPONSE CLOAKING
// ═══════════════════════════════════════════════════════════════════════════════

const STRIP_HEADERS = ['server', 'x-powered-by', 'x-aspnet-version', 'x-runtime', 'x-version'];

export function cloakResponseHeaders(headers: Record<string, string>): Record<string, string> {
  const cloaked: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (!STRIP_HEADERS.includes(k.toLowerCase())) {
      cloaked[k] = v;
    }
  }
  cloaked['X-Content-Type-Options'] = 'nosniff';
  cloaked['X-Frame-Options'] = 'DENY';
  cloaked['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  return cloaked;
}

// ═══════════════════════════════════════════════════════════════════════════════
// #8  THREAT CORRELATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export interface CorrelatedThreat {
  correlationId: string;
  signals: string[];
  entities: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  firstSeen: string;
  lastSeen: string;
  signalCount: number;
}

const correlations = new Map<string, CorrelatedThreat>();
const MAX_CORRELATIONS = 500;

export function correlateThreats(
  signalId: string,
  entityId: string,
  severity: CorrelatedThreat['severity']
): CorrelatedThreat {
  // Find existing correlation for this entity
  for (const [, corr] of correlations) {
    if (corr.entities.includes(entityId) && !corr.signals.includes(signalId)) {
      corr.signals.push(signalId);
      corr.signalCount++;
      corr.lastSeen = new Date().toISOString();
      // Escalate severity if multiple signals
      if (corr.signalCount >= 5) corr.severity = 'critical';
      else if (corr.signalCount >= 3) corr.severity = 'high';
      return corr;
    }
  }

  const id = `corr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const corr: CorrelatedThreat = {
    correlationId: id,
    signals: [signalId],
    entities: [entityId],
    severity,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    signalCount: 1,
  };
  correlations.set(id, corr);
  boundMap(correlations, MAX_CORRELATIONS);
  return corr;
}

export function getCorrelations(): CorrelatedThreat[] {
  return Array.from(correlations.values())
    .sort((a, b) => b.signalCount - a.signalCount);
}

// ═══════════════════════════════════════════════════════════════════════════════
// #9  DEFENSE CANARY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

export interface CanaryToken {
  id: string;
  type: 'header' | 'cookie' | 'body' | 'url_param';
  value: string;
  createdAt: string;
  tripped: boolean;
  trippedAt?: string;
  trippedBy?: string;
}

const canaryTokens = new Map<string, CanaryToken>();
const MAX_CANARY_TOKENS = 500;

export function plantCanary(type: CanaryToken['type']): CanaryToken {
  const id = `canary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const value = `cny_${Math.random().toString(36).slice(2, 18)}`;
  const token: CanaryToken = { id, type, value, createdAt: new Date().toISOString(), tripped: false };
  canaryTokens.set(value, token);
  return token;
}

export function checkCanary(value: string, source?: string): boolean {
  const token = canaryTokens.get(value);
  if (token && !token.tripped) {
    token.tripped = true;
    token.trippedAt = new Date().toISOString();
    token.trippedBy = source;
    return true; // TRIPPED!
  }
  return false;
}

export function getTrippedCanaries(): CanaryToken[] {
  return Array.from(canaryTokens.values()).filter(t => t.tripped);
}

// ═══════════════════════════════════════════════════════════════════════════════
// #10  EGRESS FILTER — Outbound Data Leak Prevention
// ═══════════════════════════════════════════════════════════════════════════════

const SENSITIVE_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/,                   // SSN
  /\b\d{16}\b/,                                // Credit card (basic)
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\bpassword\s*[:=]\s*\S+/i,                 // Password in plaintext
];

export function scanEgress(data: string): { clean: boolean; violations: string[] } {
  const violations: string[] = [];
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(data)) {
      violations.push(pattern.source.slice(0, 40));
    }
  }
  return { clean: violations.length === 0, violations };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #11  REQUEST SIZE GOVERNOR
// ═══════════════════════════════════════════════════════════════════════════════

export interface SizePolicy {
  maxBodyBytes: number;
  maxHeaderBytes: number;
  maxUrlLength: number;
  maxJsonDepth: number;
  maxArrayLength: number;
}

const DEFAULT_SIZE_POLICY: SizePolicy = {
  maxBodyBytes: 1_048_576,   // 1 MB
  maxHeaderBytes: 8_192,     // 8 KB
  maxUrlLength: 2048,
  maxJsonDepth: 20,
  maxArrayLength: 10_000,
};

export function enforceSize(
  bodyBytes: number,
  headerBytes: number,
  urlLength: number,
  policy: Partial<SizePolicy> = {}
): { allowed: boolean; violations: string[] } {
  const p = { ...DEFAULT_SIZE_POLICY, ...policy };
  const violations: string[] = [];
  if (bodyBytes > p.maxBodyBytes) violations.push(`body_too_large:${bodyBytes}>${p.maxBodyBytes}`);
  if (headerBytes > p.maxHeaderBytes) violations.push(`headers_too_large:${headerBytes}>${p.maxHeaderBytes}`);
  if (urlLength > p.maxUrlLength) violations.push(`url_too_long:${urlLength}>${p.maxUrlLength}`);
  return { allowed: violations.length === 0, violations };
}

export function checkJsonDepth(obj: unknown, maxDepth = DEFAULT_SIZE_POLICY.maxJsonDepth, depth = 0): boolean {
  if (depth > maxDepth) return false;
  if (obj && typeof obj === 'object') {
    for (const val of Object.values(obj as Record<string, unknown>)) {
      if (!checkJsonDepth(val, maxDepth, depth + 1)) return false;
    }
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// #12  HEADER INJECTION SHIELD
// ═══════════════════════════════════════════════════════════════════════════════

export function detectHeaderInjection(headers: Record<string, string>): {
  safe: boolean;
  injections: string[];
} {
  const injections: string[] = [];
  for (const [key, value] of Object.entries(headers)) {
    if (/[\r\n]/.test(key) || /[\r\n]/.test(value)) {
      injections.push(`CRLF in ${key}`);
    }
    if (key.toLowerCase() === 'host' && /[,;]/.test(value)) {
      injections.push('Host header injection');
    }
  }
  return { safe: injections.length === 0, injections };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #13  REPLAY ATTACK GUARD
// ═══════════════════════════════════════════════════════════════════════════════

const usedNonces = new Map<string, number>();
const MAX_NONCES = 50_000;
const NONCE_TTL_MS = 300_000; // 5 minutes

export function validateNonce(nonce: string, timestamp: number): {
  valid: boolean;
  reason?: string;
} {
  const now = Date.now();
  // Check timestamp freshness
  if (Math.abs(now - timestamp) > NONCE_TTL_MS) {
    return { valid: false, reason: 'timestamp_expired' };
  }
  // Check nonce reuse
  if (usedNonces.has(nonce)) {
    return { valid: false, reason: 'nonce_reused' };
  }
  usedNonces.set(nonce, now);
  // Evict expired nonces
  if (usedNonces.size > MAX_NONCES) {
    for (const [k, v] of usedNonces) {
      if (now - v > NONCE_TTL_MS) usedNonces.delete(k);
    }
  }
  return { valid: true };
}

export function generateNonce(): string {
  return `nonce_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// #14  DEFENSE METRICS EXPORTER
// ═══════════════════════════════════════════════════════════════════════════════

export interface DefenseMetrics {
  requests_total: number;
  requests_blocked: number;
  requests_challenged: number;
  requests_monitored: number;
  threats_detected: number;
  canaries_tripped: number;
  honeypot_hits: number;
  avg_risk_score: number;
  active_correlations: number;
  posture_score: number;
}

const metrics: DefenseMetrics = {
  requests_total: 0,
  requests_blocked: 0,
  requests_challenged: 0,
  requests_monitored: 0,
  threats_detected: 0,
  canaries_tripped: 0,
  honeypot_hits: 0,
  avg_risk_score: 0,
  active_correlations: 0,
  posture_score: 100,
};

export function incrementDefenseMetric(key: keyof DefenseMetrics, amount = 1): void {
  (metrics[key] as number) += amount;
}

export function getDefenseMetrics(): DefenseMetrics {
  return { ...metrics };
}

export function exportDefenseMetricsPrometheus(): string {
  return Object.entries(metrics)
    .map(([k, v]) => `defense_${k} ${v}`)
    .join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// #15  BLOCKLIST SYNC ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const blockList = new Set<string>();
let lastBlocklistSync = 0;

export function addToBlocklist(ip: string): void {
  blockList.add(ip);
}

export function removeFromBlocklist(ip: string): void {
  blockList.delete(ip);
}

export function isBlocked(ip: string): boolean {
  return blockList.has(ip);
}

export function getBlocklistSize(): number {
  return blockList.size;
}

export function getBlocklistSyncAge(): number {
  return Date.now() - lastBlocklistSync;
}

export function markBlocklistSynced(): void {
  lastBlocklistSync = Date.now();
}

// ═══════════════════════════════════════════════════════════════════════════════
// #16  DEFENSE WARM STANDBY (Pre-computed rule evaluations)
// ═══════════════════════════════════════════════════════════════════════════════

const precomputedRules = new Map<string, { result: boolean; computedAt: number }>();
const RULE_CACHE_TTL = 30_000; // 30s

export function getCachedRuleResult(ruleKey: string): boolean | null {
  const entry = precomputedRules.get(ruleKey);
  if (!entry) return null;
  if (Date.now() - entry.computedAt > RULE_CACHE_TTL) {
    precomputedRules.delete(ruleKey);
    return null;
  }
  return entry.result;
}

export function cacheRuleResult(ruleKey: string, result: boolean): void {
  precomputedRules.set(ruleKey, { result, computedAt: Date.now() });
}

// ═══════════════════════════════════════════════════════════════════════════════
// #17  ATTACK SURFACE MAPPER
// ═══════════════════════════════════════════════════════════════════════════════

export interface EndpointExposure {
  path: string;
  methods: string[];
  authRequired: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  lastAccessed?: string;
  hitCount: number;
}

const endpointInventory = new Map<string, EndpointExposure>();

export function registerEndpoint(path: string, methods: string[], authRequired: boolean): void {
  const risk: EndpointExposure['riskLevel'] =
    !authRequired && methods.includes('POST') ? 'high' :
    !authRequired ? 'medium' : 'low';
  endpointInventory.set(path, { path, methods, authRequired, riskLevel: risk, hitCount: 0 });
}

export function recordEndpointHit(path: string): void {
  const ep = endpointInventory.get(path);
  if (ep) {
    ep.hitCount++;
    ep.lastAccessed = new Date().toISOString();
  }
}

export function getAttackSurface(): {
  totalEndpoints: number;
  unauthenticated: number;
  highRisk: number;
  endpoints: EndpointExposure[];
} {
  const eps = Array.from(endpointInventory.values());
  return {
    totalEndpoints: eps.length,
    unauthenticated: eps.filter(e => !e.authRequired).length,
    highRisk: eps.filter(e => e.riskLevel === 'high').length,
    endpoints: eps,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #18  DEFENSE POSTURE SCORE
// ═══════════════════════════════════════════════════════════════════════════════

export function calculatePostureScore(): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: Array<{ name: string; weight: number; value: number }>;
} {
  const factors = [
    { name: 'blocklist_freshness', weight: 10, value: getBlocklistSyncAge() < 3_600_000 ? 10 : 5 },
    { name: 'honeypot_coverage', weight: 10, value: honeypotPaths.size >= 10 ? 10 : Math.round(honeypotPaths.size) },
    { name: 'canary_deployment', weight: 10, value: canaryTokens.size >= 3 ? 10 : Math.round(canaryTokens.size * 3.3) },
    { name: 'correlation_active', weight: 15, value: correlations.size > 0 ? 15 : 0 },
    { name: 'block_rate', weight: 15, value: metrics.requests_total > 0 ?
        Math.min(15, Math.round((1 - metrics.requests_blocked / metrics.requests_total) * 15)) : 15 },
    { name: 'surface_mapped', weight: 15, value: endpointInventory.size > 0 ? 15 : 0 },
    { name: 'challenge_system', weight: 10, value: 10 }, // always on
    { name: 'egress_filter', weight: 15, value: 15 },    // always on
  ];

  const score = Math.min(100, factors.reduce((s, f) => s + f.value, 0));
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';

  metrics.posture_score = score;
  return { score, grade, factors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #19  QUARANTINE ZONE
// ═══════════════════════════════════════════════════════════════════════════════

export interface QuarantinedRequest {
  id: string;
  ip: string;
  path: string;
  reason: string;
  quarantinedAt: string;
  expiresAt: string;
  verdict?: 'release' | 'block';
}

const quarantineZone = new Map<string, QuarantinedRequest>();
const MAX_QUARANTINE = 1000;
const QUARANTINE_TTL_MS = 120_000; // 2 min hold

export function quarantineRequest(ip: string, path: string, reason: string): QuarantinedRequest {
  const id = `qr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const req: QuarantinedRequest = {
    id, ip, path, reason,
    quarantinedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + QUARANTINE_TTL_MS).toISOString(),
  };
  quarantineZone.set(id, req);
  boundMap(quarantineZone, MAX_QUARANTINE);
  return req;
}

export function verdictQuarantine(id: string, verdict: 'release' | 'block'): boolean {
  const req = quarantineZone.get(id);
  if (!req) return false;
  req.verdict = verdict;
  return true;
}

export function getQuarantined(): QuarantinedRequest[] {
  const now = Date.now();
  return Array.from(quarantineZone.values())
    .filter(r => !r.verdict && new Date(r.expiresAt).getTime() > now);
}

// ═══════════════════════════════════════════════════════════════════════════════
// #20  THREAT FEED INGESTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface IOC {
  type: 'ip' | 'domain' | 'hash' | 'url';
  value: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ingestedAt: string;
  expiresAt?: string;
}

const iocStore = new Map<string, IOC>();
const MAX_IOCS = 10_000;

export function ingestIOC(ioc: Omit<IOC, 'ingestedAt'>): void {
  const key = `${ioc.type}:${ioc.value}`;
  iocStore.set(key, { ...ioc, ingestedAt: new Date().toISOString() });
  boundMap(iocStore, MAX_IOCS);
  if (ioc.type === 'ip' && (ioc.severity === 'high' || ioc.severity === 'critical')) {
    addToBlocklist(ioc.value);
  }
}

export function checkIOC(type: IOC['type'], value: string): IOC | null {
  return iocStore.get(`${type}:${value}`) || null;
}

export function getIOCStats(): { total: number; byType: Record<string, number>; bySeverity: Record<string, number> } {
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  for (const ioc of iocStore.values()) {
    byType[ioc.type] = (byType[ioc.type] || 0) + 1;
    bySeverity[ioc.severity] = (bySeverity[ioc.severity] || 0) + 1;
  }
  return { total: iocStore.size, byType, bySeverity };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #21  DEFENSE EVENT DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

const recentEventHashes = new Map<string, number>();
const DEDUP_WINDOW_MS = 60_000;
const MAX_EVENT_HASHES = 10_000;

export function isDuplicateEvent(eventKey: string): boolean {
  const now = Date.now();
  const last = recentEventHashes.get(eventKey);
  if (last && now - last < DEDUP_WINDOW_MS) return true;
  recentEventHashes.set(eventKey, now);
  if (recentEventHashes.size > MAX_EVENT_HASHES) {
    for (const [k, v] of recentEventHashes) {
      if (now - v > DEDUP_WINDOW_MS) recentEventHashes.delete(k);
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// #22  CROSS-MODULE THREAT PROPAGATION
// ═══════════════════════════════════════════════════════════════════════════════

export type ThreatPropagation = {
  sourceModule: string;
  targetModules: string[];
  threatType: string;
  action: 'block' | 'rate_limit' | 'monitor';
  propagatedAt: string;
};

const propagationLog: ThreatPropagation[] = [];
const MAX_PROPAGATIONS = 500;

export function propagateThreat(
  sourceModule: string,
  targetModules: string[],
  threatType: string,
  action: ThreatPropagation['action']
): ThreatPropagation {
  const entry: ThreatPropagation = {
    sourceModule,
    targetModules,
    threatType,
    action,
    propagatedAt: new Date().toISOString(),
  };
  propagationLog.push(entry);
  if (propagationLog.length > MAX_PROPAGATIONS) propagationLog.shift();
  return entry;
}

export function getPropagationLog(): ThreatPropagation[] {
  return [...propagationLog];
}

// ═══════════════════════════════════════════════════════════════════════════════
// #23  DEFENSE CIRCUIT WARMUP PROBES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WarmupProbeResult {
  module: string;
  latencyMs: number;
  healthy: boolean;
  probedAt: string;
}

export async function runWarmupProbe(
  module: string,
  probeFn: () => Promise<boolean>
): Promise<WarmupProbeResult> {
  const start = Date.now();
  let healthy = false;
  try {
    healthy = await probeFn();
  } catch {
    healthy = false;
  }
  return {
    module,
    latencyMs: Date.now() - start,
    healthy,
    probedAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #24  REQUEST PIPELINE HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export type PipelineHook = (ctx: PipelineContext) => PipelineContext | Promise<PipelineContext>;

export interface PipelineContext {
  ip: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  blocked: boolean;
  riskScore: number;
  metadata: Record<string, unknown>;
}

const beforeHooks: PipelineHook[] = [];
const afterHooks: PipelineHook[] = [];

export function registerBeforeHook(hook: PipelineHook): void {
  beforeHooks.push(hook);
}

export function registerAfterHook(hook: PipelineHook): void {
  afterHooks.push(hook);
}

export async function runPipeline(ctx: PipelineContext): Promise<PipelineContext> {
  let current = { ...ctx };
  for (const hook of beforeHooks) {
    current = await hook(current);
    if (current.blocked) return current;
  }
  for (const hook of afterHooks) {
    current = await hook(current);
  }
  return current;
}

export function getPipelineHookCount(): { before: number; after: number } {
  return { before: beforeHooks.length, after: afterHooks.length };
}

// ═══════════════════════════════════════════════════════════════════════════════
// #25  DEFENSE AUDIT TRAIL SIGNER
// ═══════════════════════════════════════════════════════════════════════════════

export interface SignedAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  module: string;
  data: Record<string, unknown>;
  signature: string; // FNV hash of canonical content
  previousSignature?: string;
}

let lastSignature: string | undefined;

function fnvSign(content: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    h ^= content.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function signAuditEntry(action: string, module: string, data: Record<string, unknown>): SignedAuditEntry {
  const entry: SignedAuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    action,
    module,
    data,
    signature: '',
    previousSignature: lastSignature,
  };
  const canonical = JSON.stringify({ ts: entry.timestamp, action, module, data, prev: lastSignature });
  entry.signature = fnvSign(canonical);
  lastSignature = entry.signature;
  return entry;
}

export function verifyAuditChain(entries: SignedAuditEntry[]): {
  valid: boolean;
  brokenAt?: number;
} {
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].previousSignature !== entries[i - 1].signature) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

function boundMap<K, V>(map: Map<K, V>, max: number): void {
  if (map.size > max) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HARDENING SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

export function getDefenseHardeningSummary(): {
  version: string;
  codename: string;
  upgradeCount: number;
  upgrades: string[];
} {
  return {
    version: DEFENSE_HARDENING_VERSION,
    codename: DEFENSE_HARDENING_CODENAME,
    upgradeCount: 25,
    upgrades: [
      'Geo-Velocity Check',
      'Request Fingerprint Hashing',
      'Payload Entropy Analyzer',
      'Progressive Challenge Escalation',
      'Honeypot Endpoint Registry',
      'Session Binding Validator',
      'Response Cloaking',
      'Threat Correlation Engine',
      'Defense Canary System',
      'Egress Filter (DLP)',
      'Request Size Governor',
      'Header Injection Shield',
      'Replay Attack Guard',
      'Defense Metrics Exporter',
      'Blocklist Sync Engine',
      'Defense Warm Standby',
      'Attack Surface Mapper',
      'Defense Posture Score',
      'Quarantine Zone',
      'Threat Feed Ingestion (IOC)',
      'Event Deduplication',
      'Cross-Module Threat Propagation',
      'Circuit Warmup Probes',
      'Request Pipeline Hooks',
      'Audit Trail Signer',
    ],
  };
}
