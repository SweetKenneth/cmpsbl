/**
 * Immunity Mesh Admin Page
 * Toggle and observe immunity mesh + executor status
 * v3.0 — Dynamic executor discovery + expanded fleet
 */

import { useState, useMemo } from "react";
import { ShadowMeshToggle } from "@/components/admin/ShadowMeshToggle";
import { ShadowMeshAnalytics } from "@/components/admin/ShadowMeshAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, AlertTriangle, RotateCcw } from "lucide-react";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PILOT_EXECUTORS, EXECUTOR_MODULE_META, type PilotExecutorId } from "@/immune/pilotExecutors";

export default function ShadowMeshPage() {
  const [resetting, setResetting] = useState(false);
  const [analyticsKey, setAnalyticsKey] = useState(0);

  const executorList = useMemo(() => {
    return PILOT_EXECUTORS.map((id) => ({
      id,
      module: EXECUTOR_MODULE_META[id as PilotExecutorId]?.module ?? 'UNKNOWN',
      category: EXECUTOR_MODULE_META[id as PilotExecutorId]?.category ?? 'unknown',
    }));
  }, []);

  const moduleGroups = useMemo(() => {
    const groups: Record<string, typeof executorList> = {};
    for (const exec of executorList) {
      (groups[exec.module] ??= []).push(exec);
    }
    return groups;
  }, [executorList]);

  const handleResetTelemetry = async () => {
    setResetting(true);
    try {
      const { error: e1 } = await supabase.from('immune_metrics').delete().neq('executor', '__never__') as any;
      const { error: e2 } = await supabase.from('immune_escalations').delete().neq('executor', '__never__') as any;
      if (e1 || e2) throw new Error(e1?.message || e2?.message);
      toast.success('Telemetry reset — metrics and escalations cleared');
      setAnalyticsKey((k) => k + 1);
    } catch (err: any) {
      toast.error(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Immunity Mesh Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Universal immunity wrapping + shadow probe training — executors are discovered automatically as they register.
          </p>
        </div>
        <ActionButton
          icon={RotateCcw}
          variant="warning"
          loading={resetting}
          onClick={handleResetTelemetry}
          className="w-full"
        >
          Reset Telemetry
        </ActionButton>
      </div>

      {/* Toggle */}
      <ShadowMeshToggle />

      {/* Analytics */}
      <ShadowMeshAnalytics key={analyticsKey} />

      {/* Operational Info */}
      <Card className="hover:border-primary/15 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Operational Guarantees
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>OFF</strong> → identical behavior to current production (zero overhead)</p>
          <p>• <strong>ON</strong> → immunity mesh + shadow probe training active for all registered executors</p>
          <p>• Dynamic discovery — new executors are probed automatically on registration</p>
          <p>• No intent mesh impact • No public exposure • No silent failure paths</p>
        </CardContent>
      </Card>

      {/* Pilot Executors — Dynamic */}
      <Card className="hover:border-primary/15 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Probed Executors (<span className="font-mono tabular-nums">{executorList.length}</span>)
          </CardTitle>
          <CardDescription>
            All executors wrapped by the immune layer — grouped by module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(moduleGroups).map(([module, executors]) => (
              <div key={module}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {module} ({executors.length})
                </h4>
                <div className="space-y-1.5">
                  {executors.map((exec) => (
                    <div
                      key={exec.id}
                      className="flex items-center justify-between p-2.5 rounded-md border border-border/50 bg-muted/30 hover:border-primary/15 hover:bg-muted/50 transition-all duration-200"
                    >
                      <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">
                        {exec.id}
                      </code>
                      <Badge variant="secondary" className="text-xs">{exec.category}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle */}
      <Card className="hover:border-primary/15 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base">Immune Lifecycle</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>Preflight (Defense)</strong> — Validates input shape, size, serializability</li>
            <li><strong>Action (Offense)</strong> — Executes the real executor logic</li>
            <li><strong>Postcheck</strong> — Validates output structure</li>
            <li><strong>Repair</strong> — Scope-safe input repair (sanitize, clamp, default)</li>
            <li><strong>Escalate</strong> — Persists failure to ENCODE work queue</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
