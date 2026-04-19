/**
 * FreeValueProposition — v19.1 (Free + Pro)
 * Two-plan funnel. Free is the SDK/CLI + rate-limited Ascension v2.
 * Pro ($29) unlocks unlimited Ascension, all 9 languages, DREAM, Store credits.
 * Enterprise is a quiet /contact link, not a marketed card.
 */

import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles, Terminal, Package, Shield, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const FREE_FEATURES = [
  { icon: Package, text: "@cmpsbl/cli + @cmpsbl/sdk — free forever" },
  { icon: Terminal, text: "Ascension v2 — rate-limited daily runs" },
  { icon: Shield, text: "Core 40 primitives + Crown Jewel system bonuses" },
  { icon: Zap, text: "DECODE unified interface + /verify any fingerprint" },
  { icon: Sparkles, text: "Browse /store, /showroom, /foundry — read-only" },
];

const PRO_UNLOCKS = [
  "Unlimited Ascension v2 runs",
  "All 9 polyglot export languages (TS · Py · Go · Rust · Java · C# · Ruby · PHP · Swift)",
  "Unlimited Mana layer attachment per export",
  "DREAM synthesis — sub-threshold pattern surfacing",
  "Priority restoration queue + Merkle audit chain",
  "Monthly Store credit toward Layers / Meta Engines",
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

        {/* Two-column layout: Free | Pro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Free tier card */}
          <div className="rounded-xl border-2 border-[hsl(var(--neon-cyan)/0.3)] bg-card/50 backdrop-blur-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black text-foreground">$0</span>
              <span className="text-xs text-muted-foreground">/forever</span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-5">Free — everything to start</p>

            {/* Install command */}
            <div className="rounded-lg bg-background border border-border p-3 mb-5 font-mono text-xs">
              <span className="text-muted-foreground">$</span>{" "}
              <span className="text-[hsl(var(--neon-cyan))]">npm install</span>{" "}
              <span className="text-foreground font-semibold">@cmpsbl/sdk @cmpsbl/cli</span>
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

          {/* Pro tier card */}
          <div className="rounded-xl border-2 border-[hsl(var(--neon-purple)/0.4)] bg-gradient-to-b from-card/70 to-card/40 backdrop-blur-sm p-6 sm:p-8 relative ring-1 ring-[hsl(var(--neon-purple)/0.2)]">
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[hsl(var(--neon-purple))] text-white text-[10px] font-bold uppercase tracking-wider">
              <Crown className="w-3 h-3" />
              Recommended
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black text-foreground">$29</span>
              <span className="text-xs text-muted-foreground">/month</span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-5">Pro — unlimited everything</p>

            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
              Everything in Free, plus:
            </p>

            <ul className="space-y-3">
              {PRO_UNLOCKS.map((unlock) => (
                <li key={unlock} className="flex items-start gap-2.5">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--neon-purple)/0.15)] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[hsl(var(--neon-purple))]" />
                  </div>
                  <span className="text-sm text-foreground/90 font-medium leading-snug">{unlock}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="w-full mt-6 bg-[hsl(var(--neon-purple))] text-white hover:bg-[hsl(var(--neon-purple)/0.9)]">
              <Link to="/plans">
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>

            <p className="text-[10px] text-muted-foreground/70 text-center mt-3 font-mono">
              Need custom infrastructure?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Enterprise by contract →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
