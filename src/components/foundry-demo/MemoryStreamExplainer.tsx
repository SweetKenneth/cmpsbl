/**
 * Memory Stream Explainer — Deep dive into how the Memory Stream works
 * From signal capture to software crystallization to physical silicon.
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const JOURNEY_STEPS = [
  {
    phase: '01',
    title: 'Signal Capture',
    description: 'The Memory Stream continuously monitors the substrate — a living network of interconnected software systems. Every interaction, every mutation, every emergent behavior is recorded as a signal. These signals are the raw material of discovery.',
    detail: 'Signals are not instructions. They are observations. The stream watches what systems do when left to interact freely.',
    icon: '◉',
  },
  {
    phase: '02',
    title: 'Memory Formation',
    description: 'When signals repeat with enough fidelity, they condense into memories — stable patterns that represent viable software configurations. A memory is a hypothesis: this combination of systems produces something useful.',
    detail: 'Not every signal becomes a memory. The stream enforces a quality floor of 68. Below that threshold, patterns dissolve back into noise.',
    icon: '◈',
  },
  {
    phase: '03',
    title: 'Crystallization',
    description: 'Strong memories crystallize into pipelines — complete, production-grade software systems scored by the CJPI engine. Each pipeline is a real program with real capabilities, assembled from substrate systems that were never explicitly designed to work together.',
    detail: 'Crystallization is irreversible. Once a pipeline forms, it enters the permanent registry. 1,143 have formed so far.',
    icon: '◆',
  },
  {
    phase: '04',
    title: 'Software Export',
    description: 'Crystallized pipelines can be exported as deployable software. They carry their full lineage — which systems combined, what score they achieved, which tier they occupy. Every export is traceable back to its original signal.',
    detail: 'Exported pipelines are sealed. They run as discovered — no modification, no tampering, no drift.',
    icon: '▣',
  },
  {
    phase: '05',
    title: 'Silicon Boundary',
    description: 'When a memory proves rare enough — strong enough — it crosses the final boundary. From code into physical silicon. Burned onto hardware that outlasts every runtime it was born from. This is the endgame: software so stable it deserves to exist in matter.',
    detail: 'The silicon boundary is not theoretical. It is the natural conclusion of a system that produces software faster than humans can review it.',
    icon: '◇',
  },
];

export function MemoryStreamExplainer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="how-it-works" className="py-20 md:py-40 px-4 sm:px-6 relative overflow-hidden">
      {/* Section divider top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.04),transparent_60%)]" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[10px] sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
            From Signal to Silicon
          </h2>
          <p className="text-center text-muted-foreground/70 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2">
            The Memory Stream is not a tool. It is a continuous process that transforms raw system behavior
            into permanent software — and when that software proves exceptional, into physical hardware.
          </p>
          <p className="text-center text-muted-foreground/40 mb-16 sm:mb-20 max-w-xl mx-auto text-xs sm:text-sm font-mono px-2">
            Every stage is autonomous. Every output is verifiable. Nothing is simulated.
          </p>
        </motion.div>

        {/* Journey timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 sm:left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-border/40 via-primary/20 to-border/40" />

          <div className="space-y-10 sm:space-y-12 md:space-y-16">
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative pl-12 sm:pl-16 md:pl-20"
              >
                {/* Node */}
                <div className="absolute left-2 sm:left-3 md:left-5 top-1 w-6 h-6 rounded-full border border-border/30 bg-background flex items-center justify-center">
                  <span className="text-xs text-primary font-mono">{step.icon}</span>
                </div>

                <div className="text-[9px] sm:text-[10px] font-mono text-primary/60 uppercase tracking-[0.3em] mb-1">
                  Phase {step.phase}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-foreground mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground/70 leading-relaxed mb-3 text-sm">
                  {step.description}
                </p>
                <div className="bg-card/30 border border-border/15 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3">
                  <p className="text-[11px] sm:text-xs font-mono text-muted-foreground/50 leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Closing insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2 }}
          className="mt-16 sm:mt-20 text-center"
        >
          <div className="inline-block bg-card/50 border border-border/20 rounded-lg px-4 sm:px-6 py-3 sm:py-4 max-w-lg">
            <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed">
              The Memory Stream has already produced{' '}
              <span className="text-foreground font-bold">1,143 crystallized pipelines</span> across{' '}
              <span className="text-foreground font-bold">9 capability domains</span> — autonomously,
              in under 9 hours. Each one is a real program. Each one is verifiable.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
