/**
 * BlueprintForgeRitual — Cinematic "blueprint discovery" overlay
 * 
 * Aesthetic: Technical schematic being drawn in real-time.
 * Grid lines appear, nodes light up sequentially, connections trace between them,
 * then the full blueprint "burns in" at the end. Slow, deliberate, ~4.5s.
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const PHASES = [
  { text: 'Indexing primitive space…', icon: '⬡' },
  { text: 'Mapping valid topologies…', icon: '◇' },
  { text: 'Evaluating CJPI integrity…', icon: '△' },
  { text: 'Scoring architecture viability…', icon: '◈' },
  { text: 'Rendering blueprint schematics…', icon: '⬢' },
  { text: 'Blueprints materialized.', icon: '✦' },
];

// Generate deterministic grid node positions
function useGridNodes(count: number) {
  return useMemo(() => {
    const nodes: { x: number; y: number; delay: number }[] = [];
    const cols = 6;
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      nodes.push({
        x: 15 + (col / (cols - 1)) * 70,
        y: 20 + (row / (Math.ceil(count / cols) - 1)) * 60,
        delay: i * 0.12 + Math.random() * 0.08,
      });
    }
    return nodes;
  }, [count]);
}

export function BlueprintForgeRitual({ onComplete }: Props) {
  const progress = useMotionValue(0);
  const displayProgress = useTransform(progress, v => Math.round(v));
  const [phase, setPhase] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [activeNodes, setActiveNodes] = useState(0);
  const [showConnections, setShowConnections] = useState(false);
  const [burnIn, setBurnIn] = useState(false);

  const nodes = useGridNodes(18);

  useEffect(() => {
    // Phase 1: Grid appears (0.4s in)
    const t1 = setTimeout(() => setShowGrid(true), 400);
    // Phase 2: Nodes light up sequentially (0.8s – 2.5s)
    const nodeTimers: NodeJS.Timeout[] = [];
    nodes.forEach((_, i) => {
      nodeTimers.push(setTimeout(() => setActiveNodes(i + 1), 800 + i * 100));
    });
    // Phase 3: Connection traces (2.5s)
    const t2 = setTimeout(() => setShowConnections(true), 2500);
    // Phase 4: Burn-in flash (3.8s)
    const t3 = setTimeout(() => setBurnIn(true), 3800);

    const ctrl = animate(progress, 100, {
      duration: 4.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const p = Math.floor((v / 100) * PHASES.length);
        setPhase(Math.min(p, PHASES.length - 1));
      },
      onComplete,
    });

    return () => {
      ctrl.stop();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      nodeTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />

      {/* Subtle scan line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent"
        animate={{ top: ['10%', '90%', '10%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative w-full max-w-md mx-auto px-6">
        {/* Blueprint schematic area */}
        <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-8">
          {/* Grid lines */}
          <AnimatePresence>
            {showGrid && (
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
              >
                {/* Horizontal grid lines */}
                {[20, 40, 60, 80].map((y, i) => (
                  <motion.line
                    key={`h-${i}`}
                    x1="5" y1={y} x2="95" y2={y}
                    stroke="hsl(var(--border))"
                    strokeWidth="0.15"
                    strokeDasharray="2 2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                  />
                ))}
                {/* Vertical grid lines */}
                {[15, 29, 43, 57, 71, 85].map((x, i) => (
                  <motion.line
                    key={`v-${i}`}
                    x1={x} y1="5" x2={x} y2="95"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.15"
                    strokeDasharray="2 2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                  />
                ))}

                {/* Connection traces between nodes */}
                {showConnections && nodes.slice(0, activeNodes).map((node, i) => {
                  const next = nodes[(i + 3) % nodes.length];
                  if (i % 2 !== 0) return null;
                  return (
                    <motion.line
                      key={`c-${i}`}
                      x1={node.x} y1={node.y}
                      x2={next.x} y2={next.y}
                      stroke="hsl(var(--neon-cyan))"
                      strokeWidth="0.3"
                      strokeOpacity={0.4}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                    />
                  );
                })}

                {/* Nodes */}
                {nodes.slice(0, activeNodes).map((node, i) => (
                  <motion.circle
                    key={`n-${i}`}
                    cx={node.x}
                    cy={node.y}
                    r="1.5"
                    fill="hsl(var(--primary))"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0, 1, 0.7] }}
                    transition={{ duration: 0.3 }}
                  >
                    <animate
                      attributeName="r"
                      values="1.5;2;1.5"
                      dur="2s"
                      repeatCount="indefinite"
                      begin={`${i * 0.1}s`}
                    />
                  </motion.circle>
                ))}
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Center progress display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="flex flex-col items-center gap-1"
              animate={burnIn ? {
                scale: [1, 1.15, 1],
                filter: [
                  'drop-shadow(0 0 0px hsl(var(--primary)))',
                  'drop-shadow(0 0 20px hsl(var(--primary)))',
                  'drop-shadow(0 0 4px hsl(var(--primary)))',
                ],
              } : {}}
              transition={{ duration: 0.6 }}
            >
              <motion.span className="text-4xl font-black font-mono text-primary tabular-nums leading-none">
                {displayProgress}
              </motion.span>
              <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                blueprints
              </span>
            </motion.div>
          </div>

          {/* Corner markers */}
          {[
            'top-0 left-0 border-t border-l',
            'top-0 right-0 border-t border-r',
            'bottom-0 left-0 border-b border-l',
            'bottom-0 right-0 border-b border-r',
          ].map((pos, i) => (
            <motion.div
              key={i}
              className={`absolute w-3 h-3 ${pos} border-primary/20`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            />
          ))}
        </div>

        {/* Phase indicator */}
        <div className="text-center space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-primary/60 text-sm">{PHASES[phase].icon}</span>
              <span className="text-sm font-mono text-muted-foreground tracking-wide">
                {PHASES[phase].text}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Primitive count ticker */}
          <motion.div className="flex justify-center gap-0.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-primary/60"
                initial={{ height: 2, opacity: 0.15 }}
                animate={{
                  height: activeNodes > i ? [2, 10, 6] : 2,
                  opacity: activeNodes > i ? [0.15, 0.8, 0.5] : 0.15,
                }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
