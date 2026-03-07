/**
 * Tier Distribution — Visual breakdown of discovery quality
 */
import { motion } from 'framer-motion';

interface TierData {
  tier: string; count: number; label: string; color: string; description: string; percentage: string;
}

const TIERS: TierData[] = [
  { tier: 'cmpsbl-only', count: 578, label: 'APEX', color: 'hsl(var(--primary))', description: 'CJPI 95–100 · Proprietary crown jewels · 95 with perfect scores', percentage: '50.6%' },
  { tier: 'enterprise', count: 484, label: 'ENTERPRISE', color: 'hsl(45, 95%, 55%)', description: 'CJPI 85–94 · Production-grade pipelines', percentage: '42.3%' },
  { tier: 'architect', count: 81, label: 'ARCHITECT', color: 'hsl(200, 80%, 60%)', description: 'CJPI 80–84 · Advanced building blocks', percentage: '7.1%' },
];

export function TierDistribution() {
  const total = TIERS.reduce((s, t) => s + t.count, 0);

  return (
    <section className="py-20 md:py-40 px-4 sm:px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[10px] sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
          Quality Distribution
        </h2>
        <p className="text-center text-muted-foreground/50 text-[10px] sm:text-xs font-mono mb-12 sm:mb-16 px-2">
          {total.toLocaleString()} programs · 50.6% Apex tier · Zero below CJPI 80
        </p>

        <div className="h-10 sm:h-14 rounded-lg overflow-hidden flex mb-6 sm:mb-8 border border-border/10">
          {TIERS.map((t, i) => (
            <div
              key={t.tier}
              className="h-full relative group cursor-default flex items-center justify-center"
              style={{ backgroundColor: t.color, width: `${(t.count / total) * 100}%` }}
            >
              <span className="text-[10px] sm:text-xs font-mono font-bold text-black/70 opacity-0 group-hover:opacity-100 transition-opacity">
                {t.percentage}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.tier}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-3 h-3 rounded-sm mt-0.5 sm:mt-1 shrink-0" style={{ backgroundColor: t.color }} />
              <div>
                <div className="font-mono text-xs sm:text-sm font-bold text-foreground">
                  {t.label} <span className="text-muted-foreground font-normal">· {t.count}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">{t.description}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 sm:mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-card/50 border border-border/20 rounded-lg px-4 sm:px-5 py-2 sm:py-2.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">
              Quality floor: <span className="text-foreground font-bold">Score 68</span> · Nothing below Mint-grade enters the registry
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
