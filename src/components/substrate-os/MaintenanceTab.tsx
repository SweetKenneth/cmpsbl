/**
 * MaintenanceTab — Circuit breaker monitoring, repair logs, and system maintenance
 * Replaces legacy EnginesTab for the "Maintenance" sidebar entry
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMaintenanceEngine } from '@/hooks/useMaintenanceEngine';
import { cn } from '@/lib/utils';
import {
  Wrench, Shield, Activity, CheckCircle2, XCircle, AlertTriangle,
  Loader2, RefreshCw, Zap, Clock, CircuitBoard, Heart,
  Play, BarChart3, FileText, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface CircuitBreakerState {
  name: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailure: string | null;
  successRate: number;
}

interface RepairLog {
  id: string;
  executor: string;
  action: string;
  success: boolean;
  timestamp: string;
  detail?: string;
}

export function MaintenanceTab() {
  const maintenance = useMaintenanceEngine();
  const [activeSubTab, setActiveSubTab] = useState('status');
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerState[]>([]);
  const [repairLogs, setRepairLogs] = useState<RepairLog[]>([]);
  const [isLoadingCB, setIsLoadingCB] = useState(true);

  useEffect(() => {
    loadCircuitBreakers();
    loadRepairLogs();
  }, []);

  const loadCircuitBreakers = async () => {
    setIsLoadingCB(true);
    try {
      // Fetch from immune_metrics for real circuit breaker state
      const { data } = await supabase
        .from('immune_metrics')
        .select('executor, total_runs, repair_successes, escalations, safe_failures, repair_attempted, repair_success')
        .order('run_at', { ascending: false })
        .limit(100);

      // Aggregate per executor
      const executorMap: Record<string, { runs: number; successes: number; failures: number; escalations: number }> = {};
      (data || []).forEach((row: any) => {
        const ex = row.executor || 'unknown';
        if (!executorMap[ex]) executorMap[ex] = { runs: 0, successes: 0, failures: 0, escalations: 0 };
        executorMap[ex].runs += row.total_runs || 0;
        executorMap[ex].successes += row.repair_successes || 0;
        executorMap[ex].failures += row.safe_failures || 0;
        executorMap[ex].escalations += row.escalations || 0;
      });

      const cbs: CircuitBreakerState[] = Object.entries(executorMap).map(([name, stats]) => {
        const successRate = stats.runs > 0 ? Math.round((stats.successes / stats.runs) * 100) : 100;
        const state: 'closed' | 'open' | 'half-open' = 
          successRate >= 80 ? 'closed' : successRate >= 50 ? 'half-open' : 'open';
        return {
          name,
          state,
          failures: stats.failures + stats.escalations,
          lastFailure: null,
          successRate,
        };
      });

      // If no real data, seed defaults for all key modules
      if (cbs.length === 0) {
        const defaultModules = [
          'DEFENSE', 'NEXUS', 'CORTEX', 'ENGINEER', 'INTENT',
          'DECODE', 'MEMORY', 'BRAIK', 'NERVE', 'ATLAS'
        ];
        defaultModules.forEach(name => {
          cbs.push({ name, state: 'closed', failures: 0, lastFailure: null, successRate: 100 });
        });
      }

      setCircuitBreakers(cbs);
    } catch (err) {
      console.error('Failed to load circuit breakers:', err);
    } finally {
      setIsLoadingCB(false);
    }
  };

  const loadRepairLogs = async () => {
    try {
      const { data } = await supabase
        .from('immune_metrics')
        .select('executor, repair_attempted, repair_success, run_at, total_runs')
        .order('run_at', { ascending: false })
        .limit(30);

      const logs: RepairLog[] = (data || [])
        .filter((r: any) => r.repair_attempted)
        .map((r: any, i: number) => ({
          id: `repair-${i}`,
          executor: r.executor || 'unknown',
          action: r.repair_success ? 'Auto-repaired' : 'Repair attempted',
          success: !!r.repair_success,
          timestamp: r.run_at,
          detail: `${r.total_runs} total runs`,
        }));

      setRepairLogs(logs);
    } catch (err) {
      console.error('Failed to load repair logs:', err);
    }
  };

  const getCircuitIcon = (state: string) => {
    switch (state) {
      case 'closed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'open': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'half-open': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <CircuitBoard className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCircuitColor = (state: string) => {
    switch (state) {
      case 'closed': return 'border-emerald-500/30 bg-emerald-500/5';
      case 'open': return 'border-red-500/30 bg-red-500/5';
      case 'half-open': return 'border-amber-500/30 bg-amber-500/5';
      default: return 'border-border/30';
    }
  };

  const totalClosed = circuitBreakers.filter(c => c.state === 'closed').length;
  const totalOpen = circuitBreakers.filter(c => c.state === 'open').length;
  const totalHalfOpen = circuitBreakers.filter(c => c.state === 'half-open').length;
  const overallHealth = circuitBreakers.length > 0
    ? Math.round(circuitBreakers.reduce((a, b) => a + b.successRate, 0) / circuitBreakers.length)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">MAINTENANCE</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Circuit breakers · Repairs · Health checks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { loadCircuitBreakers(); loadRepairLogs(); toast.success('Refreshed'); }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => maintenance.runMaintenance('manual')}
            disabled={maintenance.isRunning}
            className="gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
          >
            {maintenance.isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Check
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Heart className="w-3 h-3" />
              Overall Health
            </div>
            <div className={cn("text-2xl font-bold", overallHealth >= 80 ? "text-emerald-400" : overallHealth >= 50 ? "text-amber-400" : "text-red-400")}>
              {overallHealth}%
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <CheckCircle2 className="w-3 h-3" />
              Circuits Closed
            </div>
            <div className="text-2xl font-bold text-emerald-400">{totalClosed}</div>
          </CardContent>
        </Card>
        <Card className={cn("bg-gradient-to-br to-transparent", totalOpen > 0 ? "from-red-500/5 border-red-500/20" : "from-muted/5 border-border/20")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <XCircle className="w-3 h-3" />
              Circuits Open
            </div>
            <div className={cn("text-2xl font-bold", totalOpen > 0 ? "text-red-400" : "text-muted-foreground")}>{totalOpen}</div>
          </CardContent>
        </Card>
        <Card className={cn("bg-gradient-to-br to-transparent", totalHalfOpen > 0 ? "from-amber-500/5 border-amber-500/20" : "from-muted/5 border-border/20")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <AlertTriangle className="w-3 h-3" />
              Half-Open
            </div>
            <div className={cn("text-2xl font-bold", totalHalfOpen > 0 ? "text-amber-400" : "text-muted-foreground")}>{totalHalfOpen}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/30">
          <TabsTrigger value="status" className="gap-2">
            <CircuitBoard className="w-4 h-4" />
            Circuits
          </TabsTrigger>
          <TabsTrigger value="repairs" className="gap-2">
            <Wrench className="w-4 h-4" />
            Repairs
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileText className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Circuit Breakers */}
        <TabsContent value="status" className="space-y-4 mt-4">
          {isLoadingCB ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {circuitBreakers.map((cb) => (
                  <motion.div
                    key={cb.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={cn("transition-colors", getCircuitColor(cb.state))}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getCircuitIcon(cb.state)}
                            <span className="font-semibold text-sm">{cb.name}</span>
                          </div>
                          <Badge 
                            variant="outline"
                            className={cn("text-[10px] uppercase font-mono",
                              cb.state === 'closed' ? 'border-emerald-500/40 text-emerald-400' :
                              cb.state === 'open' ? 'border-red-500/40 text-red-400' :
                              'border-amber-500/40 text-amber-400'
                            )}
                          >
                            {cb.state}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Success Rate</span>
                            <span className="font-mono">{cb.successRate}%</span>
                          </div>
                          <Progress value={cb.successRate} className="h-1.5" />
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{cb.failures} failures recorded</span>
                            {cb.lastFailure && (
                              <span>{formatDistanceToNow(new Date(cb.lastFailure), { addSuffix: true })}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Repair Logs */}
        <TabsContent value="repairs" className="space-y-4 mt-4">
          <ScrollArea className="h-[500px]">
            {repairLogs.length > 0 ? (
              <div className="space-y-2">
                {repairLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                    {log.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{log.executor}</span>
                        <Badge variant="outline" className={cn("text-[10px]",
                          log.success ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400"
                        )}>
                          {log.action}
                        </Badge>
                      </div>
                      {log.detail && <p className="text-[10px] text-muted-foreground mt-0.5">{log.detail}</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wrench className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No repair events recorded</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Run a maintenance check to generate repair logs</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Report History */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <ScrollArea className="h-[500px]">
            {maintenance.currentRun ? (
              <Card className="mb-4 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Latest Run
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">{maintenance.currentRun.engines.length}</div>
                      <div className="text-[10px] text-muted-foreground">Engines</div>
                    </div>
                    <div>
                      <div className={cn("text-lg font-bold",
                        maintenance.currentRun.overallStatus === 'passed' ? 'text-emerald-400' :
                        maintenance.currentRun.overallStatus === 'failed' ? 'text-red-400' : 'text-amber-400'
                      )}>
                        {maintenance.currentRun.overallStatus.toUpperCase()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Status</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{maintenance.currentRun.totalDurationMs}ms</div>
                      <div className="text-[10px] text-muted-foreground">Duration</div>
                    </div>
                  </div>
                  {maintenance.currentRun.engines.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {maintenance.currentRun.engines.map((eng, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                          <div className="flex items-center gap-2">
                            {eng.status === 'passed' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            ) : eng.status === 'failed' ? (
                              <XCircle className="w-3 h-3 text-red-500" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                            )}
                            <span className="font-medium">{eng.engineId}</span>
                          </div>
                          <span className="text-muted-foreground">{eng.durationMs}ms</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {maintenance.historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : maintenance.history.length > 0 ? (
              <div className="space-y-2">
                {maintenance.history.map((report: any, i: number) => (
                  <div key={report.id || i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      report.status === 'passed' ? 'bg-emerald-500/20' :
                      report.status === 'failed' ? 'bg-red-500/20' : 'bg-amber-500/20'
                    )}>
                      {report.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : report.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium capitalize">{report.status || 'unknown'}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {report.created_at ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true }) : '—'}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {report.duration_ms || 0}ms
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No maintenance reports yet</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Click "Run Check" to generate the first report</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
