/**
 * DiscoveryDualCards — Memory Stream + Ascension counterpart section
 * Explains both systems as two halves of the same substrate,
 * emphasising zero LLM usage — pure internal cording.
 */

import { Link } from "react-router-dom";
import { ArrowRight, Waves, Zap, ShieldCheck } from "lucide-react";

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
      {/* Ambient glow behind the section */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-1/3 w-80 h-80 rounded-full bg-[radial-gradient(circle,_hsl(var(--neon-cyan)/0.06)_0%,_transparent_70%)]" />
        <div className="absolute right-1/4 bottom-1/3 w-80 h-80 rounded-full bg-[radial-gradient(circle,_hsl(var(--neon-purple)/0.06)_0%,_transparent_70%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/30 bg-card/40 backdrop-blur-sm mb-5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
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
              className="group relative rounded-2xl border border-border/25 bg-card/30 backdrop-blur-md overflow-hidden hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-400 shadow-lg shadow-primary/[0.04] hover:shadow-xl hover:shadow-primary/[0.08]"
            >
              {/* Top accent bar — wider with gradient fade */}
              <div
                className="h-[3px]"
                style={{
                  background: `linear-gradient(90deg, transparent 5%, hsl(var(${card.glow})/0.7) 30%, hsl(var(${card.glow})/0.5) 70%, transparent 95%)`,
                }}
              />

              <div className="p-5 sm:p-7">
                {/* Icon + badge row */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="p-3 rounded-xl border border-border/20 shadow-sm group-hover:scale-105 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(${card.glow})/0.14), hsl(var(${card.glow})/0.04))`,
                      boxShadow: `0 4px 20px hsl(var(${card.glow})/0.08)`,
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
                    <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {card.title}
                    </h3>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground/80 leading-relaxed mb-5">
                  {card.summary}
                </p>

                {/* Bullets — enhanced with better spacing */}
                <ul className="space-y-2.5 mb-6">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-xs text-muted-foreground/75">
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-transparent"
                        style={{
                          background: `hsl(var(${card.glow}))`,
                          boxShadow: `0 0 6px hsl(var(${card.glow})/0.4)`,
                        }}
                      />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — upgraded to pill button style */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 group-hover:gap-3"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(${card.glow})/0.1), hsl(var(${card.glow})/0.05))`,
                    color: `hsl(var(${card.glow}))`,
                    border: `1px solid hsl(var(${card.glow})/0.2)`,
                  }}
                >
                  {card.cta}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Bottom corner glow on hover */}
              <div
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, hsl(var(${card.glow})/0.08), transparent 70%)`,
                }}
              />
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
