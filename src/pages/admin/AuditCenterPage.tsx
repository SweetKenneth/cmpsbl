/**
 * Audit Center — Unified audit hub consolidating all audit surfaces
 * Merges: AuditTab (test suites + production audit), Diligence Harness, Live Audit Feed
 */

import { useState, useCallback, lazy, Suspense } from 'react';
import {
  Shield, Play, Activity, Loader2, CheckCircle2, XCircle, AlertCircle,
  FlaskConical, FileText, ScrollText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLiveAuditFeed } from '@/hooks/useSubstrateOS';
import { formatDistanceToNow } from 'date-fns';
import type { DiligenceReport } from '@/lib/diligence/run-diligence';
import type { AuditReport } from '@/lib/audit/audit-types';

const AuditTab = lazy(() => import('@/components/substrate-os/AuditTab').then(m => ({ default: m.AuditTab })));

function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
    </div>
  );
}

export default function AuditCenterPage() {
  const [activeTab, setActiveTab] = useState('suites');
  const liveAuditFeed = useLiveAuditFeed(20);

  // Diligence
  const [diligenceRunning, setDiligenceRunning] = useState(false);
  const [diligenceReport, setDiligenceReport] = useState<DiligenceReport | null>(null);

  // Full Audit Runner (quick)
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  const runDiligenceHarness = useCallback(async () => {
    setDiligenceRunning(true);
    setDiligenceReport(null);
    try {
      const { runDiligence } = await import('@/lib/diligence/run-diligence');
      const report = await runDiligence();
      setDiligenceReport(report);
      toast.success(`Diligence: ${report.summary.passed}/${report.summary.total} passed`);
    } catch (e: any) {
      toast.error(`Diligence failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setDiligenceRunning(false);
    }
  }, []);

  const runFullAuditEngine = useCallback(async () => {
    setAuditRunning(true);
    setAuditReport(null);
    try {
      const { runFullAudit } = await import('@/lib/audit/audit-runner');
      const report = await runFullAudit();
      setAuditReport(report);
      toast.success(`Audit: ${report.summary.passed ? 'PASSED' : 'ISSUES FOUND'} (${report.summary.total} findings)`);
    } catch (e: any) {
      toast.error(`Audit failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setAuditRunning(false);
    }
  }, []);

  const getOutcomeColor = (outcome: string) => {
    if (outcome === 'success' || outcome === 'completed') return 'bg-neon-green/10 text-neon-green dark:text-neon-green border-neon-green/20';
    if (outcome === 'error' || outcome === 'failed') return 'bg-destructive/10 text-destructive dark:text-destructive border-destructive/20';
    return 'bg-muted text-muted-foreground border-border/20';
  };

  return (
    <div className="space-y-5 sm:space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/15 to-neon-cyan/10 border border-neon-amber/25 flex items-center justify-center shrink-0">
          <ScrollText className="w-5 h-5 text-neon-amber dark:text-neon-amber" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Audit Center</h1>
          <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">TEST SUITES · PRODUCTION AUDIT · DILIGENCE · LIVE FEED</p>
        </div>
        <Badge className="text-[9px] bg-neon-amber/10 text-neon-amber dark:text-neon-amber border-neon-amber/20 shrink-0">GOVERNOR</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          <TabsList className="bg-muted/15 border border-border/15 gap-0.5 w-max min-w-full sm:w-auto">
            <TabsTrigger value="suites" className="data-[state=active]:bg-neon-purple/10 data-[state=active]:text-neon-purple dark:data-[state=active]:text-neon-purple text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <FlaskConical className="w-3.5 h-3.5 hidden sm:block" /> Test Suites & Audit
            </TabsTrigger>
            <TabsTrigger value="diligence" className="data-[state=active]:bg-neon-amber/10 data-[state=active]:text-neon-amber dark:data-[state=active]:text-neon-amber text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Shield className="w-3.5 h-3.5 hidden sm:block" /> Diligence & Runner
            </TabsTrigger>
            <TabsTrigger value="feed" className="data-[state=active]:bg-neon-cyan/10 data-[state=active]:text-neon-cyan dark:data-[state=active]:text-neon-cyan text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Activity className="w-3.5 h-3.5 hidden sm:block" /> Live Feed
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Test Suites + Production Audit (the full AuditTab component) */}
        <TabsContent value="suites" className="mt-4">
          <Suspense fallback={<Loader />}>
            <AuditTab />
          </Suspense>
        </TabsContent>

        {/* Diligence Harness + Quick Audit Runner */}
        <TabsContent value="diligence" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Diligence */}
            <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-neon-amber" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold">Diligence Harness</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground/50">Terminal & governance probe battery</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={runDiligenceHarness} disabled={diligenceRunning} className="gap-1.5 text-xs">
                    {diligenceRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {diligenceRunning ? 'Running…' : 'Run'}
                  </Button>
                </div>
                {diligenceReport && (
                  <div className="space-y-2 pt-2 border-t border-border/10">
                    <div className="flex items-center gap-2">
                      {diligenceReport.summary.critical === 0 ? <CheckCircle2 className="w-4 h-4 text-neon-green" /> : <XCircle className="w-4 h-4 text-destructive" />}
                      <span className="text-xs font-mono">{diligenceReport.summary.passed}/{diligenceReport.summary.total} PASS · {diligenceReport.summary.minor} MINOR · {diligenceReport.summary.critical} CRITICAL</span>
                    </div>
                    {diligenceReport.failed_probes.length > 0 && (
                      <ScrollArea className="h-[160px]">
                        <div className="space-y-1">
                          {diligenceReport.failed_probes.map(p => (
                            <div key={p.id} className="text-[10px] p-1.5 rounded bg-muted/10 border border-border/10 font-mono">
                              <span className={p.severity === 'CRITICAL' ? 'text-destructive' : 'text-neon-amber'}>[{p.severity}]</span> {p.name} — <span className="text-muted-foreground/60">{p.command}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Audit Runner */}
            <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-neon-cyan" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold">Full Audit Runner</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground/50">Structural, contract, SEO & branding audit</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={runFullAuditEngine} disabled={auditRunning} className="gap-1.5 text-xs">
                    {auditRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {auditRunning ? 'Running…' : 'Run'}
                  </Button>
                </div>
                {auditReport && (
                  <div className="space-y-2 pt-2 border-t border-border/10">
                    <div className="flex items-center gap-2">
                      {auditReport.summary.passed ? <CheckCircle2 className="w-4 h-4 text-neon-green" /> : <AlertCircle className="w-4 h-4 text-neon-amber" />}
                      <span className="text-xs font-mono">{auditReport.summary.passed ? 'PASSED' : 'ISSUES'} · {auditReport.summary.fatal}F {auditReport.summary.error}E {auditReport.summary.warn}W {auditReport.summary.info}I · {auditReport.duration_ms}ms</span>
                    </div>
                    {auditReport.findings.filter(f => f.severity === 'fatal' || f.severity === 'error').length > 0 && (
                      <ScrollArea className="h-[160px]">
                        <div className="space-y-1">
                          {auditReport.findings.filter(f => f.severity === 'fatal' || f.severity === 'error').map(f => (
                            <div key={f.id} className="text-[10px] p-1.5 rounded bg-muted/10 border border-border/10 font-mono">
                              <span className={f.severity === 'fatal' ? 'text-destructive' : 'text-neon-amber'}>[{f.severity.toUpperCase()}]</span> {f.title}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Audit Feed */}
        <TabsContent value="feed" className="mt-4">
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary shrink-0" />
                Live Audit Feed
              </CardTitle>
              <CardDescription className="text-xs">Real-time audit events from the substrate</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <ScrollArea className="h-[400px] sm:h-[500px]">
                <div className="space-y-2">
                  {(liveAuditFeed.data || []).map((entry: any, i: number) => (
                    <div key={entry.id || i} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10">
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground/40 font-mono shrink-0 w-14 pt-0.5">
                        {entry.created_at ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: false }) : '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-[11px] sm:text-xs font-medium truncate">{entry.action}</span>
                          {entry.details?.outcome && (
                            <Badge variant="outline" className={cn("text-[8px] h-4 px-1 shrink-0", getOutcomeColor(entry.details.outcome))}>{entry.details.outcome}</Badge>
                          )}
                        </div>
                        {entry.entity_type && (
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground/40 font-mono truncate block">{entry.entity_type}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!liveAuditFeed.data || liveAuditFeed.data.length === 0) && (
                    <p className="text-sm text-muted-foreground/40 text-center py-12">No audit events recorded yet</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
