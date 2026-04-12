/**
 * PostHog Analytics Dashboard — Governor-Only
 * Real-time product analytics powered by PostHog.
 * Displays events, users, page views, sessions, and web vitals.
 */

import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Users, Clock, TrendingUp, Activity, Eye, RefreshCw,
  Zap, BarChart3, Globe, MousePointer, ArrowUpRight,
  ArrowDownRight, Loader2, ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface DashboardData {
  overview: {
    totalEvents: number;
    uniqueUsers: number;
    sessions: number;
    pageviews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  eventsByType: { name: string; count: number }[];
  pageViews: { page: string; views: number }[];
  hourlyActivity: { hour: string; events: number }[];
  dailyTrend: { date: string; events: number; users: number }[];
  topReferrers: { source: string; count: number }[];
  webVitals: { name: string; value: number; rating: string }[];
  conversionFunnel: { stage: string; count: number; rate: number }[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(280 65% 60%)',
  'hsl(200 80% 50%)',
];

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════

function PostHogDashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const rangeMs = timeRange === '24h' ? 86400000 : timeRange === '7d' ? 604800000 : 2592000000;
      const since = new Date(now.getTime() - rangeMs).toISOString();

      // Fetch analytics_events from database
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!events || events.length === 0) {
        setData({
          overview: { totalEvents: 0, uniqueUsers: 0, sessions: 0, pageviews: 0, avgSessionDuration: 0, bounceRate: 0 },
          eventsByType: [], pageViews: [], hourlyActivity: [], dailyTrend: [],
          topReferrers: [], webVitals: [], conversionFunnel: [],
        });
        setLoading(false);
        return;
      }

      // Process events
      const uniqueUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size;
      const uniqueSessions = new Set(events.filter(e => e.session_id).map(e => e.session_id)).size;
      const pageviewEvents = events.filter(e => e.event_type === 'page_view' || e.event_type === 'funnel_pageview');

      // Events by type
      const typeCounts: Record<string, number> = {};
      events.forEach(e => { typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1; });
      const eventsByType = Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Page views
      const pageCounts: Record<string, number> = {};
      pageviewEvents.forEach(e => { if (e.page) pageCounts[e.page] = (pageCounts[e.page] || 0) + 1; });
      const pageViews = Object.entries(pageCounts)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 15);

      // Hourly activity
      const hourCounts: Record<string, number> = {};
      for (let h = 0; h < 24; h++) hourCounts[`${h.toString().padStart(2, '0')}:00`] = 0;
      events.forEach(e => {
        const hr = new Date(e.created_at).getHours();
        const key = `${hr.toString().padStart(2, '0')}:00`;
        hourCounts[key] = (hourCounts[key] || 0) + 1;
      });
      const hourlyActivity = Object.entries(hourCounts).map(([hour, evts]) => ({ hour, events: evts }));

      // Daily trend
      const dailyCounts: Record<string, { events: number; users: Set<string> }> = {};
      events.forEach(e => {
        const day = e.created_at.slice(0, 10);
        if (!dailyCounts[day]) dailyCounts[day] = { events: 0, users: new Set() };
        dailyCounts[day].events++;
        if (e.user_id) dailyCounts[day].users.add(e.user_id);
      });
      const dailyTrend = Object.entries(dailyCounts)
        .map(([date, d]) => ({ date, events: d.events, users: d.users.size }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Conversion funnel
      const funnelStages = ['landing', 'engagement', 'onboarding', 'signup', 'conversion', 'deep_engagement'];
      const funnelEvents = events.filter(e => e.event_type === 'funnel_pageview');
      const funnelCounts: Record<string, Set<string>> = {};
      funnelStages.forEach(s => funnelCounts[s] = new Set());
      funnelEvents.forEach(e => {
        if (e.label && funnelCounts[e.label]) {
          funnelCounts[e.label].add(e.session_id || 'anon');
        }
      });
      const landingCount = funnelCounts['landing']?.size || 1;
      const conversionFunnel = funnelStages.map(stage => ({
        stage: stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' '),
        count: funnelCounts[stage]?.size || 0,
        rate: Math.round(((funnelCounts[stage]?.size || 0) / landingCount) * 100),
      }));

      // Web vitals from events
      const vitalEvents = events.filter(e => e.event_type === 'web_vital');
      const vitalAgg: Record<string, { sum: number; count: number; rating: string }> = {};
      vitalEvents.forEach(e => {
        const meta = e.metadata as Record<string, unknown> | null;
        if (meta?.name && typeof meta.value === 'number') {
          const name = meta.name as string;
          if (!vitalAgg[name]) vitalAgg[name] = { sum: 0, count: 0, rating: 'good' };
          vitalAgg[name].sum += meta.value as number;
          vitalAgg[name].count++;
          if (meta.rating === 'poor') vitalAgg[name].rating = 'poor';
          else if (meta.rating === 'needs-improvement' && vitalAgg[name].rating !== 'poor') vitalAgg[name].rating = 'needs-improvement';
        }
      });
      const webVitals = Object.entries(vitalAgg).map(([name, v]) => ({
        name, value: Math.round((v.sum / v.count) * 100) / 100, rating: v.rating,
      }));

      setData({
        overview: {
          totalEvents: events.length,
          uniqueUsers: uniqueUsers,
          sessions: uniqueSessions,
          pageviews: pageviewEvents.length,
          avgSessionDuration: 0,
          bounceRate: 0,
        },
        eventsByType,
        pageViews,
        hourlyActivity,
        dailyTrend,
        topReferrers: [],
        webVitals,
        conversionFunnel,
      });
      setLastRefresh(new Date());
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">PostHog Analytics</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Product analytics · {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['24h', '7d', '30d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  timeRange === r
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Activity} label="Total Events" value={data.overview.totalEvents} />
        <MetricCard icon={Users} label="Unique Users" value={data.overview.uniqueUsers} />
        <MetricCard icon={Globe} label="Sessions" value={data.overview.sessions} />
        <MetricCard icon={Eye} label="Page Views" value={data.overview.pageviews} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Daily trend */}
          {data.dailyTrend.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-medium mb-4">Daily Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="events" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Hourly + Events by type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-medium mb-4">Hourly Activity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-medium mb-4">Top Events</h3>
              <div className="space-y-2">
                {data.eventsByType.map((evt, i) => (
                  <div key={evt.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="truncate text-muted-foreground">{evt.name}</span>
                    </div>
                    <Badge variant="secondary" className="shrink-0 ml-2">{evt.count}</Badge>
                  </div>
                ))}
                {data.eventsByType.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No events in this period</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium mb-4">Top Pages</h3>
            {data.pageViews.length > 0 ? (
              <div className="space-y-3">
                {data.pageViews.map((p, i) => {
                  const maxViews = data.pageViews[0]?.views || 1;
                  return (
                    <div key={p.page} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-4">{p.page}</span>
                        <span className="font-medium shrink-0">{p.views}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(p.views / maxViews) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No page view data</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium mb-4">Conversion Funnel</h3>
            {data.conversionFunnel.some(s => s.count > 0) ? (
              <div className="space-y-3">
                {data.conversionFunnel.map((stage, i) => (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{stage.stage}</span>
                      <span className="font-medium">{stage.count} <span className="text-xs text-muted-foreground">({stage.rate}%)</span></span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${stage.rate}%`, background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No funnel data yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium mb-4">Core Web Vitals</h3>
            {data.webVitals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.webVitals.map(v => (
                  <div key={v.name} className="rounded-lg border border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{v.name}</p>
                    <p className="text-2xl font-bold">{v.value}{v.name === 'CLS' ? '' : 'ms'}</p>
                    <Badge variant={v.rating === 'good' ? 'default' : v.rating === 'poor' ? 'destructive' : 'secondary'} className="mt-2">
                      {v.rating}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No Web Vitals data yet. Vitals are measured in production only.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════

function MetricCard({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE WRAPPER
// ═══════════════════════════════════════════════════════════════

export default function PostHogDashboard() {
  return (
    <AdminLayout>
      <Helmet>
        <title>PostHog Analytics | CMPSBL Admin</title>
      </Helmet>
      <PostHogDashboardContent />
    </AdminLayout>
  );
}
