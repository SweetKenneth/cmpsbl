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
import { isBotUA } from '@/lib/analytics/bot-patterns';

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

// ─── Fetch Logic ────────────────────────────────────────────────────
async function fetchSiteAnalytics(days: number): Promise<SiteAnalyticsData> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch exclusions for owner filtering
  const { data: exclusions } = await supabase
    .from('site_analytics_exclusions')
    .select('exclusion_type, value');

  const excludedFingerprints = new Set(
    (exclusions || []).filter(e => e.exclusion_type === 'fingerprint').map(e => e.value)
  );

  const [pvRes, sessRes] = await Promise.all([
    supabase
      .from('site_page_views')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('site_sessions')
      .select('*')
      .gte('started_at', startDate)
      .order('started_at', { ascending: false })
      .limit(1000),
  ]);

  // Filter bots and owner
  const rawViews = (pvRes.data || []).filter(v => {
    if (isBotUA(v.user_agent || '')) return false;
    if (excludedFingerprints.has(v.fingerprint_hash || '')) return false;
    return true;
  });

  const rawSessions = (sessRes.data || []).filter(s => {
    if (excludedFingerprints.has(s.fingerprint_hash || '')) return false;
    return true;
  });

  // Build visitor identity from both tables (session-first fallback if page views are missing)
  const fingerprintSetFromSessions = new Set<string>(
    rawSessions.map(s => s.fingerprint_hash).filter(Boolean)
  );
  const fingerprintSetFromViews = new Set<string>(
    rawViews.map(v => v.fingerprint_hash).filter(Boolean)
  );
  const allFingerprintSet = new Set<string>([
    ...Array.from(fingerprintSetFromSessions),
    ...Array.from(fingerprintSetFromViews),
  ]);

  const fallbackVisitorIds = new Set<string>([
    ...rawSessions.map(s => s.fingerprint_hash || `session:${s.id}`),
    ...rawViews.map(v => v.fingerprint_hash || `session:${v.session_id}`),
  ].filter(Boolean) as string[]);

  const uniqueVisitors = allFingerprintSet.size > 0 ? allFingerprintSet.size : fallbackVisitorIds.size;

  // Session metrics
  const totalSessions = rawSessions.length;
  const bounceSessions = rawSessions.filter(s => s.is_bounce).length;
  const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 1000) / 10 : 0;
  const avgPagesPerSession = totalSessions > 0
    ? Math.round((rawSessions.reduce((a, s) => a + (s.page_count || 1), 0) / totalSessions) * 10) / 10
    : 0;
  const sessionDurations = rawSessions
    .map(s => s.total_duration_ms || 0)
    .filter(d => d > 0);
  const avgSessionDuration = sessionDurations.length > 0
    ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
    : 0;

  // Page views: prefer page-view table, fallback to session page_count when page-view rows are missing
  const totalPageViewsFromSessions = rawSessions.reduce((sum, s) => sum + Math.max(1, s.page_count || 1), 0);
  const totalPageViews = rawViews.length > 0 ? rawViews.length : totalPageViewsFromSessions;

  // Returning vs new
  const sessionFingerprints = new Map<string, number>();
  rawSessions.forEach(s => {
    const fp = s.fingerprint_hash;
    if (fp) sessionFingerprints.set(fp, (sessionFingerprints.get(fp) || 0) + 1);
  });
  const returningVisitors = Array.from(sessionFingerprints.values()).filter(c => c > 1).length;
  const newVisitors = Math.max(0, uniqueVisitors - returningVisitors);

  // Top pages
  const pageCounts = new Map<string, { views: number; totalTime: number; totalScroll: number; timeCount: number; scrollCount: number }>();

  if (rawViews.length > 0) {
    rawViews.forEach(v => {
      const path = v.page_path || '/';
      const existing = pageCounts.get(path) || { views: 0, totalTime: 0, totalScroll: 0, timeCount: 0, scrollCount: 0 };
      existing.views++;
      if (v.time_on_page_ms && v.time_on_page_ms > 0) {
        existing.totalTime += v.time_on_page_ms;
        existing.timeCount++;
      }
      if (v.scroll_depth_pct != null) {
        existing.totalScroll += v.scroll_depth_pct;
        existing.scrollCount++;
      }
      pageCounts.set(path, existing);
    });
  } else {
    // Fallback for historical rows created before page-view capture was fixed
    rawSessions.forEach(s => {
      const path = s.first_page || s.last_page || '/';
      const existing = pageCounts.get(path) || { views: 0, totalTime: 0, totalScroll: 0, timeCount: 0, scrollCount: 0 };
      existing.views += Math.max(1, s.page_count || 1);
      if (s.total_duration_ms && s.total_duration_ms > 0) {
        existing.totalTime += s.total_duration_ms;
        existing.timeCount++;
      }
      pageCounts.set(path, existing);
    });
  }

  const topPages = Array.from(pageCounts.entries())
    .map(([path, d]) => ({
      path,
      views: d.views,
      avgTime: d.timeCount > 0 ? Math.round(d.totalTime / d.timeCount) : 0,
      avgScroll: d.scrollCount > 0 ? Math.round(d.totalScroll / d.scrollCount) : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  // Referrers
  const refCounts = new Map<string, number>();
  rawSessions.forEach(s => {
    const domain = s.referrer_domain;
    if (domain) refCounts.set(domain, (refCounts.get(domain) || 0) + 1);
  });
  const topReferrers = Array.from(refCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));

  // Device breakdown
  const deviceCounts = new Map<string, number>();
  rawSessions.forEach(s => {
    const t = s.device_type || 'unknown';
    deviceCounts.set(t, (deviceCounts.get(t) || 0) + 1);
  });
  const deviceBreakdown = Array.from(deviceCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Browser breakdown
  const browserCounts = new Map<string, number>();
  rawSessions.forEach(s => {
    if (s.browser) browserCounts.set(s.browser, (browserCounts.get(s.browser) || 0) + 1);
  });
  const browserBreakdown = Array.from(browserCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // OS breakdown
  const osCounts = new Map<string, number>();
  rawSessions.forEach(s => {
    if (s.os) osCounts.set(s.os, (osCounts.get(s.os) || 0) + 1);
  });
  const osBreakdown = Array.from(osCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Screen sizes
  const screenCounts = new Map<string, number>();
  rawSessions.forEach(s => {
    if (s.screen_width && s.screen_height) {
      const size = `${s.screen_width}×${s.screen_height}`;
      screenCounts.set(size, (screenCounts.get(size) || 0) + 1);
    }
  });
  const screenSizes = Array.from(screenCounts.entries())
    .map(([size, count]) => ({ size, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Timezones
  const tzCounts = new Map<string, number>();
  rawSessions.forEach(s => {
    if (s.timezone) tzCounts.set(s.timezone, (tzCounts.get(s.timezone) || 0) + 1);
  });
  const topTimezones = Array.from(tzCounts.entries())
    .map(([tz, count]) => ({ tz, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Languages
  const langCounts = new Map<string, number>();
  rawSessions.forEach(s => {
    if (s.language) langCounts.set(s.language, (langCounts.get(s.language) || 0) + 1);
  });
  const topLanguages = Array.from(langCounts.entries())
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Daily time series (page-view first, sessions fallback)
  const dailyMap = new Map<string, { views: number; sessions: Set<string>; visitors: Set<string> }>();

  if (rawViews.length > 0) {
    rawViews.forEach(v => {
      const day = (v.created_at || '').split('T')[0];
      if (!day) return;
      const existing = dailyMap.get(day) || { views: 0, sessions: new Set(), visitors: new Set() };
      existing.views++;
      existing.sessions.add(v.session_id);
      if (v.fingerprint_hash) existing.visitors.add(v.fingerprint_hash);
      dailyMap.set(day, existing);
    });
  } else {
    rawSessions.forEach(s => {
      const day = (s.started_at || '').split('T')[0];
      if (!day) return;
      const existing = dailyMap.get(day) || { views: 0, sessions: new Set(), visitors: new Set() };
      existing.views += Math.max(1, s.page_count || 1);
      existing.sessions.add(s.id);
      if (s.fingerprint_hash) existing.visitors.add(s.fingerprint_hash);
      dailyMap.set(day, existing);
    });
  }

  const dailyViews: SiteAnalyticsData['dailyViews'] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dd = dailyMap.get(d);
    dailyViews.push({
      date: d,
      views: dd?.views || 0,
      sessions: dd?.sessions.size || 0,
      visitors: dd?.visitors.size || 0,
    });
  }

  // UTM sources
  const utmCounts = new Map<string, number>();
  rawSessions.forEach(s => {
    if (s.utm_source) utmCounts.set(s.utm_source, (utmCounts.get(s.utm_source) || 0) + 1);
  });
  const topUTMSources = Array.from(utmCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Connection types
  const connCounts = new Map<string, number>();
  rawViews.forEach(v => {
    if (v.connection_type) connCounts.set(v.connection_type, (connCounts.get(v.connection_type) || 0) + 1);
  });
  const connectionTypes = Array.from(connCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    uniqueVisitors,
    totalPageViews,
    totalSessions,
    avgPagesPerSession,
    avgSessionDuration,
    bounceRate,
    uniqueFingerprints: allFingerprintSet.size,
    returningVisitors,
    newVisitors,
    topPages,
    topReferrers,
    deviceBreakdown,
    browserBreakdown,
    osBreakdown,
    screenSizes,
    topTimezones,
    topLanguages,
    dailyViews,
    topUTMSources,
    connectionTypes,
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
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const result = await fetchSiteAnalytics(days);
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
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  dateRange === range
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range}
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
              label="Pages / Session" value={data.avgPagesPerSession.toFixed(1)}
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
              {data.dailyViews.slice(-(dateRange === '7d' ? 7 : 30)).map((day, idx, arr) => {
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
              <span>{data.dailyViews.slice(-(dateRange === '7d' ? 7 : 30))[0]?.date.slice(5)}</span>
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
