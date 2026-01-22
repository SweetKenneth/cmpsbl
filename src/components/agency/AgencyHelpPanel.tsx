/**
 * Agency Help Panel — Shows ONLY executable capabilities
 */

import { X, Command, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  getExecutableTasks,
  getExecutableTasksByCategory,
  TASK_CATEGORIES,
  type ExecutableTask 
} from '@/lib/agency/executableTasks';
import type { Specialization } from '@/lib/agency/agencyTypes';

interface AgencyHelpPanelProps {
  teamSpecs: Specialization[];
  onClose: () => void;
  onSelectTask: (task: ExecutableTask) => void;
}

export function AgencyHelpPanel({ 
  teamSpecs, 
  onClose, 
  onSelectTask 
}: AgencyHelpPanelProps) {
  const allTasks = getExecutableTasks();

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 overflow-auto">
      <div className="p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-purple-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Command className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Agency Capabilities</h2>
              <p className="text-xs text-muted-foreground">
                {allTasks.length} executable tasks • All verified working
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Team Specializations */}
        <div className="mb-6 p-4 bg-muted/10 border border-border/30 rounded-lg">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Your Team ({teamSpecs.length} agents)
          </h3>
          <div className="flex flex-wrap gap-2">
            {teamSpecs.map((spec, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="text-xs border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
              >
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        {/* Executable Status Banner */}
        <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-400">All Tasks Are Executable</p>
            <p className="text-xs text-muted-foreground">
              Every task listed below has a working backend handler and will produce real results.
            </p>
          </div>
        </div>

        {/* Tasks by Category */}
        <div className="space-y-8">
          {Object.entries(TASK_CATEGORIES).map(([categoryKey, categoryMeta]) => {
            const tasks = getExecutableTasksByCategory(categoryKey as ExecutableTask['category']);
            if (tasks.length === 0) return null;

            return (
              <div key={categoryKey}>
                <h3 className={cn(
                  "text-sm font-medium mb-4 flex items-center gap-2",
                  categoryMeta.color
                )}>
                  <span className="text-lg">{categoryMeta.icon}</span>
                  {categoryMeta.name}
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    {tasks.length} tasks
                  </Badge>
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        onClose();
                        onSelectTask(task);
                      }}
                      className="text-left p-4 rounded-lg bg-muted/10 border border-border/30 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{task.icon}</span>
                        <span className="font-medium text-sm">{task.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          ~{task.estimatedMinutes}min
                        </Badge>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-500/30 text-emerald-400">
                          ✓ Executable
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* What We CAN'T Do */}
        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <h3 className="text-sm font-medium mb-2 text-amber-400">Current Limitations</h3>
          <p className="text-xs text-muted-foreground mb-2">
            The following require additional integrations:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Account creation</strong> - Cannot create accounts on external sites</li>
            <li>• <strong>Email sending</strong> - Cannot send emails directly (drafts only)</li>
            <li>• <strong>Form submissions</strong> - Cannot submit forms on external sites</li>
            <li>• <strong>Social media posting</strong> - Cannot post directly (content only)</li>
            <li>• <strong>File uploads</strong> - Cannot upload to external services</li>
          </ul>
        </div>

        {/* Tip */}
        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-sm">
            <strong className="text-cyan-400">Pro tip:</strong> Talk to your Team Leader naturally — 
            they'll delegate tasks to the right agents and queue them for execution.
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <Button onClick={onClose} variant="outline" className="gap-2">
            <X className="w-4 h-4" />
            Close Help
          </Button>
        </div>
      </div>
    </div>
  );
}
