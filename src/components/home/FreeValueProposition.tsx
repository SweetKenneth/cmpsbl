/**
 * FreeValueProposition — Shows what free users get + clear upgrade path
 */

import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Terminal, Package, Shield, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  { icon: Package, text: "All 11 @cmpsbl/* NPM packages — free forever" },
  { icon: Terminal, text: "CLI tools: init, score, export, validate" },
  { icon: Shield, text: "Core 40 primitives (OG Prime access)" },
  { icon: Zap, text: "Basic Ascension — code hardening & defense gates" },
  { icon: Sparkles, text: "Showroom browsing & Open Archive access" },
];

const UPGRADE_TIERS = [
  {
    name: "Studio",
    price: "$29",
    unlock: "6 Business Verticals + Marketplace",
    accent: "border-[hsl(var(--neon-cyan)/0.3)]",
  },
  {
    name: "Creator",
    price: "$49",
    unlock: "5+ Technical Verticals + Priority Queue",
    accent: "border-[hsl(var(--neon-purple)/0.3)]",
    popular: true,
  },
  {
    name: "Architect",
    price: "$79",
    unlock: "ULTIMATE™ — All 143+ Primitives",
    accent: "border-[hsl(var(--neon-magenta)/0.3)]",
  },
];

export function FreeValueProposition() {
  return (
    <section className="relative z-10 px-4 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--neon-cyan)/0.1)] border border-[hsl(var(--neon-cyan)/0.2)] text-[hsl(var(--neon-cyan))] text-xs font-semibold mb-4">
            <Terminal className="w-3.5 h-3.5" />
            Free Forever
          </div>
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
            Start with
            <br />
            <span className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))] bg-clip-text text-transparent">
              Everything You&nbsp;Need
            </span>
          </h2>
           <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto font-medium">
             No credit card. No trial limits. The SDK, CLI, and core substrate are free&nbsp;— permanently.
           </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Free tier card */}
          <div className="rounded-xl border-2 border-[hsl(var(--neon-cyan)/0.3)] bg-card/50 backdrop-blur-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black text-foreground">$0</span>
              <span className="text-xs text-muted-foreground">/forever</span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-5">Free Tier — OG Prime</p>

            {/* Install command */}
            <div className="rounded-lg bg-background border border-border p-3 mb-5 font-mono text-xs">
              <span className="text-muted-foreground">$</span>{" "}
              <span className="text-[hsl(var(--neon-cyan))]">npm install</span>{" "}
              <span className="text-foreground">@cmpsbl/sdk @cmpsbl/cli</span>
            </div>

            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--neon-cyan)/0.15)] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[hsl(var(--neon-cyan))]" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">{f.text}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/auth">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Free — No Card Required
              </Link>
            </Button>
          </div>

          {/* Upgrade tiers */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">
              <Crown className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
              Unlock More Power
            </p>

            {UPGRADE_TIERS.map((t) => (
              <Link
                key={t.name}
                to="/plans"
                className={cn(
                  "block rounded-xl border bg-card/50 backdrop-blur-sm p-4 sm:p-5 hover:bg-card/80 transition-all group",
                  t.accent,
                  t.popular && "ring-1 ring-[hsl(var(--neon-purple)/0.2)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{t.name}</span>
                      <span className="text-lg font-black text-foreground">{t.price}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                      {t.popular && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[hsl(var(--neon-purple)/0.15)] text-[hsl(var(--neon-purple))]">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.unlock}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
            ))}

            <div className="rounded-xl border border-border bg-card/30 p-4 mt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Enterprise</span> — $999+/mo. White-label deployments, custom domains, custom primitives, and dedicated discovery&nbsp;pipelines.{" "}
                <Link to="/enterprise" className="text-primary hover:underline">
                  Learn&nbsp;more&nbsp;→
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
