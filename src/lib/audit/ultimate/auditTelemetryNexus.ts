/**
 * AUDIT — Audit Telemetry Nexus
 * Unified event bus tracking chain growth rate, verification frequency,
 * compliance pass rate, anomaly counts, and forensic search usage.
 * @module audit/auditTelemetryNexus
 * @version 9.0.0 — Sentinel
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type AuditTelemetryEventType =
  | 'chain_append'
  | 'chain_verified'
  | 'chain_tamper_detected'
  | 'compliance_evaluated'
  | 'compliance_violation'
  | 'anomaly_detected'
  | 'forensic_search'
  | 'attestation_generated'
  | 'retention_cycle'
  | 'report_generated';

export interface AuditTelemetryEvent {
  type: AuditTelemetryEventType;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AuditTelemetrySnapshot {
  windowMs: number;
  totalEvents: number;
  chainGrowthRate: number;       // appends per hour
  verificationCount: number;
  compliancePassRate: number;    // 0–100
  anomalyCount: number;
  forensicSearches: number;
  attestationsGenerated: number;
  retentionCycles: number;
}

type AuditTelemetryListener = (event: AuditTelemetryEvent) => void;

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_EVENTS = 1000;
const DEFAULT_WINDOW_MS = 3600 * 1000;

// ── State ──────────────────────────────────────────────────────────────────

const events: AuditTelemetryEvent[] = [];
const listeners: AuditTelemetryListener[] = [];

// ── Core ───────────────────────────────────────────────────────────────────

export function emitAuditTelemetry(event: AuditTelemetryEvent): void {
  events.push(event);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);

  for (const listener of listeners) {
    try { listener(event); } catch { /* non-blocking */ }
  }
}

export function subscribeAuditTelemetry(listener: AuditTelemetryListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function auditTelemetrySnapshot(windowMs = DEFAULT_WINDOW_MS): AuditTelemetrySnapshot {
  const cutoff = Date.now() - windowMs;
  const windowed = events.filter(e => e.timestamp >= cutoff);

  const count = (type: AuditTelemetryEventType) => windowed.filter(e => e.type === type).length;

  const complianceEvals = count('compliance_evaluated');
  const complianceViolations = count('compliance_violation');
  const windowHours = windowMs / (3600 * 1000);

  return {
    windowMs,
    totalEvents: windowed.length,
    chainGrowthRate: Math.round((count('chain_append') / windowHours) * 100) / 100,
    verificationCount: count('chain_verified'),
    compliancePassRate: complianceEvals > 0
      ? Math.round(((complianceEvals - complianceViolations) / complianceEvals) * 100)
      : 100,
    anomalyCount: count('anomaly_detected'),
    forensicSearches: count('forensic_search'),
    attestationsGenerated: count('attestation_generated'),
    retentionCycles: count('retention_cycle'),
  };
}

export function getRecentAuditTelemetry(count = 50): AuditTelemetryEvent[] {
  return events.slice(-count);
}

export function resetAuditTelemetry(): void {
  events.length = 0;
  listeners.length = 0;
}
