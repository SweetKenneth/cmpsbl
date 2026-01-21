/**
 * Agency Quick Dispatch — One-click task launching with specialty skills and team tasks
 */

import { useState, useMemo } from 'react';
import { Rocket, Loader2, Zap, Search, BarChart2, FileText, Code, Building2, Users2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { TASK_TYPES, type TaskTypeId, DEFAULT_PRESET_COMMANDS, type PresetCommand } from '@/lib/agency/agencyTasks';
import { SPECIALTY_SKILLS, TEAM_TASKS, getAvailableTeamTasks, type TeamTask } from '@/lib/agency/specialtySkills';
import type { Specialization } from '@/lib/agency/agencyTypes';

interface AgencyQuickDispatchProps {
  teamSpecs: Specialization[];
  onLaunchTask: (taskType: TaskTypeId, input: string) => Promise<void>;
  onLaunchTeamTask?: (teamTaskId: string, input: string) => Promise<void>;
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
  onLaunchTeamTask,
  presets = DEFAULT_PRESET_COMMANDS,
  className,
}: AgencyQuickDispatchProps) {
  const [customInput, setCustomInput] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskTypeId | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedTeamTask, setSelectedTeamTask] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [specialtyOpen, setSpecialtyOpen] = useState(true);
  const [teamTasksOpen, setTeamTasksOpen] = useState(true);

  // Get specialty skills available for this team
  const availableSpecialtySkills = useMemo(() => {
    return teamSpecs
      .map(spec => SPECIALTY_SKILLS[spec])
      .filter(Boolean);
  }, [teamSpecs]);

  // Get available team tasks based on team composition
  const availableTeamTasks = useMemo(() => {
    return getAvailableTeamTasks(teamSpecs);
  }, [teamSpecs]);

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
      setSelectedSpecialty(null);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleSpecialtyLaunch = async (skillId: string) => {
    const skill = Object.values(SPECIALTY_SKILLS).find(s => s.id === skillId);
    if (!skill) return;

    const input = customInput || `${skill.name}: ${skill.description}`;
    setIsLaunching(true);
    try {
      await onLaunchTask(skill.taskType, input);
      setCustomInput('');
      setSelectedSpecialty(null);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleTeamTaskLaunch = async (taskId: string) => {
    const task = TEAM_TASKS.find(t => t.id === taskId);
    if (!task) return;

    const input = customInput || `${task.name}: ${task.description}`;
    setIsLaunching(true);
    try {
      if (onLaunchTeamTask) {
        await onLaunchTeamTask(taskId, input);
      } else {
        // Fallback: launch the first step's task type
        const firstStep = task.steps[0];
        if (firstStep) {
          await onLaunchTask(firstStep.taskType, input);
        }
      }
      setCustomInput('');
      setSelectedTeamTask(null);
    } finally {
      setIsLaunching(false);
    }
  };

  const handlePresetLaunch = async (preset: PresetCommand) => {
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
    <div className={cn("space-y-3", className)}>
      {/* Quick Presets */}
      <Card className="border-border/30 bg-black/40">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            Quick Launch
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {presets.slice(0, 4).map(preset => (
              <Button
                key={preset.id}
                variant="outline"
                size="sm"
                onClick={() => handlePresetLaunch(preset)}
                disabled={isLaunching}
                className="justify-start gap-1.5 sm:gap-2 h-8 sm:h-9 text-[10px] sm:text-xs hover:border-fuchsia-500/50 px-2 sm:px-3"
              >
                <span className="text-sm">{preset.icon || '⚡'}</span>
                <span className="truncate">{preset.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specialty Skills */}
      {availableSpecialtySkills.length > 0 && (
        <Collapsible open={specialtyOpen} onOpenChange={setSpecialtyOpen}>
          <Card className="border-border/30 bg-black/40 overflow-hidden">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 px-3 pt-3 cursor-pointer hover:bg-white/5 transition-colors">
                <CardTitle className="text-xs sm:text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                    Specialty Skills
                    <Badge variant="outline" className="text-[9px] ml-1 px-1.5 py-0 border-purple-500/30 text-purple-400">
                      Unique
                    </Badge>
                  </div>
                  {specialtyOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-1 gap-1.5">
                  {availableSpecialtySkills.map(skill => (
                    <Button
                      key={skill.id}
                      variant={selectedSpecialty === skill.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedSpecialty === skill.id) {
                          handleSpecialtyLaunch(skill.id);
                        } else {
                          setSelectedSpecialty(skill.id);
                          setSelectedTeamTask(null);
                          setSelectedTask(null);
                        }
                      }}
                      disabled={isLaunching}
                      className={cn(
                        "justify-start gap-2 h-auto py-2 px-3 text-left",
                        selectedSpecialty === skill.id
                          ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                          : "hover:border-purple-500/30"
                      )}
                    >
                      <span className="text-base shrink-0">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-xs font-medium truncate">{skill.name}</div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{skill.description}</div>
                      </div>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 shrink-0 border-purple-500/20">
                        ~{skill.estimatedMinutes}m
                      </Badge>
                    </Button>
                  ))}
                </div>

                {selectedSpecialty && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder={SPECIALTY_SKILLS[teamSpecs.find(s => SPECIALTY_SKILLS[s]?.id === selectedSpecialty) as Specialization]?.inputPlaceholder || 'Enter details...'}
                      className="bg-black/30 text-xs h-8"
                      onKeyDown={(e) => e.key === 'Enter' && handleSpecialtyLaunch(selectedSpecialty)}
                    />
                    <Button
                      onClick={() => handleSpecialtyLaunch(selectedSpecialty)}
                      disabled={isLaunching}
                      size="sm"
                      className="shrink-0 h-8 bg-gradient-to-r from-purple-600 to-fuchsia-600"
                    >
                      {isLaunching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Team Tasks */}
      {availableTeamTasks.length > 0 && (
        <Collapsible open={teamTasksOpen} onOpenChange={setTeamTasksOpen}>
          <Card className="border-border/30 bg-black/40 overflow-hidden">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 px-3 pt-3 cursor-pointer hover:bg-white/5 transition-colors">
                <CardTitle className="text-xs sm:text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                    Team Missions
                    <Badge variant="outline" className="text-[9px] ml-1 px-1.5 py-0 border-cyan-500/30 text-cyan-400">
                      Multi-Agent
                    </Badge>
                  </div>
                  {teamTasksOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-1 gap-1.5">
                  {availableTeamTasks.map(task => (
                    <Button
                      key={task.id}
                      variant={selectedTeamTask === task.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedTeamTask === task.id) {
                          handleTeamTaskLaunch(task.id);
                        } else {
                          setSelectedTeamTask(task.id);
                          setSelectedSpecialty(null);
                          setSelectedTask(null);
                        }
                      }}
                      disabled={isLaunching}
                      className={cn(
                        "justify-start gap-2 h-auto py-2 px-3 text-left",
                        selectedTeamTask === task.id
                          ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                          : "hover:border-cyan-500/30"
                      )}
                    >
                      <span className="text-base shrink-0">{task.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-xs font-medium truncate">{task.name}</div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{task.description}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.requiredSpecs.slice(0, 3).map(spec => (
                            <Badge
                              key={spec}
                              variant="outline"
                              className={cn(
                                "text-[8px] px-1 py-0",
                                teamSpecs.includes(spec) ? "border-emerald-500/30 text-emerald-400" : "border-muted/30 text-muted-foreground"
                              )}
                            >
                              {spec}
                            </Badge>
                          ))}
                          {task.requiredSpecs.length > 3 && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0">
                              +{task.requiredSpecs.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] px-1 py-0 shrink-0 border-cyan-500/20">
                        ~{task.estimatedMinutes}m
                      </Badge>
                    </Button>
                  ))}
                </div>

                {selectedTeamTask && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter target company, domain, or topic..."
                      className="bg-black/30 text-xs h-8"
                      onKeyDown={(e) => e.key === 'Enter' && handleTeamTaskLaunch(selectedTeamTask)}
                    />
                    <Button
                      onClick={() => handleTeamTaskLaunch(selectedTeamTask)}
                      disabled={isLaunching}
                      size="sm"
                      className="shrink-0 h-8 bg-gradient-to-r from-cyan-600 to-blue-600"
                    >
                      {isLaunching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users2 className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Custom Task Launch */}
      <Card className="border-border/30 bg-black/40">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
            <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-400" />
            Custom Task
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          {/* Task Type Selection */}
          <div className="flex flex-wrap gap-1">
            {availableTaskTypes.map(taskType => (
              <Badge
                key={taskType.id}
                variant={selectedTask === taskType.id ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all text-[9px] sm:text-[10px] gap-1 py-0.5",
                  selectedTask === taskType.id
                    ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-400"
                    : "hover:border-fuchsia-500/30"
                )}
                onClick={() => {
                  setSelectedTask(taskType.id);
                  setSelectedSpecialty(null);
                  setSelectedTeamTask(null);
                }}
              >
                {TASK_ICONS[taskType.id] || <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                <span className="hidden sm:inline">{taskType.name}</span>
                <span className="sm:hidden">{taskType.name.split(' ')[0]}</span>
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
                className="bg-black/30 text-xs h-8"
                onKeyDown={(e) => e.key === 'Enter' && handleQuickLaunch(selectedTask)}
              />
              <Button
                onClick={() => handleQuickLaunch(selectedTask)}
                disabled={isLaunching || !customInput.trim()}
                size="sm"
                className="shrink-0 h-8 bg-gradient-to-r from-fuchsia-600 to-purple-600"
              >
                {isLaunching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Rocket className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          )}

          {!selectedTask && (
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center py-1">
              Select a task type above to dispatch
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
