/**
 * Store — Unified product page for all purchasable items.
 * 5 Runtime Agents + 5 Composable Engines on a single pricing ladder.
 * Collector card style with flip, zoom, and swipe.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ShoppingBag, Cpu, Users, Zap, Lock } from "lucide-react";
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

      <main className="min-h-screen pt-20 pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* ═══ HERO ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 px-4 py-1.5">
              <ShoppingBag className="w-3 h-3 mr-1.5 text-primary" />
              <span className="text-xs font-semibold">10 Products · 5 Tiers</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              The{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--primary)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Store.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Runtime Agents learn, adapt, and execute. Composable Engines power the infrastructure underneath. Pick your tier. Flip to inspect. Acquire what you need.
            </p>

            {/* Pricing ladder */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {TIERS.map((t) => {
                const meta = TIER_META[t];
                return (
                  <div key={t} className={cn("px-3 py-1.5 rounded-full border text-[10px] font-black tracking-wider", meta.bg, meta.color, meta.border)}>
                    {meta.label} · {meta.price}
                  </div>
                );
              })}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center justify-center gap-2">
              {([
                { key: "all" as const, label: "All Products", icon: ShoppingBag },
                { key: "agents" as const, label: "Runtime Agents", icon: Users },
                { key: "engines" as const, label: "Engines", icon: Cpu },
              ]).map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "gap-1.5 text-xs font-bold",
                    filter === key && "shadow-lg shadow-primary/20"
                  )}
                  onClick={() => setFilter(key)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* ═══ COLLECTOR DECK ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StoreCollectorDeck items={items} />
          </motion.div>

          {/* ═══ WHAT'S INCLUDED ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 sm:mt-20 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card/80 to-primary/5 backdrop-blur-sm p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-foreground tracking-tight">
                  Every Product Ships Sealed
                </h2>
                <p className="text-[10px] sm:text-xs text-primary/80 font-semibold">
                  Black-box runtime · Zero maintenance · Always learning
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "4-Tier Auto Memory", desc: "HOT → WARM → COOL → COLD" },
                { label: "RIPPLE Orchestrator", desc: "Internal task flow engine" },
                { label: "Always-On CLM", desc: "24/7 learning, even offline" },
                { label: "Sealed Runtime", desc: "Source-blocked & isolated" },
                { label: "Version Minting", desc: "Unique snapshot at purchase" },
                { label: "DECODE Channel", desc: "Direct communication relay" },
              ].map((feat) => (
                <div key={feat.label} className="rounded-xl border border-border/30 bg-background/30 p-3 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 shimmer-on-hover">
                  <h4 className="text-[11px] font-bold text-foreground mb-0.5">{feat.label}</h4>
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <EnhancedFooter />
    </>
  );
}
