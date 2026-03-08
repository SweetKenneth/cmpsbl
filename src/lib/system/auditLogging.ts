/**
 * SYSTEM Module — Audit Logging
 * Comprehensive audit trail and compliance logging
 */

import { supabase } from '@/integrations/supabase/client';

// ============ Types ============

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: AuditActor;
  action: AuditAction;
  resource: AuditResource;
  outcome: 'success' | 'failure' | 'partial';
  details?: Record<string, unknown>;
  changes?: AuditChange[];
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    request_id?: string;
    duration_ms?: number;
  };
}

export interface AuditActor {
  type: 'user' | 'system' | 'api_key' | 'cron' | 'seba';
  id: string;
  name?: string;
}

export interface AuditAction {
  type: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'login' | 'logout' | 'approve' | 'reject';
  name: string;
  category: 'auth' | 'data' | 'config' | 'security' | 'evolution' | 'integration';
}

export interface AuditResource {
  type: string;
  id: string;
  name?: string;
}

export interface AuditChange {
  field: string;
  old_value?: unknown;
  new_value?: unknown;
}

export interface AuditQuery {
  actor_id?: string;
  actor_type?: AuditActor['type'];
  action_type?: AuditAction['type'];
  action_category?: AuditAction['category'];
  resource_type?: string;
  resource_id?: string;
  outcome?: AuditEntry['outcome'];
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface AuditStats {
  total_entries: number;
  entries_by_action: Record<string, number>;
  entries_by_outcome: Record<string, number>;
  entries_by_category: Record<string, number>;
  top_actors: { id: string; count: number }[];
  recent_failures: AuditEntry[];
}

// ============ State ============

const auditLog: AuditEntry[] = [];
const MAX_IN_MEMORY = 10000;

// ============ Logging Operations ============

/**
 * Log an audit entry
 */
export async function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<string> {
  const auditEntry: AuditEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  
  // Store in memory (bounded)
  auditLog.push(auditEntry);
  if (auditLog.length > MAX_IN_MEMORY) {
    auditLog.splice(0, auditLog.length - MAX_IN_MEMORY);
  }
  
  // Persist to database (fire-and-forget — don't block caller)
  supabase.from('audit_logs').insert([{
    action: auditEntry.action.name,
    entity_type: auditEntry.resource.type,
    entity_id: auditEntry.resource.id,
    performed_by: auditEntry.actor.id,
    details: {
      actor_id: auditEntry.actor.id,
      actor_type: auditEntry.actor.type,
      action_type: auditEntry.action.type,
      outcome: auditEntry.outcome,
    } as Record<string, string>,
  }]).then(({ error }) => {
    if (error) console.error('Failed to persist audit entry:', error);
  });
  
  return auditEntry.id;
}

/**
 * Log user action (convenience method)
 */
export async function logUserAction(
  userId: string,
  actionName: string,
  resourceType: string,
  resourceId: string,
  options?: {
    outcome?: AuditEntry['outcome'];
    changes?: AuditChange[];
    details?: Record<string, unknown>;
  }
): Promise<string> {
  return logAudit({
    actor: { type: 'user', id: userId },
    action: { type: 'execute', name: actionName, category: 'data' },
    resource: { type: resourceType, id: resourceId },
    outcome: options?.outcome || 'success',
    changes: options?.changes,
    details: options?.details,
  });
}

/**
 * Log system action
 */
export async function logSystemAction(
  actionName: string,
  resourceType: string,
  resourceId: string,
  outcome: AuditEntry['outcome'] = 'success',
  details?: Record<string, unknown>
): Promise<string> {
  return logAudit({
    actor: { type: 'system', id: 'substrate', name: 'CMPSBL Substrate' },
    action: { type: 'execute', name: actionName, category: 'config' },
    resource: { type: resourceType, id: resourceId },
    outcome,
    details,
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  actionName: string,
  actorId: string,
  resourceId: string,
  outcome: AuditEntry['outcome'],
  details?: Record<string, unknown>
): Promise<string> {
  return logAudit({
    actor: { type: 'user', id: actorId },
    action: { type: 'execute', name: actionName, category: 'security' },
    resource: { type: 'security_event', id: resourceId },
    outcome,
    details,
  });
}

/**
 * Log data change with before/after
 */
export async function logDataChange(
  actorId: string,
  resourceType: string,
  resourceId: string,
  changes: AuditChange[],
  actionType: 'create' | 'update' | 'delete' = 'update'
): Promise<string> {
  return logAudit({
    actor: { type: 'user', id: actorId },
    action: { type: actionType, name: `${actionType}_${resourceType}`, category: 'data' },
    resource: { type: resourceType, id: resourceId },
    outcome: 'success',
    changes,
  });
}

// ============ Query Operations ============

/**
 * Query audit log
 */
export async function queryAuditLog(query: AuditQuery): Promise<AuditEntry[]> {
  const fromDate = query.from_date ? new Date(query.from_date) : null;
  const toDate = query.to_date ? new Date(query.to_date) : null;

  // Single-pass filter instead of sequential intermediate arrays
  const results = auditLog.filter(e =>
    (!query.actor_id || e.actor.id === query.actor_id) &&
    (!query.actor_type || e.actor.type === query.actor_type) &&
    (!query.action_type || e.action.type === query.action_type) &&
    (!query.action_category || e.action.category === query.action_category) &&
    (!query.resource_type || e.resource.type === query.resource_type) &&
    (!query.resource_id || e.resource.id === query.resource_id) &&
    (!query.outcome || e.outcome === query.outcome) &&
    (!fromDate || new Date(e.timestamp) >= fromDate) &&
    (!toDate || new Date(e.timestamp) <= toDate)
  );

  // Sort by timestamp descending
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply pagination
  const offset = query.offset || 0;
  const limit = query.limit || 100;

  return results.slice(offset, offset + limit);
}

/**
 * Get audit entry by ID
 */
export function getAuditEntry(id: string): AuditEntry | null {
  return auditLog.find(e => e.id === id) || null;
}

/**
 * Get entries for a specific resource
 */
export function getResourceHistory(
  resourceType: string,
  resourceId: string,
  limit: number = 50
): AuditEntry[] {
  return auditLog
    .filter(e => e.resource.type === resourceType && e.resource.id === resourceId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Get entries for a specific actor
 */
export function getActorHistory(
  actorId: string,
  limit: number = 50
): AuditEntry[] {
  return auditLog
    .filter(e => e.actor.id === actorId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// ============ Analytics ============

/**
 * Get audit statistics
 */
export function getAuditStats(since?: string): AuditStats {
  let entries = [...auditLog];
  
  if (since) {
    const sinceDate = new Date(since);
    entries = entries.filter(e => new Date(e.timestamp) >= sinceDate);
  }
  
  const byAction: Record<string, number> = {};
  const byOutcome: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const actorCounts: Record<string, number> = {};
  
  entries.forEach(e => {
    byAction[e.action.type] = (byAction[e.action.type] || 0) + 1;
    byOutcome[e.outcome] = (byOutcome[e.outcome] || 0) + 1;
    byCategory[e.action.category] = (byCategory[e.action.category] || 0) + 1;
    actorCounts[e.actor.id] = (actorCounts[e.actor.id] || 0) + 1;
  });
  
  const topActors = Object.entries(actorCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  const recentFailures = entries
    .filter(e => e.outcome === 'failure')
    .slice(0, 10);
  
  return {
    total_entries: entries.length,
    entries_by_action: byAction,
    entries_by_outcome: byOutcome,
    entries_by_category: byCategory,
    top_actors: topActors,
    recent_failures: recentFailures,
  };
}

/**
 * Get entries count by time period
 */
export function getEntriesByPeriod(
  periodType: 'hour' | 'day' | 'week',
  periods: number = 24
): { period: string; count: number }[] {
  const now = new Date();
  const results: { period: string; count: number }[] = [];
  
  const msPerPeriod: Record<string, number> = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
  };
  
  for (let i = 0; i < periods; i++) {
    const periodEnd = new Date(now.getTime() - i * msPerPeriod[periodType]);
    const periodStart = new Date(periodEnd.getTime() - msPerPeriod[periodType]);
    
    const count = auditLog.filter(e => {
      const ts = new Date(e.timestamp);
      return ts >= periodStart && ts < periodEnd;
    }).length;
    
    results.push({
      period: periodStart.toISOString(),
      count,
    });
  }
  
  return results.reverse();
}

// ============ Compliance ============

/**
 * Export audit log for compliance
 */
 export async function exportAuditLog(query: AuditQuery): Promise<string> {
   const entries = await queryAuditLog(query);
   
   return JSON.stringify({
    exported_at: new Date().toISOString(),
    query,
     entries_count: entries.length,
    entries,
  }, null, 2);
}

/**
 * Generate compliance report
 */
export function generateComplianceReport(
  from: string,
  to: string
): {
  period: { from: string; to: string };
  summary: AuditStats;
  security_events: AuditEntry[];
  data_changes: AuditEntry[];
  access_events: AuditEntry[];
} {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  const periodEntries = auditLog.filter(e => {
    const ts = new Date(e.timestamp);
    return ts >= fromDate && ts <= toDate;
  });
  
  return {
    period: { from, to },
    summary: getAuditStats(from),
    security_events: periodEntries.filter(e => e.action.category === 'security').slice(0, 100),
    data_changes: periodEntries.filter(e => ['create', 'update', 'delete'].includes(e.action.type)).slice(0, 100),
    access_events: periodEntries.filter(e => e.action.category === 'auth').slice(0, 100),
  };
}

// ============ Cleanup ============

/**
 * Clear old entries (for memory management)
 */
export function pruneAuditLog(keepDays: number = 30): number {
  const cutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
  const before = auditLog.length;
  
  const toKeep = auditLog.filter(e => new Date(e.timestamp) >= cutoff);
  auditLog.length = 0;
  auditLog.push(...toKeep);
  
  return before - auditLog.length;
}
