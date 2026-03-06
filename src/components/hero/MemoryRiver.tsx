/**
 * Memory River — The anti-chatbot hero visualization
 * Intelligence that compounds instead of restarting.
 * 
 * Particles flow left-to-right using CSS @keyframes for buttery performance.
 * Dream arcs upward, Defense diverts, Crystallized solidifies.
 * Mobile-first, DOM-based (no canvas).
 */

import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ParticleType = "memory" | "dream" | "defense" | "crystallized" | "signal";

const COLORS: Record<ParticleType, string> = {
  memory: "var(--neon-cyan)",
  dream: "var(--neon-purple)",
  defense: "var(--neon-magenta)",
  crystallized: "var(--primary)",
  signal: "var(--muted-foreground)",
};

// ─── CSS Keyframes (injected once) ──────────────────────────────
const KEYFRAMES_CSS = `
@keyframes river-flow {
  0%   { left: -5%; opacity: 0; }
  5%   { opacity: 0.8; }
  90%  { opacity: 0.8; }
  100% { left: 105%; opacity: 0; }
}
@keyframes river-dream {
  0%   { left: -5%; top: 48%; opacity: 0; }
  5%   { opacity: 0.9; }
  25%  { top: 22%; }
  50%  { top: 12%; }
  75%  { top: 22%; }
  90%  { opacity: 0.9; }
  100% { left: 105%; top: 48%; opacity: 0; }
}
@keyframes river-defense {
  0%   { left: -5%; top: 35%; opacity: 0; }
  5%   { opacity: 0.9; }
  40%  { top: 35%; }
  55%  { top: 72%; }
  70%  { top: 62%; }
  90%  { opacity: 0.9; top: 50%; }
  100% { left: 105%; opacity: 0; }
}
@keyframes crystal-pulse {
  0%, 100% { box-shadow: 0 0 12px 2px hsl(var(--primary) / 0.2), 0 0 4px 1px hsl(var(--primary) / 0.1); }
  50%      { box-shadow: 0 0 28px 8px hsl(var(--primary) / 0.45), 0 0 8px 2px hsl(var(--primary) / 0.3); }
}
@keyframes river-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
@keyframes river-breathe {
  0%, 100% { opacity: 0.04; }
  50%      { opacity: 0.09; }
}
`;

// ─── Style injector ─────────────────────────────────────────────
function RiverStyles() {
  return <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />;
}

// ─── Crystallized Node ──────────────────────────────────────────
const CrystallizedNode = memo(function CrystallizedNode({
  label, position, delay,
}: { label: string; position: number; delay: number }) {
  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1 pointer-events-none z-10"
      style={{ left: `${position}%`, top: "50%", transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Outer ring */}
      <div className="relative">
        <div
          className="absolute -inset-1.5 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)" }}
        />
        <div
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm rotate-45 border border-primary/60"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.06))",
            animation: "crystal-pulse 3s ease-in-out infinite",
            animationDelay: `${delay * 0.3}s`,
          }}
        />
      </div>
      <span className="text-[7px] sm:text-[8px] font-bold text-primary/50 tracking-[0.15em] uppercase whitespace-nowrap mt-0.5">
        {label}
      </span>
    </motion.div>
  );
});

