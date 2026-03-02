/**
 * Live Discovery Stream — Animated feed of real discoveries from the database
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

interface Discovery {
  name: string;
  cjpi: number;
  tier: string;
  category: string;
  module_chain: string[];
  created_at: string;
}

const TIER_STYLES: Record<string, string> = {
  'cmpsbl-only': 'bg-primary/10 text-primary border-primary/30',
  'enterprise': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'architect': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
};

function DiscoveryCard({ discovery, index }: { discovery: Discovery; index: number }) {
  const tierStyle = TIER_STYLES[discovery.tier] || TIER_STYLES['architect'];

  return (
    <motion.div
      initial={{ opacity: 0, x: -40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-card/30 border border-border/20 rounded-lg p-4 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${tierStyle} uppercase tracking-wider`}>
              {discovery.tier === 'cmpsbl-only' ? 'APEX' : discovery.tier}
            </span>
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              {discovery.category}
            </span>
          </div>
          <div className="font-mono text-sm font-bold text-foreground truncate">
            {discovery.name}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {discovery.module_chain.map(m => (
              <span key={m} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-2xl font-mono font-black ${
            discovery.cjpi >= 95 ? 'text-primary' : 
            discovery.cjpi >= 85 ? 'text-amber-400' : 'text-sky-400'
          }`}>
            {discovery.cjpi}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">CJPI</div>
        </div>
      </div>
    </motion.div>
  );
}

interface LiveDiscoveryStreamProps {
  discoveries: Discovery[];
}

export function LiveDiscoveryStream({ discoveries }: LiveDiscoveryStreamProps) {
  const [visibleSet, setVisibleSet] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-50px' });
  const pageSize = 6;
  const totalSets = Math.ceil(discoveries.length / pageSize);

  useEffect(() => {
    if (!inView || totalSets <= 1) return;
    const interval = setInterval(() => {
      setVisibleSet(prev => (prev + 1) % totalSets);
    }, 5000);
    return () => clearInterval(interval);
  }, [inView, totalSets]);

  const currentDiscoveries = discoveries.slice(
    visibleSet * pageSize,
    (visibleSet + 1) * pageSize
  );

  return (
    <section ref={ref} className="py-24 md:py-40 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-mono">
              Discovery Stream
            </h2>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Real pipelines. Real scores. Real modules.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">
              {discoveries.length} surfaced
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={visibleSet}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {currentDiscoveries.map((d, i) => (
              <DiscoveryCard key={`${d.name}-${visibleSet}`} discovery={d} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Page indicators */}
        <div className="flex justify-center gap-1.5 mt-8">
          {Array.from({ length: totalSets }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === visibleSet ? 'bg-primary w-6' : 'bg-border/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
