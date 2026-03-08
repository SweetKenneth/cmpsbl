/**
 * Evolution Tab — Self-Evolution Control Panel
 * Living Substrate Orchestration
 * 
 * Shadow-to-production execution pipeline with governance gating
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Dna, Play, History, Zap, 
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Brain, Code, FlaskConical, Rocket, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvolutionStatus {
  success: boolean;
  version: string;
  enabled: boolean;
  last_cycle?: string;
  cycles_total: number;
  cycles_today: number;
  max_per_day: number;
  health_threshold: number;
  components: Record<string, string>;
}

interface EvolutionCycle {
  id: string;
  timestamp: string;
  outcome: string;
  data: {
    cycle_id: string;
    phases: {
      scan: { status: string; improvements_found: number };
      generate: { status: string; code_generated: number };
      sandbox: { status: string; tests_passed: number; tests_failed: number };
      apply: { status: string; changes_applied: number };
      learn: { status: string; patterns_learned: number };
    };
    duration_ms?: number;
    dry_run?: boolean;
  };
}

const phaseIcons = {
  scan: <Zap className="w-4 h-4" />,
  generate: <Code className="w-4 h-4" />,
  sandbox: <FlaskConical className="w-4 h-4" />,
  apply: <Rocket className="w-4 h-4" />,
  learn: <Brain className="w-4 h-4" />,
};

const phaseColors: Record<string, string> = {
  pending: 'text-muted-foreground',
  running: 'text-primary animate-pulse',
  completed: 'text-emerald-400',
  failed: 'text-destructive',
  skipped: 'text-muted-foreground/50',
};

// Pre-defined phase architecture items with explicit Tailwind classes
// (dynamic template literals like `border-${color}-500` are NOT safe for JIT purge)
const ARCHITECTURE_PHASES = [
  { phase: 'SCAN', icon: Zap, desc: 'Detect improvements across all nodes', borderClass: 'border-cyan-500/20 bg-cyan-500/5', iconClass: 'text-cyan-400' },
  { phase: 'GENERATE', icon: Code, desc: 'ENCODE synthesizes code changes', borderClass: 'border-fuchsia-500/20 bg-fuchsia-500/5', iconClass: 'text-fuchsia-400' },
  { phase: 'SANDBOX', icon: FlaskConical, desc: 'Isolated verification & testing', borderClass: 'border-amber-500/20 bg-amber-500/5', iconClass: 'text-amber-400' },
  { phase: 'APPLY', icon: Rocket, desc: 'Deploy to shadow/production', borderClass: 'border-emerald-500/20 bg-emerald-500/5', iconClass: 'text-emerald-400' },
  { phase: 'LEARN', icon: Brain, desc: 'BRAIN records patterns', borderClass: 'border-purple-500/20 bg-purple-500/5', iconClass: 'text-purple-400' },
] as const;

export function EvolutionTab() {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState<EvolutionCycle['data'] | null>(null);

  // Fetch evolution status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['evolution-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-evolve', {
        body: { action: 'status' },
      });
      if (error) throw error;
      return data as EvolutionStatus;
    },
    refetchInterval: 10000,
  });

  // Fetch evolution history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['evolution-history'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-evolve', {
        body: { action: 'history' },
      });
      if (error) throw error;
      return data.cycles as EvolutionCycle[];
    },
  });

  // Run evolution cycle mutation
  const runCycle = useMutation({
    mutationFn: async (dryRun: boolean) => {
      setIsRunning(true);
      const { data, error } = await supabase.functions.invoke('pf-substrate-evolve', {
        body: { action: 'cycle', dry_run: dryRun, max_improvements: 3 },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setIsRunning(false);
      setCurrentCycle(data.cycle);
      queryClient.invalidateQueries({ queryKey: ['evolution-status'] });
      queryClient.invalidateQueries({ queryKey: ['evolution-history'] });
      toast.success(data.message || 'Evolution cycle completed');
    },
    onError: (error) => {
      setIsRunning(false);
      toast.error(error instanceof Error ? error.message : 'Evolution cycle failed');
    },
  });

  // Toggle evolution mutation
  const toggleEvolution = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-evolve', {
        body: { action: enabled ? 'resume' : 'pause' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['evolution-status'] });
      toast.success(data.message);
    },
  });

  const cyclesRemaining = status ? status.max_per_day - status.cycles_today : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Dna className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Self-Evolution</h2>
            <p className="text-xs text-muted-foreground">Living Substrate Orchestrator</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-Evolution</span>
            <Switch
              checked={status?.enabled ?? false}
              onCheckedChange={(checked) => toggleEvolution.mutate(checked)}
              disabled={toggleEvolution.isPending}
            />
          </div>
          
          <Badge variant="outline" className={cn(
            "text-xs",
            status?.enabled 
              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
              : "border-muted text-muted-foreground bg-muted/10"
          )}>
            {status?.enabled ? 'Active' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            {statusLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{status?.cycles_total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Cycles</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            {statusLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="text-center">
                <p className="text-3xl font-bold text-accent-foreground">{status?.cycles_today || 0}</p>
                <p className="text-xs text-muted-foreground">Today's Cycles</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            {statusLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">{cyclesRemaining}</p>
                <p className="text-xs text-muted-foreground">Remaining Today</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-4">
            {statusLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">{status?.health_threshold || 90}%</p>
                <p className="text-xs text-muted-foreground">Health Threshold</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Control */}
        <Card className="bg-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Run Evolution Cycle
            </CardTitle>
            <CardDescription>
              Scan → Generate → Sandbox → Apply → Learn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Cycle Progress */}
            {(isRunning || currentCycle) && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {isRunning ? 'Running...' : 'Last Cycle'}
                  </span>
                  {currentCycle?.dry_run && (
                    <Badge variant="outline" className="text-[10px]">DRY RUN</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  {(['scan', 'generate', 'sandbox', 'apply', 'learn'] as const).map((phase) => (
                    <div key={phase} className="flex items-center gap-3">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-muted/30", 
                        phaseColors[currentCycle?.phases?.[phase]?.status as string] || phaseColors.pending
                      )}>
                        {phaseIcons[phase]}
                      </div>
                      <span className="text-xs capitalize flex-1">{phase}</span>
                      <span className={cn("text-xs", 
                        phaseColors[currentCycle?.phases?.[phase]?.status as string] || phaseColors.pending
                      )}>
                        {currentCycle?.phases?.[phase]?.status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    className="flex-1 gap-2"
                    disabled={isRunning || cyclesRemaining <= 0}
                  >
                    {isRunning ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Cycle
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Start Evolution Cycle?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will scan for improvements, generate code, test in sandbox, and apply changes. 
                      The system will automatically learn from the results.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => runCycle.mutate(false)}
                    >
                      Run Full Cycle
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button 
                variant="outline"
                className="gap-2"
                disabled={isRunning || cyclesRemaining <= 0}
                onClick={() => runCycle.mutate(true)}
              >
                <FlaskConical className="w-4 h-4" />
                Dry Run
              </Button>
            </div>

            {cyclesRemaining <= 0 && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Daily cycle limit reached. Try again tomorrow.
              </p>
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Evolution History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              {historyLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : history && history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((cycle) => (
                    <div 
                      key={cycle.id}
                      className="p-3 rounded-lg bg-muted/10 border border-border/50 hover:border-border transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {cycle.outcome === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : cycle.outcome === 'no_improvements' ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="text-xs font-mono text-muted-foreground">
                            {cycle.data.cycle_id}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(cycle.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">
                          Found: <span className="text-foreground">{cycle.data.phases?.scan?.improvements_found || 0}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Generated: <span className="text-foreground">{cycle.data.phases?.generate?.code_generated || 0}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Applied: <span className="text-foreground">{cycle.data.phases?.apply?.changes_applied || 0}</span>
                        </span>
                        {cycle.data.duration_ms && (
                          <span className="text-muted-foreground">
                            {(cycle.data.duration_ms / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Dna className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No evolution cycles yet</p>
                  <p className="text-xs">Run your first cycle to start self-improvement</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Info */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Self-Evolution Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {ARCHITECTURE_PHASES.map((item, idx) => (
              <div key={item.phase} className="relative">
                <div className={cn("p-4 rounded-lg border text-center", item.borderClass)}>
                  <item.icon className={cn("w-6 h-6 mx-auto mb-2", item.iconClass)} />
                  <p className="text-sm font-medium">{item.phase}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-muted-foreground">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}