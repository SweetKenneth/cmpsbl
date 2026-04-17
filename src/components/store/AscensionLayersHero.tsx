/**
 * AscensionLayersHero — cinematic hero with stacked Layer visualization
 * Desktop: text + visual side-by-side. Mobile: text on top, visual below.
 */

import { motion } from "framer-motion";
import { ArrowDown, Shield, Cpu, Eye, Zap, Layers as LayersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const LAYER_PLATES = [
  { label: "YOUR CODE", icon: null, hue: 220, depth: 0 },
  { label: "OBSERVABILITY", icon: Eye, hue: 195, depth: 1 },
  { label: "ROBOTICS CONTROL", icon: Cpu, hue: 280, depth: 2 },
  { label: "DEFENSE", icon: Shield, hue: 340, depth: 3 },
  { label: "ASCENSION", icon: Zap, hue: 45, depth: 4 },
];

export function AscensionLayersHero() {
  return (
    <section
      aria-label="Specialty Layers"
      className="relative isolate overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card/60 via-background to-card/30 mb-12 sm:mb-16"
    >
      {/* Ambient cinematic wash */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 80% 30%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 20% 80%, hsl(var(--primary) / 0.08), transparent 60%)",
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-8 items-center px-6 sm:px-10 lg:px-14 py-14 sm:py-16 lg:py-20">
        {/* TEXT COLUMN */}
        <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-background/60 mb-6"
          >
            <LayersIcon className="w-3 h-3 text-primary" />
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
            Stack a Layer.
            <br />
            <span className="text-primary">Upgrade your software.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base sm:text-lg text-muted-foreground/85 leading-relaxed mb-8"
          >
            Layers are specialty items you wrap around the code you already ship — defense,
            observability, robotics control, agent orchestration. Pick a discipline, subscribe by
            the year, and your software inherits an entire engineering capability overnight.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3"
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
              Annual subscription · Cancel anytime
            </span>

          </motion.div>
        </div>

        {/* CINEMATIC LAYER STACK VISUAL */}
        <div className="relative h-[320px] sm:h-[400px] lg:h-[460px] flex items-center justify-center order-last w-full">
          <div
            className="relative w-full max-w-[420px] h-full mx-auto"
            style={{ perspective: "1400px" }}
          >
            {/* Glow under the stack */}
            <div
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 bottom-10 w-[70%] h-16 rounded-full blur-3xl opacity-60"
              style={{ background: "hsl(var(--primary) / 0.35)" }}
            />

            {LAYER_PLATES.map((plate, i) => {
              const Icon = plate.icon;
              const isBase = i === 0;
              // Stack from bottom (your code) to top (ascension) — centered
              const yOffset = -i * 36;
              const xOffset = 0;
              return (
                <motion.div
                  key={plate.label}
                  initial={{ opacity: 0, y: yOffset + 60, rotateX: 70 }}
                  animate={{
                    opacity: 1,
                    y: [yOffset, yOffset - 4, yOffset],
                    rotateX: 55,
                  }}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.2 + i * 0.12 },
                    rotateX: { duration: 0.8, delay: 0.2 + i * 0.12, ease: "easeOut" },
                    y: {
                      duration: 4 + i * 0.3,
                      delay: 0.8 + i * 0.12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="absolute left-1/2 top-1/2 w-[88%] sm:w-[82%] h-[24%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border backdrop-blur-sm"
                  style={{
                    transform: `translate(-50%, -50%) translate(${xOffset}px, ${yOffset}px) rotateX(55deg)`,
                    transformStyle: "preserve-3d",
                    background: isBase
                      ? `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)`
                      : `linear-gradient(135deg, hsl(${plate.hue} 70% 55% / 0.18) 0%, hsl(${plate.hue} 80% 45% / 0.32) 100%)`,
                    borderColor: isBase
                      ? `hsl(var(--border))`
                      : `hsl(${plate.hue} 80% 60% / 0.5)`,
                    boxShadow: isBase
                      ? `0 20px 40px -10px hsl(0 0% 0% / 0.5)`
                      : `0 20px 40px -10px hsl(${plate.hue} 80% 40% / 0.4), inset 0 1px 0 hsl(${plate.hue} 90% 80% / 0.3)`,
                    zIndex: i + 1,
                  }}
                >
                  {/* Plate label — counter-rotated to face viewer */}
                  <div
                    className="absolute inset-0 flex items-center justify-between px-5"
                    style={{ transform: "rotateX(-55deg) translateZ(2px)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      {Icon && (
                        <Icon
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          style={{
                            color: `hsl(${plate.hue} 90% 75%)`,
                            filter: `drop-shadow(0 0 8px hsl(${plate.hue} 90% 60% / 0.6))`,
                          }}
                        />
                      )}
                      <span
                        className="text-[10px] sm:text-[11px] font-black tracking-[0.18em] uppercase text-white drop-shadow-lg"
                        style={{
                          textShadow: isBase
                            ? "0 1px 4px hsl(0 0% 0% / 0.8)"
                            : `0 0 12px hsl(${plate.hue} 90% 50% / 0.6), 0 1px 3px hsl(0 0% 0% / 0.9)`,
                        }}
                      >
                        {plate.label}
                      </span>
                    </div>
                    {!isBase && (
                      <span
                        className="text-[9px] font-mono tracking-wider opacity-70"
                        style={{ color: `hsl(${plate.hue} 80% 80%)` }}
                      >
                        L{plate.depth}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Caption beneath stack */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute bottom-0 left-0 right-0 text-center"
            >
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-foreground/70">
                ↑ Each Layer compounds ↑
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
