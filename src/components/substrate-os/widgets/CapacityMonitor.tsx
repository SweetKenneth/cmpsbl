/**
 * Capacity Monitor Widget
 * Real-time monitoring of developer activity and substrate load
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Zap, Brain, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CapacityMetrics {
  activeDevelopers: {
    last24h: number;
    last7d: number;
    total: number;
  };
  requestsPerMinute: {
    current: number;
    peak: number;
    limit: number;
  };
  tokenConsumption: {
    today: number;
    thisHour: number;
    dailyBudget: number;
  };
  costBurnRate: {
    hourly: number;
    daily: number;
    projected: number;
  };
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

      // Parallel queries for efficiency
      const [
        totalDevs,
        activeDevs24h,
        activeDevs7d,
        recentUsage,
        hourlyUsage,
        dailyUsage,
        minuteUsage
      ] = await Promise.all([
        // Total developers
        supabase.from('access_developers').select('id', { count: 'exact', head: true }),
        
        // Active developers (24h) - those with usage
        supabase.from('access_usage')
          .select('developer_id')
          .gte('created_at', oneDayAgo)
          .not('developer_id', 'is', null),
        
        // Active developers (7d)
        supabase.from('access_usage')
          .select('developer_id')
          .gte('created_at', sevenDaysAgo)
          .not('developer_id', 'is', null),
        
        // Recent usage for RPM calculation
        supabase.from('access_usage')
          .select('id, tokens_used, cost_millicents')
          .gte('created_at', oneMinuteAgo),
        
        // Hourly usage
        supabase.from('access_usage')
          .select('tokens_used, cost_millicents')
          .gte('created_at', oneHourAgo),
        
        // Daily usage
        supabase.from('access_usage')
          .select('tokens_used, cost_millicents')
          .gte('created_at', todayStart),
        
        // Last minute for current RPM
        supabase.from('access_usage')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', oneMinuteAgo)
      ]);

      // Calculate unique active developers
      const uniqueDevs24h = new Set(activeDevs24h.data?.map(u => u.developer_id) || []).size;
      const uniqueDevs7d = new Set(activeDevs7d.data?.map(u => u.developer_id) || []).size;

      // Calculate token consumption
      const tokensToday = dailyUsage.data?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
      const tokensThisHour = hourlyUsage.data?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;

      // Calculate costs (millicents to dollars)
      const costToday = (dailyUsage.data?.reduce((sum, u) => sum + (u.cost_millicents || 0), 0) || 0) / 100000;
      const costThisHour = (hourlyUsage.data?.reduce((sum, u) => sum + (u.cost_millicents || 0), 0) || 0) / 100000;

      // Current RPM
      const currentRPM = minuteUsage.count || 0;

      // Calculate load percentage (based on RPM vs limit)
      const rpmLimit = 1000; // Configurable limit
      const dailyTokenBudget = 10000000; // 10M tokens/day budget
      const loadPercent = Math.min(100, Math.round((currentRPM / rpmLimit) * 100));

      // Determine status
      let status: 'healthy' | 'elevated' | 'critical' = 'healthy';
      if (loadPercent > 80 || (tokensToday / dailyTokenBudget) > 0.9) {
        status = 'critical';
      } else if (loadPercent > 50 || (tokensToday / dailyTokenBudget) > 0.7) {
        status = 'elevated';
      }

      setMetrics({
        activeDevelopers: {
          last24h: uniqueDevs24h,
          last7d: uniqueDevs7d,
          total: totalDevs.count || 0
        },
        requestsPerMinute: {
          current: currentRPM,
          peak: Math.max(currentRPM, 0), // Would need historical tracking for real peak
          limit: rpmLimit
        },
        tokenConsumption: {
          today: tokensToday,
          thisHour: tokensThisHour,
          dailyBudget: dailyTokenBudget
        },
        costBurnRate: {
          hourly: costThisHour,
          daily: costToday,
          projected: costThisHour * 24
        },
        loadPercent,
        status
      });
    } catch (error) {
      console.error('Failed to fetch capacity metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Zap className="w-4 h-4" />
            CAPACITY MONITOR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const statusColors = {
    healthy: 'bg-green-500/20 text-green-400 border-green-500/30',
    elevated: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            CAPACITY MONITOR
          </CardTitle>
          <Badge variant="outline" className={statusColors[metrics.status]}>
            {metrics.status === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {metrics.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Load Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">System Load</span>
            <span className={metrics.loadPercent > 80 ? 'text-red-400' : metrics.loadPercent > 50 ? 'text-yellow-400' : 'text-green-400'}>
              {metrics.loadPercent}%
            </span>
          </div>
          <Progress 
            value={metrics.loadPercent} 
            className="h-2"
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Developers */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Developers</span>
            </div>
            <div className="font-mono">
              <span className="text-lg font-bold">{metrics.activeDevelopers.last24h}</span>
              <span className="text-xs text-muted-foreground ml-1">/ 24h</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.activeDevelopers.last7d} / 7d • {metrics.activeDevelopers.total} total
            </div>
          </div>

          {/* RPM */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Requests/min</span>
            </div>
            <div className="font-mono">
              <span className="text-lg font-bold">{metrics.requestsPerMinute.current}</span>
              <span className="text-xs text-muted-foreground ml-1">RPM</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Limit: {formatNumber(metrics.requestsPerMinute.limit)}
            </div>
          </div>

          {/* Token Consumption */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Tokens</span>
            </div>
            <div className="font-mono">
              <span className="text-lg font-bold">{formatNumber(metrics.tokenConsumption.today)}</span>
              <span className="text-xs text-muted-foreground ml-1">today</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatNumber(metrics.tokenConsumption.thisHour)} / hour
            </div>
          </div>

          {/* Cost Burn Rate */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">Cost</span>
            </div>
            <div className="font-mono">
              <span className="text-lg font-bold">${metrics.costBurnRate.daily.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground ml-1">today</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ~${metrics.costBurnRate.projected.toFixed(2)} projected
            </div>
          </div>
        </div>

        {/* Token Budget Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-muted-foreground">Token Budget</span>
            <span>
              {formatNumber(metrics.tokenConsumption.today)} / {formatNumber(metrics.tokenConsumption.dailyBudget)}
            </span>
          </div>
          <Progress 
            value={(metrics.tokenConsumption.today / metrics.tokenConsumption.dailyBudget) * 100} 
            className="h-1.5"
          />
        </div>
      </CardContent>
    </Card>
  );
}
