/**
 * Mesh Auto-Scheduler Panel
 * Controls and monitors the periodic self-improvement cycles
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Timer, Play, Square, RefreshCw, Sparkles,
  Search, BarChart3, Expand, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { meshScheduler, type SchedulerState } from '@/lib/substrate/intent-mesh/auto-scheduler';
import { useMeshToggle } from '@/lib/substrate/intent-mesh/toggle';

function formatDuration(ms: number): string {
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)}h`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)}h`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)}m`;
  return `${(ms / 1000).toFixed(0)}s`;
}

function formatTime(iso: string | null): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MeshSchedulerPanel() {
  const { enabled: meshEnabled } = useMeshToggle();
  const [state, setState] = useState<SchedulerState>(meshScheduler.getState());
  const [runningOnce, setRunningOnce] = useState(false);

  const refreshState = () => setState(meshScheduler.getState());

  const handleToggleScheduler = () => {
    if (state.isRunning) {
      meshScheduler.stop();
      toast.info('Auto-scheduler stopped');
    } else {
      if (!meshEnabled) {
        toast.error('Enable the Intent Mesh first');
        return;
      }
      meshScheduler.start();
      toast.success('Auto-scheduler started');
    }
    refreshState();
  };

  const handleRunOnce = async () => {
    if (!meshEnabled) {
      toast.error('Enable the Intent Mesh first');
      return;
    }
    setRunningOnce(true);
    try {
      const result = await meshScheduler.runOnce();
      toast.success(
        `Full cycle complete: ${result.moduleDiscovery} proposals, ${result.gapAnalysis.gaps} gaps, ${result.intentScoring} scored, ${result.expansion} expanded`
      );
      refreshState();
    } catch {
      toast.error('Cycle failed');
    } finally {
      setRunningOnce(false);
    }
  };

  const cycles = [
    {
      label: 'Module Discovery',
      icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />,
      interval: state.config.moduleDiscoveryIntervalMs,
      lastRun: state.lastModuleDiscovery,
      color: 'border-fuchsia-500/20',
    },
    {
      label: 'Gap Analysis',
      icon: <Search className="w-4 h-4 text-cyan-400" />,
      interval: state.config.gapAnalysisIntervalMs,
      lastRun: state.lastGapAnalysis,
      color: 'border-cyan-500/20',
    },
    {
      label: 'Intent Scoring',
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
      interval: state.config.intentScoringIntervalMs,
      lastRun: state.lastIntentScoring,
      color: 'border-amber-500/20',
    },
    {
      label: 'Full Expansion',
      icon: <Expand className="w-4 h-4 text-emerald-400" />,
      interval: state.config.fullExpansionIntervalMs,
      lastRun: state.lastFullExpansion,
      color: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Scheduler Controls */}
      <Card className="border border-violet-500/20 bg-violet-500/5">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Timer className="w-5 h-5 text-violet-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">Auto-Expansion Scheduler</p>
                <p className="text-xs text-muted-foreground truncate">
                  Periodic self-improvement cycles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRunOnce}
                disabled={runningOnce || !meshEnabled}
                className="gap-2"
              >
                {runningOnce ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                Run Once
              </Button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30">
                {state.isRunning ? (
                  <Square className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Play className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-xs font-medium">Scheduler</span>
                <Switch checked={state.isRunning} onCheckedChange={handleToggleScheduler} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cycle Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cycles.map(cycle => (
          <Card key={cycle.label} className={cn("border bg-muted/10", cycle.color)}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cycle.icon}
                  <span className="text-sm font-medium">{cycle.label}</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  every {formatDuration(cycle.interval)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                Last run: {formatTime(cycle.lastRun)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lifetime Stats */}
      <Card className="border border-border/30 bg-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            Lifetime Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{state.totalCyclesRun}</div>
              <p className="text-[10px] text-muted-foreground">Cycles Run</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{state.totalProposalsGenerated}</div>
              <p className="text-[10px] text-muted-foreground">Proposals Generated</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{state.totalCapabilitiesExpanded}</div>
              <p className="text-[10px] text-muted-foreground">Capabilities Expanded</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Config */}
      <Card className="border border-border/30 bg-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between p-2 rounded bg-muted/20">
              <span className="text-muted-foreground">Auto-apply threshold</span>
              <span className="font-mono">{(state.config.autoApplyThreshold * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/20">
              <span className="text-muted-foreground">Max proposals/cycle</span>
              <span className="font-mono">{state.config.maxProposalsPerCycle}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
