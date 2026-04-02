/**
 * Agency Tabbed Portal — Main interface with Chat, Tasks, Team, Settings tabs
 * v2.0 — Now with proper task distribution and queue processing
 */

import { useState, useCallback, useMemo } from 'react';
import { MessageSquare, ListTodo, Users2, Settings, ArrowLeft, Sparkles, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AgencyChatInterface } from './AgencyChatInterface';
import { AgencyTaskFeed } from './AgencyTaskFeed';
import { AgencyTeamPanel } from './AgencyTeamPanel';
import { AgencySettingsPanel } from './AgencySettingsPanel';
import { useAgencyTasks } from '@/hooks/useAgencyTasks';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { useAuth } from '@/contexts/AuthContext';
import { 
  findBestAgent, 
  parseIntents, 
  createOrchestrationPlan, 
  executeOrchestration,
  type TeamMember 
} from '@/lib/agency/orchestration/leaderOrchestrator';
import type { Agency } from '@/lib/agency/agencyTypes';
import type { TaskTypeId } from '@/lib/agency/agencyTasks';
import { Link } from 'react-router-dom';

interface PortalMember {
  id: string;
  role: string;
  specialization: string;
  is_leader: boolean;
  skill_weights: Record<string, number>;
}

interface AgencyTabbedPortalProps {
  agency: Agency;
  members: PortalMember[];
  onBack: () => void;
  isOwner: boolean;
}

