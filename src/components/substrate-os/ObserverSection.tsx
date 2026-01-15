/**
 * Observer Section — Read-only Telemetry
 * Shows system health, module status, metrics, and logs
 */

import { Brain, Shield, MessageSquare, Zap, Eye, Moon, CheckCircle2, AlertTriangle, XCircle, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useVisionHealthOS,
  useVisionMetricsOS,
  useVisionLogsOS,
  useBrainForecast,
  useBrainSynthesis,
  useSubstrateHealthScore,
} from '@/hooks/useSubstrateOS';

interface ModuleConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

const MODULES: ModuleConfig[] = [
  { id: 'brain', name: 'Brain', icon: Brain, colorClass: 'text-cyan-500', bgClass: 'bg-cyan-500/10' },
  { id: 'decode', name: 'Decode', icon: MessageSquare, colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' },
  { id: 'defense', name: 'Defense', icon: Shield, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
  { id: 'nexus', name: 'Nexus', icon: Zap, colorClass: 'text-green-500', bgClass: 'bg-green-500/10' },
  { id: 'vision', name: 'Vision', icon: Eye, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10' },
  { id: 'dream', name: 'Dream', icon: Moon, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10' },
];

function StatusIcon({ healthy }: { healthy: boolean | undefined }) {
  if (healthy === undefined) return <Skeleton className="h-4 w-4 rounded-full" />;
  return healthy ? (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ) : (
    <XCircle className="h-4 w-4 text-destructive" />
  );
}

export function ObserverSection() {
  const healthScore = useSubstrateHealthScore();
  const visionHealth = useVisionHealthOS();
  const visionMetrics = useVisionMetricsOS();
  const visionLogs = useVisionLogsOS(undefined, 10);
  const forecast = useBrainForecast();
  const synthesis = useBrainSynthesis();

  const metrics = visionMetrics.data?.data as { metrics?: Record<string, number> } | undefined;
  const logs = visionLogs.data?.data as { events?: Array<{ module: string; action: string; timestamp: string }> } | undefined;
  const forecastData = forecast.data?.data as { forecast_context?: Record<string, unknown> } | undefined;
  const synthesisData = synthesis.data?.data as { synthesis?: Record<string, unknown> } | undefined;

  return (
    <section className="space-y-4 md:space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Eye className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold">Observer</h2>
          <Badge variant="outline" className="text-xs">Read-only</Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => healthScore.refetch()}
          disabled={healthScore.isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${healthScore.isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* System Health Overview */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">System Health</CardTitle>
            {healthScore.isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <Badge 
                className={`gap-1 ${
                  healthScore.isHealthy 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : healthScore.isDegraded 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-destructive/10 text-destructive border-destructive/20'
                }`}
              >
                {healthScore.isHealthy ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : healthScore.isDegraded ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {healthScore.healthScore}% Healthy
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Module Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {MODULES.map((mod) => {
              const isHealthy = healthScore.modules[mod.id as keyof typeof healthScore.modules];
              return (
                <div 
                  key={mod.id}
                  className={`p-3 rounded-lg border ${mod.bgClass} flex items-center gap-2`}
                >
                  <mod.icon className={`w-4 h-4 ${mod.colorClass}`} />
                  <span className="text-sm font-medium flex-1">{mod.name}</span>
                  <StatusIcon healthy={healthScore.isLoading ? undefined : isHealthy} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metrics + Logs Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Key Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visionMetrics.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : metrics?.metrics ? (
              <div className="space-y-3">
                {Object.entries(metrics.metrics).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-lg font-semibold">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No metrics available yet. The substrate is alive but hasn't gathered data.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visionLogs.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : logs?.events && logs.events.length > 0 ? (
              <ScrollArea className="h-[180px]">
                <div className="space-y-2">
                  {logs.events.map((event, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm"
                    >
                      <Badge variant="outline" className="text-xs shrink-0">
                        {event.module}
                      </Badge>
                      <span className="text-muted-foreground truncate">{event.action}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Event stream quiet. The substrate watches, waiting for activity.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forecast + Synthesis */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Forecast */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-500" />
              Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forecast.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : forecastData?.forecast_context ? (
              <div className="text-sm space-y-1">
                {Object.entries(forecastData.forecast_context).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Forecast engine awaiting sufficient data...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Synthesis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              Synthesis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {synthesis.isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : synthesisData?.synthesis ? (
              <div className="text-sm space-y-1">
                {Object.entries(synthesisData.synthesis).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Cross-domain synthesis awaiting memory accumulation...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
