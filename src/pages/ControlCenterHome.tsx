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
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Shield, Brain, Globe, Layers, Zap, Eye,
  ShoppingCart, Sparkles, TrendingUp, Server, AlertTriangle,
  CheckCircle2, XCircle, Clock, ArrowUpRight, RefreshCw,
  BarChart3, MessageSquare, Lock, Crown, Users, Cpu,
  Atom, Clapperboard, Box, Gauge, Terminal, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

/* ─── Theme ─── */
const ACCENT = "hsl(210 100% 55%)";
const BG = "hsl(220 25% 3%)";
const CARD_BG = "hsl(220 20% 6%)";
const BORDER_CLR = "hsl(220 15% 12%)";

/* ─── Substrate registry ─── */
interface SubstrateInfo {
  key: string;
  name: string;
  domain: string;
  icon: LucideIcon;
  accent: string;
}

const SUBSTRATES: SubstrateInfo[] = [
  { key: "core", name: "CMPSBL® Core", domain: "cmpsbl.com", icon: Box, accent: "hsl(210 100% 55%)" },
  { key: "security", name: "CMPSBL CYBER™", domain: "security.cmpsbl.com", icon: Shield, accent: "hsl(0 85% 55%)" },
  { key: "robotics", name: "CMPSBL ROBOTICS™", domain: "robotics.cmpsbl.com", icon: Cpu, accent: "hsl(200 100% 55%)" },
  { key: "quantum", name: "CMPSBL QUANTUM™", domain: "quantum.cmpsbl.com", icon: Atom, accent: "hsl(270 90% 60%)" },
  { key: "llm", name: "CMPSBL LLM™", domain: "llm.cmpsbl.com", icon: Brain, accent: "hsl(160 90% 45%)" },
  { key: "agency", name: "CMPSBL AGENCY™", domain: "agency.cmpsbl.com", icon: Users, accent: "hsl(35 90% 55%)" },
  { key: "media", name: "CMPSBL MEDIA™", domain: "media.cmpsbl.com", icon: Clapperboard, accent: "hsl(330 85% 60%)" },
  { key: "ultimate", name: "CMPSBL ULTIMATE™", domain: "ultimate.cmpsbl.com", icon: Crown, accent: "hsl(270 70% 50%)" },
];

/* ─── Types ─── */
interface SubstrateHealth {
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

interface MarketplaceItem {
  id: string;
  title: string;
  price_cents: number;
  tier: string;
  vertical: string;
  created_at: string;
  purchase_count: number;
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

/* ─── Helpers ─── */
function StatusDot({ status }: { status: string }) {
  const color = status === "healthy" || status === "operational"
    ? "bg-emerald-500" : status === "degraded"
    ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

function MetricCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: LucideIcon; accent?: string; sub?: string;
}) {
  return (
    <Card className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: `${accent ?? ACCENT}15` }}>
          <Icon className="h-5 w-5" style={{ color: accent ?? ACCENT }} />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold font-mono text-white truncate">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
          {sub && <div className="text-[10px] text-gray-600">{sub}</div>}
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

/* ─── Main Component ─── */
export default function ControlCenterHome() {
  useSSORelay();
  const { session, user } = useAuth();
  const navigate = useNavigate();

  // Governor check
  const [isGovernor, setIsGovernor] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [substrateHealth, setSubstrateHealth] = useState<SubstrateHealth[]>([]);
  const [discoveries, setDiscoveries] = useState<DiscoveryItem[]>([]);
  const [intents, setIntents] = useState<IntentItem[]>([]);
  const [nexusStatus, setNexusStatus] = useState<Record<string, unknown> | null>(null);
  const [defenseStatus, setDefenseStatus] = useState<Record<string, unknown> | null>(null);
  const [marketplaceStats, setMarketplaceStats] = useState({ total: 0, avgPrice: 0, recentSales: 0 });
  const [memoryTiers, setMemoryTiers] = useState<{ tier: string; cnt: number }[]>([]);
  const [pageViews24h, setPageViews24h] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

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
      // Parallel data fetches
      const [
        healthRes,
        discoveryRes,
        intentRes,
        nexRes,
        defRes,
        marketRes,
        memRes,
        pvRes,
      ] = await Promise.all([
        // Substrate health via edge function
        supabase.functions.invoke("pf-substrate", { body: { module: "core", action: "status" } }),
        // Recent discoveries
        supabase.from("access_scans").select("id,domain,score,created_at").order("created_at", { ascending: false }).limit(50),
        // Intent mesh
        supabase.from("mesh_intents" as never).select("id,intent_type,source_module,target_module,status,created_at,payload").order("created_at", { ascending: false }).limit(50),
        // NEXUS status
        supabase.functions.invoke("pf-substrate", { body: { module: "nexus", action: "status" } }),
        // DEFENSE status
        supabase.functions.invoke("pf-substrate", { body: { module: "defense", action: "status" } }),
        // Marketplace inventory
        supabase.from("marketplace_inventory" as never).select("id,title,price_cents,tier,vertical,created_at,purchase_count").order("created_at", { ascending: false }).limit(100),
        // Memory tiers
        supabase.rpc("brain_get_tier_counts" as never),
        // Page views last 24h
        supabase.from("site_page_views").select("id", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 86_400_000).toISOString()),
      ]);

