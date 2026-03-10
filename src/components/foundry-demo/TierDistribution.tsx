/**
 * Tier Distribution — Visual breakdown of discovery quality
 */
import { motion } from 'framer-motion';

interface TierData {
  tier: string; count: number; label: string; color: string; description: string; percentage: string;
}

const TIERS: TierData[] = [
  { tier: 'apex',   count: 95,  label: 'APEX',   color: 'hsl(var(--primary))',    description: 'CJPI 100 · Perfect score crown achievements',       percentage: '8.3%' },
  { tier: 'mythic', count: 187, label: 'MYTHIC', color: 'hsl(280, 80%, 65%)',     description: 'CJPI 94–99 · Near-perfect synthesis — silicon-eligible', percentage: '16.4%' },
  { tier: 'relic',  count: 296, label: 'RELIC',  color: 'hsl(45, 95%, 55%)',      description: 'CJPI 90–93 · Rare finds — exceptional capability',  percentage: '25.9%' },
  { tier: 'prime',  count: 312, label: 'PRIME',  color: 'hsl(200, 80%, 60%)',     description: 'CJPI 80–89 · High-quality production pipelines',    percentage: '27.3%' },
  { tier: 'mint',   count: 192, label: 'MINT',   color: 'hsl(160, 60%, 50%)',     description: 'CJPI 68–79 · Solid discovery — production-viable',  percentage: '16.8%' },
  { tier: 'raw',    count: 61,  label: 'RAW',    color: 'hsl(0, 0%, 50%)',        description: 'CJPI 1–67 · Unrefined extraction — experimental',   percentage: '5.3%' },
];

export function TierDistribution() {
  const total = TIERS.reduce((s, t) => s + t.count, 0);

  return (
    <section className="py-20 sm:py-24 md:py-40 px-5 sm:px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
            Quality Distribution
          </h2>
          <p className="text-center text-muted-foreground/50 text-xs sm:text-sm font-mono mb-12 sm:mb-16 px-2">
            {total.toLocaleString()} programs · <span className="text-primary font-bold">6 tiers</span> · Quality floor at CJPI 68
          </p>
        </motion.div>

        {/* Stacked bar */}
        <div className="h-14 sm:h-16 rounded-xl overflow-hidden flex mb-8 sm:mb-10 border border-border/10 shadow-lg shadow-primary/5">
          {TIERS.map((t) => (
            <motion.div
              key={t.tier}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full relative group cursor-default flex items-center justify-center origin-left"
              style={{ backgroundColor: t.color, width: `${(t.count / total) * 100}%` }}
            >
              <span className="text-xs sm:text-sm font-mono font-bold text-black/60 group-hover:text-black/90 transition-colors">
                {t.percentage}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.tier}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-3 bg-card/20 border border-border/10 rounded-xl p-4 sm:p-5 hover:border-border/20 transition-colors"
            >
              <div className="w-4 h-4 rounded-md mt-0.5 shrink-0 shadow-sm" style={{ backgroundColor: t.color }} />
              <div>
                <div className="font-mono text-sm sm:text-base font-bold text-foreground">
                  {t.label} <span className="text-muted-foreground font-normal">· {t.count}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground/60 mt-1 leading-relaxed">{t.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2.5 bg-card/50 border border-border/15 rounded-xl px-6 sm:px-8 py-3 sm:py-3.5 backdrop-blur-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/30" />
            <span className="text-xs sm:text-sm font-mono text-muted-foreground">
              Quality floor: <span className="text-foreground font-bold">Score 68</span> · Nothing below Mint-grade enters the registry
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
