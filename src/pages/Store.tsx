/**
 * Store — Single responsive component, all content on all viewports
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
  { value: "memories" as const, label: "Packs", icon: Brain },
];

const FILTER_CONFIG = [
  { key: "all" as const, label: "All", labelLg: "All Products", icon: ShoppingBag, count: ALL_STORE_ITEMS.length },
  { key: "agents" as const, label: "Agents", labelLg: "Runtime Agents", icon: Users, count: STORE_AGENTS.length },
  { key: "engines" as const, label: "Engines", labelLg: "Engines", icon: Cpu, count: STORE_ENGINES.length },
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
        <meta property="og:description" content="Sealed AI software you own forever. 10 products, 5 tiers, one pricing ladder." />
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

      <main className="min-h-screen pt-24 md:pt-32 pb-20 md:pb-24">
        <div className="px-4 md:px-6 max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8 md:mb-14"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4 md:mb-6 border-primary/30 px-3 md:px-4 py-1 md:py-1.5 inline-flex backdrop-blur-sm">
                <ShoppingBag className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5 md:mr-2 text-primary" />
                <span className="text-[10px] md:text-xs font-semibold tracking-wide">10 Products · 5 Tiers · One Platform</span>
              </Badge>
            </motion.div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 md:mb-6">
              The <span className="text-primary">Store</span>
            </h1>

            <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-sm md:max-w-xl mx-auto leading-relaxed">
              Sealed AI software you own forever. Agents learn and execute.
              Engines power the infrastructure. Pick your tier.
            </p>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-8 md:mb-12"
            >
              <TabsList className="h-11 md:h-14 p-1 md:p-1.5 bg-card/60 backdrop-blur-md border border-border/40 rounded-xl md:rounded-2xl gap-0.5 md:gap-1 w-full max-w-sm md:w-auto md:shadow-lg md:shadow-background/50">
                {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={cn(
                      "flex-1 md:flex-none gap-1.5 md:gap-2 h-9 md:h-10 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all md:px-7 md:min-w-[100px]",
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                      "data-[state=inactive]:text-muted-foreground md:data-[state=inactive]:hover:text-foreground md:data-[state=inactive]:hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-3.5 md:w-4 h-3.5 md:h-4" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            <TabsContent value="store" className="mt-0">
              {/* Tier badges — horizontal scroll on mobile, wrap on desktop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="flex items-center gap-2 md:gap-2.5 overflow-x-auto md:overflow-visible scrollbar-hide md:flex-wrap md:justify-center pb-3 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 mb-6 md:mb-8"
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
                        "px-3 md:px-3.5 py-1.5 rounded-full border text-[10px] md:text-[11px] font-black tracking-wider shrink-0",
                        "transition-all duration-300 md:hover:scale-110 cursor-default",
                        "md:backdrop-blur-sm md:shadow-sm",
                        meta.bg, meta.color, meta.border
                      )}
                    >
                      {meta.label} · {meta.price}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Filter buttons */}
              <div className="flex items-center justify-center gap-2 mb-8 md:mb-10">
                {FILTER_CONFIG.map(({ key, label, labelLg, icon: Icon, count }) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "gap-1 md:gap-1.5 text-xs font-bold h-10 md:min-h-[44px] px-3 md:px-5 rounded-xl transition-all duration-300",
                      filter === key
                        ? "shadow-md md:shadow-lg shadow-primary/20 md:shadow-primary/25 md:scale-[1.02]"
                        : "md:hover:border-primary/30 md:hover:bg-primary/5"
                    )}
                    onClick={() => setFilter(key)}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="md:hidden">{label}</span>
                    <span className="hidden md:inline">{labelLg}</span>
                    <span className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded-full ml-0.5 md:ml-1",
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
                className="mt-16 md:mt-28"
              >
                <div className="relative rounded-2xl md:rounded-3xl border border-primary/15 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5" />
                  <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                  <div className="relative p-5 md:p-10">
                    <div className="flex items-start gap-3 md:gap-4 mb-6 md:mb-8">
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Lock className="w-5 md:w-6 h-5 md:h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-base md:text-xl font-black text-foreground tracking-tight">
                          Every Product Ships Sealed
                        </h2>
                        <p className="text-[11px] md:text-sm text-muted-foreground mt-0.5 md:mt-1 leading-relaxed">
                          Tamper-proof runtime · Zero maintenance · Always learning · Source-protected
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-4">
                      {SEALED_FEATURES.map((feat, i) => (
                        <motion.div
                          key={feat.label}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06, duration: 0.4 }}
                          className={cn(
                            "group flex items-start gap-3 rounded-xl md:rounded-2xl border border-border/30 bg-card/40 p-3.5 md:p-5",
                            "md:hover:border-primary/30 md:hover:-translate-y-1 md:hover:shadow-lg md:hover:shadow-primary/5",
                            "md:backdrop-blur-sm transition-all duration-400",
                            "md:flex-col md:items-stretch"
                          )}
                        >
                          <div className="flex items-center gap-3 md:mb-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 md:border md:border-primary/15 flex items-center justify-center shrink-0 md:group-hover:bg-primary/15 transition-colors">
                              <feat.icon className="w-4 h-4 text-primary/80" />
                            </div>
                            <h4 className="text-xs md:text-sm font-bold md:font-black text-foreground md:tracking-tight">{feat.label}</h4>
                          </div>
                          <p className="text-[11px] md:text-xs text-muted-foreground/70 leading-relaxed md:pl-0">
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
                className="mt-12 md:mt-20 text-center pb-4 md:pb-8"
              >
                <p className="hidden md:block text-[10px] text-muted-foreground/40 font-mono tracking-wider mb-4 uppercase">
                  Every agent and engine runs on the CMPSBL sealed runtime — secure, self-improving, and yours to own
                </p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full md:w-auto gap-2 h-11 md:min-h-[44px] rounded-xl md:hover:border-primary/40 md:hover:bg-primary/5 transition-all"
                    onClick={() => handleTabChange("plans")}
                  >
                    <Zap className="w-4 h-4" />
                    Compare Plans
                  </Button>
                  <Button variant="outline" size="sm" className="w-full md:w-auto gap-2 h-11 md:min-h-[44px] rounded-xl md:hover:border-primary/40 md:hover:bg-primary/5 transition-all" asChild>
                    <Link to="/foundry">
                      <Sparkles className="w-4 h-4" />
                      Explore Memory Stream
                    </Link>
                  </Button>
                </div>
              </motion.section>
            </TabsContent>

            <TabsContent value="plans" className="mt-0">
              <UpgradeContent />
            </TabsContent>

            <TabsContent value="memories" className="mt-0">
              <div className="md:max-w-6xl md:mx-auto">
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