export function AgencyTabbedPortal({ agency, members, onBack, isOwner }: AgencyTabbedPortalProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const { user } = useAuth();

  const {
    tasks,
    taskLogs,
    createTask,
    createAndQueueTask,
    startTask,
    completeTask,
    addTaskLog,
    getTasksByStatus,
    cancelTask,
    cancelAllTasks,
    retryTask,
    retryAllFailed,
    clearCompletedTasks,
    queueStats,
  } = useAgencyTasks({ agencyId: agency.id });

  const {
    settings,
    isLoading: settingsLoading,
    updateSettings,
    updateLeaderName,
    addPresetCommand,
    removePresetCommand,
  } = useAgencySettings(agency.id);

  const activeTasks = getTasksByStatus('in_progress');
  const queuedTasks = getTasksByStatus('queued');
  const leader = members.find(m => m.is_leader);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Cast members to TeamMember type for orchestrator
  const teamMembers: TeamMember[] = useMemo(() => 
    members.map(m => ({
      id: m.id,
      role: m.role,
      specialization: m.specialization,
      is_leader: m.is_leader,
      skill_weights: m.skill_weights,
    })), [members]);

  // Handler for launching tasks - NOW USES ORCHESTRATION to distribute to best agents
  const handleLaunchTask = useCallback(async (taskType: TaskTypeId, input: string) => {
    if (!isAuthenticated) return;

    // Parse intents from input
    const intents = parseIntents(input);
    
    // If multiple intents detected, use full orchestration
    if (intents.length > 1) {
      // Multiple intents detected, using orchestration
      const plan = createOrchestrationPlan(input, teamMembers);
      const result = await executeOrchestration(agency.id, plan);
      
      if (result.success) {
        await addTaskLog(result.taskIds[0], 
          `${settings?.leader_name || 'Team Lead'} orchestrated ${result.taskIds.length} tasks across agents`);
        setActiveTab('tasks');
        return;
      }
    }

    // Single intent - find best agent for this task type
    const bestAgent = findBestAgent(intents[0]?.primitive || 'web_research', teamMembers);
    const assignedMemberId = bestAgent?.id || leader?.id || null;

    const task = await createAndQueueTask({
      task_type: taskType as any,
      title: `${taskType}: ${input.slice(0, 40)}${input.length > 40 ? '...' : ''}`,
      description: input,
      input_data: { rawInput: input },
      assigned_member_id: assignedMemberId,
    });

    if (task) {
      await addTaskLog(task.id, 
        `${settings?.leader_name || 'Team Lead'} assigned to ${bestAgent?.specialization || 'available agent'}`);
      setActiveTab('tasks');
    }
  }, [createAndQueueTask, addTaskLog, leader, settings?.leader_name, isAuthenticated, teamMembers, agency.id]);

  // Handler for dispatching task to specific member
  const handleDispatchToMember = useCallback(async (memberId: string, taskType: TaskTypeId, description?: string) => {
    if (!isAuthenticated) return;

    const task = await createAndQueueTask({
      task_type: taskType as any,
      title: description || `${taskType} task`,
      description: description || `Task assigned to agent`,
      input_data: { rawInput: description || '' },
      assigned_member_id: memberId,
    });

    if (task) {
      await addTaskLog(task.id, `Agent assigned to ${taskType} task`);
    }
  }, [createAndQueueTask, addTaskLog, isAuthenticated]);

  // Reset team to learning mode (cancel all then start idle learning)
  const handleResetToLearning = useCallback(async () => {
    if (!isAuthenticated || !isOwner) return;

    // Start idle learning for each member
    const { startIdleLearning } = await import('@/lib/agency/taskExecutor');
    for (const member of members) {
      await startIdleLearning(agency.id, member.id, member.specialization);
    }
  }, [agency.id, members, isAuthenticated, isOwner]);

  // Convert to format expected by task feed
  const feedMembers = members.map(m => ({
    id: m.id,
    specialization: m.specialization,
    is_leader: m.is_leader,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-black/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-magenta/30 to-neon-purple/30 border border-neon-magenta/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-neon-magenta" />
                </div>
                <div>
                  <span className="font-semibold text-sm">{agency.name}</span>
                  {settings?.leader_name && (
                    <span className="text-xs text-muted-foreground ml-2">
                      Led by {settings.leader_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <Button asChild variant="outline" size="sm" className="gap-2 text-xs border-neon-magenta/30">
                  <Link to="/auth">
                    <LogIn className="w-3 h-3" />
                    Sign In
                  </Link>
                </Button>
              )}
              {isAuthenticated && isOwner && (
                <Badge variant="outline" className="text-[10px] border-neon-magenta/50 text-neon-magenta">
                  Owner
                </Badge>
              )}
              {activeTasks.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-neon-amber/50 text-neon-amber animate-pulse">
                  {activeTasks.length} Active
                </Badge>
              )}
              {queuedTasks.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-neon-cyan/50 text-neon-cyan">
                  {queuedTasks.length} Queued
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex-1 container max-w-5xl mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-border/30">
            <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-neon-magenta/20">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-neon-amber/20 relative">
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
              {activeTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-amber text-[10px] flex items-center justify-center text-black font-bold">
                  {activeTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-neon-cyan/20">
              <Users2 className="w-4 h-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-neon-purple/20">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <TabsContent value="chat" className="h-[calc(100vh-180px)] m-0">
              <AgencyChatInterface
                agency={agency}
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="tasks" className="h-[calc(100vh-180px)] m-0">
              <AgencyTaskFeed
                tasks={tasks}
                logs={taskLogs}
                members={feedMembers}
                isOwner={isAuthenticated && isOwner}
                onCancelTask={cancelTask}
                onCancelAllTasks={async () => { await cancelAllTasks(); }}
                onRetryTask={retryTask}
                onRetryAllFailed={async () => { await retryAllFailed(); }}
                onResetToLearning={handleResetToLearning}
                onClearCompleted={async () => { await clearCompletedTasks(); }}
              />
            </TabsContent>

            <TabsContent value="team" className="h-[calc(100vh-180px)] m-0">
              <AgencyTeamPanel
                members={members}
                tasks={tasks}
                agencyId={agency.id}
                leaderName={settings?.leader_name}
                onDispatchTask={isAuthenticated ? handleDispatchToMember : undefined}
                onLaunchTeamTask={isAuthenticated ? handleLaunchTask : undefined}
                idleLearningEnabled={isAuthenticated && isOwner}
              />
            </TabsContent>

            <TabsContent value="settings" className="h-[calc(100vh-180px)] m-0">
              {isAuthenticated && isOwner ? (
                <AgencySettingsPanel
                  settings={settings}
                  isLoading={settingsLoading}
                  onUpdateSettings={updateSettings}
                  onUpdateLeaderName={updateLeaderName}
                  onAddPreset={addPresetCommand}
                  onRemovePreset={removePresetCommand}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground space-y-4">
                    <Settings className="w-12 h-12 mx-auto opacity-50" />
                    {!isAuthenticated ? (
                      <>
                        <p>Sign in to access agency settings.</p>
                        <Button asChild variant="outline" className="gap-2">
                          <Link to="/auth">
                            <LogIn className="w-4 h-4" />
                            Sign In
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <p>Only the agency owner can modify settings.</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
