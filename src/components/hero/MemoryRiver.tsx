/**
 * Memory River — The anti-chatbot hero visualization
 * Intelligence that compounds instead of restarting.
 * 
 * Particles flow left-to-right using CSS @keyframes for buttery performance.
 * Dream arcs upward, Defense diverts, Crystallized solidifies.
 * Mobile-first, DOM-based (no canvas).
 */

import React, { memo, useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
  3%   { opacity: 0.9; }
  92%  { opacity: 0.9; }
  100% { left: 105%; opacity: 0; }
}
@keyframes river-dream {
  0%   { left: -5%; top: 48%; opacity: 0; }
  3%   { opacity: 0.95; }
  20%  { top: 18%; }
  40%  { top: 10%; }
  60%  { top: 15%; }
  80%  { top: 25%; }
  92%  { opacity: 0.95; }
  100% { left: 105%; top: 48%; opacity: 0; }
}
@keyframes river-defense {
  0%   { left: -5%; top: 35%; opacity: 0; }
  3%   { opacity: 0.95; }
  35%  { top: 35%; }
  50%  { top: 75%; }
  65%  { top: 65%; }
  80%  { top: 55%; }
  92%  { opacity: 0.95; top: 50%; }
  100% { left: 105%; opacity: 0; }
}
@keyframes crystal-pulse {
  0%, 100% { box-shadow: 0 0 12px 2px hsl(var(--primary) / 0.15), 0 0 4px 1px hsl(var(--primary) / 0.08); transform: rotate(45deg) scale(1); }
  50%      { box-shadow: 0 0 32px 10px hsl(var(--primary) / 0.5), 0 0 10px 3px hsl(var(--primary) / 0.35); transform: rotate(45deg) scale(1.15); }
}
@keyframes river-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
@keyframes river-breathe {
  0%, 100% { opacity: 0.03; }
  50%      { opacity: 0.1; }
}
@keyframes ghost-drift {
  0%   { opacity: 0; transform: translateY(0) scale(0.5); }
  15%  { opacity: 0.7; transform: translateY(-8px) scale(1); }
  60%  { opacity: 0.5; transform: translateY(-24px) scale(0.9); }
  100% { opacity: 0; transform: translateY(-48px) scale(0.6); }
}
@keyframes crystal-ring {
  0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}
@keyframes flow-line-pulse {
  0%, 100% { opacity: 0.15; }
  50%      { opacity: 0.5; }
}
@keyframes convergence-wave {
  0%   { transform: scaleX(0); opacity: 0.6; }
  50%  { transform: scaleX(1); opacity: 0.3; }
  100% { transform: scaleX(0); opacity: 0; }
}
`;

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
          className="absolute -inset-3 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.5), transparent)" }}
        />
        {/* Inner spinning ring */}
        <div
          className="absolute -inset-2 rounded-full border border-primary/10"
          style={{ animation: `crystal-ring 4s ease-out ${delay + 1}s infinite` }}
        />
        <div
          className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-sm border border-primary/60"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.08))",
            animation: "crystal-pulse 3.5s ease-in-out infinite",
            animationDelay: `${delay * 0.3}s`,
          }}
        />
      </div>
      <span className="text-[7px] sm:text-[8px] font-bold text-primary/45 tracking-[0.15em] uppercase whitespace-nowrap mt-0.5">
        {label}
      </span>
    </motion.div>
  );
});

// ─── CSS-Animated Particle ──────────────────────────────────────
const Particle = memo(function Particle({
  type, delay, row, duration, size: sizeOverride,
}: { type: ParticleType; delay: number; row: number; duration: number; size?: number }) {
  const isSignal = type === "signal";
  const isDream = type === "dream";
  const isDefense = type === "defense";
  const isCrystallized = type === "crystallized";
  
  const size = sizeOverride || (isSignal ? 2.5 : isCrystallized ? 7 : 5);
  const top = 26 + row * 16;
  const color = `hsl(${COLORS[type]})`;

  const animName = isDream ? "river-dream" : isDefense ? "river-defense" : "river-flow";
  const glowSize = isDream ? 16 : isDefense ? 12 : isCrystallized ? 18 : 8;
  const glow = isSignal ? "none" : `0 0 ${glowSize}px 3px ${color}`;

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
        filter: isSignal ? 'none' : `blur(${size > 6 ? 0.5 : 0}px)`,
      }}
    >
      {/* Trail line */}
      {!isSignal && (
        <div
          className="absolute top-1/2 right-full -translate-y-1/2 h-[1px] rounded-full"
          style={{
            width: isDream ? 32 : isDefense ? 22 : isCrystallized ? 18 : 14,
            background: `linear-gradient(to left, ${color}, transparent)`,
            opacity: 0.6,
          }}
        />
      )}
      {/* Leading dot */}
      {(isDream || isCrystallized) && (
        <div
          className="absolute top-1/2 left-full -translate-y-1/2 rounded-full"
          style={{
            width: 2,
            height: 2,
            marginLeft: 2,
            background: color,
            opacity: 0.4,
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
          background: `radial-gradient(ellipse at 25% 50%, hsl(var(--neon-cyan) / 0.05) 0%, transparent 55%),
                       radial-gradient(ellipse at 50% 40%, hsl(var(--primary) / 0.04) 0%, transparent 45%),
                       radial-gradient(ellipse at 75% 55%, hsl(var(--neon-purple) / 0.04) 0%, transparent 50%)`,
          animation: "river-breathe 6s ease-in-out infinite",
        }}
      />
      {/* Gradient band */}
      <div
        className="absolute left-0 right-0 top-[15%] bottom-[15%]"
        style={{
          background: `linear-gradient(180deg,
            transparent 0%,
            hsl(var(--primary) / 0.02) 15%,
            hsl(var(--primary) / 0.07) 45%,
            hsl(var(--primary) / 0.07) 55%,
            hsl(var(--primary) / 0.02) 85%,
            transparent 100%
          )`,
        }}
      />
      {/* Flow lines — more of them, subtler */}
      {[22, 34, 44, 54, 66].map((top, i) => (
        <div
          key={i}
          className="absolute left-0 right-0"
          style={{
            top: `${top}%`,
            height: i === 2 ? 2 : 1,
            background: `linear-gradient(90deg, transparent 0%, hsl(var(--neon-cyan) / ${i === 2 ? '0.08' : '0.04'}) 8%, hsl(var(--primary) / ${i === 2 ? '0.2' : '0.12'}) 50%, hsl(var(--neon-purple) / ${i === 2 ? '0.08' : '0.04'}) 92%, transparent 100%)`,
            animation: `flow-line-pulse ${3 + i * 0.6}s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}
      {/* Double shimmer sweep */}
      <div className="absolute top-[22%] bottom-[22%] left-0 right-0 overflow-hidden">
        <div
          className="absolute inset-0 w-[25%] h-full"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.04), hsl(var(--primary) / 0.08), hsl(var(--neon-purple) / 0.04), transparent)",
            animation: "river-shimmer 6s linear infinite",
          }}
        />
        <div
          className="absolute inset-0 w-[15%] h-full"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.05), transparent)",
            animation: "river-shimmer 8s linear 3s infinite",
          }}
        />
      </div>
    </div>
  );
}

