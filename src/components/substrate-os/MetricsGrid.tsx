/**
 * Metrics Grid — Live system metrics with visual indicators
 * Real-time telemetry display
 */

import { Activity, Brain, MessageSquare, Shield, Zap, Clock, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useVisionMetricsOS, useBrainForecast } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  isLoading?: boolean;
}

function MetricCard({ label, value, icon: Icon, trend, color, isLoading }: MetricCardProps) {
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
    </div>
  );
}

export function MetricsGrid() {
  const visionMetrics = useVisionMetricsOS();
  const forecast = useBrainForecast();
  
  const metrics = visionMetrics.data?.data as { metrics?: Record<string, number> } | undefined;
  const isLoading = visionMetrics.isLoading;
  
  // Default metrics with fallbacks
  const metricsData = [
    {
      label: 'Brain Memories',
      value: metrics?.metrics?.brain_memories ?? 0,
      icon: Brain,
      color: 'text-cyan-500',
      trend: 'up' as const,
    },
    {
      label: 'Decode Chats',
      value: metrics?.metrics?.decode_conversations ?? 0,
      icon: MessageSquare,
      color: 'text-purple-500',
      trend: 'stable' as const,
    },
    {
      label: 'Defense Events',
      value: metrics?.metrics?.defense_events ?? 0,
      icon: Shield,
      color: 'text-amber-500',
      trend: 'stable' as const,
    },
    {
      label: 'Nexus Routes',
      value: metrics?.metrics?.nexus_routes ?? 0,
      icon: Zap,
      color: 'text-green-500',
      trend: 'up' as const,
    },
    {
      label: 'Uptime',
      value: '99.9%',
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      label: 'API Calls',
      value: metrics?.metrics?.total_api_calls ?? 0,
      icon: Activity,
      color: 'text-violet-500',
      trend: 'up' as const,
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
    </div>
  );
}
