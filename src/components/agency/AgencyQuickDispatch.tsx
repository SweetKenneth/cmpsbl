/**
 * Agency Quick Dispatch — One-click task launching buttons
 */

import { useState } from 'react';
import { Rocket, Loader2, Zap, Search, BarChart2, FileText, Code, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TASK_TYPES, type TaskTypeId, DEFAULT_PRESET_COMMANDS, type PresetCommand } from '@/lib/agency/agencyTasks';
import type { Specialization } from '@/lib/agency/agencyTypes';

interface AgencyQuickDispatchProps {
  teamSpecs: Specialization[];
  onLaunchTask: (taskType: TaskTypeId, input: string) => Promise<void>;
  presets?: PresetCommand[];
  className?: string;
}

const TASK_ICONS: Record<string, React.ReactNode> = {
  research: <Search className="w-4 h-4" />,
  seo_scan: <BarChart2 className="w-4 h-4" />,
  content_creation: <FileText className="w-4 h-4" />,
  code_study: <Code className="w-4 h-4" />,
  company_research: <Building2 className="w-4 h-4" />,
  analysis: <BarChart2 className="w-4 h-4" />,
  audit: <Search className="w-4 h-4" />,
};

export function AgencyQuickDispatch({
  teamSpecs,
  onLaunchTask,
  presets = DEFAULT_PRESET_COMMANDS,
  className,
}: AgencyQuickDispatchProps) {
  const [customInput, setCustomInput] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskTypeId | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  // Filter task types that team can handle
  const availableTaskTypes = Object.entries(TASK_TYPES)
    .filter(([id, type]) => {
      if (id === 'idle_learning') return false;
      if (type.specializations.length === 0) return true;
      return type.specializations.some(spec => teamSpecs.includes(spec));
    })
    .map(([id, type]) => ({ id: id as TaskTypeId, ...type }));

  const handleQuickLaunch = async (taskType: TaskTypeId, defaultInput?: string) => {
    const input = defaultInput || customInput || `General ${TASK_TYPES[taskType].name} task`;
    if (!input.trim()) return;

    setIsLaunching(true);
    try {
      await onLaunchTask(taskType, input);
      setCustomInput('');
      setSelectedTask(null);
    } finally {
      setIsLaunching(false);
    }
  };

  const handlePresetLaunch = async (preset: PresetCommand) => {
    // Map preset commands to task types
    const commandMap: Record<string, TaskTypeId> = {
      '/research': 'research',
      '/seo': 'seo_scan',
      '/code': 'code_study',
      '/intel': 'company_research',
      '/write': 'content_creation',
      '/analyze': 'analysis',
      '/audit': 'audit',
    };

    const taskType = commandMap[preset.command];
    if (taskType) {
      await handleQuickLaunch(taskType, preset.description);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quick Presets */}
      <Card className="border-border/30 bg-black/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Quick Launch Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {presets.slice(0, 4).map(preset => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => handlePresetLaunch(preset)}
                disabled={isLaunching}
                className="justify-start gap-2 h-9 text-xs hover:border-fuchsia-500/50"
              >
                <span>{preset.icon || '⚡'}</span>
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Task Launch */}
      <Card className="border-border/30 bg-black/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Rocket className="w-4 h-4 text-fuchsia-400" />
            Dispatch Custom Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Task Type Selection */}
          <div className="flex flex-wrap gap-1.5">
            {availableTaskTypes.map(taskType => (
              <Badge
                key={taskType.id}
                variant={selectedTask === taskType.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all text-[10px] gap-1",
                  selectedTask === taskType.id
                    ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400"
                    : "hover:border-fuchsia-500/30"
                )}
                onClick={() => setSelectedTask(taskType.id)}
              >
                {TASK_ICONS[taskType.id] || <Zap className="w-3 h-3" />}
                {taskType.name}
              </Badge>
            ))}
          </div>

          {/* Input & Launch */}
          {selectedTask && (
            <div className="flex gap-2">
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={`Describe the ${TASK_TYPES[selectedTask].name.toLowerCase()} task...`}
                className="bg-black/30 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleQuickLaunch(selectedTask)}
              />
              <Button
                onClick={() => handleQuickLaunch(selectedTask)}
                disabled={isLaunching || !customInput.trim()}
                className="shrink-0 bg-gradient-to-r from-fuchsia-600 to-purple-600"
              >
                {isLaunching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}

          {!selectedTask && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Select a task type above to dispatch
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
