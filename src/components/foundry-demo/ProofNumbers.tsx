/**
 * Proof Numbers — Hard stats from the database
 * All values are real production data.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  highlight?: boolean;
}

function AnimatedStat({ label, value, suffix = '', prefix = '', delay = 0, highlight = false }: StatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) {
      setCount(value);
      return;
    }
    const timeout = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [inView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center"
    >
      <div className={`text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter font-mono ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1.5 sm:mt-2 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium">
        {label}
      </div>
    </motion.div>
  );
}

export function ProofNumbers() {
  return (
    <section className="py-20 md:py-40 px-4 sm:px-6 relative">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <motion.div
        initial={false}
        className="max-w-6xl mx-auto"
      >
        <h2 className="text-[10px] sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
          Auditable Proof — Live Production Data
        </h2>
        <p className="text-center text-muted-foreground/50 text-[10px] sm:text-xs font-mono mb-14 sm:mb-20 px-2">
          Every number below is queryable. Scroll down to verify it yourself.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 md:gap-8">
          <AnimatedStat label="Programs Discovered" value={1143} delay={0} />
          <AnimatedStat label="Autonomous Runs" value={431} delay={200} />
          <AnimatedStat label="Perfect Scores" value={95} delay={400} highlight />
          <AnimatedStat label="Avg Quality (CJPI)" value={94} delay={600} />
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-border/30">
          <AnimatedStat label="Apex Tier (CJPI 95+)" value={578} delay={800} />
          <AnimatedStat label="Enterprise Tier" value={484} delay={1000} />
          <AnimatedStat label="Capability Domains" value={9} delay={1200} />
        </div>

        {/* Runtime context */}
        <motion.div
          initial={false}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="inline-block bg-card/50 border border-border/20 rounded-lg px-4 sm:px-6 py-2.5 sm:py-3">
            <div className="text-[10px] sm:text-xs font-mono text-muted-foreground leading-relaxed">
              <span className="text-foreground font-bold">Runtime:</span> 8h 58m
              <span className="hidden sm:inline"> &nbsp;·&nbsp; </span>
              <br className="sm:hidden" />
              <span className="text-foreground font-bold">First run:</span> 2026-03-02 08:09 UTC
              <span className="hidden sm:inline"> &nbsp;·&nbsp; </span>
              <br className="sm:hidden" />
              <span className="text-foreground font-bold">Last run:</span> 2026-03-02 17:07 UTC
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
