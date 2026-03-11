/**
 * FoundryTierLegend — Visual breakdown of the 5 public tiers
 * Polished: better visual hierarchy, hover effects, cleaner grid
 */
import { motion } from 'framer-motion';
import { PUBLIC_TIERS, getTierBadgeClass } from '@/lib/foundry/public-tiers';

export function FoundryTierLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card/30 border border-border/15 rounded-xl p-5 sm:p-6 backdrop-blur-sm"
    >
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-5">
        Memory Tiers
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {PUBLIC_TIERS.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="text-center group"
          >
            <span className={`inline-block text-xs font-mono px-3 py-1.5 rounded-lg border ${getTierBadgeClass(tier.id)} uppercase tracking-wider mb-2 group-hover:scale-105 transition-transform`}>
              {tier.id}
            </span>
            <div className="text-[10px] text-muted-foreground/60 font-mono">
              {tier.min}–{tier.max}
            </div>
            <div className="text-[9px] text-muted-foreground/40 mt-0.5 leading-snug">
              {tier.description}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
