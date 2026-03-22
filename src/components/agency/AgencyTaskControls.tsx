/**
 * Agency Task Controls — Cancel, Retry, and Bulk Actions for Tasks
 */

import { useState } from 'react';
import { XCircle, RotateCcw, Brain, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface AgencyTaskControlsProps {
  activeCount: number;
  queuedCount: number;
  failedCount: number;
  stuckCount: number;
  onCancelAll: () => Promise<void>;
  onRetryFailed: () => Promise<void>;
  onResetToLearning: () => Promise<void>;
  onClearCompleted: () => Promise<void>;
  isOwner: boolean;
  className?: string;
}

export function AgencyTaskControls({
  activeCount,
  queuedCount,
  failedCount,
  stuckCount,
  onCancelAll,
  onRetryFailed,
  onResetToLearning,
  onClearCompleted,
  isOwner,
  className,
}: AgencyTaskControlsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const pendingTotal = activeCount + queuedCount;

  const handleCancelAll = async () => {
    setIsCancelling(true);
    try {
      await onCancelAll();
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRetryFailed = async () => {
    setIsRetrying(true);
    try {
      await onRetryFailed();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleResetToLearning = async () => {
    setIsResetting(true);
    try {
      await onResetToLearning();
    } finally {
      setIsResetting(false);
    }
  };

  if (!isOwner) return null;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Status badges */}
      {stuckCount > 0 && (
        <Badge variant="outline" className="gap-1 text-[10px] border-neon-amber/50 text-neon-amber animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          {stuckCount} Stuck
        </Badge>
      )}

      {/* Cancel All */}
      {pendingTotal > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={isCancelling}
            >
              <XCircle className="w-3 h-3" />
              Cancel All ({pendingTotal})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel all tasks?</AlertDialogTitle>
              <AlertDialogDescription>
                This will stop {pendingTotal} active and queued task{pendingTotal !== 1 ? 's' : ''}. 
                Agents will become idle.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Running</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelAll}
                className="bg-destructive hover:bg-red-700"
              >
                Cancel All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Retry Failed */}
      {failedCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetryFailed}
          disabled={isRetrying}
          className="gap-1.5 text-xs border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
        >
          <RotateCcw className={cn("w-3 h-3", isRetrying && "animate-spin")} />
          Retry Failed ({failedCount})
        </Button>
      )}

      {/* Reset to Learning */}
      {pendingTotal === 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToLearning}
          disabled={isResetting}
          className="gap-1.5 text-xs border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
        >
          <Brain className={cn("w-3 h-3", isResetting && "animate-pulse")} />
          {isResetting ? 'Starting...' : 'Start Team Learning'}
        </Button>
      )}

      {/* Clear Completed - subtle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearCompleted}
        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <Trash2 className="w-3 h-3" />
        Clear Done
      </Button>
    </div>
  );
}
