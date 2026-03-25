/**
 * Agency Task Card — Individual task with cancel/retry actions and results viewer
 */

import { useState } from 'react';
import { XCircle, RotateCcw, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { TASK_TYPES, TASK_STATUSES, type AgencyTask } from '@/lib/agency/agencyTasks';
import { formatDistanceToNow } from 'date-fns';
import { TaskResultViewer } from './TaskResultViewer';

interface AgencyTaskCardProps {
  task: AgencyTask;
  memberName?: string;
  onCancel?: (taskId: string) => Promise<boolean | void>;
  onRetry?: (taskId: string) => Promise<boolean | void>;
  isOwner: boolean;
  isStuck?: boolean;
}

export function AgencyTaskCard({
  task,
  memberName,
  onCancel,
  onRetry,
  isOwner,
  isStuck = false,
}: AgencyTaskCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const taskType = TASK_TYPES[task.task_type as keyof typeof TASK_TYPES];
  const statusInfo = TASK_STATUSES[task.status as keyof typeof TASK_STATUSES];

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel(task.id);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry(task.id);
    } finally {
      setIsRetrying(false);
    }
  };

  const canCancel = isOwner && (task.status === 'queued' || task.status === 'in_progress');
  const canRetry = isOwner && (task.status === 'failed' || task.status === 'cancelled');
  const isActive = task.status === 'in_progress';

  // Determine status color class
  const getStatusColorClass = () => {
    switch (task.status) {
      case 'completed': return 'border-neon-green/30 bg-neon-green/5';
      case 'failed': return 'border-destructive/30 bg-destructive/5';
      case 'in_progress': return isStuck ? 'border-neon-amber/30 bg-neon-amber/5' : 'border-neon-amber/30 bg-neon-amber/5';
      case 'cancelled': return 'border-slate-500/30 bg-slate-500/5';
      default: return 'border-border/30 bg-muted/10';
    }
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all",
        getStatusColorClass(),
        isStuck && "animate-pulse"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{taskType?.icon || '📋'}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{task.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {memberName || 'Unassigned'}
            </p>
          </div>
        </div>

        {/* Status + Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isStuck && (
            <Badge variant="outline" className="text-[10px] border-neon-amber/50 text-neon-amber">
              Stuck
            </Badge>
          )}
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] gap-1",
              task.status === 'completed' && "border-neon-green/50 text-neon-green",
              task.status === 'failed' && "border-destructive/50 text-destructive",
              task.status === 'in_progress' && "border-neon-amber/50 text-neon-amber",
              task.status === 'queued' && "border-slate-500/50 text-slate-400",
              task.status === 'cancelled' && "border-slate-500/50 text-slate-400",
            )}
          >
            {isActive && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {task.status === 'completed' && <CheckCircle className="w-2.5 h-2.5" />}
            {task.status === 'failed' && <AlertCircle className="w-2.5 h-2.5" />}
            {task.status === 'queued' && <Clock className="w-2.5 h-2.5" />}
            {statusInfo?.label || task.status}
          </Badge>

          {/* Cancel button */}
          {canCancel && onCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
            </Button>
          )}

          {/* Retry button */}
          {canRetry && onRetry && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-neon-amber hover:bg-neon-amber/10"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RotateCcw className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar for active tasks */}
      {isActive && (
        <div className="mt-2 space-y-1">
          <Progress value={task.progress} className="h-1.5" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{task.progress}% complete</span>
            {task.started_at && (
              <span>Started {formatDistanceToNow(new Date(task.started_at), { addSuffix: true })}</span>
            )}
          </div>
        </div>
      )}

      {/* View results for completed tasks */}
      {task.status === 'completed' && (
        <div className="mt-2">
          <TaskResultViewer task={task} />
        </div>
      )}

      {/* Error message for failed tasks */}
      {task.status === 'failed' && task.error_message && (
        <p className="mt-2 text-xs text-destructive line-clamp-2">
          {task.error_message}
        </p>
      )}

      {/* Timestamp */}
      <p className="mt-2 text-[10px] text-muted-foreground">
        {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
      </p>
    </div>
  );
}
