/**
 * Shadow Mesh Analytics Panel
 * Shows immune metrics, repair KPIs, and per-executor breakdown for admin dashboard
 * Phase 2: deterministic repair telemetry
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle, ShieldAlert, Loader2, Wrench } from "lucide-react";
import { getShadowMeshAnalytics, type ShadowMeshAnalyticsData } from "@/lib/shadow/analytics";

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function ShadowMeshAnalytics() {
  const [data, setData] = useState<ShadowMeshAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      getShadowMeshAnalytics().then(setData).finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-6">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading analytics…</span>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.metrics.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            No shadow mesh data yet. Enable the toggle and wait for the first batch cycle (~15 min).
          </p>
        </CardContent>
      </Card>
    );
  }

  const { repairKPIs } = data;

  return (
    <div className="space-y-4">
      {/* Phase 2: Repair KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            Repair Telemetry (Last 6h)
          </CardTitle>
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
              const legacyRepairRate = m.total_runs
                ? Math.round((m.repairs / m.total_runs) * 100)
                : 0;
              const execRepairAttemptRate = m.total_runs > 0 ? m.repair_attempts / m.total_runs : 0;
              const execRepairSuccessRate = m.repair_attempts > 0 ? m.repair_successes / m.repair_attempts : 0;
              const isHealthy = legacyRepairRate >= 60 && m.escalations <= 2;

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
                    <span>Escalations: <strong className="text-foreground">{m.escalations}</strong></span>
                    <span>Legacy Repair: <strong className="text-foreground">{legacyRepairRate}%</strong></span>
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
                  <Badge variant="outline" className="text-xs shrink-0">
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
