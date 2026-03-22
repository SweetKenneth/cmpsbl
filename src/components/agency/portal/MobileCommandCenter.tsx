/**
 * Mobile Command Center 2026
 * Mobile-first unified portal experience with swipe navigation and bottom sheet patterns
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  MessageSquare, ListTodo, Users, BarChart3, Settings,
  Calendar, Activity, Command, Menu, X, ChevronUp,
  Sparkles, Volume2, VolumeX, Zap
} from 'lucide-react';

// Feature components
import { CommandBar, generateDefaultActions, useKeyboardShortcuts } from '../features/CommandBar';
import { SuggestionsPanel, QuickReplies } from '../features/SmartSuggestionsPanel';
import { ActivityFeed, LiveActivityDot, ActivityEvent } from '../features/ActivityFeed';
import { AgentThinkingCard, CollaborativeThinking, ThinkingState } from '../features/ThinkingAnimations';
import { XPBar, LevelBadge } from '../features/GamificationWidgets';
import { useSoundEffects } from '../features/SoundEffects';

// Portal components
import { PortalChatPanel } from './PortalChatPanel';
import { PortalTaskPanel } from './PortalTaskPanel';
import { AgentAvatar } from '../features/AgentAvatar';
import { AgencySwitcher } from './AgencySwitcher';

// Types
import type { Agency, Specialization } from '@/lib/agency/agencyTypes';
import type { AgencyTask, TaskTypeId, AgencyTaskLog } from '@/lib/agency/agencyTasks';
import type { SmartSuggestion } from '@/lib/agency/smartSuggestions';
import type { UserAgency } from '@/hooks/useUserAgency';
import { getLevelFromXP } from '@/lib/agency/gamification';
import { getPersonality } from '@/lib/agency/agentPersonalities';

// ============================================================================
// TYPES
// ============================================================================
interface MobileCommandCenterProps {
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
  userAgencies?: UserAgency[];
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
  { id: 'team', label: 'Team', icon: Users, ownerOnly: false },
];

// ============================================================================
// MOBILE TAB BAR
// ============================================================================
function MobileTabBar({
  activeTab,
  onTabChange,
  activeTaskCount,
  isOwner,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeTaskCount: number;
  isOwner: boolean;
}) {
  const visibleTabs = TABS.filter(tab => !tab.ownerOnly || isOwner);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 bg-card/95 backdrop-blur-xl safe-area-pb">
      <div className="flex items-stretch justify-around h-14">
        {visibleTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const showBadge = tab.id === 'tasks' && activeTaskCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 relative",
                "transition-all duration-200 active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-neon-amber text-[9px] flex items-center justify-center text-black font-bold">
                    {activeTaskCount > 9 ? '9+' : activeTaskCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================================
// MOBILE HEADER
// ============================================================================
function MobileHeader({
  agency,
  activeTasks,
  soundEnabled,
  isOwner,
  userAgencies,
  onToggleSound,
  onOpenMenu,
  onOpenCommand,
}: {
  agency: Agency;
  activeTasks: number;
  soundEnabled: boolean;
  isOwner: boolean;
  userAgencies: UserAgency[];
  onToggleSound: () => void;
  onOpenMenu: () => void;
  onOpenCommand: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-card/95 backdrop-blur-xl safe-area-pt">
      <div className="flex items-center justify-between h-12 px-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 -ml-1"
          onClick={onOpenMenu}
        >
          <Menu className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <AgencySwitcher
            agencies={userAgencies}
            currentAgencyId={agency.id}
            currentAgencyName={agency.name}
            isOwner={isOwner}
          />
          <LiveActivityDot active={activeTasks > 0} className="scale-90" />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleSound}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-1"
            onClick={onOpenCommand}
          >
            <Command className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// TEAM QUICK VIEW (Bottom Sheet Content)
// ============================================================================
function TeamQuickView({
  members,
  tasks,
  onStartLearning,
  isOwner,
}: {
  members: MobileCommandCenterProps['members'];
  tasks: AgencyTask[];
  onStartLearning: () => Promise<void>;
  isOwner: boolean;
}) {
  const agentStates = useMemo(() => {
    return members.map(member => {
      const memberTask = tasks.find(t => t.assigned_member_id === member.id && t.status === 'in_progress');
      const completedCount = tasks.filter(t => t.assigned_member_id === member.id && t.status === 'completed').length;
      let state: ThinkingState = 'idle';
      
      if (memberTask) {
        if (memberTask.task_type === 'research') state = 'researching';
        else if (memberTask.task_type === 'analysis') state = 'analyzing';
        else if (memberTask.task_type === 'content_creation') state = 'writing';
        else if (memberTask.task_type === 'idle_learning') state = 'learning';
        else state = 'processing';
      }
      
      return { member, state, task: memberTask, completedCount };
    });
  }, [members, tasks]);

  return (
    <div className="space-y-4">
      {/* Agent Grid */}
      <div className="grid grid-cols-2 gap-2">
        {agentStates.map(({ member, state, task, completedCount }) => {
          const personality = getPersonality(member.specialization as Specialization);
          const xp = completedCount * 100;
          const level = getLevelFromXP(xp);
          
          return (
            <div
              key={member.id}
              className={cn(
                "p-3 rounded-xl border bg-card/50",
                state !== 'idle' && "border-primary/30 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
              <AgentAvatar
                  specialization={member.specialization as Specialization}
                  state={state === 'idle' ? 'idle' : 'working'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium truncate">{personality.name}</span>
                    {member.is_leader && (
                      <span className="text-[10px]">👑</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span>{level.badge}</span>
                    <span>Lv.{level.level}</span>
                  </div>
                </div>
              </div>
              
              {state !== 'idle' && task && (
                <div className="text-[10px] text-muted-foreground truncate">
                  {task.title}
                </div>
              )}
              
              {state === 'idle' && (
                <div className="text-[10px] text-muted-foreground">
                  {completedCount} tasks completed
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {isOwner && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onStartLearning}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Start Team Learning
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function MobileCommandCenter({
  agency,
  tasks,
  taskLogs,
  members,
  isOwner,
  isAuthenticated,
  leaderName,
  userAgencies = [],
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
}: MobileCommandCenterProps) {
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [teamSheetOpen, setTeamSheetOpen] = useState(false);
  const { play, enabled, toggle } = useSoundEffects();

  // Keyboard shortcuts (still work if connected to keyboard)
  const shortcuts = useMemo(() => ({
    'cmd+k': () => setCommandBarOpen(true),
    'cmd+1': () => onNavigateTab('chat'),
    'cmd+2': () => onNavigateTab('tasks'),
    'cmd+3': () => onNavigateTab('activity'),
  }), [onNavigateTab]);

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
      
      return { specialization: member.specialization as Specialization, state, task: memberTask };
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
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Mobile Header */}
      <MobileHeader
        agency={agency}
        activeTasks={activeTasks.length}
        soundEnabled={enabled}
        isOwner={isOwner}
        userAgencies={userAgencies}
        onToggleSound={toggle}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenCommand={() => setCommandBarOpen(true)}
      />

      {/* Main Content with bottom padding for tab bar */}
      <main className="flex-1 overflow-hidden pb-14">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full"
            >
              <PortalChatPanel agency={agency} />
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full"
            >
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
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full overflow-auto"
            >
              <div className="p-4 space-y-4">
                {/* Active Agents Row */}
                {activeTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Working Now
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                      {agentStates.filter(a => a.state !== 'idle').map(agent => (
                        <AgentThinkingCard
                          key={agent.specialization}
                          specialization={agent.specialization}
                          state={agent.state}
                          currentAction={agent.task?.title}
                          progress={agent.task?.progress || undefined}
                          className="min-w-[200px] flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {isAuthenticated && (
                  <SuggestionsPanel
                    recentTasks={tasks}
                    teamSpecs={members.map(m => m.specialization as Specialization)}
                    onAction={handleSuggestion}
                    maxSuggestions={2}
                    className="[&>div]:gap-2"
                  />
                )}

                {/* Activity Feed */}
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Recent Activity
                  </h3>
                  <ActivityFeed events={activityEvents} maxItems={10} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="h-full overflow-auto"
            >
              <div className="p-4">
                <TeamQuickView
                  members={members}
                  tasks={tasks}
                  onStartLearning={onStartTeamLearning}
                  isOwner={isOwner}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={onNavigateTab}
        activeTaskCount={activeTasks.length}
        isOwner={isOwner}
      />

      {/* Menu Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="p-4 border-b border-border/30">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              {agency.name}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Agency Stats */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">
                  Progress
                </h4>
                <XPBar xp={tasks.filter(t => t.status === 'completed').length * 100} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xl font-bold">{members.length}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Agents</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Completed</div>
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase">
                    Controls
                  </h4>
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenSettings();
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenDream();
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Dream Learning
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Command Bar */}
      <CommandBar
        open={commandBarOpen}
        onOpenChange={setCommandBarOpen}
        actions={commandActions}
      />
    </div>
  );
}
