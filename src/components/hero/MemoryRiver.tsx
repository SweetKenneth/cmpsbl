/**
 * Memory River — The anti-chatbot hero visualization
 * Intelligence that compounds instead of restarting.
 * 
 * Particles flow left-to-right using CSS @keyframes for buttery performance.
 * Dream arcs upward, Defense diverts, Crystallized solidifies.
 * Mobile-first, DOM-based (no canvas).
 *
 * Props:
 *   crystallizing — external trigger for convergence burst
 *   autoCrystallize — self-triggering crystallization events
 *   compact — reduced particle count & height for inline usage
 *   hideTagline — suppress the "No resets" tagline
 *   hideLegend — suppress the bottom legend
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

// ─── CSS Keyframes ──────────────────────────────────────────────
const KEYFRAMES_CSS = `
@keyframes river-flow {
  0%   { left: -6%; opacity: 0; }
  2%   { opacity: 0.85; }
  50%  { opacity: 1; }
  93%  { opacity: 0.85; }
  100% { left: 106%; opacity: 0; }
}
@keyframes river-dream {
  0%   { left: -6%; top: 50%; opacity: 0; }
  2%   { opacity: 0.9; }
  15%  { top: 22%; }
  30%  { top: 12%; }
  50%  { top: 8%;  }
  70%  { top: 18%; }
  85%  { top: 30%; }
  93%  { opacity: 0.9; }
  100% { left: 106%; top: 50%; opacity: 0; }
}
@keyframes river-defense {
  0%   { left: -6%; top: 38%; opacity: 0; }
  2%   { opacity: 0.9; }
  30%  { top: 38%; }
  45%  { top: 78%; }
  60%  { top: 68%; }
  75%  { top: 58%; }
  93%  { opacity: 0.9; top: 50%; }
  100% { left: 106%; opacity: 0; }
}
@keyframes crystal-pulse {
  0%, 100% {
    box-shadow: 0 0 10px 2px hsl(var(--primary) / 0.12), 0 0 3px 1px hsl(var(--primary) / 0.06);
    transform: rotate(45deg) scale(1);
  }
  50% {
    box-shadow: 0 0 28px 8px hsl(var(--primary) / 0.45), 0 0 8px 2px hsl(var(--primary) / 0.3);
    transform: rotate(45deg) scale(1.18);
  }
}
@keyframes river-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
@keyframes river-breathe {
  0%, 100% { opacity: 0.025; }
  50%      { opacity: 0.09; }
}
@keyframes ghost-drift {
  0%   { opacity: 0; transform: translateY(0) scale(0.4) rotate(45deg); }
  12%  { opacity: 0.75; transform: translateY(-6px) scale(1) rotate(45deg); }
  50%  { opacity: 0.5; transform: translateY(-20px) scale(0.85) rotate(45deg); }
  100% { opacity: 0; transform: translateY(-44px) scale(0.5) rotate(45deg); }
}
@keyframes crystal-ring-expand {
  0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0.7; border-width: 1.5px; }
  100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; border-width: 0.5px; }
}
@keyframes flow-line-pulse {
  0%, 100% { opacity: 0.12; }
  50%      { opacity: 0.45; }
}
@keyframes convergence-wave {
  0%   { transform: scaleX(0); opacity: 0.7; }
  40%  { transform: scaleX(1); opacity: 0.35; }
  100% { transform: scaleX(0); opacity: 0; }
}
@keyframes origin-pulse {
  0%, 100% { opacity: 0.2; height: 50%; }
  50%      { opacity: 0.7; height: 60%; }
}
`;

function RiverStyles() {
  return <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />;
}

// ─── Crystallized Node ──────────────────────────────────────────
const CrystallizedNode = memo(function CrystallizedNode({
  label, position, delay, compact,
}: { label: string; position: number; delay: number; compact?: boolean }) {
  return (
    <motion.div
      className="absolute flex flex-col items-center gap-0.5 pointer-events-none z-10"
      style={{ left: `${position}%`, top: "50%", transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative">
        {/* Ambient radial glow */}
        <div
          className="absolute -inset-4 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.6), transparent 70%)" }}
        />
        {/* Expanding ring */}
        <div
          className="absolute left-1/2 top-1/2 w-6 h-6 rounded-full border border-primary/20"
          style={{ animation: `crystal-ring-expand 4.5s ease-out ${delay + 0.8}s infinite` }}
        />
        {/* Core diamond */}
        <div
          className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} rounded-sm border border-primary/50`}
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.06))",
            animation: "crystal-pulse 4s ease-in-out infinite",
            animationDelay: `${delay * 0.4}s`,
          }}
        />
      </div>
      {!compact && (
        <span className="text-[6px] sm:text-[7px] font-bold text-primary/35 tracking-[0.15em] uppercase whitespace-nowrap mt-0.5">
          {label}
        </span>
      )}
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
  
  const size = sizeOverride || (isSignal ? 2 : isCrystallized ? 6.5 : isDream ? 5.5 : 4.5);
  const top = 24 + row * 17;
  const color = `hsl(${COLORS[type]})`;

  const animName = isDream ? "river-dream" : isDefense ? "river-defense" : "river-flow";
  const glowSize = isDream ? 14 : isDefense ? 10 : isCrystallized ? 16 : 6;
  const glow = isSignal ? "none" : `0 0 ${glowSize}px 2px ${color}`;

  return (
    <div
      className="absolute rounded-full pointer-events-none z-[5]"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: glow,
        top: isDream || isDefense ? undefined : `${top}%`,
        left: "-6%",
        opacity: 0,
        animation: `${animName} ${duration}s linear ${delay}s infinite`,
      }}
    >
      {/* Trail */}
      {!isSignal && (
        <div
          className="absolute top-1/2 right-full -translate-y-1/2 rounded-full"
          style={{
            width: isDream ? 36 : isDefense ? 24 : isCrystallized ? 20 : 16,
            height: isDream || isCrystallized ? 1.5 : 1,
            background: `linear-gradient(to left, ${color}, transparent)`,
            opacity: isDream ? 0.7 : 0.5,
          }}
        />
      )}
      {/* Forward scout dot */}
      {(isDream || isCrystallized) && (
        <div
          className="absolute top-1/2 left-full -translate-y-1/2 rounded-full"
          style={{
            width: 1.5,
            height: 1.5,
            marginLeft: 3,
            background: color,
            opacity: 0.35,
          }}
        />
      )}
    </div>
  );
});

// ─── River Channel (background atmosphere) ──────────────────────
const RiverChannel = memo(function RiverChannel() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Breathing ambient glow — three zones */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, hsl(var(--neon-cyan) / 0.045) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 45%, hsl(var(--primary) / 0.035) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 55%, hsl(var(--neon-purple) / 0.035) 0%, transparent 45%)`,
          animation: "river-breathe 7s ease-in-out infinite",
        }}
      />
      {/* Central gradient band */}
      <div
        className="absolute left-0 right-0 top-[12%] bottom-[12%]"
        style={{
          background: `linear-gradient(180deg,
            transparent 0%,
            hsl(var(--primary) / 0.015) 12%,
            hsl(var(--primary) / 0.06) 42%,
            hsl(var(--primary) / 0.06) 58%,
            hsl(var(--primary) / 0.015) 88%,
            transparent 100%
          )`,
        }}
      />
      {/* Flow lines — 5 lanes, center is thicker */}
      {[20, 32, 44, 56, 68].map((top, i) => {
        const isCenter = i === 2;
        return (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${top}%`,
              height: isCenter ? 1.5 : 1,
              background: `linear-gradient(90deg,
                transparent 0%,
                hsl(var(--neon-cyan) / ${isCenter ? '0.06' : '0.025'}) 6%,
                hsl(var(--primary) / ${isCenter ? '0.18' : '0.09'}) 50%,
                hsl(var(--neon-purple) / ${isCenter ? '0.06' : '0.025'}) 94%,
                transparent 100%)`,
              animation: `flow-line-pulse ${3.2 + i * 0.55}s ease-in-out ${i * 0.25}s infinite`,
            }}
          />
        );
      })}
      {/* Dual shimmer sweeps — offset timing */}
      <div className="absolute top-[18%] bottom-[18%] left-0 right-0 overflow-hidden">
        <div
          className="absolute inset-0 w-[22%] h-full"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.03), hsl(var(--primary) / 0.07), hsl(var(--neon-purple) / 0.03), transparent)",
            animation: "river-shimmer 7s linear infinite",
          }}
        />
        <div
          className="absolute inset-0 w-[12%] h-full"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.04), transparent)",
            animation: "river-shimmer 10s linear 4s infinite",
          }}
        />
      </div>
    </div>
  );
});

// ─── Convergence Burst ──────────────────────────────────────────
function ConvergenceBurst({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Radial pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: [0, 0.6, 0.3, 0], scale: [0.2, 0.7, 1.1, 0.15] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.35), hsl(var(--primary) / 0.08) 45%, transparent 70%)",
            }}
          />
          {/* Horizontal convergence wave */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute left-[8%] right-[8%] top-[38%] bottom-[38%] z-[18] pointer-events-none origin-center rounded"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.28), hsl(var(--primary) / 0.12), transparent)",
              animation: "convergence-wave 2.2s ease-out forwards",
            }}
          />
          {/* Scatter sparks */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute z-[22] pointer-events-none rounded-full"
              style={{
                width: 2.5,
                height: 2.5,
                background: "hsl(var(--primary))",
                boxShadow: "0 0 6px 1px hsl(var(--primary) / 0.4)",
                left: `${35 + Math.random() * 30}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.9, 0],
                scale: [0, 1.3, 0],
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 50,
              }}
              transition={{ duration: 1.6, delay: 0.15 + i * 0.06, ease: "easeOut" }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Build particle set ─────────────────────────────────────────
function buildParticles(compact: boolean) {
  const w: { id: number; type: ParticleType; delay: number; row: number; duration: number; size?: number }[] = [];
  let id = 0;

  if (compact) {
    // Lighter set for inline/compact usage
    for (let i = 0; i < 10; i++)
      w.push({ id: id++, type: "signal", delay: i * 0.6, row: i % 3, duration: 4.2 + (i % 3) * 0.3, size: 1.5 });
    for (let i = 0; i < 5; i++)
      w.push({ id: id++, type: "memory", delay: 0.2 + i * 1.6, row: i % 3, duration: 5.5 });
    w.push({ id: id++, type: "dream", delay: 1.5, row: 1, duration: 7.5 });
    w.push({ id: id++, type: "dream", delay: 6, row: 0, duration: 8 });
    w.push({ id: id++, type: "defense", delay: 3, row: 0, duration: 5.5 });
    w.push({ id: id++, type: "defense", delay: 8, row: 2, duration: 5 });
    w.push({ id: id++, type: "crystallized", delay: 2, row: 1, duration: 8.5, size: 6 });
    w.push({ id: id++, type: "crystallized", delay: 7, row: 0, duration: 9, size: 5 });
  } else {
    // Full density
    for (let i = 0; i < 20; i++)
      w.push({ id: id++, type: "signal", delay: i * 0.45, row: i % 4, duration: 3.8 + (i % 4) * 0.35, size: 1.2 + (i % 3) * 0.5 });
    for (let i = 0; i < 9; i++)
      w.push({ id: id++, type: "memory", delay: 0.1 + i * 1.2, row: i % 3, duration: 5 + (i % 3) * 1.2 });
    w.push({ id: id++, type: "dream", delay: 0.6, row: 1, duration: 7 });
    w.push({ id: id++, type: "dream", delay: 3.8, row: 0, duration: 8 });
    w.push({ id: id++, type: "dream", delay: 7.2, row: 2, duration: 7.5 });
    w.push({ id: id++, type: "dream", delay: 11, row: 1, duration: 8.5 });
    w.push({ id: id++, type: "dream", delay: 14.5, row: 0, duration: 9 });
    w.push({ id: id++, type: "defense", delay: 1.8, row: 0, duration: 5 });
    w.push({ id: id++, type: "defense", delay: 5.5, row: 2, duration: 5.5 });
    w.push({ id: id++, type: "defense", delay: 9.5, row: 1, duration: 5.8 });
    w.push({ id: id++, type: "defense", delay: 13, row: 0, duration: 6 });
    w.push({ id: id++, type: "crystallized", delay: 1, row: 1, duration: 8, size: 7 });
    w.push({ id: id++, type: "crystallized", delay: 4.5, row: 0, duration: 9, size: 6.5 });
    w.push({ id: id++, type: "crystallized", delay: 8.5, row: 2, duration: 9.5, size: 8 });
    w.push({ id: id++, type: "crystallized", delay: 13, row: 1, duration: 10, size: 7.5 });
  }

  return w;
}

// ─── Main ───────────────────────────────────────────────────────
interface MemoryRiverProps {
  crystallizing?: boolean;
  autoCrystallize?: boolean;
  compact?: boolean;
  hideTagline?: boolean;
  hideLegend?: boolean;
}

export const MemoryRiver = memo(function MemoryRiver({
  crystallizing: externalCrystallizing,
  autoCrystallize = false,
  compact = false,
  hideTagline = false,
  hideLegend = false,
}: MemoryRiverProps) {
  const [autoPulse, setAutoPulse] = useState(false);
  const [ghostPipelines, setGhostPipelines] = useState<
    { id: number; x: number; delay: number }[]
  >([]);
  const crystallizing = externalCrystallizing || autoPulse;

  useEffect(() => {
    if (!autoCrystallize || externalCrystallizing) return;
    const schedule = () => 4500 + Math.random() * 4500;
    const repeat = () => 6000 + Math.random() * 6000;

    let timeout: ReturnType<typeof setTimeout>;
    const pulse = () => {
      setAutoPulse(true);
      setTimeout(() => setAutoPulse(false), 2600);

      const count = compact ? 1 : 2 + Math.floor(Math.random() * 2);
      const newGhosts = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: 12 + Math.random() * 76,
        delay: Math.random() * 0.5,
      }));
      setGhostPipelines(prev => [...prev, ...newGhosts]);
      setTimeout(() => {
        setGhostPipelines(prev => prev.filter(p => !newGhosts.find(g => g.id === p.id)));
      }, 3800);

      timeout = setTimeout(pulse, repeat());
    };
    timeout = setTimeout(pulse, schedule());
    return () => clearTimeout(timeout);
  }, [autoCrystallize, externalCrystallizing, compact]);

  const particles = useMemo(() => buildParticles(compact), [compact]);

  const crystals = useMemo(() => compact
    ? [
        { label: "SEP-001", position: 30, delay: 1.5 },
        { label: "SEP-042", position: 70, delay: 2.5 },
      ]
    : [
        { label: "SEP-001", position: 20, delay: 1.6 },
        { label: "SEP-042", position: 50, delay: 2.6 },
        { label: "SEP-077", position: 80, delay: 3.6 },
      ],
  [compact]);

  const heightClass = compact
    ? "h-24 sm:h-28 md:h-32"
    : "h-40 sm:h-48 md:h-56 lg:h-60";

  return (
    <div className="w-full max-w-full mx-auto lg:max-w-none overflow-hidden">
      <RiverStyles />

      {/* Tagline */}
      {!hideTagline && (
        <motion.p
          className="text-center text-[9px] sm:text-[10px] text-muted-foreground/25 font-semibold tracking-[0.3em] uppercase mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          No resets · No forgetting · No clock
        </motion.p>
      )}

      {/* River container */}
      <motion.div
        className={`relative w-full ${heightClass} rounded-lg sm:rounded-xl overflow-hidden border border-border/12 bg-background/15`}
        initial={{ opacity: 0, scaleY: 0.75 }}
        animate={{
          opacity: 1,
          scaleY: 1,
          boxShadow: crystallizing
            ? "0 0 120px -15px hsl(var(--primary) / 0.4), 0 0 50px -8px hsl(var(--primary) / 0.18), inset 0 1px 0 hsl(var(--primary) / 0.1)"
            : "0 0 60px -25px hsl(var(--primary) / 0.08), inset 0 1px 0 hsl(var(--primary) / 0.02)",
        }}
        transition={crystallizing
          ? { boxShadow: { duration: 0.4, ease: "easeOut" } }
          : { delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <ConvergenceBurst active={crystallizing} />
        <RiverChannel />
        {particles.map((p) => <Particle key={p.id} {...p} />)}

        {/* Ghost memory drift */}
        {ghostPipelines.map(p => (
          <div
            key={p.id}
            className="absolute z-[15] pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: "22%",
              animation: `ghost-drift 3.2s ease-out ${p.delay}s forwards`,
              opacity: 0,
            }}
          >
            <div
              className={`${compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} rounded-sm border border-primary/45`}
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.06))",
                boxShadow: "0 0 12px 2px hsl(var(--primary) / 0.18)",
              }}
            />
          </div>
        ))}

        {crystals.map((c) => <CrystallizedNode key={c.label} {...c} compact={compact} />)}

        {/* Left origin — pulsing emitter bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 sm:w-14 pointer-events-none z-[8]"
          style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.06), transparent)" }}
        />
        <div
          className="absolute left-0.5 w-[2px] rounded-full pointer-events-none z-[9]"
          style={{
            top: "25%",
            bottom: "25%",
            background: "linear-gradient(180deg, transparent, hsl(var(--primary) / 0.35), transparent)",
            animation: "origin-pulse 2.5s ease-in-out infinite",
          }}
        />

        {/* Right infinity fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 pointer-events-none z-[8]"
          style={{ background: "linear-gradient(270deg, hsl(var(--background)), hsl(var(--background) / 0.5), transparent)" }}
        />
        {!compact && (
          <motion.span
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground/10 text-lg sm:text-xl font-light pointer-events-none z-[9] select-none"
            animate={{ opacity: [0.06, 0.2, 0.06] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            ∞
          </motion.span>
        )}
      </motion.div>

      {/* Legend */}
      {!hideLegend && (
        <motion.div
          className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-2.5 sm:mt-3.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {([
            { type: "memory" as ParticleType, label: "MEMORY Engine" },
            { type: "dream" as ParticleType, label: "DREAM Engine" },
            { type: "defense" as ParticleType, label: "DEFENSE Layer" },
            { type: "crystallized" as ParticleType, label: "Crystallized" },
          ]).map(({ type, label }) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                style={{
                  background: `hsl(${COLORS[type]})`,
                  boxShadow: `0 0 6px 1px hsl(${COLORS[type]} / 0.45)`,
                }}
              />
              <span className="text-[8px] sm:text-[10px] text-muted-foreground/35 font-medium tracking-wide">{label}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
});
