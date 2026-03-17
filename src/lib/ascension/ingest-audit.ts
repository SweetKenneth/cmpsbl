/**
 * CMPSBL® Ingest Audit Trail
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Logs all ingestion and node activity for the Ascension pipeline.
 * Non-blocking. Uses audit_logs table for persistence.
 * Supports correlation IDs for end-to-end lifecycle tracing.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import type { AuditEventType, AuditEvent } from './types';

// Re-export types
export type { AuditEvent, AuditEventType };

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — AUDIT LOGGER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Log an audit event. Non-blocking.
 */
export function logAuditEvent(
  type: AuditEventType,
  details: Record<string, unknown>,
  nodeId?: string,
  userId?: string,
  correlationId?: string,
): void {
  const payload = {
    action: `ingest.${type}`,
    entity_type: 'ascension_node',
    entity_id: nodeId || null,
    performed_by: userId || null,
    details: {
      event_type: type,
      correlation_id: correlationId || null,
      ...details,
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase as any)
    .from('audit_logs')
    .insert(payload)
    .then(() => {})
    .catch(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — TYPED EVENT LOGGERS
// ═══════════════════════════════════════════════════════════════════════════════

export function logUpload(
  fileName: string, fileSize: number, language: string,
  userId?: string, correlationId?: string
): void {
  logAuditEvent('upload', { file_name: fileName, file_size_bytes: fileSize, language }, undefined, userId, correlationId);
}

export function logExtraction(
  nodeId: string, primitivesCount: number, acceptedCount: number,
  rejectedCount: number, durationMs: number, userId?: string, correlationId?: string
): void {
  logAuditEvent('extraction', {
    primitives_total: primitivesCount,
    primitives_accepted: acceptedCount,
    primitives_rejected: rejectedCount,
    duration_ms: durationMs,
  }, nodeId, userId, correlationId);
}

export function logQualityGate(
  nodeId: string, avgQuality: number, accepted: number, rejected: number,
  userId?: string, correlationId?: string
): void {
  logAuditEvent('quality_gate', {
    avg_quality_score: avgQuality,
    accepted_count: accepted,
    rejected_count: rejected,
  }, nodeId, userId, correlationId);
}

export function logNodeCreated(
  nodeId: string, nodeName: string, language: string,
  userId?: string, correlationId?: string
): void {
  logAuditEvent('node_created', { node_name: nodeName, language }, nodeId, userId, correlationId);
}

export function logChainParticipation(
  nodeId: string, chainModules: string[], cjpiScore: number,
  userId?: string, correlationId?: string
): void {
  logAuditEvent('chain_participation', {
    chain_modules: chainModules,
    chain_length: chainModules.length,
    cjpi_score: cjpiScore,
  }, nodeId, userId, correlationId);
}

export function logDeltaMeasured(
  nodeId: string, verdict: string, impactScore: number,
  userId?: string, correlationId?: string
): void {
  logAuditEvent('delta_measured', {
    verdict, impact_score: impactScore,
  }, nodeId, userId, correlationId);
}

export function logStatusChange(
  nodeId: string, previousStatus: string, newStatus: string,
  userId?: string, correlationId?: string
): void {
  const type = newStatus === 'active' ? 'promotion' : 'demotion';
  logAuditEvent(type, {
    previous_status: previousStatus, new_status: newStatus,
  }, nodeId, userId, correlationId);
}

export function logDeletion(
  nodeId: string, nodeName: string,
  userId?: string, correlationId?: string
): void {
  logAuditEvent('deletion', { node_name: nodeName }, nodeId, userId, correlationId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — AUDIT QUERY
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAuditTrail(options: {
  nodeId?: string;
  type?: AuditEventType;
  correlationId?: string;
  limit?: number;
} = {}): Promise<AuditEvent[]> {
  const { nodeId, type, correlationId, limit = 100 } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('audit_logs')
    .select('*')
    .like('action', 'ingest.%')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (nodeId) query = query.eq('entity_id', nodeId);
  if (type) query = query.eq('action', `ingest.${type}`);

  const { data, error } = await query;
  if (error || !data) return [];

  let events = (data as Array<Record<string, unknown>>).map(row => {
    const details = (row.details || {}) as Record<string, unknown>;
    return {
      type: String(row.action || '').replace('ingest.', '') as AuditEventType,
      nodeId: row.entity_id as string | undefined,
      nodeName: (details.node_name as string) || undefined,
      userId: row.performed_by as string | undefined,
      correlationId: (details.correlation_id as string) || undefined,
      details,
      timestamp: String(row.created_at || ''),
    };
  });

  if (correlationId) {
    events = events.filter(e => e.correlationId === correlationId);
  }

  return events;
}
