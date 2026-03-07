/**
 * Memory Stream Hero — Cinematic opening for the flagship product page
 * All metrics are real production data from the substrate.
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MemoryRiver } from '@/components/hero/MemoryRiver';

export function FoundryHero() {
  const navigate = useNavigate();

  return (
    <section className="relative flex flex-col items-center justify-start px-5 sm:px-6 pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-20 overflow-hidden min-h-[90vh] sm:min-h-0">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Radial glow — dramatic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,hsl(var(--neon-purple)/0.04),transparent_60%)]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(var(--neon-cyan)/0.03),transparent_60%)]" />

      <div className="relative text-center max-w-5xl w-full">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-8 sm:mb-10"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-primary/80">
            Memory Stream — Live
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[2.5rem] sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.9] mb-6 sm:mb-8"
        >
          Software that
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-[hsl(var(--neon-cyan))] bg-clip-text text-transparent">
            crystallizes software
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2"
        >
          A recursive discovery engine that surfaces production-grade software pipelines
          directly from silicon.{' '}
          <span className="text-foreground font-semibold">1,143 programs discovered in under 9 hours.</span>
          {' '}The stream never stops.
        </motion.p>

        {/* Primary CTA — above the fold */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14"
        >
          <button
            onClick={() => navigate('/auth?redirect=/foundry')}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-primary text-primary-foreground rounded-xl font-mono text-sm sm:text-base font-bold hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 min-h-[52px] crystallize-glow"
          >
            Start Crystallizing — Free
          </button>
          <button
            onClick={() => {
              document.getElementById('verify')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 border border-border/30 text-foreground rounded-xl font-mono text-sm sm:text-base font-medium hover:bg-muted/20 transition-all duration-200 min-h-[52px]"
          >
            Verify the Data ↓
          </button>
        </motion.div>

        {/* Memory Stream visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-12 sm:mb-14"
        >
          <MemoryRiver autoCrystallize hideTagline />
        </motion.div>

        {/* Key stat trio */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center justify-center gap-6 sm:gap-10 md:gap-16 font-mono"
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground tracking-tight">1,143</div>
            <div className="text-xs sm:text-xs text-muted-foreground uppercase tracking-[0.12em] mt-1">Pipelines Crystallized</div>
          </div>
          <div className="w-px h-10 sm:h-12 bg-border/20" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-5xl font-black text-primary tracking-tight">95</div>
            <div className="text-xs sm:text-xs text-muted-foreground uppercase tracking-[0.12em] mt-1">Perfect Scores</div>
          </div>
          <div className="w-px h-10 sm:h-12 bg-border/20" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground tracking-tight">&lt;9h</div>
            <div className="text-xs sm:text-xs text-muted-foreground uppercase tracking-[0.12em] mt-1">Total Runtime</div>
          </div>
        </motion.div>

        {/* Runtime detail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 sm:mt-8 text-xs font-mono text-muted-foreground/40 px-2"
        >
          431 autonomous runs · 9 capability domains · avg CJPI 94.0
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1 }, y: { duration: 2, repeat: Infinity } }}
      >
        <div className="w-5 h-8 rounded-full border border-border/30 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/30" />
        </div>
      </motion.div>
    </section>
  );
}
