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

export async function checkSupabaseContracts(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];

  for (const table of CRITICAL_TABLES) {
    try {
      const { error } = await supabase.from(table.name as any).select('id', { count: 'exact', head: true });
      if (error) {
        // RLS block (401/403) is expected for protected tables — that's a PASS
        const isRLSBlock = error.message?.includes('denied') || error.code === '42501' || error.code === 'PGRST301';
        findings.push({
          id: `supabase_${table.name}`,
          category: 'supabase',
          severity: isRLSBlock ? 'info' : 'warn',
          title: isRLSBlock ? `${table.label}: RLS enforced ✓` : `${table.label}: query failed`,
          detail: isRLSBlock
            ? `Table "${table.name}" correctly blocks unauthenticated reads.`
            : `${error.message}. May need RLS policy or auth.`,
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
    } catch (e: any) {
      findings.push({
        id: `supabase_${table.name}_error`,
        category: 'supabase',
        severity: table.name === 'brain_events' ? 'fatal' : 'error',
        title: `${table.label}: unreachable`,
        detail: `Connection failed: ${e?.message ?? 'Unknown error'}`,
      });
    }
  }

  return findings;
}
