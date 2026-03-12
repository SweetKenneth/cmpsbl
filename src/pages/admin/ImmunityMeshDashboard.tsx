/**
 * Immunity Mesh Intelligence Dashboard — Premium Edition
 * Dedicated admin page with demo-ready aesthetics, sound effects,
 * and accurate metrics. Observability only — zero runtime changes.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { ShadowMeshToggle } from "@/components/admin/ShadowMeshToggle";
import { AutoTrainingToggle } from "@/components/admin/AutoTrainingToggle";
import { ShadowMeshAnalytics } from "@/components/admin/ShadowMeshAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Brain, Zap, Activity, RotateCcw, AlertTriangle, BarChart3, 
  Table2, BookOpen, Fingerprint, Radar, HeartPulse, Layers, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Minus,
  Hammer, GraduationCap, TrendingUp, Sparkles, Play, Search, ArrowUp, ArrowDown, Target,
  Rocket, Code2, FileCheck,
} from "lucide-react";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIntelligenceMetrics } from "@/hooks/admin/useIntelligenceMetrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubstrateVoice } from "@/components/substrate-os/audio";
import { motion, AnimatePresence } from "framer-motion";
import { getSharedRuleStats, getSharedRules, type SharedRule } from "@/immune/shared-rule-registry";
import { getSkillStats, type SkillRecord } from "@/lib/shadow/shadowBuild";
import { getPerformanceSummary, getPerformanceStats, type PerformanceEntry, type GapCategory, type ModernizerShadowReport } from "@/lib/shadow/modernizerShadow";
import { getSkillTier, getTierProgress, type SkillTierInfo } from "@/lib/substrate/skill-tiers";
import { verifyCode, type CodeVerificationResult } from "@/lib/substrate/code-verification";
import { promotionService } from "@/lib/evolution-mesh/promotion-service";
import { diffService } from "@/lib/evolution-mesh/diff-service";
import { snapshotService } from "@/lib/evolution-mesh/snapshot-service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

// ============================================================================
// HELPERS
// ============================================================================

function fmt(val: number | null | undefined, suffix = '%'): string {
  if (val === null || val === undefined) return '—';
  return `${(val * 100).toFixed(1)}${suffix}`;
}

function statusIcon(status?: 'good' | 'warn' | 'bad' | 'neutral') {
  switch (status) {
    case 'good': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'warn': return <Minus className="w-4 h-4 text-amber-500" />;
    case 'bad': return <XCircle className="w-4 h-4 text-red-500" />;
    default: return null;
  }
}

// ============================================================================
// PREMIUM METRIC CARD
// ============================================================================

function MetricCard({ 
  label, value, sub, status, icon: Icon, delay = 0 
}: { 
  label: string; value: string; sub?: string; 
  status?: 'good' | 'warn' | 'bad' | 'neutral';
  icon?: typeof Shield; delay?: number;
}) {
  const borderColor = status === 'good' 
    ? 'border-emerald-500/20 hover:border-emerald-500/40' 
    : status === 'warn' 
    ? 'border-amber-500/20 hover:border-amber-500/40' 
    : status === 'bad' 
    ? 'border-red-500/20 hover:border-red-500/40' 
    : 'border-border/50 hover:border-primary/30';
  
  const glowColor = status === 'good' 
    ? 'shadow-emerald-500/5' 
    : status === 'warn' 
    ? 'shadow-amber-500/5' 
    : status === 'bad' 
    ? 'shadow-red-500/5' 
    : 'shadow-primary/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4 }}
    >
      <Card className={`border ${borderColor} ${glowColor} shadow-lg transition-all duration-300 hover:shadow-xl group relative overflow-hidden`}>
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardContent className="pt-3 sm:pt-4 pb-3 px-3 sm:px-4 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
            </div>
            {statusIcon(status)}
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-1 font-mono">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// MRI HERO GAUGE
// ============================================================================

function MRIGauge({ score, status, factors }: { 
  score: number; status: string; 
  factors: Record<string, number>;
}) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color = status === 'ready' ? '#10b981' : status === 'caution' ? '#f59e0b' : '#ef4444';
  const bgColor = status === 'ready' ? 'from-emerald-500/10 to-emerald-500/5' 
    : status === 'caution' ? 'from-amber-500/10 to-amber-500/5' 
    : 'from-red-500/10 to-red-500/5';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`border-2 ${status === 'ready' ? 'border-emerald-500/30' : status === 'caution' ? 'border-amber-500/30' : 'border-red-500/30'} bg-gradient-to-br ${bgColor} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        
        <CardContent className="py-5 sm:py-8 px-4 sm:px-6 flex flex-col sm:flex-row items-center sm:justify-between gap-5 sm:gap-8">
          {/* Gauge */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" opacity="0.3" />
              <motion.circle
                cx="60" cy="60" r="45" fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span 
                className="text-3xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {score}
              </motion.span>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">MRI</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Fingerprint className="w-5 h-5" style={{ color }} />
              <div>
                <h3 className="font-semibold text-lg">Mutation Readiness</h3>
                <Badge 
                  className="mt-0.5 text-[10px] uppercase tracking-wider"
                  variant={status === 'ready' ? 'default' : status === 'caution' ? 'secondary' : 'destructive'}
                >
                  {status}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <FactorBar label="Domain Knowledge" value={factors.dkd} weight="35%" />
              <FactorBar label="Novelty Resistance" value={factors.fnrInverse} weight="20%" />
              <FactorBar label="Escalation Control" value={factors.escalationRateInverse} weight="20%" />
              <FactorBar label="Repair Accuracy" value={factors.repairSuccessRate} weight="20%" />
              <FactorBar label="Cascade Control" value={factors.cascadeRateInverse} weight="5%" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FactorBar({ label, value, weight }: { label: string; value: number; weight: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{pct}% <span className="text-muted-foreground/60">({weight})</span></span>
      </div>
      <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function ImmunityMeshDashboard() {
  const [viewMode, setViewMode] = useState<'baseline' | 'shadow' | 'all'>('all');
  const [windowHours, setWindowHours] = useState(24);
  const [analyticsKey, setAnalyticsKey] = useState(0);
  const [resetting, setResetting] = useState(false);
  const voice = useSubstrateVoice();
  const prevEventsRef = useRef(0);

  const isShadow = viewMode === 'all' ? null : viewMode === 'shadow';
  const { data, isLoading } = useIntelligenceMetrics(windowHours, isShadow);

  // Sound effect when new repairs happen
  useEffect(() => {
    if (!data) return;
    const currentRepairs = data.iil.repairedSuccess;
    if (prevEventsRef.current > 0 && currentRepairs > prevEventsRef.current) {
      const newRepairs = currentRepairs - prevEventsRef.current;
      voice.success(
        `${newRepairs} repair${newRepairs > 1 ? 's' : ''} completed`,
        `Immunity mesh auto-healed ${newRepairs} failure${newRepairs > 1 ? 's' : ''}`,
        'IMMUNE'
      );
    }
    prevEventsRef.current = currentRepairs;
  }, [data?.iil.repairedSuccess]);

  const handleReset = async () => {
    setResetting(true);
    try {
      const { error: e1 } = await supabase.from('immune_metrics').delete().neq('executor', '__never__') as any;
      const { error: e2 } = await supabase.from('immune_escalations').delete().neq('executor', '__never__') as any;
      const { error: e3 } = await supabase.from('immune_intelligence_events').delete().neq('executor_id', '__never__') as any;
      if (e1 || e2 || e3) throw new Error(e1?.message || e2?.message || e3?.message);
      voice.system('Telemetry reset to fresh state', 'Metrics and escalations cleared. Shared rules, skill data, and learnings preserved.', 'IMMUNE');
      setAnalyticsKey(k => k + 1);
      prevEventsRef.current = 0;
    } catch (err: any) {
      voice.error('Reset failed', err.message, 'IMMUNE');
    } finally {
      setResetting(false);
    }
  };

  // Computed metrics
  const escalationCount = data ? Object.values(data.iil.escalationsBySeverity).reduce((s, v) => s + v, 0) : 0;
  const escalationRate = data ? escalationCount / Math.max(1, data.iil.totalEvents) : null;
  const successCount = data ? data.totalEvents - data.iil.safeFails - data.iil.repairedSuccess - data.iil.repairFailures - escalationCount : 0;
  const successRate = data ? successCount / Math.max(1, data.totalEvents) : null;
  
  // Repair attempt rate = events with repair_type / total non-success events
  const totalWithRepairType = data ? data.iil.repairedSuccess + data.iil.repairFailures : 0;
  const totalFailureEvents = data ? data.iil.safeFails + data.iil.repairedSuccess + data.iil.repairFailures + escalationCount : 0;
  const repairAttemptRate = totalFailureEvents > 0 ? totalWithRepairType / totalFailureEvents : null;
  const repairSuccessRate = totalWithRepairType > 0 ? (data?.iil.repairedSuccess ?? 0) / totalWithRepairType : null;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1400px] px-3 sm:px-0">
      {/* ── HEADER ── */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Immunity Mesh</h1>
            <p className="text-sm text-muted-foreground">
              Intelligence metrics & readiness scoring
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="baseline">Baseline</SelectItem>
              <SelectItem value="shadow">Shadow</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(windowHours)} onValueChange={(v) => setWindowHours(Number(v))}>
            <SelectTrigger className="w-[90px] h-8 text-xs bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6h</SelectItem>
              <SelectItem value="24">24h</SelectItem>
              <SelectItem value="72">3d</SelectItem>
              <SelectItem value="168">7d</SelectItem>
            </SelectContent>
          </Select>
          <ActionButton icon={RotateCcw} variant="warning" loading={resetting} onClick={handleReset} className="h-8 text-xs">
            Reset
          </ActionButton>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-5">
        <TabsList className="w-full max-w-3xl bg-muted/50 p-1 flex overflow-x-auto gap-0.5 no-scrollbar">
          <TabsTrigger value="overview" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="build" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <Hammer className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">Shadow Build</span>
          </TabsTrigger>
          <TabsTrigger value="evolution" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <Target className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">Evolution</span>
          </TabsTrigger>
          <TabsTrigger value="encode-training" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">ENCODE</span>
          </TabsTrigger>
          <TabsTrigger value="verify" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <FileCheck className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">TSAC</span>
          </TabsTrigger>
          <TabsTrigger value="executors" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <Table2 className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">Executors</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">Rules</span>
          </TabsTrigger>
          <TabsTrigger value="promote" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <Rocket className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">Promote</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="text-xs gap-1 sm:gap-1.5 data-[state=active]:shadow-sm flex-shrink-0 px-2 sm:px-3">
            <Zap className="w-3.5 h-3.5 flex-shrink-0" /><span className="hidden sm:inline">Controls</span>
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════ OVERVIEW ══════════════════ */}
        <TabsContent value="overview" className="space-y-5">
          {/* MRI Hero */}
          {data?.mri && (
            <MRIGauge score={data.mri.score} status={data.mri.status} factors={data.mri.factors} />
          )}

          {/* Primary Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <MetricCard 
              label="Success Rate" 
              value={fmt(successRate)} 
              sub={`${successCount.toLocaleString()} / ${data?.totalEvents.toLocaleString() ?? 0}`}
              status={(successRate ?? 0) > 0.9 ? 'good' : (successRate ?? 0) > 0.7 ? 'warn' : 'bad'}
              icon={HeartPulse}
              delay={0}
            />
            <MetricCard 
              label="DKD" 
              value={fmt(data?.dkd.global)} 
              sub={`${data?.dkd.coveredFailures ?? 0} / ${data?.dkd.totalFailures ?? 0} covered`}
              status={(data?.dkd.global ?? 0) > 0.7 ? 'good' : 'warn'}
              icon={Layers}
              delay={1}
            />
            <MetricCard 
              label="FNR" 
              value={fmt(data?.fnr.global)} 
              sub={`${data?.fnr.novelSignatures ?? 0} novel sigs`}
              status={(data?.fnr.global ?? 1) < 0.3 ? 'good' : 'warn'}
              icon={Radar}
              delay={2}
            />
            <MetricCard 
              label="Repair Rate" 
              value={fmt(repairAttemptRate)} 
              sub={`${totalWithRepairType} attempts`}
              status={(repairAttemptRate ?? 0) < 0.02 ? 'good' : (repairAttemptRate ?? 0) < 0.05 ? 'warn' : 'bad'}
              icon={Zap}
              delay={3}
            />
            <MetricCard 
              label="Repair Success" 
              value={fmt(repairSuccessRate)} 
              sub={`${data?.iil.repairedSuccess ?? 0} / ${totalWithRepairType} fixed`}
              status={(repairSuccessRate ?? 0) > 0.85 ? 'good' : (repairSuccessRate ?? 0) > 0.6 ? 'warn' : 'bad'}
              icon={CheckCircle2}
              delay={4}
            />
            <MetricCard 
              label="Escalation" 
              value={fmt(escalationRate)} 
              sub={`${escalationCount} total`}
              status={(escalationRate ?? 0) < 0.01 ? 'good' : (escalationRate ?? 0) < 0.05 ? 'warn' : 'bad'}
              icon={AlertTriangle}
              delay={5}
            />
          </div>

          {/* IIL Summary */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Immunity Intervention Log
                  <Badge variant="outline" className="ml-2 text-[10px] font-mono">{windowHours}h window</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Computing metrics…</span>
                  </div>
                ) : !data ? (
                  <p className="text-sm text-muted-foreground py-4">No intelligence events recorded yet</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    <IILStat label="Total Events" value={data.iil.totalEvents} />
                    <IILStat label="Safe Fails" value={data.iil.safeFails} color="text-amber-500" />
                    <IILStat label="Repaired" value={data.iil.repairedSuccess} color="text-emerald-500" />
                    <IILStat label="Repair Failures" value={data.iil.repairFailures} color="text-red-400" />
                    <IILStat label="Preflight Blocks" value={data.iil.preflightBlocks} />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Escalations</p>
                      {Object.entries(data.iil.escalationsBySeverity).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(data.iil.escalationsBySeverity).map(([sev, count]) => (
                            <Badge key={sev} variant="destructive" className="text-[10px] font-mono">{sev}: {count}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-emerald-500">0</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Repair Skills & Learned Knowledge */}
          <RepairSkillsPanel />

          {/* Legacy Analytics */}
          <ShadowMeshAnalytics key={analyticsKey} />
        </TabsContent>

        {/* ══════════════════ SHADOW BUILD ══════════════════ */}
        <TabsContent value="build" className="space-y-5">
          <ShadowBuildPanel />
        </TabsContent>

        {/* ══════════════════ EVOLUTION SHADOW ══════════════════ */}
        <TabsContent value="evolution" className="space-y-5">
          <ModernizerShadowPanel />
        </TabsContent>

        {/* ══════════════════ ENCODE TRAINING ══════════════════ */}
        <TabsContent value="encode-training" className="space-y-5">
          <EncodeTrainingPanel />
        </TabsContent>

        {/* ══════════════════ TSAC VERIFICATION ══════════════════ */}
        <TabsContent value="verify" className="space-y-5">
          <TSACVerificationPanel />
        </TabsContent>

        {/* ══════════════════ EXECUTORS ══════════════════ */}
        <TabsContent value="executors" className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-primary" />
                  Executor Intelligence Matrix
                </CardTitle>
                <CardDescription>Per-executor DKD & FNR for {windowHours}h window — {viewMode} mode</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 py-8 justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading executor data…</span>
                  </div>
                ) : !data ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-border/30">
                          <th className="text-left py-2.5 px-2 sm:px-3 text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider">Executor</th>
                          <th className="text-right py-2.5 px-2 sm:px-3 text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider">DKD</th>
                          <th className="text-right py-2.5 px-2 sm:px-3 text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider">FNR</th>
                          <th className="text-right py-2.5 px-2 sm:px-3 text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys({ ...data.dkd.perExecutor, ...data.fnr.perExecutor }).sort().map((eid, i) => {
                          const dkd = data.dkd.perExecutor[eid] ?? 0;
                          const fnr = data.fnr.perExecutor[eid] ?? 0;
                          const healthy = dkd > 0.5 && fnr < 0.5;
                          return (
                            <motion.tr 
                              key={eid} 
                              className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                            >
                              <td className="py-2 px-2 sm:px-3 font-mono text-[10px] sm:text-xs break-all">{eid}</td>
                              <td className="py-2 px-2 sm:px-3 text-right font-mono text-xs">
                                <span className={dkd > 0.7 ? 'text-emerald-500' : dkd > 0.4 ? 'text-amber-500' : 'text-red-400'}>
                                  {fmt(dkd)}
                                </span>
                              </td>
                              <td className="py-2 px-2 sm:px-3 text-right font-mono text-xs">
                                <span className={fnr < 0.3 ? 'text-emerald-500' : fnr < 0.6 ? 'text-amber-500' : 'text-red-400'}>
                                  {fmt(fnr)}
                                </span>
                              </td>
                              <td className="py-2 px-2 sm:px-3 text-right hidden sm:table-cell">
                                {healthy 
                                  ? <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Healthy</Badge>
                                  : <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">Watch</Badge>
                                }
                              </td>
                            </motion.tr>
                          );
                        })}
                        {Object.keys({ ...data.dkd.perExecutor, ...data.fnr.perExecutor }).length === 0 && (
                          <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                            No executor data yet — run shadow probes to populate
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ══════════════════ RULES ══════════════════ */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Dominant Rules
                    <Badge variant="outline" className="text-[10px]">Top 5</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!data?.rmi.dominantRules.length ? (
                    <p className="text-sm text-muted-foreground py-4">No rule data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {data.rmi.dominantRules.map((r, i) => (
                        <motion.div 
                          key={r.ruleId} 
                          className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-primary/20 transition-colors bg-card"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <code className="text-xs font-mono truncate max-w-[120px] sm:max-w-[180px]">{r.ruleId}</code>
                          <div className="flex items-center gap-2 text-xs flex-shrink-0">
                            <span className="text-muted-foreground">{r.invocations}</span>
                            <Badge variant={r.successRate >= 0.8 ? 'default' : 'secondary'}>
                              {(r.successRate * 100).toFixed(0)}%
                            </Badge>
                            <span className="text-muted-foreground font-mono">{r.executorCount}×</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Risky Rules
                  </CardTitle>
                  <CardDescription>Success &lt;60% with ≥20 invocations</CardDescription>
                </CardHeader>
                <CardContent>
                  {!data?.rmi.riskyRules.length ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      No risky rules — all rules healthy
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.rmi.riskyRules.map((r, i) => (
                        <div key={r.ruleId} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                          <code className="text-xs font-mono truncate max-w-[120px] sm:max-w-[180px]">{r.ruleId}</code>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">{r.invocations}</span>
                            <Badge variant="destructive">{(r.successRate * 100).toFixed(0)}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CKP */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Cross-Executor Knowledge Propagation
                </CardTitle>
                <CardDescription>
                  Average rule breadth: <strong>{data?.ckp.globalAvg?.toFixed(1) ?? '—'}</strong> executors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!data?.ckp.topPropagated.length ? (
                  <p className="text-sm text-muted-foreground">No propagation data</p>
                ) : (
                  <div className="space-y-2">
                    {data.ckp.topPropagated.map(r => (
                      <div key={r.ruleId} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card">
                        <code className="text-xs font-mono truncate max-w-[120px] sm:max-w-[200px]">{r.ruleId}</code>
                        <Badge variant="secondary" className="font-mono">{r.executorCount} executors</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ══════════════════ PROMOTE TO PRODUCTION ══════════════════ */}
        <TabsContent value="promote" className="space-y-4">
          <PromoteToProductionPanel />
        </TabsContent>

        {/* ══════════════════ CONTROLS ══════════════════ */}
        <TabsContent value="controls" className="space-y-4">
          <ShadowMeshToggle />
          <AutoTrainingToggle />
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Operational Guarantees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: '○', text: 'OFF → zero overhead, identical to production behavior' },
                { icon: '●', text: 'ON → immunity mesh + shadow probe training for all registered executors' },
                { icon: '◎', text: 'Dynamic discovery — new executors probed automatically on registration' },
                { icon: '◌', text: 'No intent mesh impact • No public exposure • No silent failure paths' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="text-primary font-mono mt-0.5">{item.icon}</span>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// REPAIR SKILLS PANEL
// ============================================================================

function RepairSkillsPanel() {
  const [stats, setStats] = useState<ReturnType<typeof getSharedRuleStats> | null>(null);
  const [rules, setRules] = useState<SharedRule[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setStats(getSharedRuleStats());
    setRules(getSharedRules());
    const interval = setInterval(() => {
      setStats(getSharedRuleStats());
      setRules(getSharedRules());
    }, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const displayedRules = showAll ? rules : rules.slice(0, 8);
  const totalAdoptedExecutors = rules.reduce((sum, r) => {
    const adopted = Array.from(r.adoptions.values()).filter(a => a.adopted && !a.rolledBack);
    return sum + adopted.length;
  }, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Repair Skills & Learned Knowledge
              <Badge variant="outline" className="text-[10px] font-mono ml-1">
                {stats.activeRules} active
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground flex-wrap">
              <Badge variant="secondary" className="text-[10px]">
                {totalAdoptedExecutors} adoptions
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {(stats.avgConfidence * 100).toFixed(0)}% avg conf
              </Badge>
              {stats.rollbackRate > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  {(stats.rollbackRate * 100).toFixed(1)}% rollback
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Learned repair strategies propagated across executors — the system's growing immune memory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-border/30 bg-card">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Rules</p>
              <p className="text-xl font-bold font-mono">{stats.totalRules}</p>
            </div>
            <div className="p-3 rounded-lg border border-border/30 bg-card">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Rules</p>
              <p className="text-xl font-bold font-mono text-emerald-500">{stats.activeRules}</p>
            </div>
            <div className="p-3 rounded-lg border border-border/30 bg-card">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Top Contributors</p>
              <div className="mt-1 space-y-0.5">
                {stats.topContributors.slice(0, 2).map(c => (
                  <p key={c.executor} className="text-[10px] font-mono truncate">
                    {c.executor} <span className="text-muted-foreground">({c.ruleCount})</span>
                  </p>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border/30 bg-card">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Category Spread</p>
              <p className="text-xl font-bold font-mono">{Object.keys(stats.categoryBreakdown).length}</p>
              <p className="text-[10px] text-muted-foreground">categories covered</p>
            </div>
          </div>

          {/* Skills list */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Learned Repair Strategies
            </p>
            <div className="grid gap-2">
              {displayedRules.map((rule, i) => {
                const adoptionCount = Array.from(rule.adoptions.values()).filter(a => a.adopted && !a.rolledBack).length;
                const totalSuccesses = Array.from(rule.adoptions.values()).reduce((s, a) => s + a.successes, 0);
                const totalFailures = Array.from(rule.adoptions.values()).reduce((s, a) => s + a.failures, 0);
                const overallSuccessRate = (totalSuccesses + totalFailures) > 0 
                  ? totalSuccesses / (totalSuccesses + totalFailures) : 1;
                const isSeed = rule.id.startsWith('SR_SEED_');
                
                return (
                  <motion.div
                    key={rule.id}
                    className="p-3 rounded-lg border border-border/20 hover:border-primary/20 transition-all bg-card group"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                          <code className="text-[11px] font-mono text-primary font-medium">
                            {rule.repairStrategy}
                          </code>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {rule.targetArchetype}
                          </Badge>
                          {isSeed && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                              seed
                            </Badge>
                          )}
                          {!isSeed && (
                            <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              learned
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                          {rule.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                          from: {rule.sourceExecutor}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                        <div className="text-left sm:text-right">
                          <p className="font-mono font-medium">{(rule.sourceConfidence * 100).toFixed(0)}%</p>
                          <p className="text-[9px] text-muted-foreground">confidence</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-mono font-medium">{adoptionCount}</p>
                          <p className="text-[9px] text-muted-foreground">executors</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className={`font-mono font-medium ${overallSuccessRate >= 0.8 ? 'text-emerald-500' : overallSuccessRate >= 0.5 ? 'text-amber-500' : 'text-red-400'}`}>
                            {(overallSuccessRate * 100).toFixed(0)}%
                          </p>
                          <p className="text-[9px] text-muted-foreground">success</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {rules.length > 8 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-primary hover:text-primary/80 font-medium mt-2 transition-colors"
              >
                {showAll ? 'Show less' : `Show all ${rules.length} rules →`}
              </button>
            )}
            {rules.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                No repair skills learned yet — run shadow probes to train the immunity mesh
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// SHADOW BUILD PANEL
// ============================================================================

function ShadowBuildPanel() {
  const [stats, setStats] = useState<ReturnType<typeof getSkillStats> | null>(null);
  const [running, setRunning] = useState<'replay' | 'synthetic' | 'encode' | 'all' | null>(null);
  const [lastReport, setLastReport] = useState<{ source: string; success: number; total: number; skills: number } | null>(null);
  const voice = useSubstrateVoice();

  useEffect(() => {
    setStats(getSkillStats());
    const interval = setInterval(() => setStats(getSkillStats()), 10_000);
    return () => clearInterval(interval);
  }, []);

  const handleRunAll = async () => {
    setRunning('all');
    try {
      const { runAllShadowBuilds } = await import('@/lib/shadow/shadowBuild');
      const reports = await runAllShadowBuilds();
      const totals = reports.reduce((acc, r) => ({
        success: acc.success + r.summary.success,
        total: acc.total + r.totalTasks,
        skills: acc.skills + r.summary.skillsGained,
      }), { success: 0, total: 0, skills: 0 });
      setLastReport({ source: 'All Modes', ...totals });
      setStats(getSkillStats());
      voice.success?.('Shadow build complete');
      toast.success(`Shadow build complete: ${totals.success}/${totals.total} tasks passed, ${totals.skills} skills gained`);
    } catch (err: any) {
      toast.error(`Shadow build failed: ${err.message}`);
    } finally {
      setRunning(null);
    }
  };

  const handleRunMode = async (source: 'replay' | 'synthetic' | 'encode') => {
    setRunning(source);
    try {
      const { runAllShadowBuilds } = await import('@/lib/shadow/shadowBuild');
      // runAllShadowBuilds runs all sources; we run it and filter display by source
      const reports = await runAllShadowBuilds();
      const filtered = reports.flatMap(r => r.results.filter(res => res.task.source === source));
      const success = filtered.filter(r => r.outcome === 'success' || r.outcome === 'partial_success').length;
      setLastReport({ source, success, total: filtered.length, skills: filtered.reduce((s, r) => s + r.skillsLearned.length, 0) });
      setStats(getSkillStats());
      voice.success?.(`${source} build complete`);
      toast.success(`${source} build: ${success}/${filtered.length} tasks passed`);
    } catch (err: any) {
      toast.error(`${source} build failed: ${err.message}`);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Mode Explanation */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Hammer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Shadow Build Mode</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Executors practice on realistic tasks — replaying real invocations, running synthetic scenarios, 
                  and executing ENCODE practice tasks. All results are scored and discarded, but skills and 
                  repair rules are retained and auto-propagated across the mesh.
                </p>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              <ActionButton
                icon={Play}
                variant="primary"
                loading={running === 'replay'}
                disabled={running !== null}
                onClick={() => handleRunMode('replay')}
                className="w-full text-xs"
              >
                Replay Tasks
              </ActionButton>
              <ActionButton
                icon={Sparkles}
                variant="secondary"
                loading={running === 'synthetic'}
                disabled={running !== null}
                onClick={() => handleRunMode('synthetic')}
                className="w-full text-xs"
              >
                Synthetic
              </ActionButton>
              <ActionButton
                icon={GraduationCap}
                variant="success"
                loading={running === 'encode'}
                disabled={running !== null}
                onClick={() => handleRunMode('encode')}
                className="w-full text-xs"
              >
                ENCODE Practice
              </ActionButton>
              <ActionButton
                icon={Zap}
                variant="warning"
                loading={running === 'all'}
                disabled={running !== null}
                onClick={handleRunAll}
                className="w-full text-xs"
              >
                Run All
              </ActionButton>
            </div>

            {/* ── Last Run Summary ── */}
            {lastReport && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Last run: <span className="font-medium text-foreground capitalize">{lastReport.source}</span></span>
                  <div className="flex gap-3">
                    <span><strong>{lastReport.success}</strong>/{lastReport.total} passed</span>
                    <span><strong>{lastReport.skills}</strong> skills</span>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Skill Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
        <MetricCard
          label="Total Skills"
          value={String(stats?.totalSkills ?? 0)}
          sub="across all executors"
          icon={GraduationCap}
          status={(stats?.totalSkills ?? 0) > 0 ? 'good' : 'neutral'}
          delay={0}
        />
        <MetricCard
          label="Avg Proficiency"
          value={`${((stats?.avgProficiency ?? 0) * 100).toFixed(0)}%`}
          sub="skill confidence"
          icon={TrendingUp}
          status={(stats?.avgProficiency ?? 0) >= 0.7 ? 'good' : (stats?.avgProficiency ?? 0) >= 0.4 ? 'warn' : 'neutral'}
          delay={1}
        />
        <MetricCard
          label="High Proficiency"
          value={String(stats?.highProficiency ?? 0)}
          sub="≥80% confidence"
          icon={CheckCircle2}
          status={(stats?.highProficiency ?? 0) > 0 ? 'good' : 'neutral'}
          delay={2}
        />
        <MetricCard
          label="Recently Learned"
          value={String(stats?.recentlyLearned ?? 0)}
          sub="last hour"
          icon={Sparkles}
          status={(stats?.recentlyLearned ?? 0) > 0 ? 'good' : 'neutral'}
          delay={3}
        />
        <MetricCard
          label="Categories"
          value={String(stats?.categoriesCovered ?? 0)}
          sub="skill domains"
          icon={Layers}
          status={(stats?.categoriesCovered ?? 0) >= 3 ? 'good' : 'neutral'}
          delay={4}
        />
      </div>

      {/* Top Skills & New Skills */}
      <div className="grid gap-4">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Top Skills
                <Badge variant="outline" className="text-[10px] ml-1">by proficiency</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.topSkills.length ? (
                <p className="text-sm text-muted-foreground py-4">
                  No skills developed yet — run shadow builds to train executors
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.topSkills.map((skill, i) => (
                    <motion.div
                      key={`${skill.name}-${skill.category}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-card hover:border-primary/20 transition-colors"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <code className="text-[11px] font-mono text-primary truncate max-w-[100px] sm:max-w-none">{skill.name}</code>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 flex-shrink-0">{skill.category}</Badge>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {(() => {
                          const tier = getSkillTier(skill.proficiency);
                          const progress = getTierProgress(skill.proficiency);
                          return (
                            <>
                              <Badge className={`text-[9px] px-1.5 py-0 ${tier.bgColor} ${tier.color} ${tier.borderColor} border`}>
                                {tier.emoji} {tier.label}
                              </Badge>
                              <div className="w-12 sm:w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full rounded-full ${skill.proficiency >= 0.8 ? 'bg-emerald-500' : skill.proficiency >= 0.5 ? 'bg-amber-500' : 'bg-red-400'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${skill.proficiency * 100}%` }}
                                  transition={{ duration: 0.6 }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono w-6 text-right">
                                ×{skill.practiceCount}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Recently Learned
                <Badge variant="outline" className="text-[10px] ml-1">newest first</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.newSkills.length ? (
                <p className="text-sm text-muted-foreground py-4">
                  No new skills yet — shadow builds generate learning data
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.newSkills.map((skill, i) => {
                    const age = Date.now() - skill.learnedAt;
                    const ageStr = age < 60000 ? 'just now' 
                      : age < 3600000 ? `${Math.round(age / 60000)}m ago`
                      : `${Math.round(age / 3600000)}h ago`;
                    const isNew = age < 300000; // < 5 min
                    
                    return (
                      <motion.div
                        key={`${skill.name}-${skill.learnedAt}`}
                        className={`flex items-center justify-between p-3 rounded-lg border ${isNew ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/20 bg-card'} transition-colors`}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isNew && <Sparkles className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                          <code className="text-[11px] font-mono truncate">{skill.name}</code>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={isNew ? 'default' : 'secondary'} className="text-[9px]">
                            {ageStr}
                          </Badge>
                          <span className={`text-xs font-mono ${skill.proficiency >= 0.6 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {(skill.proficiency * 100).toFixed(0)}%
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dual-mode explanation */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Training Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { icon: '🔍', text: 'Probe Mode — adversarial testing: fire garbage inputs, measure defense strength' },
            { icon: '🔨', text: 'Build Mode — skill training: practice on realistic tasks, develop proficiency' },
            { icon: '🧠', text: 'Auto-Learning — successful repairs become shared rules, cross-executor propagation' },
            { icon: '📈', text: 'Dual-mode — both modes run together, building defense AND capability simultaneously' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// EVOLUTION SHADOW PANEL
// ============================================================================

function ModernizerShadowPanel() {
  const [running, setRunning] = useState(false);
  const [lastReport, setLastReport] = useState<ModernizerShadowReport | null>(null);
  const [perfStats, setPerfStats] = useState(() => getPerformanceSummary());
  const [perfEntries, setPerfEntries] = useState<PerformanceEntry[]>(() => getPerformanceStats());
  const voice = useSubstrateVoice();

  useEffect(() => {
    const interval = setInterval(() => {
      setPerfStats(getPerformanceSummary());
      setPerfEntries(getPerformanceStats());
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  const handleRunScan = async () => {
    setRunning(true);
    try {
      const { runModernizerShadow } = await import('@/lib/shadow/modernizerShadow');
      const report = await runModernizerShadow();
      setLastReport(report);
      setPerfStats(getPerformanceSummary());
      setPerfEntries(getPerformanceStats());
      voice.success?.('EVOLUTION shadow complete');
      toast.success(`EVOLUTION Shadow: ${report.summary.executorFixed} fixed, ${report.summary.encodeEscalated} escalated, ${report.summary.rulesGenerated} rules generated`);
    } catch (err: any) {
      toast.error(`EVOLUTION shadow failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const gapCategoryColors: Record<string, string> = {
    security: 'text-destructive border-destructive/30 bg-destructive/5',
    resilience: 'text-primary border-primary/30 bg-primary/5',
    performance: 'text-accent-foreground border-accent/30 bg-accent/5',
    config: 'text-secondary-foreground border-secondary/30 bg-secondary/5',
    cleanup: 'text-muted-foreground border-border/30 bg-muted/5',
    observability: 'text-primary border-primary/30 bg-primary/5',
  };

  return (
    <div className="space-y-5">
      {/* Header / Scan Button */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">EVOLUTION Shadow Mode</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Runs a real EVOLUTION scan to find system gaps, then tasks executors with fixing them in shadow mode.
                  Failures escalate to ENCODE — its fixes become learning rules the executors absorb.
                  Watch performance improve over time as they learn from real-world scenarios.
                </p>
              </div>
              <ActionButton
                icon={Search}
                variant="warning"
                loading={running}
                onClick={handleRunScan}
                className="text-xs flex-shrink-0 w-full sm:w-auto"
              >
                {running ? 'Scanning…' : 'Run Scan'}
              </ActionButton>
            </div>

            {/* Last Run Summary */}
            {lastReport && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Scan <code className="font-mono text-foreground">{lastReport.scanId.slice(0, 12)}</code> — {lastReport.totalGaps} gaps found, {lastReport.gapsAttempted} attempted
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      ✅ {lastReport.summary.executorFixed} fixed
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      ⬆️ {lastReport.summary.encodeEscalated} escalated
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      🧠 {lastReport.summary.encodeFixed} ENCODE-fixed
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      📝 {lastReport.summary.rulesGenerated} rules
                    </Badge>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                  Duration: {(lastReport.scanDurationMs / 1000).toFixed(1)}s
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        <MetricCard
          label="Success Rate"
          value={`${(perfStats.overallSuccessRate * 100).toFixed(0)}%`}
          sub={`${perfStats.totalAttempts} attempts`}
          icon={HeartPulse}
          status={perfStats.overallSuccessRate >= 0.7 ? 'good' : perfStats.overallSuccessRate >= 0.4 ? 'warn' : perfStats.totalAttempts > 0 ? 'bad' : 'neutral'}
          delay={0}
        />
        <MetricCard
          label="ENCODE Assists"
          value={`${(perfStats.encodeAssistRate * 100).toFixed(0)}%`}
          sub="of failures"
          icon={GraduationCap}
          status={perfStats.encodeAssistRate > 0 ? 'warn' : 'good'}
          delay={1}
        />
        <MetricCard
          label="Improving"
          value={String(perfStats.improving)}
          sub="executor-gap pairs"
          icon={ArrowUpRight}
          status={perfStats.improving > 0 ? 'good' : 'neutral'}
          delay={2}
        />
        <MetricCard
          label="Declining"
          value={String(perfStats.declining)}
          sub="need attention"
          icon={ArrowDownRight}
          status={perfStats.declining > 0 ? 'bad' : 'good'}
          delay={3}
        />
        <MetricCard
          label="Gap Types"
          value={String(perfStats.totalGapTypes)}
          sub="categories trained"
          icon={Layers}
          status={perfStats.totalGapTypes >= 3 ? 'good' : 'neutral'}
          delay={4}
        />
        <MetricCard
          label="Executors"
          value={String(perfStats.totalExecutors)}
          sub="actively training"
          icon={Shield}
          status={perfStats.totalExecutors > 0 ? 'good' : 'neutral'}
          delay={5}
        />
      </div>

      {/* Gap Type Breakdown */}
      {lastReport && Object.keys(lastReport.gapBreakdown).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Gap Resolution by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(lastReport.gapBreakdown).map(([cat, data]) => (
                  <div key={cat} className={`p-3 rounded-lg border ${gapCategoryColors[cat] ?? 'border-border/30 bg-card'}`}>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1">{cat}</p>
                    <p className="text-lg font-bold font-mono">{data.fixed}/{data.total}</p>
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden mt-1.5">
                      <motion.div
                        className={`h-full rounded-full ${data.rate >= 0.7 ? 'bg-emerald-500' : data.rate >= 0.4 ? 'bg-amber-500' : 'bg-red-400'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${data.rate * 100}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Performance Timeline — Skill Growth */}
      {perfEntries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Performance Timeline
                <Badge variant="outline" className="text-[10px] ml-1">skill growth</Badge>
              </CardTitle>
              <CardDescription>Track how executors improve on real-world gap types over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {perfEntries.slice(0, 15).map((entry, i) => {
                  const trendIcon = entry.trend > 0.05 ? <ArrowUp className="w-3 h-3 text-emerald-500" /> 
                    : entry.trend < -0.05 ? <ArrowDown className="w-3 h-3 text-red-400" /> 
                    : <Minus className="w-3 h-3 text-muted-foreground" />;
                  
                  return (
                    <motion.div
                      key={`${entry.executor}-${entry.gapType}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/20 bg-card hover:border-primary/20 transition-colors gap-2"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <code className="text-[10px] font-mono text-primary truncate max-w-[100px] sm:max-w-[200px]">{entry.executor}</code>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 flex-shrink-0 ${gapCategoryColors[entry.gapType] ?? ''}`}>
                          {entry.gapType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end text-xs">
                        <div className="w-12 sm:w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${entry.successRate >= 0.7 ? 'bg-emerald-500' : entry.successRate >= 0.4 ? 'bg-amber-500' : 'bg-red-400'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${entry.successRate * 100}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                        <span className="font-mono font-medium text-right">
                          {(entry.successRate * 100).toFixed(0)}%
                        </span>
                        <div className="flex items-center gap-1">
                          {trendIcon}
                          <span className={`font-mono text-[10px] ${entry.trend > 0 ? 'text-emerald-500' : entry.trend < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {entry.trend > 0 ? '+' : ''}{(entry.trend * 100).toFixed(0)}%
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ×{entry.attempts}
                        </span>
                        {entry.encodeAssists > 0 && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                            🧠{entry.encodeAssists}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Improvers & Needs Work */}
      {(perfStats.topImprovers.length > 0 || perfStats.needsWork.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {perfStats.topImprovers.length > 0 && (
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-full border-emerald-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    Top Improvers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {perfStats.topImprovers.map((e, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded border border-emerald-500/10 bg-emerald-500/5">
                        <code className="font-mono truncate max-w-[80px] sm:max-w-[120px] text-[10px] sm:text-xs">{e.executor}</code>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px]">{e.gapType}</Badge>
                          <span className="text-emerald-500 font-mono font-medium">+{(e.trend * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {perfStats.needsWork.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="h-full border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Needs Work
                  </CardTitle>
                  <CardDescription className="text-xs">Under 50% success with 3+ attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {perfStats.needsWork.map((e, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded border border-amber-500/10 bg-amber-500/5">
                        <code className="font-mono truncate max-w-[80px] sm:max-w-[120px] text-[10px] sm:text-xs">{e.executor}</code>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px]">{e.gapType}</Badge>
                          <span className="text-amber-500 font-mono font-medium">{(e.successRate * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Flow Explanation */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { icon: '🔍', text: 'EVOLUTION scans for real system gaps — missing capabilities, anomalies, risk flags, stale modules' },
            { icon: '🎯', text: 'Each gap becomes a shadow training task assigned to the best-matched executor' },
            { icon: '⚡', text: 'Executor attempts the fix in shadow mode — no real changes, just scored performance' },
            { icon: '⬆️', text: 'Failures escalate to ENCODE\'s 7-strategy cascade — deterministic repair, learning rules, pattern matching' },
            { icon: '🧠', text: 'ENCODE\'s fixes become new learning rules that the executor absorbs for next time' },
            { icon: '📈', text: 'Performance tracked per executor per gap-type — watch skill growth curves over repeated runs' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <span className="text-lg mt-[-2px]">{item.icon}</span>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Last Scan Results Detail */}
      {lastReport && lastReport.results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Last Scan Results
                <Badge variant="outline" className="text-[10px] ml-1">{lastReport.results.length} gaps</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {lastReport.results.map((r, i) => (
                  <motion.div
                    key={r.task.id}
                    className={`p-3 rounded-lg border text-xs ${
                      r.outcome === 'fixed' ? 'border-emerald-500/20 bg-emerald-500/5'
                      : r.outcome === 'partial' ? 'border-amber-500/20 bg-amber-500/5'
                      : r.encodeOutcome === 'fixed' ? 'border-blue-500/20 bg-blue-500/5'
                      : 'border-red-500/20 bg-red-500/5'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{r.outcome === 'fixed' ? '✅' : r.outcome === 'partial' ? '⚠️' : r.encodeOutcome === 'fixed' ? '🧠' : '❌'}</span>
                        <span className="font-medium truncate">{r.task.title}</span>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 ${gapCategoryColors[r.task.gapType] ?? ''}`}>
                          {r.task.gapType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <code className="text-[10px] font-mono text-muted-foreground truncate max-w-[100px]">{r.executor}</code>
                        <span className="text-muted-foreground">{r.durationMs}ms</span>
                      </div>
                    </div>
                    {r.learningDelta && (
                      <p className="mt-1.5 text-[10px] text-muted-foreground italic leading-relaxed">
                        💡 {r.learningDelta}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function IILStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${color ?? ''}`}>{value.toLocaleString()}</p>
    </div>
  );
}

// ============================================================================
// PROMOTE TO PRODUCTION PANEL
// ============================================================================

function PromoteToProductionPanel() {
  const [promoting, setPromoting] = useState(false);
  const [snapshotting, setSnapshotting] = useState(false);
  const [diffing, setDiffing] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [diffs, setDiffs] = useState<any[]>([]);
  const [selectedDiff, setSelectedDiff] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const voice = useSubstrateVoice();

  const loadData = useCallback(async () => {
    setLoadingCandidates(true);
    const [proms, snaps, dfs, cands] = await Promise.all([
      promotionService.listPromotions(10),
      snapshotService.listSnapshots(10),
      diffService.listDiffs(10),
      promotionService.getPromotionCandidates(),
    ]);
    setPromotions(proms);
    setSnapshots(snaps);
    setDiffs(dfs);
    setCandidates(cands);
    setLoadingCandidates(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePromote = async () => {
    if (!selectedRunId) return;
    setPromoting(true);
    setConfirmOpen(false);
    try {
      const result = await promotionService.promoteToProduction(selectedRunId);
      if (result.success) {
        voice.success?.('Promotion complete', `Run ${selectedRunId.slice(0, 8)} → production | Health: ${result.healthScore}%`);
        toast.success('Successfully promoted shadow run to production');
        setSelectedRunId(null);
        loadData();
      } else {
        toast.error(`Promotion blocked: ${result.error}`);
      }
    } catch (err: any) {
      toast.error(`Promotion error: ${err.message}`);
    } finally {
      setPromoting(false);
    }
  };

  const handleRollback = async (promotionId: string) => {
    try {
      const result = await promotionService.rollbackPromotion(promotionId);
      if (result.success) {
        toast.success('Promotion rolled back');
        loadData();
      } else {
        toast.error(`Rollback failed: ${result.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSnapshot = async () => {
    setSnapshotting(true);
    try {
      const result = await snapshotService.createSnapshot('production_baseline');
      if (result.success) {
        toast.success('Snapshot captured');
        loadData();
      } else {
        toast.error(`Snapshot failed: ${result.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSnapshotting(false);
    }
  };

  const handleDiff = async () => {
    if (snapshots.length < 2) {
      toast.error('Need at least 2 snapshots to compare');
      return;
    }
    setDiffing(true);
    try {
      const from = snapshots[1];
      const to = snapshots[0];
      const result = await diffService.generateDiff(from.id, to.id, {
        summary: {
          from_type: from.type,
          to_type: to.type,
          from_created: from.created_at,
          to_created: to.created_at,
        },
      });
      if (result.success) {
        toast.success('Diff generated');
        setSelectedDiff(result.data);
        loadData();
      } else {
        toast.error(`Diff failed: ${result.error}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDiffing(false);
    }
  };

  const selectedCandidate = candidates.find(c => c.run_id === selectedRunId);

  return (
    <div className="space-y-4">
      {/* Shadow Run Candidates */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base mb-1">Shadow → Production Promotion</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select a validated shadow run to promote. Runs must pass TSAC verification and integrity gates before production apply.
                </p>
              </div>
            </div>

            {loadingCandidates ? (
              <div className="text-sm text-muted-foreground py-4 text-center">Loading shadow runs…</div>
            ) : candidates.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border/50 rounded-lg">
                <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="font-medium">No shadow runs ready for promotion</p>
                <p className="text-xs mt-1">Runs must be in <code className="text-primary">shadow_applied</code> phase</p>
              </div>
            ) : (
              <div className="space-y-2">
                {candidates.map((c: any) => {
                  const isSelected = selectedRunId === c.run_id;
                  const tsacOk = c.tsac_shadow_verdict === 'pass';
                  const tsacWarn = c.tsac_shadow_verdict === 'warn';
                  return (
                    <div
                      key={c.run_id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border/30 bg-muted/10 hover:border-primary/20'
                      }`}
                      onClick={() => setSelectedRunId(isSelected ? null : c.run_id)}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tsacOk ? 'bg-emerald-500' : tsacWarn ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="font-mono text-xs truncate">{c.run_id.slice(0, 12)}</span>
                          <Badge variant="outline" className="text-[9px]">{c.plan_title ?? c.plan_id.slice(0, 8)}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.confidence_score != null && (
                            <Badge variant="secondary" className="text-[9px]">
                              {Math.round(c.confidence_score * 100)}% conf
                            </Badge>
                          )}
                          {c.risk_level && (
                            <Badge variant={c.risk_level === 'low' ? 'default' : c.risk_level === 'medium' ? 'secondary' : 'destructive'} className="text-[9px]">
                              {c.risk_level}
                            </Badge>
                          )}
                          <Badge variant={tsacOk ? 'default' : tsacWarn ? 'secondary' : 'destructive'} className="text-[9px]">
                            TSAC: {c.tsac_shadow_verdict ?? 'n/a'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Promote button */}
            <div className="mt-4 flex items-center gap-3">
              <Button
                size="sm"
                className="text-xs gap-2"
                disabled={!selectedRunId || promoting}
                onClick={() => setConfirmOpen(true)}
              >
                <Rocket className="w-3.5 h-3.5" />
                {promoting ? 'Promoting…' : 'Promote Selected Run'}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={handleSnapshot} disabled={snapshotting}>
                {snapshotting ? 'Capturing…' : '📸 Snapshot'}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={handleDiff} disabled={diffing || snapshots.length < 2}>
                {diffing ? 'Diffing…' : '📊 Compare'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      {confirmOpen && selectedCandidate && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Confirm Production Promotion</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will advance shadow run <code className="text-primary">{selectedCandidate.run_id.slice(0, 12)}</code> to production.
                    A pre-promote snapshot will be created for rollback safety.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                <div className="p-2 rounded bg-muted/20 border border-border/20">
                  <span className="text-muted-foreground">Plan</span>
                  <p className="font-mono font-medium truncate">{selectedCandidate.plan_title}</p>
                </div>
                <div className="p-2 rounded bg-muted/20 border border-border/20">
                  <span className="text-muted-foreground">Risk</span>
                  <p className="font-medium">{selectedCandidate.risk_level ?? 'unknown'}</p>
                </div>
                <div className="p-2 rounded bg-muted/20 border border-border/20">
                  <span className="text-muted-foreground">TSAC</span>
                  <p className="font-medium">{selectedCandidate.tsac_shadow_verdict ?? 'n/a'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="text-xs gap-1" onClick={handlePromote} disabled={promoting}>
                  <Rocket className="w-3 h-3" />
                  {promoting ? 'Promoting…' : 'Confirm & Promote'}
                </Button>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Diff Results */}
      {selectedDiff && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 space-y-3 overflow-hidden">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" /> Diff Result
            </h3>
            <pre className="p-3 rounded-lg bg-muted/30 border border-border/20 overflow-x-auto max-h-60 text-[10px] sm:text-xs font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(selectedDiff, null, 2)}
            </pre>
          </Card>
        </motion.div>
      )}

      {/* Recent Snapshots */}
      {snapshots.length > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">Recent Snapshots</h3>
          <div className="space-y-1.5">
            {snapshots.slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/20 border border-border/20 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="text-[9px] flex-shrink-0">{s.type}</Badge>
                  <span className="font-mono truncate text-[10px]">{s.id?.slice(0, 12)}</span>
                </div>
                <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                  {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Promotion History */}
      {promotions.length > 0 && (
        <Card className="p-4 space-y-3 overflow-hidden">
          <h3 className="font-semibold text-sm">Promotion History</h3>
          <div className="space-y-1.5">
            {promotions.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-muted/20 border border-border/20 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant={p.status === 'completed' ? 'default' : p.status === 'rolled_back' ? 'destructive' : 'secondary'} className="text-[9px] flex-shrink-0">
                    {p.status}
                  </Badge>
                  <span className="font-mono truncate text-[10px]">{p.shadow_run_id?.slice(0, 12) ?? p.id?.slice(0, 12)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {p.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px] text-red-400 hover:text-red-300"
                      onClick={() => handleRollback(p.id)}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Rollback
                    </Button>
                  )}
                  <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                    {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Diffs */}
      {diffs.length > 0 && (
        <Card className="p-4 space-y-3 overflow-hidden">
          <h3 className="font-semibold text-sm">Recent Diffs</h3>
          <div className="space-y-1.5">
            {diffs.slice(0, 5).map((d: any) => (
              <div key={d.id} className="text-xs p-2.5 rounded-lg bg-muted/20 border border-border/20 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelectedDiff(d)}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono truncate text-[10px]">{d.from_snapshot_id?.slice(0, 8)} → {d.to_snapshot_id?.slice(0, 8)}</span>
                  <span className="text-muted-foreground text-[10px] whitespace-nowrap">
                    {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// CODE VERIFICATION PANEL
// ============================================================================

function TSACVerificationPanel() {
  const [taskDesc, setTaskDesc] = useState('');
  const [codeDiff, setCodeDiff] = useState('');
  const [executorId, setExecutorId] = useState('');
  const [source, setSource] = useState<'encode' | 'executor' | 'manual'>('executor');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const { fullVerify, getTSACStats, getTSACHistory } = await import('@/lib/substrate/tsac-engine');
      const [s, h] = await Promise.all([getTSACStats(), getTSACHistory()]);
      setStats(s);
      setHistory(h);
    } catch { /* silent */ }
    setLoadingStats(false);
  };

  const handleVerify = async () => {
    if (!taskDesc.trim() || !codeDiff.trim()) {
      toast.error('Both task description and code diff are required');
      return;
    }
    setVerifying(true);
    try {
      const { fullVerify } = await import('@/lib/substrate/tsac-engine');
      const res = await fullVerify({
        taskDescription: taskDesc,
        codeDiff,
        executorId: executorId || 'manual',
        source,
      });
      setResult(res);
      toast.success(`TSAC Verdict: ${res.verdict.toUpperCase()} (Intent: ${res.intent_score}/100)`);
      loadStats();
    } catch (err: any) {
      toast.error(`Verification failed: ${err.message}`);
    }
    setVerifying(false);
  };

  const verdictColor = (v: string) => v === 'pass' ? 'text-emerald-400' : v === 'fail' ? 'text-red-400' : 'text-amber-400';
  const verdictEmoji = (v: string) => v === 'pass' ? '✅' : v === 'fail' ? '❌' : '⚠️';

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base mb-1">TSAC — Task-Specific Acceptance Criteria</h3>
                <p className="text-sm text-muted-foreground leading-relaxed break-words">
                  Verifies ENCODE and Executors write the <strong>right code</strong> — not just good code.
                  AI generates acceptance criteria before judging if the diff solves the stated task.
                  Based on Sol-Ver self-play + SWE-bench methodology.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Executor Stats Summary */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Total Verified" value={String(stats.reduce((s: number, r: any) => s + r.total_verifications, 0))} icon={FileCheck} status="neutral" />
          <MetricCard label="Pass Rate" value={`${Math.round(stats.reduce((s: number, r: any) => s + (r.pass_rate || 0), 0) / Math.max(1, stats.length))}%`} icon={CheckCircle2} status="good" delay={1} />
          <MetricCard label="Avg Intent" value={`${Math.round(stats.reduce((s: number, r: any) => s + (r.avg_intent_score || 0), 0) / Math.max(1, stats.length))}`} icon={Target} status="neutral" delay={2} />
          <MetricCard label="Executors" value={String(stats.length)} icon={Layers} status="neutral" delay={3} />
        </div>
      )}

      {/* Input Form */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={source} onValueChange={(v) => setSource(v as any)}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="encode">ENCODE</SelectItem>
              <SelectItem value="executor">Executor</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            placeholder="Executor ID (optional)"
            value={executorId}
            onChange={(e) => setExecutorId(e.target.value)}
            className="h-8 px-2 text-xs bg-background border rounded-md flex-1 min-w-[120px]"
          />
          <Button size="sm" onClick={handleVerify} disabled={verifying} className="text-xs gap-1">
            {verifying ? <RotateCcw className="w-3 h-3 animate-spin" /> : <FileCheck className="w-3 h-3" />}
            {verifying ? 'Verifying…' : 'Run TSAC'}
          </Button>
        </div>
        <Textarea
          placeholder="Task description — What should this code accomplish?"
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
          className="min-h-[80px] text-xs resize-y"
        />
        <Textarea
          placeholder="Code diff or full code to verify…"
          value={codeDiff}
          onChange={(e) => setCodeDiff(e.target.value)}
          className="min-h-[120px] font-mono text-xs resize-y"
        />
      </Card>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Verdict Banner */}
          <Card className={`p-4 border-2 ${
            result.verdict === 'pass' ? 'border-emerald-500/30 bg-emerald-500/5' :
            result.verdict === 'fail' ? 'border-red-500/30 bg-red-500/5' :
            'border-amber-500/30 bg-amber-500/5'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{verdictEmoji(result.verdict)}</span>
                <div>
                  <p className={`text-xl font-bold ${verdictColor(result.verdict)}`}>{result.verdict.toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">Intent Match: {result.intent_score}/100 · Quality: {result.quality_score}/100</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Progress value={result.intent_score} className="h-2 w-24" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 break-words">{result.reasoning}</p>
          </Card>

          {/* Criteria Results */}
          <Card className="p-4 space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Acceptance Criteria ({result.criteria_results?.length || 0})
            </h4>
            <div className="space-y-2">
              {result.criteria_results?.map((cr: any, i: number) => {
                const criterion = result.criteria?.find((c: any) => c.id === cr.criterion_id);
                return (
                  <div key={i} className={`p-3 rounded-lg border text-xs ${
                    cr.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {cr.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{cr.criterion_id}</span>
                          {criterion && <Badge variant="outline" className="text-[8px]">{criterion.type}</Badge>}
                          {criterion && <Badge variant={criterion.priority === 'critical' ? 'destructive' : 'secondary'} className="text-[8px]">{criterion.priority}</Badge>}
                        </div>
                        {criterion && <p className="text-muted-foreground mt-0.5 break-words">{criterion.description}</p>}
                        <p className="mt-1 break-words">{cr.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quality Checks */}
          {result.quality_checks && (
            <Card className="p-4 space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" /> Static Quality Checks
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.quality_checks.map((qc: any, i: number) => (
                  <div key={i} className={`p-2 rounded text-xs flex items-center gap-1.5 ${qc.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {qc.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span className="truncate">{qc.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Verification History */}
      {history.length > 0 && (
        <Card className="p-4 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Recent Verifications
          </h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {history.slice(0, 15).map((h: any) => (
              <div key={h.id} className="flex items-center justify-between p-2 rounded-lg border border-border/20 text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span>{verdictEmoji(h.overall_verdict)}</span>
                  <span className="truncate font-medium">{h.executor_id}</span>
                  <Badge variant="outline" className="text-[8px] flex-shrink-0">{h.source}</Badge>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono">{h.intent_match_score ?? '—'}</span>
                  <span className="text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// ENCODE TRAINING PANEL
// ============================================================================

function EncodeTrainingPanel() {
  const [running, setRunning] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ mode: string; success: number; total: number } | null>(null);
  const voice = useSubstrateVoice();

  const trainingModules = [
    { id: 'modules', label: 'Node Refactoring', icon: '🧩', desc: 'Practice refactoring and improving substrate nodes' },
    { id: 'brain', label: 'Brain Operations', icon: '🧠', desc: 'Train on memory tiering, recall, and event processing' },
    { id: 'resilience', label: 'Resilience Patterns', icon: '🛡️', desc: 'Error handling, retry logic, safety switches' },
    { id: 'security', label: 'Security Hardening', icon: '🔒', desc: 'RLS policies, input validation, secret management' },
    { id: 'performance', label: 'Performance Optimization', icon: '⚡', desc: 'Query optimization, caching, batch processing' },
    { id: 'website', label: 'Website & UI', icon: '🎨', desc: 'Component architecture, accessibility, responsive design' },
  ];

  const handleTrain = async (moduleId: string) => {
    setRunning(moduleId);
    try {
      // Run shadow build focused on ENCODE practice tasks
      const { runAllShadowBuilds } = await import('@/lib/shadow/shadowBuild');
      const reports = await runAllShadowBuilds();
      const encodeResults = reports.flatMap(r => r.results.filter(res => res.task.source === 'encode'));
      const success = encodeResults.filter(r => r.outcome === 'success' || r.outcome === 'partial_success').length;
      setLastResult({ mode: moduleId, success, total: encodeResults.length });
      voice.success?.(`ENCODE training complete: ${success}/${encodeResults.length}`);
      toast.success(`ENCODE ${moduleId} training: ${success}/${encodeResults.length} passed`);
    } catch (err: any) {
      toast.error(`Training failed: ${err.message}`);
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">ENCODE Training Lab</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dedicated training environment for ENCODE. Practice real shadow work on modules,
                  brain operations, and website components. All work is scored and discarded but
                  skills and repair rules are retained permanently.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {lastResult && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-3 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center justify-between text-xs">
              <span>Last training: <strong className="capitalize">{lastResult.mode}</strong></span>
              <span><strong>{lastResult.success}</strong>/{lastResult.total} passed</span>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {trainingModules.map((mod) => (
          <motion.div key={mod.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 space-y-3 h-full flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg">{mod.icon}</span>
                <h4 className="font-semibold text-sm">{mod.label}</h4>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground flex-1">{mod.desc}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => handleTrain(mod.id)}
                disabled={running !== null}
              >
                {running === mod.id ? 'Training…' : 'Train'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ENCODE Skill Tiers Explanation */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" /> Skill Progression Tiers
        </h3>
        <p className="text-xs text-muted-foreground">Each tier represents real capability differences — not just a percentage.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { emoji: '🌱', name: 'Novice', range: '0-19%', desc: 'Handles basic inputs; fails on edge cases' },
            { emoji: '📘', name: 'Apprentice', range: '20-39%', desc: 'Recognizes failure patterns; basic repairs' },
            { emoji: '⚒️', name: 'Journeyman', range: '40-59%', desc: 'Reliable on standard work; contributes rules' },
            { emoji: '🎯', name: 'Specialist', range: '60-79%', desc: 'Deep domain knowledge; self-repairs' },
            { emoji: '⭐', name: 'Expert', range: '80-94%', desc: 'Near-zero failure rate; generates strategies' },
            { emoji: '👑', name: 'Master', range: '95-100%', desc: 'Fully autonomous; zero escalations' },
          ].map((tier) => (
            <div key={tier.name} className="p-2.5 rounded-lg border border-border/20 bg-card text-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <span>{tier.emoji}</span>
                <span className="font-medium">{tier.name}</span>
                <span className="text-muted-foreground font-mono text-[9px]">{tier.range}</span>
              </div>
              <p className="text-muted-foreground text-[10px] leading-relaxed">{tier.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
