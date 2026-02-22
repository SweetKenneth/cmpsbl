/**
 * Immunity Mesh Intelligence Dashboard
 * Dedicated admin page — observability only, zero runtime changes
 */

import { useState } from "react";
import { ShadowMeshToggle } from "@/components/admin/ShadowMeshToggle";
import { ShadowMeshAnalytics } from "@/components/admin/ShadowMeshAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Brain, Zap, Activity, RotateCcw, AlertTriangle, BarChart3, Table2, BookOpen } from "lucide-react";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIntelligenceMetrics } from "@/hooks/admin/useIntelligenceMetrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function fmt(val: number | null | undefined, suffix = '%'): string {
  if (val === null || val === undefined) return '—';
  return `${(val * 100).toFixed(1)}${suffix}`;
}

function MetricCard({ label, value, sub, status }: { label: string; value: string; sub?: string; status?: 'good' | 'warn' | 'bad' }) {
  const ring = status === 'good' ? 'border-green-500/30' : status === 'warn' ? 'border-yellow-500/30' : status === 'bad' ? 'border-red-500/30' : 'border-border/50';
  return (
    <Card className={`border ${ring}`}>
      <CardContent className="pt-4 pb-3 px-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function ImmunityMeshDashboard() {
  const [viewMode, setViewMode] = useState<'baseline' | 'shadow' | 'all'>('all');
  const [windowHours, setWindowHours] = useState(24);
  const [analyticsKey, setAnalyticsKey] = useState(0);
  const [resetting, setResetting] = useState(false);

  const isShadow = viewMode === 'all' ? null : viewMode === 'shadow';
  const { data, isLoading } = useIntelligenceMetrics(windowHours, isShadow);

  const handleReset = async () => {
    setResetting(true);
    try {
      const { error: e1 } = await supabase.from('immune_metrics').delete().neq('executor', '__never__') as any;
      const { error: e2 } = await supabase.from('immune_escalations').delete().neq('executor', '__never__') as any;
      const { error: e3 } = await supabase.from('immune_intelligence_events').delete().neq('executor_id', '__never__') as any;
      if (e1 || e2 || e3) throw new Error(e1?.message || e2?.message || e3?.message);
      toast.success('Telemetry reset');
      setAnalyticsKey(k => k + 1);
    } catch (err: any) {
      toast.error(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const mriColor = data?.mri.status === 'ready' ? 'good' : data?.mri.status === 'caution' ? 'warn' : 'bad';

  return (
    <div className="space-y-6 p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Immunity Mesh Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Observability, training metrics, and readiness scoring
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="baseline">Baseline</SelectItem>
              <SelectItem value="shadow">Shadow</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(windowHours)} onValueChange={(v) => setWindowHours(Number(v))}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6h</SelectItem>
              <SelectItem value="24">24h</SelectItem>
              <SelectItem value="72">3d</SelectItem>
              <SelectItem value="168">7d</SelectItem>
            </SelectContent>
          </Select>
          <ActionButton icon={RotateCcw} variant="warning" loading={resetting} onClick={handleReset} className="h-8 text-xs">
            Reset
          </ActionButton>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="executors" className="text-xs"><Table2 className="w-3 h-3 mr-1" />Executors</TabsTrigger>
          <TabsTrigger value="rules" className="text-xs"><BookOpen className="w-3 h-3 mr-1" />Rules</TabsTrigger>
          <TabsTrigger value="controls" className="text-xs"><Zap className="w-3 h-3 mr-1" />Controls</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4">
          {/* MRI Hero */}
          <Card className={`border-2 ${mriColor === 'good' ? 'border-green-500/40' : mriColor === 'warn' ? 'border-yellow-500/40' : 'border-red-500/40'}`}>
            <CardContent className="py-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mutation Readiness Index</p>
                <p className="text-4xl font-bold mt-1">{data?.mri.score ?? '—'}<span className="text-lg text-muted-foreground">/100</span></p>
                <Badge variant={mriColor === 'good' ? 'default' : mriColor === 'warn' ? 'secondary' : 'destructive'} className="mt-2">
                  {data?.mri.status?.toUpperCase() ?? 'LOADING'}
                </Badge>
              </div>
              <div className="text-right space-y-1 text-xs text-muted-foreground">
                <p>DKD: {fmt(data?.mri.factors.dkd)} (35%)</p>
                <p>1−FNR: {fmt(data?.mri.factors.fnrInverse)} (20%)</p>
                <p>1−Esc: {fmt(data?.mri.factors.escalationRateInverse)} (20%)</p>
                <p>Repair: {fmt(data?.mri.factors.repairSuccessRate)} (20%)</p>
                <p>1−Cascade: {fmt(data?.mri.factors.cascadeRateInverse)} (5%)</p>
              </div>
            </CardContent>
          </Card>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard label="DKD" value={fmt(data?.dkd.global)} sub={`${data?.dkd.coveredFailures ?? 0}/${data?.dkd.totalFailures ?? 0}`} status={(data?.dkd.global ?? 0) > 0.7 ? 'good' : 'warn'} />
            <MetricCard label="FNR" value={fmt(data?.fnr.global)} sub={`${data?.fnr.novelSignatures ?? 0} novel`} status={(data?.fnr.global ?? 1) < 0.3 ? 'good' : 'warn'} />
            <MetricCard label="Det. Coverage" value={fmt(data?.dkd.byRepairType?.deterministic ? data.dkd.byRepairType.deterministic / Math.max(1, data.dkd.totalFailures) : null)} />
            <MetricCard label="Escalation Rate" value={fmt(data ? Object.values(data.iil.escalationsBySeverity).reduce((s, v) => s + v, 0) / Math.max(1, data.iil.totalEvents) : null)} status={data && Object.values(data.iil.escalationsBySeverity).reduce((s, v) => s + v, 0) / Math.max(1, data.iil.totalEvents) < 0.05 ? 'good' : 'bad'} />
            <MetricCard label="Events" value={String(data?.totalEvents ?? 0)} sub={`${windowHours}h window`} />
          </div>

          {/* IIL Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Immunity Intervention Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !data ? <p className="text-sm text-muted-foreground">No data</p> : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Safe Fails:</span> <strong>{data.iil.safeFails}</strong> / {data.iil.totalEvents}</div>
                  <div><span className="text-muted-foreground">Repaired:</span> <strong>{data.iil.repairedSuccess}</strong> / {data.iil.totalEvents}</div>
                  <div><span className="text-muted-foreground">Repair Failures:</span> <strong>{data.iil.repairFailures}</strong></div>
                  <div><span className="text-muted-foreground">Preflight Blocks:</span> <strong>{data.iil.preflightBlocks}</strong></div>
                  <div><span className="text-muted-foreground">Postcheck Blocks:</span> <strong>{data.iil.postcheckBlocks}</strong></div>
                  <div>
                    <span className="text-muted-foreground">Escalations:</span>{' '}
                    {Object.entries(data.iil.escalationsBySeverity).length > 0
                      ? Object.entries(data.iil.escalationsBySeverity).map(([sev, count]) => (
                          <Badge key={sev} variant="secondary" className="mr-1 text-xs">{sev}: {count}</Badge>
                        ))
                      : <span className="text-muted-foreground">0</span>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legacy Analytics */}
          <ShadowMeshAnalytics key={analyticsKey} />
        </TabsContent>

        {/* ── EXECUTORS ── */}
        <TabsContent value="executors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Executor Intelligence Table</CardTitle>
              <CardDescription>Per-executor metrics for the selected window</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : !data ? <p className="text-sm text-muted-foreground">No data</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-xs text-muted-foreground">
                        <th className="text-left py-2 px-2">Executor</th>
                        <th className="text-right py-2 px-2">DKD</th>
                        <th className="text-right py-2 px-2">FNR</th>
                        <th className="text-right py-2 px-2">Events</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys({ ...data.dkd.perExecutor, ...data.fnr.perExecutor }).sort().map(eid => (
                        <tr key={eid} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="py-1.5 px-2 font-mono text-xs">{eid}</td>
                          <td className="py-1.5 px-2 text-right">{fmt(data.dkd.perExecutor[eid])}</td>
                          <td className="py-1.5 px-2 text-right">{fmt(data.fnr.perExecutor[eid])}</td>
                          <td className="py-1.5 px-2 text-right text-muted-foreground">—</td>
                        </tr>
                      ))}
                      {Object.keys({ ...data.dkd.perExecutor, ...data.fnr.perExecutor }).length === 0 && (
                        <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No executor data yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── RULES ── */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Dominant Rules (Top 5)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!data?.rmi.dominantRules.length ? <p className="text-sm text-muted-foreground">No rule data</p> : (
                  <div className="space-y-2">
                    {data.rmi.dominantRules.map(r => (
                      <div key={r.ruleId} className="flex items-center justify-between p-2 rounded border border-border/30">
                        <code className="text-xs font-mono">{r.ruleId}</code>
                        <div className="flex items-center gap-2 text-xs">
                          <span>{r.invocations} inv</span>
                          <Badge variant={r.successRate >= 0.8 ? 'default' : 'secondary'}>{(r.successRate * 100).toFixed(0)}%</Badge>
                          <span className="text-muted-foreground">{r.executorCount} exec</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Risky Rules
                </CardTitle>
                <CardDescription>Success rate &lt;60% with ≥20 invocations</CardDescription>
              </CardHeader>
              <CardContent>
                {!data?.rmi.riskyRules.length ? <p className="text-sm text-muted-foreground">No risky rules — healthy</p> : (
                  <div className="space-y-2">
                    {data.rmi.riskyRules.map(r => (
                      <div key={r.ruleId} className="flex items-center justify-between p-2 rounded border border-destructive/30">
                        <code className="text-xs font-mono">{r.ruleId}</code>
                        <div className="flex items-center gap-2 text-xs">
                          <span>{r.invocations} inv</span>
                          <Badge variant="destructive">{(r.successRate * 100).toFixed(0)}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CKP */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Cross-Executor Knowledge Propagation
              </CardTitle>
              <CardDescription>Average rule propagation breadth: {data?.ckp.globalAvg?.toFixed(1) ?? '—'} executors</CardDescription>
            </CardHeader>
            <CardContent>
              {!data?.ckp.topPropagated.length ? <p className="text-sm text-muted-foreground">No propagation data</p> : (
                <div className="space-y-1.5">
                  {data.ckp.topPropagated.map(r => (
                    <div key={r.ruleId} className="flex items-center justify-between p-2 rounded border border-border/30">
                      <code className="text-xs font-mono">{r.ruleId}</code>
                      <Badge variant="secondary">{r.executorCount} executors</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CONTROLS ── */}
        <TabsContent value="controls" className="space-y-4">
          <ShadowMeshToggle />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operational Guarantees</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>OFF</strong> → identical behavior to current production (zero overhead)</p>
              <p>• <strong>ON</strong> → immunity mesh + shadow probe training active for all registered executors</p>
              <p>• Dynamic discovery — new executors probed automatically on registration</p>
              <p>• No intent mesh impact • No public exposure • No silent failure paths</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
