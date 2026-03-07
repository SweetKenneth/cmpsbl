/**
 * Memory Stream Hero — Opening cinematic for the discovery demo
 * All metrics are real production data from the substrate.
 */
import { motion } from 'framer-motion';
import { MemoryRiver } from '@/components/hero/MemoryRiver';

export function FoundryHero() {
  return (
    <section className="relative flex flex-col items-center justify-start px-4 sm:px-6 pt-16 sm:pt-20 pb-14 sm:pb-16 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_60%)]" />

      <div className="relative text-center max-w-4xl w-full">
        <div className="text-xs sm:text-xs font-mono uppercase tracking-[0.25em] sm:tracking-[0.4em] text-muted-foreground mb-6 sm:mb-8">
          Memory Stream — CMPSBL®
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.9] mb-6 sm:mb-8">
          Software that
          <br />
          <span className="text-primary">crystallizes software</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2">
          A recursive discovery engine that surfaces high-quality software pipelines
          directly from silicon. 1,143 programs discovered in under 9 hours.
          The stream never ends.
        </p>

        {/* Memory Stream visualization */}
        <div className="mb-10 sm:mb-12">
          <MemoryRiver autoCrystallize hideTagline />
        </div>

        {/* Key stat trio */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-16 font-mono">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">1,143</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-[0.12em] sm:tracking-[0.2em]">Pipelines Crystallized</div>
          </div>
          <div className="w-px h-8 sm:h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-primary">95</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-[0.12em] sm:tracking-[0.2em]">Perfect CJPI 100</div>
          </div>
          <div className="w-px h-8 sm:h-10 bg-border/30" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground">~9h</div>
            <div className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-[0.12em] sm:tracking-[0.2em]">Total Runtime</div>
          </div>
        </div>

        {/* Runtime detail */}
        <div className="mt-6 sm:mt-8 text-xs sm:text-xs font-mono text-muted-foreground/50 px-2">
          431 autonomous discovery runs · 9 capability domains · avg CJPI 94.0
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border border-border/30 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/30" />
        </div>
      </motion.div>
    </section>
  );
}
