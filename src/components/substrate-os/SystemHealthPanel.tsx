/**
 * System Health Panel v10.5.1 ARCHITECT — Live health diagnostics
 * Premium glassmorphic design with 21-module status grid
 */

import { useState } from 'react';
import { Heart, Activity, RefreshCw, Loader2, Wrench, Server, Cpu, Brain, Shield, Zap, Moon, Eye, MessageSquare, Plug, Accessibility, GitBranch, Code, Database, Send, ClipboardCheck, Fingerprint, DollarSign, Radio, Key, Settings, Sparkles, Globe } from 'lucide-react';
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

export function SystemHealthPanel({ enabled }: SystemHealthPanelProps) {
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

  const moduleStatus = [
    { name: 'Core', key: 'core', healthy: healthScore.modules.core, icon: Cpu, color: 'text-orange-400', layer: 'Kernel' },
    { name: 'Ripple', key: 'ripple', healthy: healthScore.modules.ripple, icon: Radio, color: 'text-cyan-400', layer: 'Kernel' },
    { name: 'Access', key: 'access', healthy: healthScore.modules.access, icon: Key, color: 'text-amber-400', layer: 'Kernel' },
    { name: 'Brain', key: 'brain', healthy: healthScore.modules.brain, icon: Brain, color: 'text-purple-400', layer: 'Cognitive' },
    { name: 'Decode', key: 'decode', healthy: healthScore.modules.decode, icon: MessageSquare, color: 'text-fuchsia-400', layer: 'Cognitive' },
    { name: 'Nexus', key: 'nexus', healthy: healthScore.modules.nexus, icon: Zap, color: 'text-green-400', layer: 'Cognitive' },
    { name: 'Defense', key: 'defense', healthy: healthScore.modules.defense, icon: Shield, color: 'text-red-400', layer: 'Operational' },
    { name: 'Vision', key: 'vision', healthy: healthScore.modules.vision, icon: Eye, color: 'text-blue-400', layer: 'Operational' },
    { name: 'Dream', key: 'dream', healthy: healthScore.modules.dream, icon: Moon, color: 'text-violet-400', layer: 'Operational' },
    { name: 'Encode', key: 'encode', healthy: healthScore.modules.encode, icon: Code, color: 'text-lime-400', layer: 'Operational' },
    { name: 'System', key: 'system', healthy: healthScore.modules.system, icon: Settings, color: 'text-emerald-400', layer: 'Admin' },
    { name: 'Modernizer', key: 'modernizer', healthy: healthScore.modules.modernizer, icon: Sparkles, color: 'text-rose-400', layer: 'Admin' },
    { name: 'Integration', key: 'integration', healthy: healthScore.modules.integration, icon: Plug, color: 'text-teal-400', layer: 'Admin' },
    { name: 'Inclusive', key: 'inclusive', healthy: healthScore.modules.inclusive, icon: Accessibility, color: 'text-pink-400', layer: 'Admin' },
    { name: 'Cortex', key: 'cortex', healthy: healthScore.modules.cortex, icon: GitBranch, color: 'text-indigo-400', layer: 'Orchestrator' },
    { name: 'Atlas', key: 'atlas', healthy: (healthScore.modules as any).atlas ?? true, icon: Globe, color: 'text-sky-400', layer: 'Orchestrator' },
    { name: 'Memory', key: 'memory', healthy: healthScore.modules.memory, icon: Database, color: 'text-cyan-300', layer: 'Infra' },
    { name: 'Relay', key: 'relay', healthy: healthScore.modules.relay, icon: Send, color: 'text-amber-300', layer: 'Infra' },
    { name: 'Audit', key: 'audit', healthy: healthScore.modules.audit, icon: ClipboardCheck, color: 'text-slate-400', layer: 'Infra' },
    { name: 'Identity', key: 'identity', healthy: healthScore.modules.identity, icon: Fingerprint, color: 'text-emerald-300', layer: 'Infra' },
    { name: 'Economy', key: 'economy', healthy: healthScore.modules.economy, icon: DollarSign, color: 'text-yellow-400', layer: 'Infra' },
  ];

  const healthyCount = moduleStatus.filter(m => m.healthy).length;

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-green-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Heart className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">System Health</h3>
              <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">21-MODULE DIAGNOSTICS</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[9px] font-mono gap-1.5",
              healthScore.isHealthy ? "border-emerald-500/30 text-emerald-400/80 bg-emerald-500/5" :
              healthScore.isDegraded ? "border-amber-500/30 text-amber-400/80 bg-amber-500/5" :
              "border-red-500/30 text-red-400/80 bg-red-500/5"
            )}
          >
            <motion.span 
              className={cn("w-1.5 h-1.5 rounded-full", healthScore.isHealthy ? "bg-emerald-500" : healthScore.isDegraded ? "bg-amber-500" : "bg-red-500")}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {healthScore.healthScore}% • {healthyCount}/21
          </Badge>
        </div>

        {/* Health Bar */}
        <Progress 
          value={healthScore.healthScore} 
          className={cn(
            "h-2 rounded-full",
            healthScore.isHealthy ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-cyan-400" :
            healthScore.isDegraded ? "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-400" :
            "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-400"
          )}
        />

        {/* Module Grid */}
        <TooltipProvider delayDuration={50}>
          <div className="grid grid-cols-7 sm:grid-cols-11 lg:grid-cols-21 gap-1.5">
            {moduleStatus.map((mod, idx) => (
              <Tooltip key={mod.key}>
                <TooltipTrigger asChild>
                  <motion.div
                    className={cn(
                      "relative aspect-square rounded-lg flex items-center justify-center border cursor-pointer transition-all duration-200",
                      mod.healthy 
                        ? "border-border/30 bg-card/60 hover:border-border/60 hover:bg-card/80" 
                        : "border-red-500/20 bg-red-500/5"
                    )}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.02 * idx, type: "spring", stiffness: 400, damping: 20 }}
                    whileHover={{ scale: 1.2, y: -2, transition: { duration: 0.15 } }}
                  >
                    <mod.icon className={cn("w-3.5 h-3.5", mod.healthy ? mod.color : "text-red-400/50")} />
                    <motion.span 
                      className={cn(
                        "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-background",
                        mod.healthy ? "bg-emerald-500" : "bg-red-500"
                      )}
                      animate={mod.healthy ? { scale: [1, 1.4, 1] } : {}}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs border-border/50 bg-popover/95 backdrop-blur-xl">
                  <p className="font-semibold">{mod.name}</p>
                  <p className="text-[10px] text-muted-foreground">{mod.layer}</p>
                  <p className={cn("text-[10px]", mod.healthy ? "text-emerald-400" : "text-red-400")}>
                    {mod.healthy ? "● Online" : "○ Offline"}
                  </p>
                </TooltipContent>
              </Tooltip>
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
              <Server className="w-4 h-4 text-purple-400" />
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
              <Cpu className="w-4 h-4 text-cyan-400" />
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
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">CONTROLS</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm"
                className="h-7 text-[10px] gap-1 border-emerald-500/20 text-emerald-400/80 hover:bg-emerald-500/10 hover:border-emerald-500/40"
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
}
