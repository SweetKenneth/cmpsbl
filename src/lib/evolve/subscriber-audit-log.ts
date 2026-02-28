/**
 * Subscriber-Facing Audit Log
 * Provides a tenant-visible, read-only log of all evolution events.
 * Subscribers can query their own evolution history for compliance and debugging.
 */

export type AuditEventType =
  | 'evolution_exported'
  | 'evolution_applied'
  | 'evolution_failed'
  | 'snapshot_created'
  | 'snapshot_restored'
  | 'circuit_tripped'
  | 'circuit_recovered'
  | 'entropy_warning'
  | 'entropy_blocked'
  | 'regression_detected'
  | 'budget_exceeded'
  | 'retention_cleanup'
  | 'gate_failed'
  | 'gate_passed';

export interface SubscriberAuditEntry {
  id: string;
  tenantId: string;
  eventType: AuditEventType;
  timestamp: number;
  proposalId?: string;
  snapshotId?: string;
  summary: string;
  details: Record<string, unknown>;
  severity: 'info' | 'warn' | 'error';
}

export interface AuditQuery {
  tenantId: string;
  eventTypes?: AuditEventType[];
  since?: number;
  until?: number;
  limit?: number;
  severity?: ('info' | 'warn' | 'error')[];
}

export interface AuditSummary {
  tenantId: string;
  totalEvents: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  firstEvent: number | null;
  lastEvent: number | null;
}

const logs: SubscriberAuditEntry[] = [];

export function logAuditEvent(
  tenantId: string,
  eventType: AuditEventType,
  summary: string,
  details: Record<string, unknown> = {},
  severity: 'info' | 'warn' | 'error' = 'info',
  proposalId?: string,
  snapshotId?: string,
): SubscriberAuditEntry {
  const entry: SubscriberAuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    tenantId,
    eventType,
    timestamp: Date.now(),
    proposalId,
    snapshotId,
    summary,
    details,
    severity,
  };
  logs.push(entry);

  // Cap at 10k entries per tenant in memory
  const tenantLogs = logs.filter(l => l.tenantId === tenantId);
  if (tenantLogs.length > 10_000) {
    const oldest = tenantLogs[0];
    const idx = logs.indexOf(oldest);
    if (idx >= 0) logs.splice(idx, 1);
  }

  return entry;
}

export function queryAuditLog(query: AuditQuery): SubscriberAuditEntry[] {
  let results = logs.filter(l => l.tenantId === query.tenantId);

  if (query.eventTypes?.length) {
    results = results.filter(l => query.eventTypes!.includes(l.eventType));
  }
  if (query.severity?.length) {
    results = results.filter(l => query.severity!.includes(l.severity));
  }
  if (query.since) {
    results = results.filter(l => l.timestamp >= query.since!);
  }
  if (query.until) {
    results = results.filter(l => l.timestamp <= query.until!);
  }

  results.sort((a, b) => b.timestamp - a.timestamp);

  if (query.limit) {
    results = results.slice(0, query.limit);
  }

  return results;
}

export function getAuditSummary(tenantId: string): AuditSummary {
  const tenantLogs = logs.filter(l => l.tenantId === tenantId);
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let firstEvent: number | null = null;
  let lastEvent: number | null = null;

  for (const entry of tenantLogs) {
    byType[entry.eventType] = (byType[entry.eventType] ?? 0) + 1;
    bySeverity[entry.severity] = (bySeverity[entry.severity] ?? 0) + 1;
    if (firstEvent === null || entry.timestamp < firstEvent) firstEvent = entry.timestamp;
    if (lastEvent === null || entry.timestamp > lastEvent) lastEvent = entry.timestamp;
  }

  return {
    tenantId,
    totalEvents: tenantLogs.length,
    byType,
    bySeverity,
    firstEvent,
    lastEvent,
  };
}

export function exportAuditLog(tenantId: string): string {
  const tenantLogs = queryAuditLog({ tenantId, limit: 5000 });
  return JSON.stringify(tenantLogs, null, 2);
}
