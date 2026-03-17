/**
 * CMPSBL® Ingest Audit Trail
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Logs all ingestion and node activity for the Ascension pipeline.
 * Non-blocking. Uses audit_logs table for persistence.
 *
 * Tracked events:
 *   - upload: file upload received
 *   - extraction: primitive extraction completed
 *   - node_created: candidate node registered
 *   - chain_participation: node participated in discovery chain
 *   - promotion: node promoted to persistent
 *   - demotion: node demoted or archived
 *   - deletion: node permanently deleted
 *   - re_extraction: primitives re-extracted
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type AuditEventType =
  | 'upload'
  | 'extraction'
  | 'node_created'
  | 'chain_participation'
  | 'promotion'
  | 'demotion'
  | 'deletion'
  | 're_extraction';

export interface AuditEvent {
  type: AuditEventType;
  nodeId?: string;
  nodeName?: string;
  userId?: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — AUDIT LOGGER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Log an audit event. Non-blocking.
 */
export function logAuditEvent(
  type: AuditEventType,
  details: Record<string, unknown>,
  nodeId?: string,
  userId?: string
): void {
  const payload = {
    action: `ingest.${type}`,
    entity_type: 'ascension_node',
    entity_id: nodeId || null,
    performed_by: userId || null,
    details: {
      event_type: type,
      ...details,
    },
  };

  // Non-blocking write
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase as any)
    .from('audit_logs')
    .insert(payload)
    .then(() => {})
    .catch(() => {});
}

/**
 * Log upload event
 */
export function logUpload(
  fileName: string,
  fileSize: number,
  language: string,
  userId?: string
): void {
  logAuditEvent('upload', {
    file_name: fileName,
    file_size_bytes: fileSize,
    language,
  }, undefined, userId);
}

/**
 * Log extraction event
 */
export function logExtraction(
  nodeId: string,
  primitivesCount: number,
  durationMs: number,
  userId?: string
): void {
  logAuditEvent('extraction', {
    primitives_count: primitivesCount,
    duration_ms: durationMs,
  }, nodeId, userId);
}

/**
 * Log node creation
 */
export function logNodeCreated(
  nodeId: string,
  nodeName: string,
  language: string,
  userId?: string
): void {
  logAuditEvent('node_created', {
    node_name: nodeName,
    language,
  }, nodeId, userId);
}

/**
 * Log chain participation
 */
export function logChainParticipation(
  nodeId: string,
  chainModules: string[],
  cjpiScore: number,
  userId?: string
): void {
  logAuditEvent('chain_participation', {
    chain_modules: chainModules,
    chain_length: chainModules.length,
    cjpi_score: cjpiScore,
  }, nodeId, userId);
}

/**
 * Log promotion/demotion
 */
export function logStatusChange(
  nodeId: string,
  previousStatus: string,
  newStatus: string,
  userId?: string
): void {
  const type = newStatus === 'active' ? 'promotion' : 'demotion';
  logAuditEvent(type, {
    previous_status: previousStatus,
    new_status: newStatus,
  }, nodeId, userId);
}

/**
 * Log deletion
 */
export function logDeletion(
  nodeId: string,
  nodeName: string,
  userId?: string
): void {
  logAuditEvent('deletion', {
    node_name: nodeName,
  }, nodeId, userId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — AUDIT QUERY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch audit trail for a specific node or all ingest events
 */
export async function getAuditTrail(options: {
  nodeId?: string;
  type?: AuditEventType;
  limit?: number;
} = {}): Promise<AuditEvent[]> {
  const { nodeId, type, limit = 100 } = options;

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

  return (data as Array<Record<string, unknown>>).map(row => ({
    type: String(row.action || '').replace('ingest.', '') as AuditEventType,
    nodeId: row.entity_id as string | undefined,
    nodeName: ((row.details as Record<string, unknown>)?.node_name as string) || undefined,
    userId: row.performed_by as string | undefined,
    details: (row.details || {}) as Record<string, unknown>,
    timestamp: String(row.created_at || ''),
  }));
}
