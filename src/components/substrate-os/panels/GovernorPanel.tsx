/**
 * Governor Panel — Admin controls merged into the dashboard.
 * Mobile-first with proper touch targets, scrollable tabs, and overflow handling.
 */

import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Power, Activity, AlertTriangle, Loader2, Zap,
  Eye, BarChart3, Brain, Shield, FileText, Settings,
  ArrowRight, Lock, Cpu, Network, Crown, Scale, ScrollText,
  Play, CheckCircle2, XCircle, AlertCircle, Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useMeshToggle } from '@/lib/substrate/intent-mesh/toggle';
import { useLiveAuditFeed } from '@/hooks/useSubstrateOS';
import { formatDistanceToNow } from 'date-fns';
import type { DiligenceReport } from '@/lib/diligence/run-diligence';
import type { AuditReport } from '@/lib/audit/audit-types';

const GovernorSection = lazy(() => import('@/components/substrate-os/GovernorSection').then(m => ({ default: m.GovernorSection })));
const SoundingBoard = lazy(() => import('@/components/governance/SoundingBoard').then(m => ({ default: m.SoundingBoard })));
const GovernorDownloadsPanel = lazy(() => import('./GovernorDownloadsPanel').then(m => ({ default: m.GovernorDownloadsPanel })));

function Loader() {
  return (
    <div className="flex items-center justify-center py-20 sm:py-24">
      <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
    </div>
  );
}

