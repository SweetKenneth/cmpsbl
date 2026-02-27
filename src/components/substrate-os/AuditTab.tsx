/**
 * AuditTab — OS Dashboard Tab for Production Readiness Audit
 *
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Play, CheckCircle2, AlertTriangle, XCircle, Info,
  Clock, Cpu, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { runFullAudit } from '@/lib/audit/audit-runner';
import type { AuditReport, AuditFinding, AuditSeverity, AuditCategory } from '@/lib/audit/audit-types';

const SEVERITY_CONFIG: Record<AuditSeverity, { icon: typeof Shield; color: string; bg: string; border: string }> = {
  fatal: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  error: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  warn: { icon: Info, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  info: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const CATEGORY_LABELS: Record<AuditCategory, string> = {
  build: 'Build', runtime: 'Runtime', routes: 'Routes', imports: 'Imports',
  hooks: 'Hooks', modules: 'Matrix Nodes', matrix: 'Matrix Integrity', terminal: 'Terminal', supabase: 'Backend',
  ui: 'UI/UX', a11y: 'Accessibility', seo: 'SEO', docs: 'Docs',
};

function FindingRow({ finding }: { finding: AuditFinding }) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[finding.severity];
  const Icon = config.icon;

  return (
    <motion.div
      className={cn('border rounded-lg overflow-hidden', config.border)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        <Icon className={cn('w-4 h-4 shrink-0', config.color)} />
        <span className="flex-1 text-sm font-medium text-foreground truncate">{finding.title}</span>
        <Badge variant="outline" className="text-[10px] h-5 shrink-0">{CATEGORY_LABELS[finding.category]}</Badge>
        {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={cn('px-3 py-2.5 text-xs space-y-1.5 border-t', config.border, config.bg)}>
              <p className="text-muted-foreground">{finding.detail}</p>
              {finding.hint && (
                <p className="text-muted-foreground/80 italic">💡 {finding.hint}</p>
              )}
              {finding.file && (
                <p className="font-mono text-[10px] text-muted-foreground/60">📁 {finding.file}</p>
              )}
              {finding.fix_applied && (
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  ✅ Auto-fixed
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AuditTab() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [filter, setFilter] = useState<AuditSeverity | 'all'>('all');

  async function handleRun() {
    setLoading(true);
    try {
      const result = await runFullAudit({ version: '10.5.0' });
      setReport(result);
      console.log('[Audit] Full report:', result);
    } catch (e) {
      console.error('[Audit] Failed:', e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = report?.findings.filter(f =>
    filter === 'all' ? true : f.severity === filter
  ) ?? [];

  const groupedByCategory = filtered.reduce<Record<string, AuditFinding[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Production Audit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full substrate readiness scan — modules, terminal, SEO, UI, backend
          </p>
        </div>
        <Button
          onClick={handleRun}
          disabled={loading}
          size="sm"
          className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white shrink-0"
        >
          {loading ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Scanning…' : 'Run Audit'}
        </Button>
      </div>

      {/* Summary Cards */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-5 gap-2"
        >
          {/* Gate */}
          <Card className={cn(
            'border-2',
            report.summary.passed
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-red-500/40 bg-red-500/5'
          )}>
            <CardContent className="p-3 text-center">
              <div className={cn('text-lg font-bold', report.summary.passed ? 'text-emerald-400' : 'text-red-400')}>
                {report.summary.passed ? '✅ PASS' : '❌ FAIL'}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Release Gate</div>
            </CardContent>
          </Card>

          {(['fatal', 'error', 'warn', 'info'] as AuditSeverity[]).map(sev => {
            const config = SEVERITY_CONFIG[sev];
            const count = report.summary[sev];
            return (
              <Card
                key={sev}
                className={cn('cursor-pointer transition-colors', config.border, filter === sev && config.bg)}
                onClick={() => setFilter(filter === sev ? 'all' : sev)}
              >
                <CardContent className="p-3 text-center">
                  <div className={cn('text-lg font-bold', config.color)}>{count}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">{sev}</div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}

      {/* Meta */}
      {report && (
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{report.duration_ms}ms</span>
          <span>{report.summary.total} checks</span>
          <span>v{report.version}</span>
          <span>{new Date(report.created_at).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Findings */}
      {report && (
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-2">
            {Object.entries(groupedByCategory).map(([category, findings]) => (
              <div key={category}>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {CATEGORY_LABELS[category as AuditCategory] ?? category} ({findings.length})
                </h3>
                <div className="space-y-1.5">
                  {findings.map(f => <FindingRow key={f.id} finding={f} />)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Empty state */}
      {!report && !loading && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Run the audit to validate system integrity</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Checks modules, terminal, routes, SEO, UI, hooks, and backend
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
