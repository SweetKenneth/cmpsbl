/**
 * NodeDreamingWidget — Dream observability for the dashboard
 * Shows dream tier activity, recent logs, and analytics summary.
 */

import { Moon, Sparkles, AlertTriangle, Activity, Zap, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNodeDreaming } from '@/hooks/substrate/useNodeDreaming';
import { pushToast } from '@/components/toast/SmartToastStore';
import type { DreamCycleType } from '@/lib/substrate/node-dreaming';

const TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  A: { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  B: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  C: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
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
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <Moon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
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
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">Total Dreams</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-mono text-foreground">{totalDreams}</span>
          </div>
          <div className="rounded-lg border border-border/10 p-2.5 bg-muted/5">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-wider">Insights</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-mono text-foreground">{totalInsights}</span>
          </div>
        </div>

        {/* Analytics summary */}
        {analyticsSummary && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Contradictions', value: analyticsSummary.avgContradictions ?? 0, icon: AlertTriangle, color: 'text-rose-500' },
              { label: 'Merged', value: analyticsSummary.avgPatternsMerged ?? 0, icon: Activity, color: 'text-cyan-500' },
              { label: 'Success', value: `${Math.round((analyticsSummary.successRate ?? 0) * 100)}%`, icon: Sparkles, color: 'text-amber-500' },
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
                        <Moon className="w-3 h-3 text-violet-400 shrink-0" />
                        <span className="font-mono font-medium text-foreground truncate">{log.nodeId}</span>
                        <Badge variant="outline" className="text-[8px] ml-auto border-border/20 shrink-0">
                          {CYCLE_LABELS[log.cycleType as DreamCycleType] ?? log.cycleType}
                        </Badge>
                        {log.success ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
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
                    className="h-7 px-2.5 text-[10px] font-mono border-violet-500/20 hover:bg-violet-500/10 hover:border-violet-500/30"
                    onClick={() => handleTrigger(c.nodeId)}
                    disabled={triggerDream.isPending}
                  >
                    {triggerDream.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Moon className="w-3 h-3 mr-1 text-violet-400" />
                    )}
                    {c.nodeId}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