// ─── CSS-Animated Particle ──────────────────────────────────────
const Particle = memo(function Particle({
  type, delay, row, duration,
}: { type: ParticleType; delay: number; row: number; duration: number }) {
  const isSignal = type === "signal";
  const isDream = type === "dream";
  const isDefense = type === "defense";
  
  const size = isSignal ? 3 : type === "crystallized" ? 8 : 6;
  const top = 28 + row * 16;
  const color = `hsl(${COLORS[type]})`;

  const animName = isDream ? "river-dream" : isDefense ? "river-defense" : "river-flow";
  const glow = isSignal ? "none" : `0 0 ${isDream ? 14 : 10}px 2px ${color}`;

  return (
    <div
      className="absolute rounded-full pointer-events-none z-[5]"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: glow,
        top: isDream || isDefense ? undefined : `${top}%`,
        left: "-5%",
        opacity: 0,
        animation: `${animName} ${duration}s linear ${delay}s infinite`,
      }}
    >
      {/* Trail line */}
      {!isSignal && (
        <div
          className="absolute top-1/2 right-full -translate-y-1/2 h-[1px] rounded-full"
          style={{
            width: isDream ? 24 : isDefense ? 16 : 12,
            background: `linear-gradient(to left, ${color}, transparent)`,
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
});

// ─── River Channel ──────────────────────────────────────────────
function RiverChannel() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Breathing ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, hsl(var(--neon-cyan) / 0.04) 0%, transparent 60%),
                       radial-gradient(ellipse at 70% 40%, hsl(var(--neon-purple) / 0.03) 0%, transparent 50%)`,
          animation: "river-breathe 5s ease-in-out infinite",
        }}
      />
      {/* Gradient band */}
      <div
        className="absolute left-0 right-0 top-[18%] bottom-[18%]"
        style={{
          background: `linear-gradient(180deg,
            transparent 0%,
            hsl(var(--primary) / 0.03) 20%,
            hsl(var(--primary) / 0.08) 50%,
            hsl(var(--primary) / 0.03) 80%,
            transparent 100%
          )`,
        }}
      />
      {/* Flow lines */}
      {[28, 44, 60].map((top, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-px"
          style={{
            top: `${top}%`,
            background: `linear-gradient(90deg, transparent 0%, hsl(var(--neon-cyan) / 0.06) 10%, hsl(var(--primary) / 0.18) 50%, hsl(var(--neon-purple) / 0.06) 90%, transparent 100%)`,
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3.5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}
      {/* Shimmer sweep */}
      <div className="absolute top-[28%] bottom-[28%] left-0 right-0 overflow-hidden">
        <div
          className="absolute inset-0 w-[30%] h-full"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.05), hsl(var(--primary) / 0.07), transparent)",
            animation: "river-shimmer 5s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────
export const MemoryRiver = memo(function MemoryRiver({ crystallizing: externalCrystallizing, autoCrystallize = false }: { crystallizing?: boolean; autoCrystallize?: boolean }) {
  const [autoPulse, setAutoPulse] = useState(false);
  const [ghostPipelines, setGhostPipelines] = useState<
    { id: number; x: number; delay: number }[]
  >([]);
  const crystallizing = externalCrystallizing || autoPulse;

  useEffect(() => {
    if (!autoCrystallize || externalCrystallizing) return;
    const schedule = () => 6000 + Math.random() * 6000;
    const repeat = () => 8000 + Math.random() * 8000;

    let timeout: ReturnType<typeof setTimeout>;
    const pulse = () => {
      setAutoPulse(true);
      setTimeout(() => setAutoPulse(false), 2200);

      const id = Date.now();
      setGhostPipelines(prev => [
        ...prev,
        { id, x: 20 + Math.random() * 60, delay: Math.random() * 0.4 },
      ]);
      setTimeout(() => {
        setGhostPipelines(prev => prev.filter(p => p.id !== id));
      }, 4000);

      timeout = setTimeout(pulse, repeat());
    };
    timeout = setTimeout(pulse, schedule());
    return () => clearTimeout(timeout);
  }, [autoCrystallize, externalCrystallizing]);
  const particles = useMemo(() => {
    const w: { id: number; type: ParticleType; delay: number; row: number; duration: number }[] = [];
    let id = 0;
    // Signal flow (background)
    for (let i = 0; i < 12; i++)
      w.push({ id: id++, type: "signal", delay: i * 0.7, row: i % 3, duration: 4.5 + (i % 3) * 0.5 });
    // Memory
    for (let i = 0; i < 6; i++)
      w.push({ id: id++, type: "memory", delay: 0.2 + i * 1.8, row: i % 3, duration: 6.5 });
    // Dream arcs
    w.push({ id: id++, type: "dream", delay: 1, row: 1, duration: 8 });
    w.push({ id: id++, type: "dream", delay: 5, row: 0, duration: 9 });
    w.push({ id: id++, type: "dream", delay: 9.5, row: 2, duration: 7.5 });
    // Defense
    w.push({ id: id++, type: "defense", delay: 2.5, row: 0, duration: 5.5 });
    w.push({ id: id++, type: "defense", delay: 7, row: 2, duration: 6 });
    // Crystallized
    w.push({ id: id++, type: "crystallized", delay: 1.5, row: 1, duration: 9 });
    w.push({ id: id++, type: "crystallized", delay: 6, row: 0, duration: 10 });
    return w;
  }, []);

  const crystals = useMemo(() => [
    { label: "SEP-001", position: 24, delay: 2 },
    { label: "SEP-042", position: 50, delay: 3 },
    { label: "SEP-077", position: 76, delay: 4 },
  ], []);

  return (
    <div className="w-full max-w-full mx-auto lg:max-w-none overflow-hidden">
      <RiverStyles />

      {/* Tagline */}
      <motion.p
        className="text-center text-[9px] sm:text-[10px] text-muted-foreground/35 font-semibold tracking-[0.25em] uppercase mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        No resets · No forgetting · No clock
      </motion.p>

      {/* River */}
      <motion.div
        className="relative w-full h-36 sm:h-36 md:h-48 lg:h-52 rounded-lg sm:rounded-xl overflow-hidden border border-border/20 bg-background/30"
        initial={{ opacity: 0, scaleY: 0.7 }}
        animate={{
          opacity: 1,
          scaleY: 1,
          boxShadow: crystallizing
            ? "0 0 120px -20px hsl(var(--primary) / 0.4), inset 0 1px 0 hsl(var(--primary) / 0.1)"
            : "0 0 80px -30px hsl(var(--primary) / 0.12), inset 0 1px 0 hsl(var(--primary) / 0.04)",
        }}
        transition={crystallizing
          ? { boxShadow: { duration: 0.6, ease: "easeOut" } }
          : { delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
        }
      >
        {/* Convergence pulse overlay */}
        <AnimatePresence>
          {crystallizing && (
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 0.6, scale: 0.5 }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.35), transparent 70%)",
              }}
            />
          )}
        </AnimatePresence>
        <RiverChannel />
        {particles.map((p) => <Particle key={p.id} {...p} />)}

        {/* Ghost pipeline drift nodes */}
        {ghostPipelines.map(p => (
          <div
            key={p.id}
            className="absolute z-[15] pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: "20%",
              animation: `ghostDrift 3.5s ease-in ${p.delay}s forwards`,
            }}
          >
            <div
              className="w-3 h-3 rounded-sm rotate-45 border border-primary/40"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))",
                boxShadow: "0 0 12px 2px hsl(var(--primary) / 0.15)",
              }}
            />
          </div>
        ))}
        {crystals.map((c) => <CrystallizedNode key={c.label} {...c} />)}

        {/* Left origin glow */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 sm:w-14 pointer-events-none z-[8]"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.1), transparent)" }}
        />
        <motion.div
          className="absolute left-0.5 top-[30%] bottom-[30%] w-1 rounded-full pointer-events-none z-[9]"
          style={{ background: "hsl(var(--primary) / 0.35)" }}
          animate={{ opacity: [0.3, 0.7, 0.3], scaleY: [0.85, 1.15, 0.85] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Right infinity fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 pointer-events-none z-[8]"
          style={{ background: "linear-gradient(270deg, hsl(var(--background)), transparent)" }}
        />
        <motion.span
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground/15 text-lg sm:text-2xl font-light pointer-events-none z-[9] select-none"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ∞
        </motion.span>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2.5 sm:mt-3.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        {([
          { type: "memory" as ParticleType, label: "Memory" },
          { type: "dream" as ParticleType, label: "Dream Cycle" },
          { type: "defense" as ParticleType, label: "Defense" },
          { type: "crystallized" as ParticleType, label: "Crystallized" },
        ]).map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
              style={{
                background: `hsl(${COLORS[type]})`,
                boxShadow: `0 0 6px 1px hsl(${COLORS[type]} / 0.5)`,
              }}
            />
            <span className="text-[8px] sm:text-[10px] text-muted-foreground/45 font-medium tracking-wide">{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
});
