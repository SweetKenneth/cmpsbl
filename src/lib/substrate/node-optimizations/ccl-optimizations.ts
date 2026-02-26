/**
 * Matrix Node Optimizations — CCL Sector
 * Nodes: RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT
 *
 * RIPPLE:   #11 Event Batching with Flush Deadlines, #12 Dead Letter Quarantine
 * ACCESS:   #13 Key Rotation Countdown, #14 Scope Narrowing Analysis
 * IDENTITY: #15 Session Affinity Scoring, #16 Role Inheritance Cache
 * RELAY:    #17 Adaptive Retry Backoff, #18 Payload Deduplication
 * AUDIT:    #19 Audit Log Summarization, #20 Tamper-Evident Chaining
 */

// ═══════════════════════════════════════
// RIPPLE — Event Batching (#11)
// ═══════════════════════════════════════

export interface EventBatch {
  id: string;
  events: Array<{ type: string; payload: unknown; queuedAt: number }>;
  flushDeadlineMs: number;
  createdAt: number;
  flushedAt?: number;
}

const eventBatches: EventBatch[] = [];
let activeBatch: EventBatch | null = null;
let batchCounter = 0;
const DEFAULT_FLUSH_DEADLINE = 100; // ms

export function queueEvent(type: string, payload: unknown, flushDeadlineMs: number = DEFAULT_FLUSH_DEADLINE): EventBatch {
  if (!activeBatch || Date.now() - activeBatch.createdAt >= activeBatch.flushDeadlineMs) {
    if (activeBatch) flushBatch();
    activeBatch = {
      id: `batch_${++batchCounter}`,
      events: [],
      flushDeadlineMs,
      createdAt: Date.now(),
    };
  }
  activeBatch.events.push({ type, payload, queuedAt: Date.now() });
  return activeBatch;
}

export function flushBatch(): EventBatch | null {
  if (!activeBatch) return null;
  activeBatch.flushedAt = Date.now();
  eventBatches.push(activeBatch);
  if (eventBatches.length > 1000) eventBatches.splice(0, eventBatches.length - 1000);
  const flushed = activeBatch;
  activeBatch = null;
  return flushed;
}

export function getBatchingStats(): { totalBatches: number; avgBatchSize: number; avgFlushLatencyMs: number } {
  const flushed = eventBatches.filter(b => b.flushedAt);
  return {
    totalBatches: flushed.length,
    avgBatchSize: flushed.length > 0 ? Math.round(flushed.reduce((s, b) => s + b.events.length, 0) / flushed.length) : 0,
    avgFlushLatencyMs: flushed.length > 0
      ? Math.round(flushed.reduce((s, b) => s + ((b.flushedAt! - b.createdAt)), 0) / flushed.length) : 0,
  };
}

// ═══════════════════════════════════════
// RIPPLE — Dead Letter Quarantine (#12)
// ═══════════════════════════════════════

export interface DeadLetter {
  id: string;
  eventType: string;
  payload: unknown;
  error: string;
  retryCount: number;
  maxRetries: number;
  quarantinedAt: number;
  lastRetryAt?: number;
}

const deadLetterQueue: DeadLetter[] = [];
const MAX_DLQ = 1000;
let dlqCounter = 0;

export function quarantineEvent(eventType: string, payload: unknown, error: string, maxRetries: number = 3): DeadLetter {
  const dl: DeadLetter = {
    id: `dlq_${++dlqCounter}`,
    eventType,
    payload,
    error,
    retryCount: 0,
    maxRetries,
    quarantinedAt: Date.now(),
  };
  deadLetterQueue.push(dl);
  if (deadLetterQueue.length > MAX_DLQ) deadLetterQueue.splice(0, deadLetterQueue.length - MAX_DLQ);
  return dl;
}

