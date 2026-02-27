/**
 * Audit Engine Types
 * Production readiness validation framework
 */

export type AuditSeverity = 'info' | 'warn' | 'error' | 'fatal';

export type AuditCategory =
  | 'build'
  | 'runtime'
  | 'routes'
  | 'imports'
  | 'hooks'
  | 'modules' // legacy compat — maps to Matrix Nodes
  | 'matrix'
  | 'terminal'
  | 'supabase'
  | 'ui'
  | 'a11y'
  | 'seo'
  | 'performance'
  | 'security'
  | 'docs';

export interface AuditFinding {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  title: string;
  detail: string;
  file?: string;
  hint?: string;
  fix_applied?: boolean;
}

export interface AuditReport {
  run_id: string;
  version: string;
  created_at: string;
  duration_ms: number;
  summary: {
    fatal: number;
    error: number;
    warn: number;
    info: number;
    total: number;
    passed: boolean;
  };
  findings: AuditFinding[];
}
