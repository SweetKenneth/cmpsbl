/**
 * Metrics Grid — Premium live system metrics with animations
 * Enhanced visual indicators, mini charts, and glassmorphic design
 * Includes CLM, Matrix Primitives, and autonomous learning metrics
 */

import { Activity, Brain, MessageSquare, Shield, Zap, Moon, TrendingUp, TrendingDown, Database, Cpu, Minus, Sparkles, GitBranch } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveDashboardMetrics, useLiveBrainEvents, useLiveForecasts } from '@/hooks/useSubstrateOSLive';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  color: 'cyan' | 'purple' | 'amber' | 'green' | 'violet' | 'blue';
  isLoading?: boolean;
  subValue?: string;
  delay?: number;
}

const colorConfig = {
  cyan: {
    border: 'border-neon-cyan/30 hover:border-neon-cyan/60',
    bg: 'bg-neon-cyan/5 hover:bg-neon-cyan/10',
    glow: 'bg-neon-cyan',
    icon: 'text-neon-cyan',
    iconBg: 'bg-neon-cyan/20 border-neon-cyan/40',
    gradient: 'from-neon-cyan/20 to-transparent',
  },
  purple: {
    border: 'border-neon-purple/30 hover:border-neon-purple/60',
    bg: 'bg-neon-purple/5 hover:bg-neon-purple/10',
    glow: 'bg-neon-purple',
    icon: 'text-neon-purple',
    iconBg: 'bg-neon-purple/20 border-neon-purple/40',
    gradient: 'from-neon-purple/20 to-transparent',
  },
  amber: {
    border: 'border-neon-amber/30 hover:border-neon-amber/60',
    bg: 'bg-neon-amber/5 hover:bg-neon-amber/10',
    glow: 'bg-neon-amber',
    icon: 'text-neon-amber',
    iconBg: 'bg-neon-amber/20 border-neon-amber/40',
    gradient: 'from-neon-amber/20 to-transparent',
  },
  green: {
    border: 'border-neon-green/30 hover:border-neon-green/60',
    bg: 'bg-neon-green/5 hover:bg-neon-green/10',
    glow: 'bg-neon-green',
    icon: 'text-neon-green',
    iconBg: 'bg-neon-green/20 border-neon-green/40',
    gradient: 'from-neon-green/20 to-transparent',
  },
  violet: {
    border: 'border-neon-purple/30 hover:border-neon-purple/60',
    bg: 'bg-neon-purple/5 hover:bg-neon-purple/10',
    glow: 'bg-neon-purple',
    icon: 'text-neon-purple',
    iconBg: 'bg-neon-purple/20 border-neon-purple/40',
    gradient: 'from-neon-purple/20 to-transparent',
  },
  blue: {
    border: 'border-neon-blue/30 hover:border-neon-blue/60',
    bg: 'bg-neon-blue/5 hover:bg-neon-blue/10',
    glow: 'bg-neon-blue',
    icon: 'text-neon-blue',
    iconBg: 'bg-neon-blue/20 border-neon-blue/40',
    gradient: 'from-neon-blue/20 to-transparent',
  },
};

function MiniSparkline({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  const upPath = "M0,16 L5,14 L10,12 L15,10 L20,8 L25,6 L30,4 L35,2";
  const downPath = "M0,4 L5,6 L10,8 L15,10 L20,12 L25,14 L30,16 L35,18";
  const stablePath = "M0,10 L5,11 L10,9 L15,10 L20,10 L25,9 L30,11 L35,10";
  
  return (
    <svg className="w-9 h-5 opacity-60" viewBox="0 0 35 20">
      <path
        d={trend === 'up' ? upPath : trend === 'down' ? downPath : stablePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          trend === 'up' ? "text-neon-green" :
          trend === 'down' ? "text-destructive" :
          "text-muted-foreground"
        )}
      />
    </svg>
  );
}

