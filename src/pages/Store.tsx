/**
 * Store — Unified product page for all purchasable items.
 * 5 Runtime Agents + 5 Composable Engines on a single pricing ladder.
 * Collector card style with flip, zoom, and swipe.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ShoppingBag, Cpu, Users, Lock, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { StoreCollectorDeck } from "@/components/store/StoreCollectorDeck";
import {
  STORE_AGENTS, STORE_ENGINES, ALL_STORE_ITEMS, TIER_META,
  type StoreTier,
} from "@/lib/store/catalog";

type FilterMode = "all" | "agents" | "engines";

const TIERS: StoreTier[] = ["free", "starter", "pro", "elite", "apex"];

const SEALED_FEATURES = [
  { label: "4-Tier Auto Memory", desc: "HOT → WARM → COOL → COLD lifecycle", icon: "🧠" },
  { label: "RIPPLE Orchestrator", desc: "Internal task delegation & flow engine", icon: "🌊" },
  { label: "Always-On CLM", desc: "Continuous learning, even offline", icon: "📡" },
  { label: "Sealed Runtime", desc: "Source-blocked & fully isolated execution", icon: "🔒" },
  { label: "Version Minting", desc: "Unique snapshot frozen at purchase time", icon: "🪙" },
  { label: "DECODE Channel", desc: "Direct owner-to-agent communication relay", icon: "📨" },
];

export default function Store() {
  const [filter, setFilter] = useState<FilterMode>("all");

  const items = filter === "agents" ? STORE_AGENTS
    : filter === "engines" ? STORE_ENGINES
    : ALL_STORE_ITEMS;

  return (
    <>
      <Helmet>
        <title>Store — CMPSBL Runtime Agents & Engines</title>
        <meta name="description" content="10 products. One pricing ladder. Runtime Agents and Composable Engines — sealed, self-improving AI software you can own." />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* ═══ HERO ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge variant="outline" className="mb-5 border-primary/30 px-4 py-1.5 inline-flex">
              <ShoppingBag className="w-3.5 h-3.5 mr-2 text-primary" />
              <span className="text-xs font-semibold tracking-wide">10 Products · 5 Tiers · One Ladder</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-5">
              The{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Store.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Runtime Agents learn, adapt, and execute autonomously. Composable Engines power the
              infrastructure underneath. Pick your tier. Flip to inspect. Acquire what you need.
            </p>

            {/* Pricing ladder */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
              {TIERS.map((t) => {
                const meta = TIER_META[t];
                return (
                  <div
                    key={t}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-[10px] sm:text-[11px] font-black tracking-wider",
                      "transition-all duration-300 hover:scale-105",
                      meta.bg, meta.color, meta.border
                    )}
                  >
                    {meta.label} · {meta.price}
                  </div>
                );
              })}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center justify-center gap-2">
              {([
                { key: "all" as const, label: "All Products", shortLabel: "All", icon: ShoppingBag },
                { key: "agents" as const, label: "Runtime Agents", shortLabel: "Agents", icon: Users },
                { key: "engines" as const, label: "Engines", shortLabel: "Engines", icon: Cpu },
              ]).map(({ key, label, shortLabel, icon: Icon }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "gap-1.5 text-xs font-bold min-h-[44px] px-3 sm:px-4",
                    filter === key && "shadow-lg shadow-primary/20"
                  )}
                  onClick={() => setFilter(key)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{shortLabel}</span>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* ═══ COLLECTOR DECK ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <StoreCollectorDeck items={items} />
          </motion.div>

          {/* ═══ SEALED RUNTIME FEATURES ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="mt-16 sm:mt-24"
          >
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-primary/5 backdrop-blur-sm p-5 sm:p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                    Every Product Ships Sealed
                  </h2>
                  <p className="text-xs sm:text-sm text-primary/80 font-semibold mt-0.5">
                    Black-box runtime · Zero maintenance · Always learning
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SEALED_FEATURES.map((feat) => (
                  <div
                    key={feat.label}
                    className={cn(
                      "rounded-xl border border-border/30 bg-background/30 p-4",
                      "hover:border-primary/30 hover:-translate-y-0.5",
                      "transition-all duration-300 shimmer-on-hover"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{feat.icon}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">{feat.label}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ═══ BOTTOM CTA ═══ */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 sm:mt-16 text-center pb-8"
          >
            <p className="text-xs text-muted-foreground/50 font-mono mb-3">
              Every agent and engine runs on the CMPSBL Sealed Runtime
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button variant="outline" size="sm" className="gap-2 min-h-[44px]" asChild>
                <a href="/upgrade">
                  <Zap className="w-4 h-4" />
                  Compare Plans
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2 min-h-[44px]" asChild>
                <a href="/try">
                  <Sparkles className="w-4 h-4" />
                  Try Live Demo
                </a>
              </Button>
            </div>
          </motion.section>
        </div>
      </main>

      <EnhancedFooter />
    </>
  );
}
