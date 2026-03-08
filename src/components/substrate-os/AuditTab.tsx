/**
 * AuditTab — OS Dashboard Tab for Production Readiness Audit + Test Suites
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Play, CheckCircle2, AlertTriangle, XCircle, Info,
  Clock, Cpu, ChevronDown, ChevronRight, FlaskConical, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { runFullAudit } from '@/lib/audit/audit-runner';
import type { AuditReport, AuditFinding, AuditSeverity, AuditCategory } from '@/lib/audit/audit-types';
import { TEST_SUITE_DEFS, runTestSuite, runAllTestSuites, type SuiteResult } from '@/lib/audit/test-suites';

const SEVERITY_CONFIG: Record<AuditSeverity, { icon: typeof Shield; color: string; bg: string; border: string }> = {
  fatal: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  error: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  warn: { icon: Info, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  info: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const CATEGORY_LABELS: Record<AuditCategory, string> = {
  build: 'Build', runtime: 'Runtime', routes: 'Routes', imports: 'Imports',
  hooks: 'Hooks', modules: 'Matrix Nodes', matrix: 'Matrix Integrity', terminal: 'Terminal', supabase: 'Backend',
  ui: 'UI/UX', a11y: 'Accessibility', seo: 'SEO', performance: 'Performance', security: 'Security', docs: 'Docs',
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

// ═══════════════════════════════════════════════════════════════
// TEST SUITE RUNNER UI
// ═══════════════════════════════════════════════════════════════

function TestSuiteRunner() {
  const [results, setResults] = useState<Record<string, SuiteResult>>({});
  const [running, setRunning] = useState<string | null>(null);

  async function handleRunSuite(suiteId: string) {
    setRunning(suiteId);
    try {
      const result = await runTestSuite(suiteId);
      setResults(prev => ({ ...prev, [suiteId]: result }));
    } catch (e: any) {
      console.error(`[TestSuite] ${suiteId} crashed:`, e);
    } finally {
      setRunning(null);
    }
  }

  async function handleRunAll() {
    setRunning('all');
    try {
      const all = await runAllTestSuites();
      const map: Record<string, SuiteResult> = {};
      for (const r of all) map[r.id] = r;
      setResults(map);
    } catch (e: any) {
      console.error('[TestSuite] Run all crashed:', e);
    } finally {
      setRunning(null);
    }
  }

  const totalPassed = Object.values(results).reduce((s, r) => s + r.passed, 0);
  const totalFailed = Object.values(results).reduce((s, r) => s + r.failed, 0);
  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-violet-400" />
            Test Suites
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Run substrate, MEMORY stream, and release gate validation in-browser
          </p>
        </div>
        <Button
          onClick={handleRunAll}
          disabled={!!running}
          size="sm"
          className="gap-2 bg-violet-600 hover:bg-violet-500 text-white shrink-0"
        >
          {running === 'all' ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running === 'all' ? 'Running All…' : 'Run All Suites'}
        </Button>
      </div>

      {/* Summary bar */}
      {hasResults && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-sm">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            ✅ {totalPassed} passed
          </Badge>
          {totalFailed > 0 && (
            <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
              ❌ {totalFailed} failed
            </Badge>
          )}
        </motion.div>
      )}

      {/* Suite Cards */}
      <div className="space-y-3">
        {TEST_SUITE_DEFS.map(def => {
          const result = results[def.id];
          const isRunning = running === def.id || running === 'all';

          return (
            <Card key={def.id} className={cn(
              'border transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm',
              result && result.failed === 0 && 'border-emerald-500/20',
              result && result.failed > 0 && 'border-red-500/20',
            )}>
              <CardHeader className="p-3 pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span>{def.icon}</span> {def.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {result && (
                      <span className="text-[10px] text-muted-foreground font-mono">{result.totalMs}ms</span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs gap-1"
                      disabled={isRunning}
                      onClick={() => handleRunSuite(def.id)}
                    >
                      {isRunning ? <Cpu className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                      {isRunning ? 'Running…' : 'Run'}
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{def.description}</p>
              </CardHeader>

              <CardContent className="p-3 pt-2">
                {!result && !isRunning && (
                  <p className="text-xs text-muted-foreground/50 italic">Not run yet — {def.testCount}</p>
                )}

                {result && (
                  <div className="space-y-1">
                    {result.tests.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="shrink-0 mt-0.5">
                          {t.passed
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={cn('font-medium', t.passed ? 'text-foreground' : 'text-red-400')}>
                            {t.name}
                          </span>
                          <span className="text-muted-foreground/50 ml-1.5 font-mono tabular-nums">{t.durationMs}ms</span>
                          {t.error && (
                            <p className="text-red-400/80 text-[10px] mt-0.5 font-mono truncate">{t.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN AUDIT TAB
// ═══════════════════════════════════════════════════════════════

export function AuditTab() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [filter, setFilter] = useState<AuditSeverity | 'all'>('all');

  async function handleRun() {
    setLoading(true);
    try {
      const result = await runFullAudit({ version: '10.5.0' });
      setReport(result);
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
    <Tabs defaultValue="tests" className="space-y-4 max-w-full overflow-hidden">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tests" className="gap-1.5 text-xs">
          <FlaskConical className="w-3.5 h-3.5" /> Test Suites
        </TabsTrigger>
        <TabsTrigger value="audit" className="gap-1.5 text-xs">
          <Shield className="w-3.5 h-3.5" /> Production Audit
        </TabsTrigger>
      </TabsList>

      {/* TEST SUITES TAB */}
      <TabsContent value="tests">
        <TestSuiteRunner />
      </TabsContent>

      {/* PRODUCTION AUDIT TAB */}
      <TabsContent value="audit">
        <div className="space-y-4">
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

          {report && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Card className={cn('border-2', report.summary.passed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5')}>
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
                  <Card key={sev} className={cn('cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm', config.border, filter === sev && config.bg)} onClick={() => setFilter(filter === sev ? 'all' : sev)}>
                    <CardContent className="p-3 text-center">
                      <div className={cn('text-lg font-bold font-mono tabular-nums', config.color)}>{count}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{sev}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {report && (
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{report.duration_ms}ms</span>
              <span>{report.summary.total} checks</span>
              <span>v{report.version}</span>
              <span>{new Date(report.created_at).toLocaleTimeString()}</span>
            </div>
          )}

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

          {!report && !loading && (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Run the audit to validate system integrity</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Checks modules, terminal, routes, SEO, UI, hooks, and backend</p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
