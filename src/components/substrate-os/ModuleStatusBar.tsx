/**
 * Module Status Bar — Live module indicators with pulse animations
 * Visual representation of all 8 substrate module health
 */

import { Brain, MessageSquare, Shield, Zap, Eye, Moon, Cpu, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';

interface ModuleConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  activeColor: string;
  glowColor: string;
}

const MODULES: ModuleConfig[] = [
  { 
    id: 'brain', 
    name: 'BRAIN', 
    icon: Brain, 
    description: 'Cognitive processing & memory',
    activeColor: 'text-cyan-400',
    glowColor: 'shadow-cyan-500/50'
  },
  { 
    id: 'decode', 
    name: 'DECODE', 
    icon: MessageSquare, 
    description: 'Epistemic conversation engine',
    activeColor: 'text-purple-400',
    glowColor: 'shadow-purple-500/50'
  },
  { 
    id: 'defense', 
    name: 'DEFENSE', 
    icon: Shield, 
    description: 'Security & threat detection',
    activeColor: 'text-amber-400',
    glowColor: 'shadow-amber-500/50'
  },
  { 
    id: 'nexus', 
    name: 'NEXUS', 
    icon: Zap, 
    description: 'AI provider routing',
    activeColor: 'text-green-400',
    glowColor: 'shadow-green-500/50'
  },
  { 
    id: 'vision', 
    name: 'VISION', 
    icon: Eye, 
    description: 'Observability & telemetry',
    activeColor: 'text-blue-400',
    glowColor: 'shadow-blue-500/50'
  },
  { 
    id: 'dream', 
    name: 'DREAM', 
    icon: Moon, 
    description: 'Dream-Eater consumption engine',
    activeColor: 'text-violet-400',
    glowColor: 'shadow-violet-500/50'
  },
  { 
    id: 'system', 
    name: 'SYSTEM', 
    icon: Cpu, 
    description: 'Core administration & control',
    activeColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/50'
  },
  { 
    id: 'modernizer', 
    name: 'MODERNIZER', 
    icon: Sparkles, 
    description: 'Self-improvement engine',
    activeColor: 'text-orange-400',
    glowColor: 'shadow-orange-500/50'
  },
];

function ModuleIndicator({ module, isActive, isLoading }: { 
  module: ModuleConfig; 
  isActive: boolean;
  isLoading: boolean;
}) {
  const Icon = module.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "group relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-300",
              "hover:scale-105 active:scale-95",
              isLoading 
                ? "border-border/50 bg-muted/20" 
                : isActive 
                  ? `border-current/30 bg-current/5 ${module.activeColor} shadow-lg ${module.glowColor}`
                  : "border-border/30 bg-muted/10 text-muted-foreground"
            )}
          >
            {/* Glow backdrop for active modules */}
            {isActive && !isLoading && (
              <div className={cn(
                "absolute inset-0 rounded-lg blur-lg opacity-30 -z-10",
                module.activeColor.replace('text-', 'bg-')
              )} />
            )}
            
            {/* Icon */}
            <div className="relative">
              <Icon className={cn(
                "w-5 h-5 transition-all",
                isLoading ? "animate-pulse text-muted-foreground" : ""
              )} />
              
              {/* Status dot */}
              <span className={cn(
                "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                isLoading ? "bg-muted-foreground" :
                isActive ? "bg-green-500" : "bg-red-500"
              )}>
                {isActive && !isLoading && (
                  <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                )}
              </span>
            </div>
            
            {/* Label */}
            <span className={cn(
              "text-[9px] font-mono font-medium tracking-widest",
              isLoading ? "text-muted-foreground" : ""
            )}>
              {module.name}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium">{module.name}</p>
          <p className="text-xs text-muted-foreground">{module.description}</p>
          <p className="text-xs mt-1">
            Status: <span className={isActive ? "text-green-500" : "text-red-500"}>
              {isActive ? "ONLINE" : "OFFLINE"}
            </span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ModuleStatusBar() {
  const healthScore = useSubstrateHealthScore();
  
  return (
    <div className="p-4 border border-border/50 rounded-xl bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Module Status
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">ACTIVE</span>
          <span className={cn(
            "font-mono font-bold",
            healthScore.isHealthy ? "text-green-500" : 
            healthScore.isDegraded ? "text-amber-500" : "text-destructive"
          )}>
            {Object.values(healthScore.modules).filter(Boolean).length}/6
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {MODULES.map((module) => (
          <ModuleIndicator
            key={module.id}
            module={module}
            isActive={healthScore.modules[module.id as keyof typeof healthScore.modules] ?? false}
            isLoading={healthScore.isLoading}
          />
        ))}
      </div>
    </div>
  );
}
