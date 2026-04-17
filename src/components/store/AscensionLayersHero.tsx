/**
 * AscensionLayersHero — editorial hero for /store
 * Clean, typographic, confident. No cinematic plates or particles.
 */

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AscensionLayersHero() {
  return (
    <section
      aria-label="Specialty Layers"
      className="relative isolate overflow-hidden rounded-3xl border border-border/40 bg-card/40 mb-12 sm:mb-16"
    >
      {/* Soft ambient wash — no animation, no noise */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.10), transparent 70%)",
        }}
      />

      <div className="relative z-10 px-6 sm:px-12 py-16 sm:py-20 lg:py-24 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-background/60 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-muted-foreground uppercase">
            Specialty Layers · Annual
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-black tracking-tight leading-[1.02] text-4xl sm:text-5xl lg:text-6xl mb-5 text-foreground"
        >
          Wrap your software in
          <br />
          <span className="text-primary">a better Layer.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base sm:text-lg text-muted-foreground/85 leading-relaxed max-w-2xl mx-auto mb-8"
        >
          Each Layer is a focused capability — defense, observability, robotics control, agent
          orchestration — that wraps around the software you already ship. Pick one, subscribe by
          the year, and inherit a whole engineering discipline overnight.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#layer-inventory"
            className={cn(
              "group inline-flex items-center gap-2 px-5 py-3 rounded-xl",
              "bg-foreground text-background",
              "text-xs sm:text-sm font-black tracking-wider",
              "hover:bg-foreground/90 active:scale-[0.98] transition-all min-h-[48px]"
            )}
          >
            BROWSE THE LAYERS
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </a>
          <span className="text-[11px] font-mono tracking-wider text-muted-foreground/70 uppercase">
            13 Layers · From $19/yr
          </span>
        </motion.div>
      </div>
    </section>
  );
}
