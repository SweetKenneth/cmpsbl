/**
 * LoadoutsSection — Signal Forge Loadouts showcase
 * Communicates that these are pre-built, ready-to-deploy projects
 * with zero setup — the substrate's speed advantage
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, Terminal, Zap, Shield, Brain, 
  TrendingUp, Search, Heart, FileText, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const LOADOUTS = [
  {
    id: "threat-detector",
    name: "Threat Detection System",
    primitives: ["DEFENSE", "SHADOW", "NERVE", "BRAIN"],
    category: "Security",
    cjpi: 88,
    tier: "Relic" as const,
    icon: Shield,
  },
  {
    id: "drift-monitor",
    name: "AI Drift Monitor",
    primitives: ["DREAM", "ECHO", "CONSCIENCE", "VISION"],
    category: "Governance",
    cjpi: 91,
    tier: "Mythic" as const,
    icon: Brain,
  },
  {
    id: "research-agent",
    name: "Research Intelligence Agent",
    primitives: ["HARVEST", "BRAIN", "MEMORY", "FORGE"],
    category: "Intelligence",
    cjpi: 94,
    tier: "Apex" as const,
    icon: Search,
  },
  {
    id: "healing-pipeline",
    name: "Self-Healing Pipeline",
    primitives: ["MEDIC", "FAILSAFE", "NERVE", "BEACON"],
    category: "Reliability",
    cjpi: 87,
    tier: "Relic" as const,
    icon: Heart,
  },
  {
    id: "content-engine",
    name: "Autonomous Content Engine",
    primitives: ["ENCODE", "DECODE", "LINGUA", "DREAM"],
    category: "Content",
    cjpi: 79,
    tier: "Prime" as const,
    icon: FileText,
  },
  {
    id: "market-oracle",
    name: "Market Intelligence Oracle",
    primitives: ["ORACLE", "HARVEST", "VISION", "ECHO"],
    category: "Analytics",
    cjpi: 92,
    tier: "Mythic" as const,
    icon: BarChart3,
  },
];

const TIER_STYLES = {
  Apex: "text-[hsl(var(--neon-amber))] border-[hsl(var(--neon-amber)/0.3)]",
  Mythic: "text-[hsl(var(--neon-magenta))] border-[hsl(var(--neon-magenta)/0.3)]",
  Relic: "text-[hsl(var(--neon-cyan))] border-[hsl(var(--neon-cyan)/0.3)]",
  Prime: "text-[hsl(var(--neon-green))] border-[hsl(var(--neon-green)/0.3)]",
} as const;

export function LoadoutsSection() {
  return (
    <section className="relative z-10 px-3 sm:px-4 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/30 bg-card/30 mb-5">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Signal Forge</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">
            Loadouts, Not Templates
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground/70 max-w-2xl mx-auto leading-[1.8] mb-3">
            These aren't starter kits you spend a week configuring. They're{" "}
            <span className="text-foreground/90 font-medium">pre-built, working projects</span>{" "}
            with identity, memory, defense, and governance already wired.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/70 max-w-2xl mx-auto leading-[1.8]">
            One command. Zero setup.{" "}
            <span className="font-mono text-xs text-primary/80 bg-primary/5 px-2 py-0.5 rounded">
              cmpsbl loadout build threat-detector
            </span>
          </p>
        </div>

        {/* Loadout grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {LOADOUTS.map((loadout) => {
            const Icon = loadout.icon;
            const tierStyle = TIER_STYLES[loadout.tier];
            return (
              <div
                key={loadout.id}
                className="group relative rounded-xl border border-border/20 bg-card/20 p-4 sm:p-5 hover:border-primary/25 hover:bg-card/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg border border-border/20 bg-card/40 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                      <Icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground/90 leading-tight">{loadout.name}</h3>
                      <span className="text-xs text-muted-foreground/50 uppercase tracking-wider">{loadout.category}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                    tierStyle
                  )}>
                    {loadout.tier}
                  </span>
                </div>

                {/* Primitives */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {loadout.primitives.map((p, i) => (
                    <span key={p} className="text-[10px] font-mono text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">
                      {p}{i < loadout.primitives.length - 1 ? "" : ""}
                    </span>
                  ))}
                </div>

                {/* CJPI + deploy hint */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/40">
                    CJPI <span className="font-bold text-foreground/60">{loadout.cjpi}</span>
                  </span>
                  <span className="text-[10px] font-mono text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    cmpsbl loadout build {loadout.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Speed callout */}
        <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 via-transparent to-[hsl(var(--neon-cyan)/0.05)] p-5 sm:p-7 text-center mb-6">
          <p className="text-base sm:text-lg font-semibold text-foreground/80 mb-2">
            You can build here faster than anywhere else.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/60 max-w-xl mx-auto">
            No boilerplate. No configuration. No wiring authentication, memory, or monitoring.
            Every loadout ships with the full substrate — persistent memory, governed execution,
            self-healing, and continuous learning — already running.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl font-mono text-sm">
            <a href="https://www.npmjs.com/package/@cmpsbl/cli" target="_blank" rel="noopener noreferrer">
              <Terminal className="w-4 h-4" />
              cmpsbl loadout list
            </a>
          </Button>
          <Button asChild size="lg" className="gap-2 rounded-xl text-sm font-bold">
            <Link to="/foundry">
              Browse Signal Forge
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
