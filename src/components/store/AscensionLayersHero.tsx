/**
 * AscensionLayersHero — cinematic hero for /store
 * Concept: stacked Layer plates absorbing into an apex of light (Ascension).
 * Pure framer-motion + CSS. No backdrop-filter, all themed via tokens.
 */

import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LAYER_PLATES = [
  { label: "L7 · COMPASS",   tone: "from-[hsl(var(--neon-cyan))]/40    to-primary/30",  delay: 0.05 },
  { label: "L6 · NEXUS",     tone: "from-primary/40                    to-accent/30",   delay: 0.10 },
  { label: "L5 · CORTEX",    tone: "from-accent/40                     to-primary/30",  delay: 0.15 },
  { label: "L4 · IMMUNE",    tone: "from-primary/35                    to-[hsl(var(--neon-cyan))]/30", delay: 0.20 },
  { label: "L3 · LEX",       tone: "from-[hsl(var(--neon-cyan))]/35    to-accent/25",   delay: 0.25 },
  { label: "L2 · ASCENSION", tone: "from-primary/60                    to-[hsl(var(--neon-cyan))]/50", delay: 0.30, isCore: true },
  { label: "L1 · CORE",      tone: "from-accent/30                     to-primary/20",  delay: 0.35 },
];

const TITLE_WORDS = ["Enhance", "Your", "Ascension"];

export function AscensionLayersHero() {
  return (
    <section
      aria-label="Specialty Layers — Enhance Your Ascension"
      className="relative isolate overflow-hidden rounded-3xl border border-primary/15 mb-12 sm:mb-16"
      style={{
        background:
          "radial-gradient(ellipse at 50% 110%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(ellipse at 50% 0%, hsl(var(--neon-cyan) / 0.10), transparent 50%), hsl(var(--background))",
      }}
    >
      {/* ━━━ Scanline grid ━━━ */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 50%, black 30%, transparent 75%)",
        }}
      />

      {/* ━━━ Apex light beam ━━━ */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scaleY: 0.3 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] h-full pointer-events-none origin-top"
        style={{
          background:
            "linear-gradient(to bottom, hsl(var(--neon-cyan) / 0.6), hsl(var(--primary) / 0.4) 40%, transparent 80%)",
          boxShadow:
            "0 0 40px hsl(var(--primary) / 0.5), 0 0 80px hsl(var(--neon-cyan) / 0.3)",
        }}
      />

      {/* ━━━ Floating ascension particles ━━━ */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => {
          const left = (i * 73) % 100;
          const dur = 6 + (i % 5) * 1.2;
          const delay = (i * 0.4) % 5;
          const size = 2 + (i % 3);
          return (
            <motion.span
              key={i}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "-20%", opacity: [0, 0.8, 0] }}
              transition={{
                duration: dur,
                delay,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute rounded-full bg-primary/70"
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                boxShadow: `0 0 ${size * 4}px hsl(var(--primary))`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center px-5 sm:px-10 py-12 sm:py-16 lg:py-20">
        {/* ━━━ LEFT — Copy ━━━ */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/5 mb-6"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] text-primary uppercase">
              Specialty Layers · Live
            </span>
          </motion.div>

          {/* Kinetic title */}
          <h1 className="font-black tracking-tight leading-[0.95] text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-5">
            {TITLE_WORDS.map((word, wi) => (
              <span key={wi} className="inline-block mr-3 sm:mr-4 last:mr-0 overflow-hidden align-bottom">
                {word.split("").map((ch, ci) => (
                  <motion.span
                    key={ci}
                    initial={{ y: "120%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{
                      delay: 0.15 + wi * 0.18 + ci * 0.03,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={cn(
                      "inline-block",
                      wi === 2 &&
                        "bg-gradient-to-br from-[hsl(var(--neon-cyan))] via-primary to-accent bg-clip-text text-transparent"
                    )}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-sm sm:text-base lg:text-lg text-muted-foreground/85 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-7"
          >
            Specialty <span className="text-foreground font-semibold">Layers</span> are
            curated capability plates pulled from vertical engines before Ascension absorbs them.
            Stack them onto your substrate to <span className="text-primary font-semibold">enhance every Ascended export</span> —
            sealed, signed, and yours forever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
          >
            <a
              href="#layer-inventory"
              className={cn(
                "group inline-flex items-center gap-2 px-5 py-3 rounded-xl",
                "bg-gradient-to-r from-primary to-[hsl(var(--neon-cyan))] text-primary-foreground",
                "text-xs sm:text-sm font-black tracking-wider shadow-lg shadow-primary/30",
                "hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]",
                "transition-all min-h-[48px]"
              )}
            >
              <Sparkles className="w-4 h-4" />
              BROWSE THE LAYERS
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </a>
            <div className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground/60 uppercase">
              13 Layers · Ranks 21 → 33
            </div>
          </motion.div>
        </div>

        {/* ━━━ RIGHT — Layer stack visual ━━━ */}
        <div className="relative h-[360px] sm:h-[420px] lg:h-[460px] flex items-center justify-center">
          {/* Apex glow */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--neon-cyan) / 0.55), hsl(var(--primary) / 0.3) 40%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />

          {/* The stack — perspective tilt */}
          <div
            className="relative w-full max-w-[420px] h-full"
            style={{ perspective: "1200px" }}
          >
            {LAYER_PLATES.map((plate, i) => {
              const total = LAYER_PLATES.length;
              const yOffset = (i - total / 2) * 38; // vertical stack spacing
              return (
                <motion.div
                  key={plate.label}
                  initial={{ opacity: 0, y: yOffset + 40, rotateX: 35 }}
                  animate={{ opacity: 1, y: yOffset, rotateX: 35 }}
                  transition={{
                    delay: 0.4 + plate.delay,
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    "w-[88%] h-14 sm:h-16 rounded-xl border",
                    "flex items-center justify-between px-4 sm:px-5",
                    "bg-gradient-to-r",
                    plate.tone,
                    plate.isCore
                      ? "border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
                      : "border-border/30"
                  )}
                  style={{
                    transformStyle: "preserve-3d",
                    backgroundColor: "hsl(var(--card) / 0.7)",
                  }}
                >
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase",
                      plate.isCore ? "text-foreground" : "text-foreground/80"
                    )}
                  >
                    {plate.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {plate.isCore && (
                      <span className="text-[8px] font-mono font-black tracking-wider text-primary px-1.5 py-0.5 rounded-md bg-primary/15 border border-primary/30">
                        CORE
                      </span>
                    )}
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                  </div>

                  {/* Subtle floating motion */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{ opacity: [0.2, 0.45, 0.2] }}
                    transition={{
                      duration: 3,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.18), transparent)",
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Vertical "ASCEND" tick marks */}
          <div
            aria-hidden
            className="absolute right-3 sm:right-5 top-6 bottom-6 flex flex-col justify-between items-end pointer-events-none"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-muted-foreground/40 tabular-nums">
                  {String(8 - i).padStart(2, "0")}
                </span>
                <span className="w-3 h-px bg-muted-foreground/30" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom edge gradient */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)",
        }}
      />
    </section>
  );
}
