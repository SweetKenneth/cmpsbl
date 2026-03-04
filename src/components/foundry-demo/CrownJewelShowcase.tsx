/**
 * Crown Jewel Showcase — Highlight specific CJPI-100 discoveries
 * Shows what these programs actually DO and how they chain modules.
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface CrownJewel {
  name: string;
  category: string;
  modules: string[];
  capability: string;
}

const CROWN_JEWELS: CrownJewel[] = [
  {
    name: 'Fitness Landscape Navigator',
    category: 'EVOLUTION',
    modules: ['BRAIN', 'CORTEX', 'EVOLUTION', 'VISION'],
    capability: 'Maps the entire solution fitness landscape to identify optimal evolutionary paths, avoiding local maxima through topological analysis.',
  },
  {
    name: 'Causal Reasoning Engine',
    category: 'COGNITIVE',
    modules: ['BRAIN', 'CORTEX', 'DREAM', 'VISION'],
    capability: 'Performs counterfactual inference on system state, answering "what if" questions about module configurations before execution.',
  },
  {
    name: 'Constitutional AI Guardian',
    category: 'GOVERNANCE',
    modules: ['BRAIN', 'CORTEX', 'DEFENSE', 'GOVERNANCE'],
    capability: 'Enforces constitutional constraints on all AI operations, preventing policy violations through formal verification at runtime.',
  },
  {
    name: 'Meta-Learning Optimizer',
    category: 'LEARNING',
    modules: ['BRAIN', 'CORTEX', 'DREAM', 'EVOLUTION'],
    capability: 'Learns how the system learns — optimizing the learning process itself by adjusting hyperparameters across all adaptive subsystems.',
  },
  {
    name: 'Spectral Arbitrator',
    category: 'ROUTING',
    modules: ['GOVERNANCE', 'MEMORY', 'NEXUS', 'RIPPLE', 'SYSTEM'],
    capability: 'Routes signals across the substrate using spectral graph decomposition, ensuring optimal message paths with zero-conflict arbitration.',
  },
  {
    name: 'Co-Evolutionary Synchronizer',
    category: 'EVOLUTION',
    modules: ['CORTEX', 'EVOLUTION', 'GOVERNANCE', 'SYSTEM'],
    capability: 'Coordinates parallel evolutionary processes to prevent destructive interference, keeping multiple adaptation streams synchronized.',
  },
];

export function CrownJewelShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-24 md:py-40 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground text-center mb-4 font-mono">
          Apex Discoveries — What the Foundry Discovers
        </h2>
        <p className="text-center text-muted-foreground/60 mb-16 max-w-2xl mx-auto text-sm">
          These aren't toy programs. Each is a production-grade software pipeline with a perfect score
          of 100, discovered autonomously by combining substrate systems in novel configurations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CROWN_JEWELS.map((jewel, i) => (
            <motion.div
              key={jewel.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card/30 border border-primary/10 rounded-lg p-5 backdrop-blur-sm hover:border-primary/25 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary uppercase tracking-wider">
                      CJPI 100
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-mono">
                      {jewel.category}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-foreground">
                    {jewel.name}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed mb-3">
                {jewel.capability}
              </p>
              <div className="flex flex-wrap gap-1">
                {jewel.modules.map((m, j) => (
                  <motion.span
                    key={m}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: i * 0.1 + j * 0.05 + 0.3 }}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground border border-border/10"
                  >
                    {m}
                  </motion.span>
                ))}
                <span className="text-[9px] font-mono text-muted-foreground/30 flex items-center ml-1">
                  →
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  PIPELINE
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Module composition insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-card/50 border border-border/20 rounded-lg px-6 py-3">
            <div className="text-xs font-mono text-muted-foreground">
              <span className="text-foreground font-bold">Key insight:</span> The same 15 systems produce 1,143 unique programs.
              <br />
              Adding just one new system changes the entire combinatorial topology.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
