/**
 * RestorationQueue — Visual queue status and position indicator
 */

import { cn } from "@/lib/utils";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";
import type { QueueEntry } from "@/lib/factory/restoration-queue";

interface RestorationQueueProps {
  entry: QueueEntry | null;
  queuePosition: number | null;
  estimatedWaitMs: number;
}

export function RestorationQueue({ entry, queuePosition, estimatedWaitMs }: RestorationQueueProps) {
  if (!entry) return null;

  const formatTime = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `~${minutes} min`;
  };

  return (
    <div className="rounded-xl border border-border/40 bg-card/20 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">Restoration Queue</h3>
        <StatusBadge status={entry.status} />
      </div>

      {entry.status === 'queued' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-xs font-semibold text-foreground">
                Position #{queuePosition ?? '—'} in queue
              </div>
              <div className="text-[10px] text-muted-foreground">
                Estimated wait: {formatTime(estimatedWaitMs)}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 italic">
            Your tech is in the shop. The factory is working on it.
          </p>
        </div>
      )}

      {entry.status === 'processing' && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <div>
            <div className="text-xs font-semibold text-foreground">
              Running {entry.selectedPrimitives.length} primitives
            </div>
            <div className="text-[10px] text-muted-foreground">
              Restoration in progress...
            </div>
          </div>
        </div>
      )}

      {entry.status === 'complete' && (
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs font-semibold text-foreground">Restoration Complete</div>
            <div className="text-[10px] text-muted-foreground">
              Your code is ready. DECODE will walk you through the results.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: QueueEntry['status'] }) {
  const config = {
    queued: { label: 'In Queue', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    processing: { label: 'Restoring', color: 'text-primary bg-primary/10 border-primary/30' },
    complete: { label: 'Complete', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    failed: { label: 'Failed', color: 'text-destructive bg-destructive/10 border-destructive/30' },
  } as const;

  const c = config[status];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold", c.color)}>
      {c.label}
    </span>
  );
}