// ─── Convergence Burst (on crystallize event) ───────────────────
function ConvergenceBurst({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Central radial pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.7, 0.4, 0], scale: [0.3, 0.8, 1.2, 0.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.1) 40%, transparent 70%)",
            }}
          />
          {/* Horizontal convergence wave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-[10%] right-[10%] top-[40%] bottom-[40%] z-[18] pointer-events-none origin-center"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.15), transparent)",
              animation: "convergence-wave 2s ease-out forwards",
              borderRadius: 4,
            }}
          />
          {/* Scatter dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute z-[22] pointer-events-none rounded-full"
              style={{
                width: 3,
                height: 3,
                background: "hsl(var(--primary))",
                left: `${40 + Math.random() * 20}%`,
                top: `${35 + Math.random() * 30}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.5) * 40,
              }}
              transition={{ duration: 1.5, delay: 0.2 + i * 0.08, ease: "easeOut" }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
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
    const schedule = () => 5000 + Math.random() * 5000;
    const repeat = () => 7000 + Math.random() * 7000;

    let timeout: ReturnType<typeof setTimeout>;
    const pulse = () => {
      setAutoPulse(true);
      setTimeout(() => setAutoPulse(false), 2500);

      // Spawn 2-3 ghost pipelines per crystallization
      const count = 2 + Math.floor(Math.random() * 2);
      const newGhosts = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: 15 + Math.random() * 70,
        delay: Math.random() * 0.6,
      }));
      setGhostPipelines(prev => [...prev, ...newGhosts]);
      setTimeout(() => {
        setGhostPipelines(prev => prev.filter(p => !newGhosts.find(g => g.id === p.id)));
      }, 4000);

      timeout = setTimeout(pulse, repeat());
    };
    timeout = setTimeout(pulse, schedule());
    return () => clearTimeout(timeout);
  }, [autoCrystallize, externalCrystallizing]);

  const particles = useMemo(() => {
    const w: { id: number; type: ParticleType; delay: number; row: number; duration: number; size?: number }[] = [];
    let id = 0;
    // Dense signal background
    for (let i = 0; i < 18; i++)
      w.push({ id: id++, type: "signal", delay: i * 0.5, row: i % 4, duration: 4 + (i % 3) * 0.4, size: 1.5 + Math.random() * 1.5 });
    // Memory stream
    for (let i = 0; i < 8; i++)
      w.push({ id: id++, type: "memory", delay: 0.1 + i * 1.4, row: i % 3, duration: 5.5 + (i % 2) * 1.5 });
    // Dream arcs — more variation
    w.push({ id: id++, type: "dream", delay: 0.8, row: 1, duration: 7.5 });
    w.push({ id: id++, type: "dream", delay: 4.2, row: 0, duration: 8.5 });
    w.push({ id: id++, type: "dream", delay: 8, row: 2, duration: 7 });
    w.push({ id: id++, type: "dream", delay: 12, row: 1, duration: 9 });
    // Defense diversions
    w.push({ id: id++, type: "defense", delay: 2, row: 0, duration: 5 });
    w.push({ id: id++, type: "defense", delay: 6.5, row: 2, duration: 5.5 });
    w.push({ id: id++, type: "defense", delay: 11, row: 1, duration: 6 });
    // Crystallized (larger, slower, more luminous)
    w.push({ id: id++, type: "crystallized", delay: 1.2, row: 1, duration: 8.5, size: 8 });
    w.push({ id: id++, type: "crystallized", delay: 5.5, row: 0, duration: 9.5, size: 7 });
    w.push({ id: id++, type: "crystallized", delay: 10, row: 2, duration: 10, size: 9 });
    return w;
  }, []);

  const crystals = useMemo(() => [
    { label: "SEP-001", position: 22, delay: 1.8 },
    { label: "SEP-042", position: 50, delay: 2.8 },
    { label: "SEP-077", position: 78, delay: 3.8 },
  ], []);

  return (
    <div className="w-full max-w-full mx-auto lg:max-w-none overflow-hidden">
      <RiverStyles />

      {/* Tagline */}
      <motion.p
        className="text-center text-[9px] sm:text-[10px] text-muted-foreground/30 font-semibold tracking-[0.3em] uppercase mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        No resets · No forgetting · No clock
      </motion.p>

      {/* River */}
      <motion.div
        className="relative w-full h-40 sm:h-44 md:h-52 lg:h-56 rounded-lg sm:rounded-xl overflow-hidden border border-border/15 bg-background/20"
        initial={{ opacity: 0, scaleY: 0.7 }}
        animate={{
          opacity: 1,
          scaleY: 1,
          boxShadow: crystallizing
            ? "0 0 140px -20px hsl(var(--primary) / 0.45), 0 0 60px -10px hsl(var(--primary) / 0.2), inset 0 1px 0 hsl(var(--primary) / 0.12)"
            : "0 0 80px -30px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--primary) / 0.03)",
        }}
        transition={crystallizing
          ? { boxShadow: { duration: 0.5, ease: "easeOut" } }
          : { delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <ConvergenceBurst active={crystallizing} />
        <RiverChannel />
        {particles.map((p) => <Particle key={p.id} {...p} />)}

        {/* Ghost pipeline drift nodes */}
        {ghostPipelines.map(p => (
          <div
            key={p.id}
            className="absolute z-[15] pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: "25%",
              animation: `ghost-drift 3s ease-out ${p.delay}s forwards`,
              opacity: 0,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-sm rotate-45 border border-primary/50"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.08))",
                boxShadow: "0 0 14px 3px hsl(var(--primary) / 0.2)",
              }}
            />
          </div>
        ))}
        {crystals.map((c) => <CrystallizedNode key={c.label} {...c} />)}

        {/* Left origin glow */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 pointer-events-none z-[8]"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.08), transparent)" }}
        />
        <motion.div
          className="absolute left-0.5 top-[25%] bottom-[25%] w-[2px] rounded-full pointer-events-none z-[9]"
          style={{ background: "hsl(var(--primary) / 0.3)" }}
          animate={{ opacity: [0.25, 0.8, 0.25], scaleY: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Right infinity fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-20 sm:w-28 pointer-events-none z-[8]"
          style={{ background: "linear-gradient(270deg, hsl(var(--background)), hsl(var(--background) / 0.6), transparent)" }}
        />
        <motion.span
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground/12 text-lg sm:text-2xl font-light pointer-events-none z-[9] select-none"
          animate={{ opacity: [0.08, 0.25, 0.08] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ∞
        </motion.span>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-3 sm:mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        {([
          { type: "memory" as ParticleType, label: "MEMORY" },
          { type: "dream" as ParticleType, label: "Dream Cycle" },
          { type: "defense" as ParticleType, label: "DEFENSE" },
          { type: "crystallized" as ParticleType, label: "Crystallized" },
        ]).map(({ type, label }) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
              style={{
                background: `hsl(${COLORS[type]})`,
                boxShadow: `0 0 8px 2px hsl(${COLORS[type]} / 0.5)`,
              }}
            />
            <span className="text-[8px] sm:text-[10px] text-muted-foreground/40 font-medium tracking-wide">{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
});
