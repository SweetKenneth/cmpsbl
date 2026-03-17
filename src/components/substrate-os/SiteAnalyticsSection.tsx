/**
 * Site Analytics Dashboard — Human Traffic Intelligence
 * Comprehensive visitor analytics with bot filtering and owner exclusion.
 * Shows: visitors, sessions, pages, time, referrers, devices, fingerprints, geography
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Clock, MousePointerClick, Globe, Monitor, Smartphone,
  Tablet, ArrowUpRight, ArrowDownRight, BarChart3, RefreshCw,
  MapPin, Fingerprint, Eye, Timer, Layers, TrendingUp,
  ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';


// ─── Types ──────────────────────────────────────────────────────────
interface SiteAnalyticsData {
  // Core metrics
  uniqueVisitors: number;
  totalPageViews: number;
  totalSessions: number;
  avgPagesPerSession: number;
  avgSessionDuration: number; // ms
  bounceRate: number; // %
  // Unique fingerprints
  uniqueFingerprints: number;
  returningVisitors: number;
  newVisitors: number;
  // Page metrics
  topPages: { path: string; views: number; avgTime: number; avgScroll: number }[];
  // Referrers
  topReferrers: { domain: string; count: number }[];
  // Devices
  deviceBreakdown: { type: string; count: number }[];
  browserBreakdown: { name: string; count: number }[];
  osBreakdown: { name: string; count: number }[];
  // Screen sizes
  screenSizes: { size: string; count: number }[];
  // Geography
  topTimezones: { tz: string; count: number }[];
  topLanguages: { lang: string; count: number }[];
  // Time series
  dailyViews: { date: string; views: number; sessions: number; visitors: number }[];
  // UTM
  topUTMSources: { source: string; count: number }[];
  // Connection types
  connectionTypes: { type: string; count: number }[];
}

type DateRangeKey = 'today' | 'yesterday' | '7d' | '30d' | '90d' | '365d' | 'all';

function getDateRange(key: DateRangeKey): { start: Date; end: Date } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (key) {
    case 'today':
      return { start: todayStart, end: now };
    case 'yesterday': {
      const yStart = new Date(todayStart);
      yStart.setDate(yStart.getDate() - 1);
      return { start: yStart, end: todayStart };
    }
    case '7d':
      return { start: new Date(Date.now() - 7 * 86400000), end: now };
    case '30d':
      return { start: new Date(Date.now() - 30 * 86400000), end: now };
    case '90d':
      return { start: new Date(Date.now() - 90 * 86400000), end: now };
    case '365d':
      return { start: new Date(Date.now() - 365 * 86400000), end: now };
    case 'all':
      return { start: new Date('2020-01-01'), end: now };
  }
}

// ─── Fetch Logic (Server-Side Aggregation) ──────────────────────────
async function fetchSiteAnalytics(rangeKey: DateRangeKey): Promise<SiteAnalyticsData> {
  const { start, end } = getDateRange(rangeKey);

  const { data, error } = await supabase.rpc('get_site_analytics_aggregated', {
    p_start_date: start.toISOString(),
    p_end_date: end.toISOString(),
  });

  if (error || !data) {
    console.error('Site analytics RPC error:', error);
    return emptyAnalytics(rangeKey);
  }

  const raw = data as any;
  const core = raw.core || {};
  const pageViewCount = raw.page_view_count || 0;

  const uniqueVisitors = core.unique_visitors || 0;
  const totalSessions = core.total_sessions || 0;
  const totalPageViews = pageViewCount > 0 ? pageViewCount : (core.total_page_views || 0);
  const returningVisitors = core.returning_visitors || 0;
  const newVisitors = Math.max(0, uniqueVisitors - returningVisitors);

  // Build daily time series — fill gaps
  const dailyRaw: { day: string; views: number; sessions: number; visitors: number }[] = raw.daily || [];
  const dailyMap = new Map(dailyRaw.map(d => [d.day, d]));
  const days = rangeKey === 'today' ? 1 : rangeKey === 'yesterday' ? 1 : rangeKey === '7d' ? 7 : rangeKey === '30d' ? 30 : rangeKey === '90d' ? 90 : rangeKey === '365d' ? 365 : 90;
  const dailyViews: SiteAnalyticsData['dailyViews'] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86400000).toISOString().split('T')[0];
    const dd = dailyMap.get(d);
    dailyViews.push({
      date: d,
      views: dd?.views || 0,
      sessions: dd?.sessions || 0,
      visitors: dd?.visitors || 0,
    });
  }

  return {
    uniqueVisitors,
    totalPageViews,
    totalSessions,
    avgPagesPerSession: core.avg_pages_per_visitor || core.avg_pages_per_session || 0,
    avgSessionDuration: core.avg_session_duration_ms || 0,
    bounceRate: core.bounce_rate || 0,
    uniqueFingerprints: core.unique_fingerprints || 0,
    returningVisitors,
    newVisitors,
    topPages: (raw.top_pages || []).map((p: any) => ({
      path: p.path, views: p.views, avgTime: p.avg_time || 0, avgScroll: p.avg_scroll || 0,
    })),
    topReferrers: (raw.referrers || []).map((r: any) => ({ domain: r.domain, count: r.count })),
    deviceBreakdown: (raw.devices || []).map((d: any) => ({ type: d.type, count: d.count })),
    browserBreakdown: (raw.browsers || []).map((b: any) => ({ name: b.name, count: b.count })),
    osBreakdown: (raw.os_breakdown || []).map((o: any) => ({ name: o.name, count: o.count })),
    screenSizes: (raw.screens || []).map((s: any) => ({ size: s.size, count: s.count })),
    topTimezones: (raw.timezones || []).map((t: any) => ({ tz: t.tz, count: t.count })),
    topLanguages: (raw.languages || []).map((l: any) => ({ lang: l.lang, count: l.count })),
    dailyViews,
    topUTMSources: (raw.utm_sources || []).map((u: any) => ({ source: u.source, count: u.count })),
    connectionTypes: (raw.connection_types || []).map((c: any) => ({ type: c.type, count: c.count })),
  };
}

function emptyAnalytics(rangeKey: DateRangeKey): SiteAnalyticsData {
  return {
    uniqueVisitors: 0, totalPageViews: 0, totalSessions: 0,
    avgPagesPerSession: 0, avgSessionDuration: 0, bounceRate: 0,
    uniqueFingerprints: 0, returningVisitors: 0, newVisitors: 0,
    topPages: [], topReferrers: [], deviceBreakdown: [], browserBreakdown: [],
    osBreakdown: [], screenSizes: [], topTimezones: [], topLanguages: [],
    dailyViews: [], topUTMSources: [], connectionTypes: [],
  };
}

// ─── Helper Components ──────────────────────────────────────────────
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  if (mins < 60) return `${mins}m ${remSecs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function MetricCard({ label, value, sub, icon: Icon, iconColor, border, bg, iconBg, trend }: {
  label: string; value: string; sub: string;
  icon: any; iconColor: string; border: string; bg: string; iconBg: string;
  trend?: 'up' | 'down' | null;
}) {
  return (
    <motion.div
      className={cn("p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl", border, bg)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", iconBg)}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
        <span className="text-[10px] text-muted-foreground font-mono uppercase">{label}</span>
        {trend && (
          trend === 'up'
            ? <ArrowUpRight className="w-3 h-3 text-green-400 ml-auto" />
            : <ArrowDownRight className="w-3 h-3 text-red-400 ml-auto" />
        )}
      </div>
      <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
    </motion.div>
  );
}

function RankList({ title, icon: Icon, iconColor, items, valueLabel }: {
  title: string; icon: any; iconColor: string;
  items: { label: string; value: number }[];
  valueLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 5);
  const maxVal = items[0]?.value || 1;

  return (
    <motion.div
      className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className={cn("w-4 h-4", iconColor)} /> {title}
      </h3>
      <div className="space-y-2">
        {shown.length > 0 ? shown.map((item, idx) => {
          const pct = (item.value / maxVal) * 100;
          return (
            <div key={item.label + idx}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-foreground/80 truncate max-w-[60%]">{item.label}</span>
                <span className="font-mono text-muted-foreground">{item.value}{valueLabel ? ` ${valueLabel}` : ''}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full bg-gradient-to-r from-cyan-500/70 to-blue-500/50")}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: idx * 0.03 }}
                />
              </div>
            </div>
          );
        }) : (
          <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
        )}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground hover:text-foreground transition"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Show less' : `Show all ${items.length}`}
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export function SiteAnalyticsSection() {
  const [data, setData] = useState<SiteAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeKey>('7d');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchSiteAnalytics(dateRange);
      setData(result);
    } catch (e) {
      console.error('Site analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Human Traffic Intelligence</h2>
            <p className="text-xs text-muted-foreground font-mono">BOTS EXCLUDED • OWNER EXCLUDED • REAL HUMANS ONLY</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 flex-wrap">
            {([
              { key: 'today' as const, label: 'Today' },
              { key: 'yesterday' as const, label: 'Yesterday' },
              { key: '7d' as const, label: '7d' },
              { key: '30d' as const, label: '30d' },
              { key: '90d' as const, label: '90d' },
              { key: '365d' as const, label: '1y' },
              { key: 'all' as const, label: 'All' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateRange(key)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  dateRange === key
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5 h-8">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            <span className="text-xs hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : data ? (
        <>
          {/* Core Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MetricCard
              label="Unique Visitors" value={fmt(data.uniqueVisitors)}
              sub={`${data.newVisitors} new · ${data.returningVisitors} returning`}
              icon={Users} iconColor="text-green-400"
              border="border-green-500/30" bg="from-green-500/10 to-green-500/5"
              iconBg="bg-green-500/20 border-green-500/40"
            />
            <MetricCard
              label="Page Views" value={fmt(data.totalPageViews)}
              sub={`${data.totalSessions} sessions`}
              icon={Eye} iconColor="text-blue-400"
              border="border-blue-500/30" bg="from-blue-500/10 to-blue-500/5"
              iconBg="bg-blue-500/20 border-blue-500/40"
            />
            <MetricCard
              label="Pages / Visitor" value={data.avgPagesPerSession.toFixed(1)}
              sub="avg depth"
              icon={Layers} iconColor="text-purple-400"
              border="border-purple-500/30" bg="from-purple-500/10 to-purple-500/5"
              iconBg="bg-purple-500/20 border-purple-500/40"
            />
            <MetricCard
              label="Avg Duration" value={formatDuration(data.avgSessionDuration)}
              sub="per session"
              icon={Timer} iconColor="text-cyan-400"
              border="border-cyan-500/30" bg="from-cyan-500/10 to-cyan-500/5"
              iconBg="bg-cyan-500/20 border-cyan-500/40"
            />
            <MetricCard
              label="Bounce Rate" value={`${data.bounceRate}%`}
              sub="single-page visits"
              icon={ArrowDownRight} iconColor="text-amber-400"
              border="border-amber-500/30" bg="from-amber-500/10 to-amber-500/5"
              iconBg="bg-amber-500/20 border-amber-500/40"
            />
            <MetricCard
              label="Fingerprints" value={fmt(data.uniqueFingerprints)}
              sub="unique device profiles"
              icon={Fingerprint} iconColor="text-rose-400"
              border="border-rose-500/30" bg="from-rose-500/10 to-rose-500/5"
              iconBg="bg-rose-500/20 border-rose-500/40"
            />
          </div>

          {/* Daily Chart */}
          <motion.div
            className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Daily Traffic</h3>
              <div className="flex gap-3 text-[9px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Visitors</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Views</span>
              </div>
            </div>
            <div className="flex items-end gap-1 h-32">
              {data.dailyViews.map((day, idx, arr) => {
                const maxVal = Math.max(...arr.map(d => d.views), 1);
                const height = (day.views / maxVal) * 100;
                return (
                  <div key={day.date} className="flex-1 group relative">
                    <motion.div
                      className="w-full rounded-t-md bg-gradient-to-t from-green-500/60 to-blue-400/30 hover:from-green-500/80 hover:to-blue-400/50 transition-all cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3 + idx * 0.02 }}
                    />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                      <div className="bg-background border border-border/60 rounded-md px-2 py-1 text-[9px] font-mono whitespace-nowrap shadow-lg">
                        {day.visitors} visitors · {day.views} views · {day.date.slice(5)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-muted-foreground font-mono">
              <span>{data.dailyViews[0]?.date.slice(5)}</span>
              <span>{data.dailyViews[data.dailyViews.length - 1]?.date.slice(5)}</span>
            </div>
          </motion.div>

          {/* Top Pages — Full Width */}
          <motion.div
            className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-blue-400" /> Top Pages
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 text-muted-foreground font-medium">Page</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Views</th>
                    <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">Avg Time</th>
                    <th className="text-right py-2 text-muted-foreground font-medium hidden sm:table-cell">Avg Scroll</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.slice(0, 15).map((page, idx) => (
                    <tr key={page.path} className="border-b border-border/10 hover:bg-muted/10 transition">
                      <td className="py-2 font-mono text-foreground/80 truncate max-w-[200px]">{page.path}</td>
                      <td className="py-2 text-right font-mono font-semibold text-foreground">{page.views}</td>
                      <td className="py-2 text-right font-mono text-muted-foreground hidden sm:table-cell">{formatDuration(page.avgTime)}</td>
                      <td className="py-2 text-right font-mono text-muted-foreground hidden sm:table-cell">{page.avgScroll}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.topPages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No page data yet</p>
              )}
            </div>
          </motion.div>

          {/* Grid: Referrers + Devices + Browsers + OS */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <RankList
              title="Traffic Sources"
              icon={ExternalLink}
              iconColor="text-orange-400"
              items={[
                { label: 'Direct', value: data.totalSessions - data.topReferrers.reduce((a, r) => a + r.count, 0) },
                ...data.topReferrers.map(r => ({ label: r.domain, value: r.count })),
              ].filter(i => i.value > 0).sort((a, b) => b.value - a.value)}
            />
            <RankList
              title="Devices"
              icon={Monitor}
              iconColor="text-purple-400"
              items={data.deviceBreakdown.map(d => ({ label: d.type, value: d.count }))}
            />
            <RankList
              title="Browsers"
              icon={Globe}
              iconColor="text-blue-400"
              items={data.browserBreakdown.map(b => ({ label: b.name, value: b.count }))}
            />
            <RankList
              title="Operating Systems"
              icon={Monitor}
              iconColor="text-green-400"
              items={data.osBreakdown.map(o => ({ label: o.name, value: o.count }))}
            />
          </div>

          {/* Grid: Timezones + Languages + Screens + UTM + Connection */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            <RankList
              title="Timezones (Geography)"
              icon={MapPin}
              iconColor="text-rose-400"
              items={data.topTimezones.map(t => ({ label: t.tz.replace(/_/g, ' '), value: t.count }))}
            />
            <RankList
              title="Languages"
              icon={Globe}
              iconColor="text-cyan-400"
              items={data.topLanguages.map(l => ({ label: l.lang, value: l.count }))}
            />
            <RankList
              title="Screen Resolutions"
              icon={Monitor}
              iconColor="text-indigo-400"
              items={data.screenSizes.map(s => ({ label: s.size, value: s.count }))}
            />
          </div>

          {/* UTM + Connection */}
          {(data.topUTMSources.length > 0 || data.connectionTypes.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {data.topUTMSources.length > 0 && (
                <RankList
                  title="UTM Sources"
                  icon={TrendingUp}
                  iconColor="text-amber-400"
                  items={data.topUTMSources.map(u => ({ label: u.source, value: u.count }))}
                />
              )}
              {data.connectionTypes.length > 0 && (
                <RankList
                  title="Connection Types"
                  icon={Globe}
                  iconColor="text-teal-400"
                  items={data.connectionTypes.map(c => ({ label: c.type, value: c.count }))}
                />
              )}
            </div>
          )}

          {/* Owner Exclusion Tool */}
          <motion.div
            className="p-4 rounded-2xl border border-border/30 bg-muted/10 flex items-center justify-between flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <p className="text-xs font-medium text-foreground">Owner Device Exclusion</p>
              <p className="text-[10px] text-muted-foreground">
                Click to exclude this device's fingerprint from all analytics data.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={async () => {
                // Generate fingerprint for current device
                const components = [
                  navigator.userAgent, navigator.language,
                  screen.width + 'x' + screen.height, screen.colorDepth,
                  new Date().getTimezoneOffset(), navigator.hardwareConcurrency || 0,
                  (navigator as any).deviceMemory || 0, navigator.maxTouchPoints || 0,
                  navigator.platform,
                ];
                const str = components.join('|');
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                  hash = ((hash << 5) - hash) + str.charCodeAt(i);
                  hash |= 0;
                }
                const fp = 'fp_' + Math.abs(hash).toString(36);
                
                const { error } = await supabase.from('site_analytics_exclusions').insert({
                  exclusion_type: 'fingerprint',
                  value: fp,
                  reason: 'Owner device self-excluded',
                });
                if (!error) {
                  alert(`Excluded fingerprint: ${fp}\nYour visits will no longer appear in analytics.`);
                  load();
                } else {
                  alert('Failed to exclude: ' + error.message);
                }
              }}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              Exclude This Device
            </Button>
          </motion.div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No site analytics data available yet</p>
          <p className="text-xs mt-1">Data will appear as real visitors browse the site</p>
        </div>
      )}
    </div>
  );
}
