/**
 * Agency Tabbed Portal — Main interface with Chat, Tasks, Team, Settings tabs
 */

import { useState, useCallback } from 'react';
import { MessageSquare, ListTodo, Users2, Settings, ArrowLeft, Sparkles } from 'lucide-react';
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
import type { Agency } from '@/lib/agency/agencyTypes';

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
  
  const { 
    tasks, 
    taskLogs, 
    createTask, 
    startTask, 
    completeTask, 
    addTaskLog,
    getTasksByStatus,
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

  // Handler for launching tasks from chat commands
  const handleLaunchTask = useCallback(async (taskType: string, input: string) => {
    const task = await createTask({
      task_type: taskType as any,
      title: `${taskType}: ${input.slice(0, 40)}${input.length > 40 ? '...' : ''}`,
      description: input,
      input_data: { rawInput: input },
      assigned_member_id: leader?.id || null,
    });
    
    if (task) {
      // Auto-start the task
      await startTask(task.id);
      await addTaskLog(task.id, `${settings?.leader_name || 'Team Lead'} dispatched this task`);
      setActiveTab('tasks'); // Switch to tasks tab
    }
  }, [createTask, startTask, addTaskLog, leader, settings?.leader_name]);

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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-purple-600/30 border border-fuchsia-500/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
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
              {activeTasks.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-400 animate-pulse">
                  {activeTasks.length} Active
                </Badge>
              )}
              {queuedTasks.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-cyan-500/50 text-cyan-400">
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
            <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-fuchsia-500/20">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 data-[state=active]:bg-amber-500/20 relative">
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
              {activeTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] flex items-center justify-center text-black font-bold">
                  {activeTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2 data-[state=active]:bg-cyan-500/20">
              <Users2 className="w-4 h-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-purple-500/20">
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
              />
            </TabsContent>

            <TabsContent value="team" className="h-[calc(100vh-180px)] m-0">
              <AgencyTeamPanel
                members={members}
                tasks={tasks}
                leaderName={settings?.leader_name}
              />
            </TabsContent>

            <TabsContent value="settings" className="h-[calc(100vh-180px)] m-0">
              {isOwner ? (
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
                  <div className="text-center text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Only the agency owner can modify settings.</p>
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
