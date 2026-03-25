/**
 * System Health Panel — Layer-weighted diagnostics
 * Execution Surfaces, Zones, Overlays
 */

import { useState, memo } from 'react';
import { Heart, Activity, RefreshCw, Loader2, Wrench, Server, Cpu, Brain, Shield, Zap, Moon, Eye, MessageSquare, Plug, Accessibility, GitBranch, Code, Database, Send, ClipboardCheck, Fingerprint, DollarSign, Radio, Key, Settings, Sparkles, Globe, Network, Dna, Scale, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { useSystemHeal, useSystemRestart, useSystemBackup } from '@/hooks/useSubstrateOSEnhanced';
import { useLiveOrchestratorState, useLiveAIUsage } from '@/hooks/useSubstrateOSLive';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface SystemHealthPanelProps {
  enabled: boolean;
}

export const SystemHealthPanel = memo(function SystemHealthPanel({ enabled }: SystemHealthPanelProps) {
  const [healTarget, setHealTarget] = useState<string | undefined>();
  
  const healthScore = useSubstrateHealthScore();
  const orchestrator = useLiveOrchestratorState();
  const aiUsage = useLiveAIUsage();
  
  const healMutation = useSystemHeal();

  const handleHeal = async (target?: string) => {
    setHealTarget(target);
    try {
      await healMutation.mutateAsync(target);
    } finally {
      setHealTarget(undefined);
    }
  };

  const layers = [
    {
      label: 'CORE',
      items: [
        { name: 'CORE', key: 'core', icon: Cpu, color: 'text-neon-amber' },
      ],
    },
    {
      label: 'CCR ZONES',
      items: [
        { name: 'SYSTEM', key: 'system', icon: Settings, color: 'text-neon-green' },
        { name: 'BRAIN', key: 'brain', icon: Brain, color: 'text-neon-purple' },
        { name: 'MEMORY', key: 'memory', icon: Database, color: 'text-neon-cyan' },
        { name: 'DREAM', key: 'dream', icon: Moon, color: 'text-neon-purple' },
      ],
    },
    {
      label: 'OCG ZONES',
      items: [
        { name: 'RIPPLE', key: 'ripple', icon: Radio, color: 'text-neon-cyan' },
        { name: 'ACCESS', key: 'access', icon: Key, color: 'text-neon-amber' },
        { name: 'IDENTITY', key: 'identity', icon: Fingerprint, color: 'text-neon-green' },
        { name: 'RELAY', key: 'relay', icon: Send, color: 'text-neon-amber' },
        { name: 'AUDIT', key: 'audit', icon: ClipboardCheck, color: 'text-slate-400' },
      ],
    },
    {
      label: 'EXECUTION SURFACES',
      items: [
        { name: 'DECODE', key: 'decode', icon: MessageSquare, color: 'text-neon-magenta' },
        { name: 'ENCODE', key: 'encode', icon: Code, color: 'text-lime-400' },
        { name: 'VISION', key: 'vision', icon: Eye, color: 'text-neon-blue' },
        { name: 'CORTEX', key: 'cortex', icon: GitBranch, color: 'text-primary' },
        { name: 'NEXUS', key: 'nexus', icon: Zap, color: 'text-neon-green' },
        { name: 'ECONOMY', key: 'economy', icon: DollarSign, color: 'text-neon-amber' },
        { name: 'SANDBOX', key: 'sandbox', icon: Globe, color: 'text-sky-400' },
        { name: 'INCLUSIVE', key: 'inclusive', icon: Accessibility, color: 'text-neon-magenta' },
        { name: 'INTEGRATION', key: 'integration', icon: Plug, color: 'text-neon-cyan' },
      ],
    },
    {
      label: 'OVERLAYS',
      items: [
        { name: 'DEFENSE', key: 'defense', icon: Shield, color: 'text-destructive' },
        { name: 'IMMUNITY', key: 'immunity', icon: Network, color: 'text-neon-magenta' },
        { name: 'EVOLUTION', key: 'evolution', icon: Dna, color: 'text-neon-green' },
        { name: 'INTENT', key: 'intent', icon: Target, color: 'text-neon-amber' },
        { name: 'GOVERNANCE', key: 'governance', icon: Scale, color: 'text-primary' },
      ],
    },
  ];

  const allItems = layers.flatMap(l => l.items);
  const healthyCount = allItems.filter(m => (healthScore.modules[m.key] ?? 100) >= 50).length;
  const totalCount = allItems.length;

  // Layer health from the hook
  const layerHealthValues = healthScore.layers || { core: 100, ccr: 100, ocg: 100, surfaces: 100, expansion: 100, mesh: 100 };
  const layerHealthMap: Record<string, number> = {
    'CORE + SYSTEM': layerHealthValues.core,
    'CCR ZONES': layerHealthValues.ccr,
    'OCG ZONES': layerHealthValues.ocg,
    'EXECUTION': layerHealthValues.surfaces,
    'ESZ / EPZ / EMZ': layerHealthValues.expansion,
    'FIELDS / PLANE / SHELL': layerHealthValues.mesh,
  };

  // Show CRITICAL only when CORE breaker open OR CCR/OCG < 40
  const showCritical = layerHealthValues.core < 40 || layerHealthValues.ccr < 40 || layerHealthValues.ocg < 40;

  return (
    <motion.div 
      className="relative rounded-2xl border border-border/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-card/95 via-card/60 to-card/30 backdrop-blur-2xl" />
      
      <div className="relative p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green/15 to-neon-green/15 border border-neon-green/25 flex items-center justify-center">
              <Heart className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">System Health</h3>
              <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">LAYER-WEIGHTED DIAGNOSTICS</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] font-mono gap-1.5",
              healthScore.isHealthy ? "border-neon-green/30 text-neon-green/80 bg-neon-green/5" :
              healthScore.isDegraded ? "border-neon-amber/30 text-neon-amber/80 bg-neon-amber/5" :
              "border-destructive/30 text-destructive/80 bg-destructive/5"
            )}
          >
            <motion.span 
              className={cn("w-1.5 h-1.5 rounded-full", healthScore.isHealthy ? "bg-neon-green" : healthScore.isDegraded ? "bg-neon-amber" : "bg-destructive")}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {healthScore.healthScore}% • {healthyCount}/{totalCount}
          </Badge>
        </div>

        {/* Critical Banner — only when kernel or zone clusters critically degraded */}
        {showCritical && (
          <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-xs text-destructive flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>CRITICAL: Core kernel or zone cluster health below threshold.</span>
          </div>
        )}

        {/* Health Bar */}
        <Progress 
          value={healthScore.healthScore} 
          className={cn(
            "h-2 rounded-full",
            healthScore.isHealthy ? "[&>div]:bg-gradient-to-r [&>div]:from-neon-green [&>div]:to-neon-cyan" :
            healthScore.isDegraded ? "[&>div]:bg-gradient-to-r [&>div]:from-neon-amber [&>div]:to-neon-amber" :
            "[&>div]:bg-gradient-to-r [&>div]:from-destructive [&>div]:to-neon-magenta"
          )}
        />

        {/* Layer Health Breakdown */}
        <div className="grid grid-cols-5 gap-2">
          {layers.map(layer => {
            const lh = layerHealthMap[layer.label] ?? 100;
            return (
              <div key={layer.label} className="text-center p-2 rounded-lg border border-border/20 bg-card/40">
                <div className={cn("text-lg font-bold font-mono", lh >= 80 ? "text-neon-green" : lh >= 40 ? "text-neon-amber" : "text-destructive")}>
                  {lh}%
                </div>
                <div className="text-[8px] text-muted-foreground/60 font-mono uppercase tracking-wider mt-0.5">{layer.label}</div>
              </div>
            );
          })}
        </div>

        {/* Entity Grid by Layer */}
        <TooltipProvider delayDuration={50}>
          <div className="space-y-3">
            {layers.map(layer => (
              <div key={layer.label}>
                <div className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-1.5">{layer.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {layer.items.map((mod, idx) => {
                    const healthy = healthScore.modules[mod.key] !== false;
                    return (
                      <Tooltip key={mod.key}>
                        <TooltipTrigger asChild>
                          <motion.div
                            className={cn(
                              "relative w-9 h-9 rounded-lg flex items-center justify-center border cursor-pointer transition-all duration-200",
                              healthy 
                                ? "border-border/30 bg-card/60 hover:border-border/60 hover:bg-card/80" 
                                : "border-destructive/20 bg-destructive/5"
                            )}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.02 * idx, type: "spring", stiffness: 400, damping: 20 }}
                            whileHover={{ scale: 1.15, y: -2, transition: { duration: 0.15 } }}
                          >
                            <mod.icon className={cn("w-3.5 h-3.5", healthy ? mod.color : "text-destructive/50")} />
                            <motion.span 
                              className={cn(
                                "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-background",
                                healthy ? "bg-neon-green" : "bg-destructive"
                              )}
                              animate={healthy ? { scale: [1, 1.4, 1] } : {}}
                              transition={{ duration: 2.5, repeat: Infinity }}
                            />
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs border-border/50 bg-popover/95 backdrop-blur-xl">
                          <p className="font-semibold">{mod.name}</p>
                          <p className="text-[10px] text-muted-foreground">{layer.label}</p>
                          <p className={cn("text-[10px]", healthy ? "text-neon-green" : "text-destructive")}>
                            {healthy ? "● Online" : "○ Offline"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            className="p-4 rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-neon-purple" />
              <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">ORCHESTRATOR</span>
            </div>
            {orchestrator.isLoading ? <Skeleton className="h-10 w-full" /> : orchestrator.data ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Status</span>
                  <Badge variant="outline" className="text-[9px] h-4 capitalize border-border/40">{orchestrator.data.status || 'idle'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Cycles</span>
                  <span className="font-mono text-foreground/80">{orchestrator.data.cycles_completed ?? 0}</span>
                </div>
              </div>
            ) : <p className="text-[10px] text-muted-foreground/40 italic">Offline</p>}
          </motion.div>

          <motion.div 
            className="p-4 rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-neon-cyan" />
              <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">AI RESOURCES</span>
            </div>
            {aiUsage.isLoading ? <Skeleton className="h-10 w-full" /> : aiUsage.data ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Tokens</span>
                  <span className="font-mono text-foreground/80">
                    {aiUsage.data.totalTokens > 1000000 ? `${(aiUsage.data.totalTokens / 1000000).toFixed(1)}M` : aiUsage.data.totalTokens > 1000 ? `${(aiUsage.data.totalTokens / 1000).toFixed(1)}K` : aiUsage.data.totalTokens}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/70">Cost</span>
                  <span className="font-mono text-foreground/80">${aiUsage.data.totalCost.toFixed(2)}</span>
                </div>
              </div>
            ) : <p className="text-[10px] text-muted-foreground/40 italic">No data</p>}
          </motion.div>

          <motion.div 
            className="p-4 rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-neon-green" />
              <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">CONTROLS</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm"
                className="h-7 text-[10px] gap-1 border-neon-green/20 text-neon-green/80 hover:bg-neon-green/10 hover:border-neon-green/40"
                onClick={() => handleHeal()} disabled={healMutation.isPending || !enabled}
              >
                {healMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
                Auto-Heal
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-border/30" onClick={() => healthScore.refetch()}>
                <RefreshCw className="w-3 h-3" /> Refresh
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
