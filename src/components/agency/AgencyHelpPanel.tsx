/**
 * Agency Help Panel — Standalone help overlay for agency commands
 */

import { X, Command, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  getCommandsByCategory, 
  CATEGORY_INFO,
  type QuickCommand 
} from '@/lib/agency/agencyCommands';
import type { Specialization } from '@/lib/agency/agencyTypes';

interface AgencyHelpPanelProps {
  commands: QuickCommand[];
  teamSpecs: Specialization[];
  onClose: () => void;
  onSelectCommand: (command: QuickCommand) => void;
}

export function AgencyHelpPanel({ 
  commands, 
  teamSpecs, 
  onClose, 
  onSelectCommand 
}: AgencyHelpPanelProps) {
  const commandsByCategory = getCommandsByCategory(commands);

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
              <h2 className="text-lg font-semibold">Quick Commands</h2>
              <p className="text-xs text-muted-foreground">
                Based on your team's {teamSpecs.length} specializations
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
            Your Team Capabilities
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

        {/* Command Categories */}
        <div className="space-y-8">
          {Object.entries(commandsByCategory).map(([category, cmds]) => (
            <div key={category}>
              <h3 className={cn(
                "text-sm font-medium mb-4 flex items-center gap-2",
                CATEGORY_INFO[category]?.color || 'text-foreground'
              )}>
                <Zap className="w-4 h-4" />
                {CATEGORY_INFO[category]?.label || category}
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  {cmds.length} commands
                </Badge>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {cmds.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      onClose();
                      onSelectCommand(cmd);
                    }}
                    className="text-left p-4 rounded-lg bg-muted/10 border border-border/30 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{cmd.icon}</span>
                      <code className="text-xs bg-black/40 px-2 py-1 rounded text-fuchsia-400 font-mono group-hover:bg-fuchsia-500/20 transition-colors">
                        {cmd.command}
                      </code>
                    </div>
                    <p className="font-medium text-sm mb-1">{cmd.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {cmd.description}
                    </p>
                    {cmd.requiredSpecs && cmd.requiredSpecs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cmd.requiredSpecs.slice(0, 3).map((spec, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="text-[9px] h-4 px-1.5 border-border/50"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-8 p-4 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-sm">
            <strong className="text-cyan-400">Pro tip:</strong> Type{' '}
            <code className="bg-black/40 px-1.5 py-0.5 rounded text-fuchsia-400">/</code>{' '}
            in the chat to see command suggestions, or just type your message naturally — your team lead will coordinate the response.
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
