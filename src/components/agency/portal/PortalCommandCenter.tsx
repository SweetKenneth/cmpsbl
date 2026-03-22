/**
 * Portal Command Center 2026
 * The main orchestration component integrating all portal features
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare, ListTodo, Users, BarChart3, Settings,
  Calendar, Sparkles, Activity, Command
} from 'lucide-react';

// Feature components
import { CommandBar, CommandTrigger, generateDefaultActions, useKeyboardShortcuts } from '../features/CommandBar';
import { SuggestionsPanel, QuickReplies } from '../features/SmartSuggestionsPanel';
import { ActivityFeed, LiveActivityDot, ActivityEvent } from '../features/ActivityFeed';
import { SchedulerWidget, ScheduledTask } from '../features/TaskScheduler';
import { AgentThinkingCard, CollaborativeThinking, ThinkingState } from '../features/ThinkingAnimations';
import { XPBar, LevelBadge } from '../features/GamificationWidgets';
import { SoundToggle, useSoundEffects } from '../features/SoundEffects';

// Portal components
import { PortalChatPanel } from './PortalChatPanel';
import { PortalTaskPanel } from './PortalTaskPanel';

// Types
import type { Agency, Specialization } from '@/lib/agency/agencyTypes';
import type { AgencyTask, TaskTypeId, AgencyTaskLog } from '@/lib/agency/agencyTasks';
import type { SmartSuggestion } from '@/lib/agency/smartSuggestions';
import { getLevelFromXP, AGENT_LEVELS } from '@/lib/agency/gamification';
import { getPersonality } from '@/lib/agency/agentPersonalities';

// ============================================================================
// TYPES
// ============================================================================
interface PortalCommandCenterProps {
  agency: Agency;
  tasks: AgencyTask[];
  taskLogs: AgencyTaskLog[];
  members: Array<{
    id: string;
    specialization: string;
    is_leader: boolean;
    skill_weights: Record<string, number>;
  }>;
  isOwner: boolean;
  isAuthenticated: boolean;
  leaderName?: string;
  onLaunchTask: (type: TaskTypeId, input?: string) => Promise<void>;
  onCancelTask: (taskId: string) => Promise<boolean | void>;
  onRetryTask: (taskId: string) => Promise<boolean | void>;
  onCancelAll: () => Promise<void>;
  onClearCompleted: () => Promise<void>;
  onNavigateTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenDream: () => void;
  onStartTeamLearning: () => Promise<void>;
  activeTab: string;
  className?: string;
}

// ============================================================================
// TAB CONFIGURATION
// ============================================================================
const TABS = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'scheduler', label: 'Schedule', icon: Calendar, ownerOnly: true },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function PortalCommandCenter({
  agency,
  tasks,
  taskLogs,
  members,
  isOwner,
  isAuthenticated,
  leaderName,
  onLaunchTask,
  onCancelTask,
  onRetryTask,
  onCancelAll,
  onClearCompleted,
  onNavigateTab,
  onOpenSettings,
  onOpenDream,
  onStartTeamLearning,
  activeTab,
  className,
}: PortalCommandCenterProps) {
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [showAchievement, setShowAchievement] = useState<{ title: string; description: string } | null>(null);
  const { play } = useSoundEffects();

  // Keyboard shortcuts
  const shortcuts = useMemo(() => ({
    'cmd+k': () => setCommandBarOpen(true),
    'cmd+1': () => onNavigateTab('chat'),
    'cmd+2': () => onNavigateTab('tasks'),
    'cmd+3': () => onNavigateTab('activity'),
    'cmd+4': () => isOwner && onNavigateTab('scheduler'),
    'cmd+r': () => isAuthenticated && onLaunchTask('research'),
  }), [onNavigateTab, onLaunchTask, isOwner, isAuthenticated]);

  useKeyboardShortcuts(shortcuts);

  // Command bar actions
  const commandActions = useMemo(() => generateDefaultActions({
    onNavigate: onNavigateTab,
    onLaunchTask,
    onOpenSettings,
    onOpenDream,
    onStartLearning: onStartTeamLearning,
    teamSpecs: members.map(m => m.specialization as Specialization),
    isOwner,
  }), [onNavigateTab, onLaunchTask, onOpenSettings, onOpenDream, onStartTeamLearning, members, isOwner]);

  // Generate activity events from tasks
  const activityEvents = useMemo<ActivityEvent[]>(() => {
    return tasks.slice(0, 20).map(task => {
      const member = members.find(m => m.id === task.assigned_member_id);
      return {
        id: task.id,
        type: task.status === 'completed' ? 'task_completed' 
          : task.status === 'failed' ? 'task_failed'
          : task.status === 'in_progress' ? 'task_started'
          : 'message' as ActivityEvent['type'],
        agentSpec: (member?.specialization || 'research') as Specialization,
        title: task.title,
        description: task.description || undefined,
        timestamp: new Date(task.updated_at),
      };
    });
  }, [tasks, members]);

  // Agent thinking states
  const agentStates = useMemo(() => {
    return members.map(member => {
      const memberTask = tasks.find(t => t.assigned_member_id === member.id && t.status === 'in_progress');
      let state: ThinkingState = 'idle';
      
      if (memberTask) {
        if (memberTask.task_type === 'research') state = 'researching';
        else if (memberTask.task_type === 'analysis') state = 'analyzing';
        else if (memberTask.task_type === 'content_creation') state = 'writing';
        else if (memberTask.task_type === 'idle_learning') state = 'learning';
        else state = 'processing';
      }
      
      return {
        specialization: member.specialization as Specialization,
        state,
        task: memberTask,
      };
    });
  }, [members, tasks]);

  // Play sounds on task completion
  useEffect(() => {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    const prevCompleted = (window as any).__prevCompletedCount || 0;
    
    if (completedCount > prevCompleted) {
      play('task_complete');
    }
    
    (window as any).__prevCompletedCount = completedCount;
  }, [tasks, play]);

  const activeTasks = tasks.filter(t => t.status === 'in_progress');
  const visibleTabs = TABS.filter(tab => !tab.ownerOnly || isOwner);

  // Suggestion handler - supports all action types
  const handleSuggestion = useCallback((suggestion: SmartSuggestion) => {
    switch (suggestion.actionType) {
      case 'task':
        onLaunchTask(suggestion.actionPayload.taskType, suggestion.actionPayload.input);
        break;
      case 'workflow':
        // Trigger workflow via task launch with workflow context
        onLaunchTask('research', `Workflow: ${suggestion.actionPayload.workflowId}`);
        break;
      case 'command':
        // Navigate to chat tab for command execution
        onNavigateTab('chat');
        break;
      case 'setting':
        // Open settings or navigate to the specific tab
        if (suggestion.actionPayload.tab === 'settings') {
          onOpenSettings();
        } else if (suggestion.actionPayload.tab === 'tasks') {
          onNavigateTab('tasks');
        } else {
          onNavigateTab(suggestion.actionPayload.tab || 'chat');
        }
        break;
    }
  }, [onLaunchTask, onNavigateTab, onOpenSettings]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="hidden sm:flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
            {visibleTabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onNavigateTab(tab.id)}
                className={cn(
                  'gap-1.5 h-8 px-3 text-xs',
                  activeTab === tab.id && 'bg-background shadow-sm'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === 'tasks' && activeTasks.length > 0 && (
                  <Badge className="h-4 px-1 text-[10px] bg-neon-amber text-black ml-0.5">
                    {activeTasks.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active agents indicator */}
          <CollaborativeThinking
            agents={agentStates}
            className="hidden md:flex"
          />
          
          {/* Live indicator */}
          <LiveActivityDot active={activeTasks.length > 0} />
          
          {/* Sound toggle */}
          <SoundToggle />
          
          {/* Command bar trigger */}
          <CommandTrigger onClick={() => setCommandBarOpen(true)} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Primary Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} className="flex-1 flex flex-col">
            <TabsContent value="chat" className="flex-1 m-0 data-[state=inactive]:hidden">
              <PortalChatPanel agency={agency} />
            </TabsContent>

            <TabsContent value="tasks" className="flex-1 m-0 data-[state=inactive]:hidden">
              <PortalTaskPanel
                tasks={tasks}
                logs={taskLogs}
                members={members.map(m => ({
                  id: m.id,
                  specialization: m.specialization,
                  is_leader: m.is_leader,
                }))}
                isOwner={isAuthenticated && isOwner}
                onCancelTask={onCancelTask}
                onRetryTask={onRetryTask}
                onCancelAll={onCancelAll}
                onClearCompleted={onClearCompleted}
              />
            </TabsContent>

            <TabsContent value="activity" className="flex-1 m-0 data-[state=inactive]:hidden overflow-auto">
              <div className="p-4 space-y-6">
                {/* Agent Status Cards */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Agent Status
                  </h3>
                  <div className="grid gap-2">
                    {agentStates.map(agent => (
                      <AgentThinkingCard
                        key={agent.specialization}
                        specialization={agent.specialization}
                        state={agent.state}
                        currentAction={agent.task?.title}
                        progress={agent.task?.progress || undefined}
                      />
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                {isAuthenticated && (
                  <SuggestionsPanel
                    recentTasks={tasks}
                    teamSpecs={members.map(m => m.specialization as Specialization)}
                    onAction={handleSuggestion}
                  />
                )}

                {/* Activity Feed */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Activity
                  </h3>
                  <ActivityFeed events={activityEvents} maxItems={15} />
                </div>
              </div>
            </TabsContent>

            {isOwner && (
              <TabsContent value="scheduler" className="flex-1 m-0 data-[state=inactive]:hidden">
                <div className="p-4 text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Task Scheduler</h3>
                  <p className="text-sm">
                    Schedule recurring tasks from the Settings panel
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right Sidebar - Gamification (Desktop only) */}
        <aside className="hidden xl:flex flex-col w-72 border-l border-border/30 bg-card/20">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* Agency XP */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">
                  Agency Progress
                </h4>
                <XPBar xp={tasks.filter(t => t.status === 'completed').length * 100} />
              </div>

              {/* Agent Levels */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">
                  Agent Progress
                </h4>
                {members.slice(0, 4).map(member => {
                  const memberTasks = tasks.filter(t => t.assigned_member_id === member.id && t.status === 'completed').length;
                  const xp = memberTasks * 100;
                  const level = getLevelFromXP(xp);
                  const personality = getPersonality(member.specialization as Specialization);
                  
                  return (
                    <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <span className="text-lg">{personality.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{personality.name}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{level.badge}</span>
                          <span>Lv.{level.level}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              {isAuthenticated && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">
                    Quick Launch
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 flex-col gap-1"
                      onClick={() => onLaunchTask('research')}
                    >
                      <span>🔍</span>
                      <span className="text-[10px]">Research</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 flex-col gap-1"
                      onClick={() => onLaunchTask('seo_scan')}
                    >
                      <span>📊</span>
                      <span className="text-[10px]">SEO Scan</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Command Bar */}
      <CommandBar
        open={commandBarOpen}
        onOpenChange={setCommandBarOpen}
        actions={commandActions}
      />
    </div>
  );
}
