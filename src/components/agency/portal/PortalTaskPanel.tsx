/**
 * Portal Task Panel 2026
 * Live task feed with modern cards, controls, and queue progress
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
  RefreshCw,
  Timer
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInMinutes, differenceInSeconds } from 'date-fns';

// date-fns v3 type exports are missing for some helpers in our build;
// keep behavior identical via a local helper.
const addMinutesLocal = (date: Date, amount: number) => new Date(date.getTime() + amount * 60_000);
import { type AgencyTask, type AgencyTaskLog, TASK_TYPES } from '@/lib/agency/agencyTasks';
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

  // Queue position calculation
  const queueInfo = useMemo(() => {
    const queuedTasks = sortedTasks.filter(t => t.status === 'queued');
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    
    // Estimate time per task based on type (in minutes)
    const getEstimatedTime = (taskType: string) => {
      const taskTypeInfo = TASK_TYPES[taskType as keyof typeof TASK_TYPES];
      return taskTypeInfo?.estimatedMinutes || 3;
    };
    
    let cumulativeWait = 0;
    const queuePositions = new Map<string, { position: number; estimatedStart: Date }>();
    
    queuedTasks.forEach((task, index) => {
      const estimatedStartMinutes = inProgressCount > 0 ? cumulativeWait + 2 : cumulativeWait;
      queuePositions.set(task.id, {
        position: index + 1,
        estimatedStart: addMinutesLocal(new Date(), estimatedStartMinutes),
      });
      cumulativeWait += getEstimatedTime(task.task_type);
    });
    
    return queuePositions;
  }, [sortedTasks, tasks]);

  const activeCount = tasks.filter(t => t.status === 'in_progress').length;
  const queuedCount = tasks.filter(t => t.status === 'queued').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return 'Unassigned';
    const member = members.find(m => m.id === memberId);
    const spec = SPECIALIZATIONS.find(s => s.id === member?.specialization);
    return spec?.name || member?.specialization || 'Unknown';
  };

  const getStatusConfig = (status: string, isStuck: boolean) => {
    if (isStuck) return { icon: AlertTriangle, color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/30' };
    
    switch (status) {
      case 'in_progress':
        return { icon: Loader2, color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/30', spin: true };
      case 'completed':
        return { icon: CheckCircle, color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30' };
      case 'failed':
        return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-muted-foreground', bg: 'bg-muted/20', border: 'border-muted/30' };
      case 'queued':
        return { icon: Clock, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/30' };
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
      {/* Stats Bar - Mobile optimized with wrapping */}
      <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 border-b border-border/30">
        <Badge variant="outline" className={cn(
          "gap-1 text-[10px] sm:text-xs px-2 py-0.5",
          activeCount > 0 ? "border-neon-amber/30 text-neon-amber bg-neon-amber/10" : ""
        )}>
          <Zap className="w-3 h-3" />
          {activeCount} Active
        </Badge>
        {queuedCount > 0 && (
          <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs px-2 py-0.5 border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10">
            <Clock className="w-3 h-3" />
            {queuedCount} Queued
          </Badge>
        )}
        {failedCount > 0 && (
          <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs px-2 py-0.5 border-destructive/30 text-destructive bg-destructive/10">
            <XCircle className="w-3 h-3" />
            {failedCount} Failed
          </Badge>
        )}
        <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs px-2 py-0.5 border-neon-green/30 text-neon-green bg-neon-green/10">
          <CheckCircle className="w-3 h-3" />
          {completedCount} Done
        </Badge>

        {isOwner && completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCompleted}
            className="text-[10px] sm:text-xs text-muted-foreground ml-auto h-7 px-2"
          >
            Clear Done
          </Button>
        )}
      </div>

      {/* Task List */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {sortedTasks.slice(0, 30).map(task => {
            const isStuck = stuckTaskIds.has(task.id);
            const config = getStatusConfig(task.status, isStuck);
            const StatusIcon = config.icon;
            const queuePosition = queueInfo.get(task.id);

            return (
              <div
                key={task.id}
                className={cn(
                  "group p-3 sm:p-4 rounded-xl border transition-all",
                  config.bg,
                  config.border,
                  isStuck && "animate-pulse"
                )}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0",
                    config.bg
                  )}>
                    <StatusIcon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", config.color, config.spin && "animate-spin")} />
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-start gap-2 mb-1">
                      {/* Title with proper wrapping */}
                      <span className="font-medium text-xs sm:text-sm break-words leading-tight">
                        {task.title}
                      </span>
                      {isStuck && (
                        <Badge variant="outline" className="text-[8px] sm:text-[9px] px-1 py-0 h-4 border-neon-amber/30 text-neon-amber shrink-0">
                          Stuck
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-muted-foreground">
                      <span className="truncate max-w-[100px] sm:max-w-none">{getMemberName(task.assigned_member_id)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  {/* Actions - Always visible on mobile */}
                  {isOwner && (
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      {(task.status === 'queued' || task.status === 'in_progress') && onCancelTask && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => onCancelTask(task.id)}
                        >
                          <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </Button>
                      )}
                      {(task.status === 'failed' || task.status === 'cancelled') && onRetryTask && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-primary"
                          onClick={() => onRetryTask(task.id)}
                        >
                          <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Queue Position Indicator */}
                {task.status === 'queued' && queuePosition && (
                  <div className="mt-2 sm:mt-3 p-2 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1.5 text-neon-cyan">
                        <Timer className="w-3 h-3" />
                        <span>Queue #{queuePosition.position}</span>
                      </div>
                      <span className="text-muted-foreground">
                        Est. start: {formatDistanceToNow(queuePosition.estimatedStart, { addSuffix: true })}
                      </span>
                    </div>
                    <Progress 
                      value={(1 / (queuePosition.position + 1)) * 100} 
                      className="h-1 mt-1.5 bg-neon-cyan/10" 
                    />
                  </div>
                )}

                {/* Progress */}
                {task.status === 'in_progress' && (
                  <div className="mt-2 sm:mt-3">
                    <div className="flex justify-between text-[9px] sm:text-[10px] text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{task.progress || 0}%</span>
                    </div>
                    <Progress value={task.progress || 0} className="h-1" />
                  </div>
                )}

                {/* Error message - with wrapping */}
                {task.status === 'failed' && task.error_message && (
                  <p className="mt-2 text-[10px] sm:text-xs text-destructive/80 break-words">
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
