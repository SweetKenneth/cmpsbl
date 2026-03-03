/**
 * Governor Panel — Admin controls + admin surfaces merged into the dashboard.
 * Kill switches, telemetry, GATE engine, Intel, Quarry, Governance — all in one.
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Power, Activity, AlertTriangle, Loader2, Zap,
  Eye, BarChart3, Brain, Shield, FileText, Settings,
  ArrowRight, Lock, Cpu, Network,
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

const GovernorSection = lazy(() => import('@/components/substrate-os/GovernorSection').then(m => ({ default: m.GovernorSection })));
const SoundingBoard = lazy(() => import('@/components/governance/SoundingBoard').then(m => ({ default: m.SoundingBoard })));

function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
    </div>
  );
}

export default function GovernorPanel() {
  const navigate = useNavigate();
  const meshToggle = useMeshToggle();
  const liveAuditFeed = useLiveAuditFeed(10);
  const [activeTab, setActiveTab] = useState('controls');

  // Kill switches
  const [killSwitches, setKillSwitches] = useState<Record<string, boolean>>({
    seba_enabled: false,
    autoblog_enabled: false,
    defense_enabled: true,
    clm_enabled: true,
  });
  const [ksLoading, setKsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('system_flags')
      .select('key, enabled')
      .in('key', ['seba_enabled', 'autoblog_enabled', 'defense_enabled', 'clm_enabled'])
      .then(({ data }) => {
        if (data) {
          const flags: Record<string, boolean> = {};
          data.forEach((row: any) => { flags[row.key] = row.enabled; });
          setKillSwitches(prev => ({ ...prev, ...flags }));
        }
        setKsLoading(false);
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

  // Audit feed formatting
  const getOutcomeColor = (outcome: string) => {
    if (outcome === 'success' || outcome === 'completed') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    if (outcome === 'error' || outcome === 'failed') return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    return 'bg-muted text-muted-foreground border-border/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/15 to-amber-500/10 border border-red-500/25 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Governor</h2>
          <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">ADMIN CONTROLS · KILL SWITCHES · TELEMETRY · GOVERNANCE</p>
        </div>
        <Badge className="ml-auto text-[9px] bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">ADMIN</Badge>
      </div>

      {/* Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: telemetry.totalUsers, icon: Eye, color: 'text-blue-500' },
          { label: 'API Calls', value: telemetry.totalApiCalls, icon: Zap, color: 'text-cyan-500' },
          { label: 'Usage Events', value: telemetry.totalUsageLogs, icon: BarChart3, color: 'text-emerald-500' },
          { label: 'Errors (7d)', value: telemetry.recentErrors, icon: AlertTriangle, color: telemetry.recentErrors > 0 ? 'text-red-500' : 'text-emerald-500' },
        ].map(stat => (
          <Card key={stat.label} className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn("w-4 h-4", stat.color)} />
                <span className="text-[10px] text-muted-foreground/50 font-mono uppercase">{stat.label}</span>
              </div>
              {telLoading ? <Skeleton className="h-6 w-16" /> : <span className="text-xl font-bold font-mono">{stat.value}</span>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/15 border border-border/15 gap-0.5 flex-wrap">
          <TabsTrigger value="controls" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1.5">
            <Power className="w-3.5 h-3.5" /> Kill Switches
          </TabsTrigger>
          <TabsTrigger value="audit-feed" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Live Audit
          </TabsTrigger>
          <TabsTrigger value="admin" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Admin Surfaces
          </TabsTrigger>
          <TabsTrigger value="advisory" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 text-xs gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Signal Feed
          </TabsTrigger>
        </TabsList>

        {/* Kill Switches */}
        <TabsContent value="controls" className="mt-4">
          <Card className="border-amber-500/15 dark:border-amber-500/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Power className="w-4 h-4 text-amber-500" />
                System Kill Switches
              </CardTitle>
              <CardDescription className="text-xs">Global toggles for critical subsystems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'mesh', label: 'Intent Mesh', desc: 'Cross-module routing', icon: Network, color: 'text-amber-500', checked: meshToggle.enabled, toggle: () => { meshToggle.toggle(); toast.success(meshToggle.enabled ? 'Mesh disabled' : 'Mesh enabled'); } },
                  { key: 'defense_enabled', label: 'DEFENSE', desc: 'Threat detection', icon: Shield, color: 'text-red-500', checked: killSwitches.defense_enabled, toggle: () => toggleKs('defense_enabled') },
                  { key: 'seba_enabled', label: 'SEBA Agent', desc: 'Autonomous evolution', icon: Zap, color: 'text-purple-500', checked: killSwitches.seba_enabled, toggle: () => toggleKs('seba_enabled') },
                  { key: 'autoblog_enabled', label: 'Autoblog', desc: 'Content generation', icon: FileText, color: 'text-cyan-500', checked: killSwitches.autoblog_enabled, toggle: () => toggleKs('autoblog_enabled') },
                  { key: 'clm_enabled', label: 'CLM Engine', desc: '24/7 continuous learning', icon: Brain, color: 'text-emerald-500', checked: killSwitches.clm_enabled, toggle: () => toggleKs('clm_enabled') },
                ].map(sw => (
                  <div key={sw.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/15">
                    <div className="flex items-center gap-2">
                      <sw.icon className={cn("w-4 h-4", sw.color)} />
                      <div>
                        <p className="text-sm font-medium">{sw.label}</p>
                        <p className="text-[10px] text-muted-foreground/50">{sw.desc}</p>
                      </div>
                    </div>
                    <Switch checked={sw.checked} onCheckedChange={sw.toggle} disabled={ksLoading} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Audit Feed */}
        <TabsContent value="audit-feed" className="mt-4">
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Live Audit Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {(liveAuditFeed.data || []).map((entry: any, i: number) => (
                    <div key={entry.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10">
                      <div className="text-[10px] text-muted-foreground/40 font-mono shrink-0 w-14">
                        {entry.created_at ? formatDistanceToNow(new Date(entry.created_at), { addSuffix: false }) : '—'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{entry.action}</span>
                          {entry.details?.outcome && (
                            <Badge variant="outline" className={cn("text-[8px] h-4 px-1", getOutcomeColor(entry.details.outcome))}>{entry.details.outcome}</Badge>
                          )}
                        </div>
                        {entry.entity_type && (
                          <span className="text-[10px] text-muted-foreground/40 font-mono">{entry.entity_type}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!liveAuditFeed.data || liveAuditFeed.data.length === 0) && (
                    <p className="text-sm text-muted-foreground/40 text-center py-8">No audit events</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Surfaces — quick access to admin pages */}
        <TabsContent value="admin" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'INTEL Panel', desc: 'Aggregation & founder insights', path: '/admin/intel', icon: Eye, color: 'text-primary' },
              { label: 'GATE Engine', desc: 'Production validation gauntlet', path: '/admin/gate', icon: Shield, color: 'text-amber-500' },
              { label: 'S-Tier Vault', desc: 'Crown jewel asset registry', path: '/admin/s-tier-vault', icon: Shield, color: 'text-purple-500' },
              { label: 'Quarry', desc: 'Asset extraction & processing', path: '/admin/quarry', icon: Cpu, color: 'text-orange-500' },
              { label: 'Immunity Mesh', desc: 'Training · Probes · Analytics', path: '/admin/immunity-mesh', icon: Network, color: 'text-cyan-500' },
              { label: 'Governance Plane', desc: 'High-level governance controls', path: '/admin/governance', icon: Shield, color: 'text-indigo-500' },
              { label: 'Discovery Mining', desc: 'Capability discovery console', path: '/admin/discovery-mining', icon: Zap, color: 'text-emerald-500' },
              { label: 'EVOLUTION Mesh', desc: 'Evolution pipeline dashboard', path: '/admin/evolution', icon: Activity, color: 'text-rose-500' },
            ].map(surface => (
              <motion.div key={surface.path} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                  variant="outline"
                  className="justify-between h-auto p-4 w-full border-border/15 dark:border-border/10 hover:bg-muted/20"
                  onClick={() => navigate(surface.path)}
                >
                  <div className="flex items-center gap-3 text-left">
                    <surface.icon className={cn("w-5 h-5 shrink-0", surface.color)} />
                    <div>
                      <p className="text-sm font-medium">{surface.label}</p>
                      <p className="text-[10px] text-muted-foreground/50">{surface.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Signal Feed / Advisory */}
        <TabsContent value="advisory" className="mt-4">
          <Suspense fallback={<Loader />}>
            <SoundingBoard />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
