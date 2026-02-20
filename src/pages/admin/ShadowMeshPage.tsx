/**
 * Shadow Mesh Admin Page
 * Toggle and observe shadow mesh + immune executor status
 */

import { useState } from "react";
import { ShadowMeshToggle } from "@/components/admin/ShadowMeshToggle";
import { ShadowMeshAnalytics } from "@/components/admin/ShadowMeshAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, AlertTriangle, RotateCcw } from "lucide-react";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PILOT_EXECUTORS = [
  { id: "adaptive-ui", module: "INCLUSIVE", role: "primary" },
  { id: "cognitive-load-optimization", module: "INCLUSIVE", role: "primary" },
  { id: "comprehensive-accessibility-audit", module: "INCLUSIVE", role: "primary" },
  { id: "personalized-accessibility-engine", module: "INCLUSIVE", role: "primary" },
  { id: "inclusive-content", module: "INCLUSIVE", role: "validator" },
];

export default function ShadowMeshPage() {
  const [resetting, setResetting] = useState(false);
  const [analyticsKey, setAnalyticsKey] = useState(0);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Shadow Mesh Control
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Admin-controlled immune wrapper and adversarial probing for pilot executors.
          </p>
        </div>
        <ActionButton
          icon={RotateCcw}
          variant="warning"
          loading={resetting}
          onClick={handleResetTelemetry}
        >
          Reset Telemetry
        </ActionButton>
      </div>

      {/* Toggle */}
      <ShadowMeshToggle />

      {/* Analytics */}
      <ShadowMeshAnalytics key={analyticsKey} />

      {/* Operational Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Operational Guarantees
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>OFF</strong> → identical behavior to current production (zero overhead)</p>
          <p>• <strong>ON</strong> → immune wrapper + shadow mesh active for pilot executors only</p>
          <p>• No intent mesh impact • No public exposure • No silent failure paths</p>
        </CardContent>
      </Card>

      {/* Pilot Executors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Pilot Executors (5)
          </CardTitle>
          <CardDescription>
            Only these executors are wrapped by the immune layer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PILOT_EXECUTORS.map((exec) => (
              <div
                key={exec.id}
                className="flex items-center justify-between p-3 rounded-md border border-border/50 bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-background px-2 py-0.5 rounded">
                    {exec.id}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{exec.module}</Badge>
                  <Badge variant="secondary" className="text-xs">{exec.role}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle */}
      <Card>
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
