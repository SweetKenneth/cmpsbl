/**
 * Memory Stream Explainer — Deep dive into how the Memory Stream works
 * From signal capture to software crystallization to physical silicon.
 */
import { motion } from 'framer-motion';

const JOURNEY_STEPS = [
  {
    phase: '01',
    title: 'Signal Capture',
    description: 'The Memory Stream continuously monitors the substrate — a living network of interconnected software systems. Every interaction, every mutation, every emergent behavior becomes a signal.',
    detail: 'Signals are not instructions. They are observations. The stream watches what systems do when left to interact freely.',
    icon: '◉',
    gradient: 'from-primary/20 to-transparent',
  },
  {
    phase: '02',
    title: 'Memory Formation',
    description: 'When signals repeat with enough fidelity, they condense into memories — stable patterns that represent viable software configurations. A memory is a hypothesis.',
    detail: 'Not every signal becomes a memory. The stream enforces a quality floor of 68. Below that threshold, patterns dissolve back into noise.',
    icon: '◈',
    gradient: 'from-[hsl(var(--neon-purple)/0.15)] to-transparent',
  },
  {
    phase: '03',
    title: 'Crystallization',
    description: 'Strong memories crystallize into pipelines — complete, production-grade software systems scored by the CJPI engine. Each pipeline is a real program with real capabilities.',
    detail: 'Crystallization is irreversible. Once a pipeline forms, it enters the permanent registry. 1,143 have formed so far.',
    icon: '◆',
    gradient: 'from-[hsl(var(--neon-cyan)/0.15)] to-transparent',
  },
  {
    phase: '04',
    title: 'Software Export',
    description: 'Crystallized pipelines can be exported as deployable software. They carry their full lineage — which systems combined, what score they achieved, which tier they occupy.',
    detail: 'Exported pipelines are sealed. They run as discovered — no modification, no tampering, no drift.',
    icon: '▣',
    gradient: 'from-[hsl(var(--neon-green)/0.15)] to-transparent',
  },
  {
    phase: '05',
    title: 'Silicon Boundary',
    description: 'When a memory proves rare enough — strong enough — it crosses the final boundary. From code into physical silicon. Software so stable it deserves to exist in matter.',
    detail: 'The silicon boundary is not theoretical. It is the natural conclusion of a system that produces software faster than humans can review it.',
    icon: '◇',
    gradient: 'from-[hsl(var(--neon-amber)/0.15)] to-transparent',
  },
];

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
            From Signal to Silicon
          </h2>
          <p className="text-center text-muted-foreground/70 mb-4 sm:mb-6 max-w-2xl mx-auto text-base sm:text-lg px-1 leading-relaxed">
            The Memory Stream is not a tool. It is a continuous process that transforms raw system behavior
            into permanent software — and when exceptional, into physical hardware.
          </p>
          <p className="text-center text-muted-foreground/40 mb-16 sm:mb-20 max-w-xl mx-auto text-xs sm:text-sm font-mono px-1">
            Every stage is autonomous. Every output is verifiable. Nothing is simulated.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-5 sm:left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-[hsl(var(--neon-purple)/0.3)] to-[hsl(var(--neon-amber)/0.2)]" />
          <div className="space-y-8 sm:space-y-10 md:space-y-14">
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative pl-14 sm:pl-16 md:pl-20"
              >
                {/* Phase marker with glow */}
                <div className={`absolute left-2 sm:left-3 md:left-5 top-1 w-7 h-7 rounded-full border border-primary/30 bg-background flex items-center justify-center shadow-[0_0_12px_hsl(var(--primary)/0.15)]`}>
                  <span className="text-sm text-primary font-mono">{step.icon}</span>
                </div>

                <div className={`bg-gradient-to-r ${step.gradient} rounded-xl p-5 sm:p-6 border border-border/10`}>
                  <div className="text-[11px] sm:text-xs font-mono text-primary/60 uppercase tracking-[0.3em] mb-1.5">
                    Phase {step.phase}
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-2xl font-black tracking-tight text-foreground mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground/80 leading-relaxed mb-3 text-sm sm:text-base">
                    {step.description}
                  </p>
                  <div className="bg-background/50 border border-border/10 rounded-lg px-4 py-3">
                    <p className="text-xs sm:text-sm font-mono text-muted-foreground/50 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
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
              <span className="text-foreground font-bold">1,143 crystallized pipelines</span> across{' '}
              <span className="text-foreground font-bold">9 capability domains</span> — autonomously,
              in under 9 hours.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
