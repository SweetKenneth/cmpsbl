/**
 * EvolutionCTA — Cinematic CTA for the EVOLUTION system
 * Asymmetric layout with orbital animation and scan-line texture
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
      className="absolute w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 opacity-15"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="evo-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="url(#evo-ring-grad)"
        strokeWidth="0.8"
        strokeDasharray="6 14"
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
      <motion.circle
        cx="100"
        cy="100"
        r="68"
        fill="none"
        stroke="url(#evo-ring-grad)"
        strokeWidth="0.4"
        strokeDasharray="3 18"
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
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
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto"
      >
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border/40 shadow-xl shadow-primary/[0.05] glass-edge">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(var(--primary)) 3px, hsl(var(--primary)) 4px)",
            }}
          />

          {/* Animated scan line — hidden on mobile for perf */}
          <motion.div
            className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden sm:block"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          {/* Glow accents */}
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 w-48 h-48 rounded-full bg-primary/5 blur-[100px]" />

          {/* Content grid */}
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-0">
            {/* Left: copy block */}
            <div className="p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 w-fit mb-5"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-[0.15em]">
                  EVOLUTION — Live
                </span>
              </motion.div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-[1.08] mb-5">
                <span className="text-foreground">Your System</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
                  Improves Itself
                </span>
              </h2>

              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-lg mb-8 leading-relaxed">
                EVOLUTION is the substrate's governed self-improvement loop — powered by the Memory Stream.
                It scans for drift, previews changes in dry-run, applies upgrades through policy gates,
                and rolls back anything that breaks. Intelligence crystallizes automatically.
              </p>

              {/* 4-pillar strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
                {pillars.map((p, i) => (
                  <motion.div
                    key={p.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/25 hover:bg-primary/[0.03] transition-all duration-300 shimmer-on-hover card-lift"
                  >
                    <p.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mb-1.5" />
                    <span className="text-[11px] sm:text-xs font-bold text-foreground">{p.label}</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight mt-0.5">{p.desc}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base font-bold shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Link to="/evolution">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Open EVOLUTION
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 sm:h-13 px-6 sm:px-8 text-sm sm:text-base font-semibold border-border/40 hover:border-primary/30 transition-colors">
                  <Link to="/developers/guide">
                    Integrate via SDK
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: orbital visual */}
            <div className="hidden lg:flex items-center justify-center w-72 xl:w-96 relative">
              <OrbitalRing />

              {/* Pulsing core */}
              <motion.div
                className="relative w-24 h-24 xl:w-32 xl:h-32 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 blur-xl" />
                <div className="relative w-16 h-16 xl:w-20 xl:h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/25">
                  <Zap className="w-8 h-8 xl:w-10 xl:h-10 text-primary-foreground" />
                </div>
              </motion.div>

              {/* Floating stats */}
              {[
                { label: "Drift detected", value: "0.3%", x: -24, y: -64 },
                { label: "Auto-fixed", value: "47", x: 44, y: 72 },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="absolute px-3 py-2 rounded-lg bg-card/90 border border-border/40 backdrop-blur-sm shadow-md shimmer-on-hover"
                  style={{ top: `calc(50% + ${stat.y}px)`, left: `calc(50% + ${stat.x}px)` }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  animate={{ y: [0, -5, 0] }}
                >
                  <div className="text-sm font-black text-foreground leading-none">{stat.value}</div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-wider font-medium mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
