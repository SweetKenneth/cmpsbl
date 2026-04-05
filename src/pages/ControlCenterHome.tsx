/**
 * CMPSBL® Central Control Station — Governor Dashboard
 *
 * control.cmpsbl.com — Single-page tabbed command center providing
 * bird's-eye observability and governance across all substrates.
 *
 * Governor-gated: requires authenticated governor role.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useSSORelay } from "@/hooks/useSSORelay";
import { Helmet } from "react-helmet-async";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity, Shield, Brain, Globe, Layers, Zap, Eye,
  ShoppingCart, Sparkles, TrendingUp, Server, AlertTriangle,
  CheckCircle2, XCircle, Clock, RefreshCw,
  BarChart3, MessageSquare, Lock, Crown, Users, Cpu,
  Atom, Clapperboard, Box, Gauge, Terminal, ChevronRight,
  ArrowUpRight, PackageCheck, Rocket, ThumbsUp, ThumbsDown,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { StatusDot } from "@/components/ui/StatusDot";

/* ─── Auto-refresh interval (30s) ─── */
const REFRESH_INTERVAL_MS = 30_000;

/* ─── Substrate registry ─── */
interface SubstrateInfo {
  key: string;
  name: string;
  domain: string;
  icon: LucideIcon;
  accentVar: string; // CSS variable name for theming
}

const SUBSTRATES: SubstrateInfo[] = [
  { key: "core", name: "CMPSBL® Core", domain: "cmpsbl.com", icon: Box, accentVar: "--primary" },
  { key: "security", name: "CMPSBL CYBER™", domain: "security.cmpsbl.com", icon: Shield, accentVar: "--destructive" },
  { key: "robotics", name: "CMPSBL ROBOTICS™", domain: "robotics.cmpsbl.com", icon: Cpu, accentVar: "--neon-cyan" },
  { key: "quantum", name: "CMPSBL QUANTUM™", domain: "quantum.cmpsbl.com", icon: Atom, accentVar: "--neon-purple" },
  { key: "llm", name: "CMPSBL LLM™", domain: "llm.cmpsbl.com", icon: Brain, accentVar: "--neon-green" },
  { key: "agency", name: "CMPSBL AGENCY™", domain: "agency.cmpsbl.com", icon: Users, accentVar: "--neon-amber" },
  { key: "media", name: "CMPSBL MEDIA™", domain: "media.cmpsbl.com", icon: Clapperboard, accentVar: "--neon-magenta" },
  { key: "ultimate", name: "CMPSBL ULTIMATE™", domain: "ultimate.cmpsbl.com", icon: Crown, accentVar: "--neon-purple" },
];

/* ─── Types ─── */
interface SubstrateHealthItem {
  module: string;
  health: number;
  status: string;
  latency?: number;
}

interface DiscoveryItem {
  id: string;
  domain: string;
  score: number | null;
  created_at: string;
}

interface IntentItem {
  id: string;
  intent_type: string;
  source_module: string;
  target_module: string;
  status: string;
  created_at: string;
  payload: Record<string, unknown> | null;
}

interface AscensionItem {
  id: string;
  name: string;
  slug: string;
  tier: string;
  category: string;
  created_at: string;
}

