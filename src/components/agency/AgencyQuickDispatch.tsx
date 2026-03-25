/**
 * Agency Quick Dispatch — One-click task launching with ONLY executable tasks
 */

import { useState, useMemo } from 'react';
import { Rocket, Loader2, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  EXECUTABLE_TASKS, 
  getExecutableTasks, 
  getQuickLaunchTasks,
  getExecutableTasksByCategory,
  TASK_CATEGORIES,
  type ExecutableTask 
} from '@/lib/agency/executableTasks';
import type { Specialization } from '@/lib/agency/agencyTypes';

interface AgencyQuickDispatchProps {
  teamSpecs: Specialization[];
  onLaunchTask: (taskType: string, input: string) => Promise<void>;
  className?: string;
}

export function AgencyQuickDispatch({
  teamSpecs,
  onLaunchTask,
  className,
}: AgencyQuickDispatchProps) {
  const [customInput, setCustomInput] = useState('');
  const [selectedTask, setSelectedTask] = useState<ExecutableTask | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    research: true,
    seo: false,
    data: false,
    content: false,
    business: false,
  });

  const quickLaunchTasks = useMemo(() => getQuickLaunchTasks(), []);

  const handleQuickLaunch = async (task: ExecutableTask, defaultInput?: string) => {
    const input = defaultInput || customInput || `General ${task.name} task`;
    if (!input.trim()) return;

    setIsLaunching(true);
    try {
      await onLaunchTask(task.id, input);
      setCustomInput('');
      setSelectedTask(null);
    } finally {
      setIsLaunching(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Quick Launch - Top Tasks */}
      <Card className="border-border/30 bg-black/40">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-amber" />
            Quick Launch
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-auto border-neon-green/30 text-neon-green">
              {Object.keys(EXECUTABLE_TASKS).length} tasks
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {quickLaunchTasks.map(task => (
              <Button
                key={task.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTask(task);
                  setCustomInput('');
                }}
                disabled={isLaunching}
                className={cn(
                  "justify-start gap-1.5 sm:gap-2 h-8 sm:h-9 text-[10px] sm:text-xs px-2 sm:px-3",
                  selectedTask?.id === task.id 
                    ? "border-neon-magenta/50 bg-neon-magenta/10" 
                    : "hover:border-neon-magenta/50"
                )}
              >
                <span className="text-sm">{task.icon}</span>
                <span className="truncate">{task.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Task Input */}
      {selectedTask && (
        <Card className="border-neon-magenta/30 bg-neon-magenta/5">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedTask.icon}</span>
              <div>
                <p className="text-sm font-medium">{selectedTask.name}</p>
                <p className="text-[10px] text-muted-foreground">{selectedTask.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={selectedTask.inputPlaceholder}
                className="bg-black/30 text-xs h-8"
                onKeyDown={(e) => e.key === 'Enter' && handleQuickLaunch(selectedTask)}
                autoFocus
              />
              <Button
                onClick={() => handleQuickLaunch(selectedTask)}
                disabled={isLaunching || !customInput.trim()}
                size="sm"
                className="shrink-0 h-8 bg-gradient-to-r from-neon-magenta to-neon-purple"
              >
                {isLaunching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                ~{selectedTask.estimatedMinutes}min
              </Badge>
              <span>Handlers: {selectedTask.handlers.join(', ')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tasks by Category */}
      {Object.entries(TASK_CATEGORIES).map(([categoryKey, categoryMeta]) => {
        const tasks = getExecutableTasksByCategory(categoryKey as ExecutableTask['category']);
        if (tasks.length === 0) return null;

        return (
          <Collapsible 
            key={categoryKey} 
            open={expandedCategories[categoryKey]} 
            onOpenChange={() => toggleCategory(categoryKey)}
          >
            <Card className="border-border/30 bg-black/40 overflow-hidden">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2 px-3 pt-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="text-xs sm:text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{categoryMeta.icon}</span>
                      <span className={categoryMeta.color}>{categoryMeta.name}</span>
                      <Badge variant="outline" className="text-[9px] ml-1 px-1.5 py-0">
                        {tasks.length}
                      </Badge>
                    </div>
                    {expandedCategories[categoryKey] ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="px-3 pb-3">
                  <div className="grid grid-cols-1 gap-1">
                    {tasks.map(task => (
                      <Button
                        key={task.id}
                        variant={selectedTask?.id === task.id ? "default" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setCustomInput('');
                        }}
                        disabled={isLaunching}
                        className={cn(
                          "justify-start gap-2 h-auto py-1.5 px-2 text-left",
                          selectedTask?.id === task.id && "bg-neon-magenta/20 border-neon-magenta/50"
                        )}
                      >
                        <span className="text-base shrink-0">{task.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium truncate">{task.name}</div>
                          <div className="text-[9px] text-muted-foreground line-clamp-2">{task.description}</div>
                        </div>
                        <Badge variant="outline" className="text-[8px] px-1 py-0 shrink-0">
                          ~{task.estimatedMinutes}m
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
