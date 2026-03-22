/**
 * Agency Portal Member Card — Team member with dispatch and learning capabilities
 */

import { useState } from 'react';
import { User, Crown, Zap, Clock, Play, Loader2, CheckCircle, BookOpen, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SPECIALIZATIONS, type Specialization } from '@/lib/agency/agencyTypes';
import { TASK_TYPES, getTaskTypesForSpecialization, type TaskTypeId, type AgencyTask } from '@/lib/agency/agencyTasks';

interface PortalMember {
  id: string;
  role: string;
  specialization: string;
  is_leader: boolean;
  skill_weights: Record<string, number>;
}

interface AgencyPortalMemberCardProps {
  member: PortalMember;
  currentTask: AgencyTask | null;
  completedTasks: number;
  totalTasks: number;
  leaderName?: string;
  onDispatchTask?: (memberId: string, taskType: TaskTypeId, description?: string) => Promise<void>;
  onStartLearning?: () => Promise<void>;
  isStartingLearning?: boolean;
  agentStatus?: 'working' | 'learning' | 'idle';
  className?: string;
}

export function AgencyPortalMemberCard({
  member,
  currentTask,
  completedTasks,
  totalTasks,
  leaderName,
  onDispatchTask,
  onStartLearning,
  isStartingLearning,
  agentStatus = 'idle',
  className,
}: AgencyPortalMemberCardProps) {
  const [isDispatching, setIsDispatching] = useState(false);

  const spec = SPECIALIZATIONS.find(s => s.id === member.specialization);
  const isLeader = member.is_leader;
  const displayName = isLeader && leaderName ? leaderName : spec?.name || member.specialization;
  const isIdle = !currentTask;
  const availableTaskTypes = getTaskTypesForSpecialization(member.specialization as Specialization)
    .filter(t => t.id !== 'idle_learning');

  const handleDispatch = async (taskType: TaskTypeId) => {
    if (!onDispatchTask) return;
    setIsDispatching(true);
    try {
      const taskInfo = TASK_TYPES[taskType];
      await onDispatchTask(member.id, taskType, `${taskInfo.name} task for ${displayName}`);
    } finally {
      setIsDispatching(false);
    }
  };

  const getStatusBadge = () => {
    if (agentStatus === 'learning') {
      return (
        <Badge variant="outline" className="text-[10px] h-5 border-neon-purple/50 text-neon-purple gap-1">
          <BookOpen className="w-3 h-3 animate-pulse" />
          Learning
        </Badge>
      );
    }
    if (agentStatus === 'working' || currentTask) {
      return (
        <Badge variant="outline" className="text-[10px] h-5 border-neon-amber/50 text-neon-amber gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Working
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] h-5 border-neon-green/50 text-neon-green gap-1">
        <Zap className="w-3 h-3" />
        Ready
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        "border-border/30 bg-black/40 backdrop-blur-sm transition-all",
        isLeader && "border-neon-magenta/40 bg-neon-magenta/5",
        className
      )}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                isLeader
                  ? "bg-gradient-to-br from-neon-magenta/30 to-neon-purple/30 border border-neon-magenta/40"
                  : "bg-neon-cyan/20 border border-neon-cyan/30"
              )}
            >
              {isLeader ? (
                <Crown className="w-5 h-5 text-neon-magenta" />
              ) : (
                <User className="w-5 h-5 text-neon-cyan" />
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{displayName}</h4>
                {isLeader && (
                  <Badge variant="outline" className="text-[10px] h-4 border-neon-magenta/50 text-neon-magenta">
                    Leader
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {spec?.description || 'Cognitive agent'}
              </p>
            </div>
          </div>

          {/* Status & Dispatch */}
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge()}
            <span className="text-[10px] text-muted-foreground">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
        </div>

        {/* Current Task */}
        {currentTask && (
          <div className="mt-3 pt-3 border-t border-border/20">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {TASK_TYPES[currentTask.task_type as keyof typeof TASK_TYPES]?.icon || '📋'}
                </span>
                <span className="text-xs font-medium line-clamp-1">{currentTask.title}</span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {currentTask.progress}%
              </span>
            </div>
            <Progress value={currentTask.progress} className="h-1.5" />
          </div>
        )}

        {/* Dispatch Button for Idle Agents */}
        {isIdle && !isLeader && (onDispatchTask || onStartLearning) && (
          <div className="mt-3 pt-3 border-t border-border/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Available for tasks</span>
              </div>
              <div className="flex items-center gap-1">
                {onStartLearning && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] gap-1 text-neon-purple hover:bg-neon-purple/10"
                    disabled={isStartingLearning}
                    onClick={onStartLearning}
                  >
                    {isStartingLearning ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Brain className="w-3 h-3" />
                    )}
                    Learn
                  </Button>
                )}
                {onDispatchTask && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] gap-1 border-neon-magenta/30 hover:bg-neon-magenta/10"
                        disabled={isDispatching}
                      >
                        {isDispatching ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        Dispatch
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {availableTaskTypes.map(taskType => (
                        <DropdownMenuItem
                          key={taskType.id}
                          onClick={() => handleDispatch(taskType.id as TaskTypeId)}
                          className="gap-2 text-xs"
                        >
                          <span>{taskType.icon}</span>
                          {taskType.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leader ready state */}
        {isIdle && isLeader && (
          <div className="mt-3 pt-3 border-t border-border/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-neon-green" />
              <span>Coordinating team operations...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
