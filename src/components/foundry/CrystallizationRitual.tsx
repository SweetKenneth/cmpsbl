/**
 * CrystallizationRitual — Cinematic "pipeline crystallization" overlay
 * 
 * Aesthetic: Raw liquid data slowly solidifying into a crystal structure.
 * Amorphous blobs converge, facets form, a hexagonal crystal grows from center,
 * then locks into place with a final resonance pulse. Slow, ~5s experience.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const PHASES = [
  'Sampling memory stream…',
  'Extracting raw signal data…',
  'Condensing topology graph…',
  'Forming crystalline lattice…',
  'Annealing pipeline structure…',
  'Crystal locked.',
];

// Hexagonal crystal facet coordinates
const HEX_POINTS = [
  { x: 50, y: 15 },
  { x: 80, y: 32 },
  { x: 80, y: 68 },
  { x: 50, y: 85 },
  { x: 20, y: 68 },
  { x: 20, y: 32 },
];

export function CrystallizationRitual({ onComplete }: Props) {
  const progress = useMotionValue(0);
  const displayProgress = useTransform(progress, v => Math.round(v));
  const [phase, setPhase] = useState(0);
  const [showBlobs, setShowBlobs] = useState(false);
  const [showLattice, setShowLattice] = useState(false);
  const [facetsFormed, setFacetsFormed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    // Blobs appear (0.3s)
    const t1 = setTimeout(() => setShowBlobs(true), 300);
    // Lattice lines start tracing (1.5s)
    const t2 = setTimeout(() => setShowLattice(true), 1500);
    // Facets form one by one (2s – 3.5s)
    const facetTimers = HEX_POINTS.map((_, i) =>
      setTimeout(() => setFacetsFormed(i + 1), 2000 + i * 250)
    );
    // Crystal locks (4s)
    const t3 = setTimeout(() => setLocked(true), 4000);
    // Final resonance pulse (4.3s)
    const t4 = setTimeout(() => setShowPulse(true), 4300);

    const ctrl = animate(progress, 100, {
      duration: 5,
      ease: [0.12, 0.8, 0.2, 1],
      onUpdate: (v) => {
        const p = Math.floor((v / 100) * PHASES.length);
        setPhase(Math.min(p, PHASES.length - 1));
      },
      onComplete,
    });

    return () => {
      ctrl.stop();
      [t1, t2, t3, t4, ...facetTimers].forEach(clearTimeout);
    };
  }, []);

  const hexPath = HEX_POINTS.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Deep backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" />

      {/* Ambient particles drifting inward */}
      {showBlobs && Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 140 + Math.random() * 60;
        const startX = Math.cos(angle) * radius;
        const startY = Math.sin(angle) * radius;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + Math.random() * 4,
              height: 3 + Math.random() * 4,
              background: i % 3 === 0
                ? 'hsl(var(--neon-purple) / 0.5)'
                : i % 3 === 1
                  ? 'hsl(var(--neon-cyan) / 0.4)'
                  : 'hsl(var(--primary) / 0.4)',
              top: '50%',
              left: '50%',
              filter: 'blur(1px)',
            }}
            initial={{ x: startX, y: startY, opacity: 0 }}
            animate={{
              x: [startX, startX * 0.3, 0],
              y: [startY, startY * 0.3, 0],
              opacity: [0, 0.7, 0],
              scale: [1, 0.8, 0.2],
            }}
            transition={{
              duration: 3.5,
              delay: 0.5 + i * 0.12,
              ease: 'easeIn',
            }}
          />
        );
      })}

      <div className="relative w-full max-w-md mx-auto px-6">
        {/* Crystal formation area */}
        <div className="relative w-full aspect-square max-w-[260px] mx-auto mb-8">
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Lattice lines from center to hex vertices */}
            {showLattice && HEX_POINTS.map((p, i) => (
              <motion.line
                key={`lat-${i}`}
                x1="50" y1="50"
                x2={p.x} y2={p.y}
                stroke="hsl(var(--neon-purple))"
                strokeWidth="0.3"
                strokeOpacity={0.25}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              />
            ))}

            {/* Hex facets appearing one by one */}
            {HEX_POINTS.slice(0, facetsFormed).map((p, i) => {
              const next = HEX_POINTS[(i + 1) % HEX_POINTS.length];
              return (
                <motion.line
                  key={`edge-${i}`}
                  x1={p.x} y1={p.y}
                  x2={next.x} y2={next.y}
                  stroke="hsl(var(--neon-cyan))"
                  strokeWidth="0.5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 0.35 }}
                />
              );
            })}

            {/* Full hex outline glow on lock */}
            {locked && (
              <motion.path
                d={hexPath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.8"
                initial={{ opacity: 0, filter: 'drop-shadow(0 0 0px hsl(var(--primary)))' }}
                animate={{
                  opacity: [0, 1, 0.8],
                  filter: [
                    'drop-shadow(0 0 0px hsl(var(--primary)))',
                    'drop-shadow(0 0 8px hsl(var(--primary)))',
                    'drop-shadow(0 0 3px hsl(var(--primary)))',
                  ],
                }}
                transition={{ duration: 0.8 }}
              />
            )}

            {/* Vertex nodes */}
            {HEX_POINTS.slice(0, facetsFormed).map((p, i) => (
              <motion.circle
                key={`vtx-${i}`}
                cx={p.x} cy={p.y} r="1.8"
                fill="hsl(var(--neon-cyan))"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: locked ? [1, 1.4, 1] : 1,
                  opacity: 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}

            {/* Inner hex fill on lock */}
            {locked && (
              <motion.path
                d={hexPath}
                fill="hsl(var(--primary))"
                fillOpacity={0}
                initial={{ fillOpacity: 0 }}
                animate={{ fillOpacity: [0, 0.08, 0.04] }}
                transition={{ duration: 1 }}
              />
            )}
          </motion.svg>

          {/* Resonance pulse rings */}
          {showPulse && [0, 1, 2].map(i => (
            <motion.div
              key={`pulse-${i}`}
              className="absolute inset-0 rounded-full border border-primary/20"
              style={{ margin: 'auto', width: '60%', height: '60%' }}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: [0.8, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: 'easeOut' }}
            />
          ))}

          {/* Center progress */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="flex flex-col items-center gap-1"
              animate={locked ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <motion.span className="text-4xl font-black font-mono text-primary tabular-nums leading-none">
                {displayProgress}
              </motion.span>
              <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
                crystallizing
              </span>
            </motion.div>
          </div>
        </div>

        {/* Phase text */}
        <div className="text-center space-y-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.35 }}
              className="text-sm font-mono text-muted-foreground tracking-wide"
            >
              {PHASES[phase]}
            </motion.p>
          </AnimatePresence>

          {/* Lattice growth indicator — 6 facets */}
          <div className="flex justify-center gap-2">
            {HEX_POINTS.map((_, i) => (
              <motion.div
                key={i}
                className="relative"
              >
                <motion.div
                  className="w-2 h-2 rotate-45"
                  style={{
                    background: facetsFormed > i
                      ? 'hsl(var(--neon-cyan))'
                      : 'hsl(var(--border))',
                    boxShadow: facetsFormed > i
                      ? '0 0 6px hsl(var(--neon-cyan) / 0.5)'
                      : 'none',
                  }}
                  initial={{ scale: 0.5, opacity: 0.3 }}
                  animate={{
                    scale: facetsFormed > i ? 1 : 0.5,
                    opacity: facetsFormed > i ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3, type: 'spring' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