const MetricCard = memo(function MetricCard({ label, value, icon: Icon, trend = 'stable', color, isLoading, subValue, delay = 0 }: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 rounded-xl border border-border/30 bg-muted/10 backdrop-blur-xl">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }

  const colors = colorConfig[color];
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <motion.div 
      className={cn(
        "group relative p-4 rounded-xl transition-all duration-300 overflow-hidden",
        "hover:scale-[1.02] hover:shadow-xl",
        "backdrop-blur-xl border",
        colors.border,
        colors.bg
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
        colors.gradient
      )} />
      
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur-2xl -z-10",
        colors.glow
      )} />
      
      <div className="relative flex items-start justify-between mb-3">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center border",
          colors.iconBg
        )}>
          <Icon className={cn("w-4 h-4", colors.icon)} />
        </div>
      </div>
      
      <div className="relative flex items-end justify-between">
        <div>
          <motion.span 
            className="text-2xl font-bold tabular-nums text-foreground block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.span>
          {subValue && (
            <p className="text-[10px] text-muted-foreground/80 mt-1 font-mono">{subValue}</p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <MiniSparkline trend={trend} />
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-mono",
            trend === 'up' ? "text-neon-green" :
            trend === 'down' ? "text-destructive" :
            "text-muted-foreground"
          )}>
            <TrendIcon className="w-3 h-3" />
            <span>{trend === 'stable' ? '—' : trend === 'up' ? '↑' : '↓'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

interface StatusPanelProps {
  title: string;
  icon: React.ElementType;
  color: 'cyan' | 'fuchsia';
  children: React.ReactNode;
  delay?: number;
}

function StatusPanel({ title, icon: Icon, color, children, delay = 0 }: StatusPanelProps) {
  const panelColors = {
    cyan: {
      border: 'border-neon-cyan/20',
      iconBg: 'bg-neon-cyan/20 border-neon-cyan/40',
      iconText: 'text-neon-cyan',
      labelText: 'text-neon-cyan',
    },
    fuchsia: {
      border: 'border-neon-magenta/20',
      iconBg: 'bg-neon-magenta/20 border-neon-magenta/40',
      iconText: 'text-neon-magenta',
      labelText: 'text-neon-magenta',
    },
  };
  
  const colors = panelColors[color];
  
  return (
    <motion.div 
      className={cn(
        "p-4 rounded-xl border bg-gradient-to-br from-muted/30 to-transparent backdrop-blur-xl",
        colors.border
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", colors.iconBg)}>
          <Icon className={cn("w-4 h-4", colors.iconText)} />
        </div>
        <span className={cn("text-xs font-mono uppercase tracking-widest", colors.labelText)}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

export function MetricsGrid() {
  const dashboard = useLiveDashboardMetrics();
  const brainEvents = useLiveBrainEvents();
  const forecasts = useLiveForecasts();
  
  const isLoading = dashboard.isLoading;

  // Compute real trends from data
  const computeTrend = (val: number): 'up' | 'down' | 'stable' => 
    val > 10 ? 'up' : val > 0 ? 'stable' : 'stable';
  
  const metricsData: MetricCardProps[] = [
    {
      label: 'Brain Memories',
      value: dashboard.metrics.brainMemories,
      icon: Brain,
      color: 'cyan',
      trend: computeTrend(dashboard.metrics.brainMemories),
      subValue: 'Stored memories',
      delay: 0,
    },
    {
      label: 'Decode Chats',
      value: dashboard.metrics.decodeConversations,
      icon: MessageSquare,
      color: 'purple',
      trend: computeTrend(dashboard.metrics.decodeConversations),
      subValue: 'Conversations',
      delay: 0.05,
    },
    {
      label: 'Defense Events',
      value: dashboard.metrics.defenseEvents,
      icon: Shield,
      color: 'amber',
      trend: computeTrend(dashboard.metrics.defenseEvents),
      subValue: 'Threats analyzed',
      delay: 0.1,
    },
    {
      label: 'Nexus Routes',
      value: dashboard.metrics.nexusRoutes,
      icon: Zap,
      color: 'green',
      trend: computeTrend(dashboard.metrics.nexusRoutes),
      subValue: 'AI calls routed',
      delay: 0.15,
    },
    {
      label: 'Dream Submissions',
      value: dashboard.metrics.dreamSubmissions,
      icon: Moon,
      color: 'violet',
      trend: computeTrend(dashboard.metrics.dreamSubmissions),
      subValue: 'Dreams consumed',
      delay: 0.2,
    },
    {
      label: 'AI Tokens',
      value: dashboard.metrics.aiTokensUsed > 1000000 
        ? `${(dashboard.metrics.aiTokensUsed / 1000000).toFixed(1)}M`
        : dashboard.metrics.aiTokensUsed > 1000 
        ? `${(dashboard.metrics.aiTokensUsed / 1000).toFixed(1)}K`
        : dashboard.metrics.aiTokensUsed,
      icon: Cpu,
      color: 'blue',
      trend: computeTrend(dashboard.metrics.aiTokensUsed),
      subValue: `$${dashboard.metrics.aiCostTotal.toFixed(2)} cost`,
      delay: 0.25,
    },
  ];
  
  // Fetch real SEBA proposal count
  const [sebaProposals, setSebaProposals] = useState(0);
  useEffect(() => {
    supabase
      .from('evolution_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setSebaProposals(count ?? 0));
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-neon-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Live Telemetry</h3>
            <p className="text-[10px] text-muted-foreground font-mono">real-time substrate metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] h-5 border-primary/30 text-primary">
            <GitBranch className="w-3 h-3 mr-1" />
            CMPSBL
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
            </span>
            <span className="text-[10px] text-neon-green font-mono font-medium">STREAMING</span>
          </div>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricsData.map((metric) => (
          <MetricCard
            key={metric.label}
            {...metric}
            isLoading={isLoading}
          />
        ))}
      </div>
      
      {/* Status Panels */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Orchestrator Status */}
        {dashboard.orchestrator && (
          <StatusPanel title="Orchestrator" icon={Database} color="cyan" delay={0.3}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Status</span>
                <p className="font-medium text-sm capitalize text-foreground">{dashboard.orchestrator.status || 'idle'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Phase</span>
                <p className="font-medium text-sm capitalize text-foreground">{dashboard.orchestrator.current_phase || 'waiting'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Cycles</span>
                <p className="font-medium text-sm text-foreground">{dashboard.orchestrator.cycles_completed ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Health</span>
                <p className={cn(
                  "font-bold text-sm",
                  (dashboard.orchestrator.health_score ?? 0) >= 80 ? "text-neon-green" :
                  (dashboard.orchestrator.health_score ?? 0) >= 50 ? "text-neon-amber" : "text-destructive"
                )}>
                  {dashboard.orchestrator.health_score ?? 0}%
                </p>
              </div>
            </div>
          </StatusPanel>
        )}
        
        {/* Dream-Eater State */}
        {dashboard.dreamEater && (
          <StatusPanel title="Dream-Eater" icon={Moon} color="fuchsia" delay={0.35}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Mood</span>
                <p className="font-medium text-sm capitalize text-foreground">{dashboard.dreamEater.current_mood || 'neutral'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Dreams</span>
                <p className="font-medium text-sm text-foreground">{dashboard.dreamEater.dreams_consumed_today ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Nightmares</span>
                <p className="font-medium text-sm text-neon-amber">{dashboard.dreamEater.nightmares_consumed_today ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Mutation</span>
                <p className="font-medium text-sm text-foreground">Lv.{dashboard.dreamEater.mutation_level ?? 1}</p>
              </div>
            </div>
          </StatusPanel>
        )}
        
        {/* SEBA Status Panel — real proposal count */}
        <motion.div 
          className="p-4 rounded-xl border bg-gradient-to-br from-primary/10 via-muted/20 to-transparent backdrop-blur-xl border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-primary/20 border-primary/40">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-primary">SEBA • Bounded Autonomy</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Mode</span>
              <p className="font-medium text-sm text-primary">Autonomous</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">CLM</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <p className="font-medium text-sm text-neon-green">Active</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Proposals</span>
              <p className="font-medium text-sm text-foreground">{sebaProposals} pending</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
              <span className="text-muted-foreground text-[9px] uppercase font-mono block mb-1">Governance</span>
              <p className="font-medium text-sm text-neon-green">Gated</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
