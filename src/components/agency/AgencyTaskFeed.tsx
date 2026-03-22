/**
 * Agency Task Feed — Real-time task activity feed with controls
 */

import { useMemo, useCallback } from 'react';
import { Activity, CheckCircle, XCircle, Clock, Zap, Brain, Loader2, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TASK_TYPES, TASK_STATUSES, type AgencyTaskLog, type AgencyTask } from '@/lib/agency/agencyTasks';
import { SPECIALIZATIONS } from '@/lib/agency/agencyTypes';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { AgencyTaskCard } from './AgencyTaskCard';
import { AgencyTaskControls } from './AgencyTaskControls';

interface AgencyTaskFeedProps {
  tasks: AgencyTask[];
  logs: AgencyTaskLog[];
  members: Array<{ id: string; specialization: string; is_leader: boolean }>;
  isOwner?: boolean;
  onCancelTask?: (taskId: string) => Promise<boolean | void>;
  onCancelAllTasks?: () => Promise<void>;
  onRetryTask?: (taskId: string) => Promise<boolean | void>;
  onRetryAllFailed?: () => Promise<void>;
  onResetToLearning?: () => Promise<void>;
  onClearCompleted?: () => Promise<void>;
  className?: string;
}

// Detect stuck tasks (in_progress for >5 minutes with no progress change)
const STUCK_THRESHOLD_MINUTES = 5;

export function AgencyTaskFeed({
  tasks,
  logs,
  members,
  isOwner = false,
  onCancelTask,
  onCancelAllTasks,
  onRetryTask,
  onRetryAllFailed,
  onResetToLearning,
  onClearCompleted,
  className,
}: AgencyTaskFeedProps) {
  // Identify stuck tasks
  const stuckTaskIds = useMemo(() => {
    const now = new Date();
    return new Set(
      tasks
        .filter(t => {
          if (t.status !== 'in_progress') return false;
          const updated = new Date(t.updated_at);
          const minutesSinceUpdate = differenceInMinutes(now, updated);
          // Stuck if progress < 20% and no update in threshold time
          return minutesSinceUpdate >= STUCK_THRESHOLD_MINUTES && t.progress < 20;
        })
        .map(t => t.id)
    );
  }, [tasks]);

  // Task counts
  const activeCount = tasks.filter(t => t.status === 'in_progress').length;
  const queuedCount = tasks.filter(t => t.status === 'queued').length;
  const failedCount = tasks.filter(t => t.status === 'failed').length;
  const stuckCount = stuckTaskIds.size;

  // Sort tasks: active first, then queued, then recent
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const statusOrder: Record<string, number> = {
        in_progress: 0,
        queued: 1,
        failed: 2,
        cancelled: 3,
        completed: 4,
      };
      const aOrder = statusOrder[a.status] ?? 5;
      const bOrder = statusOrder[b.status] ?? 5;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [tasks]);

  // Recent logs (not tied to sorted tasks)
  const recentLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);
  }, [logs]);

  const getMemberName = useCallback((memberId: string | null) => {
    if (!memberId) return 'Unassigned';
    const member = members.find(m => m.id === memberId);
    if (!member) return 'Unknown';
    const spec = SPECIALIZATIONS.find(s => s.id === member.specialization);
    return spec?.name || member.specialization;
  }, [members]);

  const getLogIcon = (logType: AgencyTaskLog['log_type']) => {
    switch (logType) {
      case 'completion': return <CheckCircle className="w-3 h-3 text-neon-green" />;
      case 'error': return <XCircle className="w-3 h-3 text-destructive" />;
      case 'progress': return <Zap className="w-3 h-3 text-neon-amber" />;
      case 'insight': return <Brain className="w-3 h-3 text-neon-purple" />;
      default: return <Activity className="w-3 h-3 text-neon-cyan" />;
    }
  };

  // Handlers
  const handleCancelAll = async () => {
    if (onCancelAllTasks) await onCancelAllTasks();
  };

  const handleRetryFailed = async () => {
    if (onRetryAllFailed) await onRetryAllFailed();
  };

  const handleResetToLearning = async () => {
    if (onResetToLearning) await onResetToLearning();
  };

  const handleClearCompleted = async () => {
    if (onClearCompleted) await onClearCompleted();
  };

  if (tasks.length === 0 && logs.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <Activity className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Tasks and updates will appear here
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Controls bar */}
      {isOwner && (
        <div className="p-3 border-b border-border/30 bg-muted/10">
          <AgencyTaskControls
            activeCount={activeCount}
            queuedCount={queuedCount}
            failedCount={failedCount}
            stuckCount={stuckCount}
            onCancelAll={handleCancelAll}
            onRetryFailed={handleRetryFailed}
            onResetToLearning={handleResetToLearning}
            onClearCompleted={handleClearCompleted}
            isOwner={isOwner}
          />
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Tasks Section */}
          {sortedTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <RefreshCw className="w-3 h-3" />
                Tasks ({sortedTasks.length})
              </div>
              {sortedTasks.slice(0, 20).map(task => (
                <AgencyTaskCard
                  key={task.id}
                  task={task}
                  memberName={getMemberName(task.assigned_member_id)}
                  onCancel={onCancelTask}
                  onRetry={onRetryTask}
                  isOwner={isOwner}
                  isStuck={stuckTaskIds.has(task.id)}
                />
              ))}
            </div>
          )}

          {/* Logs Section */}
          {recentLogs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Activity className="w-3 h-3" />
                Recent Activity
              </div>
              {recentLogs.map(log => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/10 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                    {getLogIcon(log.log_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground line-clamp-2">{log.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
