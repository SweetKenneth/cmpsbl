/**
 * DefenseAnalytics — Live Defense Module Dashboard
 * Real-time threat detection feed & analytics
 * Tier: Free (read-only view), Creator+ (interactive actions)
 */

import { useState, useEffect, useCallback } from "react";
import { Shield, Activity, AlertTriangle, CheckCircle2, Eye, Ban, Zap, RefreshCw, Globe, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface DefenseEvent {
  id: string;
  ip: string;
  user_agent: string | null;
  endpoint: string;
  risk_score: number;
  action: string;
  reason: string;
  metadata: Record<string, unknown> | null;
  detected_at: string;
  fingerprint_family: string | null;
  country: string | null;
  defense_mode: string | null;
}

interface DefenseStats {
  total: number;
  blocked: number;
  challenged: number;
  monitored: number;
  allowed: number;
  avgRisk: number;
  topIps: { ip: string; count: number }[];
  recentTrend: 'rising' | 'stable' | 'declining';
}

const ACTION_CONFIG: Record<string, { icon: typeof Shield; color: string; bg: string; label: string }> = {
  block: { icon: Ban, color: "text-red-500", bg: "bg-red-500/10", label: "BLOCKED" },
  challenge: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "CHALLENGED" },
  monitor: { icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10", label: "MONITORED" },
  allow: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "ALLOWED" },
  scan_completed: { icon: Activity, color: "text-cyan-500", bg: "bg-cyan-500/10", label: "SCANNED" },
};

function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || ACTION_CONFIG.monitor;
}

function riskColor(score: number): string {
  if (score >= 80) return "text-red-500";
  if (score >= 50) return "text-amber-500";
  if (score >= 30) return "text-blue-500";
  return "text-emerald-500";
}

