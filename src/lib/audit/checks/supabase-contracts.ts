/**
 * Audit Check: Backend Contracts
 * Validates database connectivity and key table access
 */

import type { AuditFinding } from '../audit-types';
import { supabase } from '@/integrations/supabase/client';

export async function checkSupabaseContracts(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  // Check basic connectivity
  try {
    const { error } = await supabase.from('brain_events').select('id', { count: 'exact', head: true });
    if (error) {
      findings.push({
        id: 'supabase_connectivity',
        category: 'supabase',
        severity: 'error',
        title: 'Database connectivity issue',
        detail: `Failed to query brain_events: ${error.message}`,
      });
    } else {
      findings.push({
        id: 'supabase_connectivity_ok',
        category: 'supabase',
        severity: 'info',
        title: 'Database connected',
        detail: 'Successfully queried brain_events table.',
      });
    }
  } catch (e: any) {
    findings.push({
      id: 'supabase_unreachable',
      category: 'supabase',
      severity: 'fatal',
      title: 'Database unreachable',
      detail: `Connection failed: ${e?.message ?? 'Unknown error'}`,
    });
  }

  // Check audit_logs accessibility
  try {
    const { error } = await supabase.from('audit_logs').select('id', { count: 'exact', head: true });
    if (error) {
      findings.push({
        id: 'supabase_audit_logs',
        category: 'supabase',
        severity: 'warn',
        title: 'audit_logs query failed',
        detail: `${error.message}. May need RLS policy or auth.`,
      });
    } else {
      findings.push({
        id: 'supabase_audit_logs_ok',
        category: 'supabase',
        severity: 'info',
        title: 'audit_logs accessible',
        detail: 'Table query succeeded.',
      });
    }
  } catch {
    // ignore
  }

  return findings;
}
