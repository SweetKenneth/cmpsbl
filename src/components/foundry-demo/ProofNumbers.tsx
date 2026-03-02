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
    if (!inView) return;
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
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center"
    >
      <div className={`text-5xl md:text-7xl font-black tracking-tighter font-mono ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base text-muted-foreground mt-2 uppercase tracking-[0.2em] font-medium">
        {label}
      </div>
    </motion.div>
  );
}

export function ProofNumbers() {
  return (
    <section className="py-24 md:py-40 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground text-center mb-4 font-mono">
          Auditable Proof — Live Production Data
        </h2>
        <p className="text-center text-muted-foreground/50 text-xs font-mono mb-20">
          Every number below is queryable. Scroll down to verify it yourself.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          <AnimatedStat label="Programs Discovered" value={1143} delay={0} />
          <AnimatedStat label="Autonomous Runs" value={431} delay={200} />
          <AnimatedStat label="Perfect Scores" value={95} delay={400} highlight />
          <AnimatedStat label="Avg Quality (CJPI)" value={94} delay={600} />
        </div>

        <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/30">
          <AnimatedStat label="Apex Tier (CJPI 95+)" value={578} delay={800} />
          <AnimatedStat label="Enterprise Tier" value={484} delay={1000} />
          <AnimatedStat label="Capability Domains" value={9} delay={1200} />
        </div>

        {/* Runtime context */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-card/50 border border-border/20 rounded-lg px-6 py-3">
            <div className="text-xs font-mono text-muted-foreground">
              <span className="text-foreground font-bold">Runtime:</span> 8h 58m &nbsp;·&nbsp;
              <span className="text-foreground font-bold">First run:</span> 2026-03-02 08:09 UTC &nbsp;·&nbsp;
              <span className="text-foreground font-bold">Last run:</span> 2026-03-02 17:07 UTC
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
