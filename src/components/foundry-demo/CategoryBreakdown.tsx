/**
 * Category Breakdown — Visual proof of domain coverage
 */
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface CategoryData {
  category: string;
  count: number;
  avgCjpi: number;
  maxCjpi: number;
}

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

interface CategoryBreakdownProps {
  categories: CategoryData[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const maxCount = Math.max(...categories.map(c => c.count));

  return (
    <section ref={ref} className="py-24 md:py-40 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground text-center mb-4 font-mono">
          9 Domains — Full Spectrum Coverage
        </h2>
        <p className="text-center text-muted-foreground/60 mb-16 max-w-xl mx-auto text-sm">
          The foundry doesn't specialize. It discovers across every operational domain simultaneously.
        </p>

        <div className="space-y-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
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
              <div className="flex-1 h-8 bg-muted/10 rounded overflow-hidden relative">
                <motion.div
                  className="h-full rounded bg-gradient-to-r from-primary/60 to-primary/30"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${(cat.count / maxCount) * 100}%` } : {}}
                  transition={{ duration: 1, delay: i * 0.08 + 0.3, ease: 'easeOut' }}
                />
                <div className="absolute inset-0 flex items-center px-3 justify-between">
                  <span className="text-xs font-mono text-foreground/80 font-bold">
                    {cat.count}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    avg {cat.avgCjpi} · peak {cat.maxCjpi}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
