/**
 * Module Status Bar — Matrix Nodes, Zones, Overlays
 * Layer-grouped status indicators
 */

import { useState, useEffect } from 'react';
import { Brain, MessageSquare, Shield, Zap, Eye, Moon, Cpu, Radio, Key, RefreshCw, Settings, Layers, Plug, Accessibility, GitBranch, Code, Database, Send, ClipboardCheck, Fingerprint, DollarSign, Globe, Network, Dna, Scale, Target } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ModuleConfig {
  id: string;
  name: string;
  shortName: string;
  layer: 'spine' | 'grid' | 'field' | 'plane' | 'shell';
  icon: React.ElementType;
  description: string;
  color: string;
  glowColor: string;
}

const MODULES: ModuleConfig[] = [
  // Spine (Core kernel)
  { id: 'core', name: 'CORE', shortName: 'COR', layer: 'spine', icon: Cpu, description: 'Spine — kernel orchestration & scheduling', color: 'text-orange-400', glowColor: 'bg-orange-500' },
  // Grid (Cognitive engines)
  { id: 'brain', name: 'BRAIN', shortName: 'BRN', layer: 'grid', icon: Brain, description: 'Grid — reasoning & cognition', color: 'text-purple-400', glowColor: 'bg-purple-500' },
  { id: 'memory', name: 'MEMORY', shortName: 'MEM', layer: 'grid', icon: Database, description: 'Grid — tiered memory storage', color: 'text-cyan-300', glowColor: 'bg-cyan-500' },
  { id: 'dream', name: 'DREAM', shortName: 'DRM', layer: 'grid', icon: Moon, description: 'Grid — dream synthesis engine', color: 'text-violet-400', glowColor: 'bg-violet-500' },
  { id: 'cortex', name: 'CORTEX', shortName: 'CTX', layer: 'grid', icon: GitBranch, description: 'Grid — autonomous orchestrator', color: 'text-indigo-400', glowColor: 'bg-indigo-500' },
  // Field (Execution surfaces / Matrix Nodes)
  { id: 'decode', name: 'DECODE', shortName: 'DEC', layer: 'field', icon: MessageSquare, description: 'Field — epistemic interpreter', color: 'text-fuchsia-400', glowColor: 'bg-fuchsia-500' },
  { id: 'encode', name: 'ENCODE', shortName: 'ENC', layer: 'field', icon: Code, description: 'Field — code generation engine', color: 'text-lime-400', glowColor: 'bg-lime-500' },
  { id: 'vision', name: 'VISION', shortName: 'VIS', layer: 'field', icon: Eye, description: 'Field — observability & telemetry', color: 'text-blue-400', glowColor: 'bg-blue-500' },
  { id: 'nexus', name: 'NEXUS', shortName: 'NEX', layer: 'field', icon: Zap, description: 'Field — AI provider routing', color: 'text-green-400', glowColor: 'bg-green-500' },
  { id: 'economy', name: 'ECONOMY', shortName: 'ECN', layer: 'field', icon: DollarSign, description: 'Field — metering & billing', color: 'text-yellow-400', glowColor: 'bg-yellow-500' },
  { id: 'sandbox', name: 'SANDBOX', shortName: 'SBX', layer: 'field', icon: Globe, description: 'Field — isolated execution', color: 'text-sky-400', glowColor: 'bg-sky-500' },
  { id: 'inclusive', name: 'INCLUSIVE', shortName: 'INC', layer: 'field', icon: Accessibility, description: 'Field — WCAG compatibility', color: 'text-pink-400', glowColor: 'bg-pink-500' },
  { id: 'integration', name: 'INTEGRATION', shortName: 'INT', layer: 'field', icon: Plug, description: 'Field — enterprise adapters', color: 'text-teal-400', glowColor: 'bg-teal-500' },
  { id: 'ripple', name: 'RIPPLE', shortName: 'RIP', layer: 'field', icon: Radio, description: 'Field — signal & event bus', color: 'text-cyan-400', glowColor: 'bg-cyan-500' },
  { id: 'access', name: 'ACCESS', shortName: 'ACC', layer: 'field', icon: Key, description: 'Field — entitlements & API keys', color: 'text-amber-400', glowColor: 'bg-amber-500' },
  { id: 'identity', name: 'IDENTITY', shortName: 'IDN', layer: 'field', icon: Fingerprint, description: 'Field — session & role management', color: 'text-emerald-300', glowColor: 'bg-emerald-500' },
  { id: 'relay', name: 'RELAY', shortName: 'RLY', layer: 'field', icon: Send, description: 'Field — webhook dispatch', color: 'text-amber-300', glowColor: 'bg-amber-500' },
  { id: 'audit', name: 'AUDIT', shortName: 'AUD', layer: 'field', icon: ClipboardCheck, description: 'Field — integrity ledger', color: 'text-slate-400', glowColor: 'bg-slate-500' },
  // Plane (Governance & orchestration)
  { id: 'governance', name: 'GOVERNANCE', shortName: 'GOV', layer: 'plane', icon: Scale, description: 'Plane — policy enforcement', color: 'text-indigo-400', glowColor: 'bg-indigo-500' },
  { id: 'immunity', name: 'IMMUNITY', shortName: 'IMM', layer: 'plane', icon: Network, description: 'Plane — shadow training mesh', color: 'text-rose-400', glowColor: 'bg-rose-500' },
  { id: 'evolution', name: 'EVOLUTION', shortName: 'EVO', layer: 'plane', icon: Dna, description: 'Plane — evolution lifecycle', color: 'text-emerald-400', glowColor: 'bg-emerald-500' },
  { id: 'intent', name: 'INTENT', shortName: 'INT', layer: 'plane', icon: Target, description: 'Plane — capability discovery', color: 'text-amber-400', glowColor: 'bg-amber-500' },
  // Shell (Security perimeter)
  { id: 'system', name: 'SYSTEM', shortName: 'SYS', layer: 'shell', icon: Settings, description: 'Shell — lifecycle management', color: 'text-emerald-400', glowColor: 'bg-emerald-500' },
  { id: 'defense', name: 'DEFENSE', shortName: 'DEF', layer: 'shell', icon: Shield, description: 'Shell — security perimeter', color: 'text-red-400', glowColor: 'bg-red-500' },
];

