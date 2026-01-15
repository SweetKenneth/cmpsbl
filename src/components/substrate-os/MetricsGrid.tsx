/**
 * Metrics Grid — Live system metrics with visual indicators
 * Real-time telemetry display from database
 */

import { Activity, Brain, MessageSquare, Shield, Zap, Moon, TrendingUp, Database, Cpu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveDashboardMetrics, useLiveBrainEvents, useLiveForecasts } from '@/hooks/useSubstrateOSLive';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  isLoading?: boolean;
  subValue?: string;
}

function MetricCard({ label, value, icon: Icon, trend, color, isLoading, subValue }: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 rounded-lg border border-border/50 bg-card/30">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }
  
  return (
    <div className={cn(
      "group relative p-4 rounded-lg border transition-all duration-300",
      "hover:scale-[1.02] hover:shadow-lg",
      "border-border/50 bg-card/30 hover:border-current/30",
      color
    )}>
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity blur-xl -z-10",
        color.replace('text-', 'bg-')
      )} />
      
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <TrendingUp className={cn(
            "w-4 h-4 mb-1",
            trend === 'up' ? "text-green-500" :
            trend === 'down' ? "text-red-500 rotate-180" :
            "text-muted-foreground"
          )} />
        )}
      </div>
      {subValue && (
        <p className="text-[10px] text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  );
}

export function MetricsGrid() {
  const dashboard = useLiveDashboardMetrics();
  const brainEvents = useLiveBrainEvents();
  const forecasts = useLiveForecasts();
  
  const isLoading = dashboard.isLoading;
  
  // Real metrics from database
  const metricsData = [
    {
      label: 'Brain Memories',
      value: dashboard.metrics.brainMemories,
      icon: Brain,
      color: 'text-cyan-500',
      trend: 'up' as const,
      subValue: 'Stored memories',
    },
    {
      label: 'Decode Chats',
      value: dashboard.metrics.decodeConversations,
      icon: MessageSquare,
      color: 'text-purple-500',
      trend: 'stable' as const,
      subValue: 'Conversations',
    },
    {
      label: 'Defense Events',
      value: dashboard.metrics.defenseEvents,
      icon: Shield,
      color: 'text-amber-500',
      trend: 'stable' as const,
      subValue: 'Threats analyzed',
    },
    {
      label: 'Nexus Routes',
      value: dashboard.metrics.nexusRoutes,
      icon: Zap,
      color: 'text-green-500',
      trend: 'up' as const,
      subValue: 'AI calls routed',
    },
    {
      label: 'Dream Submissions',
      value: dashboard.metrics.dreamSubmissions,
      icon: Moon,
      color: 'text-violet-500',
      trend: 'up' as const,
      subValue: 'Dreams consumed',
    },
    {
      label: 'AI Tokens',
      value: dashboard.metrics.aiTokensUsed > 1000000 
        ? `${(dashboard.metrics.aiTokensUsed / 1000000).toFixed(1)}M`
        : dashboard.metrics.aiTokensUsed > 1000 
        ? `${(dashboard.metrics.aiTokensUsed / 1000).toFixed(1)}K`
        : dashboard.metrics.aiTokensUsed,
      icon: Cpu,
      color: 'text-blue-500',
      trend: 'up' as const,
      subValue: `$${dashboard.metrics.aiCostTotal.toFixed(2)} cost`,
    },
  ];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Live Telemetry
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricsData.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
            isLoading={isLoading}
          />
        ))}
      </div>
      
      {/* Orchestrator Status - if available */}
      {dashboard.orchestrator && (
        <div className="mt-4 p-3 rounded-lg border border-border/50 bg-card/30">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Orchestrator</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Status</span>
              <p className="font-medium capitalize">{dashboard.orchestrator.status || 'idle'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Phase</span>
              <p className="font-medium capitalize">{dashboard.orchestrator.current_phase || 'waiting'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Cycles</span>
              <p className="font-medium">{dashboard.orchestrator.cycles_completed ?? 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Health</span>
              <p className={cn(
                "font-medium",
                (dashboard.orchestrator.health_score ?? 0) >= 80 ? "text-green-500" :
                (dashboard.orchestrator.health_score ?? 0) >= 50 ? "text-amber-500" : "text-red-500"
              )}>
                {dashboard.orchestrator.health_score ?? 0}%
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Dream-Eater State - if available */}
      {dashboard.dreamEater && (
        <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Dream-Eater</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Mood</span>
              <p className="font-medium capitalize">{dashboard.dreamEater.current_mood || 'neutral'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Dreams Today</span>
              <p className="font-medium">{dashboard.dreamEater.dreams_consumed_today ?? 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Nightmares</span>
              <p className="font-medium text-amber-500">{dashboard.dreamEater.nightmares_consumed_today ?? 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Mutation Level</span>
              <p className="font-medium">{dashboard.dreamEater.mutation_level ?? 1}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
