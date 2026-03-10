/**
 * Apex Discovery Showcase — Highlight specific CJPI-100 discoveries
 * Functional descriptions replace node lists for visitor comprehension.
 */
import { motion } from 'framer-motion';

interface ApexDiscovery {
  name: string;
  category: string;
  score: number;
  tier: string;
  systems: string[];
  capability: string;
  whatItDoes: string;
}

const TOP_DISCOVERIES: ApexDiscovery[] = [
  { name: 'Constitutional AI Guardian', score: 100, tier: 'APEX', category: 'GOVERNANCE', systems: ['BRAIN', 'CORTEX', 'DEFENSE', 'GOVERNANCE'], capability: 'Enforces constitutional constraints on all AI operations, preventing policy violations through formal verification at runtime.', whatItDoes: 'Validates every AI operation against safety constraints in real time, blocking policy violations automatically.' },
  { name: 'Autonomous Threat Response Engine', score: 97, tier: 'MYTHIC', category: 'SECURITY', systems: ['DEFENSE', 'NERVE', 'IMMUNITY', 'SYSTEM'], capability: 'Detects, classifies, and neutralizes threats autonomously — from anomalous traffic to zero-day exploit patterns — without human intervention.', whatItDoes: 'Automatically detects and responds to security threats in real time, isolating compromised components before damage spreads.' },
  { name: 'Predictive Infrastructure Scaler', score: 96, tier: 'MYTHIC', category: 'INFRASTRUCTURE', systems: ['ANALYTICS', 'BRAIN', 'NERVE', 'SYSTEM'], capability: 'Forecasts resource demand using historical patterns and live telemetry, scaling infrastructure preemptively to prevent bottlenecks.', whatItDoes: 'Predicts traffic spikes and auto-scales servers, databases, and compute before demand hits — zero downtime.' },
  { name: 'Compliance Audit Automator', score: 94, tier: 'MYTHIC', category: 'COMPLIANCE', systems: ['AUDIT', 'GOVERNANCE', 'MEMORY', 'SOVEREIGN'], capability: 'Continuously audits system operations against regulatory frameworks (SOC2, GDPR, HIPAA), generating verifiable compliance reports automatically.', whatItDoes: 'Runs continuous compliance checks and produces audit-ready reports — replacing weeks of manual review with real-time validation.' },
  { name: 'Intelligent Data Pipeline Orchestrator', score: 93, tier: 'RELIC', category: 'DATA', systems: ['CORTEX', 'DECODE', 'INTEGRATION', 'RELAY'], capability: 'Coordinates complex multi-source data pipelines with automatic schema detection, transformation, and delivery across heterogeneous systems.', whatItDoes: 'Connects any data source to any destination with automatic format conversion, error recovery, and delivery guarantees.' },
];

/** @deprecated Use ApexDiscoveryShowcase instead */
export const CrownJewelShowcase = ApexDiscoveryShowcase;

export function ApexDiscoveryShowcase() {
  return (
    <section className="py-20 sm:py-24 md:py-40 px-5 sm:px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.04),transparent_60%)]" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
            Top Discoveries — What the Memory Stream Surfaces
          </h2>
          <p className="text-center text-foreground/90 mb-2 max-w-2xl mx-auto text-sm sm:text-base px-2 leading-relaxed font-medium">
            The highest-value software pipelines discovered by the substrate.
            Each solves a real problem teams face every day.
          </p>
          <p className="text-center text-muted-foreground/60 mb-12 sm:mb-16 max-w-2xl mx-auto text-xs sm:text-sm px-2 leading-relaxed font-mono">
            Pipelines are executable software architectures automatically discovered
            by combining substrate systems in novel configurations.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {TOP_DISCOVERIES.map((discovery, i) => (
            <motion.div
              key={discovery.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group bg-card/30 border border-primary/10 rounded-xl p-5 sm:p-6 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[11px] sm:text-xs font-mono px-2 py-1 rounded-md border border-primary/30 bg-primary/10 text-primary uppercase tracking-wider font-bold">
                      CJPI: {discovery.score}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-primary/50 italic">
                      {discovery.tier}
                    </span>
                    <span className="text-[11px] sm:text-xs text-muted-foreground/50 uppercase tracking-wider font-mono">
                      {discovery.category}
                    </span>
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {discovery.name}
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed mb-3.5">
                {discovery.capability}
              </p>
              <div className="bg-muted/20 border border-border/10 rounded-lg px-3 py-2.5">
                <p className="text-xs sm:text-sm font-mono text-foreground/70 leading-relaxed">
                  <span className="text-primary/70 font-bold text-[10px] sm:text-xs uppercase tracking-wider mr-1.5">What it does →</span>
                  {discovery.whatItDoes}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-12 text-center"
        >
          <div className="inline-block bg-card/50 border border-border/15 rounded-xl px-6 sm:px-8 py-3.5 sm:py-4 backdrop-blur-sm">
            <div className="text-xs sm:text-sm font-mono text-muted-foreground leading-relaxed">
              <span className="text-foreground font-bold">Key insight:</span> The same 15 systems produce 1,143 unique programs.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Adding just one new system changes the entire combinatorial topology.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
