/**
 * NodeDreamingWidget — Dream observability + Cognitive Capabilities
 * Shows dream tier activity, recent logs, analytics, and cognitive health.
 */

import { Moon, Sparkles, AlertTriangle, Activity, Zap, RefreshCw, Loader2, Brain, Shield, RotateCcw, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNodeDreaming } from '@/hooks/substrate/useNodeDreaming';
import { useCognitiveCapabilities } from '@/hooks/substrate/useCognitiveCapabilities';
import { pushToast } from '@/components/toast/SmartToastStore';
import type { DreamCycleType } from '@/lib/substrate/node-dreaming';

const TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  A: { text: 'text-neon-purple dark:text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/20' },
  B: { text: 'text-neon-cyan dark:text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
  C: { text: 'text-neon-amber dark:text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/20' },
};

const CYCLE_LABELS: Record<DreamCycleType, string> = {
  consolidation: 'Consolidate',
  contradiction: 'Contradiction Scan',
  cross_pollination: 'Cross-Pollinate',
  heuristic_gen: 'Heuristic Gen',
  decay: 'Decay Sweep',
};

export function NodeDreamingWidget() {
  const { configs, logs, analytics, triggerDream } = useNodeDreaming();
  const cognitive = useCognitiveCapabilities();

  const configData = configs.data ?? [];
  const logData = logs.data ?? [];
  const analyticsSummary = analytics.data;

  const enabledCount = configData.filter(c => c.enabled).length;
  const totalDreams = configData.reduce((sum, c) => sum + (c.totalDreams ?? 0), 0);
  const totalInsights = configData.reduce((sum, c) => sum + (c.totalInsights ?? 0), 0);

  const tierCounts = { A: 0, B: 0, C: 0 };
  for (const c of configData) {
    if (c.enabled && c.dreamTier in tierCounts) {
      tierCounts[c.dreamTier as keyof typeof tierCounts]++;
    }
  }

  const recentLogs = logData.slice(0, 5);

  const handleTrigger = (nodeId: string) => {
    triggerDream.mutate({ nodeId }, {
      onSuccess: () => pushToast({ message: `Dream triggered for ${nodeId}`, variant: 'success' }),
      onError: () => pushToast({ message: `Dream failed for ${nodeId}`, variant: 'error' }),
    });
  };

  const handleAssess = (nodeId: string) => {
    const result = cognitive.assess(nodeId);
    if (result) {
      pushToast({
        message: `${nodeId} assessed — recall: ${Math.round(result.recallAccuracy * 100)}%, drift: ${Math.round(result.driftScore * 100)}%`,
        variant: result.driftScore > 0.4 ? 'warning' : 'success',
      });
    }
  };

  const handleReplay = (nodeId: string) => {
    const result = cognitive.replay(nodeId);
    if (result && result.memoriesScanned > 0) {
      pushToast({
        message: `${nodeId} replay — ${result.memoriesPromoted} promoted, ${result.memoriesReinforced} reinforced`,
        variant: 'success',
      });
    } else {
      pushToast({ message: `${nodeId} replay cooldown active`, variant: 'info' });
    }
  };

  const isLoading = configs.isLoading || logs.isLoading;

  return (
    <motion.div
      className="rounded-xl sm:rounded-2xl border border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
            <Moon className="w-4 h-4 text-neon-purple dark:text-neon-purple" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Node Dreaming</h3>
            <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">Somnium Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] font-mono border-border/20">
            {enabledCount} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => {
              configs.refetch();
              logs.refetch();
              analytics.refetch();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-4">
        {/* Tier Summary */}
        <div className="grid grid-cols-3 gap-2">
          {(['A', 'B', 'C'] as const).map(tier => {
            const colors = TIER_COLORS[tier];
            const intervalLabel = tier === 'A' ? '4h' : tier === 'B' ? '6h' : '12h';
            return (
              <div
                key={tier}
                className={cn("rounded-lg border p-2.5 sm:p-3", colors.bg, colors.border)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-[10px] font-bold font-mono tracking-wider", colors.text)}>TIER {tier}</span>
                  <span className="text-[9px] text-muted-foreground/40 font-mono">{intervalLabel}</span>
                </div>
                <span className="text-lg sm:text-xl font-bold font-mono text-foreground">{tierCounts[tier]}</span>
                <span className="text-[9px] text-muted-foreground/50 block">nodes</span>
              </div>
            );
          })}
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/10 p-2.5 bg-muted/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3 text-neon-amber" />
              <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">Total Dreams</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-mono text-foreground">{totalDreams}</span>
          </div>
          <div className="rounded-lg border border-border/10 p-2.5 bg-muted/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 text-neon-green" />
              <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">Insights</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-mono text-foreground">{totalInsights}</span>
          </div>
        </div>

        {/* Analytics summary */}
        {analyticsSummary && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Contradictions', value: analyticsSummary.avgContradictions ?? 0, icon: AlertTriangle, color: 'text-neon-magenta' },
              { label: 'Merged', value: analyticsSummary.avgPatternsMerged ?? 0, icon: Activity, color: 'text-neon-cyan' },
              { label: 'Success', value: `${Math.round((analyticsSummary.successRate ?? 0) * 100)}%`, icon: Sparkles, color: 'text-neon-amber' },
            ].map(stat => (
              <div key={stat.label} className="rounded-lg border border-border/10 p-2 bg-muted/5 text-center">
                <stat.icon className={cn("w-3 h-3 mx-auto mb-1", stat.color)} />
                <span className="text-sm font-bold font-mono text-foreground block">{stat.value}</span>
                <span className="text-[8px] text-muted-foreground/40 font-mono uppercase">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Dream Logs */}
        {recentLogs.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider block px-0.5">Recent Activity</span>
            <div className="space-y-1">
              {recentLogs.map((log, i) => (
                <TooltipProvider key={i} delayDuration={50}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/5 hover:bg-muted/15 transition-colors cursor-default text-[10px]">
                        <Moon className="w-3 h-3 text-neon-purple shrink-0" />
                        <span className="font-mono font-medium text-foreground truncate">{log.nodeId}</span>
                        <Badge variant="outline" className="text-[8px] ml-auto border-border/20 shrink-0">
                          {CYCLE_LABELS[log.cycleType as DreamCycleType] ?? log.cycleType}
                        </Badge>
                        {log.success ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-green shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs max-w-[220px]">
                      <p className="font-semibold">{log.nodeId} dream</p>
                      <p className="text-muted-foreground">
                        Contradictions: {log.contradictionsFound} · Merged: {log.patternsMerged} · Heuristics: {log.heuristicsProposed}
                      </p>
                      <p className="text-muted-foreground/60 text-[10px]">Budget: {log.budgetUsed}/{log.budgetMax}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}

        {/* Quick trigger for Tier A nodes */}
        {configData.filter(c => c.dreamTier === 'A' && c.enabled).length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider block px-0.5">Quick Dream (Tier A)</span>
            <div className="flex flex-wrap gap-1.5">
              {configData
                .filter(c => c.dreamTier === 'A' && c.enabled)
                .map(c => (
                  <Button
                    key={c.nodeId}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-[10px] font-mono border-neon-purple/20 hover:bg-neon-purple/10 hover:border-neon-purple/30"
                    onClick={() => handleTrigger(c.nodeId)}
                    disabled={triggerDream.isPending}
                  >
                    {triggerDream.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Moon className="w-3 h-3 mr-1 text-neon-purple" />
                    )}
                    {c.nodeId}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {/* Cognitive Capabilities (Synapse Engine) */}
        <div className="space-y-1.5 border-t border-border/10 pt-3">
          <div className="flex items-center gap-1.5 px-0.5">
            <Brain className="w-3 h-3 text-neon-green" />
            <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">Cognitive Capabilities</span>
            <Badge variant="outline" className="text-[8px] ml-auto font-mono border-border/20">Synapse</Badge>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Self-Assess', icon: Brain, action: handleAssess, color: 'text-neon-green' },
              { label: 'Replay', icon: RotateCcw, action: handleReplay, color: 'text-sky-500' },
            ].map(cap => (
              <Button
                key={cap.label}
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-mono border-border/15 hover:bg-muted/10"
                onClick={() => {
                  const tierANodes = configData.filter(c => c.dreamTier === 'A' && c.enabled);
                  if (tierANodes.length > 0) cap.action(tierANodes[0].nodeId);
                  else pushToast({ message: 'No active Tier A nodes', variant: 'warning' });
                }}
              >
                <cap.icon className={cn("w-3 h-3 mr-1.5", cap.color)} />
                {cap.label}
              </Button>
            ))}
          </div>

          {/* Last assessment result */}
          {cognitive.lastAssessment && (
            <div className="rounded-lg border border-border/10 p-2 bg-muted/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-medium text-foreground">{cognitive.lastAssessment.nodeId}</span>
                <span className="text-[8px] text-muted-foreground/40 font-mono">
                  Health: {cognitive.lastAssessment.healthAtAssessment}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] font-mono">
                <span className="text-muted-foreground/50">Recall</span>
                <span className="text-foreground">{Math.round(cognitive.lastAssessment.recallAccuracy * 100)}%</span>
                <span className="text-muted-foreground/50">Calibration</span>
                <span className="text-foreground">{Math.round(cognitive.lastAssessment.confidenceCalibration * 100)}%</span>
                <span className="text-muted-foreground/50">Drift</span>
                <span className={cn("text-foreground", cognitive.lastAssessment.driftScore > 0.4 && "text-neon-amber")}>
                  {Math.round(cognitive.lastAssessment.driftScore * 100)}%
                </span>
              </div>
              {cognitive.lastAssessment.recommendations.length > 0 && (
                <p className="text-[8px] text-muted-foreground/40 mt-0.5">
                  {cognitive.lastAssessment.recommendations[0]}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
