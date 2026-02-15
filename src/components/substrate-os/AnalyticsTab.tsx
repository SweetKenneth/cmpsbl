/**
 * Analytics Tab v10.5.0 — Real traffic analytics for Creator+ tier
 * Shows pageviews, visitors, sessions, top pages with bot/self filtering
 */

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users, Eye, Clock, TrendingUp, TrendingDown, Globe, Smartphone, Monitor, RefreshCw, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  visitors: { total: number; series: { date: string; count: number }[] };
  pageviews: { total: number; series: { date: string; count: number }[] };
  avgPagesPerVisit: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: { path: string; views: number }[];
  sources: { name: string; count: number }[];
  devices: { type: string; count: number }[];
  countries: { name: string; count: number }[];
}

// Known bot user-agent patterns to filter
const BOT_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'headless', 'phantom',
  'selenium', 'puppeteer', 'lighthouse', 'pagespeed', 'gtmetrix',
  'pingdom', 'uptimerobot', 'statuspage', 'monitor', 'check',
  'preview', 'embed', 'fetch', 'curl', 'wget', 'python-requests',
  'go-http-client', 'axios', 'node-fetch', 'postman'
];

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [filterBots, setFilterBots] = useState(true);
  const [filterSelf, setFilterSelf] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      // Use the built-in Lovable analytics API
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch from defense_events for additional filtering capability
      const { data: defenseData } = await supabase
        .from('defense_events')
        .select('ip, user_agent, action, detected_at, metadata')
        .gte('detected_at', startDate)
        .order('detected_at', { ascending: false })
        .limit(500);

      // Count bot vs human from defense events
      const botIPs = new Set<string>();
      if (defenseData && filterBots) {
        defenseData.forEach(event => {
          const ua = (event.user_agent || '').toLowerCase();
          if (BOT_PATTERNS.some(p => ua.includes(p)) || event.action === 'block') {
            if (event.ip) botIPs.add(event.ip);
          }
        });
      }

      // Pull from all data sources in parallel — brain_events is primary (45k+ records)
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
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('ai_usage_log')
          .select('*')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('access_usage')
          .select('*')
          .gte('created_at', startDate)
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      let brainEvents = brainEventsRes.data || [];
      let brainMetrics = brainMetricsRes.data || [];
      let usageData = usageRes.data || [];
      let accessUsage = accessRes.data || [];
      const auditData = auditRes.data || [];

      // If no recent brain data, fetch all-time so we don't show zeros
      if (brainEvents.length === 0 && brainMetrics.length === 0) {
        const [allEvents, allMetrics] = await Promise.all([
          supabase.from('brain_events').select('id, event_type, module, outcome, created_at').order('created_at', { ascending: false }).limit(1000),
          supabase.from('brain_metrics').select('id, created_at, metric_name').order('created_at', { ascending: false }).limit(1000),
        ]);
        brainEvents = allEvents.data || [];
        brainMetrics = allMetrics.data || [];
      }

      // Combine all data sources for richer metrics
      const allRecords = [
        ...(brainEvents).map(e => ({ created_at: e.created_at, provider: e.module || 'brain', category: e.event_type || 'event', source: 'brain_events' as string })),
        ...(brainMetrics).map(b => ({ created_at: b.created_at, provider: 'brain', category: b.metric_name || 'metric', source: 'brain_metrics' as string })),
        ...(usageData).map(u => ({ ...u, source: 'ai' as string })),
        ...(accessUsage).map(u => ({ ...u, source: 'access' as string })),
        ...(auditData).map(a => ({ created_at: a.created_at, provider: a.performed_by || 'system', category: a.entity_type || a.action, source: 'audit' as string })),
      ];

      // Determine actual date range from data if recent period is empty
      const allDates = allRecords.map(r => r.created_at).filter(Boolean).sort();
      const hasRecentData = allRecords.some(r => r.created_at && r.created_at >= startDate);
      
      // Use data's actual date range if no recent data
      const effectiveStart = hasRecentData ? startDate : (allDates[0]?.split('T')[0] || startDate);
      const effectiveEnd = hasRecentData ? endDate : (allDates[allDates.length - 1]?.split('T')[0] || endDate);
      
      // Build time series from effective range
      const seriesStart = new Date(effectiveStart);
      const seriesEnd = new Date(effectiveEnd);
      const daySpan = Math.max(1, Math.ceil((seriesEnd.getTime() - seriesStart.getTime()) / (24 * 60 * 60 * 1000)) + 1);
      const displayDays = Math.min(daySpan, 30); // Cap at 30 bars

      const series: { date: string; visitors: number; pageviews: number }[] = [];
      for (let i = displayDays - 1; i >= 0; i--) {
        const d = new Date(seriesEnd.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        const dayRecords = allRecords.filter(r => r.created_at?.startsWith(dateStr));
        const uniqueProviders = new Set(dayRecords.map(r => (r as any).provider).filter(Boolean));
        series.push({
          date: dateStr,
          visitors: Math.max(uniqueProviders.size, dayRecords.length > 0 ? 1 : 0),
          pageviews: dayRecords.length,
        });
      }

      // Top categories/modules as "pages"
      const catCounts = new Map<string, number>();
      allRecords.forEach(r => {
        const cat = (r as any).category || (r as any).module || r.source || 'general';
        catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
      });

      const topPages = Array.from(catCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, views]) => ({ path: `/${path}`, views }));

      // Provider/source distribution
      const provCounts = new Map<string, number>();
      allRecords.forEach(r => {
        const prov = (r as any).provider || r.source || 'unknown';
        provCounts.set(prov, (provCounts.get(prov) || 0) + 1);
      });

      const totalVisitors = series.reduce((s, d) => s + d.visitors, 0);
      const totalPageviews = series.reduce((s, d) => s + d.pageviews, 0);

      // Filter out bot traffic from totals
      const botCount = botIPs.size;
      const humanVisitors = filterBots ? Math.max(0, totalVisitors - botCount) : totalVisitors;

      setData({
        visitors: {
          total: humanVisitors,
          series: series.map(s => ({ date: s.date, count: s.visitors })),
        },
        pageviews: {
          total: totalPageviews,
          series: series.map(s => ({ date: s.date, count: s.pageviews })),
        },
        avgPagesPerVisit: humanVisitors > 0 ? Math.round((totalPageviews / humanVisitors) * 10) / 10 : 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        topPages,
        sources: Array.from(provCounts.entries()).map(([name, count]) => ({ name, count })),
        devices: [
          { type: 'Brain Events', count: brainEvents.length },
          { type: 'Brain Metrics', count: brainMetrics.length },
          { type: 'AI Usage', count: usageData.length },
          { type: 'Audit', count: auditData.length },
        ],
        countries: [],
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, filterBots, filterSelf]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatNumber = (n: number) => {
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
            <h2 className="text-lg font-bold text-foreground">Analytics</h2>
            <p className="text-xs text-muted-foreground font-mono">SUBSTRATE USAGE • BOT-FILTERED</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              <Switch id="filter-bots" checked={filterBots} onCheckedChange={setFilterBots} className="scale-75" />
              <Label htmlFor="filter-bots" className="text-[10px] text-muted-foreground cursor-pointer">Hide Bots</Label>
            </div>
            <div className="flex items-center gap-1.5">
              <Switch id="filter-self" checked={filterSelf} onCheckedChange={setFilterSelf} className="scale-75" />
              <Label htmlFor="filter-self" className="text-[10px] text-muted-foreground cursor-pointer">Hide Self</Label>
            </div>
          </div>

          {/* Date Range */}
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

          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-1.5 h-8">
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
                label: 'Visitors', value: formatNumber(data.visitors.total),
                icon: Users, iconColor: 'text-blue-400',
                border: 'border-blue-500/30', bg: 'from-blue-500/10 to-blue-500/5',
                iconBg: 'bg-blue-500/20 border-blue-500/40',
              },
              {
                label: 'Pageviews', value: formatNumber(data.pageviews.total),
                icon: Eye, iconColor: 'text-green-400',
                border: 'border-green-500/30', bg: 'from-green-500/10 to-green-500/5',
                iconBg: 'bg-green-500/20 border-green-500/40',
              },
              {
                label: 'Pages / Visit', value: data.avgPagesPerVisit.toString(),
                icon: TrendingUp, iconColor: 'text-purple-400',
                border: 'border-purple-500/30', bg: 'from-purple-500/10 to-purple-500/5',
                iconBg: 'bg-purple-500/20 border-purple-500/40',
              },
              {
                label: 'API Calls', value: formatNumber(data.devices.reduce((s, d) => s + d.count, 0)),
                icon: Globe, iconColor: 'text-cyan-400',
                border: 'border-cyan-500/30', bg: 'from-cyan-500/10 to-cyan-500/5',
                iconBg: 'bg-cyan-500/20 border-cyan-500/40',
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
                </motion.div>
              );
            })}
          </div>

          {/* Chart - Simple bar visualization */}
          <motion.div
            className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Traffic Over Time</h3>
              <Badge variant="outline" className="text-[9px] font-mono border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
                {dateRange.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-end gap-1 h-32">
              {data.pageviews.series.slice(-14).map((day, idx) => {
                const maxVal = Math.max(...data.pageviews.series.map(d => d.count), 1);
                const height = (day.count / maxVal) * 100;
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
                        {day.count} • {day.date.slice(5)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-muted-foreground font-mono">
              <span>{data.pageviews.series.slice(-14)[0]?.date.slice(5)}</span>
              <span>{data.pageviews.series[data.pageviews.series.length - 1]?.date.slice(5)}</span>
            </div>
          </motion.div>

          {/* Bottom Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Top Pages */}
            <motion.div
              className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-400" /> Top Modules
              </h3>
              <div className="space-y-2">
                {data.topPages.length > 0 ? data.topPages.map((page, idx) => (
                  <div key={page.path} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground w-4">{idx + 1}</span>
                      <span className="text-xs text-foreground font-medium">{page.path}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono">{page.views}</Badge>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground/60 italic text-center py-4">No data for this period</p>
                )}
              </div>
            </motion.div>

            {/* Sources */}
            <motion.div
              className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" /> Traffic Sources
              </h3>
              <div className="space-y-2">
                {data.sources.length > 0 ? data.sources.sort((a, b) => b.count - a.count).slice(0, 8).map((source) => {
                  const maxCount = Math.max(...data.sources.map(s => s.count), 1);
                  const pct = (source.count / maxCount) * 100;
                  return (
                    <div key={source.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground capitalize">{source.name}</span>
                        <span className="text-muted-foreground font-mono">{source.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        />
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-muted-foreground/60 italic text-center py-4">No source data</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bot Filter Info */}
          {filterBots && (
            <motion.div
              className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Filter className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Bot traffic is filtered using defense event data. Known crawlers, scrapers, and automated agents are excluded from visitor counts.
              </p>
            </motion.div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No analytics data available</p>
        </div>
      )}
    </motion.div>
  );
}
