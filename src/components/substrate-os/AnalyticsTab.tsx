/**
 * Analytics Tab v11.0.0 — Substrate Telemetry Dashboard
 * Single source of truth for all system metrics. No third-party analytics.
 * Shows real substrate operations, API usage, and system activity.
 */

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Activity, Cpu, Database, RefreshCw, Zap, Brain, Shield, Network } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface TelemetryData {
  brainEvents: number;
  brainMetrics: number;
  apiCalls: number;
  accessOps: number;
  auditActions: number;
  totalOps: number;
  series: { date: string; ops: number }[];
  topModules: { module: string; count: number }[];
  eventBreakdown: { type: string; count: number }[];
  successRate: number;
}

export function AnalyticsTab() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [brainEventsRes, brainMetricsRes, usageRes, accessRes, auditRes] = await Promise.all([
        supabase
          .from('brain_events')
          .select('id, event_type, module, outcome, created_at')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('brain_metrics')
          .select('id, created_at, metric_name')
          .gte('created_at', startDate)
          .limit(1000),
        supabase
          .from('ai_usage_log')
          .select('id, provider, category, success, created_at')
          .gte('created_at', startDate)
          .limit(500),
        supabase
          .from('access_usage')
          .select('id, module, action, created_at')
          .gte('created_at', startDate)
          .limit(500),
        supabase
          .from('audit_logs')
          .select('id, action, entity_type, created_at')
          .gte('created_at', startDate)
          .limit(200),
      ]);

      const brainEvents = brainEventsRes.data || [];
      const brainMetrics = brainMetricsRes.data || [];
      const usage = usageRes.data || [];
      const access = accessRes.data || [];
      const audit = auditRes.data || [];

      // Build daily time series
      const dayCounts = new Map<string, number>();
      const allRecords = [
        ...brainEvents.map(e => e.created_at),
        ...brainMetrics.map(m => m.created_at),
        ...usage.map(u => u.created_at),
        ...access.map(a => a.created_at),
        ...audit.map(a => a.created_at),
      ].filter(Boolean);

      allRecords.forEach(ts => {
        const day = ts!.split('T')[0];
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
      });

      const series: { date: string; ops: number }[] = [];
      const displayDays = Math.min(days, 30);
      for (let i = displayDays - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        series.push({ date: dateStr, ops: dayCounts.get(dateStr) || 0 });
      }

      // Top modules from brain events
      const moduleCounts = new Map<string, number>();
      brainEvents.forEach(e => {
        const mod = e.module || 'unknown';
        moduleCounts.set(mod, (moduleCounts.get(mod) || 0) + 1);
      });
      const topModules = Array.from(moduleCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([module, count]) => ({ module, count }));

      // Event type breakdown
      const typeCounts = new Map<string, number>();
      brainEvents.forEach(e => {
        const t = e.event_type || 'unknown';
        typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
      });
      const eventBreakdown = Array.from(typeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([type, count]) => ({ type, count }));

      // Success rate from ai_usage_log
      const successCount = usage.filter(u => u.success === true).length;
      const successRate = usage.length > 0 ? Math.round((successCount / usage.length) * 1000) / 10 : 100;

      setData({
        brainEvents: brainEvents.length,
        brainMetrics: brainMetrics.length,
        apiCalls: usage.length,
        accessOps: access.length,
        auditActions: audit.length,
        totalOps: allRecords.length,
        series,
        topModules,
        eventBreakdown,
        successRate,
      });
    } catch (error) {
      console.error('Telemetry fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-7xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Substrate Telemetry</h2>
            <p className="text-xs text-muted-foreground font-mono">SINGLE SOURCE OF TRUTH • REAL OPS</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  dateRange === range
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchTelemetry} className="gap-1.5 h-8">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : data ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Ops', value: fmt(data.totalOps),
                sub: `${dateRange} window`,
                icon: Activity, iconColor: 'text-cyan-400',
                border: 'border-cyan-500/30', bg: 'from-cyan-500/10 to-cyan-500/5',
                iconBg: 'bg-cyan-500/20 border-cyan-500/40',
              },
              {
                label: 'Brain Events', value: fmt(data.brainEvents),
                sub: `${fmt(data.brainMetrics)} metrics`,
                icon: Brain, iconColor: 'text-purple-400',
                border: 'border-purple-500/30', bg: 'from-purple-500/10 to-purple-500/5',
                iconBg: 'bg-purple-500/20 border-purple-500/40',
              },
              {
                label: 'API Calls', value: fmt(data.apiCalls),
                sub: `${data.successRate}% success`,
                icon: Zap, iconColor: 'text-green-400',
                border: 'border-green-500/30', bg: 'from-green-500/10 to-green-500/5',
                iconBg: 'bg-green-500/20 border-green-500/40',
              },
              {
                label: 'Access Ops', value: fmt(data.accessOps),
                sub: `${fmt(data.auditActions)} audited`,
                icon: Shield, iconColor: 'text-amber-400',
                border: 'border-amber-500/30', bg: 'from-amber-500/10 to-amber-500/5',
                iconBg: 'bg-amber-500/20 border-amber-500/40',
              },
            ].map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  className={cn("p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl", card.border, card.bg)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", card.iconBg)}>
                      <CardIcon className={cn("w-4 h-4", card.iconColor)} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-foreground">{card.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Chart */}
          <motion.div
            className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Operations Over Time</h3>
              <Badge variant="outline" className="text-[9px] font-mono border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                {dateRange.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-end gap-1 h-32">
              {data.series.slice(-14).map((day, idx) => {
                const maxVal = Math.max(...data.series.map(d => d.ops), 1);
                const height = (day.ops / maxVal) * 100;
                return (
                  <motion.div
                    key={day.date}
                    className="flex-1 group relative"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.3 + idx * 0.02 }}
                    style={{ transformOrigin: 'bottom' }}
                  >
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/60 to-cyan-400/30 hover:from-cyan-500/80 hover:to-cyan-400/50 transition-all cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                      <div className="bg-background border border-border/60 rounded-md px-2 py-1 text-[9px] font-mono whitespace-nowrap shadow-lg">
                        {day.ops} ops • {day.date.slice(5)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-muted-foreground font-mono">
              <span>{data.series.slice(-14)[0]?.date.slice(5)}</span>
              <span>{data.series[data.series.length - 1]?.date.slice(5)}</span>
            </div>
          </motion.div>

          {/* Bottom Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Top Modules */}
            <motion.div
              className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400" /> Active Modules
              </h3>
              <div className="space-y-2">
                {data.topModules.length > 0 ? data.topModules.map((mod, idx) => {
                  const maxCount = data.topModules[0]?.count || 1;
                  const pct = (mod.count / maxCount) * 100;
                  return (
                    <div key={mod.module} className="group">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-foreground/80 capitalize">{mod.module}</span>
                        <span className="font-mono text-muted-foreground">{fmt(mod.count)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500/70 to-cyan-500/50"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.4 + idx * 0.03 }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No module data in this period</p>
                )}
              </div>
            </motion.div>

            {/* Data Sources */}
            <motion.div
              className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Data Sources
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Brain Events', count: data.brainEvents, icon: Brain, color: 'text-purple-400' },
                  { label: 'Brain Metrics', count: data.brainMetrics, icon: Cpu, color: 'text-blue-400' },
                  { label: 'AI Usage Log', count: data.apiCalls, icon: Zap, color: 'text-green-400' },
                  { label: 'Access Usage', count: data.accessOps, icon: Shield, color: 'text-amber-400' },
                  { label: 'Audit Log', count: data.auditActions, icon: Activity, color: 'text-red-400' },
                ].map(src => {
                  const SrcIcon = src.icon;
                  const pct = data.totalOps > 0 ? Math.round((src.count / data.totalOps) * 100) : 0;
                  return (
                    <div key={src.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SrcIcon className={cn("w-3.5 h-3.5", src.color)} />
                        <span className="text-xs text-foreground/80">{src.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
                        <span className="text-xs font-mono font-semibold text-foreground">{fmt(src.count)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Success Rate */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">AI Call Success Rate</span>
                  <span className={cn(
                    "text-sm font-bold font-mono",
                    data.successRate >= 95 ? "text-green-400" :
                    data.successRate >= 80 ? "text-amber-400" : "text-red-400"
                  )}>
                    {data.successRate}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No telemetry data available</p>
        </div>
      )}
    </motion.div>
  );
}
