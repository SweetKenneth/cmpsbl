/**
 * Agency Team Panel — Shows all team members with dispatch capabilities
 */

import { useMemo } from 'react';
import { Users2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { type AgencyTask, type TaskTypeId } from '@/lib/agency/agencyTasks';
import { AgencyPortalMemberCard } from './AgencyPortalMemberCard';
import { AgencyQuickDispatch } from './AgencyQuickDispatch';
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
  leaderName?: string;
  onDispatchTask?: (memberId: string, taskType: TaskTypeId, description?: string) => Promise<void>;
  onLaunchTeamTask?: (taskType: TaskTypeId, input: string) => Promise<void>;
  className?: string;
}

interface MemberStatus {
  member: TeamMember;
  currentTask: AgencyTask | null;
  completedTasks: number;
  totalTasks: number;
}

export function AgencyTeamPanel({
  members,
  tasks,
  leaderName,
  onDispatchTask,
  onLaunchTeamTask,
  className,
}: AgencyTeamPanelProps) {
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
      };
    });
  }, [members, tasks]);

  const teamSpecs = members.map(m => m.specialization as Specialization);

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-6">
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
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
