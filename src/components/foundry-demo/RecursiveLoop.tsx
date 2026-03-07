/**
 * Recursive Loop Diagram — The money shot
 * Animated visualization of the self-compounding discovery cycle
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';

const PHASES = [
  { id: 'discover', label: 'DISCOVER', description: 'Memory Stream surfaces novel system combinations from raw substrate behavior', icon: '🔬', color: 'hsl(var(--primary))' },
  { id: 'crystallize', label: 'CRYSTALLIZE', description: 'Score via CJPI engine → tier into Mint / Prime / Relic / Mythic / Apex', icon: '💎', color: 'hsl(280, 80%, 65%)' },
  { id: 'hotswap', label: 'HOT-SWAP', description: 'Zero-downtime engine replacement — new capabilities go live at runtime', icon: '⚡', color: 'hsl(45, 95%, 55%)' },
  { id: 'expand', label: 'EXPAND', description: 'New systems shift the combinatorial topology — more to discover next cycle', icon: '🌐', color: 'hsl(160, 70%, 50%)' },
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
    <section ref={ref} className="py-20 sm:py-24 md:py-40 px-5 sm:px-6 relative overflow-hidden">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_60%)]" />
      
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
            The Crystallization Engine
          </h2>
          <p className="text-center text-muted-foreground/70 mb-12 sm:mb-16 max-w-2xl mx-auto text-sm sm:text-base px-2 leading-relaxed">
            Each cycle expands the search space. Crystallization is not linear —{' '}
            <span className="text-foreground font-semibold">it compounds</span>.
          </p>
        </motion.div>

        {/* Loop visualization */}
        <div className="flex items-center justify-center mb-12 sm:mb-16">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[440px] md:h-[440px]">
            {/* Rotating rings */}
            <motion.div
              className="absolute inset-0 rounded-full border border-primary/15"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-border/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            {/* Inner glow ring */}
            <motion.div
              className="absolute inset-8 rounded-full border border-primary/5"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
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
                    left: `calc(50% + ${Math.cos(angle) * radius}px - 42px)`,
                    top: `calc(50% + ${Math.sin(angle) * radius}px - 30px)`,
                    width: 84,
                  }}
                  animate={{
                    scale: isActive ? 1.25 : 0.85,
                    opacity: isActive ? 1 : 0.35,
                  }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                >
                  <div
                    className="text-2xl sm:text-3xl md:text-4xl mb-1 transition-all duration-300"
                    style={{ filter: isActive ? `drop-shadow(0 0 16px ${phase.color})` : 'none' }}
                  >
                    {phase.icon}
                  </div>
                  <span className="text-[11px] sm:text-xs md:text-sm font-mono font-bold tracking-wider text-foreground whitespace-nowrap">
                    {phase.label}
                  </span>
                </motion.div>
              );
            })}

            {/* Center — infinity symbol */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={cycleCount}
                initial={{ scale: 1.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="font-mono text-4xl sm:text-5xl font-black text-primary/60"
              >
                ∞
              </motion.div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest mt-1 font-mono">
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
            className="text-center max-w-xl mx-auto px-2"
          >
            <div className="text-lg sm:text-xl font-mono font-bold text-foreground mb-2">
              {PHASES[activePhase].label}
            </div>
            <div className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {PHASES[activePhase].description}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Formula */}
        <div className="mt-14 sm:mt-20 text-center">
          <div className="inline-block bg-card/50 border border-border/20 rounded-xl px-6 sm:px-10 py-4 sm:py-5 font-mono text-sm sm:text-base text-muted-foreground shadow-lg shadow-primary/5">
            <span className="text-foreground font-bold">topology(n+1)</span>
            {' = '}
            <span className="text-foreground font-bold">topology(n)</span>
            {' × '}
            <span className="text-primary font-bold">discovered(n)</span>
            <span className="block mt-2 text-xs text-muted-foreground/50">
              Every discovery changes the denominator
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
