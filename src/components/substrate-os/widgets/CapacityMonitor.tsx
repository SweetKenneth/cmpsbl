/**
 * Capacity Monitor Widget — Premium glassmorphic load monitor
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
        loadPercent, status,
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
      <motion.div className="relative rounded-2xl border border-border/30 overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-card/95 via-card/60 to-card/30 backdrop-blur-2xl" />
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/15 to-neon-amber/15 border border-neon-amber/25 flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-amber" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Capacity Monitor</h3>
              <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">LOADING...</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!metrics) return null;

  const statusConfig = {
    healthy: { border: 'border-neon-green/20', text: 'text-neon-green/80', bg: 'bg-neon-green/5', label: 'HEALTHY' },
    elevated: { border: 'border-neon-amber/20', text: 'text-neon-amber/80', bg: 'bg-neon-amber/5', label: 'ELEVATED' },
    critical: { border: 'border-destructive/20', text: 'text-destructive/80', bg: 'bg-destructive/5', label: 'CRITICAL' },
  };
  const sc = statusConfig[metrics.status];

  const cards = [
    { icon: Users, iconColor: 'text-neon-blue', label: 'Developers', value: metrics.activeDevelopers.last24h, suffix: '/ 24h', sub: `${metrics.activeDevelopers.last7d} / 7d • ${metrics.activeDevelopers.total} total`, borderClass: 'border-neon-blue/15 hover:border-neon-blue/30', bgFrom: 'from-neon-blue', iconBg: 'bg-neon-blue/10 border-neon-blue/25' },
    { icon: TrendingUp, iconColor: 'text-neon-green', label: 'Requests/min', value: metrics.requestsPerMinute.current, suffix: 'RPM', sub: `Limit: ${formatNumber(metrics.requestsPerMinute.limit)}`, borderClass: 'border-neon-green/15 hover:border-neon-green/30', bgFrom: 'from-neon-green', iconBg: 'bg-neon-green/10 border-neon-green/25' },
    { icon: Brain, iconColor: 'text-neon-purple', label: 'Tokens', value: formatNumber(metrics.tokenConsumption.today), suffix: 'today', sub: `${formatNumber(metrics.tokenConsumption.thisHour)} / hour`, borderClass: 'border-neon-purple/15 hover:border-neon-purple/30', bgFrom: 'from-neon-purple', iconBg: 'bg-neon-purple/10 border-neon-purple/25' },
    { icon: DollarSign, iconColor: 'text-neon-amber', label: 'Cost', value: `$${metrics.costBurnRate.daily.toFixed(2)}`, suffix: 'today', sub: `~$${metrics.costBurnRate.projected.toFixed(2)} projected`, borderClass: 'border-neon-amber/15 hover:border-neon-amber/30', bgFrom: 'from-neon-amber', iconBg: 'bg-neon-amber/10 border-neon-amber/25' },
  ];

  return (
    <motion.div 
      className="relative rounded-2xl border border-border/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-card/95 via-card/60 to-card/30 backdrop-blur-2xl" />
      <motion.div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-amber/5 rounded-full blur-[100px]" 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-amber/15 to-neon-amber/15 border border-neon-amber/25 flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-amber" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Capacity Monitor</h3>
              <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">REAL-TIME LOAD</p>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[9px] font-mono gap-1.5", sc.border, sc.text, sc.bg)}>
            {metrics.status === 'critical' && <AlertTriangle className="w-3 h-3" />}
            <motion.span className={cn("w-1.5 h-1.5 rounded-full", metrics.status === 'healthy' ? 'bg-neon-green' : metrics.status === 'elevated' ? 'bg-neon-amber' : 'bg-destructive')}
              animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            {sc.label}
          </Badge>
        </div>

        {/* System Load */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground/60">System Load</span>
            <span className={cn(metrics.loadPercent > 80 ? 'text-destructive' : metrics.loadPercent > 50 ? 'text-neon-amber' : 'text-neon-green')}>
              {metrics.loadPercent}%
            </span>
          </div>
          <Progress value={metrics.loadPercent} className={cn("h-2 rounded-full",
            metrics.loadPercent > 80 ? "[&>div]:bg-gradient-to-r [&>div]:from-destructive [&>div]:to-neon-magenta" :
            metrics.loadPercent > 50 ? "[&>div]:bg-gradient-to-r [&>div]:from-neon-amber [&>div]:to-neon-amber" :
            "[&>div]:bg-gradient-to-r [&>div]:from-neon-green [&>div]:to-neon-cyan"
          )} />
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {cards.map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <motion.div
                key={card.label}
                className={cn("p-4 rounded-xl border transition-all duration-200", card.borderClass)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br rounded-xl opacity-[0.04]", card.bgFrom, "to-transparent")} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center border", card.iconBg)}>
                      <CardIcon className={cn("w-3.5 h-3.5", card.iconColor)} />
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-mono uppercase">{card.label}</span>
                  </div>
                  <div className="font-mono">
                    <span className="text-xl font-bold text-foreground">{card.value}</span>
                    <span className="text-xs text-muted-foreground/40 ml-1">{card.suffix}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 mt-1">{card.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Token Budget */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-muted-foreground/50">Token Budget</span>
            <span className="text-foreground/60">{formatNumber(metrics.tokenConsumption.today)} / {formatNumber(metrics.tokenConsumption.dailyBudget)}</span>
          </div>
          <Progress value={(metrics.tokenConsumption.today / metrics.tokenConsumption.dailyBudget) * 100} className="h-1.5 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
