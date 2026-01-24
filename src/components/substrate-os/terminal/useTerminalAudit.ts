/**
 * Terminal Audit Trail
 * Records all command executions for security and debugging
 */

import { supabase } from '@/integrations/supabase/client';

export interface AuditEntry {
  id: string;
  command: string;
  status: 'success' | 'error' | 'pending';
  output?: string;
  duration_ms?: number;
  timestamp: Date;
  session_id: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const localAuditLog: AuditEntry[] = [];
const MAX_LOCAL_LOG = 500;

// Record to database if available, otherwise local only
export async function recordAuditEntry(
  command: string,
  status: 'success' | 'error' | 'pending',
  output?: string,
  duration_ms?: number,
  metadata?: Record<string, unknown>
): Promise<string> {
  const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const entry: AuditEntry = {
    id,
    command,
    status,
    output: output?.substring(0, 5000), // Truncate long outputs
    duration_ms,
    timestamp: new Date(),
    session_id: SESSION_ID,
    metadata,
  };
  
  // Add to local log
  localAuditLog.push(entry);
  if (localAuditLog.length > MAX_LOCAL_LOG) {
    localAuditLog.shift();
  }
  
  // Try to persist to database (fire and forget)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      entry.user_id = user.id;
      
      await supabase.from('audit_logs').insert({
        action: 'terminal_command',
        entity_type: 'terminal',
        entity_id: SESSION_ID,
        performed_by: user.id,
        details: {
          command,
          status,
          duration_ms,
          session_id: SESSION_ID,
          ...metadata,
        },
      });
    }
  } catch (e) {
    // Silently fail - local log is the fallback
  }
  
  return id;
}

export function getLocalAuditLog(): AuditEntry[] {
  return [...localAuditLog];
}

export function getSessionStats() {
  const successCount = localAuditLog.filter(e => e.status === 'success').length;
  const errorCount = localAuditLog.filter(e => e.status === 'error').length;
  const totalDuration = localAuditLog.reduce((sum, e) => sum + (e.duration_ms || 0), 0);
  
  return {
    session_id: SESSION_ID,
    command_count: localAuditLog.length,
    success_count: successCount,
    error_count: errorCount,
    success_rate: localAuditLog.length > 0 ? (successCount / localAuditLog.length) * 100 : 0,
    total_duration_ms: totalDuration,
    avg_duration_ms: localAuditLog.length > 0 ? totalDuration / localAuditLog.length : 0,
    started_at: localAuditLog[0]?.timestamp || new Date(),
  };
}

export function formatAuditLog(entries: AuditEntry[], limit = 20): string {
  const recent = entries.slice(-limit).reverse();
  
  if (recent.length === 0) {
    return '◉ No audit entries in current session.';
  }
  
  let output = `
┌─ TERMINAL AUDIT LOG ─────────────────────────────────────────
│
│  Session: ${SESSION_ID.substring(0, 20)}...
│  Entries: ${entries.length} │ Showing: ${recent.length}
│
├─ RECENT COMMANDS ────────────────────────────────────────────
│
`;

  recent.forEach((entry, i) => {
    const num = (i + 1).toString().padStart(2);
    const status = entry.status === 'success' ? '✓' : entry.status === 'error' ? '✗' : '○';
    const time = entry.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const duration = entry.duration_ms ? `${entry.duration_ms}ms` : '-';
    output += `│  ${num}. ${status} │ ${time} │ ${duration.padStart(6)} │ ${entry.command.substring(0, 40)}\n`;
  });

  const stats = getSessionStats();
  output += `│
├─ SESSION STATS ──────────────────────────────────────────────
│
│  Commands: ${stats.command_count} │ Success: ${stats.success_count} │ Errors: ${stats.error_count}
│  Success Rate: ${stats.success_rate.toFixed(1)}% │ Avg Duration: ${stats.avg_duration_ms.toFixed(0)}ms
│
└──────────────────────────────────────────────────────────────`;

  return output;
}

export function maskSensitiveData(text: string): string {
  // Mask API keys
  let masked = text.replace(/([a-zA-Z0-9_-]{32,})/g, (match) => {
    if (match.length > 32) {
      return match.substring(0, 8) + '...' + match.substring(match.length - 4);
    }
    return match;
  });
  
  // Mask emails
  masked = masked.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g, (match) => {
    const [local, domain] = match.split('@');
    return local.substring(0, 2) + '***@' + domain;
  });
  
  // Mask UUIDs (show first and last segment)
  masked = masked.replace(
    /([a-f0-9]{8})-([a-f0-9]{4})-([a-f0-9]{4})-([a-f0-9]{4})-([a-f0-9]{12})/gi,
    (match, g1, g2, g3, g4, g5) => `${g1}-****-****-****-${g5}`
  );
  
  return masked;
}

export function exportAuditLog(): string {
  const data = {
    session_id: SESSION_ID,
    exported_at: new Date().toISOString(),
    stats: getSessionStats(),
    entries: localAuditLog.map(e => ({
      ...e,
      output: e.output ? maskSensitiveData(e.output) : undefined,
    })),
  };
  
  return JSON.stringify(data, null, 2);
}
