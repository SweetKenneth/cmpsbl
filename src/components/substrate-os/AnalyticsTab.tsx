/**
 * Analytics Tab — Substrate Telemetry + Human Traffic Intelligence
 * Single source of truth for all system metrics AND real visitor analytics.
 * No third-party analytics. Bots excluded. Owner excluded.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Activity, Cpu, Database, RefreshCw, Zap, Brain, Shield, Network, Users,
  ExternalLink, MessageSquare, Bot, Package, Layers, TrendingUp, DollarSign, FileText,
  Gauge, Radio, GitBranch,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { SiteAnalyticsSection } from './SiteAnalyticsSection';
import { UserBehaviorSection } from './UserBehaviorSection';
import { DevMetricsSection } from './DevMetricsSection';

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
  // Immune telemetry
  immuneRuns: number;
  immuneRepairs: number;
  immuneEscalations: number;
  immuneSafeFailures: number;
  immuneRepairRate: number;
  // ENCODE resolution telemetry
  encodeClaimed: number;
  encodeResolved: number;
  encodeResolutionRate: number;
  // v2: Mesh Comms
  meshCommsTotal: number;
  meshCategories: { category: string; count: number }[];
  meshTopRoutes: { route: string; count: number }[];
  // v2: Agency telemetry
  agencyTasksCompleted: number;
  agencyTasksFailed: number;
  agencyTasksPending: number;
  agencySuccessRate: number;
  agencyCostCents: number;
  agencyValueCents: number;
  agencyROI: number;
  // v2: Auto-blog pipeline
  autoblogPublished: number;
  autoblogDraft: number;
  autoblogAvgConfidence: number;
  // v2: Foundry / Discovery
  foundryArtifacts: number;
  foundryCategories: { category: string; count: number }[];
  // v2: Cost analytics
  totalCostCents: number;
  totalTokensUsed: number;
  avgCostPerCall: number;
  providerBreakdown: { provider: string; count: number; tokens: number }[];
  // v2: Intent receipts
  intentTotal: number;
  intentAvgLatency: number;
}

export function AnalyticsTab() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [activeSection, setActiveSection] = useState<'traffic' | 'substrate' | 'behavior' | 'devs'>('traffic');
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set(['core', 'immune']));

  const togglePanel = (id: string) => {
    setExpandedPanels(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

      const [
        brainEventsCountRes, brainEventsRes, brainMetricsCountRes,
        usageCountRes, usageRes,
        accessCountRes, auditCountRes, auditRes,
        immuneRes, escalationsRes,
        meshCountRes, meshCatRes,
        agencyTasksRes, agencyEconRes,
        autoblogRes,
        artifactRes,
        usageFullRes,
        intentCountRes, intentLatencyRes,
      ] = await Promise.all([
        supabase.from('brain_events').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
        supabase.from('brain_events').select('id, event_type, module, outcome, created_at').gte('created_at', startDate).order('created_at', { ascending: false }).limit(1000),
        supabase.from('brain_metrics').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
        supabase.from('ai_usage_log').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
        supabase.from('ai_usage_log').select('id, provider, category, success, created_at, tokens_used, cost').gte('created_at', startDate).limit(1000),
        supabase.from('access_usage').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
        supabase.from('audit_logs').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
        supabase.from('audit_logs').select('id, action, entity_type, created_at').gte('created_at', startDate).limit(500),
        supabase.from('immune_metrics').select('executor, total_runs, repair_successes, escalations, safe_failures').gte('run_at', sixHoursAgo),
        supabase.from('immune_escalations').select('status, claimed_by').limit(1000),
        // Mesh comms
        supabase.from('mesh_comms').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
        supabase.from('mesh_comms').select('category, source_module, target_module').gte('created_at', startDate).limit(1000),
        // Agency tasks
        supabase.from('agency_tasks').select('status, task_cost_cents, task_value_cents, compute_time_ms, created_at').gte('created_at', startDate).limit(1000),
        // Agency economics
        supabase.from('agency_economics').select('total_cost_cents, total_value_cents, tasks_completed, avg_roi').order('period_date', { ascending: false }).limit(days),
        // Auto-blog
        supabase.from('auto_blog_posts').select('status, confidence_score, created_at').gte('created_at', startDate),
        // Artifacts
        supabase.from('artifact_registry').select('category, tier, created_at').gte('created_at', startDate),
        // Full usage for cost analytics
        supabase.from('ai_usage_log').select('provider, tokens_used, cost').gte('created_at', startDate).limit(1000),
        // Intent receipts — table may not exist in typed schema, use rpc or skip gracefully
        supabase.from('mesh_comms').select('*', { count: 'exact', head: true }).eq('category', 'processing').gte('created_at', startDate),
        supabase.from('mesh_comms').select('resolver_id, created_at').gte('created_at', startDate).not('resolver_id', 'is', null).limit(500),
      ]);

      // Core counts
      const brainEventsCount = brainEventsCountRes.count ?? 0;
      const brainMetricsCount = brainMetricsCountRes.count ?? 0;
      const usageCount = usageCountRes.count ?? 0;
      const accessCount = accessCountRes.count ?? 0;
      const auditCount = auditCountRes.count ?? 0;

      const brainEvents = brainEventsRes.data || [];
      const usage = usageRes.data || [];
      const audit = auditRes.data || [];
      const immuneRows = (immuneRes.data || []) as any[];
      const escalationRows = (escalationsRes.data || []) as any[];

      // Time series
      const dayCounts = new Map<string, number>();
      [...brainEvents.map(e => e.created_at), ...usage.map(u => u.created_at), ...audit.map(a => a.created_at)]
        .filter(Boolean)
        .forEach(ts => {
          const day = ts!.split('T')[0];
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        });

      const totalOps = brainEventsCount + brainMetricsCount + usageCount + accessCount + auditCount;

      const series: { date: string; ops: number }[] = [];
      const displayDays = Math.min(days, 30);
      for (let i = displayDays - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        series.push({ date: dateStr, ops: dayCounts.get(dateStr) || 0 });
      }

      // Top modules
      const moduleCounts = new Map<string, number>();
      brainEvents.forEach(e => { const m = e.module || 'unknown'; moduleCounts.set(m, (moduleCounts.get(m) || 0) + 1); });
      const topModules = Array.from(moduleCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([module, count]) => ({ module, count }));

      // Event breakdown
      const typeCounts = new Map<string, number>();
      brainEvents.forEach(e => { const t = e.event_type || 'unknown'; typeCounts.set(t, (typeCounts.get(t) || 0) + 1); });
      const eventBreakdown = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([type, count]) => ({ type, count }));

      // Success rate
      const successCount = usage.filter(u => u.success === true).length;
      const successRate = usage.length > 0 ? Math.round((successCount / usage.length) * 1000) / 10 : 100;

      // Immune
      let immuneRuns = 0, immuneRepairs = 0, immuneEscalations = 0, immuneSafeFailures = 0;
      for (const row of immuneRows) {
        immuneRuns += row.total_runs ?? 0;
        immuneRepairs += row.repair_successes ?? 0;
        immuneEscalations += row.escalations ?? 0;
        immuneSafeFailures += row.safe_failures ?? 0;
      }
      const repairDenom = immuneRepairs + immuneEscalations + immuneSafeFailures;
      const immuneRepairRate = repairDenom > 0 ? Math.round((immuneRepairs / repairDenom) * 1000) / 10 : 0;

      // ENCODE
      const encodeClaimed = escalationRows.filter((d: any) => d.claimed_by === 'ENCODE').length;
      const encodeResolved = escalationRows.filter((d: any) => d.claimed_by === 'ENCODE' && d.status === 'resolved').length;
      const encodeResolutionRate = encodeClaimed > 0 ? Math.round((encodeResolved / encodeClaimed) * 1000) / 10 : 0;

      // ─── MESH COMMS ───
      const meshCommsTotal = meshCountRes.count ?? 0;
      const meshCatData = (meshCatRes.data || []) as any[];
      const catMap = new Map<string, number>();
      const routeMap = new Map<string, number>();
      meshCatData.forEach((m: any) => {
        catMap.set(m.category || 'unknown', (catMap.get(m.category || 'unknown') || 0) + 1);
        const route = `${m.source_module}→${m.target_module}`;
        routeMap.set(route, (routeMap.get(route) || 0) + 1);
      });
      const meshCategories = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([category, count]) => ({ category, count }));
      const meshTopRoutes = Array.from(routeMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([route, count]) => ({ route, count }));

      // ─── AGENCY ───
      const agencyTasks = (agencyTasksRes.data || []) as any[];
      const agencyTasksCompleted = agencyTasks.filter(t => t.status === 'completed').length;
      const agencyTasksFailed = agencyTasks.filter(t => t.status === 'failed').length;
      const agencyTasksPending = agencyTasks.filter(t => !['completed', 'failed'].includes(t.status)).length;
      const agencySuccessRate = (agencyTasksCompleted + agencyTasksFailed) > 0
        ? Math.round((agencyTasksCompleted / (agencyTasksCompleted + agencyTasksFailed)) * 1000) / 10 : 0;
      const econRows = (agencyEconRes.data || []) as any[];
      const agencyCostCents = econRows.reduce((s: number, r: any) => s + (r.total_cost_cents || 0), 0);
      const agencyValueCents = econRows.reduce((s: number, r: any) => s + (r.total_value_cents || 0), 0);
      const agencyROI = agencyCostCents > 0 ? Math.round((agencyValueCents / agencyCostCents) * 100) / 100 : 0;

      // ─── AUTO-BLOG ───
      const blogRows = (autoblogRes.data || []) as any[];
      const autoblogPublished = blogRows.filter(b => b.status === 'published').length;
      const autoblogDraft = blogRows.filter(b => b.status === 'draft').length;
      const confScores = blogRows.filter(b => b.confidence_score != null).map(b => b.confidence_score as number);
      const autoblogAvgConfidence = confScores.length > 0 ? Math.round((confScores.reduce((s, v) => s + v, 0) / confScores.length) * 100) / 100 : 0;

      // ─── FOUNDRY ───
      const artRows = (artifactRes.data || []) as any[];
      const foundryArtifacts = artRows.length;
      const artCatMap = new Map<string, number>();
      artRows.forEach(a => artCatMap.set(a.category || 'unknown', (artCatMap.get(a.category || 'unknown') || 0) + 1));
      const foundryCategories = Array.from(artCatMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([category, count]) => ({ category, count }));

      // ─── COST ANALYTICS ───
      const usageFull = (usageFullRes.data || []) as any[];
      const totalCostCents = Math.round(usageFull.reduce((s, u) => s + (u.cost || 0), 0) * 100);
      const totalTokensUsed = usageFull.reduce((s, u) => s + (u.tokens_used || 0), 0);
      const avgCostPerCall = usageFull.length > 0 ? Math.round((totalCostCents / usageFull.length)) : 0;
      const provMap = new Map<string, { count: number; tokens: number }>();
      usageFull.forEach(u => {
        const p = u.provider || 'unknown';
        const cur = provMap.get(p) || { count: 0, tokens: 0 };
        cur.count++;
        cur.tokens += u.tokens_used || 0;
        provMap.set(p, cur);
      });
      const providerBreakdown = Array.from(provMap.entries()).sort((a, b) => b[1].count - a[1].count).map(([provider, d]) => ({ provider, count: d.count, tokens: d.tokens }));

      // ─── INTENT APPROXIMATION (from mesh_comms processing signals) ───
      const intentTotal = intentCountRes.count ?? 0;
      const resolverRows = (intentLatencyRes.data || []) as any[];
      // Approximate latency from timestamp deltas isn't possible, so use count-only
      const intentAvgLatency = 0; // No direct latency column; shown as "N/A" in UI

      setData({
        brainEvents: brainEventsCount, brainMetrics: brainMetricsCount,
        apiCalls: usageCount, accessOps: accessCount, auditActions: auditCount,
        totalOps, series, topModules, eventBreakdown, successRate,
        immuneRuns, immuneRepairs, immuneEscalations, immuneSafeFailures, immuneRepairRate,
        encodeClaimed, encodeResolved, encodeResolutionRate,
        meshCommsTotal, meshCategories, meshTopRoutes,
        agencyTasksCompleted, agencyTasksFailed, agencyTasksPending, agencySuccessRate, agencyCostCents, agencyValueCents, agencyROI,
        autoblogPublished, autoblogDraft, autoblogAvgConfidence,
        foundryArtifacts, foundryCategories,
        totalCostCents, totalTokensUsed, avgCostPerCall, providerBreakdown,
        intentTotal, intentAvgLatency,
      });
    } catch (error) {
      console.error('Telemetry fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchTelemetry(); }, [fetchTelemetry]);

  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const fmtCost = (cents: number) => {
    if (cents >= 100) return `$${(cents / 100).toFixed(2)}`;
    return `${cents}¢`;
  };

  const CollapsibleSection = ({ id, title, icon: Icon, iconColor, children }: { id: string; title: string; icon: any; iconColor: string; children: React.ReactNode }) => (
    <motion.div
      className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={() => togglePanel(id)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", `bg-${iconColor}/20 border-${iconColor}/40`)}>
            <Icon className={cn("w-4 h-4", `text-${iconColor}`)} />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <ChevronIcon expanded={expandedPanels.has(id)} />
      </button>
      {expandedPanels.has(id) && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </motion.div>
  );

  const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
    <svg className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
  );

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-7xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Section Toggle + Deep Dive Link */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 p-1 rounded-xl bg-muted/30 border border-border/30 w-fit flex-wrap">
          {([
            { key: 'traffic' as const, icon: Users, label: 'Site Traffic', color: 'green' },
            { key: 'substrate' as const, icon: BarChart3, label: 'Substrate', color: 'cyan' },
            { key: 'behavior' as const, icon: Users, label: 'Behavior', color: 'violet' },
            { key: 'devs' as const, icon: Network, label: 'Dev Metrics', color: 'orange' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeSection === tab.key
                  ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/40`
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" /> <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <a
          href="/admin/analytics"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Deep Dive
        </a>
      </div>

      {activeSection === 'traffic' ? (
        <SiteAnalyticsSection />
      ) : activeSection === 'behavior' ? (
        <UserBehaviorSection />
      ) : activeSection === 'devs' ? (
        <DevMetricsSection />
      ) : (
        <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-neon-blue/20 border border-primary/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Substrate Telemetry</h2>
            <p className="text-xs text-muted-foreground font-mono">SINGLE SOURCE OF TRUTH • REAL OPS</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button key={range} onClick={() => setDateRange(range)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", dateRange === range ? "bg-primary/20 text-primary border border-primary/40" : "text-muted-foreground hover:text-foreground")}>
                {range}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchTelemetry} className="gap-1.5 h-8">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            <span className="text-xs hidden sm:inline">Refresh</span>
          </Button>
          {data && !loading && (
            <span className="text-[9px] text-muted-foreground/50 font-mono hidden sm:inline">
              Updated {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : data ? (
        <>
          {/* ═══ PRIMARY METRICS GRID ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Ops', value: fmt(data.totalOps), sub: `${dateRange} window`, icon: Activity, iconColor: 'primary', border: 'border-primary/30', bg: 'from-primary/10 to-primary/5', iconBg: 'bg-primary/20 border-primary/40' },
              { label: 'Brain Events', value: fmt(data.brainEvents), sub: `${fmt(data.brainMetrics)} metrics`, icon: Brain, iconColor: 'neon-purple', border: 'border-neon-purple/30', bg: 'from-neon-purple/10 to-neon-purple/5', iconBg: 'bg-neon-purple/20 border-neon-purple/40' },
              { label: 'API Calls', value: fmt(data.apiCalls), sub: `${data.successRate}% success`, icon: Zap, iconColor: 'neon-green', border: 'border-neon-green/30', bg: 'from-neon-green/10 to-neon-green/5', iconBg: 'bg-neon-green/20 border-neon-green/40' },
              { label: 'Mesh Comms', value: fmt(data.meshCommsTotal), sub: `${data.meshCategories.length} categories`, icon: Radio, iconColor: 'neon-magenta', border: 'border-neon-magenta/30', bg: 'from-neon-magenta/10 to-neon-magenta/5', iconBg: 'bg-neon-magenta/20 border-neon-magenta/40' },
              { label: 'Processing Signals', value: fmt(data.intentTotal), sub: 'Mesh processing events', icon: GitBranch, iconColor: 'neon-cyan', border: 'border-neon-cyan/30', bg: 'from-neon-cyan/10 to-neon-cyan/5', iconBg: 'bg-neon-cyan/20 border-neon-cyan/40' },
              { label: 'Access Ops', value: fmt(data.accessOps), sub: `${fmt(data.auditActions)} audited`, icon: Shield, iconColor: 'neon-amber', border: 'border-neon-amber/30', bg: 'from-neon-amber/10 to-neon-amber/5', iconBg: 'bg-neon-amber/20 border-neon-amber/40' },
              { label: 'Tokens Used', value: fmt(data.totalTokensUsed), sub: fmtCost(data.totalCostCents) + ' total cost', icon: DollarSign, iconColor: 'neon-green', border: 'border-neon-green/30', bg: 'from-neon-green/10 to-neon-green/5', iconBg: 'bg-neon-green/20 border-neon-green/40' },
              { label: 'Discoveries', value: fmt(data.foundryArtifacts), sub: `${data.foundryCategories.length} categories`, icon: Package, iconColor: 'neon-amber', border: 'border-neon-amber/30', bg: 'from-neon-amber/10 to-neon-amber/5', iconBg: 'bg-neon-amber/20 border-neon-amber/40' },
            ].map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <motion.div key={card.label} className={cn("p-5 rounded-2xl border bg-gradient-to-br backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm", card.border, card.bg)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", card.iconBg)}>
                      <CardIcon className={cn("w-4 h-4", `text-${card.iconColor}`)} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold font-mono tabular-nums text-foreground">{card.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
                </motion.div>
              );
            })}
          </div>

          {/* ═══ OPS OVER TIME ═══ */}
          <motion.div className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Operations Over Time</h3>
              <Badge variant="outline" className="text-[9px] font-mono border-primary/30 text-primary bg-primary/10">{dateRange.toUpperCase()}</Badge>
            </div>
            <div className="flex items-end gap-1 h-32">
              {data.series.slice(dateRange === '7d' ? -7 : -30).map((day, idx) => {
                const maxVal = Math.max(...data.series.map(d => d.ops), 1);
                const height = (day.ops / maxVal) * 100;
                return (
                  <motion.div key={day.date} className="flex-1 group relative" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3 + idx * 0.02 }} style={{ transformOrigin: 'bottom' }}>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary/30 hover:from-primary/80 hover:to-primary/50 transition-all cursor-pointer" style={{ height: `${Math.max(height, 4)}%` }} />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                      <div className="bg-background border border-border/60 rounded-md px-2 py-1 text-[9px] font-mono whitespace-nowrap shadow-lg">{day.ops} ops • {day.date.slice(5)}</div>
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

          {/* ═══ IMMUNE & ENCODE ═══ */}
          <CollapsibleSection id="immune" title="Immune System & ENCODE" icon={Shield} iconColor="destructive">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricMini label="Immune Runs" value={fmt(data.immuneRuns)} sub="Last 6h probes" color="red" />
              <MetricMini
                label="Repair Rate"
                value={`${data.immuneRepairRate}%`}
                sub={`${data.immuneRepairs} repaired / ${data.immuneEscalations} escalated`}
                color={data.immuneRepairRate >= 80 ? 'emerald' : data.immuneRepairRate >= 50 ? 'amber' : 'red'}
              />
              <MetricMini
                label="Escalations"
                value={String(data.immuneEscalations)}
                sub={`${data.immuneSafeFailures} safe failures`}
                color={data.immuneEscalations === 0 ? 'emerald' : 'orange'}
              />
              <MetricMini
                label="ENCODE Resolution"
                value={`${data.encodeResolved}/${data.encodeClaimed}`}
                sub={`${data.encodeResolutionRate}% resolution rate`}
                color="indigo"
              />
            </div>
          </CollapsibleSection>

          {/* ═══ MESH COMMS ═══ */}
          <CollapsibleSection id="mesh" title="Mesh Communications" icon={Radio} iconColor="pink-400">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Signal Categories</h4>
                <div className="space-y-2">
                  {data.meshCategories.length > 0 ? data.meshCategories.map((cat, idx) => {
                    const maxCount = data.meshCategories[0]?.count || 1;
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-foreground/80 capitalize">{cat.category}</span>
                          <span className="font-mono text-muted-foreground">{fmt(cat.count)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-neon-magenta/70 to-neon-purple/50" initial={{ width: 0 }} animate={{ width: `${(cat.count / maxCount) * 100}%` }} transition={{ delay: 0.2 + idx * 0.03 }} />
                        </div>
                      </div>
                    );
                  }) : <p className="text-xs text-muted-foreground text-center py-2">No mesh data in period</p>}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Top Routes</h4>
                <div className="space-y-2">
                  {data.meshTopRoutes.length > 0 ? data.meshTopRoutes.map(route => (
                    <div key={route.route} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-foreground/80">{route.route}</span>
                      <Badge variant="outline" className="text-[9px] font-mono">{fmt(route.count)}</Badge>
                    </div>
                  )) : <p className="text-xs text-muted-foreground text-center py-2">No routes in period</p>}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* ═══ AGENCY TELEMETRY ═══ */}
          <CollapsibleSection id="agency" title="Agency Operations" icon={Bot} iconColor="neon-blue">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricMini label="Tasks Completed" value={fmt(data.agencyTasksCompleted)} sub={`${data.agencyTasksFailed} failed`} color="blue" />
              <MetricMini label="Pending" value={fmt(data.agencyTasksPending)} sub="In queue" color="amber" />
              <MetricMini
                label="Success Rate"
                value={`${data.agencySuccessRate}%`}
                sub={`${data.agencyTasksCompleted + data.agencyTasksFailed} total`}
                color={data.agencySuccessRate >= 90 ? 'emerald' : data.agencySuccessRate >= 70 ? 'amber' : 'red'}
              />
              <MetricMini
                label="ROI"
                value={`${data.agencyROI}x`}
                sub={`${fmtCost(data.agencyCostCents)} cost / ${fmtCost(data.agencyValueCents)} value`}
                color={data.agencyROI >= 1 ? 'emerald' : 'red'}
              />
            </div>
          </CollapsibleSection>

          {/* ═══ AUTO-BLOG & FOUNDRY ═══ */}
          <CollapsibleSection id="content" title="Content Pipeline & Foundry" icon={FileText} iconColor="neon-purple">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricMini label="Published Posts" value={String(data.autoblogPublished)} sub={`${data.autoblogDraft} drafts`} color="violet" />
              <MetricMini label="Avg Confidence" value={`${(data.autoblogAvgConfidence * 100).toFixed(0)}%`} sub="Quality score" color={data.autoblogAvgConfidence >= 0.8 ? 'emerald' : 'amber'} />
              <MetricMini label="Artifacts" value={fmt(data.foundryArtifacts)} sub={`${data.foundryCategories.length} categories`} color="orange" />
            </div>
            {data.foundryCategories.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Artifact Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {data.foundryCategories.map(c => (
                    <Badge key={c.category} variant="outline" className="text-[10px] font-mono capitalize">{c.category} ({c.count})</Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* ═══ PROVIDER / COST BREAKDOWN ═══ */}
          <CollapsibleSection id="cost" title="Cost & Provider Analytics" icon={DollarSign} iconColor="neon-green">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <MetricMini label="Total Cost" value={fmtCost(data.totalCostCents)} sub={`${dateRange} window`} color="emerald" />
              <MetricMini label="Avg Cost/Call" value={`${data.avgCostPerCall}¢`} sub="Per invocation" color="emerald" />
              <MetricMini label="Total Tokens" value={fmt(data.totalTokensUsed)} sub={`${data.providerBreakdown.length} providers`} color="blue" />
            </div>
            {data.providerBreakdown.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Provider Breakdown</h4>
                <div className="space-y-2">
                  {data.providerBreakdown.map((p, idx) => {
                    const maxCount = data.providerBreakdown[0]?.count || 1;
                    return (
                      <div key={p.provider}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-foreground/80">{p.provider}</span>
                          <div className="flex gap-3">
                            <span className="font-mono text-muted-foreground">{fmt(p.tokens)} tok</span>
                            <span className="font-mono font-semibold text-foreground">{fmt(p.count)} calls</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-neon-green/70 to-neon-cyan/50" initial={{ width: 0 }} animate={{ width: `${(p.count / maxCount) * 100}%` }} transition={{ delay: 0.2 + idx * 0.03 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* ═══ BOTTOM GRID: MODULES + DATA SOURCES ═══ */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Network className="w-4 h-4 text-neon-purple" /> Active Modules
              </h3>
              <div className="space-y-2">
                {data.topModules.length > 0 ? data.topModules.map((mod, idx) => {
                  const maxCount = data.topModules[0]?.count || 1;
                  return (
                    <div key={mod.module}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-foreground/80 capitalize">{mod.module}</span>
                        <span className="font-mono text-muted-foreground">{fmt(mod.count)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-neon-purple/70 to-primary/50" initial={{ width: 0 }} animate={{ width: `${(mod.count / maxCount) * 100}%` }} transition={{ delay: 0.4 + idx * 0.03 }} />
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-muted-foreground text-center py-4">No module data in this period</p>}
              </div>
            </motion.div>

            <motion.div className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 to-transparent backdrop-blur-xl" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Data Sources
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Brain Events', count: data.brainEvents, icon: Brain, color: 'text-neon-purple' },
                  { label: 'Brain Metrics', count: data.brainMetrics, icon: Cpu, color: 'text-neon-blue' },
                  { label: 'AI Usage Log', count: data.apiCalls, icon: Zap, color: 'text-neon-green' },
                  { label: 'Access Usage', count: data.accessOps, icon: Shield, color: 'text-neon-amber' },
                  { label: 'Audit Log', count: data.auditActions, icon: Activity, color: 'text-destructive' },
                  { label: 'Mesh Comms', count: data.meshCommsTotal, icon: Radio, color: 'text-neon-magenta' },
                  { label: 'Intent Receipts', count: data.intentTotal, icon: GitBranch, color: 'text-neon-cyan' },
                ].map(src => {
                  const SrcIcon = src.icon;
                  const total = data.totalOps + data.meshCommsTotal + data.intentTotal;
                  const pct = total > 0 ? Math.round((src.count / total) * 100) : 0;
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

              {/* Rates */}
              <div className="mt-4 pt-4 border-t border-border/30 space-y-2">
                {[
                  { label: 'AI Call Success Rate', value: data.successRate, threshold: [95, 80] },
                  { label: 'Immune Repair Rate (6h)', value: data.immuneRepairRate, threshold: [80, 50] },
                  { label: 'ENCODE Resolution Rate', value: data.encodeResolutionRate, threshold: [80, 50] },
                  { label: 'Agency Success Rate', value: data.agencySuccessRate, threshold: [90, 70] },
                ].map(rate => (
                  <div key={rate.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{rate.label}</span>
                    <span className={cn(
                      "text-sm font-bold font-mono",
                      rate.value >= rate.threshold[0] ? "text-neon-green" :
                      rate.value >= rate.threshold[1] ? "text-neon-amber" : "text-destructive"
                    )}>
                      {rate.value}%
                    </span>
                  </div>
                ))}
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
        </>
      )}
    </motion.div>
  );
}

/** Small metric card used inside collapsible sections */
function MetricMini({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className={cn("p-4 rounded-xl border bg-gradient-to-br backdrop-blur-xl", `border-${color}-500/30 from-${color}-500/10 to-${color}-500/5`)}>
      <span className="text-[10px] text-muted-foreground font-mono uppercase">{label}</span>
      <p className={cn("text-xl font-bold font-mono tabular-nums mt-1", `text-${color}-400`)}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
