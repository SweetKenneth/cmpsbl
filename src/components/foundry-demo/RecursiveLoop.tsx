/**
 * Recursive Loop Diagram — The money shot
 * Animated visualization of the self-compounding discovery cycle
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';

const PHASES = [
  { id: 'discover', label: 'DISCOVER', description: 'Auto-Mine surfaces novel module combinations', icon: '🔬', color: 'hsl(var(--primary))' },
  { id: 'crystallize', label: 'CRYSTALLIZE', description: 'Score via CJPI → tier into Apex/Enterprise/Architect', icon: '💎', color: 'hsl(280, 80%, 65%)' },
  { id: 'hotswap', label: 'HOT-SWAP', description: 'Zero-downtime engine replacement at runtime', icon: '⚡', color: 'hsl(45, 95%, 55%)' },
  { id: 'expand', label: 'EXPAND', description: 'New modules shift the combinatorial topology', icon: '🌐', color: 'hsl(160, 70%, 50%)' },
] as const;

export function RecursiveLoop() {
  const [activePhase, setActivePhase] = useState(0);
  const [cycleCount, setCycleCount] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-100px' });

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActivePhase(prev => {
        const next = (prev + 1) % PHASES.length;
        if (next === 0) setCycleCount(c => c + 1);
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />
      
      <div className="max-w-5xl mx-auto relative">
        <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground text-center mb-4 font-mono">
          The Recursive Engine
        </h2>
        <p className="text-center text-muted-foreground/60 mb-16 max-w-2xl mx-auto">
          Each cycle expands the search space. Discovery is not linear — it compounds.
        </p>

        {/* Loop visualization */}
        <div className="flex items-center justify-center mb-16">
          <div className="relative w-80 h-80 md:w-[420px] md:h-[420px]">
            {/* Rotating ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-border/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-border/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />

            {/* Phase nodes */}
            {PHASES.map((phase, i) => {
              const angle = (i / PHASES.length) * Math.PI * 2 - Math.PI / 2;
              const radius = 160;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isActive = i === activePhase;

              return (
                <motion.div
                  key={phase.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `calc(50% + ${x}px - 40px)`,
                    top: `calc(50% + ${y}px - 30px)`,
                    width: 80,
                  }}
                  animate={{
                    scale: isActive ? 1.2 : 0.9,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="text-3xl mb-1 transition-all"
                    style={{ filter: isActive ? `drop-shadow(0 0 12px ${phase.color})` : 'none' }}
                  >
                    {phase.icon}
                  </div>
                  <span className="text-[10px] md:text-xs font-mono font-bold tracking-wider text-foreground whitespace-nowrap">
                    {phase.label}
                  </span>
                </motion.div>
              );
            })}

            {/* Center cycle counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={cycleCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-mono text-4xl font-black text-foreground/80"
              >
                ∞
              </motion.div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                Cycle {cycleCount}
              </div>
            </div>
          </div>
        </div>

        {/* Active phase detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-lg mx-auto"
          >
            <div className="text-lg font-mono font-bold text-foreground mb-2">
              {PHASES[activePhase].label}
            </div>
            <div className="text-muted-foreground text-sm">
              {PHASES[activePhase].description}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Formula */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-card/50 border border-border/30 rounded-lg px-8 py-4 font-mono text-sm text-muted-foreground">
            <span className="text-foreground font-bold">topology(n+1)</span>
            {' = '}
            <span className="text-foreground font-bold">topology(n)</span>
            {' × '}
            <span className="text-primary font-bold">discovered(n)</span>
            <span className="block mt-1 text-xs text-muted-foreground/60">
              Every discovery changes the denominator
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
