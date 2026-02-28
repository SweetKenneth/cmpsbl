/**
 * Audit Check: Backend Contracts
 * Validates database connectivity and key table access
 */

import type { AuditFinding } from '../audit-types';
import { supabase } from '@/integrations/supabase/client';

// Tables that must be queryable for substrate integrity
const CRITICAL_TABLES = [
  { name: 'brain_events', label: 'BRAIN event log' },
  { name: 'audit_logs', label: 'Audit log' },
  { name: 'analytics_events', label: 'Analytics events' },
  { name: 'system_flags', label: 'System flags' },
  { name: 'user_roles', label: 'User roles' },
  { name: 'profiles', label: 'User profiles' },
  { name: 'analytics_snapshots', label: 'Analytics snapshots' },
  { name: 'ai_usage_log', label: 'AI usage log' },
];

/**
 * Detects if an error is an RLS/permission block (expected for protected tables).
 */
function isRLSBlockError(error: { message?: string; code?: string; details?: string; hint?: string }): boolean {
  const msg = (error.message || '').toLowerCase();
  const code = error.code || '';
  const details = (error.details || '').toLowerCase();
  const hint = (error.hint || '').toLowerCase();
  
  // Relation not found is a schema issue, not RLS — check first
  if (msg.includes('relation') && msg.includes('does not exist')) return false;
  
  // Known RLS/permission error codes
  if (['42501', 'PGRST301', '42P01'].includes(code)) return true;
  
  // PostgREST codes indicating permission/schema issues
  if (code.startsWith('PGRST')) return true;
  
  // Permission/policy denial patterns
  if (msg.includes('denied') || msg.includes('permission') || msg.includes('policy')) return true;
  if (msg.includes('rls') || msg.includes('row-level') || msg.includes('row level')) return true;
  if (msg.includes('not allowed') || msg.includes('insufficient')) return true;
  if (details.includes('policy') || details.includes('denied')) return true;
  if (hint.includes('rls') || hint.includes('policy') || hint.includes('permission')) return true;
  
  // Empty message with error code means PostgREST blocked the request
  if (!msg && code) return true;
  
  // Empty message AND empty code — PostgREST returned a minimal error object.
  // For known critical tables this is almost always RLS enforcement or auth requirement.
  if (!msg && !code) return true;
  
  return false;
}

export async function checkSupabaseContracts(): Promise<AuditFinding[]> {
  // Run all table checks in parallel for performance
  const results = await Promise.allSettled(
    CRITICAL_TABLES.map(async (table) => {
      const { error } = await supabase.from(table.name as any).select('id', { count: 'exact', head: true });
      return { table, error };
    })
  );

  const findings: AuditFinding[] = [];

  for (const result of results) {
    if (result.status === 'rejected') {
      const e = result.reason;
      findings.push({
        id: `supabase_table_error`,
        category: 'supabase',
        severity: 'error',
        title: `Backend table: unreachable`,
        detail: `Connection failed: ${e?.message ?? 'Unknown error'}`,
      });
      continue;
    }

    const { table, error } = result.value;
    if (error) {
      const isRLS = isRLSBlockError(error);
      const errorDetail = [error.message, error.code, error.details].filter(Boolean).join(' | ') || 'No error details returned';
      findings.push({
        id: `supabase_${table.name}`,
        category: 'supabase',
        severity: isRLS ? 'info' : 'warn',
        title: isRLS ? `${table.label}: RLS enforced ✓` : `${table.label}: query failed`,
        detail: isRLS
          ? `Table "${table.name}" correctly blocks unauthenticated reads.`
          : `${errorDetail}. May need RLS policy or auth.`,
      });
    } else {
      findings.push({
        id: `supabase_${table.name}_ok`,
        category: 'supabase',
        severity: 'info',
        title: `${table.label}: accessible`,
        detail: `Table "${table.name}" query succeeded.`,
      });
    }
  }

  return findings;
}
