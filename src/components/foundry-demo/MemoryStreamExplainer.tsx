/**
 * Memory Stream Explainer — Deep dive into how the Memory Stream works
 * Compressed: one-sentence visible, detail in collapsible.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const JOURNEY_STEPS = [
  {
    phase: '01',
    title: 'Signal Capture',
    summary: 'The Memory Stream continuously monitors every interaction, mutation, and emergent behavior across the substrate.',
    detail: 'Signals are not instructions. They are observations. The stream watches what systems do when left to interact freely — a living network of interconnected software systems producing raw behavioral data.',
    icon: '◉',
    gradient: 'from-primary/20 to-transparent',
  },
  {
    phase: '02',
    title: 'Memory Formation',
    summary: 'When signals repeat with enough fidelity, they condense into memories — stable patterns representing viable software configurations.',
    detail: 'Not every signal becomes a memory. The stream enforces a quality floor of 68. Below that threshold, patterns dissolve back into noise. A memory is a hypothesis that has passed initial validation.',
    icon: '◈',
    gradient: 'from-[hsl(var(--neon-purple)/0.15)] to-transparent',
  },
  {
    phase: '03',
    title: 'Crystallization',
    summary: 'Strong memories crystallize into capabilities — complete, production-grade software systems scored by the CJPI engine.',
    detail: 'Crystallization is irreversible. Once a capability forms, it enters the permanent registry. Each capability is a real program with real functionality. 1,143 have formed so far.',
    icon: '◆',
    gradient: 'from-[hsl(var(--neon-cyan)/0.15)] to-transparent',
  },
  {
    phase: '04',
    title: 'Software Export',
    summary: 'Crystallized memories can be exported as deployable software, carrying their full lineage and quality score.',
    detail: 'Exported memories are sealed. They run as discovered — no modification, no tampering, no drift. Each carries which systems combined, what score they achieved, and which tier they occupy.',
    icon: '▣',
    gradient: 'from-[hsl(var(--neon-green)/0.15)] to-transparent',
  },
  {
    phase: '05',
    title: 'Silicon Boundary',
    summary: 'When a memory proves rare and strong enough, it crosses the final boundary — from code into physical silicon.',
    detail: 'The silicon boundary is not theoretical. It is the natural conclusion of a system that produces software faster than humans can review it. Software so stable it deserves to exist in matter.',
    icon: '◇',
    gradient: 'from-[hsl(var(--neon-amber)/0.15)] to-transparent',
  },
];

function PhaseCard({ step, index }: { step: typeof JOURNEY_STEPS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      key={step.phase}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative pl-14 sm:pl-16 md:pl-20"
    >
      {/* Phase marker with glow */}
      <div className="absolute left-2 sm:left-3 md:left-5 top-1 w-7 h-7 rounded-full border border-primary/30 bg-background flex items-center justify-center shadow-[0_0_12px_hsl(var(--primary)/0.15)]">
        <span className="text-sm text-primary font-mono">{step.icon}</span>
      </div>

      <div className={`bg-gradient-to-r ${step.gradient} rounded-xl p-5 sm:p-6 border border-border/10`}>
        <div className="text-[11px] sm:text-xs font-mono text-primary/60 uppercase tracking-[0.3em] mb-1.5">
          Phase {step.phase}
        </div>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mb-2 sm:mb-3">
          {step.title}
        </h3>
        <p className="text-muted-foreground/80 leading-relaxed text-sm sm:text-base">
          {step.summary}
        </p>

        {/* Expandable detail */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 mt-3 text-xs sm:text-sm font-mono text-primary/60 hover:text-primary transition-colors min-h-[36px]"
        >
          <span>{expanded ? 'Less detail' : 'More detail'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="bg-background/50 border border-border/10 rounded-lg px-4 py-3 mt-2">
                <p className="text-xs sm:text-sm font-mono text-muted-foreground/50 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function MemoryStreamExplainer() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 md:py-32 px-5 sm:px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.04),transparent_60%)]" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground text-center mb-4 font-mono">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground/70 mb-4 sm:mb-6 max-w-2xl mx-auto text-base sm:text-lg px-1 leading-relaxed">
            The Memory Stream captures raw system behavior and crystallizes it
            into production-grade software — and when exceptional, into physical hardware.
          </p>
          <p className="text-center text-muted-foreground/40 mb-16 sm:mb-20 max-w-xl mx-auto text-xs sm:text-sm font-mono px-1">
            Every stage is autonomous. Every output is verifiable. Nothing is simulated.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-5 sm:left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-[hsl(var(--neon-purple)/0.3)] to-[hsl(var(--neon-amber)/0.2)]" />
          <div className="space-y-8 sm:space-y-10 md:space-y-14">
            {JOURNEY_STEPS.map((step, i) => (
              <PhaseCard key={step.phase} step={step} index={i} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20 text-center"
        >
          <div className="inline-block bg-card/50 border border-border/20 rounded-xl px-6 sm:px-8 py-4 sm:py-5 max-w-lg shadow-lg shadow-primary/5">
            <p className="text-sm sm:text-base text-muted-foreground/70 leading-relaxed">
              The Memory Stream has already produced{' '}
              <span className="text-foreground font-bold">1,143 crystallized memories</span> across{' '}
              <span className="text-foreground font-bold">9 capability domains</span> — autonomously,
              in under 9 hours.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