interface ShowroomItem {
  id: string;
  name: string;
  category: string;
  tier: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

/* ─── Helpers ─── */
function MetricCard({ label, value, icon: Icon, variant, sub }: {
  label: string; value: string | number; icon: LucideIcon; variant?: "primary" | "destructive" | "success" | "warning" | "purple"; sub?: string;
}) {
  const variantStyles: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-neon-green/10 text-neon-green",
    warning: "bg-neon-amber/10 text-neon-amber",
    purple: "bg-neon-purple/10 text-neon-purple",
  };
  const v = variant ?? "primary";
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${variantStyles[v]?.split(" ")[0]}`}>
          <Icon className={`h-5 w-5 ${variantStyles[v]?.split(" ")[1]}`} />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold font-mono text-foreground truncate">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
          {sub && <div className="text-[10px] text-muted-foreground/60">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}

function healthToStatus(h: number): "healthy" | "degraded" | "critical" {
  if (h >= 80) return "healthy";
  if (h >= 50) return "degraded";
  return "critical";
}

/* ─── Tabs config ─── */
const TABS = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "health", label: "Health", icon: Activity },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "ascension", label: "Ascension", icon: Rocket },
  { id: "showroom", label: "Showroom", icon: PackageCheck },
  { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
  { id: "discovery", label: "Discovery", icon: Sparkles },
  { id: "governance", label: "Governance", icon: Crown },
  { id: "nexus", label: "NEXUS", icon: Zap },
  { id: "defense", label: "DEFENSE", icon: Shield },
  { id: "traffic", label: "Traffic", icon: BarChart3 },
] as const;

/* ─── Main Component ─── */
export default function ControlCenterHome() {
  useSSORelay();
  const { session, user } = useAuth();
  const navigate = useNavigate();

  const [isGovernor, setIsGovernor] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [substrateHealth, setSubstrateHealth] = useState<SubstrateHealthItem[]>([]);
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);
  const [intents, setIntents] = useState<IntentItem[]>([]);
  const [ascensions, setAscensions] = useState<AscensionItem[]>([]);
  const [showroomItems, setShowroomItems] = useState<ShowroomItem[]>([]);
  const [nexusStatus, setNexusStatus] = useState<Record<string, unknown> | null>(null);
  const [defenseStatus, setDefenseStatus] = useState<Record<string, unknown> | null>(null);
  const [marketplaceStats, setMarketplaceStats] = useState({ total: 0, avgPrice: 0, recentSales: 0 });
  const [memoryTiers, setMemoryTiers] = useState<{ tier: string; cnt: number }[]>([]);
  const [pageViews24h, setPageViews24h] = useState(0);
  const [analyticsBreakdown, setAnalyticsBreakdown] = useState<{ page: string; count: number }[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth gate
  useEffect(() => {
    if (!session) {
      navigate("/auth?returnTo=/");
      return;
    }
    const email = user?.email?.toLowerCase();
    if (email === "kennethsweet214@gmail.com") {
      setIsGovernor(true);
    }
    setLoading(false);
  }, [session, user, navigate]);

  // Data fetch
  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [
        discoveryRes,
        intentRes,
        nexRes,
        defRes,
        marketRes,
        memRes,
        pvRes,
        ascensionRes,
        showroomRes,
        analyticsRes,
      ] = await Promise.all([
        supabase.from("access_scans").select("id,domain,score,created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("mesh_intents" as never).select("id,intent_type,source_module,target_module,status,created_at,payload").order("created_at", { ascending: false }).limit(50),
        supabase.functions.invoke("pf-substrate", { body: { module: "nexus", action: "status" } }),
        supabase.functions.invoke("pf-substrate", { body: { module: "defense", action: "status" } }),
        supabase.from("marketplace_inventory" as never).select("id,title,price_cents,tier,vertical,created_at,purchase_count").order("created_at", { ascending: false }).limit(100),
        supabase.rpc("brain_get_tier_counts" as never),
        supabase.from("site_page_views").select("id", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 86_400_000).toISOString()),
        supabase.from("artifact_registry").select("id,name,slug,tier,category,created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("artifact_registry").select("id,name,category,tier,created_at,metadata").eq("tier", "showroom").order("created_at", { ascending: false }).limit(50),
        supabase.from("analytics_events").select("page").order("created_at", { ascending: false }).limit(500),
      ]);

      // Health matrix — all core primitives
      const modules = [
        "core", "defense", "governance", "nexus", "brain", "memory",
        "evolution", "cortex", "encode", "decode", "economy", "sandbox",
        "immunity", "intent", "inclusive", "integration", "vision",
      ];
      const healthResults = await Promise.all(
        modules.map(m =>
          supabase.functions.invoke("pf-substrate", { body: { module: m, action: "status" } })
            .then(r => {
              const d = r.data as Record<string, unknown> | null;
              return {
                module: m,
                health: (d?.health as number) ?? (d?.health_score as number) ?? 0,
                status: (d?.status as string) ?? "unknown",
                latency: (d?.latency_ms as number) ?? 0,
              };
            })
            .catch(() => ({ module: m, health: 0, status: "error", latency: 0 }))
        )
      );
      setSubstrateHealth(healthResults);

      if (discoveryRes.data) setDiscoveries(discoveryRes.data as unknown as DiscoveryItem[]);
      if (intentRes.data) setIntents(intentRes.data as unknown as IntentItem[]);
      if (nexRes.data) setNexusStatus(nexRes.data as Record<string, unknown>);
      if (defRes.data) setDefenseStatus(defRes.data as Record<string, unknown>);
      if (ascensionRes.data) setAscensions(ascensionRes.data as AscensionItem[]);
      if (showroomRes.data) setShowroomItems(showroomRes.data as unknown as ShowroomItem[]);

      // Marketplace stats
      if (marketRes.data) {
        const items = marketRes.data as unknown as { price_cents: number; purchase_count: number }[];
        const paid = items.filter(i => i.price_cents > 0);
        setMarketplaceStats({
          total: items.length,
          avgPrice: paid.length ? Math.round(paid.reduce((a, b) => a + b.price_cents, 0) / paid.length) : 0,
          recentSales: items.filter(i => i.purchase_count > 0).length,
        });
      }

      if (memRes.data) setMemoryTiers((memRes as { data: { tier: string; cnt: number }[] }).data);
      setPageViews24h(pvRes.count ?? 0);

      // Analytics page breakdown
      if (analyticsRes.data) {
        const pages = (analyticsRes.data as { page: string | null }[]);
        const counts: Record<string, number> = {};
        for (const p of pages) {
          const key = p.page ?? "/";
          counts[key] = (counts[key] ?? 0) + 1;
        }
        setAnalyticsBreakdown(
          Object.entries(counts)
            .map(([page, count]) => ({ page, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15)
        );
      }

      setLastRefreshed(new Date());
    } catch {
      // Graceful degradation — dashboard remains visible with stale data
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial fetch + auto-refresh
  useEffect(() => {
    if (!isGovernor) return;
    fetchAllData();
    intervalRef.current = setInterval(fetchAllData, REFRESH_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isGovernor, fetchAllData]);

  // Computed
  const avgHealth = useMemo(() => {
    if (!substrateHealth.length) return 0;
    return Math.round(substrateHealth.reduce((a, b) => a + b.health, 0) / substrateHealth.length);
  }, [substrateHealth]);

  const totalMemory = useMemo(() => memoryTiers.reduce((a, b) => a + b.cnt, 0), [memoryTiers]);
  const healthyCount = useMemo(() => substrateHealth.filter(h => h.health >= 80).length, [substrateHealth]);
  const pendingIntents = useMemo(() => intents.filter(i => i.status === "pending"), [intents]);
  const criticalModules = useMemo(() => substrateHealth.filter(h => h.health < 50), [substrateHealth]);

  // Governance actions
  const handleIntentAction = useCallback(async (intentId: string, action: "approved" | "denied") => {
    const { error } = await supabase.from("mesh_intents" as never).update({ status: action } as never).eq("id" as never, intentId as never);
    if (error) {
      toast.error(`Failed to ${action} intent`);
      return;
    }
    toast.success(`Intent ${action}`);
    setIntents(prev => prev.map(i => i.id === intentId ? { ...i, status: action } : i));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground font-mono text-sm">Authenticating…</div>
      </div>
    );
  }

  if (!isGovernor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md border border-border bg-card">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-bold text-foreground mb-2">Access Restricted</h2>
            <p className="text-muted-foreground text-sm">
              Central Control Station is restricted to authorized Governors.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Central Control Station — CMPSBL®</title>
        <meta name="description" content="Governor command center for all CMPSBL® substrates." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* ─── Header ─── */}
        <header className="border-b border-border bg-card px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">CMPSBL® CONTROL CENTER</h1>
              <p className="text-[10px] text-muted-foreground font-mono">GOVERNOR · {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalModules.length > 0 && (
              <Badge variant="destructive" className="text-[10px] font-mono animate-pulse">
                {criticalModules.length} CRITICAL
              </Badge>
            )}
            {pendingIntents.length > 0 && (
              <Badge variant="outline" className="text-[10px] font-mono border-neon-amber text-neon-amber">
                {pendingIntents.length} PENDING
              </Badge>
            )}
            <StatusDot status="healthy" pulse label="LIVE" size="sm" />
            <div className="flex items-center gap-1">
              {lastRefreshed && (
                <span className="text-[9px] text-muted-foreground/50 font-mono hidden sm:block">
                  {timeAgo(lastRefreshed.toISOString())}
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => fetchAllData()}
                disabled={refreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </header>

        {/* ─── Top metrics ─── */}
        <div className="px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="System Health" value={`${avgHealth}%`} icon={Activity} variant="success" />
            <MetricCard label="Primitives Online" value={`${healthyCount}/${substrateHealth.length}`} icon={Server} variant="primary" />
            <MetricCard label="Memory Objects" value={totalMemory.toLocaleString()} icon={Brain} variant="purple" />
            <MetricCard label="Traffic (24h)" value={pageViews24h.toLocaleString()} icon={TrendingUp} variant="warning" />
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="px-4 sm:px-6 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollArea className="w-full">
              <TabsList className="bg-muted/50 border border-border rounded-lg p-1 inline-flex w-auto">
                {TABS.map(t => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="text-xs font-mono data-[state=active]:bg-background data-[state=active]:text-foreground gap-1.5 whitespace-nowrap"
                  >
                    <t.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {/* ─── OVERVIEW ─── */}
            <TabsContent value="overview" className="mt-4 space-y-6">
              {/* Substrate fleet */}
              <div>
                <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Substrate Fleet
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUBSTRATES.map(s => (
                    <Card key={s.key} className="border border-border bg-card cursor-pointer hover:border-primary/30 transition-colors group">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <s.icon className="h-4 w-4 text-primary" />
                            <span className="text-[10px] sm:text-xs font-bold text-foreground">{s.name}</span>
                          </div>
                          <StatusDot status="healthy" pulse size="sm" />
                        </div>
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground font-mono">{s.domain}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick summary row */}
              <div className="grid sm:grid-cols-3 gap-3">
                <Card className="border border-border bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-primary" /> NEXUS Router
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold font-mono text-foreground">
                      {(nexusStatus as Record<string, Record<string, unknown>>)?.providers?.total as number ?? "—"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Providers Available</div>
                    <div className="text-xs text-neon-green mt-1 font-mono">
                      Circuit: {(nexusStatus as Record<string, unknown>)?.circuit_state as string ?? "—"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3 w-3 text-destructive" /> DEFENSE Layer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold font-mono text-foreground">
                      {(defenseStatus as Record<string, Record<string, unknown>>)?.stats?.total_events as number ?? "—"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Total Events</div>
                    <div className="text-xs text-neon-amber mt-1 font-mono">
                      Blocked 24h: {(defenseStatus as Record<string, Record<string, unknown>>)?.stats?.blocked_24h as number ?? 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <ShoppingCart className="h-3 w-3 text-neon-green" /> Marketplace
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold font-mono text-foreground">{marketplaceStats.total}</div>
                    <div className="text-[10px] text-muted-foreground">Inventory Items</div>
                    <div className="text-xs text-neon-green mt-1 font-mono">
                      Avg: ${(marketplaceStats.avgPrice / 100).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Memory distribution */}
              {memoryTiers.length > 0 && (
                <Card className="border border-border bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <Brain className="h-3 w-3 text-neon-purple" /> Memory Stream Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex gap-4 flex-wrap">
                      {memoryTiers.map(t => (
                        <div key={t.tier} className="text-center">
                          <div className="text-lg font-bold font-mono text-foreground">{t.cnt.toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-mono">{t.tier}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alerts banner */}
              {criticalModules.length > 0 && (
                <Card className="border border-destructive/30 bg-destructive/5">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-foreground mb-1">Critical Attention Required</div>
                      <div className="text-xs text-muted-foreground">
                        {criticalModules.map(m => m.module.toUpperCase()).join(", ")} — scoring below 50. Review Health tab for details.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ─── HEALTH ─── */}
            <TabsContent value="health" className="mt-4">
              <h2 className="text-sm font-bold text-foreground mb-3">Primitive Health Matrix</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {substrateHealth.map(h => (
                  <Card key={h.module} className="border border-border bg-card">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusDot status={healthToStatus(h.health)} size="sm" />
                        <span className="text-xs font-mono font-bold text-foreground uppercase">{h.module}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {h.latency ? <span className="text-[10px] text-muted-foreground font-mono">{h.latency}ms</span> : null}
                        <span className={`text-sm font-bold font-mono ${
                          h.health >= 80 ? "text-neon-green" : h.health >= 50 ? "text-neon-amber" : "text-destructive"
                        }`}>
                          {h.health}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {substrateHealth.length === 0 && (
                <div className="text-sm text-muted-foreground font-mono py-8 text-center">Loading health data…</div>
              )}
            </TabsContent>

            {/* ─── MEMORY ─── */}
            <TabsContent value="memory" className="mt-4 space-y-4">
              <h2 className="text-sm font-bold text-foreground mb-3">Memory Stream Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {memoryTiers.map(t => (
                  <MetricCard
                    key={t.tier}
                    label={`${t.tier.toUpperCase()} Tier`}
                    value={t.cnt.toLocaleString()}
                    icon={Layers}
                    variant={
                      t.tier === "hot" ? "destructive" :
                      t.tier === "warm" ? "warning" :
                      t.tier === "cold" ? "primary" : "success"
                    }
                  />
                ))}
              </div>
              <Card className="border border-border bg-card">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-2 font-mono">Total across all tiers</div>
                  <div className="text-3xl font-bold font-mono text-foreground">{totalMemory.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">objects in the Memory Stream</div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── ASCENSION ─── */}
            <TabsContent value="ascension" className="mt-4 space-y-4">
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-neon-amber" /> Ascension Pipeline
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <MetricCard label="Total Ascended" value={ascensions.length} icon={Rocket} variant="warning" />
                <MetricCard
                  label="S-Tier"
                  value={ascensions.filter(a => a.tier === "s-tier" || a.tier === "S").length}
                  icon={Crown}
                  variant="purple"
                />
                <MetricCard
                  label="Recent (7d)"
                  value={ascensions.filter(a => Date.now() - new Date(a.created_at).getTime() < 604_800_000).length}
                  icon={ArrowUpRight}
                  variant="success"
                />
              </div>
              <div className="space-y-2">
                {ascensions.length === 0 ? (
                  <div className="text-sm text-muted-foreground font-mono py-8 text-center">No ascension data available</div>
                ) : (
                  ascensions.slice(0, 20).map(a => (
                    <Card key={a.id} className="border border-border bg-card">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Rocket className="h-3.5 w-3.5 text-neon-amber shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-mono text-foreground truncate block">{a.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{a.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {a.tier}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(a.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ─── SHOWROOM ─── */}
            <TabsContent value="showroom" className="mt-4 space-y-4">
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-neon-green" /> Showroom Processing
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <MetricCard label="Showroom Items" value={showroomItems.length} icon={PackageCheck} variant="success" />
                <MetricCard
                  label="Processing (24h)"
                  value={showroomItems.filter(s => Date.now() - new Date(s.created_at).getTime() < 86_400_000).length}
                  icon={Clock}
                  variant="primary"
                />
              </div>
              <div className="space-y-2">
                {showroomItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground font-mono py-8 text-center">No showroom items</div>
                ) : (
                  showroomItems.slice(0, 20).map(s => (
                    <Card key={s.id} className="border border-border bg-card">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <PackageCheck className="h-3.5 w-3.5 text-neon-green shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-mono text-foreground truncate block">{s.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{s.category}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">{timeAgo(s.created_at)}</span>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ─── MARKETPLACE ─── */}
            <TabsContent value="marketplace" className="mt-4 space-y-4">
              <h2 className="text-sm font-bold text-foreground mb-3">Marketplace Intelligence</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <MetricCard label="Total Inventory" value={marketplaceStats.total} icon={ShoppingCart} variant="success" />
                <MetricCard label="Avg Price (paid)" value={`$${(marketplaceStats.avgPrice / 100).toFixed(2)}`} icon={TrendingUp} variant="warning" />
                <MetricCard label="Items Purchased" value={marketplaceStats.recentSales} icon={CheckCircle2} variant="purple" />
              </div>
            </TabsContent>

            {/* ─── DISCOVERY ─── */}
            <TabsContent value="discovery" className="mt-4 space-y-4">
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neon-amber" /> Recent Discoveries
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-2">
                <MetricCard label="Total Discoveries" value={discoveries.length} icon={Sparkles} variant="warning" />
                <MetricCard
                  label="High CJPI (≥80)"
                  value={discoveries.filter(d => (d.score ?? 0) >= 80).length}
                  icon={Crown}
                  variant="purple"
                />
              </div>
              <div className="space-y-2">
                {discoveries.length === 0 ? (
                  <div className="text-sm text-muted-foreground font-mono py-8 text-center">No recent discoveries</div>
                ) : (
                  discoveries.slice(0, 20).map(d => (
                    <Card key={d.id} className="border border-border bg-card">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles className="h-3.5 w-3.5 text-neon-amber shrink-0" />
                          <span className="text-xs font-mono text-foreground truncate">{d.domain}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {d.score !== null && (
                            <Badge variant="outline" className={`text-[10px] font-mono ${
                              d.score >= 80 ? "border-neon-green/30 text-neon-green" :
                              d.score >= 50 ? "border-neon-amber/30 text-neon-amber" :
                              "border-border text-muted-foreground"
                            }`}>
                              {d.score}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(d.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ─── GOVERNANCE ─── */}
            <TabsContent value="governance" className="mt-4 space-y-4">
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Crown className="h-4 w-4 text-neon-amber" /> Governance — Approve / Deny Requests
              </h2>
              <div className="grid sm:grid-cols-3 gap-3 mb-2">
                <MetricCard label="Pending" value={pendingIntents.length} icon={Clock} variant="warning" />
                <MetricCard label="Approved" value={intents.filter(i => i.status === "approved" || i.status === "resolved").length} icon={CheckCircle2} variant="success" />
                <MetricCard label="Denied" value={intents.filter(i => i.status === "denied" || i.status === "rejected").length} icon={XCircle} variant="destructive" />
              </div>

              {pendingIntents.length === 0 ? (
                <Card className="border border-border bg-card">
                  <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-neon-green" />
                    <div className="text-sm text-muted-foreground font-mono">All clear — no pending requests</div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {pendingIntents.map(intent => (
                    <Card key={intent.id} className="border border-neon-amber/20 bg-card">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare className="h-3.5 w-3.5 text-neon-amber shrink-0" />
                            <span className="text-xs font-mono font-bold text-foreground uppercase">{intent.source_module}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-mono text-muted-foreground uppercase">{intent.target_module}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(intent.created_at)}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mb-3">{intent.intent_type}</div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-mono text-neon-green border-neon-green/30 hover:bg-neon-green/10"
                            onClick={() => handleIntentAction(intent.id, "approved")}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-mono text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleIntentAction(intent.id, "denied")}
                          >
                            <ThumbsDown className="h-3 w-3 mr-1" /> Deny
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Recent decisions */}
              {intents.filter(i => i.status !== "pending").length > 0 && (
                <div>
                  <h3 className="text-xs font-mono text-muted-foreground mb-2 mt-4">Recent Decisions</h3>
                  <div className="space-y-1.5">
                    {intents.filter(i => i.status !== "pending").slice(0, 10).map(i => (
                      <div key={i.id} className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded-lg bg-muted/30">
                        <span className="text-foreground">{i.source_module} → {i.target_module}</span>
                        <Badge variant="outline" className={`text-[10px] ${
                          i.status === "approved" || i.status === "resolved" ? "border-neon-green/30 text-neon-green" :
                          "border-destructive/30 text-destructive"
                        }`}>
                          {i.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ─── INTENT MESH (raw feed) ─── */}
            {/* Intentionally removed — Governance tab now handles intents with actions */}

            {/* ─── NEXUS ─── */}
            <TabsContent value="nexus" className="mt-4 space-y-3">
              <h2 className="text-sm font-bold text-foreground mb-3">NEXUS Router Status</h2>
              {nexusStatus ? (
                <>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <MetricCard label="Providers" value={(nexusStatus as Record<string, Record<string, unknown>>).providers?.total as number ?? 0} icon={Server} variant="primary" />
                    <MetricCard label="Circuit State" value={(nexusStatus as Record<string, unknown>).circuit_state as string ?? "—"} icon={Zap} variant="success" />
                    <MetricCard label="Health" value={`${(nexusStatus as Record<string, unknown>).health_score as number ?? 100}%`} icon={Activity} variant="warning" />
                  </div>
                  <Card className="border border-border bg-card">
                    <CardContent className="p-4">
                      <div className="text-xs font-mono text-muted-foreground mb-2">Routing Order</div>
                      <div className="flex flex-wrap gap-1.5">
                        {((nexusStatus as Record<string, Record<string, unknown>>).providers?.routing_order as string[] ?? []).map((p: string) => (
                          <Badge key={p} variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-sm text-muted-foreground font-mono text-center py-8">Loading NEXUS data…</div>
              )}
            </TabsContent>

            {/* ─── DEFENSE ─── */}
            <TabsContent value="defense" className="mt-4 space-y-3">
              <h2 className="text-sm font-bold text-foreground mb-3">DEFENSE Layer Status</h2>
              {defenseStatus ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard label="Total Events" value={(defenseStatus as Record<string, Record<string, unknown>>).stats?.total_events as number ?? 0} icon={Shield} variant="destructive" />
                    <MetricCard label="Events (24h)" value={(defenseStatus as Record<string, Record<string, unknown>>).stats?.events_24h as number ?? 0} icon={Eye} variant="primary" />
                    <MetricCard label="Blocked (24h)" value={(defenseStatus as Record<string, Record<string, unknown>>).stats?.blocked_24h as number ?? 0} icon={XCircle} variant="destructive" />
                    <MetricCard label="Block Rate" value={(defenseStatus as Record<string, Record<string, unknown>>).stats?.block_rate as string ?? "0%"} icon={AlertTriangle} variant="warning" />
                  </div>
                  <Card className="border border-border bg-card">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-xs font-mono text-muted-foreground">Recent Blocks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      {((defenseStatus as Record<string, unknown>).recent_blocks as Array<Record<string, unknown>> ?? []).slice(0, 5).map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-destructive">Risk: {b.risk as number}</span>
                          <span className="text-muted-foreground">{timeAgo(b.time as string)}</span>
                        </div>
                      ))}
                      {((defenseStatus as Record<string, unknown>).recent_blocks as Array<unknown> ?? []).length === 0 && (
                        <div className="text-xs text-muted-foreground font-mono text-center py-2">No recent blocks</div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-sm text-muted-foreground font-mono text-center py-8">Loading DEFENSE data…</div>
              )}
            </TabsContent>

            {/* ─── TRAFFIC ─── */}
            <TabsContent value="traffic" className="mt-4 space-y-4">
              <h2 className="text-sm font-bold text-foreground mb-3">Traffic & Analytics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard label="Page Views (24h)" value={pageViews24h.toLocaleString()} icon={TrendingUp} variant="warning" />
                <MetricCard label="Active Substrates" value={SUBSTRATES.length} icon={Globe} variant="primary" />
                <MetricCard label="Top Pages Tracked" value={analyticsBreakdown.length} icon={BarChart3} variant="purple" />
              </div>

              {analyticsBreakdown.length > 0 && (
                <Card className="border border-border bg-card">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground">Top Pages (recent 500 events)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-1.5">
                    {analyticsBreakdown.map((p, i) => (
                      <div key={p.page} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-muted-foreground w-4 text-right">{i + 1}.</span>
                          <span className="text-foreground truncate">{p.page}</span>
                        </div>
                        <span className="text-primary font-bold shrink-0">{p.count}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Per-substrate traffic hint */}
              <Card className="border border-border bg-card">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-mono text-muted-foreground">Substrate Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-1.5">
                  {SUBSTRATES.map(s => (
                    <div key={s.key} className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <StatusDot status="healthy" size="sm" />
                        <span className="text-foreground">{s.domain}</span>
                      </div>
                      <a
                        href={`https://${s.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-0.5"
                      >
                        Visit <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border px-4 py-3 text-center">
          <span className="text-[10px] text-muted-foreground font-mono">
            CMPSBL® Control Center · Governor Access Only · Patent Pending · U.S. App. No. 64/029,678
          </span>
        </footer>
      </div>
    </>
  );
}
