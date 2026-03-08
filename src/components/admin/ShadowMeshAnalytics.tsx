/**
 * Shadow Mesh Analytics Panel
 * Shows immune metrics, repair KPIs, ENCODE resolution stats,
 * and per-executor breakdown for admin dashboard.
 * Auto-triggers escalation processing on load.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle, CheckCircle, ShieldAlert, Loader2, Wrench, RotateCcw, Cpu, Zap } from "lucide-react";
import { getShadowMeshAnalytics, type ShadowMeshAnalyticsData } from "@/lib/shadow/analytics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function pct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

interface EncodeResolutionStats {
  processed: number;
  resolved: number;
  failed: number;
  skipped: number;
  ranAt: string | null;
}

export function ShadowMeshAnalytics() {
  const [data, setData] = useState<ShadowMeshAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [encodeRunning, setEncodeRunning] = useState(false);
  const [encodeStats, setEncodeStats] = useState<EncodeResolutionStats | null>(null);
  const hasAutoRun = useRef(false);

  const load = useCallback(() => {
    getShadowMeshAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  // Auto-trigger ENCODE escalation processing on first load
  const runEncode = useCallback(async () => {
    setEncodeRunning(true);
    try {
      const { processEscalations } = await import('@/lib/substrate/encode-module/escalation-processor');
      const result = await processEscalations(50);
      setEncodeStats({
        processed: result.processed,
        resolved: result.resolved,
        failed: result.failed,
        skipped: result.skipped,
        ranAt: new Date().toISOString(),
      });
      if (result.resolved > 0) {
        toast.success(`ENCODE resolved ${result.resolved}/${result.processed} escalations`);
        load(); // Refresh analytics after resolution
      }
    } catch (err) {
      console.warn('[encode] Escalation processing failed:', err);
    } finally {
      setEncodeRunning(false);
    }
  }, [load]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  // Auto-run ENCODE once on mount
  useEffect(() => {
    if (!hasAutoRun.current) {
      hasAutoRun.current = true;
      // Slight delay to let analytics load first
      const timer = setTimeout(() => runEncode(), 2000);
      return () => clearTimeout(timer);
    }
  }, [runEncode]);

  const handleReset = async () => {
    setResetting(true);
    try {
      const { error: e1 } = await supabase.from('immune_metrics').delete().neq('executor', '__never__') as any;
      const { error: e2 } = await supabase.from('immune_escalations').delete().neq('executor', '__never__') as any;
      if (e1 || e2) throw new Error(e1?.message || e2?.message);
      toast.success('Telemetry reset — all immune metrics cleared');
      setData(null);
      setEncodeStats(null);
      setLoading(true);
      load();
    } catch (err: any) {
      toast.error(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const resetButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={resetting}
      className="gap-1.5"
    >
      {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
      Reset Telemetry
    </Button>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading analytics…</span>
          </div>
          {resetButton}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.metrics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between py-6">
          <p className="text-sm text-muted-foreground">
            No immunity mesh data yet. Enable the toggle and wait for the first shadow probe cycle (~15 min).
          </p>
          {resetButton}
        </CardContent>
      </Card>
    );
  }

  const { repairKPIs } = data;
  const openEscalations = data.recentEscalations.filter(e => e.status === 'open').length;
  const resolvedEscalations = data.recentEscalations.filter(e => e.status === 'resolved').length;

  return (
    <div className="space-y-4">
      {/* ENCODE Resolution Engine */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            ENCODE Resolution Engine
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={runEncode}
              disabled={encodeRunning}
              className="gap-1.5"
            >
              {encodeRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Run ENCODE
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-md border border-border/50 bg-muted/30">
              <div className="text-2xl font-bold text-foreground">{openEscalations}</div>
              <div className="text-xs text-muted-foreground mt-1">Open</div>
            </div>
            <div className="text-center p-3 rounded-md border border-border/50 bg-muted/30">
              <div className="text-2xl font-bold text-primary">{resolvedEscalations}</div>
              <div className="text-xs text-muted-foreground mt-1">Resolved</div>
            </div>
            <div className="text-center p-3 rounded-md border border-border/50 bg-muted/30">
              <div className="text-2xl font-bold text-foreground">
                {encodeStats ? encodeStats.resolved : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Last Run Resolved</div>
            </div>
            <div className="text-center p-3 rounded-md border border-border/50 bg-muted/30">
              <div className="text-2xl font-bold text-foreground">
                {encodeStats ? `${encodeStats.processed}` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Last Run Processed</div>
            </div>
          </div>
          {encodeStats && encodeStats.ranAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Last run: {new Date(encodeStats.ranAt).toLocaleTimeString()} — 
              {encodeStats.resolved}/{encodeStats.processed} resolved, {encodeStats.failed} failed, {encodeStats.skipped} skipped
            </p>
          )}
          {encodeRunning && (
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              ENCODE is processing open escalations…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Repair KPIs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            Repair Telemetry (Last 6h)
          </CardTitle>
          {resetButton}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-md border border-border/50 bg-muted/30">
              <div className="text-2xl font-bold text-foreground">{pct(repairKPIs.repair_attempt_rate)}</div>
              <div className="text-xs text-muted-foreground mt-1">Repair Attempt Rate</div>
            </div>
            <div className="text-center p-3 rounded-md border border-border/50 bg-muted/30">
              <div className="text-2xl font-bold text-foreground">{pct(repairKPIs.repair_success_rate)}</div>
              <div className="text-xs text-muted-foreground mt-1">Repair Success %</div>
            </div>
            <div className="text-center p-3 rounded-md border border-border/50 bg-muted/30">
              <div className="text-2xl font-bold text-foreground">{pct(repairKPIs.retry_rate)}</div>
              <div className="text-xs text-muted-foreground mt-1">Retry Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Executor Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Per-Executor Health (Last 6h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.metrics.map((m) => {
              const repairDenom = m.repairs + m.escalations + m.safe_fails;
              const honestRepairRate = repairDenom > 0
                ? Math.round((m.repairs / repairDenom) * 100)
                : 0;
              const execRepairSuccessRate = m.repair_attempts > 0 ? m.repair_successes / m.repair_attempts : 0;
              const isHealthy = honestRepairRate >= 60 && m.escalations <= 2;

              return (
                <div
                  key={m.executor}
                  className="p-3 rounded-md border border-border/50 bg-muted/30 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono">{m.executor}</code>
                    {isHealthy ? (
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>Runs: <strong className="text-foreground">{m.total_runs}</strong></span>
                    <span>Safe Fails: <strong className="text-foreground">{m.safe_fails}</strong></span>
                    <span>Escalations: <strong className={m.escalations > 0 ? "text-destructive" : "text-foreground"}>{m.escalations}</strong></span>
                    <span>Repair Rate: <strong className={honestRepairRate < 80 ? "text-destructive" : "text-foreground"}>{honestRepairRate}%</strong></span>
                    <span>Repair Attempts: <strong className="text-foreground">{m.repair_attempts}</strong></span>
                    <span>Repair Success: <strong className="text-foreground">{pct(execRepairSuccessRate)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Escalations */}
      {data.recentEscalations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              Recent Escalations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentEscalations.map((e, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-2 rounded border border-border/50 bg-muted/20 text-xs"
                >
                  <div className="space-y-0.5">
                    <code className="font-mono font-medium">{e.executor}</code>
                    <p className="text-muted-foreground">{e.severity} — {e.scope}</p>
                  </div>
                  <Badge 
                    variant={e.status === 'resolved' ? 'default' : e.status === 'claimed' ? 'secondary' : 'outline'} 
                    className="text-xs shrink-0"
                  >
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
