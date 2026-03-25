/**
 * Store — Mobile Layout
 * Touch-optimized tabs, full-width cards, compact spacing
 */

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  ShoppingBag, Cpu, Users, Lock, Sparkles, Zap, Rocket, Brain,
  Shield, Layers, Radio, Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/PublicNav";
import { StoreOnboarding } from "@/components/onboarding/StoreOnboarding";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { StoreCollectorDeck } from "@/components/store/StoreCollectorDeck";
import { UpgradeContent } from "@/components/store/UpgradeContent";
import { PacksContent } from "@/components/store/PacksContent";
import {
  STORE_AGENTS, STORE_ENGINES, ALL_STORE_ITEMS, TIER_META,
  type StoreTier,
} from "@/lib/store/catalog";

type FilterMode = "all" | "agents" | "engines";
type StoreTab = "store" | "plans" | "memories";

const TIERS: StoreTier[] = ["free", "starter", "pro", "elite", "apex"];

const SEALED_FEATURES = [
  { label: "4-Tier Auto Memory", desc: "Automatic hot → warm → cool → cold data lifecycle", icon: Brain },
  { label: "Task Orchestrator", desc: "Built-in task delegation and workflow routing", icon: Layers },
  { label: "Always-On Learning", desc: "Continuous self-improvement — even idle", icon: Radio },
  { label: "Sealed Runtime", desc: "Source-protected, memory-isolated execution", icon: Shield },
  { label: "Version Snapshots", desc: "Immutable version frozen at purchase", icon: Sparkles },
  { label: "Encrypted Comms", desc: "Direct owner-to-agent encrypted channel", icon: Eye },
];

const TAB_CONFIG = [
  { value: "store" as const, label: "Store", icon: ShoppingBag },
  { value: "plans" as const, label: "Plans", icon: Rocket },
  { value: "memories" as const, label: "Packs", icon: Brain },
];

const FILTER_CONFIG = [
  { key: "all" as const, label: "All", icon: ShoppingBag, count: ALL_STORE_ITEMS.length },
  { key: "agents" as const, label: "Agents", icon: Users, count: STORE_AGENTS.length },
  { key: "engines" as const, label: "Engines", icon: Cpu, count: STORE_ENGINES.length },
];

export default function StoreMobile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as StoreTab | null;
  const [activeTab, setActiveTab] = useState<StoreTab>(
    tabParam && ["store", "plans", "memories"].includes(tabParam) ? tabParam : "store"
  );
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    if (tabParam && ["store", "plans", "memories"].includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    const tab = value as StoreTab;
    setActiveTab(tab);
    if (tab === "store") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", tab);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const items = filter === "agents" ? STORE_AGENTS
    : filter === "engines" ? STORE_ENGINES
    : ALL_STORE_ITEMS;

  return (
    <>
      <Helmet>
        <title>Store — Runtime Agents, Engines & Plans | CMPSBL</title>
        <meta name="description" content="10 sealed AI products across 5 tiers. Runtime Agents learn and execute. Composable Engines power infrastructure." />
        <link rel="canonical" href="https://cmpsbl.com/store" />
      </Helmet>

      <PublicNav />
      <StoreOnboarding />

      <main className="min-h-screen pt-24 pb-20">
        <div className="px-4">
          {/* Compact Hero */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 border-primary/30 px-3 py-1 inline-flex backdrop-blur-sm">
              <ShoppingBag className="w-3 h-3 mr-1.5 text-primary" />
              <span className="text-[10px] font-semibold tracking-wide">10 Products · 5 Tiers</span>
            </Badge>
            <h1 className="text-3xl font-black tracking-tight mb-3">
              The <span className="text-primary">Store</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Sealed AI software you own forever. Agents learn. Engines power. Pick your tier.
            </p>
          </div>

          {/* Full-width Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="h-11 p-1 bg-card/60 backdrop-blur-md border border-border/40 rounded-xl gap-0.5 w-full max-w-sm">
                {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={cn(
                      "flex-1 gap-1.5 h-9 rounded-lg text-xs font-bold transition-all",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                      "data-[state=inactive]:text-muted-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="store" className="mt-0">
              {/* Horizontal scroll tier badges */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 mb-6">
                {TIERS.map((t) => {
                  const meta = TIER_META[t];
                  return (
                    <div
                      key={t}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-[10px] font-black tracking-wider shrink-0",
                        meta.bg, meta.color, meta.border
                      )}
                    >
                      {meta.label} · {meta.price}
                    </div>
                  );
                })}
              </div>

              {/* Compact filter buttons */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {FILTER_CONFIG.map(({ key, label, icon: Icon, count }) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "gap-1 text-xs font-bold h-10 px-3 rounded-xl",
                      filter === key ? "shadow-md shadow-primary/20" : ""
                    )}
                    onClick={() => setFilter(key)}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    <span className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded-full ml-0.5",
                      filter === key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </Button>
                ))}
              </div>

              <StoreCollectorDeck items={items} />

              {/* Sealed features — 1 column on mobile */}
              <section className="mt-16">
                <div className="rounded-2xl border border-primary/15 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5" />
                  <div className="relative p-5">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-foreground">Every Product Ships Sealed</h2>
                        <p className="text-[11px] text-muted-foreground">Tamper-proof · Self-improving · Yours to own</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {SEALED_FEATURES.map((feat) => (
                        <div
                          key={feat.label}
                          className="flex items-start gap-3 rounded-xl border border-border/30 bg-card/40 p-3.5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <feat.icon className="w-4 h-4 text-primary/80" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{feat.label}</h4>
                            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Bottom CTA */}
              <div className="mt-12 text-center pb-4">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 h-11 rounded-xl"
                    onClick={() => handleTabChange("plans")}
                  >
                    <Zap className="w-4 h-4" />
                    Compare Plans
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2 h-11 rounded-xl" asChild>
                    <Link to="/foundry">
                      <Sparkles className="w-4 h-4" />
                      Explore Memory Stream
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plans" className="mt-0">
              <UpgradeContent />
            </TabsContent>

            <TabsContent value="memories" className="mt-0">
              <PacksContent />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <EnhancedFooter />
    </>
  );
}
