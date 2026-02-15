/**
 * System Health Panel v10.5.0 ARCHITECT — Live health diagnostics and auto-heal
 * Real-time system status with healing controls for 21-module architecture
 */

import { useState } from 'react';
import { Heart, Activity, RefreshCw, Loader2, CheckCircle2, XCircle, AlertTriangle, Wrench, Server, Cpu, Brain, Shield, Zap, Moon, Eye, MessageSquare, Plug, Accessibility, GitBranch, Code, Database, Send, ClipboardCheck, Fingerprint, DollarSign, Box, Radio, Key, Settings, Sparkles, Globe } from 'lucide-react';
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
  const restartMutation = useSystemRestart();
  const backupMutation = useSystemBackup();

  const handleHeal = async (target?: string) => {
    setHealTarget(target);
    try {
      await healMutation.mutateAsync(target);
    } finally {
      setHealTarget(undefined);
    }
  };

  // All 21 modules — organized by layer
  const moduleStatus = [
    // Kernel (3)
    { name: 'Core', key: 'core', healthy: healthScore.modules.core, icon: Cpu, color: 'text-orange-400', layer: 'Kernel' },
    { name: 'Ripple', key: 'ripple', healthy: healthScore.modules.ripple, icon: Radio, color: 'text-cyan-400', layer: 'Kernel' },
    { name: 'Access', key: 'access', healthy: healthScore.modules.access, icon: Key, color: 'text-amber-400', layer: 'Kernel' },
    // Cognitive (3)
    { name: 'Brain', key: 'brain', healthy: healthScore.modules.brain, icon: Brain, color: 'text-purple-400', layer: 'Cognitive' },
    { name: 'Decode', key: 'decode', healthy: healthScore.modules.decode, icon: MessageSquare, color: 'text-fuchsia-400', layer: 'Cognitive' },
    { name: 'Nexus', key: 'nexus', healthy: healthScore.modules.nexus, icon: Zap, color: 'text-green-400', layer: 'Cognitive' },
    // Operational (4)
    { name: 'Defense', key: 'defense', healthy: healthScore.modules.defense, icon: Shield, color: 'text-red-400', layer: 'Operational' },
    { name: 'Vision', key: 'vision', healthy: healthScore.modules.vision, icon: Eye, color: 'text-blue-400', layer: 'Operational' },
    { name: 'Dream', key: 'dream', healthy: healthScore.modules.dream, icon: Moon, color: 'text-violet-400', layer: 'Operational' },
    { name: 'Encode', key: 'encode', healthy: healthScore.modules.encode, icon: Code, color: 'text-lime-400', layer: 'Operational' },
    // Administrative (4)
    { name: 'System', key: 'system', healthy: healthScore.modules.system, icon: Settings, color: 'text-emerald-400', layer: 'Admin' },
    { name: 'Modernizer', key: 'modernizer', healthy: healthScore.modules.modernizer, icon: Sparkles, color: 'text-rose-400', layer: 'Admin' },
    { name: 'Integration', key: 'integration', healthy: healthScore.modules.integration, icon: Plug, color: 'text-teal-400', layer: 'Admin' },
    { name: 'Inclusive', key: 'inclusive', healthy: healthScore.modules.inclusive, icon: Accessibility, color: 'text-pink-400', layer: 'Admin' },
    // Orchestrator (2)
    { name: 'Cortex', key: 'cortex', healthy: healthScore.modules.cortex, icon: GitBranch, color: 'text-indigo-400', layer: 'Orchestrator' },
    { name: 'Atlas', key: 'atlas', healthy: (healthScore.modules as any).atlas ?? true, icon: Globe, color: 'text-sky-400', layer: 'Orchestrator' },
    // Infrastructure (5)
    { name: 'Memory', key: 'memory', healthy: healthScore.modules.memory, icon: Database, color: 'text-cyan-300', layer: 'Infrastructure' },
    { name: 'Relay', key: 'relay', healthy: healthScore.modules.relay, icon: Send, color: 'text-amber-300', layer: 'Infrastructure' },
    { name: 'Audit', key: 'audit', healthy: healthScore.modules.audit, icon: ClipboardCheck, color: 'text-slate-400', layer: 'Infrastructure' },
    { name: 'Identity', key: 'identity', healthy: healthScore.modules.identity, icon: Fingerprint, color: 'text-emerald-300', layer: 'Infrastructure' },
    { name: 'Economy', key: 'economy', healthy: healthScore.modules.economy, icon: DollarSign, color: 'text-yellow-400', layer: 'Infrastructure' },
  ];

  const healthyCount = moduleStatus.filter(m => m.healthy).length;

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Heart className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">System Health</h3>
            <p className="text-[10px] text-muted-foreground font-mono">21-MODULE DIAGNOSTIC PANEL</p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[9px] font-mono gap-1.5",
            healthScore.isHealthy ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" :
            healthScore.isDegraded ? "border-amber-500/50 text-amber-400 bg-amber-500/10" :
            "border-red-500/50 text-red-400 bg-red-500/10"
          )}
        >
          <motion.span 
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              healthScore.isHealthy ? "bg-emerald-500" : healthScore.isDegraded ? "bg-amber-500" : "bg-red-500"
            )}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {healthScore.healthScore}% • {healthyCount}/21
        </Badge>
      </div>

      {/* Health Bar */}
      <div className="space-y-2">
        <Progress 
          value={healthScore.healthScore} 
          className={cn(
            "h-2.5 rounded-full",
            healthScore.isHealthy ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-400" :
            healthScore.isDegraded ? "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-400" :
            "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-400"
          )}
        />
      </div>

      {/* Module Grid — 21 modules with tooltips */}
      <TooltipProvider delayDuration={100}>
        <div className="grid grid-cols-7 sm:grid-cols-11 lg:grid-cols-21 gap-1.5">
          {moduleStatus.map((mod, idx) => (
            <Tooltip key={mod.key}>
              <TooltipTrigger asChild>
                <motion.div
                  className={cn(
                    "relative aspect-square rounded-lg flex items-center justify-center border transition-all cursor-pointer",
                    "hover:scale-110 hover:shadow-lg hover:z-10",
                    mod.healthy 
                      ? "border-emerald-500/30 bg-emerald-500/10" 
                      : "border-red-500/30 bg-red-500/10"
                  )}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.02 * idx, type: "spring", stiffness: 300 }}
                >
                  <mod.icon className={cn("w-3.5 h-3.5", mod.healthy ? mod.color : "text-red-400/60")} />
                  <motion.span 
                    className={cn(
                      "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
                      mod.healthy ? "bg-emerald-500" : "bg-red-500"
                    )}
                    animate={mod.healthy ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-medium">{mod.name}</p>
                <p className="text-[10px] text-muted-foreground">{mod.layer}</p>
                <p className={cn("text-[10px]", mod.healthy ? "text-emerald-400" : "text-red-400")}>
                  {mod.healthy ? "● Online" : "● Offline"}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Orchestrator */}
        <motion.div 
          className="p-4 rounded-xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">ORCHESTRATOR</span>
          </div>
          {orchestrator.isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : orchestrator.data ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="text-[9px] h-4 capitalize">{orchestrator.data.status || 'idle'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cycles</span>
                <span className="font-mono">{orchestrator.data.cycles_completed ?? 0}</span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground/60 italic">Offline</p>
          )}
        </motion.div>

        {/* AI Resources */}
        <motion.div 
          className="p-4 rounded-xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">AI RESOURCES</span>
          </div>
          {aiUsage.isLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : aiUsage.data ? (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens</span>
                <span className="font-mono">
                  {aiUsage.data.totalTokens > 1000000 
                    ? `${(aiUsage.data.totalTokens / 1000000).toFixed(1)}M`
                    : aiUsage.data.totalTokens > 1000
                    ? `${(aiUsage.data.totalTokens / 1000).toFixed(1)}K`
                    : aiUsage.data.totalTokens}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost</span>
                <span className="font-mono">${aiUsage.data.totalCost.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground/60 italic">No data</p>
          )}
        </motion.div>

        {/* Auto-Heal */}
        <motion.div 
          className="p-4 rounded-xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">CONTROLS</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => handleHeal()}
              disabled={healMutation.isPending || !enabled}
            >
              {healMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
              Auto-Heal
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] gap-1"
              onClick={() => healthScore.refetch()}
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}