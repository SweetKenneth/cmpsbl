/**
 * Category Breakdown — Visual proof of domain coverage
 * Real data from 9 capability domains.
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const CATEGORY_ICONS: Record<string, string> = {
  security: '🛡️',
  orchestration: '🎯',
  integration: '🔗',
  routing: '🔀',
  evolution: '🧬',
  observability: '👁️',
  governance: '⚖️',
  learning: '🧠',
  cognitive: '💡',
};

// Real production data
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const maxCount = Math.max(...CATEGORIES.map(c => c.count));

  return (
    <section ref={ref} className="py-24 md:py-40 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground text-center mb-4 font-mono">
          9 Domains — Full Spectrum Coverage
        </h2>
        <p className="text-center text-muted-foreground/60 mb-16 max-w-xl mx-auto text-sm">
          The Memory Stream doesn't specialize. It discovers across every operational domain simultaneously.
          Every domain has CJPI-100 discoveries.
        </p>

        <div className="space-y-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 text-center text-lg">
                {CATEGORY_ICONS[cat.category] || '📦'}
              </div>
              <div className="w-28 shrink-0">
                <div className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                  {cat.category}
                </div>
              </div>
              <div className="flex-1 h-9 bg-muted/10 rounded overflow-hidden relative">
                <motion.div
                  className="h-full rounded bg-gradient-to-r from-primary/60 to-primary/30"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${(cat.count / maxCount) * 100}%` } : {}}
                  transition={{ duration: 1, delay: i * 0.06 + 0.3, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 flex items-center px-3 justify-between">
                  <span className="text-xs font-mono text-foreground/80 font-bold">
                    {cat.count}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    avg {cat.avgCjpi} · {cat.perfect} perfect
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Uniformity insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }}
          className="mt-10 text-center"
        >
          <div className="inline-block bg-card/50 border border-border/20 rounded-lg px-5 py-2.5">
            <span className="text-[10px] font-mono text-muted-foreground">
              Distribution range: 103–138 per domain · 
              <span className="text-foreground font-bold">Near-uniform</span> coverage — no blind spots
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