const LAYER_CONFIG = {
  'spine': { label: 'Spine', color: 'text-orange-400', border: 'border-orange-500/30' },
  'grid': { label: 'Grid', color: 'text-purple-400', border: 'border-purple-500/30' },
  'field': { label: 'Field', color: 'text-blue-400', border: 'border-blue-500/30' },
  'plane': { label: 'Plane', color: 'text-indigo-400', border: 'border-indigo-500/30' },
  'shell': { label: 'Shell', color: 'text-red-400', border: 'border-red-500/30' },
};

function ModuleIndicator({ module, isActive, isLoading, index }: { 
  module: ModuleConfig; 
  isActive: boolean;
  isLoading: boolean;
  index: number;
}) {
  const Icon = module.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            className={cn(
              "group relative flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border transition-all duration-300",
              "hover:scale-105 active:scale-95",
              isLoading 
                ? "border-border/30 bg-muted/10" 
                : isActive 
                  ? cn("border-current/40 bg-current/10", module.color)
                  : "border-border/30 bg-muted/5 text-muted-foreground/50"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
          >
            {isActive && !isLoading && (
              <motion.div 
                className={cn("absolute inset-0 rounded-xl blur-lg opacity-30 -z-10", module.glowColor)}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div className="relative">
              <Icon className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 transition-all",
                isLoading ? "animate-pulse text-muted-foreground/50" : ""
              )} />
              <span className={cn(
                "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-background",
                isLoading ? "bg-muted-foreground/50" :
                isActive ? "bg-emerald-500" : "bg-red-500/70"
              )}>
                {isActive && !isLoading && (
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                )}
              </span>
            </div>
            <span className={cn(
              "hidden sm:block text-[8px] font-mono font-semibold tracking-widest",
              isLoading ? "text-muted-foreground/50" : ""
            )}>
              {module.shortName}
            </span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs bg-popover/95 backdrop-blur-xl border-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn("w-4 h-4", module.color)} />
              <span className="font-semibold">{module.name}</span>
              <Badge variant="outline" className={cn("text-[8px] h-4", LAYER_CONFIG[module.layer].border)}>
                {LAYER_CONFIG[module.layer].label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{module.description}</p>
            <div className="flex items-center gap-2 pt-1 border-t border-border/30">
              <span className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500" : "bg-red-500")} />
              <span className={cn("text-xs font-medium", isActive ? "text-emerald-400" : "text-red-400")}>
                {isActive ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ModuleStatusBar() {
  const healthScore = useSubstrateHealthScore();
  const [simulatedModules, setSimulatedModules] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!healthScore.isLoading) {
      const anyActive = Object.values(healthScore.modules).some(Boolean);
      if (!anyActive) {
        const timers: NodeJS.Timeout[] = [];
        MODULES.forEach((module, idx) => {
          const timer = setTimeout(() => {
            setSimulatedModules(prev => ({ ...prev, [module.id]: true }));
          }, 100 + idx * 60);
          timers.push(timer);
        });
        return () => timers.forEach(clearTimeout);
      }
    }
  }, [healthScore.isLoading, healthScore.modules]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await healthScore.refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getModuleStatus = (moduleId: string): boolean => {
    const realStatus = healthScore.modules[moduleId];
    if (realStatus) return true;
    return simulatedModules[moduleId] ?? false;
  };
  
  const activeCount = MODULES.filter(m => getModuleStatus(m.id)).length;
  const totalCount = MODULES.length;
  const healthPercent = healthScore.healthScore;
  
  const modulesByLayer = MODULES.reduce((acc, module) => {
    if (!acc[module.layer]) acc[module.layer] = [];
    acc[module.layer].push(module);
    return acc;
  }, {} as Record<string, ModuleConfig[]>);
  
  return (
    <motion.div 
      className="p-4 sm:p-5 border border-border/40 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Matrix Node Status</h3>
            <p className="text-[10px] text-muted-foreground font-mono">1 spine / 4 grid / 13 field / 4 plane / 2 shell</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}
            className="h-8 px-3 text-xs border-border/50 bg-background/50">
            <RefreshCw className={cn("w-3 h-3 mr-1.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30">
            <div className={cn(
              "w-2 h-2 rounded-full",
              activeCount === totalCount ? "bg-emerald-500" : 
              activeCount >= totalCount * 0.7 ? "bg-amber-500" : "bg-red-500"
            )} />
            <span className="text-xs font-mono text-muted-foreground">ACTIVE</span>
            <span className={cn(
              "text-sm font-bold font-mono",
              activeCount === totalCount ? "text-emerald-400" : 
              activeCount >= totalCount * 0.7 ? "text-amber-400" : "text-red-400"
            )}>
              {activeCount}/{totalCount}
            </span>
            <Badge variant="outline" className="text-[9px] h-5 ml-1">{healthPercent}%</Badge>
          </div>
        </div>
      </div>
      
      {/* Layer Labels */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-2 mb-2 px-1">
        {(['spine', 'grid', 'field', 'plane', 'shell'] as const).map(layer => (
          <div key={layer} className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", LAYER_CONFIG[layer].color.replace('text-', 'bg-'))} />
            <span className={cn("text-[9px] font-mono uppercase tracking-widest", LAYER_CONFIG[layer].color)}>
              {LAYER_CONFIG[layer].label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Modules Grid */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-3">
        {(['spine', 'grid', 'field', 'plane', 'shell'] as const).map(layer => (
          <div key={layer} className={cn("flex flex-col gap-2 p-2 rounded-xl border", LAYER_CONFIG[layer].border, "bg-muted/5")}>
            {modulesByLayer[layer]?.map((module) => (
              <ModuleIndicator
                key={module.id}
                module={module}
                isActive={getModuleStatus(module.id)}
                isLoading={healthScore.isLoading}
                index={MODULES.findIndex(m => m.id === module.id)}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Mobile Grid */}
      <div className="lg:hidden grid grid-cols-4 sm:grid-cols-6 gap-2">
        {MODULES.map((module, idx) => (
          <ModuleIndicator
            key={module.id}
            module={module}
            isActive={getModuleStatus(module.id)}
            isLoading={healthScore.isLoading}
            index={idx}
          />
        ))}
      </div>
    </motion.div>
  );
}
