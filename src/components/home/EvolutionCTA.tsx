/**
 * EvolutionCTA — Cinematic CTA for the EVOLUTION module
 * Placed directly below the homepage hero. Unique asymmetric design
 * with animated scan lines, orbital ring, and pulsing core.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, RotateCcw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Animated orbital ring SVG
function OrbitalRing() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 opacity-20"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="evo-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="url(#evo-ring-grad)"
        strokeWidth="1"
        strokeDasharray="8 12"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
      <motion.circle
        cx="100"
        cy="100"
        r="70"
        fill="none"
        stroke="url(#evo-ring-grad)"
        strokeWidth="0.5"
        strokeDasharray="4 16"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
    </svg>
  );
}

const pillars = [
  { icon: BarChart3, label: "Scan", desc: "Detect drift & regressions" },
  { icon: Shield, label: "Govern", desc: "Policy-gated approval" },
  { icon: Zap, label: "Evolve", desc: "Apply improvements" },
  { icon: RotateCcw, label: "Rollback", desc: "One-click undo" },
];

export function EvolutionCTA() {
  return (
    <section className="relative z-10 px-4 py-10 sm:py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto"
      >
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/50">
          {/* Background — dark with scan-line texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(var(--primary)) 3px, hsl(var(--primary)) 4px)",
            }}
          />

          {/* Animated vertical scan line */}
          <motion.div
            className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          {/* Glow accents */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-primary/5 blur-[100px]" />

          {/* Content grid — asymmetric layout */}
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-0">
            {/* Left: copy block */}
            <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
              {/* Top badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  EVOLUTION — Live
                </span>
              </motion.div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] mb-4">
                <span className="text-foreground">Your System</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Improves Itself
                </span>
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-lg mb-8 leading-relaxed">
                EVOLUTION is a governed self-improvement loop. It scans for drift,
                previews changes in dry-run, applies upgrades through policy gates,
                and rolls back anything that breaks — automatically.
              </p>

              {/* 4-pillar strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {pillars.map((p, i) => (
                  <motion.div
                    key={p.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/40 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <p.icon className="w-5 h-5 text-primary mb-1.5" />
                    <span className="text-xs font-bold text-foreground">{p.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{p.desc}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all">
                  <Link to="/evolution">
                    <Zap className="w-5 h-5 mr-2" />
                    Open EVOLUTION
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold border-border/50 hover:border-primary/40">
                  <Link to="/developers/guide">
                    Not a vibe coder? Use SDK
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: orbital visual — hidden on small screens */}
            <div className="hidden lg:flex items-center justify-center w-72 xl:w-96 relative">
              <OrbitalRing />

              {/* Pulsing core */}
              <motion.div
                className="relative w-24 h-24 xl:w-32 xl:h-32 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-xl" />
                <div className="relative w-16 h-16 xl:w-20 xl:h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30">
                  <Zap className="w-8 h-8 xl:w-10 xl:h-10 text-primary-foreground" />
                </div>
              </motion.div>

              {/* Floating stats */}
              {[
                { label: "Drift detected", value: "0.3%", x: -20, y: -60 },
                { label: "Auto-fixed", value: "47", x: 40, y: 70 },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="absolute px-3 py-2 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm shadow-lg"
                  style={{ top: `calc(50% + ${stat.y}px)`, left: `calc(50% + ${stat.x}px)` }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  animate={{ y: [0, -6, 0] }}
                >
                  <div className="text-sm font-black text-foreground">{stat.value}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
