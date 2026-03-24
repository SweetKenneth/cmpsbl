/**
 * EnginesCTA — Cinematic call-to-action for the 20 Composable Engines
 * Uses solid neon colors; gradient reserved only for the top memory-stream bar
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Lock, Cpu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ENGINE_HIGHLIGHTS = [
  { name: "DREAM", desc: "Offline learning cycles", tier: "Engine" },
  { name: "HARVEST", desc: "Intelligence compounding", tier: "Engine" },
  { name: "FORGE", desc: "Capability crystallization", tier: "Engine" },
  { name: "LINGUA", desc: "Multilingual processing", tier: "Engine" },
  { name: "ECHO", desc: "Signal replay & analysis", tier: "Engine" },
  { name: "PHANTOM", desc: "Shadow testing runtime", tier: "Engine" },
  { name: "SANDBOX", desc: "Isolated execution", tier: "Engine" },
  { name: "RIPPLE", desc: "Event-driven orchestration", tier: "Engine" },
];

const TIER_DOT: Record<string, string> = {
  Engine: "bg-[hsl(var(--neon-cyan))]",
};

export function EnginesCTA() {
  return (
    <section className="relative z-10 px-3 sm:px-4 py-12 sm:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/40"
        >
          {/* Solid background */}
          <div className="absolute inset-0 bg-[hsl(var(--stream-slate))]" />

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--neon-cyan) / 0.5) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--neon-cyan) / 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Glow accents — solid, no gradient */}
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] animate-hero-orb-1 hidden sm:block"
            style={{ background: "hsl(var(--neon-purple) / 0.08)" }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[80px] animate-hero-orb-3 hidden sm:block"
            style={{ background: "hsl(var(--neon-cyan) / 0.06)" }}
          />

          {/* Top accent bar — memory-stream (one of the few allowed gradients) */}
          <div className="h-[2px] memory-stream-bar opacity-40" />
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.2), transparent)' }} />

          <div className="relative p-5 sm:p-10 md:p-14 space-y-8 sm:space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(var(--neon-cyan)/0.2)] bg-[hsl(var(--neon-cyan)/0.05)] mb-3"
                >
                  <Lock className="w-3 h-3 text-[hsl(var(--neon-cyan))]" />
                  <span className="text-[10px] font-mono tracking-widest text-[hsl(var(--neon-cyan))] uppercase">Substrate Engines · Processing Powerhouses</span>
                </motion.div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2">
                  8 Composable <span className="text-[hsl(var(--neon-cyan))]">Engines</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed">
                  Processing powerhouses invoked for complex tasks — offline learning, capability discovery, 
                  event orchestration, and isolated execution. Each Engine is sealed and purpose-built.
                </p>
              </div>
            </div>

            {/* Engine highlights grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {ENGINE_HIGHLIGHTS.map((engine, i) => (
                <motion.div
                  key={engine.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="group rounded-xl border border-border/30 bg-card/50 p-3 sm:p-4 hover:border-[hsl(var(--neon-cyan)/0.3)] hover:bg-[hsl(var(--neon-cyan)/0.03)] transition-all duration-300 shimmer-on-hover card-lift"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full", TIER_DOT[engine.tier])} />
                    <span className="text-xs font-bold tracking-wide text-foreground">{engine.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{engine.desc}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-14">
              {[
                { icon: Shield, value: "20", label: "Sealed Engines", color: "text-[hsl(var(--neon-magenta))]" },
                { icon: Cpu, value: "3", label: "Clearance Tiers", color: "text-[hsl(var(--neon-purple))]" },
                { icon: Zap, value: "120+", label: "Capabilities", color: "text-[hsl(var(--neon-cyan))]" },
              ].map((stat) => (
                <div key={stat.label} className="text-center group/stat hover:-translate-y-0.5 transition-transform duration-300">
                  <stat.icon className={cn("w-5 h-5 mx-auto mb-1.5 group-hover/stat:scale-110 transition-transform duration-300", stat.color)} />
                  <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-foreground">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="gap-2 px-6 sm:px-8 h-12 sm:h-13 text-sm sm:text-base font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all bg-[hsl(var(--neon-cyan))] text-white border-0 hover:bg-[hsl(var(--neon-cyan)/0.9)]"
              >
                <Link to="/store">
                  <Shield className="w-4 h-4" />
                  Browse the Store
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 px-6 sm:px-8 h-12 sm:h-13 text-sm sm:text-base font-semibold rounded-xl border-border/60 hover:border-[hsl(var(--neon-cyan)/0.4)] hover:bg-[hsl(var(--neon-cyan)/0.03)] transition-all"
              >
                <Link to="/engines/architect">
                  <Cpu className="w-4 h-4" />
                  ARCHITECT — The Mega-Engine
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
