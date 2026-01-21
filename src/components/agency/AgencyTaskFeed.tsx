/**
 * Agency Task Feed — Real-time task activity feed
 */

import { useMemo } from 'react';
import { Activity, CheckCircle, XCircle, Clock, Zap, Brain, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TASK_TYPES, TASK_STATUSES, type AgencyTaskLog, type AgencyTask } from '@/lib/agency/agencyTasks';
import { SPECIALIZATIONS } from '@/lib/agency/agencyTypes';
import { formatDistanceToNow } from 'date-fns';

interface AgencyTaskFeedProps {
  tasks: AgencyTask[];
  logs: AgencyTaskLog[];
  members: Array<{ id: string; specialization: string; is_leader: boolean }>;
  className?: string;
}

export function AgencyTaskFeed({ tasks, logs, members, className }: AgencyTaskFeedProps) {
  // Combine and sort activity
  const activity = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'task' | 'log';
      timestamp: Date;
      data: AgencyTask | AgencyTaskLog;
    }> = [];

    // Add tasks with recent updates
    tasks.forEach(task => {
      items.push({
        id: `task_${task.id}`,
        type: 'task',
        timestamp: new Date(task.updated_at),
        data: task,
      });
    });

    // Add logs
    logs.forEach(log => {
      items.push({
        id: `log_${log.id}`,
        type: 'log',
        timestamp: new Date(log.created_at),
        data: log,
      });
    });

    // Sort by timestamp descending
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);
  }, [tasks, logs]);

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return 'Unassigned';
    const member = members.find(m => m.id === memberId);
    if (!member) return 'Unknown';
    const spec = SPECIALIZATIONS.find(s => s.id === member.specialization);
    return spec?.name || member.specialization;
  };

  const getLogIcon = (logType: AgencyTaskLog['log_type']) => {
    switch (logType) {
      case 'completion': return <CheckCircle className="w-3 h-3 text-emerald-400" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-400" />;
      case 'progress': return <Zap className="w-3 h-3 text-amber-400" />;
      case 'insight': return <Brain className="w-3 h-3 text-purple-400" />;
      default: return <Activity className="w-3 h-3 text-cyan-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusInfo = TASK_STATUSES[status as keyof typeof TASK_STATUSES];
    return statusInfo?.color || 'slate';
  };

  if (activity.length === 0) {
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
    <ScrollArea className={cn("h-full", className)}>
      <div className="space-y-2 p-4">
        {activity.map(item => {
          if (item.type === 'task') {
            const task = item.data as AgencyTask;
            const taskType = TASK_TYPES[task.task_type as keyof typeof TASK_TYPES];
            const statusInfo = TASK_STATUSES[task.status as keyof typeof TASK_STATUSES];
            
            return (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-fuchsia-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{taskType?.icon || '📋'}</span>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {getMemberName(task.assigned_member_id)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] h-5",
                        `border-${getStatusColor(task.status)}-500/50 text-${getStatusColor(task.status)}-400`
                      )}
                    >
                      {statusInfo?.icon} {statusInfo?.label || task.status}
                    </Badge>
                    {task.status === 'in_progress' && (
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{task.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </p>
              </div>
            );
          } else {
            const log = item.data as AgencyTaskLog;
            
            return (
              <div
                key={item.id}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/10 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                  {getLogIcon(log.log_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground line-clamp-2">{log.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          }
        })}
      </div>
    </ScrollArea>
  );
}
