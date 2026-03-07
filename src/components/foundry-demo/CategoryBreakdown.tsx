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
    <section className="py-20 md:py-40 px-4 sm:px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[10px] sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-muted-foreground text-center mb-3 sm:mb-4 font-mono">
          9 Domains — Full Spectrum Coverage
        </h2>
        <p className="text-center text-muted-foreground/60 mb-12 sm:mb-16 max-w-xl mx-auto text-xs sm:text-sm px-2">
          The Memory Stream doesn't specialize. It discovers across every operational domain simultaneously.
          Every domain has CJPI-100 discoveries.
        </p>

        <div className="space-y-2.5 sm:space-y-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={false}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="flex items-center gap-2.5 sm:gap-4"
            >
              <div className="w-6 sm:w-8 text-center text-base sm:text-lg shrink-0">
                {CATEGORY_ICONS[cat.category] || '📦'}
              </div>
              <div className="w-20 sm:w-28 shrink-0">
                <div className="text-[10px] sm:text-xs font-mono font-bold text-foreground uppercase tracking-wider truncate">
                  {cat.category}
                </div>
              </div>
              <div className="flex-1 h-8 sm:h-9 bg-muted/10 rounded overflow-hidden relative">
                <div
                  className="h-full rounded bg-gradient-to-r from-primary/60 to-primary/30"
                  style={{ width: `${(cat.count / maxCount) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center px-2 sm:px-3 justify-between">
                  <span className="text-[10px] sm:text-xs font-mono text-foreground/80 font-bold">{cat.count}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground hidden sm:inline">avg {cat.avgCjpi} · {cat.perfect} perfect</span>
                  <span className="text-[9px] font-mono text-muted-foreground sm:hidden">{cat.perfect}★</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 text-center">
          <div className="inline-block bg-card/50 border border-border/20 rounded-lg px-4 sm:px-5 py-2 sm:py-2.5">
            <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground">
              Distribution range: 103–138 per domain · <span className="text-foreground font-bold">Near-uniform</span> coverage — no blind spots
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
