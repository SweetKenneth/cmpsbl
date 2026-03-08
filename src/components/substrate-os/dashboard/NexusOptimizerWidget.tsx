/**
 * NEXUS Optimizer Widget — Real-time budget optimizer dashboard
 * Shows hourly snapshot data, strategy mode, provider breakdown, and CLM allocation
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Activity, Zap, Users, Bot, Server, TrendingUp, Clock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface HourlySnapshot {
  snapshot_hour: string;
  total_capacity: number;
  used_today: number;
  reserved_for_substrate: number;
  reserved_for_active_devs: number;
  reserved_for_chatbots: number;
  available_for_clm: number;
  clm_calls_dispatched: number;
  active_developer_count: number;
  optimization_strategy: string;
  provider_breakdown: Record<string, {
    rpd: number;
    used: number;
    remaining: number;
    phase: string;
    confidence: number;
  }>;
}

const STRATEGY_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  discovery: { label: 'DISCOVERY', color: 'text-amber-400', icon: Activity },
  balanced: { label: 'BALANCED', color: 'text-cyan-400', icon: TrendingUp },
  aggressive: { label: 'AGGRESSIVE', color: 'text-emerald-400', icon: Zap },
  conservative: { label: 'CONSERVATIVE', color: 'text-orange-400', icon: Shield },
  surge: { label: 'SURGE', color: 'text-fuchsia-400', icon: Zap },
};

export function NexusOptimizerWidget({ className }: { className?: string }) {
  const { data: snapshot, isLoading } = useQuery({
    queryKey: ['nexus-optimizer-snapshot'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nexus_hourly_snapshots')
        .select('*')
        .order('snapshot_hour', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as HourlySnapshot | null;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: providerLimits } = useQuery({
    queryKey: ['nexus-provider-limits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nexus_provider_limits')
        .select('provider, stated_rpd, discovered_rpd, discovery_phase, confidence, exhaustion_count')
        .order('provider');
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 120000,
  });

  if (isLoading || !snapshot) {
    return (
      <div className={cn('rounded-2xl border border-border/20 bg-card/40 backdrop-blur-xl p-5', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-muted-foreground animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Stream Optimizer</span>
        </div>
        <p className="text-xs text-muted-foreground/50">Awaiting first hourly snapshot…</p>
      </div>
    );
  }

  const strategy = STRATEGY_CONFIG[snapshot.optimization_strategy] || STRATEGY_CONFIG.balanced;
  const StrategyIcon = strategy.icon;
  const utilization = snapshot.total_capacity > 0 ? (snapshot.used_today / snapshot.total_capacity) * 100 : 0;
  const clmPercent = snapshot.total_capacity > 0 ? (snapshot.available_for_clm / snapshot.total_capacity) * 100 : 0;

  const confirmedCount = providerLimits?.filter(p => p.discovery_phase === 'confirmed').length ?? 0;
  const totalProviders = providerLimits?.length ?? 0;
  const snapshotTime = new Date(snapshot.snapshot_hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn('rounded-2xl border border-border/20 bg-gradient-to-b from-card/60 to-card/30 backdrop-blur-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Stream Optimizer</span>
            <div className="flex items-center gap-1.5">
              <StrategyIcon className={cn('w-3 h-3', strategy.color)} />
              <span className={cn('text-[10px] font-bold font-mono', strategy.color)}>{strategy.label}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground/50 font-mono">
          <Clock className="w-3 h-3" />
          {snapshotTime}
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="px-5 pb-3 space-y-1.5">
        <div className="flex items-center justify-between text-[9px] font-mono">
          <span className="text-muted-foreground">Stream Utilization</span>
          <span className="text-foreground/80">{utilization.toFixed(1)}%</span>
        </div>
        <div className="relative h-2 rounded-full bg-muted/20 overflow-hidden">
          {/* Used */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary/60"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, utilization)}%` }}
            transition={{ duration: 0.6 }}
          />
          {/* CLM allocation overlay */}
          <motion.div
            className="absolute inset-y-0 rounded-full bg-emerald-500/40"
            initial={{ width: 0 }}
            animate={{ 
              left: `${Math.min(100, utilization)}%`,
              width: `${Math.min(100 - utilization, clmPercent)}%`
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </div>
        <div className="flex items-center gap-3 text-[8px] text-muted-foreground/50">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary/60" /> Used</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" /> CLM</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted/30" /> Reserved</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-px bg-border/10">
        {[
          { label: 'CLM/hr', value: snapshot.clm_calls_dispatched.toLocaleString(), icon: Zap, color: 'text-emerald-400' },
          { label: 'Active Devs', value: snapshot.active_developer_count.toString(), icon: Users, color: 'text-cyan-400' },
          { label: 'Reserved', value: (snapshot.reserved_for_substrate + snapshot.reserved_for_chatbots + snapshot.reserved_for_active_devs).toLocaleString(), icon: Server, color: 'text-orange-400' },
          { label: 'Confirmed', value: `${confirmedCount}/${totalProviders}`, icon: Shield, color: 'text-fuchsia-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-card/20 px-3 py-2.5 text-center transition-all duration-300 hover:bg-card/40">
            <stat.icon className={cn('w-3 h-3 mx-auto mb-1', stat.color)} />
            <div className="text-sm font-bold font-mono text-foreground">{stat.value}</div>
            <div className="text-[7px] text-muted-foreground/40 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Provider Discovery Progress */}
      {providerLimits && providerLimits.length > 0 && (
        <div className="px-5 py-3 border-t border-border/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Provider Discovery</span>
            <Badge variant="outline" className="text-[8px] h-4 px-1.5">
              {confirmedCount}/{totalProviders} confirmed
            </Badge>
          </div>
          <TooltipProvider>
            <div className="grid grid-cols-6 gap-1">
              {providerLimits.map(p => {
                const phaseColor = p.discovery_phase === 'confirmed' ? 'bg-emerald-500' 
                  : p.discovery_phase === 'testing' ? 'bg-amber-500 animate-pulse' 
                  : 'bg-muted/30';
                return (
                  <Tooltip key={p.provider}>
                    <TooltipTrigger>
                      <div className={cn('h-1.5 rounded-full', phaseColor)} />
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px]">
                      <div className="font-mono font-semibold">{p.provider}</div>
                      <div>Stated: {p.stated_rpd} RPD</div>
                      {p.discovered_rpd && <div>Discovered: {p.discovered_rpd} RPD</div>}
                      <div>Phase: {p.discovery_phase} ({(p.confidence * 100).toFixed(0)}%)</div>
                      <div>Exhaustion cycles: {p.exhaustion_count}</div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}