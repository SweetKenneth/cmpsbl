/**
 * Agency Command Palette — Dropdown for quick command selection
 */

import { useEffect, useRef } from 'react';
import { Command, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORY_INFO, type QuickCommand } from '@/lib/agency/agencyCommands';

interface AgencyCommandPaletteProps {
  commands: QuickCommand[];
  onSelect: (command: QuickCommand) => void;
  onClose: () => void;
  filter?: string;
}

export function AgencyCommandPalette({ 
  commands, 
  onSelect, 
  onClose, 
  filter = '' 
}: AgencyCommandPaletteProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter commands based on input
  const filtered = commands.filter(cmd => {
    if (!filter) return true;
    const search = filter.toLowerCase();
    return (
      cmd.command.toLowerCase().includes(search) ||
      cmd.label.toLowerCase().includes(search) ||
      cmd.category.toLowerCase().includes(search)
    );
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (filtered.length === 0) {
    return (
      <div 
        ref={containerRef}
        className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-black/95 border border-border/30 rounded-lg p-4 shadow-xl"
      >
        <p className="text-sm text-muted-foreground text-center">
          No commands match "{filter}"
        </p>
      </div>
    );
  }

  // Group by category for display
  const grouped: Record<string, QuickCommand[]> = {};
  for (const cmd of filtered.slice(0, 10)) { // Limit to 10 suggestions
    if (!grouped[cmd.category]) {
      grouped[cmd.category] = [];
    }
    grouped[cmd.category].push(cmd);
  }

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-black/95 border border-border/30 rounded-lg shadow-xl overflow-hidden"
    >
      <div className="p-2 border-b border-border/30 flex items-center gap-2">
        <Command className="w-4 h-4 text-neon-magenta" />
        <span className="text-xs text-muted-foreground">Quick Commands</span>
      </div>

      <div className="max-h-64 overflow-y-auto p-2 space-y-2">
        {Object.entries(grouped).map(([category, cmds]) => (
          <div key={category}>
            <p className={cn("text-[10px] font-medium uppercase tracking-wider mb-1 px-2", CATEGORY_INFO[category]?.color)}>
              {CATEGORY_INFO[category]?.label || category}
            </p>
            {cmds.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => onSelect(cmd)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-neon-magenta/10 transition-colors text-left group"
              >
                <span className="text-lg">{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-black/50 px-1.5 py-0.5 rounded text-neon-magenta">
                      {cmd.command}
                    </code>
                    <span className="text-sm truncate">{cmd.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{cmd.description}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-border/30 text-center">
        <span className="text-[10px] text-muted-foreground">
          Type <code className="bg-black/30 px-1">/help</code> for full list
        </span>
      </div>
    </div>
  );
}
