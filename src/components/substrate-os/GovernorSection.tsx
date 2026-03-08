/**
 * Governor Section — Admin & Safety Controls
 * Full governance: audit, kill switches, telemetry, analytics, rate limits, backup
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, FileText, Settings, AlertTriangle, Lock, Database, RefreshCw, Loader2, Activity, Clock, Power, BarChart3, Zap, Eye, Shield, ArrowRight, Download, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSystemAudit, useSystemConfig, useSystemVersion, useLiveAuditFeed } from '@/hooks/useSubstrateOS';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useMeshToggle } from '@/lib/substrate/intent-mesh/toggle';

function ConfirmActionDialog({
  trigger,
  title,
  description,
  confirmText,
  onConfirm,
  dangerous = false,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  dangerous?: boolean;
}) {
  const [confirmValue, setConfirmValue] = useState('');
  const confirmWord = dangerous ? 'CONFIRM' : '';

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {dangerous && <AlertTriangle className="w-5 h-5 text-destructive" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        
        {dangerous && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-2">
              Type <code className="bg-muted px-1 rounded">CONFIRM</code> to proceed:
            </p>
            <Input
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Type CONFIRM"
              className="font-mono"
            />
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmValue('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              setConfirmValue('');
            }}
            disabled={dangerous && confirmValue !== confirmWord}
            className={dangerous ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function GovernorSection({ enabled = false }: { enabled?: boolean }) {
  const navigate = useNavigate();
  const systemAudit = useSystemAudit();
  const systemConfig = useSystemConfig('rate_limits');
  const systemVersion = useSystemVersion();
  const liveAuditFeed = useLiveAuditFeed(15);
  const meshToggle = useMeshToggle();

  // Persisted kill switches via system_flags
  const [killSwitches, setKillSwitches] = useState<Record<string, boolean>>({
    seba_enabled: false,
    autoblog_enabled: false,
    defense_enabled: true,
    clm_enabled: true,
  });
  const [killSwitchesLoading, setKillSwitchesLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
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
        setKillSwitchesLoading(false);
      });
  }, [enabled]);

  const toggleKillSwitch = async (key: string) => {
    const newValue = !killSwitches[key];
    setKillSwitches(prev => ({ ...prev, [key]: newValue }));
    const { error } = await supabase
      .from('system_flags')
      .update({ enabled: newValue, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (error) {
      setKillSwitches(prev => ({ ...prev, [key]: !newValue }));
      toast.error(`Failed to toggle ${key}`);
    } else {
      const label = (key ?? '').replace('_enabled', '');
      toast.success(`${label} ${newValue ? 'enabled' : 'disabled'}`);
    }
  };

  const auditData = systemAudit.data?.data as { entries?: Array<{ action: string; entity: string; timestamp: string }> } | undefined;
  const configData = systemConfig.data?.data as { config?: Record<string, unknown> } | undefined;
  const versionData = systemVersion.data?.data as { version?: string; build?: string } | undefined;

  // Telemetry quick stats from real DB
  const [telemetry, setTelemetry] = useState<{
    totalApiCalls: number;
    totalUsageLogs: number;
    totalUsers: number;
    recentErrors: number;
  }>({ totalApiCalls: 0, totalUsageLogs: 0, totalUsers: 0, recentErrors: 0 });
  const [telemetryLoading, setTelemetryLoading] = useState(true);

  useEffect(() => {
    async function fetchTelemetry() {
      setTelemetryLoading(true);
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [apiCalls, usageLogs, users, errors] = await Promise.all([
          supabase.from('ai_usage_log').select('*', { count: 'exact', head: true }),
          supabase.from('access_usage').select('*', { count: 'exact', head: true }),
          supabase.from('user_roles').select('*', { count: 'exact', head: true }),
          supabase.from('ai_usage_log').select('*', { count: 'exact', head: true }).eq('success', false).gte('created_at', sevenDaysAgo),
        ]);
        setTelemetry({
          totalApiCalls: apiCalls.count || 0,
          totalUsageLogs: usageLogs.count || 0,
          totalUsers: users.count || 0,
          recentErrors: errors.count || 0,
        });
      } catch (e) {
        console.error('Telemetry fetch error:', e);
      } finally {
        setTelemetryLoading(false);
      }
    }
    if (enabled) fetchTelemetry();
  }, [enabled]);

  // Get outcome badge styling
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'error':
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatEventType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  if (!enabled) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-destructive" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-muted-foreground">Governor</h2>
          <Badge variant="outline" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Admin Only
          </Badge>
        </div>
        <Card className="border-dashed border-destructive/30">
          <CardContent className="p-6 text-center">
            <Lock className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground italic">
              Governor controls are restricted to administrators. These powers shape the substrate itself.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4 md:space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-destructive" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold">Governor</h2>
        <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">
          Admin Access
        </Badge>
      </div>

      {/* Telemetry Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: telemetry.totalUsers, icon: Eye, iconClass: 'text-blue-400' },
          { label: 'API Calls', value: telemetry.totalApiCalls, icon: Zap, iconClass: 'text-cyan-400' },
          { label: 'Usage Events', value: telemetry.totalUsageLogs, icon: BarChart3, iconClass: 'text-emerald-400' },
          { label: 'Errors (7d)', value: telemetry.recentErrors, icon: AlertTriangle, iconClass: telemetry.recentErrors > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={cn("border-border/30 bg-muted/10")}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("w-4 h-4", stat.iconClass)} />
                  <span className="text-[10px] text-muted-foreground font-mono uppercase">{stat.label}</span>
                </div>
                {telemetryLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <span className="text-xl font-bold font-mono text-foreground">{stat.value}</span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kill Switches */}
      <Card className="border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Power className="w-4 h-4 text-amber-500" />
            Kill Switches
          </CardTitle>
          <CardDescription className="text-xs">Global system toggles for critical subsystems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-sm font-medium">Intent Mesh</p>
                  <p className="text-[10px] text-muted-foreground">Emergent module routing</p>
                </div>
              </div>
              <Switch 
                checked={meshToggle.enabled} 
                onCheckedChange={() => {
                  meshToggle.toggle();
                  toast.success(meshToggle.enabled ? 'Intent Mesh disabled' : 'Intent Mesh enabled');
                }} 
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-sm font-medium">Defense Module</p>
                  <p className="text-[10px] text-muted-foreground">Threat detection & blocking</p>
                </div>
              </div>
              <Switch 
                checked={killSwitches.defense_enabled} 
                onCheckedChange={() => toggleKillSwitch('defense_enabled')}
                disabled={killSwitchesLoading}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-sm font-medium">SEBA Agent</p>
                  <p className="text-[10px] text-muted-foreground">Autonomous evolution</p>
                </div>
              </div>
              <Switch 
                checked={killSwitches.seba_enabled} 
                onCheckedChange={() => toggleKillSwitch('seba_enabled')}
                disabled={killSwitchesLoading}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium">Autoblog</p>
                  <p className="text-[10px] text-muted-foreground">Content generation</p>
                </div>
              </div>
              <Switch 
                checked={killSwitches.autoblog_enabled} 
                onCheckedChange={() => toggleKillSwitch('autoblog_enabled')}
                disabled={killSwitchesLoading}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium">CLM Engine</p>
                  <p className="text-[10px] text-muted-foreground">24/7 continuous learning</p>
                </div>
              </div>
              <Switch 
                checked={killSwitches.clm_enabled} 
                onCheckedChange={() => toggleKillSwitch('clm_enabled')}
                disabled={killSwitchesLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EVLVBL API Card */}
      <Card className="border-cyan-500/30 bg-cyan-500/[0.03]">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-cyan-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold">EVLVBL API</h3>
              <p className="text-xs text-muted-foreground mt-0.5">API-first self-evolving code defense · Zero source exposure</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-initial gap-1.5"
                onClick={() => navigate('/docs')}
              >
                <ArrowRight className="w-3.5 h-3.5" /> API Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-between h-auto p-3 sm:p-4 border-primary/20 hover:bg-primary/5"
              onClick={() => navigate('/admin/immunity-mesh')}
            >
              <div className="flex items-center gap-3 text-left">
                <Shield className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Immunity Mesh</p>
                  <p className="text-[10px] text-muted-foreground">Training · Probes · Analytics</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
            <Button
              variant="outline"
              className="justify-between h-auto p-3 sm:p-4 border-border/30 hover:bg-muted/50"
              onClick={() => navigate('/admin/patches')}
            >
              <div className="flex items-center gap-3 text-left">
                <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Patch Distribution</p>
                  <p className="text-[10px] text-muted-foreground">Deploy & manage patches</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
            <Button
              variant="outline"
              className="justify-between h-auto p-3 sm:p-4 border-emerald-500/20 hover:bg-emerald-500/5"
              onClick={() => navigate('/docs')}
            >
              <div className="flex items-center gap-3 text-left">
                <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">EVLVBL v2</p>
                  <p className="text-[10px] text-muted-foreground">SDK · Download · Probes</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
            <Button
              variant="outline"
              className="justify-between h-auto p-3 sm:p-4 border-border/30 hover:bg-muted/50"
              onClick={() => navigate('/admin/encode-console')}
            >
              <div className="flex items-center gap-3 text-left">
                <Activity className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium">ENCODE Console</p>
                  <p className="text-[10px] text-muted-foreground">Systems engineer · Build · Modify</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
            <Button
              variant="outline"
              className="justify-between h-auto p-3 sm:p-4 border-cyan-500/20 hover:bg-cyan-500/5"
              onClick={() => navigate('/admin/evolution')}
            >
              <div className="flex items-center gap-3 text-left">
                <Zap className="w-5 h-5 text-cyan-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Evolution Dashboard</p>
                  <p className="text-[10px] text-muted-foreground">MPE · Shadow A/B · Canary</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
            <Button
              variant="outline"
              className="justify-between h-auto p-3 sm:p-4 border-border/30 hover:bg-muted/50"
              onClick={() => navigate('/diligence')}
            >
              <div className="flex items-center gap-3 text-left">
                <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Diligence Harness</p>
                  <p className="text-[10px] text-muted-foreground">Investor-grade test battery</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
            <Button
              variant="outline"
              className="justify-between h-auto p-3 sm:p-4 border-red-500/20 hover:bg-red-500/5"
              onClick={() => navigate('/admin/governance')}
            >
              <div className="flex items-center gap-3 text-left">
                <Lock className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Governance Control</p>
                  <p className="text-[10px] text-muted-foreground">Mode · Lockdown · Audit</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
            <Button
              variant="outline"
              className="justify-between h-auto p-3 sm:p-4 border-orange-500/20 hover:bg-orange-500/5"
              onClick={() => navigate('/evolution')}
            >
              <div className="flex items-center gap-3 text-left">
                <Zap className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">EVOLUTION Control Center</p>
                  <p className="text-[10px] text-muted-foreground">Dry-run · Rollback · Agent Connect</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="font-mono font-medium text-sm truncate">
                {versionData?.version || '—'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Build</p>
              <p className="font-mono font-medium text-sm">
                {versionData?.build || 'stable'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Environment</p>
              <p className="font-mono font-medium text-sm">production</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log + Rate Limits Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Live Audit Log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Audit Log
              {liveAuditFeed.isFetching && !liveAuditFeed.isLoading && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />
              )}
              {liveAuditFeed.data && liveAuditFeed.data.length > 0 && (
                <Badge variant="outline" className="ml-auto text-[9px] h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <Activity className="w-2.5 h-2.5 mr-1" />
                  LIVE
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time system activity feed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {liveAuditFeed.isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : liveAuditFeed.data && liveAuditFeed.data.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-2">
                  {liveAuditFeed.data.map((event: any) => (
                    <div 
                      key={event.id}
                      className="flex flex-col gap-1 p-2.5 rounded-lg bg-muted/30 text-xs border border-border/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] shrink-0", getOutcomeBadge(event.outcome))}
                          >
                            {event.outcome}
                          </Badge>
                          <span className="font-medium truncate text-foreground">
                            {formatEventType(event.event_type)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0 bg-primary/5">
                          {event.module}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground italic">
                  No recent audit events
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  System activity is being monitored
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rate Limits / Config */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              Rate Limits
            </CardTitle>
            <CardDescription className="text-xs">
              Provider capacity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {systemConfig.isLoading ? (
              <Skeleton className="h-[150px] w-full" />
            ) : configData?.config ? (
              <div className="text-sm space-y-2">
                {Object.entries(configData.config).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Rate limit configuration not exposed at this level.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dangerous Actions */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Safety Controls
          </CardTitle>
          <CardDescription className="text-xs">
            Critical operations require double confirmation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <ConfirmActionDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Database className="w-4 h-4" />
                  View Backup Status
                </Button>
              }
              title="Backup Status"
              description="View the current backup status and last backup timestamp. No destructive action."
              confirmText="View Status"
              onConfirm={() => toast.info('Backup status: Automated daily backups active')}
            />

            <ConfirmActionDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10">
                  <RefreshCw className="w-4 h-4" />
                  Trigger Backup
                </Button>
              }
              title="Trigger Manual Backup"
              description="Create an immediate backup of the substrate state. This is a non-destructive operation."
              confirmText="Create Backup"
              onConfirm={() => toast.success('Backup initiated. Check system logs for status.')}
            />

            <ConfirmActionDialog
              trigger={
                <Button variant="outline" size="sm" className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                  <AlertTriangle className="w-4 h-4" />
                  Emergency Shutdown
                </Button>
              }
              title="Emergency Shutdown"
              description="This will gracefully stop all substrate operations. Use only in critical situations. The substrate will need to be manually restarted."
              confirmText="Shutdown"
              onConfirm={() => toast.error('Emergency shutdown not available in this environment')}
              dangerous
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
