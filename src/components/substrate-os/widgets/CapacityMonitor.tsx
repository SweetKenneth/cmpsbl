/**
 * Capacity Monitor Widget v10.5.0
 * Real-time monitoring of developer activity and substrate load
 * Glassmorphic design matching dashboard aesthetic
 */

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Zap, Brain, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface CapacityMetrics {
  activeDevelopers: { last24h: number; last7d: number; total: number };
  requestsPerMinute: { current: number; limit: number };
  tokenConsumption: { today: number; thisHour: number; dailyBudget: number };
  costBurnRate: { hourly: number; daily: number; projected: number };
  loadPercent: number;
  status: 'healthy' | 'elevated' | 'critical';
}

export function CapacityMonitor() {
  const [metrics, setMetrics] = useState<CapacityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
      const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();

      const [totalDevs, activeDevs24h, activeDevs7d, hourlyUsage, dailyUsage, minuteUsage] = await Promise.all([
        supabase.from('access_developers').select('id', { count: 'exact', head: true }),
        supabase.from('access_usage').select('developer_id').gte('created_at', oneDayAgo).not('developer_id', 'is', null),
        supabase.from('access_usage').select('developer_id').gte('created_at', sevenDaysAgo).not('developer_id', 'is', null),
        supabase.from('access_usage').select('tokens_used, cost_millicents').gte('created_at', oneHourAgo),
        supabase.from('access_usage').select('tokens_used, cost_millicents').gte('created_at', todayStart),
        supabase.from('access_usage').select('id', { count: 'exact', head: true }).gte('created_at', oneMinuteAgo),
      ]);

      const uniqueDevs24h = new Set(activeDevs24h.data?.map(u => u.developer_id) || []).size;
      const uniqueDevs7d = new Set(activeDevs7d.data?.map(u => u.developer_id) || []).size;
      const tokensToday = dailyUsage.data?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
      const tokensThisHour = hourlyUsage.data?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
      const costToday = (dailyUsage.data?.reduce((sum, u) => sum + (u.cost_millicents || 0), 0) || 0) / 100000;
      const costThisHour = (hourlyUsage.data?.reduce((sum, u) => sum + (u.cost_millicents || 0), 0) || 0) / 100000;
      const currentRPM = minuteUsage.count || 0;
      const rpmLimit = 1000;
      const dailyTokenBudget = 10000000;
      const loadPercent = Math.min(100, Math.round((currentRPM / rpmLimit) * 100));

      let status: 'healthy' | 'elevated' | 'critical' = 'healthy';
      if (loadPercent > 80 || (tokensToday / dailyTokenBudget) > 0.9) status = 'critical';
      else if (loadPercent > 50 || (tokensToday / dailyTokenBudget) > 0.7) status = 'elevated';

      setMetrics({
        activeDevelopers: { last24h: uniqueDevs24h, last7d: uniqueDevs7d, total: totalDevs.count || 0 },
        requestsPerMinute: { current: currentRPM, limit: rpmLimit },
        tokenConsumption: { today: tokensToday, thisHour: tokensThisHour, dailyBudget: dailyTokenBudget },
        costBurnRate: { hourly: costThisHour, daily: costToday, projected: costThisHour * 24 },
        loadPercent,
        status,
      });
    } catch (error) {
      console.error('Failed to fetch capacity metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  if (loading) {
    return (
      <motion.div 
        className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 via-card/50 to-transparent backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Capacity Monitor</h3>
            <p className="text-[10px] text-muted-foreground font-mono">LOADING...</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </motion.div>
    );
  }

  if (!metrics) return null;

  const statusConfig = {
    healthy: { border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'HEALTHY' },
    elevated: { border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'ELEVATED' },
    critical: { border: 'border-red-500/30', text: 'text-red-400', bg: 'bg-red-500/10', label: 'CRITICAL' },
  };
  const sc = statusConfig[metrics.status];

  const cards = [
    {
      icon: Users, iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20 border-blue-500/40',
      label: 'Developers', value: metrics.activeDevelopers.last24h, suffix: '/ 24h',
      sub: `${metrics.activeDevelopers.last7d} / 7d • ${metrics.activeDevelopers.total} total`,
      border: 'border-blue-500/30', hover: 'hover:border-blue-500/50',
      bg: 'from-blue-500/10 to-blue-500/5',
    },
    {
      icon: TrendingUp, iconColor: 'text-green-400',
      iconBg: 'bg-green-500/20 border-green-500/40',
      label: 'Requests/min', value: metrics.requestsPerMinute.current, suffix: 'RPM',
      sub: `Limit: ${formatNumber(metrics.requestsPerMinute.limit)}`,
      border: 'border-green-500/30', hover: 'hover:border-green-500/50',
      bg: 'from-green-500/10 to-green-500/5',
    },
    {
      icon: Brain, iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20 border-purple-500/40',
      label: 'Tokens', value: formatNumber(metrics.tokenConsumption.today), suffix: 'today',
      sub: `${formatNumber(metrics.tokenConsumption.thisHour)} / hour`,
      border: 'border-purple-500/30', hover: 'hover:border-purple-500/50',
      bg: 'from-purple-500/10 to-purple-500/5',
    },
    {
      icon: DollarSign, iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20 border-yellow-500/40',
      label: 'Cost', value: `$${metrics.costBurnRate.daily.toFixed(2)}`, suffix: 'today',
      sub: `~$${metrics.costBurnRate.projected.toFixed(2)} projected`,
      border: 'border-yellow-500/30', hover: 'hover:border-yellow-500/50',
      bg: 'from-yellow-500/10 to-yellow-500/5',
    },
  ];

  return (
    <motion.div 
      className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 via-card/50 to-transparent backdrop-blur-xl overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-yellow-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Capacity Monitor</h3>
            <p className="text-[10px] text-muted-foreground font-mono">REAL-TIME LOAD ANALYSIS</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[9px] font-mono gap-1.5", sc.border, sc.text, sc.bg)}>
          {metrics.status === 'critical' && <AlertTriangle className="w-3 h-3" />}
          <motion.span 
            className={cn("w-1.5 h-1.5 rounded-full", metrics.status === 'healthy' ? 'bg-emerald-500' : metrics.status === 'elevated' ? 'bg-amber-500' : 'bg-red-500')}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {sc.label}
        </Badge>
      </div>

      {/* System Load */}
      <div className="relative space-y-2 mb-5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">System Load</span>
          <span className={cn(
            metrics.loadPercent > 80 ? 'text-red-400' : metrics.loadPercent > 50 ? 'text-amber-400' : 'text-emerald-400'
          )}>
            {metrics.loadPercent}%
          </span>
        </div>
        <Progress 
          value={metrics.loadPercent} 
          className={cn(
            "h-2.5 rounded-full",
            metrics.loadPercent > 80 ? "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-rose-400" :
            metrics.loadPercent > 50 ? "[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-400" :
            "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-400"
          )}
        />
      </div>

      {/* Metric Cards */}
      <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {cards.map((card, idx) => {
          const CardIcon = card.icon;
          return (
            <motion.div
              key={card.label}
              className={cn(
                "p-4 rounded-xl border bg-gradient-to-br transition-all",
                card.border, card.hover, card.bg
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center border", card.iconBg)}>
                  <CardIcon className={cn("w-3.5 h-3.5", card.iconColor)} />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase">{card.label}</span>
              </div>
              <div className="font-mono">
                <span className="text-xl font-bold text-foreground">{card.value}</span>
                <span className="text-xs text-muted-foreground ml-1">{card.suffix}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Token Budget */}
      <div className="relative space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted-foreground">Token Budget</span>
          <span className="text-foreground">{formatNumber(metrics.tokenConsumption.today)} / {formatNumber(metrics.tokenConsumption.dailyBudget)}</span>
        </div>
        <Progress 
          value={(metrics.tokenConsumption.today / metrics.tokenConsumption.dailyBudget) * 100} 
          className="h-1.5 rounded-full"
        />
      </div>
    </motion.div>
  );
}