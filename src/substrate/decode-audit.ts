/**
 * DECODE Audit Logging
 * Records admin directives, security refusals, and security events.
 * Capped at 500 entries with FIFO eviction.
 */

export type AuditEventType = 'directive' | 'security_event' | 'refusal';

export interface DecodeAuditEntry {
  id: string;
  type: AuditEventType;
  actor: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const MAX_ENTRIES = 500;
const auditEntries: DecodeAuditEntry[] = [];

function pushEntry(entry: DecodeAuditEntry): void {
  auditEntries.push(entry);
  if (auditEntries.length > MAX_ENTRIES) {
    auditEntries.splice(0, auditEntries.length - MAX_ENTRIES);
  }
}

function makeId(): string {
  return `da-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Log an admin directive */
export function logDirective(actor: string, directive: string, metadata?: Record<string, unknown>): DecodeAuditEntry {
  const entry: DecodeAuditEntry = {
    id: makeId(),
    type: 'directive',
    actor,
    message: directive,
    timestamp: new Date().toISOString(),
    metadata,
  };
  pushEntry(entry);
  return entry;
}

/** Log a security event */
export function logSecurityEvent(message: string, metadata?: Record<string, unknown>): DecodeAuditEntry {
  const entry: DecodeAuditEntry = {
    id: makeId(),
    type: 'security_event',
    actor: 'SYSTEM',
    message,
    timestamp: new Date().toISOString(),
    metadata,
  };
  pushEntry(entry);
  return entry;
}

/** Log a security refusal */
export function logRefusal(message: string, metadata?: Record<string, unknown>): DecodeAuditEntry {
  const entry: DecodeAuditEntry = {
    id: makeId(),
    type: 'refusal',
    actor: 'DECODE',
    message,
    timestamp: new Date().toISOString(),
    metadata,
  };
  pushEntry(entry);
  return entry;
}

/** Get audit log entries (most recent first) */
export function getAuditLog(limit?: number): DecodeAuditEntry[] {
  const entries = [...auditEntries].reverse();
  return limit ? entries.slice(0, limit) : entries;
}

/** Get count of entries by type */
export function getAuditCounts(): Record<AuditEventType, number> {
  return auditEntries.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, { directive: 0, security_event: 0, refusal: 0 } as Record<AuditEventType, number>);
}
