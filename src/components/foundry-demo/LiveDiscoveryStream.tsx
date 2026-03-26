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
  'enterprise': 'bg-neon-amber/10 text-neon-amber border-neon-amber/30',
  'architect': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
};

import { getFunctionalDescription } from '@/lib/pipeline-descriptions';
import { resolveArchetypeName, getDepthTier, getDepthTierStyle } from '@/lib/discovery/chain-archetypes';

function DiscoveryCard({ discovery, index }: { discovery: Discovery; index: number }) {
  const tierStyle = TIER_STYLES[discovery.tier] || TIER_STYLES['architect'];
  const archetypeName = resolveArchetypeName(discovery.module_chain);
  const depthTier = getDepthTier(discovery.module_chain.length);
  const depthStyle = getDepthTierStyle(depthTier);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.96 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="bg-card/30 border border-border/15 rounded-xl p-4 sm:p-5 backdrop-blur-sm hover:border-border/25 hover:bg-card/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[11px] sm:text-xs font-mono px-2 py-0.5 rounded-md border ${tierStyle} uppercase tracking-wider font-bold`}>
              {discovery.tier === 'cmpsbl-only' ? 'APEX' : discovery.tier}
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border ${depthStyle} uppercase tracking-wider font-semibold`}>
              {depthTier} · {discovery.module_chain.length}N
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground/50 uppercase tracking-wider">
              {discovery.category}
            </span>
          </div>
          {archetypeName && (
            <div className="text-[10px] font-mono text-primary/70 mb-0.5 tracking-wide">
              {archetypeName}
            </div>
          )}
          <div className="font-mono text-sm sm:text-base font-bold text-foreground">
            {discovery.name}
          </div>
          <p className="text-xs text-muted-foreground/60 leading-relaxed mt-1.5">
            {getFunctionalDescription(discovery.name, discovery.module_chain)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-2xl sm:text-3xl font-mono font-black ${
            discovery.cjpi >= 95 ? 'text-primary' : 
            discovery.cjpi >= 85 ? 'text-neon-amber' : 'text-sky-400'
          }`}>
            {discovery.cjpi}
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">CJPI</div>
          {discovery.cjpi === 100 && (
            <div className="text-[9px] sm:text-[10px] text-primary/60 font-mono italic mt-0.5">Perfect</div>
          )}
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
    <section ref={ref} className="py-20 sm:py-24 md:py-40 px-5 sm:px-6 relative">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-3 sm:mb-4"
        >
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground font-mono">
            Live Discovery Feed
          </h2>
          <p className="text-muted-foreground/70 text-sm sm:text-base mt-1">
            New memories appear here as the Memory Stream explores system combinations.
          </p>
        </motion.div>

        {/* Live status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/30" />
            <span className="text-xs sm:text-sm font-mono text-muted-foreground">
              {discoveries.length} surfaced
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/50">
            <span className="text-primary/70">+1</span> discovery surfaced recently
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={visibleSet}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {currentDiscoveries.map((d, i) => (
              <DiscoveryCard key={`${d.name}-${visibleSet}`} discovery={d} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Page indicators */}
        <div className="flex justify-center gap-1.5 mt-8 sm:mt-10">
          {Array.from({ length: Math.min(totalSets, 20) }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === visibleSet ? 'bg-primary w-7' : 'bg-border/30 w-1.5'
              }`}
            />
          ))}
          {totalSets > 20 && (
            <span className="text-xs font-mono text-muted-foreground/40 ml-1 self-center">
              +{totalSets - 20}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
