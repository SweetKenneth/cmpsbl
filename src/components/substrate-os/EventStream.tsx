/**
 * Event Stream — Live system events feed
 * Real-time log viewer with filtering
 */

import { useState } from 'react';
import { Radio, Filter, ChevronDown, Brain, MessageSquare, Shield, Zap, Eye, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLiveBrainEvents } from '@/hooks/useSubstrateOSLive';
import { cn } from '@/lib/utils';

const MODULE_ICONS: Record<string, React.ElementType> = {
  brain: Brain,
  decode: MessageSquare,
  defense: Shield,
  nexus: Zap,
  vision: Eye,
  dream: Moon,
};

const MODULE_COLORS: Record<string, string> = {
  brain: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  decode: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  defense: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  nexus: 'text-green-400 bg-green-500/10 border-green-500/30',
  vision: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  dream: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
};

const ALL_MODULES = ['brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'core', 'ripple', 'access', 'system', 'modernizer', 'integration'];

export function EventStream() {
  const [selectedModules, setSelectedModules] = useState<string[]>(ALL_MODULES);
  const brainEvents = useLiveBrainEvents();
  
  // Map brain_events to the format expected by the UI
  const events = brainEvents.data?.events?.map(event => ({
    module: event.module || 'system',
    action: event.event_type || 'unknown',
    timestamp: event.created_at,
    outcome: event.outcome,
    data: event.data
  })) || [];
  
  const filteredLogs = events.filter(e => selectedModules.includes(e.module.toLowerCase()));
  
  const toggleModule = (module: string) => {
    setSelectedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };
  
  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '--:--:--';
    }
  };
  
  return (
    <div className="border border-border/50 rounded-xl bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Event Stream</span>
          <Badge variant="outline" className="text-[10px] h-5 font-mono">
            {filteredLogs.length} events
          </Badge>
        </div>
        
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1">
              <Filter className="w-3 h-3" />
              <span className="text-xs">Filter</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {ALL_MODULES.map((module) => {
              const Icon = MODULE_ICONS[module];
              return (
                <DropdownMenuCheckboxItem
                  key={module}
                  checked={selectedModules.includes(module)}
                  onCheckedChange={() => toggleModule(module)}
                >
                  <Icon className="w-3 h-3 mr-2" />
                  <span className="capitalize">{module}</span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Events List */}
      <ScrollArea className="h-[280px]">
        <div className="p-2 space-y-1">
          {brainEvents.isLoading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((event, idx) => {
              const moduleKey = event.module.toLowerCase();
              const Icon = MODULE_ICONS[moduleKey] || Radio;
              const colorClass = MODULE_COLORS[moduleKey] || 'text-muted-foreground bg-muted/30 border-border/30';
              
              return (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg text-sm",
                    "hover:bg-muted/30 transition-colors",
                    "animate-in slide-in-from-right-2 duration-200"
                  )}
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  {/* Timestamp */}
                  <span className="text-[10px] font-mono text-muted-foreground/70 w-16 shrink-0">
                    {formatTime(event.timestamp)}
                  </span>
                  
                  {/* Module Badge */}
                  <Badge 
                    variant="outline" 
                    className={cn("h-5 text-[10px] font-mono uppercase gap-1 shrink-0", colorClass)}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {event.module}
                  </Badge>
                  
                  {/* Action */}
                  <span className="text-muted-foreground truncate">
                    {event.action}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-[240px] text-center">
              <Radio className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Event stream quiet
              </p>
              <p className="text-xs text-muted-foreground/60">
                The substrate watches, waiting for activity
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
