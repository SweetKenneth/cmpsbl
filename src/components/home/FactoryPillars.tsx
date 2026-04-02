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
    subtitle: "Memory Stream · The Showroom",
    icon: Sparkles,
    description: "An autonomous 8-hour discovery cycle that finds capabilities nobody asked it to find. Every discovery scored, valued, and placed in the showroom. Search by problem. Find your solution.",
    stats: [
      { label: "Discovery Cycle", value: "8hr" },
      { label: "Export Languages", value: "25" },
      { label: "Showroom", value: "Growing" },
    ],
    href: "/showroom",
    cta: "Browse the Showroom",
    gradient: "from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-purple))]",
    glowVar: "--neon-cyan",
  },
  {
    title: "The Refurbishment Lab",
    subtitle: "Ascension · Your Code",
    icon: Zap,
    description: "Bring us your code. We analyze it, reimagine the possibilities, and restore first — only offering replacements as a last resort. We embrace AI as a tool, not as a foundation.",
    stats: [
      { label: "Pipeline Stages", value: "8" },
      { label: "Primitives/Run", value: "Up to 20" },
      { label: "Downtime", value: "Zero" },
    ],
    href: "/ascension",
    cta: "Book a Consultation",
    gradient: "from-[hsl(var(--neon-magenta))] to-[hsl(var(--primary))]",
    glowVar: "--neon-magenta",
  },
  {
    title: "The Specialists",
    subtitle: "Substrate · 40 Primitives",
    icon: Cpu,
    description: "The 40 specialists who make everything possible. Pure algorithmic code — zero external AI. Deterministic. Auditable. Same output every time. The center runs every 8 hours whether anyone is watching.",
    stats: [
      { label: "Primitives", value: "40" },
      { label: "External AI", value: "Zero" },
      { label: "Zenodo DOIs", value: "3" },
    ],
    href: "/architecture",
    cta: "Meet the Specialists",
    gradient: "from-[hsl(var(--primary))] to-[hsl(var(--neon-cyan))]",
    glowVar: "--primary",
  },
] as const;

export function FactoryPillars() {
  return (
    <section className="relative z-10 px-3 sm:px-6 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-3">
            Three Pillars. One Center.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            The scanners find it. The lab refines it. The specialists make it all possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-500"
            >
              {/* Top gradient bar */}
              <div className={cn("h-1 bg-gradient-to-r", pillar.gradient)} />

              <div className="p-6 sm:p-8">
                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `hsl(var(${pillar.glowVar}) / 0.1)` }}
                  >
                    <pillar.icon className="w-5 h-5" style={{ color: `hsl(var(${pillar.glowVar}))` }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{pillar.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{pillar.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground/80 leading-relaxed mb-6">
                  {pillar.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {pillar.stats.map((stat) => (
                    <div key={stat.label} className="text-center p-2 rounded-lg bg-secondary/50">
                      <div className="text-sm font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to={pillar.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                >
                  {pillar.cta}
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
