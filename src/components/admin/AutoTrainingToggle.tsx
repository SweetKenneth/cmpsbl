/**
 * Auto Training Toggle — Admin-only runtime control
 * When enabled, starts the shadow scheduler to run probe training automatically every 15 min.
 * Persists state via the auto_training_enabled system flag.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { invalidateFlagCache } from "@/lib/system/flags";
import { startShadowScheduler, stopShadowScheduler } from "@/lib/shadow/scheduler";

export function AutoTrainingToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("system_flags")
        .select("enabled")
        .eq("key", "auto_training_enabled")
        .maybeSingle();
      const isEnabled = data?.enabled ?? false;
      setEnabled(isEnabled);
      setLoading(false);

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
      .eq("key", "auto_training_enabled");

    if (error) {
      setEnabled(!next);
      toast.error("Failed to toggle Auto Training", { description: error.message });
      return;
    }

    invalidateFlagCache("auto_training_enabled");

    if (next) {
      startShadowScheduler();
    } else {
      stopShadowScheduler();
    }

    toast.success(`Auto Training ${next ? "activated" : "deactivated"}`, {
      description: next
        ? "Shadow probes will run automatically every 15 min."
        : "Automatic training stopped.",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
      <div className="flex items-center gap-3">
        <GraduationCap className={`w-5 h-5 ${enabled ? "text-primary" : "text-muted-foreground"}`} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Auto Training</span>
            <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
              {enabled ? "ON" : "OFF"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automatically run shadow probe training every 15 minutes
          </p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={toggle} />
    </div>
  );
}