      // Process health — run all modules
      const modules = ["core", "defense", "governance", "nexus", "brain", "memory", "evolution", "cortex", "encode", "decode", "economy", "sandbox", "immunity", "intent", "inclusive", "integration", "vision"];
      const healthPromises = modules.map(m =>
        supabase.functions.invoke("pf-substrate", { body: { module: m, action: "status" } })
          .then(r => ({
            module: m,
            health: (r.data as Record<string, unknown>)?.health as number ?? (r.data as Record<string, unknown>)?.health_score as number ?? 0,
            status: (r.data as Record<string, unknown>)?.status as string ?? "unknown",
            latency: (r.data as Record<string, unknown>)?.latency_ms as number ?? 0,
          }))
          .catch(() => ({ module: m, health: 0, status: "error", latency: 0 }))
      );
      const healthResults = await Promise.all(healthPromises);
      setSubstrateHealth(healthResults);

      // Discoveries
      if (discoveryRes.data) {
        setDiscoveries(discoveryRes.data as unknown as DiscoveryItem[]);
      }

      // Intents
      if (intentRes.data) {
        setIntents(intentRes.data as unknown as IntentItem[]);
      }

      // NEXUS
      if (nexRes.data) setNexusStatus(nexRes.data as Record<string, unknown>);

      // DEFENSE
      if (defRes.data) setDefenseStatus(defRes.data as Record<string, unknown>);

      // Marketplace
      if (marketRes.data) {
        const items = marketRes.data as unknown as MarketplaceItem[];
        const paid = items.filter(i => i.price_cents > 0);
        setMarketplaceStats({
          total: items.length,
          avgPrice: paid.length ? Math.round(paid.reduce((a, b) => a + b.price_cents, 0) / paid.length) : 0,
          recentSales: items.filter(i => i.purchase_count > 0).length,
        });
      }

      // Memory
      if (memRes.data) setMemoryTiers((memRes as { data: { tier: string; cnt: number }[] }).data);