export default function GovernorPanel() {
  const navigate = useNavigate();
  const meshToggle = useMeshToggle();
  const liveAuditFeed = useLiveAuditFeed(10);
  const [activeTab, setActiveTab] = useState('controls');

  // Audit engine states
  const [diligenceRunning, setDiligenceRunning] = useState(false);
  const [diligenceReport, setDiligenceReport] = useState<DiligenceReport | null>(null);
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  const runDiligenceHarness = useCallback(async () => {
    setDiligenceRunning(true);
    setDiligenceReport(null);
    try {
      const { runDiligence } = await import('@/lib/diligence/run-diligence');
      const report = await runDiligence();
      setDiligenceReport(report);
      toast.success(`Diligence: ${report.summary.passed}/${report.summary.total} passed`);
    } catch (e: any) {
      toast.error(`Diligence failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setDiligenceRunning(false);
    }
  }, []);

  const runFullAuditEngine = useCallback(async () => {
    setAuditRunning(true);
    setAuditReport(null);
    try {
      const { runFullAudit } = await import('@/lib/audit/audit-runner');
      const report = await runFullAudit();
      setAuditReport(report);
      toast.success(`Audit: ${report.summary.passed ? 'PASSED' : 'ISSUES FOUND'} (${report.summary.total} findings)`);
    } catch (e: any) {
      toast.error(`Audit failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setAuditRunning(false);
    }
  }, []);

  // Kill switches
  const [killSwitches, setKillSwitches] = useState<Record<string, boolean>>({
    seba_enabled: false,
    autoblog_enabled: false,
    defense_enabled: true,
    clm_enabled: true,
    auto_training_enabled: false,
    shadow_mesh_enabled: false,
  });
  const [ksLoading, setKsLoading] = useState(true);

  // Substrate module metrics
  const [moduleHealth, setModuleHealth] = useState<{ module: string; ops: number; errors: number; health: number }[]>([]);
  const [moduleHealthLoading, setModuleHealthLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('system_flags')
      .select('key, enabled')
      .in('key', ['seba_enabled', 'autoblog_enabled', 'defense_enabled', 'clm_enabled', 'auto_training_enabled', 'shadow_mesh_enabled'])
      .then(({ data }) => {
        if (data) {
          const flags: Record<string, boolean> = {};
          data.forEach((row: any) => { flags[row.key] = row.enabled; });
          setKillSwitches(prev => ({ ...prev, ...flags }));
        }
        setKsLoading(false);
      });

    // Fetch real module metrics from immune_metrics and mesh_comms
    Promise.all([
      supabase.from('immune_metrics').select('executor, total, repaired, escalated, safe_fail').order('created_at', { ascending: false }).limit(100),
      supabase.from('mesh_comms').select('source_module, category').order('created_at', { ascending: false }).limit(500),
    ]).then(([imRes, meshRes]) => {
      const modules = new Map<string, { ops: number; errors: number }>();
      (imRes.data || []).forEach((row: any) => {
        const existing = modules.get(row.executor) || { ops: 0, errors: 0 };
        existing.ops += (row.total || 0);
        existing.errors += (row.escalated || 0);
        modules.set(row.executor, existing);
      });
      (meshRes.data || []).forEach((row: any) => {
        const mod = row.source_module;
        if (!mod) return;
        const existing = modules.get(mod) || { ops: 0, errors: 0 };
        existing.ops += 1;
        if (row.category === 'escalation' || row.category === 'warning') existing.errors += 1;
        modules.set(mod, existing);
      });
      const result = Array.from(modules.entries()).map(([module, data]) => ({
        module,
        ops: data.ops,
        errors: data.errors,
        health: data.ops > 0 ? Math.max(0, Math.round(100 - (data.errors / data.ops) * 50)) : 100,
      })).sort((a, b) => b.ops - a.ops).slice(0, 12);
      setModuleHealth(result);
      setModuleHealthLoading(false);
    });
  }, []);

  const toggleKs = async (key: string) => {
    const newVal = !killSwitches[key];
    setKillSwitches(prev => ({ ...prev, [key]: newVal }));
    const { error } = await supabase
      .from('system_flags')
      .update({ enabled: newVal, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (error) {
      setKillSwitches(prev => ({ ...prev, [key]: !newVal }));
      toast.error(`Failed to toggle ${key}`);
    } else {
      toast.success(`${key.replace('_enabled', '')} ${newVal ? 'enabled' : 'disabled'}`);
    }
  };

  // Telemetry
  const [telemetry, setTelemetry] = useState({ totalApiCalls: 0, totalUsageLogs: 0, totalUsers: 0, recentErrors: 0 });
  const [telLoading, setTelLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setTelLoading(true);
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const [api, usage, users, errors] = await Promise.all([
          supabase.from('ai_usage_log').select('*', { count: 'exact', head: true }),
          supabase.from('access_usage').select('*', { count: 'exact', head: true }),
          supabase.from('user_roles').select('*', { count: 'exact', head: true }),
          supabase.from('ai_usage_log').select('*', { count: 'exact', head: true }).eq('success', false).gte('created_at', sevenDaysAgo),
        ]);
        setTelemetry({
          totalApiCalls: api.count || 0,
          totalUsageLogs: usage.count || 0,
          totalUsers: users.count || 0,
          recentErrors: errors.count || 0,
        });
      } catch (e) { console.error('Telemetry fetch error:', e); }
      finally { setTelLoading(false); }
    }
    fetch();
  }, []);

  const getOutcomeColor = (outcome: string) => {
    if (outcome === 'success' || outcome === 'completed') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    if (outcome === 'error' || outcome === 'failed') return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    return 'bg-muted text-muted-foreground border-border/20';
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500/15 to-amber-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Stream Governor</h2>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono tracking-wider truncate">STREAM CONTROLS · KILL SWITCHES · TELEMETRY</p>
        </div>
        <Badge className="text-[9px] bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 shrink-0">ADMIN</Badge>
      </div>

      {/* Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total Users', value: telemetry.totalUsers, icon: Eye, color: 'text-blue-500' },
          { label: 'API Calls', value: telemetry.totalApiCalls, icon: Zap, color: 'text-cyan-500' },
          { label: 'Usage Events', value: telemetry.totalUsageLogs, icon: BarChart3, color: 'text-emerald-500' },
          { label: 'Errors (7d)', value: telemetry.recentErrors, icon: AlertTriangle, color: telemetry.recentErrors > 0 ? 'text-red-500' : 'text-emerald-500' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", stat.color)} />
                <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 font-mono uppercase truncate">{stat.label}</span>
              </div>
              {telLoading ? <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" /> : <span className="text-lg sm:text-xl font-bold font-mono tabular-nums">{stat.value}</span>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted/15 border border-border/15 gap-0.5 w-max sm:w-auto">
            <TabsTrigger value="controls" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Power className="w-3.5 h-3.5 hidden sm:block" /> Switches
            </TabsTrigger>
            <TabsTrigger value="sovereignty" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Crown className="w-3.5 h-3.5 hidden sm:block" /> ESZ
            </TabsTrigger>
            <TabsTrigger value="audit-feed" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Activity className="w-3.5 h-3.5 hidden sm:block" /> Audit
            </TabsTrigger>
            <TabsTrigger value="admin" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Settings className="w-3.5 h-3.5 hidden sm:block" /> Surfaces
            </TabsTrigger>
            <TabsTrigger value="advisory" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Brain className="w-3.5 h-3.5 hidden sm:block" /> Signal
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <BarChart3 className="w-3.5 h-3.5 hidden sm:block" /> Metrics
            </TabsTrigger>
            <TabsTrigger value="downloads" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Package className="w-3.5 h-3.5 hidden sm:block" /> Downloads
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Kill Switches */}
        <TabsContent value="controls" className="mt-4">
          <Card className="border-amber-500/15 dark:border-amber-500/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Power className="w-4 h-4 text-amber-500 shrink-0" />
                System Kill Switches
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Global toggles for critical subsystems</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {[
                  { key: 'mesh', label: 'Intent Mesh', desc: 'Cross-node routing', icon: Network, color: 'text-amber-500', checked: meshToggle.enabled, toggle: () => { meshToggle.toggle(); toast.success(meshToggle.enabled ? 'Mesh disabled' : 'Mesh enabled'); } },
                  { key: 'defense_enabled', label: 'DEFENSE', desc: 'Threat detection', icon: Shield, color: 'text-red-500', checked: killSwitches.defense_enabled, toggle: () => toggleKs('defense_enabled') },
                  { key: 'seba_enabled', label: 'SEBA Agent', desc: 'Autonomous evolution', icon: Zap, color: 'text-purple-500', checked: killSwitches.seba_enabled, toggle: () => toggleKs('seba_enabled') },
                  { key: 'autoblog_enabled', label: 'Autoblog', desc: 'Content generation', icon: FileText, color: 'text-cyan-500', checked: killSwitches.autoblog_enabled, toggle: () => toggleKs('autoblog_enabled') },
                  { key: 'clm_enabled', label: 'CLM Engine', desc: '24/7 continuous learning', icon: Brain, color: 'text-emerald-500', checked: killSwitches.clm_enabled, toggle: () => toggleKs('clm_enabled') },
                  { key: 'auto_training_enabled', label: 'IMMUNITY Training', desc: 'Shadow probe auto-training', icon: Shield, color: 'text-primary', checked: killSwitches.auto_training_enabled, toggle: () => toggleKs('auto_training_enabled') },
                  { key: 'shadow_mesh_enabled', label: 'Shadow Mesh', desc: 'Adversarial shadow probes', icon: Eye, color: 'text-violet-500', checked: killSwitches.shadow_mesh_enabled, toggle: () => toggleKs('shadow_mesh_enabled') },
                ].map(sw => (
                  <div key={sw.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/15 min-h-[52px] transition-all duration-300 hover:border-primary/15 hover:bg-muted/15">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <sw.icon className={cn("w-4 h-4 shrink-0", sw.color)} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{sw.label}</p>
                        <p className="text-[10px] text-muted-foreground/50 truncate">{sw.desc}</p>
                      </div>
                    </div>
                    <Switch checked={sw.checked} onCheckedChange={sw.toggle} disabled={ksLoading} className="ml-2 shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ESZ — Sovereignty & Ethics */}
        <TabsContent value="sovereignty" className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {[
              {
                module: 'SOVEREIGN',
                icon: Crown,
                color: 'text-amber-500',
                desc: 'Autonomous decision authority & operational independence',
                metrics: [
                  { label: 'Authority Level', value: killSwitches.seba_enabled ? 'Full' : 'Limited' },
                  { label: 'Override Events', value: String(telemetry.recentErrors) },
                  { label: 'Delegation Active', value: killSwitches.clm_enabled ? 'Yes' : 'No' },
                ],
              },
              {
                module: 'CONSCIENCE',
                icon: Scale,
                color: 'text-violet-500',
                desc: 'Ethical decision boundaries & bias detection',
                metrics: [
                  { label: 'Ethics Checks', value: killSwitches.defense_enabled ? 'Active' : 'Disabled' },
                  { label: 'Bias Alerts', value: String(telemetry.recentErrors) },
                  { label: 'Boundary Status', value: killSwitches.defense_enabled ? 'Enforced' : 'Relaxed' },
                ],
              },
              {
                module: 'TREATY',
                icon: ScrollText,
                color: 'text-cyan-500',
                desc: 'SLA enforcement, contract compliance, agreement tracking',
                metrics: [
                  { label: 'Active Treaties', value: String(telemetry.totalUsers) },
                  { label: 'Violations', value: String(telemetry.recentErrors) },
                  { label: 'Compliance', value: telemetry.recentErrors === 0 ? '100%' : `${Math.max(0, Math.round(100 - (telemetry.recentErrors / Math.max(1, telemetry.totalApiCalls)) * 100))}%` },
                ],
              },
            ].map((node) => (
              <Card key={node.module} className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
                <CardContent className="p-3 sm:p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <node.icon className={cn("w-4 h-4 shrink-0", node.color)} />
                    <span className="text-xs sm:text-sm font-bold font-mono">{node.module}</span>
                    <Badge variant="outline" className="text-[8px] h-4 px-1.5 ml-auto bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">active</Badge>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground/60">{node.desc}</p>
                  <div className="space-y-1.5">
                    {node.metrics.map(m => (
                      <div key={m.label} className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground/50 font-mono">{m.label}</span>
                        <span className="font-medium font-mono">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Live Audit Feed + Engine Runners */}
        <TabsContent value="audit-feed" className="mt-4 space-y-4">
          {/* Engine Runner Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold">Diligence Harness</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground/50">Terminal & governance probe battery</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={runDiligenceHarness} disabled={diligenceRunning} className="gap-1.5 text-xs">
                    {diligenceRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {diligenceRunning ? 'Running…' : 'Run'}
                  </Button>
                </div>
                {diligenceReport && (
                  <div className="space-y-2 pt-2 border-t border-border/10">
                    <div className="flex items-center gap-2">
                      {diligenceReport.summary.critical === 0 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className="text-xs font-mono">{diligenceReport.summary.passed}/{diligenceReport.summary.total} PASS · {diligenceReport.summary.minor} MINOR · {diligenceReport.summary.critical} CRITICAL</span>
                    </div>
                    {diligenceReport.failed_probes.length > 0 && (
                      <ScrollArea className="h-[120px]">
                        <div className="space-y-1">
                          {diligenceReport.failed_probes.map(p => (
                            <div key={p.id} className="text-[10px] p-1.5 rounded bg-muted/10 border border-border/10 font-mono">
                              <span className={p.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}>[{p.severity}]</span> {p.name} — <span className="text-muted-foreground/60">{p.command}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

             <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 transition-all duration-300 hover:border-primary/15">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold">Full Audit Runner</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground/50">Structural, contract, SEO & branding audit</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={runFullAuditEngine} disabled={auditRunning} className="gap-1.5 text-xs">
                    {auditRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    {auditRunning ? 'Running…' : 'Run'}
                  </Button>
                </div>
                {auditReport && (
                  <div className="space-y-2 pt-2 border-t border-border/10">
                    <div className="flex items-center gap-2">
                      {auditReport.summary.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                      <span className="text-xs font-mono">{auditReport.summary.passed ? 'PASSED' : 'ISSUES'} · {auditReport.summary.fatal}F {auditReport.summary.error}E {auditReport.summary.warn}W {auditReport.summary.info}I · {auditReport.duration_ms}ms</span>
                    </div>
                    {auditReport.findings.filter(f => f.severity === 'fatal' || f.severity === 'error').length > 0 && (
                      <ScrollArea className="h-[120px]">
                        <div className="space-y-1">
                          {auditReport.findings.filter(f => f.severity === 'fatal' || f.severity === 'error').map(f => (
                            <div key={f.id} className="text-[10px] p-1.5 rounded bg-muted/10 border border-border/10 font-mono">
                              <span className={f.severity === 'fatal' ? 'text-red-500' : 'text-amber-500'}>[{f.severity.toUpperCase()}]</span> {f.title}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Audit Feed */}
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary shrink-0" />
                Live Audit Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <ScrollArea className="h-[250px] sm:h-[300px]">
                <div className="space-y-2">
                  {(liveAuditFeed.data || []).map((entry: any, i: number) => (
                    <div key={entry.id || i} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10">
                      <div className="text-[9px] sm:text-[10px] text-muted-foreground/40 font-mono shrink-0 w-12 sm:w-14 pt-0.5">
                        {entry.created_at ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: false }) : '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-[11px] sm:text-xs font-medium truncate">{entry.action}</span>
                          {entry.details?.outcome && (
                            <Badge variant="outline" className={cn("text-[8px] h-4 px-1 shrink-0", getOutcomeColor(entry.details.outcome))}>{entry.details.outcome}</Badge>
                          )}
                        </div>
                        {entry.entity_type && (
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground/40 font-mono truncate block">{entry.entity_type}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!liveAuditFeed.data || liveAuditFeed.data.length === 0) && (
                    <p className="text-xs sm:text-sm text-muted-foreground/40 text-center py-8">No audit events</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Surfaces */}
        <TabsContent value="admin" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {[
              { label: 'INTEL Panel', desc: 'Aggregation & founder insights', path: '/admin/intel', icon: Eye, color: 'text-primary' },
              { label: 'GATE Engine', desc: 'Production validation gauntlet', path: '/admin/gate', icon: Shield, color: 'text-amber-500' },
              { label: 'S-Tier Vault', desc: 'Apex Discovery asset registry', path: '/admin/s-tier-vault', icon: Shield, color: 'text-purple-500' },
              { label: 'Quarry', desc: 'Asset extraction & processing', path: '/admin/quarry', icon: Cpu, color: 'text-orange-500' },
              { label: 'Immunity Mesh', desc: 'Training · Probes · Analytics', path: '/admin/immunity-mesh', icon: Network, color: 'text-cyan-500' },
              { label: 'Governance Plane', desc: 'High-level governance controls', path: '/admin/governance', icon: Shield, color: 'text-indigo-500' },
              { label: 'Discovery Mining', desc: 'Capability discovery console', path: '/admin/discovery-mining', icon: Zap, color: 'text-emerald-500' },
              { label: 'EVOLUTION Mesh', desc: 'Evolution engine dashboard', path: '/admin/evolution', icon: Activity, color: 'text-rose-500' },
            ].map(surface => (
              <motion.div key={surface.path} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                  variant="outline"
                  className="justify-between h-auto p-3 sm:p-4 w-full border-border/15 dark:border-border/10 hover:bg-muted/20 hover:border-primary/15 min-h-[56px] transition-all duration-300"
                  onClick={() => navigate(surface.path)}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 text-left min-w-0 flex-1">
                    <surface.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 shrink-0", surface.color)} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{surface.label}</p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 truncate">{surface.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0 ml-2" />
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Metrics Store */}
        <TabsContent value="metrics" className="mt-4 space-y-4">
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary shrink-0" />
                Substrate Module Metrics
              </CardTitle>
              <CardDescription className="text-[11px]">Real-time health and throughput per module</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {moduleHealthLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : moduleHealth.length > 0 ? (
                <div className="space-y-2">
                  {moduleHealth.map(m => (
                    <div key={m.module} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10">
                      <span className="text-[11px] font-mono font-bold w-24 truncate">{m.module}</span>
                      <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", m.health >= 80 ? "bg-emerald-500" : m.health >= 50 ? "bg-amber-500" : "bg-red-500")}
                          style={{ width: `${m.health}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono tabular-nums w-10 text-right">{m.health}%</span>
                      <span className="text-[9px] text-muted-foreground/50 font-mono w-16 text-right">{m.ops} ops</span>
                      <span className="text-[9px] text-red-400/70 font-mono w-12 text-right">{m.errors} err</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/40 text-center py-6">No module metrics recorded yet. Enable Shadow Mesh & IMMUNITY Training to begin.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signal Feed */}
        <TabsContent value="advisory" className="mt-4">
          <Suspense fallback={<Loader />}>
            <SoundingBoard />
          </Suspense>
        </TabsContent>

        {/* Downloads */}
        <TabsContent value="downloads" className="mt-4">
          <Suspense fallback={<Loader />}>
            <GovernorDownloadsPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
