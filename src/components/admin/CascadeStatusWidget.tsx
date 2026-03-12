import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Zap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function CascadeStatusWidget() {
  const healthStatus = 'online';
  
  const statusColor = 'text-green-500';
  const statusBg = 'bg-green-500/20';

  return (
    <div className="flex items-center gap-4 px-4 py-2 glass-panel border border-border/50 rounded-lg">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${statusBg} ${statusColor} animate-pulse-glow`} />
        <span className="text-sm font-medium">Memory Stream</span>
      </div>

      {/* Last Dream Time */}
      {lastDream && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(lastDream.timestamp), { addSuffix: true })}</span>
        </div>
      )}

      {/* Events Count */}
      {status?.metrics && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4" />
          <span>{status.metrics.total_events_24h} events</span>
        </div>
      )}
    </div>
  );
}
