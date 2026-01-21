/**
 * Agency Team Panel — Shows all team members with their current status
 */

import { useMemo } from 'react';
import { User, Crown, Zap, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { SPECIALIZATIONS, type Specialization } from '@/lib/agency/agencyTypes';
import { TASK_TYPES, type AgencyTask } from '@/lib/agency/agencyTasks';

interface TeamMember {
  id: string;
  role: string;
  specialization: string;
  is_leader: boolean;
  skill_weights: Record<string, number>;
}

interface AgencyTeamPanelProps {
  members: TeamMember[];
  tasks: AgencyTask[];
  leaderName?: string;
  className?: string;
}

interface MemberStatus {
  member: TeamMember;
  currentTask: AgencyTask | null;
  completedTasks: number;
  totalTasks: number;
  isIdle: boolean;
}

export function AgencyTeamPanel({ members, tasks, leaderName, className }: AgencyTeamPanelProps) {
  // Calculate status for each member
  const memberStatuses: MemberStatus[] = useMemo(() => {
    return members.map(member => {
      const memberTasks = tasks.filter(t => t.assigned_member_id === member.id);
      const currentTask = memberTasks.find(t => t.status === 'in_progress') || null;
      const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
      
      return {
        member,
        currentTask,
        completedTasks,
        totalTasks: memberTasks.length,
        isIdle: !currentTask,
      };
    });
  }, [members, tasks]);

  const getSpecInfo = (specId: string) => {
    return SPECIALIZATIONS.find(s => s.id === specId);
  };

  const getStatusBadge = (status: MemberStatus) => {
    if (status.currentTask) {
      return (
        <Badge variant="outline" className="text-[10px] h-5 border-amber-500/50 text-amber-400 gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Working
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] h-5 border-emerald-500/50 text-emerald-400 gap-1">
        <Zap className="w-3 h-3" />
        Ready
      </Badge>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      {memberStatuses.map(status => {
        const spec = getSpecInfo(status.member.specialization);
        const isLeader = status.member.is_leader;
        const displayName = isLeader && leaderName ? leaderName : spec?.name || status.member.specialization;
        
        return (
          <Card 
            key={status.member.id} 
            className={cn(
              "border-border/30 bg-black/40 backdrop-blur-sm transition-all",
              isLeader && "border-fuchsia-500/40 bg-fuchsia-500/5"
            )}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    isLeader 
                      ? "bg-gradient-to-br from-fuchsia-500/30 to-purple-600/30 border border-fuchsia-500/40"
                      : `bg-${spec?.color || 'cyan'}-500/20 border border-${spec?.color || 'cyan'}-500/30`
                  )}>
                    {isLeader ? (
                      <Crown className="w-5 h-5 text-fuchsia-400" />
                    ) : (
                      <User className="w-5 h-5 text-cyan-400" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{displayName}</h4>
                      {isLeader && (
                        <Badge variant="outline" className="text-[10px] h-4 border-fuchsia-500/50 text-fuchsia-400">
                          Leader
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {spec?.description || 'Cognitive agent'}
                    </p>
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(status)}
                  <span className="text-[10px] text-muted-foreground">
                    {status.completedTasks}/{status.totalTasks} tasks
                  </span>
                </div>
              </div>
              
              {/* Current Task */}
              {status.currentTask && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {TASK_TYPES[status.currentTask.task_type as keyof typeof TASK_TYPES]?.icon || '📋'}
                      </span>
                      <span className="text-xs font-medium line-clamp-1">
                        {status.currentTask.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {status.currentTask.progress}%
                    </span>
                  </div>
                  <Progress 
                    value={status.currentTask.progress} 
                    className="h-1.5"
                  />
                </div>
              )}
              
              {/* Idle Learning */}
              {status.isIdle && !isLeader && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Self-studying specialized domains...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
