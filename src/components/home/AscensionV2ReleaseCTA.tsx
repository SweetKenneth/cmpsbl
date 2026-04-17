/**
 * AscensionV2ReleaseCTA
 * Announces the Ascension V2 release. Communicates:
 *   - What V2 changes (Mana layer attachment + 20 launch layers)
 *   - What free Builder users can access today
 *   - Supported export languages and what's coming next
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Rocket,
  Code2,
  Hourglass,
} from "lucide-react";
import { TIER_LAYERS, ALWAYS_ON } from "@/lib/ascension-v2/tier-layers";

const V2_BENEFITS = [
  {
    icon: Layers,
    title: "Attachable Layers",
    body:
      "Pick from 20 launch layers and attach them to any codebase during Step 2 — no source modification.",
  },
  {
    icon: ShieldCheck,
    title: "Mana Symbiosis",
    body:
      "Every artifact ships with the Mana runtime so your code stays governed, healed, and observable in production.",
  },
  {
    icon: Sparkles,
    title: "40-Primitive Collision",
    body:
      "Your code becomes Primitive #41 and is collided against the full substrate — fully algorithmic, zero external AI.",
  },
  {
    icon: Rocket,
    title: "Single-File Export",
    body:
      "Download a self-contained artifact with original source, attached layers, activation guide, and tamper-evident receipts.",
  },
] as const;

const SUPPORTED_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "C++",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
] as const;

const COMING_SOON_LANGUAGES = [
  "Verilog",
  "VHDL",
  "SystemVerilog",
  "GLSL",
  "WGSL",
  "Solidity",
  "Move",
  "Cairo",
] as const;

const BUILDER_FREE_LAYERS = TIER_LAYERS.builder;

export function AscensionV2ReleaseCTA() {
  return (
    <section
      aria-label="Ascension V2 release"
      className="relative z-10 px-3 sm:px-4 py-12 sm:py-20"
    >
      <div className="max-w-6xl mx-auto">
        {/* ─── Top banner: release announcement ─── */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-primary/25 shadow-2xl shadow-primary/10">
          {/* Layered ambient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-purple)/0.18)] via-[hsl(var(--neon-cyan)/0.10)] to-[hsl(var(--neon-magenta)/0.16)]" />
          <div className="absolute inset-0 bg-card/50 backdrop-blur-xl" />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--foreground)/0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.4) 1px, transparent 1px)`,
              backgroundSize: "44px 44px",
            }}
          />

          <div className="relative p-6 sm:p-10 md:p-14">
            {/* Header row */}
            <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-primary">
                  New Release · Ascension V2
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.05] max-w-3xl">
                Ascension{" "}
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)))",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  V2 is live
                </span>{" "}
                — attach layers, ascend, ship.
              </h2>

              <p className="mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground/80 leading-relaxed">
                V2 unifies both patents into a single pipeline. Upload your code,
                pick the layers you want attached, and export a hardened
                single-file artifact — all without modifying the original source.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 rounded-xl text-sm font-bold"
                >
                  <Link to="/ascension-v2">
                    <Sparkles className="w-4 h-4" />
                    Try Ascension V2 Free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="gap-2 rounded-xl text-sm"
                >
                  <Link to="/plans">
                    See Tiers & Layers
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* ─── V2 Benefit grid ─── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {V2_BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="rounded-xl border border-border/30 bg-background/40 backdrop-blur-sm p-4 sm:p-5 hover:border-primary/40 hover:bg-background/60 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg border border-border/30 bg-card/50 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1.5">
                      {b.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">
                      {b.body}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ─── Three info columns: Free Builder · Languages · Coming Soon ─── */}
            <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
              {/* Free Builder access */}
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🟢</span>
                  <span className="text-xs font-bold tracking-[0.18em] uppercase text-emerald-300/90">
                    Free · Builder Tier
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mb-3">
                  What you get the moment you sign up
                </p>
                <ul className="space-y-2 text-xs">
                  {BUILDER_FREE_LAYERS.map((l) => (
                    <li
                      key={l.rank}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>
                        <span className="font-semibold text-foreground">
                          {l.name}
                        </span>{" "}
                        <span className="text-muted-foreground/60">
                          ({l.tag})
                        </span>
                      </span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>
                      <span className="font-semibold text-foreground">
                        {ALWAYS_ON.name}
                      </span>{" "}
                      <span className="text-muted-foreground/60">
                        (always-on)
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Full Ascension V2 pipeline access</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Single-file artifact export</span>
                  </li>
                </ul>
              </div>

              {/* Supported languages */}
              <div className="rounded-xl border border-sky-400/30 bg-sky-400/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="w-4 h-4 text-sky-300" />
                  <span className="text-xs font-bold tracking-[0.18em] uppercase text-sky-300/90">
                    Supported Languages
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mb-3">
                  Verified targets shipping today
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <span
                      key={lang}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-sky-400/30 bg-sky-400/5 text-foreground/85"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-3 leading-relaxed">
                  Each export is a self-contained, runnable artifact with the
                  attached layers wired in.
                </p>
              </div>

              {/* Coming soon */}
              <div className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Hourglass className="w-4 h-4 text-fuchsia-300" />
                  <span className="text-xs font-bold tracking-[0.18em] uppercase text-fuchsia-300/90">
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mb-3">
                  Hardware, shader & on-chain targets
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {COMING_SOON_LANGUAGES.map((lang) => (
                    <span
                      key={lang}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/5 text-foreground/85"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-3 leading-relaxed">
                  Unlocks at the Architect tier as Apex/Mythic-class artifacts
                  reach synthesis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
