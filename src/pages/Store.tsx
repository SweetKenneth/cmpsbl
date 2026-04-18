/**
 * Store — Unified product hub with tabs for Store, Plans, and Memories.
 * 5 Runtime Agents + 5 Composable Engines on a single pricing ladder.
 * Collector card style with flip, zoom, and swipe.
 */

import { useState } from "react";
import { StructuredData } from "@/components/seo/StructuredData";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  ShoppingBag, Cpu, Users, Sparkles, Zap, Brain,
  Shield, Layers, Radio, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/PublicNav";
import { StoreOnboarding } from "@/components/onboarding/StoreOnboarding";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { JunkyardCTA } from "@/components/shared/JunkyardCTA";
import { StoreCollectorDeck } from "@/components/store/StoreCollectorDeck";
import { LayerInventory } from "@/components/store/LayerInventory";
import { AscensionLayersHero } from "@/components/store/AscensionLayersHero";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import {
  STORE_AGENTS, STORE_ENGINES, ALL_STORE_ITEMS,
} from "@/lib/store/catalog";

type FilterMode = "all" | "agents" | "engines";

const SEALED_FEATURES = [
  { label: "4-Tier Auto Memory", desc: "Automatic hot → warm → cool → cold data lifecycle — no configuration needed", icon: Brain },
  { label: "Task Orchestrator", desc: "Built-in task delegation, workflow routing, and priority queuing", icon: Layers },
  { label: "Always-On Learning", desc: "Continuous self-improvement — even offline, even idle", icon: Radio },
  { label: "Convex Core™ Sealed Artifact", desc: "Source-protected, memory-isolated, tamper-proof execution environment", icon: Shield },
  { label: "Version Snapshots", desc: "Each purchase creates a unique, immutable version frozen at that moment", icon: Sparkles },
  { label: "Encrypted Comms", desc: "Direct owner-to-agent encrypted communication channel", icon: Eye },
];

const FILTER_CONFIG = [
  { key: "all" as const, label: "All Products", shortLabel: "All", icon: ShoppingBag, count: ALL_STORE_ITEMS.length },
  { key: "agents" as const, label: "Meta Agents", shortLabel: "Agents", icon: Users, count: STORE_AGENTS.length },
  { key: "engines" as const, label: "Meta Engines", shortLabel: "Engines", icon: Cpu, count: STORE_ENGINES.length },
];

export default function Store() {
  const [filter, setFilter] = useState<FilterMode>("all");

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
      <StructuredData
        type="product"
        data={{
          name: "CMPSBL Runtime Agents & Engines",
          description: "10 sealed AI products across 5 tiers. Runtime Agents learn and execute. Composable Engines power infrastructure.",
          url: "https://cmpsbl.com/store",
          price: "0",
          category: "Software",
        }}
      />

      <PublicNav />
      <StoreOnboarding />

      <main className="min-h-screen pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <PublicBreadcrumb />
          </div>

          {/* CINEMATIC HERO */}
          <AscensionLayersHero />

          {/* SECTION 1 — Layers */}
          <section className="mt-12">
            <LayerInventory />
          </section>

          {/* SECTION 2 + 3 — Meta Engines & Meta Agents */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                Meta Engines & Meta Agents
              </h2>
              <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto">
                Premium add-ons that work in CLI, SDK, and standalone — the moat.
              </p>
            </div>

            {/* Filter */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex gap-1 p-1 rounded-xl bg-card/60 border border-border/40">
                {FILTER_CONFIG.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                      filter === key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <StoreCollectorDeck items={items} />
          </motion.section>

          {/* Bottom CTA */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 sm:mt-20 text-center pb-8"
          >
            <p className="text-xs text-muted-foreground/40 font-mono tracking-wider mb-4 uppercase">
              Every layer, engine, and agent attaches to Ascension v2 — sealed, governed, yours
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2 min-h-[44px] rounded-xl" asChild>
                <Link to="/ascension-v2">
                  <Sparkles className="w-4 h-4" />
                  Run Ascension v2
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 min-h-[44px] rounded-xl" asChild>
                <Link to="/plans">
                  <Zap className="w-4 h-4" />
                  Compare Plans
                </Link>
              </Button>
            </div>
          </motion.section>
        </div>
      </main>

      <JunkyardCTA />
      <EnhancedFooter />
    </>
  );
}