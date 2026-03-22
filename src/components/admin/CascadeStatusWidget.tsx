import { Brain } from "lucide-react";

export function CascadeStatusWidget() {
  return (
    <div className="flex items-center gap-4 px-4 py-2 glass-panel border border-border/50 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-neon-green/20 text-neon-green animate-pulse-glow" />
        <span className="text-sm font-medium">Memory Stream</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Brain className="w-4 h-4" />
        <span>Operational</span>
      </div>
    </div>
  );
}