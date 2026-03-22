/**
 * Agency Team Panel — Shows all team members with dispatch and idle learning capabilities
 */

import { useMemo, useState, useCallback } from 'react';
import { Users2, Brain, Zap, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { type AgencyTask, type TaskTypeId } from '@/lib/agency/agencyTasks';
import { AgencyPortalMemberCard } from './AgencyPortalMemberCard';
import { AgencyQuickDispatch } from './AgencyQuickDispatch';
import { startIdleLearning } from '@/lib/agency/taskExecutor';
import type { Specialization } from '@/lib/agency/agencyTypes';

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
  agencyId: string;
  leaderName?: string;
  onDispatchTask?: (memberId: string, taskType: TaskTypeId, description?: string) => Promise<void>;
  onLaunchTeamTask?: (taskType: TaskTypeId, input: string) => Promise<void>;
  idleLearningEnabled?: boolean;
  className?: string;
}

interface MemberStatus {
  member: TeamMember;
  currentTask: AgencyTask | null;
  completedTasks: number;
  totalTasks: number;
  status: 'working' | 'learning' | 'idle';
}

export function AgencyTeamPanel({
  members,
  tasks,
  agencyId,
  leaderName,
  onDispatchTask,
  onLaunchTeamTask,
  idleLearningEnabled = false,
  className,
}: AgencyTeamPanelProps) {
  const [startingLearning, setStartingLearning] = useState<string | null>(null);

  // Calculate status for each member
  const memberStatuses: MemberStatus[] = useMemo(() => {
    return members.map(member => {
      const memberTasks = tasks.filter(t => t.assigned_member_id === member.id);
      const currentTask = memberTasks.find(t => t.status === 'in_progress') || null;
      const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
      const learningTask = memberTasks.find(
        t => t.status === 'in_progress' && (t.input_data as any)?.isLearning
      );

      let status: 'working' | 'learning' | 'idle' = 'idle';
      if (currentTask) {
        status = learningTask ? 'learning' : 'working';
      }

      return {
        member,
        currentTask,
        completedTasks,
        totalTasks: memberTasks.length,
        status,
      };
    });
  }, [members, tasks]);

  // Count by status
  const workingCount = memberStatuses.filter(s => s.status === 'working').length;
  const learningCount = memberStatuses.filter(s => s.status === 'learning').length;
  const idleCount = memberStatuses.filter(s => s.status === 'idle').length;

  // Start idle learning for a member
  const handleStartLearning = useCallback(async (member: TeamMember) => {
    if (!agencyId) return;
    
    setStartingLearning(member.id);
    try {
      await startIdleLearning(agencyId, member.id, member.specialization);
      toast.success(`${member.role} started learning`, {
        description: `Studying ${member.specialization} domain`,
      });
    } catch (err) {
      console.error('Failed to start learning:', err);
      toast.error('Failed to start learning');
    } finally {
      setStartingLearning(null);
    }
  }, [agencyId]);

  // Start learning for all idle agents
  const handleTeamLearning = useCallback(async () => {
    const idleMembers = memberStatuses.filter(s => s.status === 'idle');
    if (idleMembers.length === 0) {
      toast.info('No idle agents to start learning');
      return;
    }

    for (const { member } of idleMembers) {
      await startIdleLearning(agencyId, member.id, member.specialization);
    }

    toast.success(`Started learning for ${idleMembers.length} agents`);
  }, [memberStatuses, agencyId]);

  const teamSpecs = members.map(m => m.specialization as Specialization);

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-6">
        {/* Team Status Overview */}
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className={cn(
            "gap-1.5 text-xs",
            workingCount > 0 && "border-neon-amber/50 text-neon-amber"
          )}>
            <Zap className="w-3 h-3" />
            {workingCount} Working
          </Badge>
          <Badge variant="outline" className={cn(
            "gap-1.5 text-xs",
            learningCount > 0 && "border-neon-purple/50 text-neon-purple"
          )}>
            <BookOpen className="w-3 h-3" />
            {learningCount} Learning
          </Badge>
          <Badge variant="outline" className={cn(
            "gap-1.5 text-xs",
            idleCount > 0 && "border-muted-foreground/50 text-muted-foreground"
          )}>
            {idleCount} Idle
          </Badge>

          {idleLearningEnabled && idleCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTeamLearning}
              className="ml-auto gap-2 text-xs border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
            >
              <Brain className="w-3 h-3" />
              Start Team Learning
            </Button>
          )}
        </div>

        {/* Quick Dispatch Section */}
        {onLaunchTeamTask && (
          <AgencyQuickDispatch
            teamSpecs={teamSpecs}
            onLaunchTask={onLaunchTeamTask}
          />
        )}

        {/* Team Members */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users2 className="w-4 h-4" />
            <span>Team Members ({members.length})</span>
          </div>

          {memberStatuses.map(status => (
            <AgencyPortalMemberCard
              key={status.member.id}
              member={status.member}
              currentTask={status.currentTask}
              completedTasks={status.completedTasks}
              totalTasks={status.totalTasks}
              leaderName={leaderName}
              onDispatchTask={onDispatchTask}
              onStartLearning={
                idleLearningEnabled && status.status === 'idle' 
                  ? () => handleStartLearning(status.member)
                  : undefined
              }
              isStartingLearning={startingLearning === status.member.id}
              agentStatus={status.status}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
