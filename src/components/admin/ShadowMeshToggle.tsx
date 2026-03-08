/**
 * Immunity Mesh Toggle — Admin-only runtime control
 * Reads/writes the shadow_mesh_enabled system flag (controls shadow probe training)
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { invalidateFlagCache } from "@/lib/system/flags";
import { startShadowScheduler, stopShadowScheduler } from "@/lib/shadow/scheduler";

export function ShadowMeshToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("system_flags")
        .select("enabled")
        .eq("key", "shadow_mesh_enabled")
        .maybeSingle();
      const isEnabled = data?.enabled ?? false;
      setEnabled(isEnabled);
      setLoading(false);

      // Auto-start scheduler if flag is already on (resumes after page refresh)
      if (isEnabled) {
        startShadowScheduler();
      }
    })();
  }, []);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);

    const { error } = await supabase
      .from("system_flags")
      .update({ enabled: next })
      .eq("key", "shadow_mesh_enabled");

    if (error) {
      setEnabled(!next); // revert
      toast.error("Failed to toggle Immunity Mesh", { description: error.message });
      return;
    }

    invalidateFlagCache("shadow_mesh_enabled");

    // Wire scheduler to the toggle: enabling starts it (idempotent),
    // disabling tears it down so Chrome doesn't keep running probes.
    if (next) {
      startShadowScheduler();
    } else {
      stopShadowScheduler();
    }

    toast.success(`Immunity Mesh ${next ? "activated" : "deactivated"}`, {
      description: next ? "Shadow probe training started — probes run every 15 min." : "Shadow probes stopped.",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading flag…</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
      <div className="flex items-center gap-3">
        <Shield className={`w-5 h-5 ${enabled ? "text-destructive" : "text-muted-foreground"}`} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Immunity Mesh</span>
            <Badge variant={enabled ? "destructive" : "secondary"} className="text-xs">
              {enabled ? "ACTIVE" : "OFF"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Universal immune wrapping + shadow probe training for all executors
          </p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={toggle} />
    </div>
  );
}
