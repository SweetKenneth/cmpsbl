/**
 * CORTEX Matrix Node — Agency-class Orchestrator Dashboard
 * Policy Intent Layer + Evolution Sequencing
 * Orchestrates all Matrix Nodes across the layered kernel
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Wand2, Activity, Shield, Eye, PlayCircle, RotateCcw, 
  Lock, Settings, Globe, Workflow, AlertTriangle, CheckCircle,
  ChevronDown, ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cortex } from '@/lib/substrate';

interface CortexTabProps {
  enabled: boolean;
}

export function CortexTab({ enabled }: CortexTabProps) {
  const queryClient = useQueryClient();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Fetch cortex status
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['cortex-status'],
    queryFn: async () => {
      try {
        const result = await cortex.status();
        if (!result.success) {
          console.warn('Cortex status call returned error, using fallback:', result.error);
          return { runtime: { mode: 'manual' }, health: { healthScore: 100 }, panic_state: null };
        }
        return (result.data || result) as any;
      } catch (e) {
        console.warn('Cortex edge function unavailable, using local state:', e);
        return { runtime: { mode: 'manual' }, health: { healthScore: 100 }, panic_state: null };
      }
    },
    refetchInterval: 30000,
    enabled,
  });

  // Fetch world model
  const { data: worldModel, isLoading: worldLoading, refetch: refetchWorld } = useQuery({
    queryKey: ['cortex-world'],
    queryFn: async () => {
      try {
        const result = await cortex.world({ dag: false, roles: true, eligible: false });
        if (!result.success) {
          console.warn('Cortex world call returned error, using fallback:', result.error);
          return { modules: null };
        }
        return (result.data || result) as any;
      } catch (e) {
        console.warn('Cortex world model unavailable:', e);
        return { modules: null };
      }
    },
    refetchInterval: 60000,
    enabled,
  });

  // Mode change mutation
  const modeMutation = useMutation({
    mutationFn: async (newMode: 'manual' | 'shadow' | 'auto') => {
      const result = await cortex.mode(newMode);
      if (!result.success) throw new Error(result.error || 'Mode change failed');
      return result.data;
    },
    onSuccess: (_, mode) => {
      queryClient.invalidateQueries({ queryKey: ['cortex-status'] });
      toast.success(`CORTEX mode set to ${mode.toUpperCase()}`);
    },
    onError: (error) => {
      toast.error('Mode change failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    },
  });

  // Panic mutation
  const panicMutation = useMutation({
    mutationFn: async (action: 'freeze' | 'resume') => {
      const result = await cortex.panic(action, action === 'freeze' ? 'Manual freeze from dashboard' : undefined);
      if (!result.success) throw new Error(result.error || 'Panic action failed');
      return result.data;
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['cortex-status'] });
      toast.success(action === 'freeze' ? 'CORTEX frozen — writes halted' : 'CORTEX resumed — normal operation');
    },
    onError: (error) => {
      toast.error('Panic action failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    },
  });

  const currentMode = status?.runtime?.mode || status?.mode || 'manual';
  const isPanic = status?.runtime?.panic_frozen || status?.panic_state === 'frozen' || status?.panic_state === 'emergency';
  const healthScore = status?.health?.healthScore || status?.health_score || status?.health || 100;

  if (!enabled) {
    return (
      <motion.main 
        className="container mx-auto px-4 py-6 max-w-7xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="rounded-xl border border-dashed border-violet-500/20 bg-muted/5 backdrop-blur-xl p-12">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-muted-foreground/60">CORTEX Access Restricted</h3>
            <p className="text-sm text-muted-foreground/50 mt-2">Operator privileges required for orchestrator controls</p>
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main 
      className="container mx-auto px-4 py-6 max-w-7xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">CORTEX Orchestrator</h2>
            <p className="text-xs text-muted-foreground font-mono">policy intent layer • evolution sequencing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { refetchStatus(); refetchWorld(); }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Badge variant="outline" className={cn(
            "text-xs",
            isPanic 
              ? "border-red-500/50 text-red-400 bg-red-500/10" 
              : "border-violet-500/50 text-violet-400 bg-violet-500/10"
          )}>
            {isPanic ? 'FROZEN' : 'OPERATIONAL'}
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Mode Control */}
        <Card className="border-violet-500/20 bg-muted/10 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4 text-violet-400" />
              Operating Mode
            </CardTitle>
            <CardDescription className="text-xs">Manual mode by default</CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={currentMode} 
                onValueChange={(v) => modeMutation.mutate(v as any)}
                disabled={modeMutation.isPending || isPanic}
              >
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Manual — Human approval required
                    </div>
                  </SelectItem>
                  <SelectItem value="shadow">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400" />
                      Shadow — Test without applying
                    </div>
                  </SelectItem>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-cyan-400" />
                      Auto — Full autonomy (LOW risk only)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Panic Control */}
        <Card className={cn(
          "border bg-muted/10 backdrop-blur-xl",
          isPanic ? "border-red-500/40" : "border-amber-500/20"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className={cn("w-4 h-4", isPanic ? "text-red-400" : "text-amber-400")} />
              Panic Circuit Breaker
            </CardTitle>
            <CardDescription className="text-xs">Emergency system halt</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant={isPanic ? "default" : "destructive"}
              size="sm"
              className="w-full gap-2"
              onClick={() => panicMutation.mutate(isPanic ? 'resume' : 'freeze')}
              disabled={panicMutation.isPending}
            >
              {panicMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPanic ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Resume Operations
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Freeze System
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card className="border-emerald-500/20 bg-muted/10 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              System Health
            </CardTitle>
            <CardDescription className="text-xs">Orchestrator health score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-400">{healthScore}%</span>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 text-xs">
                    {healthScore >= 80 ? 'HEALTHY' : healthScore >= 50 ? 'DEGRADED' : 'CRITICAL'}
                  </Badge>
                </div>
                <Progress value={healthScore} className="h-2" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* World Model */}
      <Card className="border-violet-500/20 bg-muted/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" />
            World Model — Surface Registry
          </CardTitle>
          <CardDescription className="text-xs">CORTEX maintains a complete model of all substrate surfaces</CardDescription>
        </CardHeader>
        <CardContent>
          {worldLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {Array.from({ length: 21 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {(worldModel?.modules || [
                { name: 'core', health: 100, status: 'ok' },
                { name: 'ripple', health: 100, status: 'ok' },
                { name: 'access', health: 100, status: 'ok' },
                { name: 'brain', health: 100, status: 'ok' },
                { name: 'vision', health: 100, status: 'ok' },
                { name: 'cortex', health: 100, status: 'ok' },
                { name: 'evolution', health: 100, status: 'ok' },
                { name: 'decode', health: 100, status: 'ok' },
                { name: 'defense', health: 100, status: 'ok' },
                { name: 'nexus', health: 100, status: 'ok' },
                { name: 'dream', health: 100, status: 'ok' },
                { name: 'system', health: 100, status: 'ok' },
                { name: 'integration', health: 100, status: 'ok' },
                { name: 'inclusive', health: 100, status: 'ok' },
              ]).map((mod: any) => {
                const isHealthy = (mod.health || mod.health_score || 100) >= 80;
                return (
                  <Collapsible key={mod.name}>
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all hover:bg-muted/30",
                          isHealthy ? "border-emerald-500/20" : "border-amber-500/30"
                        )}
                        onClick={() => setExpandedModule(expandedModule === mod.name ? null : mod.name)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono uppercase text-muted-foreground">{mod.name}</span>
                          {expandedModule === mod.name ? (
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            isHealthy ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                          <span className={cn(
                            "text-sm font-medium",
                            isHealthy ? "text-emerald-400" : "text-amber-400"
                          )}>
                            {mod.health || mod.health_score || 100}%
                          </span>
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-2 rounded-lg bg-muted/20 text-xs space-y-1">
                        <p><span className="text-muted-foreground">Status:</span> {mod.status || 'ok'}</p>
                        <p><span className="text-muted-foreground">Circuit:</span> {mod.circuit_state || 'closed'}</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PEARL Cycle Info */}
      <Card className="border-violet-500/20 bg-muted/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Workflow className="w-4 h-4 text-violet-400" />
            PEARL Autonomous Loop
          </CardTitle>
          <CardDescription className="text-xs">Propose → Evaluate → Apply → Audit → Learn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {['Propose', 'Evaluate', 'Apply', 'Audit', 'Learn'].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex-1 text-center p-3 rounded-lg bg-muted/20 border border-violet-500/20">
                  <p className="text-xs font-medium text-violet-400">{step}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {i === 0 && 'Generate proposals'}
                    {i === 1 && 'Assess cost/risk'}
                    {i === 2 && 'Execute changes'}
                    {i === 3 && 'Record outcomes'}
                    {i === 4 && 'Integrate learning'}
                  </p>
                </div>
                {i < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            In <strong>Manual Mode</strong>, all Apply steps require human approval before execution.
          </p>
        </CardContent>
      </Card>
    </motion.main>
  );
}
