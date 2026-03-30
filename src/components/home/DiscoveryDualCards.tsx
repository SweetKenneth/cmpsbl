/**
 * DiscoveryDualCards — Memory Stream + Ascension counterpart section
 * Explains both systems as two halves of the same substrate,
 * emphasising zero LLM usage — pure internal cording.
 */

import { Link } from "react-router-dom";
import { ArrowRight, Waves, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const CARDS = [
  {
    title: "Memory Stream",
    href: "/foundry",
    icon: Waves,
    glow: "--neon-cyan",
    badge: "Discovery",
    summary:
      "An autonomous 8‑hour cycle that continuously samples, condenses, and crystallises real software from the substrate. Every pull is scored, governed, and export‑ready — no prompts, no triggers, no human in the loop.",
    bullets: [
      "Runs autonomously — never triggered",
      "Quality floor: 68+ CJPI score",
      "Recursive re‑ingestion across cycles",
      "APEX / MYTHIC tier → hardware languages",
    ],
    cta: "Explore Memory Stream",
  },
  {
    title: "Ascension",
    href: "/ascension",
    icon: Zap,
    glow: "--neon-purple",
    badge: "Transformation",
    summary:
      "Upload any code in 25 languages. It enters the 40‑Primitive matrix as Node #41, collides with every Organ, Layer, Engine, and Agent, and surfaces capabilities your software already had — but couldn't see.",
    bullets: [
      "Zero external AI calls — confirmed",
      "25 languages incl. 7 HDLs (VHDL, Verilog…)",
      "CJPI‑scored capability certificates",
      "Sealed Mini‑Runtime™ in every export",
    ],
    cta: "Try Ascension",
  },
] as const;

export function DiscoveryDualCards() {
  return (
    <section
      aria-label="Memory Stream and Ascension"
      className="relative z-10 px-3 sm:px-6 py-16 sm:py-24"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/30 bg-card/30 mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              Two Sides of One Substrate
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-[1.1] mb-4">
            Discovery &amp; Transformation —{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)))",
              }}
            >
              Zero LLM
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            No large‑language model sits between you and your results. Both systems
            run on <span className="text-foreground/90 font-medium">pure internal cording</span>{" "}
            — deterministic, auditable, and governed by the 40‑Primitive mesh.
          </p>
        </div>

        {/* Dual cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="group relative rounded-2xl border border-border/25 bg-card/20 backdrop-blur-sm overflow-hidden hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-primary/[0.04] glass-edge"
            >
              {/* Top accent bar */}
              <div
                className="h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, hsl(var(${card.glow})/0.6), transparent)`,
                }}
              />

              <div className="p-5 sm:p-7">
                {/* Icon + badge row */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2.5 rounded-xl border border-border/20"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(${card.glow})/0.12), hsl(var(${card.glow})/0.04))`,
                    }}
                  >
                    <card.icon
                      className="w-5 h-5"
                      style={{ color: `hsl(var(${card.glow}))` }}
                    />
                  </div>
                  <div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.18em] block mb-0.5"
                      style={{ color: `hsl(var(${card.glow})/0.7)` }}
                    >
                      {card.badge}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground/80 leading-relaxed mb-5">
                  {card.summary}
                </p>

                {/* Bullets */}
                <ul className="space-y-2 mb-6">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground/70">
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                        style={{ background: `hsl(var(${card.glow}))` }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-300">
                  {card.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-[11px] text-muted-foreground/50 mt-6 sm:mt-8">
          Both systems share the same governed substrate. Memory Stream <em>discovers</em> — Ascension <em>transforms</em>. Neither touches an LLM.
        </p>
      </div>
    </section>
  );
}
