/**
 * System Health Panel — Live health diagnostics and auto-heal
 * Real-time system status with healing controls
 */

import { useState } from 'react';
import { Heart, Activity, RefreshCw, Loader2, CheckCircle2, XCircle, AlertTriangle, Wrench, Server, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { useSystemHeal, useSystemRestart, useSystemBackup } from '@/hooks/useSubstrateOSEnhanced';
import { useLiveOrchestratorState, useLiveAIUsage } from '@/hooks/useSubstrateOSLive';
import { toast } from 'sonner';

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

  const moduleStatus = [
    { name: 'Vision', key: 'vision', healthy: healthScore.modules.vision },
    { name: 'Brain', key: 'brain', healthy: healthScore.modules.brain },
    { name: 'Defense', key: 'defense', healthy: healthScore.modules.defense },
    { name: 'Nexus', key: 'nexus', healthy: healthScore.modules.nexus },
    { name: 'Dream', key: 'dream', healthy: healthScore.modules.dream },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center">
          <Heart className="w-3.5 h-3.5 text-green-500" />
        </div>
        <h3 className="text-sm font-medium">System Health</h3>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px]",
            healthScore.isHealthy ? "border-green-500/50 text-green-500" :
            healthScore.isDegraded ? "border-amber-500/50 text-amber-500" :
            "border-red-500/50 text-red-500"
          )}
        >
          {healthScore.healthScore}%
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Overall Health */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {healthScore.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Health Score</span>
                  <span className={cn(
                    "text-2xl font-bold",
                    healthScore.isHealthy ? "text-green-500" :
                    healthScore.isDegraded ? "text-amber-500" :
                    "text-red-500"
                  )}>
                    {healthScore.healthScore}%
                  </span>
                </div>
                <Progress 
                  value={healthScore.healthScore} 
                  className={cn(
                    "h-2",
                    healthScore.isHealthy ? "[&>div]:bg-green-500" :
                    healthScore.isDegraded ? "[&>div]:bg-amber-500" :
                    "[&>div]:bg-red-500"
                  )}
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {moduleStatus.map((mod) => (
                    <Badge 
                      key={mod.key}
                      variant="outline" 
                      className={cn(
                        "text-[9px] h-5",
                        mod.healthy ? "border-green-500/30 text-green-500" : "border-red-500/30 text-red-500"
                      )}
                    >
                      {mod.healthy ? <CheckCircle2 className="w-2 h-2 mr-1" /> : <XCircle className="w-2 h-2 mr-1" />}
                      {mod.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orchestrator Status */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-500" />
              Orchestrator
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {orchestrator.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : orchestrator.data ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-[9px] h-4 capitalize">
                    {orchestrator.data.status || 'idle'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phase</span>
                  <span className="capitalize">{orchestrator.data.current_phase || 'waiting'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cycles</span>
                  <span className="font-mono">{orchestrator.data.cycles_completed ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-heal</span>
                  <span className="font-mono">{orchestrator.data.auto_heal_attempts ?? 0} attempts</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                Orchestrator offline
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Usage Stats */}
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-500" />
              AI Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {aiUsage.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : aiUsage.data ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens Used</span>
                  <span className="font-mono">
                    {aiUsage.data.totalTokens > 1000000 
                      ? `${(aiUsage.data.totalTokens / 1000000).toFixed(1)}M`
                      : aiUsage.data.totalTokens > 1000
                      ? `${(aiUsage.data.totalTokens / 1000).toFixed(1)}K`
                      : aiUsage.data.totalTokens}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Cost</span>
                  <span className="font-mono">${aiUsage.data.totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recent Calls</span>
                  <span className="font-mono">{aiUsage.data.recentCount}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {Object.entries(aiUsage.data.providerCounts).slice(0, 3).map(([provider, count]) => (
                    <Badge key={provider} variant="outline" className="text-[9px] h-4">
                      {provider}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                No AI usage data
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Healing Controls */}
      {enabled && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => healthScore.refetch()}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Status
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10"
            onClick={() => handleHeal()}
            disabled={healMutation.isPending}
          >
            {healMutation.isPending && !healTarget ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wrench className="w-3.5 h-3.5" />
            )}
            Auto-Heal All
          </Button>
          
          {!healthScore.modules.brain && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              onClick={() => handleHeal('brain')}
              disabled={healMutation.isPending}
            >
              {healMutation.isPending && healTarget === 'brain' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              Heal Brain
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => backupMutation.mutate()}
            disabled={backupMutation.isPending}
          >
            {backupMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Server className="w-3.5 h-3.5" />
            )}
            Create Backup
          </Button>
        </div>
      )}
    </div>
  );
}
