/**
 * Recursive Loop Diagram — The money shot
 * Animated visualization of the self-compounding discovery cycle
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';

const PHASES = [
  { id: 'discover', label: 'DISCOVER', description: 'Memory Stream surfaces novel system combinations', icon: '🔬', color: 'hsl(var(--primary))' },
  { id: 'crystallize', label: 'CRYSTALLIZE', description: 'Score via CJPI → tier into Mint / Prime / Relic / Mythic / Apex', icon: '💎', color: 'hsl(280, 80%, 65%)' },
  { id: 'hotswap', label: 'HOT-SWAP', description: 'Zero-downtime engine replacement at runtime', icon: '⚡', color: 'hsl(45, 95%, 55%)' },
  { id: 'expand', label: 'EXPAND', description: 'New systems shift the combinatorial topology', icon: '🌐', color: 'hsl(160, 70%, 50%)' },
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
    <section ref={ref} className="py-16 sm:py-20 md:py-40 px-5 sm:px-6 relative overflow-hidden">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />
      
      <div className="max-w-5xl mx-auto relative">
        <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
          The Crystallization Engine
        </h2>
        <p className="text-center text-muted-foreground/60 mb-10 sm:mb-16 max-w-2xl mx-auto text-sm sm:text-base px-2">
          Each cycle expands the search space. Crystallization is not linear — it compounds.
        </p>

        {/* Loop visualization */}
        <div className="flex items-center justify-center mb-10 sm:mb-16">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px]">
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
              const radius = 130;
              const isActive = i === activePhase;

              return (
                <motion.div
                  key={phase.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * radius}px - 40px)`,
                    top: `calc(50% + ${Math.sin(angle) * radius}px - 28px)`,
                    width: 80,
                  }}
                  animate={{
                    scale: isActive ? 1.2 : 0.9,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="text-2xl sm:text-3xl mb-1 transition-all"
                    style={{ filter: isActive ? `drop-shadow(0 0 12px ${phase.color})` : 'none' }}
                  >
                    {phase.icon}
                  </div>
                  <span className="text-[11px] sm:text-xs md:text-sm font-mono font-bold tracking-wider text-foreground whitespace-nowrap">
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
                className="font-mono text-3xl sm:text-4xl font-black text-foreground/80"
              >
                ∞
              </motion.div>
              <div className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1">
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
            className="text-center max-w-lg mx-auto px-2"
          >
            <div className="text-base sm:text-lg font-mono font-bold text-foreground mb-1.5 sm:mb-2">
              {PHASES[activePhase].label}
            </div>
            <div className="text-muted-foreground text-sm sm:text-base">
              {PHASES[activePhase].description}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Formula */}
        <div className="mt-12 sm:mt-20 text-center">
          <div className="inline-block bg-card/50 border border-border/30 rounded-lg px-5 sm:px-8 py-3.5 sm:py-4 font-mono text-xs sm:text-sm text-muted-foreground">
            <span className="text-foreground font-bold">topology(n+1)</span>
            {' = '}
            <span className="text-foreground font-bold">topology(n)</span>
            {' × '}
            <span className="text-primary font-bold">discovered(n)</span>
            <span className="block mt-1.5 text-xs sm:text-xs text-muted-foreground/60">
              Every discovery changes the denominator
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
