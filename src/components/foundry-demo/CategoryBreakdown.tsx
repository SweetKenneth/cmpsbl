/**
 * Category Breakdown — Visual proof of domain coverage
 */
import { motion } from 'framer-motion';

const CATEGORY_ICONS: Record<string, string> = {
  security: '🛡️', orchestration: '🎯', integration: '🔗', routing: '🔀',
  evolution: '🧬', observability: '👁️', governance: '⚖️', learning: '🧠', cognitive: '💡',
};

const CATEGORIES = [
  { category: 'security', count: 138, avgCjpi: 94.6, maxCjpi: 100, perfect: 14 },
  { category: 'orchestration', count: 137, avgCjpi: 93.1, maxCjpi: 100, perfect: 10 },
  { category: 'integration', count: 135, avgCjpi: 93.3, maxCjpi: 100, perfect: 6 },
  { category: 'routing', count: 134, avgCjpi: 94.1, maxCjpi: 100, perfect: 13 },
  { category: 'evolution', count: 131, avgCjpi: 94.7, maxCjpi: 100, perfect: 16 },
  { category: 'observability', count: 125, avgCjpi: 93.6, maxCjpi: 100, perfect: 7 },
  { category: 'governance', count: 122, avgCjpi: 93.8, maxCjpi: 100, perfect: 10 },
  { category: 'learning', count: 118, avgCjpi: 94.3, maxCjpi: 100, perfect: 6 },
  { category: 'cognitive', count: 103, avgCjpi: 94.6, maxCjpi: 100, perfect: 13 },
];

export function CategoryBreakdown() {
  const maxCount = Math.max(...CATEGORIES.map(c => c.count));

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
            9 Domains — Full Spectrum Coverage
          </h2>
          <p className="text-center text-muted-foreground/70 mb-12 sm:mb-16 max-w-xl mx-auto text-sm sm:text-base px-2 leading-relaxed">
            The Memory Stream doesn't specialize. It discovers across{' '}
            <span className="text-foreground font-semibold">every operational domain simultaneously</span>.
            Every domain has CJPI-100 discoveries.
          </p>
        </motion.div>

        <div className="space-y-2.5 sm:space-y-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="flex items-center gap-3 sm:gap-4 group"
            >
              <div className="w-8 sm:w-9 text-center text-lg sm:text-xl shrink-0">
                {CATEGORY_ICONS[cat.category] || '📦'}
              </div>
              <div className="w-24 sm:w-28 shrink-0">
                <div className="text-xs sm:text-sm font-mono font-bold text-foreground uppercase tracking-wider truncate">
                  {cat.category}
                </div>
              </div>
              <div className="flex-1 h-10 sm:h-11 bg-muted/10 rounded-lg overflow-hidden relative group-hover:bg-muted/15 transition-colors">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-primary/50 to-primary/20 transition-all duration-500"
                  style={{ width: `${(cat.count / maxCount) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center px-3 sm:px-4 justify-between">
                  <span className="text-xs sm:text-sm font-mono text-foreground/80 font-bold">{cat.count}</span>
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline">avg {cat.avgCjpi} · {cat.perfect} perfect</span>
                  <span className="text-xs font-mono text-muted-foreground sm:hidden">{cat.perfect}★</span>
                </div>
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
          <div className="inline-block bg-card/50 border border-border/15 rounded-xl px-6 sm:px-8 py-3 sm:py-3.5 backdrop-blur-sm">
            <span className="text-xs sm:text-sm font-mono text-muted-foreground">
              Distribution range: 103–138 per domain · <span className="text-foreground font-bold">Near-uniform</span> — no blind spots
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
