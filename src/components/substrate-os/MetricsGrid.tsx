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
      <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }

  const colorMap: Record<string, { border: string; glow: string; icon: string }> = {
    'text-cyan-500': { border: 'border-cyan-500/30 hover:border-cyan-400/60', glow: 'bg-cyan-500', icon: 'text-cyan-400' },
    'text-purple-500': { border: 'border-purple-500/30 hover:border-purple-400/60', glow: 'bg-purple-500', icon: 'text-purple-400' },
    'text-amber-500': { border: 'border-amber-500/30 hover:border-amber-400/60', glow: 'bg-amber-500', icon: 'text-amber-400' },
    'text-green-500': { border: 'border-green-500/30 hover:border-green-400/60', glow: 'bg-green-500', icon: 'text-green-400' },
    'text-violet-500': { border: 'border-violet-500/30 hover:border-violet-400/60', glow: 'bg-violet-500', icon: 'text-violet-400' },
    'text-blue-500': { border: 'border-blue-500/30 hover:border-blue-400/60', glow: 'bg-blue-500', icon: 'text-blue-400' },
  };
  
  const colorStyles = colorMap[color] || colorMap['text-cyan-500'];
  
  return (
    <div className={cn(
      "group relative p-4 rounded-xl transition-all duration-300",
      "hover:scale-[1.02] hover:shadow-lg",
      "bg-white/5 dark:bg-white/[0.03] backdrop-blur-xl border",
      colorStyles.border
    )}>
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity blur-xl -z-10",
        colorStyles.glow
      )} />
      
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center",
          "bg-white/10 border border-white/10"
        )}>
          <Icon className={cn("w-3.5 h-3.5", colorStyles.icon)} />
        </div>
      </div>
      
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <TrendingUp className={cn(
            "w-4 h-4 mb-1",
            trend === 'up' ? "text-emerald-400" :
            trend === 'down' ? "text-red-400 rotate-180" :
            "text-muted-foreground"
          )} />
        )}
      </div>
      {subValue && (
        <p className="text-[10px] text-muted-foreground/80 mt-1">{subValue}</p>
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
        <div className="mt-4 p-4 rounded-xl border border-cyan-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Orchestrator</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-muted-foreground text-[10px] uppercase">Status</span>
              <p className="font-medium capitalize text-foreground">{dashboard.orchestrator.status || 'idle'}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-muted-foreground text-[10px] uppercase">Phase</span>
              <p className="font-medium capitalize text-foreground">{dashboard.orchestrator.current_phase || 'waiting'}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-muted-foreground text-[10px] uppercase">Cycles</span>
              <p className="font-medium text-foreground">{dashboard.orchestrator.cycles_completed ?? 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-muted-foreground text-[10px] uppercase">Health</span>
              <p className={cn(
                "font-medium",
                (dashboard.orchestrator.health_score ?? 0) >= 80 ? "text-emerald-400" :
                (dashboard.orchestrator.health_score ?? 0) >= 50 ? "text-amber-400" : "text-red-400"
              )}>
                {dashboard.orchestrator.health_score ?? 0}%
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Dream-Eater State - if available */}
      {dashboard.dreamEater && (
        <div className="p-4 rounded-xl border border-fuchsia-500/20 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Moon className="w-3.5 h-3.5 text-fuchsia-400" />
            </div>
            <span className="text-xs font-mono text-fuchsia-400 uppercase tracking-wider">Dream-Eater</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-muted-foreground text-[10px] uppercase">Mood</span>
              <p className="font-medium capitalize text-foreground">{dashboard.dreamEater.current_mood || 'neutral'}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-muted-foreground text-[10px] uppercase">Dreams Today</span>
              <p className="font-medium text-foreground">{dashboard.dreamEater.dreams_consumed_today ?? 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-muted-foreground text-[10px] uppercase">Nightmares</span>
              <p className="font-medium text-amber-400">{dashboard.dreamEater.nightmares_consumed_today ?? 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <span className="text-muted-foreground text-[10px] uppercase">Mutation</span>
              <p className="font-medium text-foreground">{dashboard.dreamEater.mutation_level ?? 1}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
