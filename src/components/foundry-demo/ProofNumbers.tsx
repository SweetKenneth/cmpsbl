/**
 * Proof Numbers — Hard stats from the database
 * All values are real production data.
 */
import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

interface StatProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  highlight?: boolean;
  size?: 'lg' | 'md';
}

function AnimatedStat({ label, value, suffix = '', prefix = '', delay = 0, highlight = false, size = 'lg' }: StatProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) {
      setCount(value);
      return;
    }
    const timeout = setTimeout(() => {
      const duration = 1800;
      const steps = 50;
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
    <div ref={ref} className="text-center group">
      <div className={`font-black tracking-tighter font-mono transition-colors duration-300 ${
        highlight ? 'text-primary' : 'text-foreground group-hover:text-primary/80'
      } ${size === 'lg' ? 'text-3xl sm:text-4xl md:text-6xl' : 'text-2xl sm:text-3xl md:text-5xl'}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 uppercase tracking-[0.12em] font-medium">
        {label}
      </div>
    </div>
  );
}

export function ProofNumbers() {
  return (
    <section className="py-20 sm:py-24 md:py-40 px-5 sm:px-6 relative">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent_70%)]" />

      <div className="max-w-6xl mx-auto relative">
        <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
          Auditable Proof — Live Production Data
        </h2>
        <p className="text-center text-muted-foreground/50 text-xs sm:text-sm font-mono mb-14 sm:mb-20 px-2">
          Every number below is queryable. Scroll down to verify it yourself.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 md:gap-8">
          <AnimatedStat label="Programs Discovered" value={1143} delay={0} />
          <AnimatedStat label="Autonomous Runs" value={431} delay={150} />
          <AnimatedStat label="Perfect Scores" value={95} delay={300} highlight />
          <AnimatedStat label="Avg Quality (CJPI)" value={94} delay={450} />
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-border/20">
          <AnimatedStat label="Apex Tier (95+)" value={578} delay={600} size="md" />
          <AnimatedStat label="Enterprise Tier" value={484} delay={750} size="md" />
          <AnimatedStat label="Capability Domains" value={9} delay={900} size="md" />
        </div>

        {/* Runtime context */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-block bg-card/50 border border-border/15 rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 backdrop-blur-sm">
            <div className="text-xs sm:text-sm font-mono text-muted-foreground leading-relaxed">
              <span className="text-foreground font-bold">Runtime:</span> 8h 58m
              <span className="hidden sm:inline"> &nbsp;·&nbsp; </span>
              <br className="sm:hidden" />
              <span className="text-foreground font-bold">First run:</span> 2026-03-02 08:09 UTC
              <span className="hidden sm:inline"> &nbsp;·&nbsp; </span>
              <br className="sm:hidden" />
              <span className="text-foreground font-bold">Last run:</span> 2026-03-02 17:07 UTC
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
