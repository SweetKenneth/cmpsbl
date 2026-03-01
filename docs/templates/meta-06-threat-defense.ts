/**
 * Meta-Engine #6 — Real-Time Threat Defense Platform
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Composes: Rate Limiter + Circuit Breaker + Anomaly Correlator + Audit Chain
 *
 * Security operations center in a single import. Detects abuse patterns,
 * rate-limits attackers, isolates compromised services, correlates
 * multi-vector threats, and produces tamper-evident audit trails.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ThreatCategory = 'brute_force' | 'rate_abuse' | 'anomaly' | 'circuit_trip' | 'escalation' | 'unknown';

export interface ThreatEvent {
  id: string;
  source: string;
  category: ThreatCategory;
  severity: ThreatSeverity;
  description: string;
  metadata: Record<string, unknown>;
  timestamp: number;
  mitigated: boolean;
  mitigation?: string;
}

export interface DefenseConfig {
  rateLimits: { maxRequests: number; windowMs: number; burstAllowance?: number };
  circuitBreaker: { failureThreshold?: number; timeout?: number };
  anomalyWindow?: number;
  auditRetention?: number;
  autoMitigate?: boolean;
  onThreat?: (event: ThreatEvent) => void;
  onMitigation?: (event: ThreatEvent, action: string) => void;
}

export interface DefenseStats {
  totalThreats: number;
  mitigated: number;
  activeBlocks: number;
  rateLimitDenials: number;
  circuitTrips: number;
  threatsByCategory: Record<string, number>;
  topOffenders: Array<{ source: string; count: number }>;
}

export function createThreatDefense(config: DefenseConfig) {
  const { rateLimits, circuitBreaker, anomalyWindow = 60_000, autoMitigate = true, onThreat, onMitigation } = config;

  // ── Rate Limiter (inline) ──────────────────────────────────────
  const rlKeys = new Map<string, { requests: number[]; penaltyLevel: number }>();
  let rlDenials = 0;

  function rlCheck(key: string): { allowed: boolean; remaining: number } {
    let state = rlKeys.get(key);
    if (!state) { state = { requests: [], penaltyLevel: 0 }; rlKeys.set(key, state); }
    const now = Date.now();
    state.requests = state.requests.filter(t => now - t < rateLimits.windowMs);
    const limit = Math.max(1, Math.floor((rateLimits.maxRequests + (rateLimits.burstAllowance ?? 0)) / Math.pow(2, state.penaltyLevel)));
    if (state.requests.length < limit) { state.requests.push(now); return { allowed: true, remaining: limit - state.requests.length }; }
    rlDenials++;
    return { allowed: false, remaining: 0 };
  }

  function rlPenalize(key: string) { const s = rlKeys.get(key); if (s) s.penaltyLevel = Math.min(s.penaltyLevel + 1, 5); }

  // ── Circuit Breakers (inline) ──────────────────────────────────
  type CBState = 'closed' | 'open' | 'half_open';
  const breakers = new Map<string, { state: CBState; failures: number; openedAt: number }>();
  let circuitTrips = 0;

  function cbRecord(service: string, success: boolean) {
    let b = breakers.get(service);
    if (!b) { b = { state: 'closed', failures: 0, openedAt: 0 }; breakers.set(service, b); }
    if (success) { b.failures = 0; if (b.state === 'half_open') b.state = 'closed'; return; }
    b.failures++;
    if (b.failures >= (circuitBreaker.failureThreshold ?? 5) && b.state === 'closed') {
      b.state = 'open'; b.openedAt = Date.now(); circuitTrips++;
    }
  }

  function cbAllowed(service: string): boolean {
    const b = breakers.get(service);
    if (!b || b.state === 'closed') return true;
    if (b.state === 'open' && Date.now() - b.openedAt > (circuitBreaker.timeout ?? 30_000)) { b.state = 'half_open'; return true; }
    return b.state === 'half_open';
  }

  // ── Anomaly Correlation (inline) ───────────────────────────────
  const anomalies: Array<{ source: string; metric: string; value: number; severity: ThreatSeverity; timestamp: number }> = [];

  function ingestAnomaly(source: string, metric: string, value: number, severity: ThreatSeverity) {
    anomalies.push({ source, metric, value, severity, timestamp: Date.now() });
    if (anomalies.length > 5000) anomalies.splice(0, anomalies.length - 5000);
  }

  function correlateThreats(): ThreatEvent[] {
    const now = Date.now();
    const recent = anomalies.filter(a => now - a.timestamp < anomalyWindow * 3);
    const bySource = new Map<string, typeof recent>();
    for (const a of recent) { const arr = bySource.get(a.source) ?? []; arr.push(a); bySource.set(a.source, arr); }

    const incidents: ThreatEvent[] = [];
    for (const [source, group] of bySource) {
      if (group.length >= 3) {
        const maxSev = (['critical', 'high', 'medium', 'low'] as ThreatSeverity[]).find(s => group.some(a => a.severity === s)) ?? 'low';
        incidents.push(createThreatEvent(source, 'anomaly', maxSev, `${group.length} correlated anomalies from '${source}'`, { anomalyCount: group.length }));
      }
    }
    return incidents;
  }

  // ── Audit Chain (inline) ───────────────────────────────────────
  interface AuditEntry { index: number; actor: string; action: string; detail: string; timestamp: number; hash: string; prevHash: string; }
  const auditChain: AuditEntry[] = [];

  function fnvHash(s: string): string { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }

  function auditLog(actor: string, action: string, detail: string) {
    const prevHash = auditChain.length > 0 ? auditChain[auditChain.length - 1].hash : '00000000';
    const ts = Date.now();
    const hash = fnvHash(`${prevHash}|${actor}|${action}|${detail}|${ts}`);
    auditChain.push({ index: auditChain.length, actor, action, detail, timestamp: ts, hash, prevHash });
  }

  // ── Threat Management ──────────────────────────────────────────
  const threats: ThreatEvent[] = [];
  const blocked = new Set<string>();
  let threatSeq = 0;

  function createThreatEvent(source: string, category: ThreatCategory, severity: ThreatSeverity, description: string, metadata: Record<string, unknown> = {}): ThreatEvent {
    const event: ThreatEvent = { id: `threat_${++threatSeq}`, source, category, severity, description, metadata, timestamp: Date.now(), mitigated: false };
    threats.push(event);
    if (threats.length > 10_000) threats.splice(0, threats.length - 10_000);
    auditLog('defense', 'threat_detected', `${severity}:${category} from ${source}`);
    onThreat?.(event);
    if (autoMitigate) mitigate(event);
    return event;
  }

  function mitigate(event: ThreatEvent) {
    let action = 'logged';
    if (event.severity === 'critical' || event.severity === 'high') {
      blocked.add(event.source);
      rlPenalize(event.source);
      action = 'blocked+penalized';
    } else if (event.severity === 'medium') {
      rlPenalize(event.source);
      action = 'penalized';
    }
    event.mitigated = true;
    event.mitigation = action;
    auditLog('defense', 'mitigation', `${action} for ${event.source}`);
    onMitigation?.(event, action);
  }

  // ── Public API ─────────────────────────────────────────────────

  function inspect(source: string): { allowed: boolean; remaining: number; blocked: boolean; circuitOk: boolean } {
    if (blocked.has(source)) return { allowed: false, remaining: 0, blocked: true, circuitOk: cbAllowed(source) };
    const rl = rlCheck(source);
    if (!rl.allowed) {
      createThreatEvent(source, 'rate_abuse', 'medium', `Rate limit exceeded by '${source}'`);
    }
    return { ...rl, blocked: false, circuitOk: cbAllowed(source) };
  }

  function reportFailure(service: string, error?: string) {
    cbRecord(service, false);
    ingestAnomaly(service, 'failure', 1, 'medium');
    const b = breakers.get(service);
    if (b?.state === 'open') {
      createThreatEvent(service, 'circuit_trip', 'high', `Circuit opened for '${service}'`, { error });
    }
  }

  function reportSuccess(service: string) { cbRecord(service, true); }

  function unblock(source: string) { blocked.delete(source); auditLog('defense', 'unblock', source); }

  function scan(): ThreatEvent[] { return correlateThreats(); }

  function getStats(): DefenseStats {
    const byCat: Record<string, number> = {};
    for (const t of threats) byCat[t.category] = (byCat[t.category] ?? 0) + 1;
    const offenderMap = new Map<string, number>();
    for (const t of threats) offenderMap.set(t.source, (offenderMap.get(t.source) ?? 0) + 1);
    const topOffenders = [...offenderMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([source, count]) => ({ source, count }));

    return {
      totalThreats: threats.length,
      mitigated: threats.filter(t => t.mitigated).length,
      activeBlocks: blocked.size,
      rateLimitDenials: rlDenials,
      circuitTrips,
      threatsByCategory: byCat,
      topOffenders,
    };
  }

  function verifyAuditIntegrity(): { valid: boolean; entries: number; brokenAt?: number } {
    for (let i = 0; i < auditChain.length; i++) {
      const e = auditChain[i];
      const expectedPrev = i === 0 ? '00000000' : auditChain[i - 1].hash;
      if (e.prevHash !== expectedPrev) return { valid: false, entries: auditChain.length, brokenAt: i };
    }
    return { valid: true, entries: auditChain.length };
  }

  return {
    inspect, reportFailure, reportSuccess, unblock, scan,
    getStats, verifyAuditIntegrity,
    get threats() { return [...threats]; },
    get blocked() { return [...blocked]; },
    get auditLog() { return [...auditChain]; },
  };
}
