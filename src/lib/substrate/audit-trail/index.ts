/**
 * Audit Trail Manager
 * Immutable audit logging for compliance and forensics
 * 
 * Records all administrative and governance actions with
 * tamper-evident hashing for regulatory compliance.
 */

export interface AuditEntry {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  resource: string;
  resourceId: string;
  previousState: unknown;
  newState: unknown;
  metadata: Record<string, string>;
  hash: string;
  previousHash: string;
}

const auditLog: AuditEntry[] = [];
let lastHash = '0000000000000000';

function computeHash(entry: Omit<AuditEntry, 'hash'>): string {
  const data = `${entry.previousHash}:${entry.timestamp}:${entry.actor}:${entry.action}:${entry.resource}:${entry.resourceId}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const chr = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export function recordAudit(actor: string, action: string, resource: string, resourceId: string, previousState: unknown = null, newState: unknown = null, metadata: Record<string, string> = {}): AuditEntry {
  const partial = {
    id: `audit-${Date.now()}-${auditLog.length}`,
    timestamp: Date.now(), actor, action, resource, resourceId,
    previousState, newState, metadata, previousHash: lastHash,
  };
  const hash = computeHash(partial);
  const entry: AuditEntry = { ...partial, hash };
  auditLog.push(entry);
  lastHash = hash;
  return entry;
}

export function verifyChain(): { valid: boolean; brokenAt: number | null } {
  let prevHash = '0000000000000000';
  for (let i = 0; i < auditLog.length; i++) {
    if (auditLog[i].previousHash !== prevHash) {
      return { valid: false, brokenAt: i };
    }
    prevHash = auditLog[i].hash;
  }
  return { valid: true, brokenAt: null };
}

export function getAuditLog(limit?: number): AuditEntry[] {
  return limit ? auditLog.slice(-limit) : [...auditLog];
}

export function getAuditByActor(actor: string): AuditEntry[] {
  return auditLog.filter(e => e.actor === actor);
}

export function getAuditByResource(resource: string, resourceId?: string): AuditEntry[] {
  return auditLog.filter(e => e.resource === resource && (!resourceId || e.resourceId === resourceId));
}

export function getAuditCount(): number { return auditLog.length; }
