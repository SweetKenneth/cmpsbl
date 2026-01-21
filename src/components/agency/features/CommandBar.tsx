/**
 * CommandBar — Cmd+K power user navigation and keyboard shortcuts
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  Search, Zap, FileText, BarChart3, Users, Settings,
  MessageSquare, Calendar, Moon, Play, Pause, RefreshCw,
  Keyboard, ArrowRight, Sparkles, Clock, Target, Shield
} from 'lucide-react';
import { TASK_TYPES, TaskTypeId } from '@/lib/agency/agencyTasks';
import { Specialization, SPECIALIZATIONS } from '@/lib/agency/agencyTypes';

// ============================================================================
// TYPES
// ============================================================================
export interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'navigation' | 'tasks' | 'agents' | 'settings' | 'quick';
  action: () => void;
  keywords?: string[];
}

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: CommandAction[];
  recentCommands?: string[];
  className?: string;
}

// ============================================================================
// KEYBOARD SHORTCUT HOOK
// ============================================================================
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Build shortcut string
      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push('cmd');
      if (e.shiftKey) parts.push('shift');
      if (e.altKey) parts.push('alt');
      parts.push(e.key.toLowerCase());
      
      const shortcut = parts.join('+');
      
      if (shortcuts[shortcut]) {
        e.preventDefault();
        shortcuts[shortcut]();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// ============================================================================
// COMMAND BAR TRIGGER
// ============================================================================
interface CommandTriggerProps {
  onClick: () => void;
  className?: string;
}

export function CommandTrigger({ onClick, className }: CommandTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'bg-muted/50 border border-border/50 backdrop-blur-sm',
        'text-sm text-muted-foreground',
        'hover:bg-accent hover:text-foreground transition-colors',
        className
      )}
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs bg-background px-1.5 py-0.5 rounded border border-border/50">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </button>
  );
}

// ============================================================================
// MAIN COMMAND BAR
// ============================================================================
export function CommandBar({
  open,
  onOpenChange,
  actions,
  recentCommands = [],
  className,
}: CommandBarProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Group actions by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {
      quick: [],
      navigation: [],
      tasks: [],
      agents: [],
      settings: [],
    };
    
    for (const action of actions) {
      if (groups[action.category]) {
        groups[action.category].push(action);
      }
    }
    
    return groups;
  }, [actions]);
  
  // Recent actions
  const recentActions = useMemo(() => {
    return actions.filter(a => recentCommands.includes(a.id)).slice(0, 3);
  }, [actions, recentCommands]);
  
  const handleSelect = useCallback((action: CommandAction) => {
    action.action();
    onOpenChange(false);
    setSearch('');
  }, [onOpenChange]);
  
  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);
  
  const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    quick: { label: 'Quick Actions', icon: <Zap className="w-3.5 h-3.5" /> },
    navigation: { label: 'Navigation', icon: <ArrowRight className="w-3.5 h-3.5" /> },
    tasks: { label: 'Launch Tasks', icon: <Play className="w-3.5 h-3.5" /> },
    agents: { label: 'Agents', icon: <Users className="w-3.5 h-3.5" /> },
    settings: { label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  };
  
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-xl border-border bg-card/95 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center border-b border-border/50 px-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <CommandInput
            ref={inputRef}
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="flex-1 border-0 focus:ring-0 bg-transparent"
          />
          <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            esc
          </kbd>
        </div>
        
        <CommandList className="max-h-[400px] overflow-y-auto">
          <CommandEmpty className="py-8 text-center">
            <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No commands found</p>
          </CommandEmpty>
          
          {/* Recent commands */}
          {recentActions.length > 0 && !search && (
            <>
              <CommandGroup heading="Recent">
                {recentActions.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => handleSelect(action)}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {action.icon}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{action.label}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          
          {/* Grouped actions */}
          {Object.entries(groupedActions).map(([category, categoryActions]) => {
            if (categoryActions.length === 0) return null;
            
            const { label, icon } = categoryLabels[category] || { label: category, icon: null };
            
            return (
              <CommandGroup key={category} heading={label}>
                {categoryActions.map((action) => (
                  <CommandItem
                    key={action.id}
                    onSelect={() => handleSelect(action)}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block">{action.label}</span>
                      {action.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {action.description}
                        </span>
                      )}
                    </div>
                    {action.shortcut && (
                      <CommandShortcut className="text-[10px]">
                        {action.shortcut}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> navigate
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Keyboard className="w-3 h-3" />
            Keyboard shortcuts
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}

// ============================================================================
// DEFAULT ACTIONS GENERATOR
// ============================================================================
export function generateDefaultActions(options: {
  onNavigate: (tab: string) => void;
  onLaunchTask: (type: TaskTypeId, input?: string) => void;
  onOpenSettings: () => void;
  onOpenDream: () => void;
  onStartLearning: () => void;
  teamSpecs: Specialization[];
  isOwner: boolean;
}): CommandAction[] {
  const actions: CommandAction[] = [];
  
  // Navigation
  actions.push(
    { id: 'nav_chat', label: 'Go to Chat', icon: <MessageSquare className="w-4 h-4" />, category: 'navigation', action: () => options.onNavigate('chat'), shortcut: '⌘1' },
    { id: 'nav_tasks', label: 'Go to Tasks', icon: <FileText className="w-4 h-4" />, category: 'navigation', action: () => options.onNavigate('tasks'), shortcut: '⌘2' },
    { id: 'nav_team', label: 'Go to Team', icon: <Users className="w-4 h-4" />, category: 'navigation', action: () => options.onNavigate('team'), shortcut: '⌘3' },
  );
  
  if (options.isOwner) {
    actions.push(
      { id: 'nav_telemetry', label: 'View Telemetry', icon: <BarChart3 className="w-4 h-4" />, category: 'navigation', action: () => options.onNavigate('telemetry'), shortcut: '⌘4' },
      { id: 'nav_settings', label: 'Open Settings', icon: <Settings className="w-4 h-4" />, category: 'navigation', action: () => options.onOpenSettings(), shortcut: '⌘,' },
      { id: 'nav_dream', label: 'Dream Learning', icon: <Moon className="w-4 h-4" />, category: 'navigation', action: () => options.onOpenDream() },
      { id: 'nav_scheduler', label: 'Task Scheduler', icon: <Calendar className="w-4 h-4" />, category: 'navigation', action: () => options.onNavigate('scheduler') },
    );
  }
  
  // Quick actions
  actions.push(
    { id: 'quick_research', label: 'Quick Research', description: 'Start a new research task', icon: <Search className="w-4 h-4" />, category: 'quick', action: () => options.onLaunchTask('research'), shortcut: '⌘R' },
    { id: 'quick_seo', label: 'SEO Scan', description: 'Analyze a website', icon: <Target className="w-4 h-4" />, category: 'quick', action: () => options.onLaunchTask('seo_scan') },
    { id: 'quick_audit', label: 'Code Audit', description: 'Run a code study', icon: <Shield className="w-4 h-4" />, category: 'quick', action: () => options.onLaunchTask('audit') },
  );
  
  // Task types
  Object.entries(TASK_TYPES).forEach(([typeId, config]) => {
    actions.push({
      id: `task_${typeId}`,
      label: config.name,
      description: config.description,
      icon: <span className="text-lg">{config.icon}</span>,
      category: 'tasks',
      action: () => options.onLaunchTask(typeId as TaskTypeId),
      keywords: [typeId, config.name.toLowerCase()],
    });
  });
  
  // Team learning
  if (options.isOwner) {
    actions.push({
      id: 'team_learning',
      label: 'Start Team Learning',
      description: 'Put idle agents into learning mode',
      icon: <Sparkles className="w-4 h-4" />,
      category: 'settings',
      action: options.onStartLearning,
    });
  }
  
  return actions;
}

// ============================================================================
// KEYBOARD SHORTCUT DISPLAY
// ============================================================================
export function ShortcutHints({ className }: { className?: string }) {
  const shortcuts = [
    { keys: '⌘ K', label: 'Command bar' },
    { keys: '⌘ 1-4', label: 'Navigate tabs' },
    { keys: '⌘ R', label: 'Quick research' },
    { keys: 'Esc', label: 'Close dialogs' },
  ];
  
  return (
    <div className={cn('flex flex-wrap gap-3 text-xs text-muted-foreground', className)}>
      {shortcuts.map(({ keys, label }) => (
        <div key={keys} className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
            {keys}
          </kbd>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
