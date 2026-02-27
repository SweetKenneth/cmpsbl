/**
 * Atlas Audit Logger
 * Full audit trail for all Atlas operations
 */

import { supabase } from '@/integrations/supabase/client';
import type { AtlasAuditEntry, AtlasStatus, SECRET_PATTERNS } from './types';

/**
 * Redact secrets from any object or string
 */
export function redactSecrets(input: unknown): unknown {
  if (input === null || input === undefined) return input;
  
  if (typeof input === 'string') {
    let redacted = input;
    const patterns = [
      /sk_[a-zA-Z0-9_-]{20,}/gi,
      /pk_[a-zA-Z0-9_-]{20,}/gi,
      /api[_-]?key[=:\s]["']?[a-zA-Z0-9_-]+["']?/gi,
      /bearer\s+[a-zA-Z0-9_.-]+/gi,
      /token[=:\s]["']?[a-zA-Z0-9_.-]+["']?/gi,
      /password[=:\s]["']?[^\s"']+["']?/gi,
      /secret[=:\s]["']?[^\s"']+["']?/gi,
      /supabase_service_role_key/gi,
      /[a-zA-Z0-9_]+_KEY=[^\s]+/gi,
      /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi, // JWT
    ];
    
    patterns.forEach(pattern => {
      redacted = redacted.replace(pattern, '[REDACTED]');
    });
    
    return redacted;
  }
  
  if (Array.isArray(input)) {
    return input.map(item => redactSecrets(item));
  }
  
  if (typeof input === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Redact sensitive keys entirely
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('key') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('cookie') ||
        lowerKey.includes('authorization')
      ) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSecrets(value);
      }
    }
    return redacted;
  }
  
  return input;
}

/**
 * Generate a trace ID
 */
export function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `atlas-${timestamp}-${random}`;
}

/**
 * Write an audit entry
 */
export async function writeAuditEntry(entry: {
  actor?: string;
  actor_role?: string;
  op: string;
  target?: string;
  payload?: Record<string, unknown>;
  result_summary?: string;
  status: AtlasStatus;
  trace_id: string;
  execution_ms?: number;
  dry_run?: boolean;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('substrate_audit_log')
      .insert({
        actor: entry.actor,
        actor_role: entry.actor_role,
        op: entry.op,
        target: entry.target,
        payload_redacted: entry.payload ? JSON.parse(JSON.stringify(redactSecrets(entry.payload))) : null,
        result_summary: entry.result_summary,
        status: entry.status,
        trace_id: entry.trace_id,
        execution_ms: entry.execution_ms,
        dry_run: entry.dry_run ?? false,
      });
    
    if (error) {
      console.error('[Atlas Audit] Write failed:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('[Atlas Audit] Write error:', err);
    return false;
  }
}

/**
 * Query audit entries
 */
export async function queryAuditLog(options: {
  limit?: number;
  op?: string;
  status?: AtlasStatus;
  module?: string;
  since?: string;
}): Promise<AtlasAuditEntry[]> {
  let query = supabase
    .from('substrate_audit_log')
    .select('*')
    .order('ts', { ascending: false })
    .limit(options.limit ?? 50);
  
  if (options.op) {
    query = query.eq('op', options.op);
  }
  if (options.status) {
    query = query.eq('status', options.status);
  }
  if (options.module) {
    query = query.ilike('target', `${options.module}%`);
  }
  if (options.since) {
    query = query.gte('ts', options.since);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('[Atlas Audit] Query failed:', error);
    return [];
  }
  
  return (data || []).map(row => ({
    id: row.id,
    ts: row.ts,
    actor: row.actor,
    actor_role: row.actor_role,
    op: row.op,
    target: row.target,
    payload_redacted: row.payload_redacted as Record<string, unknown>,
    result_summary: row.result_summary,
    status: row.status as AtlasStatus,
    trace_id: row.trace_id,
    execution_ms: row.execution_ms,
    dry_run: row.dry_run,
  }));
}