export function retryDeadLetter(dlId: string): DeadLetter | null {
  const dl = deadLetterQueue.find(d => d.id === dlId);
  if (!dl || dl.retryCount >= dl.maxRetries) return null;
  dl.retryCount++;
  dl.lastRetryAt = Date.now();
  return dl;
}

export function getDeadLetterQueue(limit: number = 50): DeadLetter[] {
  return deadLetterQueue.slice(-limit);
}

// ═══════════════════════════════════════
// ACCESS — Key Rotation Countdown (#13)
// ═══════════════════════════════════════

export interface KeyExpiryAlert {
  keyId: string;
  keyPrefix: string;
  expiresAt: number;
  daysRemaining: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  autoRotateEligible: boolean;
}

export function getKeyExpiryAlerts(keys: Array<{ id: string; prefix: string; expiresAt: number | null; autoRotate?: boolean }>): KeyExpiryAlert[] {
  const now = Date.now();
  return keys
    .filter(k => k.expiresAt)
    .map(k => {
      const daysRemaining = Math.max(0, (k.expiresAt! - now) / (24 * 60 * 60 * 1000));
      let urgency: KeyExpiryAlert['urgency'] = 'low';
      if (daysRemaining <= 1) urgency = 'critical';
      else if (daysRemaining <= 7) urgency = 'high';
      else if (daysRemaining <= 14) urgency = 'medium';
      return {
        keyId: k.id,
        keyPrefix: k.prefix,
        expiresAt: k.expiresAt!,
        daysRemaining: Math.round(daysRemaining * 10) / 10,
        urgency,
        autoRotateEligible: k.autoRotate ?? false,
      };
    })
    .filter(a => a.daysRemaining <= 30)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

// ═══════════════════════════════════════
// ACCESS — Scope Narrowing Analysis (#14)
// ═══════════════════════════════════════

export interface ScopeRecommendation {
  keyId: string;
  grantedScopes: string[];
  usedScopes: string[];
  unusedScopes: string[];
  narrowingRecommended: boolean;
  riskReduction: number; // 0.0–1.0
}

const scopeUsage = new Map<string, Set<string>>(); // keyId → used scopes

export function recordScopeUsage(keyId: string, scope: string): void {
  const used = scopeUsage.get(keyId) ?? new Set();
  used.add(scope);
  scopeUsage.set(keyId, used);
}

export function getScopeNarrowingRecommendations(keys: Array<{ id: string; scopes: string[] }>): ScopeRecommendation[] {
  return keys.map(k => {
    const used = scopeUsage.get(k.id) ?? new Set();
    const unusedScopes = k.scopes.filter(s => !used.has(s));
    return {
      keyId: k.id,
      grantedScopes: k.scopes,
      usedScopes: Array.from(used),
      unusedScopes,
      narrowingRecommended: unusedScopes.length > 0,
      riskReduction: k.scopes.length > 0 ? Math.round((unusedScopes.length / k.scopes.length) * 1000) / 1000 : 0,
    };
  }).filter(r => r.narrowingRecommended);
}

// ═══════════════════════════════════════
// IDENTITY — Session Affinity Scoring (#15)
// ═══════════════════════════════════════

export interface SessionAffinity {
  sessionId: string;
  userId: string;
  affinityScore: number; // 0.0–1.0, lower = more suspicious
  signals: string[];
  suspicious: boolean;
}

export function scoreSessionAffinity(
  sessionId: string,
  userId: string,
  current: { device: string; location: string; ip: string },
  historical: Array<{ device: string; location: string; ip: string }>,
): SessionAffinity {
  const signals: string[] = [];
  let score = 1.0;

  if (historical.length === 0) {
    return { sessionId, userId, affinityScore: 0.5, signals: ['no_history'], suspicious: false };
  }

  const knownDevices = new Set(historical.map(h => h.device));
  const knownLocations = new Set(historical.map(h => h.location));
  const knownIPs = new Set(historical.map(h => h.ip));

  if (!knownDevices.has(current.device)) { score -= 0.3; signals.push('unknown_device'); }
  if (!knownLocations.has(current.location)) { score -= 0.25; signals.push('unknown_location'); }
  if (!knownIPs.has(current.ip)) { score -= 0.15; signals.push('unknown_ip'); }

  score = Math.max(0, Math.round(score * 1000) / 1000);

  return { sessionId, userId, affinityScore: score, signals, suspicious: score < 0.5 };
}

// ═══════════════════════════════════════
// IDENTITY — Role Inheritance Cache (#16)
// ═══════════════════════════════════════

const roleCache = new Map<string, { permissions: string[]; resolvedAt: number; ttlMs: number }>();
const ROLE_CACHE_TTL = 5 * 60 * 1000; // 5 min

export function getCachedPermissions(roleKey: string): string[] | null {
  const entry = roleCache.get(roleKey);
  if (!entry || Date.now() - entry.resolvedAt > entry.ttlMs) {
    if (entry) roleCache.delete(roleKey);
    return null;
  }
  return entry.permissions;
}

export function cacheResolvedPermissions(roleKey: string, permissions: string[], ttlMs: number = ROLE_CACHE_TTL): void {
  roleCache.set(roleKey, { permissions, resolvedAt: Date.now(), ttlMs });
}

export function invalidateRoleCache(roleKey?: string): void {
  if (roleKey) roleCache.delete(roleKey);
  else roleCache.clear();
}

export function getRoleCacheStats(): { size: number; hitsSaved: number } {
  return { size: roleCache.size, hitsSaved: roleCache.size }; // each cached entry = 1 walk saved
}

// ═══════════════════════════════════════
// RELAY — Adaptive Retry Backoff (#17)
// ═══════════════════════════════════════

const endpointFailureHistory = new Map<string, { failures: number; lastFailure: number; avgRecoveryMs: number }>();

export function getAdaptiveBackoff(endpoint: string, attemptNumber: number): number {
  const history = endpointFailureHistory.get(endpoint);
  const baseMs = 1000;
  
  if (!history || history.failures < 3) {
    // Standard exponential backoff
    return Math.min(baseMs * Math.pow(2, attemptNumber), 60_000);
  }
  
  // Adaptive: use historical recovery time as the base
  const adaptiveBase = Math.max(baseMs, history.avgRecoveryMs * 0.5);
  return Math.min(adaptiveBase * Math.pow(1.5, attemptNumber), 120_000);
}

export function recordEndpointFailure(endpoint: string): void {
  const entry = endpointFailureHistory.get(endpoint) ?? { failures: 0, lastFailure: 0, avgRecoveryMs: 5000 };
  entry.failures++;
  entry.lastFailure = Date.now();
  endpointFailureHistory.set(endpoint, entry);
}

export function recordEndpointRecovery(endpoint: string): void {
  const entry = endpointFailureHistory.get(endpoint);
  if (entry) {
    const recoveryTime = Date.now() - entry.lastFailure;
    entry.avgRecoveryMs = Math.round((entry.avgRecoveryMs * 0.7 + recoveryTime * 0.3));
  }
}

// ═══════════════════════════════════════
// RELAY — Payload Deduplication (#18)
// ═══════════════════════════════════════

const payloadHashes = new Map<string, { timestamp: number; count: number }>();
const DEDUP_WINDOW_MS = 60_000; // 1 min default

function hashPayload(payload: string): string {
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = ((h << 5) - h + payload.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

export function isPayloadDuplicate(payload: string, windowMs: number = DEDUP_WINDOW_MS): boolean {
  const hash = hashPayload(payload);
  const existing = payloadHashes.get(hash);
  if (existing && Date.now() - existing.timestamp < windowMs) {
    existing.count++;
    return true;
  }
  payloadHashes.set(hash, { timestamp: Date.now(), count: 1 });
  // Cleanup old entries
  if (payloadHashes.size > 5000) {
    const cutoff = Date.now() - windowMs * 2;
    for (const [k, v] of payloadHashes) { if (v.timestamp < cutoff) payloadHashes.delete(k); }
  }
  return false;
}

export function getPayloadDedupStats(): { uniquePayloads: number; duplicatesBlocked: number } {
  const entries = Array.from(payloadHashes.values());
  return {
    uniquePayloads: entries.length,
    duplicatesBlocked: entries.reduce((s, e) => s + Math.max(0, e.count - 1), 0),
  };
}

// ═══════════════════════════════════════
// AUDIT — Log Summarization (#19)
// ═══════════════════════════════════════

export interface AuditSummary {
  period: string;
  startAt: number;
  endAt: number;
  totalEntries: number;
  compressedTo: number;
  compressionRatio: number;
  topActions: Array<{ action: string; count: number }>;
  createdAt: number;
}

const auditSummaries: AuditSummary[] = [];
const MAX_SUMMARIES = 500;

export function generateAuditSummary(
  period: string,
  entries: Array<{ action: string; timestamp: number }>,
): AuditSummary {
  const actionCounts = new Map<string, number>();
  for (const e of entries) {
    actionCounts.set(e.action, (actionCounts.get(e.action) ?? 0) + 1);
  }

  const topActions = Array.from(actionCounts.entries())
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const timestamps = entries.map(e => e.timestamp);
  const summary: AuditSummary = {
    period,
    startAt: Math.min(...timestamps),
    endAt: Math.max(...timestamps),
    totalEntries: entries.length,
    compressedTo: topActions.length,
    compressionRatio: entries.length > 0 ? Math.round((1 - topActions.length / entries.length) * 1000) / 1000 : 0,
    topActions,
    createdAt: Date.now(),
  };

  auditSummaries.push(summary);
  if (auditSummaries.length > MAX_SUMMARIES) auditSummaries.splice(0, auditSummaries.length - MAX_SUMMARIES);
  return summary;
}

export function getAuditSummaries(limit: number = 20): AuditSummary[] {
  return auditSummaries.slice(-limit);
}

// ═══════════════════════════════════════
// AUDIT — Tamper-Evident Chaining (#20)
// ═══════════════════════════════════════

export interface ChainedAuditEntry {
  index: number;
  action: string;
  data: string;
  timestamp: number;
  prevHash: string;
  hash: string;
}

const auditChain: ChainedAuditEntry[] = [];
const MAX_CHAIN = 10_000;

function computeHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h * 0x01000193) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function appendChainedEntry(action: string, data: string): ChainedAuditEntry {
  const prevHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].hash : '00000000';
  const timestamp = Date.now();
  const hashInput = `${prevHash}|${action}|${data}|${timestamp}`;
  const hash = computeHash(hashInput);

  const entry: ChainedAuditEntry = {
    index: auditChain.length,
    action,
    data,
    timestamp,
    prevHash,
    hash,
  };

  auditChain.push(entry);
  if (auditChain.length > MAX_CHAIN) auditChain.splice(0, auditChain.length - MAX_CHAIN);
  return entry;
}

export function verifyAuditChain(): { valid: boolean; brokenAt?: number; checkedEntries: number } {
  for (let i = 1; i < auditChain.length; i++) {
    const prev = auditChain[i - 1];
    const curr = auditChain[i];
    if (curr.prevHash !== prev.hash) {
      return { valid: false, brokenAt: i, checkedEntries: i };
    }
    const expectedHash = computeHash(`${curr.prevHash}|${curr.action}|${curr.data}|${curr.timestamp}`);
    if (curr.hash !== expectedHash) {
      return { valid: false, brokenAt: i, checkedEntries: i };
    }
  }
  return { valid: true, checkedEntries: auditChain.length };
}

export function getAuditChainLength(): number {
  return auditChain.length;
}
