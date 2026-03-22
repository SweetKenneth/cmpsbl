/**
 * Portal Sidebar 2026
 * Team roster, quick actions, and navigation
 */

import { useState } from 'react';
import { 
  Users2, 
  Brain, 
  Zap, 
  BookOpen, 
  ChevronRight, 
  BarChart3,
  Moon,
  Crown,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SPECIALIZATIONS } from '@/lib/agency/agencyTypes';
import type { AgencyTask } from '@/lib/agency/agencyTasks';

interface TeamMember {
  id: string;
  role: string;
  specialization: string;
  is_leader: boolean;
  skill_weights: Record<string, number>;
}

interface PortalSidebarProps {
  members: TeamMember[];
  tasks: AgencyTask[];
  agencyId: string;
  dreamPoolMode?: string;
  cohesionRating?: number;
  isOwner: boolean;
  onStartTeamLearning?: () => Promise<void>;
  onViewTelemetry?: () => void;
  onViewDream?: () => void;
  className?: string;
}

export function PortalSidebar({
  members,
  tasks,
  agencyId,
  dreamPoolMode,
  cohesionRating = 0,
  isOwner,
  onStartTeamLearning,
  onViewTelemetry,
  onViewDream,
  className,
}: PortalSidebarProps) {
  const [isStartingLearning, setIsStartingLearning] = useState(false);

  // Calculate member statuses
  const memberStatuses = members.map(member => {
    const memberTasks = tasks.filter(t => t.assigned_member_id === member.id);
    const currentTask = memberTasks.find(t => t.status === 'in_progress');
    const isLearning = currentTask && (currentTask.input_data as any)?.isLearning;
    const completedCount = memberTasks.filter(t => t.status === 'completed').length;

    return {
      member,
      currentTask,
      isLearning,
      completedCount,
      status: currentTask ? (isLearning ? 'learning' : 'working') : 'idle' as 'working' | 'learning' | 'idle',
    };
  });

  const workingCount = memberStatuses.filter(s => s.status === 'working').length;
  const learningCount = memberStatuses.filter(s => s.status === 'learning').length;
  const idleCount = memberStatuses.filter(s => s.status === 'idle').length;

  const handleStartLearning = async () => {
    if (!onStartTeamLearning) return;
    setIsStartingLearning(true);
    try {
      await onStartTeamLearning();
    } finally {
      setIsStartingLearning(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Agency Stats */}
      <div className="p-4 border-b border-border/30 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Team Cohesion</span>
          <span className="text-xs font-mono text-primary">{cohesionRating}%</span>
        </div>
        <Progress value={cohesionRating} className="h-1.5" />

        <div className="flex gap-2">
          <Badge variant="outline" className={cn(
            "flex-1 justify-center gap-1 py-1.5 text-[10px]",
            workingCount > 0 && "border-neon-amber/30 text-neon-amber bg-neon-amber/10"
          )}>
            <Zap className="w-3 h-3" />
            {workingCount} Working
          </Badge>
          <Badge variant="outline" className={cn(
            "flex-1 justify-center gap-1 py-1.5 text-[10px]",
            learningCount > 0 && "border-neon-purple/30 text-neon-purple bg-neon-purple/10"
          )}>
            <BookOpen className="w-3 h-3" />
            {learningCount} Learning
          </Badge>
        </div>
      </div>

      {/* Team Roster */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users2 className="w-3.5 h-3.5" />
            Team ({members.length})
          </div>

          <div className="space-y-2">
            {memberStatuses.map(({ member, currentTask, status, completedCount }) => {
              const spec = SPECIALIZATIONS.find(s => s.id === member.specialization);
              
              return (
                <div
                  key={member.id}
                  className={cn(
                    "group p-3 rounded-xl border transition-all cursor-default",
                    "bg-card/50 border-border/30 hover:border-border/50",
                    member.is_leader && "border-neon-amber/30 bg-neon-amber/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      "bg-gradient-to-br",
                      status === 'working' && "from-neon-amber/20 to-neon-amber/20",
                      status === 'learning' && "from-neon-purple/20 to-neon-magenta/20",
                      status === 'idle' && "from-muted/40 to-muted/20"
                    )}>
                      {member.is_leader ? (
                        <Crown className="w-4 h-4 text-neon-amber" />
                      ) : status === 'learning' ? (
                        <Brain className="w-4 h-4 text-neon-purple animate-pulse" />
                      ) : status === 'working' ? (
                        <Loader2 className="w-4 h-4 text-neon-amber animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {spec?.name || member.specialization}
                        </span>
                        {member.is_leader && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-neon-amber/30 text-neon-amber">
                            Lead
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{completedCount} completed</span>
                        {currentTask && (
                          <>
                            <span>•</span>
                            <span className={cn(
                              status === 'working' && "text-neon-amber",
                              status === 'learning' && "text-neon-purple"
                            )}>
                              {status === 'learning' ? 'Learning' : 'Working'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for active task */}
                  {currentTask && (
                    <div className="mt-2">
                      <Progress 
                        value={currentTask.progress || 0} 
                        className="h-1" 
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/30 space-y-2">
        {isOwner && idleCount > 0 && onStartTeamLearning && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartLearning}
            disabled={isStartingLearning}
            className="w-full gap-2 text-xs border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
          >
            {isStartingLearning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Brain className="w-3 h-3" />
            )}
            Start Team Learning
          </Button>
        )}

        {onViewTelemetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewTelemetry}
            className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-3 h-3" />
              View Telemetry
            </span>
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}

        {onViewDream && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDream}
            className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <Moon className="w-3 h-3" />
              Dream Learning
            </span>
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
