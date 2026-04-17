/**
 * AscensionLayersHero — enterprise cinematic hero with stacked Layer visualization.
 * Refined typography rhythm, premium plate materials, tighter axis system.
 */

import { motion } from "framer-motion";
import { ArrowDown, Shield, Cpu, Eye, Zap, Layers as LayersIcon, Sparkles } from "lucide-react";
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
      className="relative isolate overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card/70 via-background to-card/40 mb-12 sm:mb-16 shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.25)]"
    >
      {/* Top hairline accent */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

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
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12 items-center px-6 sm:px-10 lg:px-16 py-14 sm:py-16 lg:py-20">
        {/* TEXT COLUMN */}
        <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-border/60 bg-background/70 backdrop-blur-sm mb-6 shadow-sm"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 border border-primary/20">
              <LayersIcon className="w-2.5 h-2.5 text-primary" />
            </span>
            <span className="text-[10px] font-mono tracking-[0.25em] text-foreground/70 uppercase">
              Specialty Layers · Annual
            </span>
            <span className="w-px h-3 bg-border/60" />
            <span className="text-[10px] font-mono tracking-wider text-primary/80 uppercase">
              v3.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-black tracking-[-0.02em] leading-[0.98] text-4xl sm:text-5xl lg:text-[3.75rem] mb-5 text-foreground"
          >
            Stack a Layer.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Gain Capabilities Instantly.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[15px] sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-[34rem]"
          >
            Layers are bundled capability modules that wrap around your existing code{"\u00A0—\u00A0"}
            each delivering security, observability, robotics control, and agent orchestration
            without rewriting what you've already built.
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
                "group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl",
                "bg-foreground text-background overflow-hidden",
                "text-xs sm:text-sm font-black tracking-[0.1em]",
                "shadow-[0_8px_24px_-8px_hsl(var(--foreground)/0.5)]",
                "hover:shadow-[0_12px_32px_-8px_hsl(var(--foreground)/0.6)]",
                "active:scale-[0.98] transition-all duration-300 min-h-[48px]"
              )}
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
              />
              <span className="relative">BROWSE THE LAYERS</span>
              <ArrowDown className="relative w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </a>

            <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider text-muted-foreground/80 uppercase">
              <Sparkles className="w-3 h-3 text-primary/60" />
              <span>Annual · Cancel anytime</span>
            </div>
          </motion.div>

          {/* Enterprise trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden sm:flex items-center gap-5 mt-10 pt-6 border-t border-border/40"
          >
            {[
              { label: "Auto-wired" },
              { label: "Zero rewrite" },
              { label: "Stackable" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary/60" />
                <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-muted-foreground/70">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* CINEMATIC LAYER STACK VISUAL */}
        <div className="relative h-[340px] sm:h-[420px] lg:h-[460px] flex items-center justify-center order-last w-full">
          <div
            className="relative w-full max-w-[480px] h-full mx-auto"
            style={{ perspective: "1400px" }}
          >
            {/* LEFT-SIDE VERTICAL AXIS */}
            <div className="absolute left-2 sm:left-4 inset-0 z-20 pointer-events-none">
              {/* Top marker */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute left-0 top-[-6%] flex items-center gap-2"
                style={{ transform: "translateY(calc(-50% + 3px))" }}
              >
                <div className="w-6 h-px bg-gradient-to-r from-primary to-primary/0 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-primary font-bold leading-tight">
                    More Power
                  </span>
                  <span className="text-[8px] font-mono tracking-wider uppercase text-muted-foreground/60 leading-tight mt-0.5">
                    Top of stack
                  </span>
                </div>
              </motion.div>

              {/* Mid marker */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute left-0 top-[30%] flex items-center gap-2"
                style={{ transform: "translateY(calc(-50% + 3px))" }}
              >
                <div className="w-6 h-px bg-gradient-to-r from-foreground/40 to-foreground/0 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-foreground/80 font-bold leading-tight">
                    Stack & Combine
                  </span>
                  <span className="text-[8px] font-mono tracking-wider uppercase text-muted-foreground/60 leading-tight mt-0.5">
                    Mix any disciplines
                  </span>
                </div>
              </motion.div>

              {/* Bottom marker */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="absolute left-0 top-[66%] flex items-center gap-2"
                style={{ transform: "translateY(calc(-50% + 3px))" }}
              >
                <div className="w-6 h-px shrink-0" style={{ background: "linear-gradient(90deg, hsl(45 95% 55%), transparent)" }} />
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase font-bold leading-tight" style={{ color: "hsl(45 95% 55%)" }}>
                    Your Code
                  </span>
                  <span className="text-[8px] font-mono tracking-wider uppercase text-muted-foreground/60 leading-tight mt-0.5">
                    The base layer
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Glow under the stack */}
            <div
              aria-hidden
              className="absolute left-[58%] -translate-x-1/2 bottom-10 w-[55%] h-20 rounded-full blur-3xl opacity-70"
              style={{ background: "hsl(var(--primary) / 0.4)" }}
            />

            {LAYER_PLATES.map((plate, i) => {
              const Icon = plate.icon;
              const isBase = i === 0;
              const yOffset = -i * 52;
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
                  className="absolute left-[60%] top-1/2 w-[72%] sm:w-[68%] h-[32%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border backdrop-blur-sm"
                  style={{
                    transform: `translate(-50%, -50%) translate(0px, ${yOffset}px) rotateX(55deg)`,
                    transformStyle: "preserve-3d",
                    background: isBase
                      ? `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)`
                      : `linear-gradient(135deg, hsl(${plate.hue} 75% 78% / 0.55) 0%, hsl(${plate.hue} 82% 62% / 0.7) 100%)`,
                    borderColor: isBase
                      ? `hsl(var(--border))`
                      : `hsl(${plate.hue} 80% 50% / 0.75)`,
                    boxShadow: isBase
                      ? `0 24px 48px -12px hsl(0 0% 0% / 0.55), inset 0 1px 0 hsl(var(--foreground) / 0.06)`
                      : `0 24px 48px -12px hsl(${plate.hue} 80% 35% / 0.5), inset 0 1px 0 hsl(${plate.hue} 95% 92% / 0.55), inset 0 -1px 0 hsl(${plate.hue} 80% 30% / 0.25)`,
                    zIndex: i + 1,
                  }}
                >
                  {/* Plate label — counter-rotated to face viewer */}
                  <div
                    className="absolute inset-0 flex items-center justify-center px-4"
                    style={{ transform: "rotateX(-55deg) translateZ(2px)" }}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <Icon
                          className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
                          style={{
                            color: `hsl(${plate.hue} 85% 22%)`,
                          }}
                        />
                      )}
                      <span
                        className="text-[10px] sm:text-[12px] font-black tracking-[0.18em] uppercase"
                        style={{
                          color: isBase
                            ? `hsl(var(--foreground))`
                            : `hsl(${plate.hue} 88% 16%)`,
                        }}
                      >
                        {plate.label}
                      </span>
                    </div>
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
                Layers compound
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
