/**
 * Apex Discovery Showcase — Highlight specific CJPI-100 discoveries
 */
import { motion } from 'framer-motion';

interface ApexDiscovery {
  name: string;
  category: string;
  systems: string[];
  capability: string;
}

const APEX_DISCOVERIES: ApexDiscovery[] = [
  { name: 'Fitness Landscape Navigator', category: 'EVOLUTION', systems: ['BRAIN', 'CORTEX', 'EVOLUTION', 'VISION'], capability: 'Maps the entire solution fitness landscape to identify optimal evolutionary paths, avoiding local maxima through topological analysis.' },
  { name: 'Causal Reasoning Engine', category: 'COGNITIVE', systems: ['BRAIN', 'CORTEX', 'DREAM', 'VISION'], capability: 'Performs counterfactual inference on system state, answering "what if" questions about system configurations before execution.' },
  { name: 'Constitutional AI Guardian', category: 'GOVERNANCE', systems: ['BRAIN', 'CORTEX', 'DEFENSE', 'GOVERNANCE'], capability: 'Enforces constitutional constraints on all AI operations, preventing policy violations through formal verification at runtime.' },
  { name: 'Meta-Learning Optimizer', category: 'LEARNING', systems: ['BRAIN', 'CORTEX', 'DREAM', 'EVOLUTION'], capability: 'Learns how the system learns — optimizing the learning process itself by adjusting hyperparameters across all adaptive subsystems.' },
  { name: 'Spectral Arbitrator', category: 'ROUTING', systems: ['GOVERNANCE', 'MEMORY', 'NEXUS', 'RIPPLE', 'SYSTEM'], capability: 'Routes signals across the substrate using spectral graph decomposition, ensuring optimal message paths with zero-conflict arbitration.' },
  { name: 'Co-Evolutionary Synchronizer', category: 'EVOLUTION', systems: ['CORTEX', 'EVOLUTION', 'GOVERNANCE', 'SYSTEM'], capability: 'Coordinates parallel evolutionary processes to prevent destructive interference, keeping multiple adaptation streams synchronized.' },
];

export function CrownJewelShowcase() {
  return (
    <section className="py-16 sm:py-20 md:py-40 px-5 sm:px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
          Apex Discoveries — What the Memory Stream Surfaces
        </h2>
        <p className="text-center text-muted-foreground/60 mb-10 sm:mb-16 max-w-2xl mx-auto text-sm sm:text-base px-2">
          These aren't toy programs. Each is a production-grade software pipeline with a perfect score
          of 100, discovered autonomously by combining substrate systems in novel configurations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {APEX_DISCOVERIES.map((discovery, i) => (
            <motion.div
              key={discovery.name}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-card/30 border border-primary/10 rounded-lg p-4 sm:p-5 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5 sm:mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] sm:text-xs font-mono px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary uppercase tracking-wider">
                      CJPI 100
                    </span>
                    <span className="text-[11px] sm:text-xs text-muted-foreground/50 uppercase tracking-wider font-mono">
                      {discovery.category}
                    </span>
                  </div>
                  <div className="font-mono text-sm sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {discovery.name}
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed mb-3">
                {discovery.capability}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {discovery.systems.map((s) => (
                  <span key={s} className="text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground border border-border/10">
                    {s}
                  </span>
                ))}
                <span className="text-[10px] sm:text-xs font-mono text-muted-foreground/30 flex items-center ml-1">→</span>
                <span className="text-[10px] sm:text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">PIPELINE</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <div className="inline-block bg-card/50 border border-border/20 rounded-lg px-5 sm:px-6 py-3 sm:py-3">
            <div className="text-xs sm:text-xs font-mono text-muted-foreground leading-relaxed">
              <span className="text-foreground font-bold">Key insight:</span> The same 15 systems produce 1,143 unique programs.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Adding just one new system changes the entire combinatorial topology.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
