/**
 * Analytics Intelligence Dashboard — Governor-Only
 * World-class analytics: Real-time pulse, cohort retention, churn scoring,
 * journey flows, feature adoption, visitor intelligence, conversion tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Users, Clock, TrendingUp, Activity, Eye, Layers,
  ArrowRight, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Zap, Route, Flame, BarChart3, Settings, Trash2, UserX, Bot, Plus,
  ArrowDownRight, ArrowUpRight, ShieldOff, Loader2, Fingerprint,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface RealtimePulse {
  active_5min: number;
  active_15min: number;
  active_1hr: number;
  sessions_today: number;
  pageviews_today: number;
  avg_pages_today: number;
  top_pages_now: { page: string; count: number }[];
  hourly_today: { hour: number; sessions: number }[];
  page_times: { page: string; avg_time_ms: number; views: number }[];
}

interface CohortRow {
  cohort: string;
  size: number;
  d1: number; d7: number; d14: number; d30: number;
  d1_pct: number; d7_pct: number; d14_pct: number; d30_pct: number;
}

interface ChurnVisitor {
  fingerprint: string;
  churn_score: number;
  risk_level: 'critical' | 'warning' | 'healthy';
  total_sessions: number;
  last_visit: string;
  days_since_visit: number;
  avg_pages: number;
  avg_duration_ms: number;
  recent_7d: number;
  prev_7d: number;
}

interface ChurnData {
  visitors: ChurnVisitor[];
  summary: {
    total_scored: number;
    critical_count: number;
    warning_count: number;
    healthy_count: number;
    avg_score: number;
  };
}

interface JourneyFlows {
  transitions: { from: string; to: string; count: number; sessions: number }[];
  entry_pages: { page: string; entries: number }[];
  exit_pages: { page: string; exits: number }[];
  drop_offs: { page: string; views: number; drops: number; drop_rate: number }[];
}

interface FeatureAdoption {
  features: {
    feature: string;
    category: string;
    total_uses: number;
    unique_users: number;
    unique_sessions: number;
    avg_per_user: number;
    trend_7d: number;
    trend_prev_7d: number;
  }[];
  category_totals: { category: string; count: number }[];
}

type Tab = 'pulse' | 'retention' | 'churn' | 'journeys' | 'features' | 'exclusions';

interface ExcludedFingerprint {
  id: string;
  fingerprint: string;
  reason: string;
  label: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function trendIcon(current: number, prev: number) {
  if (prev === 0 && current === 0) return null;
  if (current > prev) return <ArrowUpRight className="w-3 h-3 text-green-400" />;
  if (current < prev) return <ArrowDownRight className="w-3 h-3 text-red-400" />;
  return null;
}

function trendPct(current: number, prev: number): string {
  if (prev === 0) return current > 0 ? '+∞' : '—';
  const pct = ((current - prev) / prev) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`;
}

// ─── Static color maps (Tailwind needs full class names at build time) ───

const CARD_STYLES: Record<string, { border: string; bg: string; iconBg: string; iconColor: string }> = {
  green:   { border: 'border-green-500/30',   bg: 'from-green-500/10 to-green-500/5',     iconBg: 'bg-green-500/20 border-green-500/40',     iconColor: 'text-green-400' },
  emerald: { border: 'border-emerald-500/30', bg: 'from-emerald-500/10 to-emerald-500/5', iconBg: 'bg-emerald-500/20 border-emerald-500/40', iconColor: 'text-emerald-400' },
  blue:    { border: 'border-blue-500/30',    bg: 'from-blue-500/10 to-blue-500/5',       iconBg: 'bg-blue-500/20 border-blue-500/40',       iconColor: 'text-blue-400' },
  purple:  { border: 'border-purple-500/30',  bg: 'from-purple-500/10 to-purple-500/5',   iconBg: 'bg-purple-500/20 border-purple-500/40',   iconColor: 'text-purple-400' },
  cyan:    { border: 'border-cyan-500/30',    bg: 'from-cyan-500/10 to-cyan-500/5',       iconBg: 'bg-cyan-500/20 border-cyan-500/40',       iconColor: 'text-cyan-400' },
  amber:   { border: 'border-amber-500/30',   bg: 'from-amber-500/10 to-amber-500/5',     iconBg: 'bg-amber-500/20 border-amber-500/40',     iconColor: 'text-amber-400' },
  red:     { border: 'border-red-500/30',     bg: 'from-red-500/10 to-red-500/5',         iconBg: 'bg-red-500/20 border-red-500/40',         iconColor: 'text-red-400' },
};

const TAB_STYLES: Record<string, string> = {
  green:  'bg-green-500/20 text-green-400 border border-green-500/40',
  blue:   'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  amber:  'bg-amber-500/20 text-amber-400 border border-amber-500/40',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
  cyan:   'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40',
  red:    'bg-red-500/20 text-red-400 border border-red-500/40',
};

// ═══════════════════════════════════════════════════════════════
// EXCLUDE DEVICE BUTTON (header-level quick action)
// ═══════════════════════════════════════════════════════════════

function ExcludeDeviceButton() {
  const [excluded, setExcluded] = useState(false);
  const [busy, setBusy] = useState(false);
  const fp = typeof localStorage !== 'undefined' ? localStorage.getItem('cmpsbl_fp') : null;

  useEffect(() => {
    if (!fp) return;
    supabase.from('analytics_excluded_fingerprints')
      .select('id')
      .eq('fingerprint', fp)
      .maybeSingle()
      .then(({ data }) => { if (data) setExcluded(true); });
  }, [fp]);

  const handleExclude = async () => {
    if (!fp || excluded) return;
    setBusy(true);
    const { error } = await supabase.from('analytics_excluded_fingerprints').insert({
      fingerprint: fp,
      reason: 'owner',
      label: 'Owner device (quick-exclude)',
    });
    if (!error) {
      setExcluded(true);
      toast.success('This device is now excluded from analytics');
    } else {
      toast.error(error.code === '23505' ? 'Already excluded' : error.message);
    }
    setBusy(false);
  };

  if (!fp) return null;

  return excluded ? (
    <Badge className="bg-green-500/20 text-green-400 border border-green-500/40 gap-1 h-9 px-3">
      <CheckCircle className="w-3 h-3" /> Device Excluded
    </Badge>
  ) : (
    <Button variant="outline" size="sm" onClick={handleExclude} disabled={busy} className="gap-1.5 h-9 border-red-500/30 text-red-400 hover:bg-red-500/10">
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Fingerprint className="w-3.5 h-3.5" />}
      Exclude This Device
    </Button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AnalyticsDashboard() {
  const [tab, setTab] = useState<Tab>('pulse');
  const [loading, setLoading] = useState(true);

  // Data stores
  const [pulse, setPulse] = useState<RealtimePulse | null>(null);
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [churn, setChurn] = useState<ChurnData | null>(null);
  const [journeys, setJourneys] = useState<JourneyFlows | null>(null);
  const [features, setFeatures] = useState<FeatureAdoption | null>(null);

  const fetchTab = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      switch (t) {
        case 'pulse': {
          const { data, error } = await supabase.rpc('get_realtime_pulse');
          if (!error && data) setPulse(data as any);
          break;
        }
        case 'retention': {
          const { data, error } = await supabase.rpc('get_cohort_retention', {
            p_cohort_window_days: 90,
            p_granularity: 'week',
          });
          if (!error) setCohorts((data as any) || []);
          break;
        }
        case 'churn': {
          const { data, error } = await supabase.rpc('get_churn_risk_scores', { p_limit: 50 });
          if (!error && data) setChurn(data as any);
          break;
        }
        case 'journeys': {
          const { data, error } = await supabase.rpc('get_journey_flows', {
            p_start_date: new Date(Date.now() - 30 * 86400000).toISOString(),
            p_min_count: 2,
          });
          if (!error && data) setJourneys(data as any);
          break;
        }
        case 'features': {
          const { data, error } = await supabase.rpc('get_feature_adoption', {
            p_start_date: new Date(Date.now() - 30 * 86400000).toISOString(),
          });
          if (!error && data) setFeatures(data as any);
          break;
        }
      }
    } catch (e) {
      console.error('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTab(tab); }, [tab, fetchTab]);

  // Auto-refresh pulse every 30s
  useEffect(() => {
    if (tab !== 'pulse') return;
    const interval = setInterval(() => fetchTab('pulse'), 30_000);
    return () => clearInterval(interval);
  }, [tab, fetchTab]);

  const tabs: { key: Tab; label: string; icon: typeof Activity; color: string }[] = [
    { key: 'pulse', label: 'Real-time', icon: Activity, color: 'green' },
    { key: 'retention', label: 'Retention', icon: TrendingUp, color: 'blue' },
    { key: 'churn', label: 'Churn Risk', icon: AlertTriangle, color: 'amber' },
    { key: 'journeys', label: 'Journeys', icon: Route, color: 'purple' },
    { key: 'features', label: 'Features', icon: Flame, color: 'cyan' },
    { key: 'exclusions', label: 'Exclusions', icon: ShieldOff, color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Analytics Intelligence — CMPSBL</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics Intelligence</h1>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                REAL-TIME • COHORTS • CHURN • JOURNEYS • FEATURES
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExcludeDeviceButton />
            <Button variant="outline" size="sm" onClick={() => fetchTab(tab)} className="gap-1.5 h-9">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tab Navigation — scrollable on mobile with 44px touch targets */}
        <div className="flex gap-1.5 p-1.5 rounded-xl bg-muted/20 border border-border/30 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-1.5">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-3 sm:px-4 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0",
                  isActive
                    ? TAB_STYLES[t.color]
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
              </div>
            ) : (
              <>
                {tab === 'pulse' && <PulseView data={pulse} />}
                {tab === 'retention' && <RetentionView cohorts={cohorts} />}
                {tab === 'churn' && <ChurnView data={churn} />}
                {tab === 'journeys' && <JourneysView data={journeys} />}
                {tab === 'features' && <FeaturesView data={features} />}
                {tab === 'exclusions' && <ExclusionsView />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REAL-TIME PULSE
// ═══════════════════════════════════════════════════════════════

function PulseView({ data }: { data: RealtimePulse | null }) {
  if (!data) return <EmptyState icon={Activity} message="No real-time data available" />;

  const maxHourSessions = Math.max(...(data.hourly_today?.map(h => h.sessions) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Live Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <PulseCard label="Active Now" value={fmt(data.active_5min)} sub="last 5 min" icon={Activity} color="green" pulse />
        <PulseCard label="Active 15m" value={fmt(data.active_15min)} sub="recent visitors" icon={Users} color="emerald" />
        <PulseCard label="Active 1h" value={fmt(data.active_1hr)} sub="hourly reach" icon={Eye} color="blue" />
        <PulseCard label="Sessions Today" value={fmt(data.sessions_today)} sub="since midnight" icon={Layers} color="purple" />
        <PulseCard label="Views Today" value={fmt(data.pageviews_today)} sub="page impressions" icon={BarChart3} color="cyan" />
        <PulseCard label="Depth Today" value={data.avg_pages_today?.toFixed(1) || '0'} sub="pages/session" icon={TrendingUp} color="amber" />
      </div>

      {/* Hourly Activity */}
      <motion.div
        className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" /> Today's Hourly Activity
        </h3>
        <div className="flex items-end gap-1 h-32">
          {Array.from({ length: 24 }, (_, i) => {
            const hourData = data.hourly_today?.find(h => h.hour === i);
            const sessions = hourData?.sessions || 0;
            const height = (sessions / maxHourSessions) * 100;
            const isCurrentHour = new Date().getHours() === i;
            return (
              <div key={i} className="flex-1 group relative">
                <motion.div
                  className={cn(
                    "w-full rounded-t-sm transition-all cursor-pointer",
                    isCurrentHour
                      ? "bg-gradient-to-t from-green-500 to-green-400"
                      : sessions > 0
                        ? "bg-gradient-to-t from-primary/60 to-primary/30 hover:from-primary/80 hover:to-primary/50"
                        : "bg-muted/20"
                  )}
                  style={{ height: `${Math.max(height, 3)}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.02 }}
                />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-background border border-border/60 rounded-md px-2 py-1 text-[9px] font-mono whitespace-nowrap shadow-lg">
                    {i}:00 — {sessions} sessions
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[9px] text-muted-foreground font-mono">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </motion.div>

      {/* Active Pages */}
      {data.top_pages_now?.length > 0 && (
        <motion.div
          className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" /> Active Pages (15 min)
          </h3>
          <div className="space-y-2">
            {data.top_pages_now.map((p) => (
              <div key={p.page} className="flex items-center justify-between text-sm">
                <span className="font-mono text-foreground/80 truncate max-w-[60%]">{p.page}</span>
                <Badge variant="outline" className="font-mono text-xs shrink-0">{p.count} views</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Per-Page Time */}
      {data.page_times?.length > 0 && (
        <motion.div
          className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" /> Time Per Page (24h avg)
          </h3>
          <div className="space-y-2">
            {data.page_times.map((p) => {
              const secs = Math.round((p.avg_time_ms || 0) / 1000);
              const mins = Math.floor(secs / 60);
              const remainSecs = secs % 60;
              const timeStr = mins > 0 ? `${mins}m ${remainSecs}s` : `${secs}s`;
              return (
                <div key={p.page} className="flex items-center justify-between text-xs gap-2">
                  <span className="font-mono text-foreground/80 truncate min-w-0">{p.page}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-muted-foreground">{p.views} views</span>
                    <Badge variant="outline" className="font-mono text-xs tabular-nums">{timeStr}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PulseCard({ label, value, sub, icon: Icon, color, pulse: isPulsing }: {
  label: string; value: string; sub: string; icon: any; color: string; pulse?: boolean;
}) {
  const styles = CARD_STYLES[color] || CARD_STYLES.blue;
  return (
    <motion.div
      className={cn(
        "p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5",
        styles.border, styles.bg
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border relative", styles.iconBg)}>
          <Icon className={cn("w-4 h-4", styles.iconColor)} />
          {isPulsing && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono uppercase">{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COHORT RETENTION
// ═══════════════════════════════════════════════════════════════

function RetentionView({ cohorts }: { cohorts: CohortRow[] }) {
  if (!cohorts || cohorts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Not enough data for cohort analysis yet</p>
        <p className="text-xs mt-1">Retention curves appear after visitors return across multiple days</p>
      </div>
    );
  }

  const retentionColor = (pct: number) => {
    if (pct >= 30) return 'bg-green-500/80 text-white';
    if (pct >= 15) return 'bg-green-500/40 text-green-100';
    if (pct >= 5) return 'bg-amber-500/30 text-amber-100';
    if (pct > 0) return 'bg-red-500/20 text-red-200';
    return 'bg-muted/10 text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <div>
          <h3 className="text-lg font-bold text-foreground">Cohort Retention</h3>
          <p className="text-xs text-muted-foreground">Visitors grouped by first-visit week. Darker = better retention.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/30">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/10">
              <th className="text-left py-3 px-3 text-muted-foreground font-medium w-32">Cohort</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-medium w-20">Size</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-medium">Day 1</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-medium">Day 7</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-medium">Day 14</th>
              <th className="text-center py-3 px-3 text-muted-foreground font-medium">Day 30</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c, idx) => (
              <motion.tr
                key={c.cohort}
                className="border-b border-border/10 hover:bg-muted/10 transition"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <td className="py-3 px-3 font-mono font-medium text-foreground">{c.cohort}</td>
                <td className="py-3 px-3 text-center font-mono text-foreground font-semibold">{c.size}</td>
                {[
                  { pct: c.d1_pct, abs: c.d1 },
                  { pct: c.d7_pct, abs: c.d7 },
                  { pct: c.d14_pct, abs: c.d14 },
                  { pct: c.d30_pct, abs: c.d30 },
                ].map((cell, ci) => (
                  <td key={ci} className="py-3 px-3 text-center">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-md font-mono text-xs font-medium min-w-[60px]",
                      retentionColor(cell.pct)
                    )}>
                      {cell.pct}%
                    </span>
                    <span className="block text-[9px] text-muted-foreground mt-0.5">{cell.abs} users</span>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span>Retention strength:</span>
        <div className="flex items-center gap-1">
          <span className="w-4 h-3 rounded bg-red-500/20" /> &lt;5%
          <span className="w-4 h-3 rounded bg-amber-500/30 ml-2" /> 5-15%
          <span className="w-4 h-3 rounded bg-green-500/40 ml-2" /> 15-30%
          <span className="w-4 h-3 rounded bg-green-500/80 ml-2" /> &gt;30%
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CHURN RISK
// ═══════════════════════════════════════════════════════════════

function ChurnView({ data }: { data: ChurnData | null }) {
  if (!data?.summary) return <EmptyState icon={AlertTriangle} message="No churn data available yet" />;

  const s = data.summary;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <PulseCard label="Total Scored" value={fmt(s.total_scored || 0)} sub="visitors analyzed" icon={Users} color="blue" />
        <PulseCard label="Avg Score" value={(s.avg_score ?? 0).toFixed(0)} sub="out of 100" icon={Activity} color="purple" />
        <PulseCard label="Critical" value={fmt(s.critical_count || 0)} sub="score ≥ 70" icon={XCircle} color="red" />
        <PulseCard label="Warning" value={fmt(s.warning_count || 0)} sub="score 40-69" icon={AlertTriangle} color="amber" />
        <PulseCard label="Healthy" value={fmt(s.healthy_count || 0)} sub="score < 40" icon={CheckCircle} color="green" />
      </div>

      {/* Risk Distribution Bar */}
      {s.total_scored > 0 && (
        <motion.div
          className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">Risk Distribution</h3>
          <div className="h-6 rounded-full overflow-hidden flex bg-muted/20">
            {s.healthy_count > 0 && (
              <motion.div
                className="bg-green-500/70 flex items-center justify-center text-[9px] font-mono text-white"
                initial={{ width: 0 }}
                animate={{ width: `${(s.healthy_count / s.total_scored) * 100}%` }}
                transition={{ duration: 0.6 }}
              >
                {Math.round((s.healthy_count / s.total_scored) * 100)}%
              </motion.div>
            )}
            {s.warning_count > 0 && (
              <motion.div
                className="bg-amber-500/70 flex items-center justify-center text-[9px] font-mono text-white"
                initial={{ width: 0 }}
                animate={{ width: `${(s.warning_count / s.total_scored) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {Math.round((s.warning_count / s.total_scored) * 100)}%
              </motion.div>
            )}
            {s.critical_count > 0 && (
              <motion.div
                className="bg-red-500/70 flex items-center justify-center text-[9px] font-mono text-white"
                initial={{ width: 0 }}
                animate={{ width: `${(s.critical_count / s.total_scored) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {Math.round((s.critical_count / s.total_scored) * 100)}%
              </motion.div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-muted-foreground font-mono">
            <span className="text-green-400">Healthy</span>
            <span className="text-amber-400">Warning</span>
            <span className="text-red-400">Critical</span>
          </div>
        </motion.div>
      )}

      {/* Visitor List */}
      {(data.visitors?.length ?? 0) > 0 && (
        <motion.div
          className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">At-Risk Visitors</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 text-muted-foreground font-medium">Fingerprint</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">Score</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">Risk</th>
                  <th className="text-right py-2 text-muted-foreground font-medium hidden md:table-cell">Sessions</th>
                  <th className="text-right py-2 text-muted-foreground font-medium hidden md:table-cell">Avg Pages</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Days Gone</th>
                  <th className="text-right py-2 text-muted-foreground font-medium hidden lg:table-cell">7d Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.visitors.slice(0, 25).map((v, idx) => (
                  <motion.tr
                    key={v.fingerprint}
                    className="border-b border-border/10 hover:bg-muted/10 transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <td className="py-2 font-mono text-foreground/70 truncate max-w-[120px]">{v.fingerprint}</td>
                    <td className="py-2 text-center">
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded font-mono font-bold",
                        v.churn_score >= 70 ? 'bg-red-500/20 text-red-400' :
                        v.churn_score >= 40 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-green-500/20 text-green-400'
                      )}>
                        {v.churn_score}
                      </span>
                    </td>
                    <td className="py-2 text-center">
                      <Badge variant="outline" className={cn("text-[9px] font-mono",
                        v.risk_level === 'critical' ? 'border-red-500/40 text-red-400' :
                        v.risk_level === 'warning' ? 'border-amber-500/40 text-amber-400' :
                        'border-green-500/40 text-green-400'
                      )}>
                        {v.risk_level}
                      </Badge>
                    </td>
                    <td className="py-2 text-right font-mono text-foreground hidden md:table-cell">{v.total_sessions}</td>
                    <td className="py-2 text-right font-mono text-muted-foreground hidden md:table-cell">{v.avg_pages}</td>
                    <td className="py-2 text-right font-mono text-muted-foreground">{v.days_since_visit}d</td>
                    <td className="py-2 text-right hidden lg:table-cell">
                      <span className="flex items-center justify-end gap-1 font-mono">
                        {trendIcon(v.recent_7d, v.prev_7d)}
                        <span className={cn(
                          v.recent_7d > v.prev_7d ? 'text-green-400' :
                          v.recent_7d < v.prev_7d ? 'text-red-400' :
                          'text-muted-foreground'
                        )}>
                          {v.recent_7d} vs {v.prev_7d}
                        </span>
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// JOURNEY FLOWS
// ═══════════════════════════════════════════════════════════════

function JourneysView({ data }: { data: JourneyFlows | null }) {
  if (!data) return <EmptyState icon={Route} message="No journey data available yet" />;

  const maxTransition = data.transitions?.[0]?.count || 1;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Entry Points */}
        <motion.div
          className="p-5 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-green-400" /> Entry Pages
          </h3>
          <div className="space-y-2">
            {(data.entry_pages || []).map(p => (
              <div key={p.page} className="flex items-center justify-between text-xs">
                <span className="font-mono text-foreground/80 truncate max-w-[65%]">{p.page}</span>
                <span className="font-mono text-green-400 font-medium">{p.entries}</span>
              </div>
            ))}
            {(!data.entry_pages || data.entry_pages.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">No data</p>
            )}
          </div>
        </motion.div>

        {/* Exit Points */}
        <motion.div
          className="p-5 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ArrowDownRight className="w-4 h-4 text-red-400" /> Exit Pages
          </h3>
          <div className="space-y-2">
            {(data.exit_pages || []).map(p => (
              <div key={p.page} className="flex items-center justify-between text-xs">
                <span className="font-mono text-foreground/80 truncate max-w-[65%]">{p.page}</span>
                <span className="font-mono text-red-400 font-medium">{p.exits}</span>
              </div>
            ))}
            {(!data.exit_pages || data.exit_pages.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">No data</p>
            )}
          </div>
        </motion.div>

        {/* Drop-off Danger Zones */}
        <motion.div
          className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Drop-off Zones
          </h3>
          <div className="space-y-2">
            {(data.drop_offs || []).slice(0, 8).map(p => (
              <div key={p.page} className="flex items-center justify-between text-xs">
                <span className="font-mono text-foreground/80 truncate max-w-[50%]">{p.page}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground">{p.views} views</span>
                  <span className={cn("font-mono font-medium",
                    p.drop_rate >= 60 ? 'text-red-400' :
                    p.drop_rate >= 40 ? 'text-amber-400' :
                    'text-green-400'
                  )}>
                    {p.drop_rate}%
                  </span>
                </div>
              </div>
            ))}
            {(!data.drop_offs || data.drop_offs.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">No data</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Page-to-Page Transitions */}
      <motion.div
        className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Route className="w-4 h-4 text-purple-400" /> Page-to-Page Flows
        </h3>
        <div className="space-y-2">
          {(data.transitions || []).slice(0, 20).map((t, idx) => {
            const pct = (t.count / maxTransition) * 100;
            return (
              <motion.div
                key={`${t.from}-${t.to}-${idx}`}
                className="rounded-lg border border-border/20 bg-muted/5 p-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono min-w-0">
                    <span className="text-foreground/80 truncate max-w-[140px]">{t.from}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-foreground/80 truncate max-w-[140px]">{t.to}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="font-mono text-muted-foreground">{t.sessions} sessions</span>
                    <span className="font-mono font-semibold text-foreground">{t.count}×</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500/60 to-blue-500/40"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, delay: idx * 0.03 }}
                  />
                </div>
              </motion.div>
            );
          })}
          {(!data.transitions || data.transitions.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-8">
              Not enough page transitions yet. Data appears as visitors navigate across multiple pages.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FEATURE ADOPTION
// ═══════════════════════════════════════════════════════════════

function FeaturesView({ data }: { data: FeatureAdoption | null }) {
  if (!data) return <EmptyState icon={Flame} message="No feature adoption data yet" />;

  const maxUses = data.features?.[0]?.total_uses || 1;

  const categoryColors: Record<string, string> = {
    navigation: 'from-blue-500 to-blue-600',
    conversion: 'from-green-500 to-green-600',
    engagement: 'from-violet-500 to-violet-600',
    scan: 'from-cyan-500 to-cyan-600',
    auth: 'from-amber-500 to-amber-600',
    error: 'from-red-500 to-red-600',
  };

  return (
    <div className="space-y-6">
      {/* Category Summary */}
      {data.category_totals && data.category_totals.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {data.category_totals.map((c, idx) => (
            <motion.div
              key={c.category}
              className="p-4 rounded-xl border border-border/30 bg-card/50"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <span className="text-[10px] text-muted-foreground font-mono uppercase">{c.category}</span>
              <p className="text-xl font-bold font-mono text-foreground mt-1">{fmt(c.count)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Feature List */}
      <motion.div
        className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-cyan-400" /> Feature Adoption (30d)
        </h3>
        <div className="space-y-3">
          {(data.features || []).map((f, idx) => {
            const pct = (f.total_uses / maxUses) * 100;
            const gradient = categoryColors[f.category] || 'from-gray-500 to-gray-600';
            const trending = f.trend_prev_7d > 0
              ? ((f.trend_7d - f.trend_prev_7d) / f.trend_prev_7d * 100)
              : 0;

            return (
              <motion.div
                key={f.feature}
                className="rounded-xl border border-border/20 bg-muted/5 p-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground font-mono truncate">{f.feature}</span>
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">{f.category}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className="text-muted-foreground hidden sm:inline">{f.unique_users} users</span>
                    <span className="text-muted-foreground hidden sm:inline">{f.avg_per_user}/user</span>
                    <div className="flex items-center gap-1">
                      {trendIcon(f.trend_7d, f.trend_prev_7d)}
                      <span className={cn("font-mono text-[10px]",
                        trending > 0 ? 'text-green-400' : trending < 0 ? 'text-red-400' : 'text-muted-foreground'
                      )}>
                        {trendPct(f.trend_7d, f.trend_prev_7d)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-foreground">{fmt(f.total_uses)}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted/20 overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", gradient)}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.03 }}
                  />
                </div>
              </motion.div>
            );
          })}
          {(!data.features || data.features.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-8">No feature usage data yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXCLUSIONS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function ExclusionsView() {
  const [exclusions, setExclusions] = useState<ExcludedFingerprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newFp, setNewFp] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newReason, setNewReason] = useState<'owner' | 'bot'>('owner');
  const [myFingerprint, setMyFingerprint] = useState<string | null>(null);

  const fetchExclusions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analytics_excluded_fingerprints')
      .select('*')
      .order('created_at', { ascending: false });
    setExclusions((data as ExcludedFingerprint[]) || []);
    setLoading(false);
  }, []);

  // Detect current fingerprint from localStorage (set by site-tracker)
  useEffect(() => {
    const stored = localStorage.getItem('cmpsbl_fp');
    if (stored) setMyFingerprint(stored);
    fetchExclusions();
  }, [fetchExclusions]);

  const addExclusion = async (fingerprint: string, reason: string, label?: string) => {
    setAdding(true);
    const { error } = await supabase
      .from('analytics_excluded_fingerprints')
      .insert({ fingerprint, reason, label: label || null });
    if (error) {
      toast.error(error.code === '23505' ? 'Already excluded' : error.message);
    } else {
      toast.success('Fingerprint excluded from analytics');
      setNewFp('');
      setNewLabel('');
      await fetchExclusions();
    }
    setAdding(false);
  };

  const removeExclusion = async (id: string) => {
    await supabase.from('analytics_excluded_fingerprints').delete().eq('id', id);
    toast.success('Exclusion removed');
    fetchExclusions();
  };

  const excludeMyself = () => {
    if (myFingerprint) addExclusion(myFingerprint, 'owner', 'My device (auto-detected)');
  };

  const isMyFpExcluded = exclusions.some(e => e.fingerprint === myFingerprint);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldOff className="w-5 h-5 text-red-400" />
        <div>
          <h3 className="text-lg font-bold text-foreground">Exclusion Management</h3>
          <p className="text-xs text-muted-foreground">Remove yourself and bots from analytics — only track real humans.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Exclude Myself */}
        <motion.div
          className={cn(
            "p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl",
            CARD_STYLES.red.border, CARD_STYLES.red.bg
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", CARD_STYLES.red.iconBg)}>
              <UserX className={cn("w-4 h-4", CARD_STYLES.red.iconColor)} />
            </div>
            <span className="text-sm font-semibold text-foreground">Exclude Myself</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Remove your own visits from all analytics data. Uses your current device fingerprint.
          </p>
          {myFingerprint ? (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground/60 truncate">
                FP: {myFingerprint.slice(0, 16)}…
              </p>
              {isMyFpExcluded ? (
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/40">
                  <CheckCircle className="w-3 h-3 mr-1" /> Already excluded
                </Badge>
              ) : (
                <Button size="sm" variant="destructive" onClick={excludeMyself} disabled={adding}>
                  {adding ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                  Exclude my fingerprint
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">No fingerprint detected yet</p>
          )}
        </motion.div>

        {/* Add Custom Exclusion */}
        <motion.div
          className={cn(
            "p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl",
            CARD_STYLES.amber.border, CARD_STYLES.amber.bg
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", CARD_STYLES.amber.iconBg)}>
              <Bot className={cn("w-4 h-4", CARD_STYLES.amber.iconColor)} />
            </div>
            <span className="text-sm font-semibold text-foreground">Add Exclusion</span>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Fingerprint hash"
              value={newFp}
              onChange={e => setNewFp(e.target.value)}
              className="h-8 text-xs font-mono bg-background/50"
            />
            <Input
              placeholder="Label (optional)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="h-8 text-xs bg-background/50"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={newReason === 'owner' ? 'default' : 'outline'}
                onClick={() => setNewReason('owner')}
                className="text-[10px] h-7"
              >
                <UserX className="w-3 h-3 mr-1" /> Owner
              </Button>
              <Button
                size="sm"
                variant={newReason === 'bot' ? 'default' : 'outline'}
                onClick={() => setNewReason('bot')}
                className="text-[10px] h-7"
              >
                <Bot className="w-3 h-3 mr-1" /> Bot
              </Button>
            </div>
            <Button
              size="sm"
              onClick={() => addExclusion(newFp, newReason, newLabel)}
              disabled={!newFp.trim() || adding}
              className="w-full"
            >
              {adding ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
              Add Exclusion
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Exclusions List */}
      <motion.div
        className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShieldOff className="w-4 h-4 text-muted-foreground" /> Excluded Fingerprints
            <Badge variant="outline" className="font-mono text-[9px]">{exclusions.length}</Badge>
          </h3>
          <Button variant="ghost" size="sm" onClick={fetchExclusions} className="h-7">
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : exclusions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldOff className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No exclusions configured</p>
            <p className="text-[10px] mt-1">All fingerprints are being tracked</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exclusions.map((ex) => (
              <motion.div
                key={ex.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-muted/5 hover:bg-muted/10 transition-all"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {ex.reason === 'bot' ? (
                    <Bot className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <UserX className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-foreground truncate max-w-[140px] sm:max-w-[200px]">
                        {ex.fingerprint.slice(0, 20)}…
                      </span>
                      <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                        {ex.reason}
                      </Badge>
                      {ex.fingerprint === myFingerprint && (
                        <Badge className="bg-primary/20 text-primary border border-primary/40 text-[9px]">you</Badge>
                      )}
                    </div>
                    {ex.label && <p className="text-[10px] text-muted-foreground truncate">{ex.label}</p>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                  onClick={() => removeExclusion(ex.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Info */}
      <div className="text-[10px] text-muted-foreground/50 font-mono text-center">
        Excluded fingerprints are filtered from all analytics queries. Changes take effect on next data refresh.
      </div>
    </div>
  );
}
