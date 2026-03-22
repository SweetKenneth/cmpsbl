/**
 * Evolution Status Dashboard — Real-time evolution state display
 * Shows runs, receipts, and system diagnostics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  FileCode, 
  Receipt, 
  CheckCircle2, 
  XCircle, 
  Clock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { evolutionRuns, type EvolutionRun } from '@/lib/evolve/evolution-runs';
import { evolutionReceipts, type EvolutionReceipt } from '@/lib/evolve/evolution-receipts';
import { diagnosticsEngine, type DiagnosticResult } from '@/lib/evolve/diagnostics';

export function EvolveStatusDashboard() {
  const [activeRun, setActiveRun] = useState<EvolutionRun | null>(null);
  const [recentRuns, setRecentRuns] = useState<EvolutionRun[]>([]);
  const [recentReceipts, setRecentReceipts] = useState<EvolutionReceipt[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const [active, runs, receipts, diag] = await Promise.all([
        evolutionRuns.getActiveRun(),
        evolutionRuns.getAllRuns(10),
        evolutionReceipts.getRecentReceipts(10),
        diagnosticsEngine.runDiagnostics(),
      ]);
      setActiveRun(active);
      setRecentRuns(runs);
      setRecentReceipts(receipts);
      setDiagnostics(diag);
    } catch (error) {
      console.error('Failed to refresh evolution status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-neon-green" />;
      case 'failed':
      case 'aborted':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-neon-amber" />;
    }
  };

  const getPhaseBadge = (phase: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      planning: 'outline',
      shadow_applied: 'secondary',
      production_applied: 'default',
      verified: 'default',
      aborted: 'destructive',
      failed: 'destructive',
    };
    return <Badge variant={variants[phase] || 'outline'}>{phase}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Evolution Status</h2>
            <p className="text-muted-foreground">Real-time evolution lifecycle</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Active Run Banner */}
      {activeRun && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 animate-pulse" />
              Active Evolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-sm">{activeRun.run_id.substring(0, 12)}...</p>
                <p className="text-xs text-muted-foreground">
                  Started {new Date(activeRun.created_at).toLocaleString()}
                </p>
              </div>
              {getPhaseBadge(activeRun.phase)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health */}
      {diagnostics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {diagnostics.status === 'healthy' ? (
                <CheckCircle2 className="h-4 w-4 text-neon-green" />
              ) : diagnostics.status === 'degraded' ? (
                <AlertTriangle className="h-4 w-4 text-neon-amber" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {diagnostics.components.map((comp) => (
                <Badge 
                  key={comp.name} 
                  variant={comp.status === 'ok' ? 'secondary' : comp.status === 'warn' ? 'outline' : 'destructive'}
                >
                  {comp.name}: {comp.latency_ms}ms
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Runs ({recentRuns.length})
          </TabsTrigger>
          <TabsTrigger value="receipts" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Receipts ({recentReceipts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Evolution Runs</CardTitle>
              <CardDescription>Last 10 evolution runs with their phases</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {recentRuns.map((run) => (
                    <div 
                      key={run.run_id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        {getPhaseIcon(run.phase)}
                        <div>
                          <p className="font-mono text-sm">{run.run_id.substring(0, 12)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(run.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {run.initiated_by}
                        </Badge>
                        {getPhaseBadge(run.phase)}
                      </div>
                    </div>
                  ))}
                  {recentRuns.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No evolution runs yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <CardTitle>Evolution Receipts 🔥</CardTitle>
              <CardDescription>Immutable audit trail of all evolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {recentReceipts.map((receipt) => (
                    <div 
                      key={receipt.receipt_id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-mono text-sm">{receipt.receipt_id.substring(0, 12)}...</p>
                          <p className="text-xs text-muted-foreground">
                            {receipt.changes_applied.length} changes | {receipt.tests_passed}/{receipt.tests_run} tests
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPhaseBadge(receipt.phase)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(receipt.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentReceipts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No receipts generated yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