function riskBadge(score: number): string {
  if (score >= 80) return "bg-red-500/10 text-red-500 border-red-500/30";
  if (score >= 50) return "bg-amber-500/10 text-amber-500 border-amber-500/30";
  if (score >= 30) return "bg-blue-500/10 text-blue-500 border-blue-500/30";
  return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function DefenseAnalytics() {
  const [events, setEvents] = useState<DefenseEvent[]>([]);
  const [stats, setStats] = useState<DefenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [subTab, setSubTab] = useState("feed");

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('defense_events')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      const typed = (data || []) as DefenseEvent[];
      setEvents(typed);

      // Calculate stats
      if (typed.length > 0) {
        const blocked = typed.filter(e => e.action === 'block').length;
        const challenged = typed.filter(e => e.action === 'challenge').length;
        const monitored = typed.filter(e => e.action === 'monitor').length;
        const allowed = typed.filter(e => e.action === 'allow').length;
        const avgRisk = Math.round(typed.reduce((s, e) => s + (e.risk_score || 0), 0) / typed.length);

        const ipCounts: Record<string, number> = {};
        typed.forEach(e => { ipCounts[e.ip] = (ipCounts[e.ip] || 0) + 1; });
        const topIps = Object.entries(ipCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([ip, count]) => ({ ip, count }));

        // Trend: compare last 12h vs prior 12h
        const now = Date.now();
        const recent = typed.filter(e => now - new Date(e.detected_at).getTime() < 12 * 3600000).length;
        const older = typed.filter(e => {
          const age = now - new Date(e.detected_at).getTime();
          return age >= 12 * 3600000 && age < 24 * 3600000;
        }).length;
        const recentTrend = recent > older * 1.5 ? 'rising' : recent < older * 0.5 ? 'declining' : 'stable';

        setStats({ total: typed.length, blocked, challenged, monitored, allowed, avgRisk, topIps, recentTrend });
      } else {
        setStats({ total: 0, blocked: 0, challenged: 0, monitored: 0, allowed: 0, avgRisk: 0, topIps: [], recentTrend: 'stable' });
      }
    } catch (err) {
      console.error('[DefenseAnalytics] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Realtime subscription
  useEffect(() => {
    if (!liveEnabled) return;

    const channel = supabase
      .channel('defense-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'defense_events' }, (payload) => {
        const newEvent = payload.new as DefenseEvent;
        setEvents(prev => [newEvent, ...prev].slice(0, 500));
        // Re-calculate stats on next render
        fetchEvents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveEnabled, fetchEvents]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Defense Analytics</h2>
            <p className="text-sm text-muted-foreground">Real-time threat detection & response</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={liveEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setLiveEnabled(!liveEnabled)}
            className="gap-2"
          >
            <div className={`w-2 h-2 rounded-full ${liveEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'}`} />
            {liveEnabled ? 'LIVE' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchEvents} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4 text-center transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-2xl font-bold font-mono tabular-nums">{stats?.total || 0}</p>
          <p className="text-xs text-muted-foreground">Total Events</p>
        </Card>
        <Card className="p-4 text-center border-red-500/20 transition-all duration-300 hover:border-red-500/30 hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-2xl font-bold text-red-500 font-mono tabular-nums">{stats?.blocked || 0}</p>
          <p className="text-xs text-muted-foreground">Blocked</p>
        </Card>
        <Card className="p-4 text-center border-amber-500/20 transition-all duration-300 hover:border-amber-500/30 hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-2xl font-bold text-amber-500 font-mono tabular-nums">{stats?.challenged || 0}</p>
          <p className="text-xs text-muted-foreground">Challenged</p>
        </Card>
        <Card className="p-4 text-center border-blue-500/20 transition-all duration-300 hover:border-blue-500/30 hover:-translate-y-0.5 hover:shadow-sm">
          <p className="text-2xl font-bold text-blue-500 font-mono tabular-nums">{stats?.monitored || 0}</p>
          <p className="text-xs text-muted-foreground">Monitored</p>
        </Card>
        <Card className="p-4 text-center transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
          <p className={`text-2xl font-bold font-mono tabular-nums ${riskColor(stats?.avgRisk || 0)}`}>{stats?.avgRisk || 0}</p>
          <p className="text-xs text-muted-foreground">Avg Risk Score</p>
        </Card>
      </div>

      {/* Trend Indicator */}
      {stats && (
        <Card className="p-4 flex items-center gap-3 transition-all duration-300 hover:border-primary/15">
          <TrendingUp className={`w-5 h-5 ${
            stats.recentTrend === 'rising' ? 'text-red-500' : 
            stats.recentTrend === 'declining' ? 'text-emerald-500' : 'text-muted-foreground'
          }`} />
          <span className="text-sm">
            Threat activity is <span className="font-semibold">
              {stats.recentTrend === 'rising' ? 'increasing' : stats.recentTrend === 'declining' ? 'decreasing' : 'stable'}
            </span> over the last 12 hours
          </span>
          {stats.recentTrend === 'rising' && (
            <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-500 border-red-500/30">
              Elevated
            </Badge>
          )}
        </Card>
      )}

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="feed" className="gap-2 text-xs">
            <Activity className="w-3.5 h-3.5" />
            Live Feed
          </TabsTrigger>
          <TabsTrigger value="threats" className="gap-2 text-xs">
            <BarChart3 className="w-3.5 h-3.5" />
            Threat Map
          </TabsTrigger>
          <TabsTrigger value="ips" className="gap-2 text-xs">
            <Globe className="w-3.5 h-3.5" />
            Top Sources
          </TabsTrigger>
        </TabsList>

        {/* Live Feed */}
        <TabsContent value="feed" className="mt-4">
          <ScrollArea className="h-[700px]">
            <div className="space-y-2">
              {events.length === 0 ? (
                <Card className="p-8 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No defense events recorded yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Events will appear here as the Site-Guard detects activity.</p>
                </Card>
              ) : (
                events.map((event) => {
                  const config = getActionConfig(event.action);
                  const Icon = config.icon;
                  return (
                    <Card key={event.id} className="p-3 md:p-4 hover:border-primary/30 transition-colors overflow-hidden">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1 overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`text-[10px] ${config.bg} ${config.color} border-current/30`}>
                              {config.label}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${riskBadge(event.risk_score)}`}>
                              Risk: {event.risk_score}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                              <Clock className="w-3 h-3" />
                              {timeAgo(event.detected_at)}
                            </span>
                          </div>
                          <p className="text-sm truncate">{event.reason}</p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground overflow-hidden">
                            <span className="font-mono truncate">{event.ip}</span>
                            {event.fingerprint_family && (
                              <span className="truncate">• {event.fingerprint_family}</span>
                            )}
                            {event.endpoint && event.endpoint !== 'site-guard' && (
                              <span className="truncate">• {event.endpoint}</span>
                            )}
                          </div>
                          {event.user_agent && (
                            <p className="text-[10px] text-muted-foreground/60 truncate font-mono max-w-full">{event.user_agent}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Threat Distribution */}
        <TabsContent value="threats" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Action Distribution */}
            <Card className="p-6 transition-all duration-300 hover:border-primary/15">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Action Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(ACTION_CONFIG).map(([action, config]) => {
                  const count = events.filter(e => e.action === action).length;
                  const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                  if (count === 0) return null;
                  const Icon = config.icon;
                  return (
                    <div key={action} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                          {config.label}
                        </span>
                        <span className="font-mono tabular-nums text-xs">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${(config?.bg ?? 'bg-primary/10').replace('/10', '/60')}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Risk Score Distribution */}
            <Card className="p-6 transition-all duration-300 hover:border-primary/15">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Risk Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Critical (80–100)", min: 80, max: 101, color: "text-red-500", bg: "bg-red-500/60" },
                  { label: "High (50–79)", min: 50, max: 80, color: "text-amber-500", bg: "bg-amber-500/60" },
                  { label: "Medium (30–49)", min: 30, max: 50, color: "text-blue-500", bg: "bg-blue-500/60" },
                  { label: "Low (0–29)", min: 0, max: 30, color: "text-emerald-500", bg: "bg-emerald-500/60" },
                ].map((band) => {
                  const count = events.filter(e => e.risk_score >= band.min && e.risk_score < band.max).length;
                  const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={band.label} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={band.color}>{band.label}</span>
                        <span className="font-mono text-xs">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${band.bg}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Detection Signals */}
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Detection Signals
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(() => {
                  const signals: Record<string, number> = {};
                  events.forEach(e => {
                    const meta = e.metadata as Record<string, unknown> | null;
                    if (meta?.signals && Array.isArray(meta.signals)) {
                      (meta.signals as string[]).forEach(s => { signals[s] = (signals[s] || 0) + 1; });
                    }
                    // Also count by reason keywords
                    if (e.reason) {
                      if (/bot/i.test(e.reason)) signals['Bot Detected'] = (signals['Bot Detected'] || 0) + 1;
                      if (/suspicious/i.test(e.reason)) signals['Suspicious Pattern'] = (signals['Suspicious Pattern'] || 0) + 1;
                      if (/user agent/i.test(e.reason)) signals['UA Anomaly'] = (signals['UA Anomaly'] || 0) + 1;
                      if (/ip/i.test(e.reason)) signals['IP Risk'] = (signals['IP Risk'] || 0) + 1;
                    }
                  });
                  const sorted = Object.entries(signals).sort((a, b) => b[1] - a[1]).slice(0, 8);
                  if (sorted.length === 0) {
                    return <p className="text-sm text-muted-foreground col-span-4">No detection signals yet</p>;
                  }
                  return sorted.map(([signal, count]) => (
                    <div key={signal} className="p-3 bg-muted/30 rounded-lg border text-center">
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{signal}</p>
                    </div>
                  ));
                })()}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Top Sources */}
        <TabsContent value="ips" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Top Source IPs
            </h3>
            {stats?.topIps && stats.topIps.length > 0 ? (
              <div className="space-y-3">
                {stats.topIps.map((entry, i) => {
                  const maxCount = stats.topIps[0].count;
                  const pct = Math.round((entry.count / maxCount) * 100);
                  const ipEvents = events.filter(e => e.ip === entry.ip);
                  const avgRisk = ipEvents.length > 0
                    ? Math.round(ipEvents.reduce((s, e) => s + (e.risk_score || 0), 0) / ipEvents.length)
                    : 0;
                  const primaryAction = ipEvents.reduce((acc, e) => {
                    acc[e.action] = (acc[e.action] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  const topAction = Object.entries(primaryAction).sort((a, b) => b[1] - a[1])[0]?.[0] || 'monitor';

                  return (
                    <div key={entry.ip} className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                          <span className="font-mono text-sm truncate">{entry.ip}</span>
                          <Badge variant="outline" className={`text-[10px] ${riskBadge(avgRisk)}`}>
                            Risk: {avgRisk}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] ${getActionConfig(topAction).bg} ${getActionConfig(topAction).color}`}>
                            {getActionConfig(topAction).label}
                          </Badge>
                        </div>
                        <span className="text-sm font-bold shrink-0 pl-7 sm:pl-0">{entry.count} events</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${avgRisk >= 50 ? 'bg-red-500/60' : 'bg-blue-500/60'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No source IP data available yet.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
