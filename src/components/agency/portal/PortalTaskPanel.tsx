/**
 * Portal Task Panel 2026
 * Live task feed with modern cards and controls
 */

import { useMemo } from 'react';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Loader2,
  AlertTriangle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { type AgencyTask, type AgencyTaskLog } from '@/lib/agency/agencyTasks';
import { SPECIALIZATIONS } from '@/lib/agency/agencyTypes';

interface PortalTaskPanelProps {
  tasks: AgencyTask[];
  logs: AgencyTaskLog[];
  members: Array<{ id: string; specialization: string; is_leader: boolean }>;
  isOwner: boolean;
  onCancelTask?: (taskId: string) => Promise<boolean | void>;
  onRetryTask?: (taskId: string) => Promise<boolean | void>;
  onCancelAll?: () => Promise<void>;
  onClearCompleted?: () => Promise<void>;
  className?: string;
}

const STUCK_THRESHOLD_MINUTES = 5;

export function PortalTaskPanel({
  tasks,
  logs,
  members,
  isOwner,
  onCancelTask,
  onRetryTask,
  onCancelAll,
  onClearCompleted,
  className,
}: PortalTaskPanelProps) {
  // Detect stuck tasks
  const stuckTaskIds = useMemo(() => {
    const now = new Date();
    return new Set(
      tasks
        .filter(t => {
          if (t.status !== 'in_progress') return false;
          const minutesSinceUpdate = differenceInMinutes(now, new Date(t.updated_at));
          return minutesSinceUpdate >= STUCK_THRESHOLD_MINUTES && (t.progress || 0) < 20;
        })
        .map(t => t.id)
    );
  }, [tasks]);

  // Sorted tasks
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const statusOrder: Record<string, number> = {
        in_progress: 0, queued: 1, failed: 2, cancelled: 3, completed: 4,
      };
      const aOrder = statusOrder[a.status] ?? 5;
      const bOrder = statusOrder[b.status] ?? 5;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [tasks]);

  const activeCount = tasks.filter(t => t.status === 'in_progress').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return 'Unassigned';
    const member = members.find(m => m.id === memberId);
    const spec = SPECIALIZATIONS.find(s => s.id === member?.specialization);
    return spec?.name || member?.specialization || 'Unknown';
  };

  const getStatusConfig = (status: string, isStuck: boolean) => {
    if (isStuck) return { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    
    switch (status) {
      case 'in_progress':
        return { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', spin: true };
      case 'completed':
        return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted/20', border: 'border-muted/30' };
      case 'queued':
        return { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
      default:
        return { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border/30' };
    }
  };

  if (tasks.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full py-12", className)}>
        <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">No tasks yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Tasks will appear here when dispatched</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Stats Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn(
            "gap-1.5 text-xs",
            activeCount > 0 ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : ""
          )}>
            <Zap className="w-3 h-3" />
            {activeCount} Active
          </Badge>
          {failedCount > 0 && (
            <Badge variant="outline" className="gap-1.5 text-xs border-red-500/30 text-red-400 bg-red-500/10">
              <XCircle className="w-3 h-3" />
              {failedCount} Failed
            </Badge>
          )}
          <Badge variant="outline" className="gap-1.5 text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
            <CheckCircle className="w-3 h-3" />
            {completedCount} Done
          </Badge>
        </div>

        {isOwner && completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCompleted}
            className="text-xs text-muted-foreground"
          >
            Clear Done
          </Button>
        )}
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedTasks.slice(0, 30).map(task => {
            const isStuck = stuckTaskIds.has(task.id);
            const config = getStatusConfig(task.status, isStuck);
            const StatusIcon = config.icon;

            return (
              <div
                key={task.id}
                className={cn(
                  "group p-4 rounded-xl border transition-all",
                  config.bg,
                  config.border,
                  isStuck && "animate-pulse"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      config.bg
                    )}>
                      <StatusIcon className={cn("w-4 h-4", config.color, config.spin && "animate-spin")} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{task.title}</span>
                        {isStuck && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-orange-500/30 text-orange-400">
                            Stuck
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{getMemberName(task.assigned_member_id)}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isOwner && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(task.status === 'queued' || task.status === 'in_progress') && onCancelTask && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-400"
                          onClick={() => onCancelTask(task.id)}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {(task.status === 'failed' || task.status === 'cancelled') && onRetryTask && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => onRetryTask(task.id)}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress */}
                {task.status === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{task.progress || 0}%</span>
                    </div>
                    <Progress value={task.progress || 0} className="h-1" />
                  </div>
                )}

                {/* Error message */}
                {task.status === 'failed' && task.error_message && (
                  <p className="mt-2 text-xs text-red-400/80 line-clamp-2">
                    {task.error_message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
