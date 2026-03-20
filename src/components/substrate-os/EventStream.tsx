/**
 * Event Stream — Live system events feed
 * Real-time log viewer with filtering and LIVE indicator
 * Streams events from all 37 Matrix Nodes across the substrate
 */

import { useState, useEffect, memo } from 'react';
import { Radio, Filter, ChevronDown, Brain, MessageSquare, Shield, Zap, Eye, Moon, Activity } from 'lucide-react';
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
  terminal: Activity,
  atlas: Activity,
  seba: Activity,
  encoded: Activity,
  core: Activity,
  ripple: Radio,
  access: Activity,
  system: Activity,
  evolution: Activity,
  integration: Activity,
  cortex: Activity,
  inclusive: Activity,
  economy: Activity,
  identity: Activity,
};

const MODULE_COLORS: Record<string, string> = {
  brain: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  decode: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  defense: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  nexus: 'text-green-400 bg-green-500/10 border-green-500/30',
  vision: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  dream: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  terminal: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  atlas: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  seba: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  encoded: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  core: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  ripple: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  access: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  system: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  evolution: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  integration: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  cortex: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  inclusive: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  economy: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  identity: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
};

const OUTCOME_COLORS: Record<string, string> = {
  started: 'text-blue-400',
  succeeded: 'text-green-400',
  failed: 'text-red-400',
  skipped: 'text-muted-foreground',
};

const ALL_MODULES = ['brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'core', 'ripple', 'access', 'system', 'evolution', 'integration', 'terminal', 'atlas', 'seba', 'encoded'];

export function EventStream() {
  const [selectedModules, setSelectedModules] = useState<string[]>(ALL_MODULES);
  const [isLive, setIsLive] = useState(false);
  const brainEvents = useLiveBrainEvents();
  
  // Detect if events are live (updated within last 10 seconds)
  useEffect(() => {
    if (brainEvents.data?.fetchedAt) {
      const timeSinceFetch = Date.now() - brainEvents.data.fetchedAt;
      setIsLive(timeSinceFetch < 10000);
    }
  }, [brainEvents.data?.fetchedAt]);
  
  // Map brain_events to the format expected by the UI
  const events = brainEvents.data?.events?.map(event => ({
    id: event.id,
    module: event.module || 'system',
    action: event.event_type || 'unknown',
    timestamp: event.created_at,
    outcome: event.outcome || 'succeeded',
    trace_id: event.trace_id,
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

  const formatRelativeTime = (timestamp: string) => {
    try {
      const diff = Date.now() - new Date(timestamp).getTime();
      if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      return formatTime(timestamp);
    } catch {
      return '--:--:--';
    }
  };
  
  return (
    <div className="border border-border/50 rounded-xl bg-card/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-2">
          <Radio className={cn("w-4 h-4", isLive ? "text-green-400 animate-pulse" : "text-muted-foreground")} />
          <span className="text-sm font-medium">Event Stream</span>
          {isLive && (
            <Badge variant="outline" className="text-[10px] h-5 font-mono text-green-400 border-green-500/30 bg-green-500/10">
              LIVE
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] h-5 font-mono">
            {filteredLogs.length} events
          </Badge>
          {brainEvents.data?.fetchedAt && (
            <span className="text-[9px] text-muted-foreground/50 font-mono hidden sm:inline">
              {new Date(brainEvents.data.fetchedAt).toLocaleTimeString('en-US', { hour12: false })}
            </span>
          )}
        </div>
        
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 touch-manipulation">
              <Filter className="w-3 h-3" />
              <span className="text-xs">Filter</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {ALL_MODULES.map((module) => {
              const Icon = MODULE_ICONS[module] || Radio;
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
          ) : brainEvents.isError ? (
            <div className="flex flex-col items-center justify-center h-[240px] text-center">
              <Shield className="w-8 h-8 text-red-400/50 mb-3" />
              <p className="text-sm text-red-400">
                Failed to load events
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Check connection and try again
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 touch-manipulation"
                onClick={() => brainEvents.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((event, idx) => {
              const moduleKey = event.module.toLowerCase();
              const Icon = MODULE_ICONS[moduleKey] || Radio;
              const colorClass = MODULE_COLORS[moduleKey] || 'text-muted-foreground bg-muted/30 border-border/30';
              const outcomeColor = OUTCOME_COLORS[event.outcome] || '';
              
              return (
                <button 
                  type="button"
                  key={event.id || idx}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg text-sm w-full text-left",
                    "hover:bg-muted/30 transition-colors touch-manipulation",
                    idx < 10 && "animate-in slide-in-from-right-2 duration-200"
                  )}
                  style={idx < 10 ? { animationDelay: `${idx * 20}ms` } : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    // Could open event details modal here
                  }}
                >
                  {/* Timestamp */}
                  <span className="text-[10px] font-mono text-muted-foreground/70 w-14 shrink-0">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                  
                  {/* Module Badge */}
                  <Badge 
                    variant="outline" 
                    className={cn("h-5 text-[10px] font-mono uppercase gap-1 shrink-0", colorClass)}
                  >
                    <Icon className="w-2.5 h-2.5" />
                    {event.module}
                  </Badge>
                  
                  {/* Action + Outcome */}
                  <span className={cn("truncate", outcomeColor)}>
                    {event.action}
                  </span>

                  {/* Trace ID (if present) */}
                  {event.trace_id && (
                    <span className="text-[9px] font-mono text-muted-foreground/50 ml-auto shrink-0">
                      {event.trace_id.slice(0, 12)}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-[240px] text-center" role="status" aria-label="No events to display">
              <Radio className="w-8 h-8 text-muted-foreground/30 mb-3" aria-hidden="true" />
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