      // Page views
      setPageViews24h(pvRes.count ?? 0);

    } catch (e) {
      // Graceful degradation
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isGovernor) fetchAllData();
  }, [isGovernor, fetchAllData]);

  // Computed metrics
  const avgHealth = useMemo(() => {
    if (!substrateHealth.length) return 0;
    return Math.round(substrateHealth.reduce((a, b) => a + b.health, 0) / substrateHealth.length);
  }, [substrateHealth]);

  const totalMemory = useMemo(() => {
    return memoryTiers.reduce((a, b) => a + b.cnt, 0);
  }, [memoryTiers]);

  const healthyCount = useMemo(() => {
    return substrateHealth.filter(h => h.health >= 80).length;
  }, [substrateHealth]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
      <div className="animate-pulse text-gray-500 font-mono text-sm">Authenticating…</div>
    </div>;
  }

  if (!isGovernor) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <Card className="max-w-md border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
            <p className="text-gray-500 text-sm">
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

      <div className="min-h-screen" style={{ background: BG, color: "hsl(210 10% 85%)" }}>
        {/* Header */}
        <header className="border-b px-4 sm:px-6 py-3 flex items-center justify-between" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg" style={{ background: `${ACCENT}20` }}>
              <Terminal className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">CMPSBL® CONTROL CENTER</h1>
              <p className="text-[10px] text-gray-600 font-mono">GOVERNOR · {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono border-emerald-800 text-emerald-400">
              <StatusDot status="healthy" /> <span className="ml-1">LIVE</span>
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-gray-500 hover:text-white"
              onClick={() => fetchAllData()}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        {/* Top metrics row */}
        <div className="px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="System Health" value={`${avgHealth}%`} icon={Activity} accent="hsl(140 70% 45%)" />
            <MetricCard label="Primitives Online" value={`${healthyCount}/${substrateHealth.length}`} icon={Server} accent={ACCENT} />
            <MetricCard label="Memory Objects" value={totalMemory.toLocaleString()} icon={Brain} accent="hsl(270 80% 60%)" />
            <MetricCard label="Traffic (24h)" value={pageViews24h.toLocaleString()} icon={TrendingUp} accent="hsl(45 90% 55%)" />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollArea className="w-full">
              <TabsList className="bg-transparent border rounded-lg p-1 inline-flex w-auto" style={{ borderColor: BORDER_CLR }}>
                {[
                  { id: "overview", label: "Overview", icon: Gauge },
                  { id: "health", label: "Health", icon: Activity },
                  { id: "memory", label: "Memory", icon: Brain },
                  { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
                  { id: "discovery", label: "Discovery", icon: Sparkles },
                  { id: "intents", label: "Intent Mesh", icon: MessageSquare },
                  { id: "nexus", label: "NEXUS", icon: Zap },
                  { id: "defense", label: "DEFENSE", icon: Shield },
                  { id: "traffic", label: "Traffic", icon: BarChart3 },
                ].map(t => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="text-xs font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-1.5 whitespace-nowrap"
                  >
                    <t.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{t.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {/* ─── OVERVIEW ─── */}
            <TabsContent value="overview" className="mt-4 space-y-6">
              {/* Substrate cards */}
              <div>
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" style={{ color: ACCENT }} /> Substrate Fleet
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUBSTRATES.map(s => (
                    <Card key={s.key} className="border cursor-pointer hover:border-primary/30 transition-colors" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <s.icon className="h-4 w-4" style={{ color: s.accent }} />
                            <span className="text-xs font-bold text-white">{s.name}</span>
                          </div>
                          <StatusDot status="healthy" />
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono">{s.domain}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick stats row */}
              <div className="grid sm:grid-cols-3 gap-3">
                <Card className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-gray-500 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" style={{ color: ACCENT }} /> NEXUS Router
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold font-mono text-white">
                      {(nexusStatus as Record<string, Record<string, unknown>>)?.providers?.total as number ?? "—"}
                    </div>
                    <div className="text-[10px] text-gray-600">Providers Available</div>
                    <div className="text-xs text-emerald-400 mt-1 font-mono">
                      Circuit: {(nexusStatus as Record<string, unknown>)?.circuit_state as string ?? "—"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-gray-500 flex items-center gap-1.5">
                      <Shield className="h-3 w-3 text-red-400" /> DEFENSE Layer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold font-mono text-white">
                      {(defenseStatus as Record<string, Record<string, unknown>>)?.stats?.total_events as number ?? "—"}
                    </div>
                    <div className="text-[10px] text-gray-600">Total Events</div>
                    <div className="text-xs text-amber-400 mt-1 font-mono">
                      Blocked 24h: {(defenseStatus as Record<string, Record<string, unknown>>)?.stats?.blocked_24h as number ?? 0}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-mono text-gray-500 flex items-center gap-1.5">
                      <ShoppingCart className="h-3 w-3 text-emerald-400" /> Marketplace
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold font-mono text-white">{marketplaceStats.total}</div>
                    <div className="text-[10px] text-gray-600">Inventory Items</div>
                    <div className="text-xs text-emerald-400 mt-1 font-mono">
                      Avg: ${(marketplaceStats.avgPrice / 100).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Memory tiers */}
              <Card className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-mono text-gray-500 flex items-center gap-1.5">
                    <Brain className="h-3 w-3" style={{ color: "hsl(270 80% 60%)" }} /> Memory Stream Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex gap-4 flex-wrap">
                    {memoryTiers.map(t => (
                      <div key={t.tier} className="text-center">
                        <div className="text-lg font-bold font-mono text-white">{t.cnt.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-500 uppercase font-mono">{t.tier}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── HEALTH ─── */}
            <TabsContent value="health" className="mt-4">
              <h2 className="text-sm font-bold text-white mb-3">Primitive Health Matrix</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {substrateHealth.map(h => (
                  <Card key={h.module} className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusDot status={h.health >= 80 ? "healthy" : h.health >= 50 ? "degraded" : "error"} />
                        <span className="text-xs font-mono font-bold text-white uppercase">{h.module}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {h.latency ? <span className="text-[10px] text-gray-600 font-mono">{h.latency}ms</span> : null}
                        <span className={`text-sm font-bold font-mono ${h.health >= 80 ? "text-emerald-400" : h.health >= 50 ? "text-amber-400" : "text-red-400"}`}>
                          {h.health}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ─── MEMORY STREAM ─── */}
            <TabsContent value="memory" className="mt-4">
              <h2 className="text-sm font-bold text-white mb-3">Memory Stream Status</h2>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {memoryTiers.map(t => (
                  <MetricCard key={t.tier} label={`${t.tier.toUpperCase()} Tier`} value={t.cnt.toLocaleString()} icon={Layers} accent={
                    t.tier === "hot" ? "hsl(0 85% 55%)" :
                    t.tier === "warm" ? "hsl(35 90% 55%)" :
                    t.tier === "cold" ? "hsl(210 80% 55%)" :
                    t.tier === "flat" ? "hsl(160 60% 45%)" : "hsl(0 0% 50%)"
                  } />
                ))}
              </div>
              <Card className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                <CardContent className="p-4">
                  <div className="text-xs text-gray-500 mb-2 font-mono">Total across all tiers</div>
                  <div className="text-3xl font-bold font-mono text-white">{totalMemory.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-600">objects in the Memory Stream</div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ─── MARKETPLACE ─── */}
            <TabsContent value="marketplace" className="mt-4">
              <h2 className="text-sm font-bold text-white mb-3">Marketplace Intelligence</h2>
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <MetricCard label="Total Inventory" value={marketplaceStats.total} icon={ShoppingCart} accent="hsl(160 80% 45%)" />
                <MetricCard label="Avg Price (paid)" value={`$${(marketplaceStats.avgPrice / 100).toFixed(2)}`} icon={TrendingUp} accent="hsl(45 90% 55%)" />
                <MetricCard label="Items Purchased" value={marketplaceStats.recentSales} icon={CheckCircle2} accent="hsl(270 80% 60%)" />
              </div>
            </TabsContent>

            {/* ─── DISCOVERY ─── */}
            <TabsContent value="discovery" className="mt-4">
              <h2 className="text-sm font-bold text-white mb-3">Recent Discoveries</h2>
              <div className="space-y-2">
                {discoveries.length === 0 ? (
                  <div className="text-sm text-gray-600 font-mono py-8 text-center">No recent discoveries</div>
                ) : (
                  discoveries.slice(0, 20).map(d => (
                    <Card key={d.id} className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="text-xs font-mono text-white truncate">{d.domain}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {d.score !== null && (
                            <Badge variant="outline" className="text-[10px] font-mono border-emerald-800 text-emerald-400">
                              {d.score}
                            </Badge>
                          )}
                          <span className="text-[10px] text-gray-600 font-mono">{timeAgo(d.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ─── INTENT MESH ─── */}
            <TabsContent value="intents" className="mt-4">
              <h2 className="text-sm font-bold text-white mb-3">Intent Mesh — Primitive Requests</h2>
              <div className="space-y-2">
                {intents.length === 0 ? (
                  <div className="text-sm text-gray-600 font-mono py-8 text-center">No active intents</div>
                ) : (
                  intents.slice(0, 25).map(intent => (
                    <Card key={intent.id} className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                            <span className="text-xs font-mono font-bold text-white uppercase">{intent.source_module}</span>
                            <ChevronRight className="h-3 w-3 text-gray-600" />
                            <span className="text-xs font-mono text-gray-400 uppercase">{intent.target_module}</span>
                          </div>
                          <Badge variant="outline" className={`text-[10px] font-mono ${
                            intent.status === "resolved" ? "border-emerald-800 text-emerald-400" :
                            intent.status === "pending" ? "border-amber-800 text-amber-400" :
                            "border-gray-700 text-gray-500"
                          }`}>
                            {intent.status}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono">{intent.intent_type} · {timeAgo(intent.created_at)}</div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* ─── NEXUS ─── */}
            <TabsContent value="nexus" className="mt-4">
              <h2 className="text-sm font-bold text-white mb-3">NEXUS Router Status</h2>
              {nexusStatus ? (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <MetricCard label="Providers" value={(nexusStatus as Record<string, Record<string, unknown>>).providers?.total as number ?? 0} icon={Server} accent={ACCENT} />
                    <MetricCard label="Circuit State" value={(nexusStatus as Record<string, unknown>).circuit_state as string ?? "—"} icon={Zap} accent="hsl(140 70% 45%)" />
                    <MetricCard label="Health" value={`${(nexusStatus as Record<string, unknown>).health_score as number ?? 100}%`} icon={Activity} accent="hsl(45 90% 55%)" />
                  </div>
                  <Card className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                    <CardContent className="p-4">
                      <div className="text-xs font-mono text-gray-500 mb-2">Routing Order</div>
                      <div className="flex flex-wrap gap-1.5">
                        {((nexusStatus as Record<string, Record<string, unknown>>).providers?.routing_order as string[] ?? []).map((p: string) => (
                          <Badge key={p} variant="outline" className="text-[10px] font-mono border-blue-800 text-blue-400">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-sm text-gray-600 font-mono text-center py-8">Loading NEXUS data…</div>
              )}
            </TabsContent>

            {/* ─── DEFENSE ─── */}
            <TabsContent value="defense" className="mt-4">
              <h2 className="text-sm font-bold text-white mb-3">DEFENSE Layer Status</h2>
              {defenseStatus ? (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-4 gap-3">
                    <MetricCard label="Total Events" value={(defenseStatus as Record<string, Record<string, unknown>>).stats?.total_events as number ?? 0} icon={Shield} accent="hsl(0 85% 55%)" />
                    <MetricCard label="Events (24h)" value={(defenseStatus as Record<string, Record<string, unknown>>).stats?.events_24h as number ?? 0} icon={Eye} accent={ACCENT} />
                    <MetricCard label="Blocked (24h)" value={(defenseStatus as Record<string, Record<string, unknown>>).stats?.blocked_24h as number ?? 0} icon={XCircle} accent="hsl(0 85% 55%)" />
                    <MetricCard label="Block Rate" value={(defenseStatus as Record<string, Record<string, unknown>>).stats?.block_rate as string ?? "0%"} icon={AlertTriangle} accent="hsl(45 90% 55%)" />
                  </div>
                  <Card className="border" style={{ borderColor: BORDER_CLR, background: CARD_BG }}>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-xs font-mono text-gray-500">Recent Blocks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      {((defenseStatus as Record<string, unknown>).recent_blocks as Array<Record<string, unknown>> ?? []).slice(0, 5).map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-red-400">Risk: {b.risk as number}</span>
                          <span className="text-gray-600">{timeAgo(b.time as string)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-sm text-gray-600 font-mono text-center py-8">Loading DEFENSE data…</div>
              )}
            </TabsContent>

            {/* ─── TRAFFIC ─── */}
            <TabsContent value="traffic" className="mt-4">
              <h2 className="text-sm font-bold text-white mb-3">Traffic & Analytics</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <MetricCard label="Page Views (24h)" value={pageViews24h.toLocaleString()} icon={TrendingUp} accent="hsl(45 90% 55%)" />
                <MetricCard label="Active Substrates" value={SUBSTRATES.length} icon={Globe} accent={ACCENT} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="border-t px-4 py-3 text-center" style={{ borderColor: BORDER_CLR }}>
          <span className="text-[10px] text-gray-700 font-mono">
            CMPSBL® Control Center · Governor Access Only · Patent Pending · U.S. App. No. 64/029,678
          </span>
        </footer>
      </div>
    </>
  );
}