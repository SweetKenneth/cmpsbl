/**
 * FactoryPillars — Three-pillar overview for the Software Refurbishment Center
 * Scanners (Memory Stream) · Refurbishment Lab (Ascension) · Specialists (Substrate)
 */

import { Link } from "react-router-dom";
import { Sparkles, Zap, Cpu, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    title: "The Scanners",
    subtitle: "Memory Stream · Discovery",
    icon: Sparkles,
    description: "Autonomous 8-hour cycles that find capabilities nobody asked it to find. Every discovery scored, valued, and placed in the Showroom.",
    stats: [
      { label: "Cycle", value: "8hr" },
      { label: "Exports", value: "25" },
    ],
    href: "/showroom",
    cta: "Browse Showroom",
    glowVar: "--neon-cyan",
  },
  {
    title: "The Refurbishment Lab",
    subtitle: "Ascension · Your Code",
    icon: Zap,
    description: "Bring us your code. We analyze, restore first, and only replace as a last resort. AI as a tool, not a foundation.",
    stats: [
      { label: "Stages", value: "8" },
      { label: "Primitives", value: "Up to 20" },
    ],
    href: "/ascension",
    cta: "Run Diagnostic",
    glowVar: "--neon-magenta",
  },
  {
    title: "The Specialists",
    subtitle: "40 Primitives · Zero AI",
    icon: Cpu,
    description: "Pure algorithmic code. Deterministic. Auditable. Same output every time. The center runs every 8 hours whether anyone is watching.",
    stats: [
      { label: "Primitives", value: "40" },
      { label: "External AI", value: "Zero" },
    ],
    href: "/architecture",
    cta: "Meet Specialists",
    glowVar: "--primary",
  },
] as const;

export function FactoryPillars() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-14 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground mb-2">
            Three Pillars. One Center.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            The scanners find it. The lab refines it. The specialists power it.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              {/* Top accent */}
              <div 
                className="h-0.5" 
                style={{ background: `linear-gradient(90deg, hsl(var(${pillar.glowVar})), hsl(var(${pillar.glowVar}) / 0.3))` }} 
              />

              <div className="p-5 sm:p-6">
                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `hsl(var(${pillar.glowVar}) / 0.1)` }}
                  >
                    <pillar.icon className="w-4 h-4" style={{ color: `hsl(var(${pillar.glowVar}))` }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground leading-tight">{pillar.title}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-medium">{pillar.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed mb-4">
                  {pillar.description}
                </p>

                {/* Stats */}
                <div className="flex gap-2 mb-4">
                  {pillar.stats.map((stat) => (
                    <div key={stat.label} className="flex-1 text-center p-2 rounded-lg bg-secondary/40">
                      <div className="text-xs sm:text-sm font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to={pillar.href}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                >
                  {pillar.cta}
                  <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
