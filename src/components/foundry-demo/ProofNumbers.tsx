/**
 * Proof Numbers — Hard stats from the database
 * Animated counters showing real discovery data
 */
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
}

function AnimatedStat({ label, value, suffix = '', prefix = '', delay = 0 }: StatProps) {
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
      <div className="text-5xl md:text-7xl font-black tracking-tighter text-foreground font-mono">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm md:text-base text-muted-foreground mt-2 uppercase tracking-[0.2em] font-medium">
        {label}
      </div>
    </motion.div>
  );
}

interface ProofNumbersProps {
  stats: {
    totalDiscoveries: number;
    totalRuns: number;
    peakCjpi: number;
    avgCjpi: number;
    apexCount: number;
    enterpriseCount: number;
    categories: number;
  };
}

export function ProofNumbers({ stats }: ProofNumbersProps) {
  return (
    <section className="py-24 md:py-40 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground text-center mb-20 font-mono">
          Auditable Proof — Live Production Data
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          <AnimatedStat label="Pipelines Discovered" value={stats.totalDiscoveries} delay={0} />
          <AnimatedStat label="Discovery Runs" value={stats.totalRuns} delay={200} />
          <AnimatedStat label="Peak CJPI" value={stats.peakCjpi} delay={400} />
          <AnimatedStat label="Avg Quality Score" value={stats.avgCjpi} delay={600} />
        </div>

        <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/30">
          <AnimatedStat label="Apex Tier (CJPI 95+)" value={stats.apexCount} delay={800} />
          <AnimatedStat label="Enterprise Tier" value={stats.enterpriseCount} delay={1000} />
          <AnimatedStat label="Domains Covered" value={stats.categories} delay={1200} />
        </div>
      </motion.div>
    </section>
  );
}
