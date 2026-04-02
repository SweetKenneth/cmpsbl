/**
 * Store — Unified product hub with tabs for Store, Plans, and Memories.
 * 5 Runtime Agents + 5 Composable Engines on a single pricing ladder.
 * Collector card style with flip, zoom, and swipe.
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
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
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
  { label: "4-Tier Auto Memory", desc: "Automatic hot → warm → cool → cold data lifecycle — no configuration needed", icon: Brain },
  { label: "Task Orchestrator", desc: "Built-in task delegation, workflow routing, and priority queuing", icon: Layers },
  { label: "Always-On Learning", desc: "Continuous self-improvement — even offline, even idle", icon: Radio },
  { label: "Sealed Runtime", desc: "Source-protected, memory-isolated, tamper-proof execution environment", icon: Shield },
  { label: "Version Snapshots", desc: "Each purchase creates a unique, immutable version frozen at that moment", icon: Sparkles },
  { label: "Encrypted Comms", desc: "Direct owner-to-agent encrypted communication channel", icon: Eye },
];

const TAB_CONFIG = [
  { value: "store" as const, label: "Store", icon: ShoppingBag },
  { value: "plans" as const, label: "Plans", icon: Rocket },
  { value: "memories" as const, label: "Memories", icon: Brain },
];

const FILTER_CONFIG = [
  { key: "all" as const, label: "All Products", shortLabel: "All", icon: ShoppingBag, count: ALL_STORE_ITEMS.length },
  { key: "agents" as const, label: "Runtime Agents", shortLabel: "Agents", icon: Users, count: STORE_AGENTS.length },
  { key: "engines" as const, label: "Engines", shortLabel: "Engines", icon: Cpu, count: STORE_ENGINES.length },
];

export default function Store() {
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
        <meta name="description" content="10 sealed AI products across 5 tiers. Runtime Agents learn and execute. Composable Engines power infrastructure. Pick your tier, own it forever." />
        <link rel="canonical" href="https://cmpsbl.com/store" />
        <meta property="og:title" content="The Store — CMPSBL Runtime Agents, Engines & Plans" />
        <meta property="og:description" content="Sealed AI software you own forever. 10 products, 5 tiers, one pricing ladder. Agents learn. Engines power. Start free." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cmpsbl.com/store" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "CMPSBL Store",
          description: "Runtime Agents and Composable Engines — sealed, self-improving AI software across 5 pricing tiers.",
          url: "https://cmpsbl.com/store",
          publisher: { "@type": "Organization", name: "CMPSBL", url: "https://cmpsbl.com" },
        })}</script>
      </Helmet>

      <PublicNav />
      <StoreOnboarding />

      <main className="min-h-screen pt-28 sm:pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* ═══ HERO ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-10 sm:mb-14"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 border-primary/30 px-4 py-1.5 inline-flex backdrop-blur-sm">
                <ShoppingBag className="w-3.5 h-3.5 mr-2 text-primary" />
                <span className="text-xs font-semibold tracking-wide">10 Products · 5 Tiers · One Platform</span>
              </Badge>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-6">
              The <span className="text-primary">Store</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Sealed AI software you own forever. Agents learn and execute.
              Engines power the infrastructure. Pick your tier.
            </p>
          </motion.div>

          {/* ═══ TABS ═══ */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-10 sm:mb-12"
            >
              <TabsList className="h-12 sm:h-14 p-1.5 bg-card/60 backdrop-blur-md border border-border/40 rounded-2xl gap-1 shadow-lg shadow-background/50">
                {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={cn(
                      "gap-2 px-5 sm:px-7 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all min-w-[100px]",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20",
                      "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            {/* ═══ STORE TAB ═══ */}
            <TabsContent value="store" className="mt-0">
              {/* Pricing ladder */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8"
              >
                {TIERS.map((t, i) => {
                  const meta = TIER_META[t];
                  return (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full border text-xs font-black tracking-wider",
                        "transition-all duration-300 hover:scale-110 cursor-default",
                        "backdrop-blur-sm shadow-sm",
                        meta.bg, meta.color, meta.border
                      )}
                    >
                      {meta.label} · {meta.price}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Filter tabs */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {FILTER_CONFIG.map(({ key, label, shortLabel, icon: Icon, count }) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "gap-1.5 text-xs font-bold min-h-[44px] px-3 sm:px-5 rounded-xl transition-all duration-300",
                      filter === key
                        ? "shadow-lg shadow-primary/25 scale-[1.02]"
                        : "hover:border-primary/30 hover:bg-primary/5"
                    )}
                    onClick={() => setFilter(key)}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{shortLabel}</span>
                    <span className={cn(
                      "ml-1 text-xs font-mono tabular-nums px-1.5 py-0.5 rounded-full",
                      filter === key
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </Button>
                ))}
              </div>

              {/* Collector Deck */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <StoreCollectorDeck items={items} />
              </motion.div>

              {/* Sealed Runtime Features */}
              <motion.section
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mt-20 sm:mt-28"
              >
                <div className="relative rounded-3xl border border-primary/15 overflow-hidden">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                  <div className="relative p-6 sm:p-10">
                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                          Every Product Ships Sealed
                        </h2>
                         <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                           Tamper-proof runtime · Zero maintenance · Always learning · Source-protected
                         </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {SEALED_FEATURES.map((feat, i) => (
                        <motion.div
                          key={feat.label}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06, duration: 0.4 }}
                          className={cn(
                            "group rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-4 sm:p-5",
                            "hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5",
                            "transition-all duration-400"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                              <feat.icon className="w-4 h-4 text-primary/80" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-black text-foreground tracking-tight">
                              {feat.label}
                            </h4>
                          </div>
                          <p className="text-xs text-muted-foreground/70 leading-relaxed pl-11">
                            {feat.desc}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Bottom CTA */}
              <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-16 sm:mt-20 text-center pb-8"
              >
                <p className="text-xs text-muted-foreground/40 font-mono tracking-wider mb-4 uppercase">
                  Every agent and engine runs on the CMPSBL sealed runtime — secure, self-improving, and yours to own
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 min-h-[44px] rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                    asChild
                  >
                    <Link to="/agents">
                      <Users className="w-4 h-4" />
                      Explore All 20 Original Agents
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 min-h-[44px] rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                    asChild
                  >
                    <Link to="/engines">
                      <Cpu className="w-4 h-4" />
                      Discover All Engines
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 min-h-[44px] rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                    onClick={() => handleTabChange("plans")}
                  >
                    <Zap className="w-4 h-4" />
                    Compare Plans
                  </Button>
                </div>
              </motion.section>
            </TabsContent>

            {/* ═══ PLANS TAB ═══ */}
            <TabsContent value="plans" className="mt-0">
              <UpgradeContent />
            </TabsContent>

            {/* ═══ MEMORIES TAB ═══ */}
            <TabsContent value="memories" className="mt-0">
              <div className="max-w-6xl mx-auto">
                {/* Memory Pack Explainer */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10 sm:mb-12"
                >
                  <div className="max-w-3xl mx-auto text-center mb-8">
                    <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-primary/30">
                      <Brain className="w-3 h-3 mr-1.5 inline" />
                      Memory Packs
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                      Capability Packs You Activate
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
                      Memory Packs are curated bundles of cognitive capabilities organized by domain — each pack occupies one slot in your runtime. Activate the packs that match your workflow, deactivate when you need room for others.
                    </p>
                  </div>

                  <div className="max-w-3xl mx-auto grid sm:grid-cols-3 gap-4 mb-8">
                    <div className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Layers className="w-4 h-4 text-primary" />
                        What They Are
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Pre-composed capability bundles spanning strategic domains — from content generation to security hardening. Each pack contains multiple primitives working in concert as a single activatable unit.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Zap className="w-4 h-4 text-neon-green" />
                        How to Use Them
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Browse packs below, activate the ones you need (each uses 1 slot), and they immediately enhance your runtime. Your tier determines how many slots you have — Builder gets 3, Studio gets 6, Creator gets 9, Architect gets 12.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Cpu className="w-4 h-4 text-neon-purple" />
                        Access via NPM
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Active packs are delivered through the{' '}
                        <a href="https://www.npmjs.com/package/@cmpsbl/sdk" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">@cmpsbl/sdk</a>{' '}
                        and{' '}
                        <a href="https://www.npmjs.com/package/@cmpsbl/runtime" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">@cmpsbl/runtime</a>{' '}
                        packages. Install, authenticate, and your active packs are available instantly.
                      </p>
                    </div>
                  </div>

                  <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">npm i @cmpsbl/sdk</code>
                      <span>·</span>
                      <a href="https://www.npmjs.com/org/cmpsbl" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
                        View all 11 packages on NPM →
                      </a>
                    </div>
                  </div>
                </motion.div>

                <PacksContent />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <EnhancedFooter />
    </>
  );
}