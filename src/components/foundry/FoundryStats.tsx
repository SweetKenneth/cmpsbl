/**
 * FoundryStats — Quick stats bar for the Memory Stream page
 * Uses internal valuation formula for total vault value
 */
import { motion } from 'framer-motion';
import { computeBlendedValuation, formatMarketValue } from '@/lib/pipeline-valuation';

interface InventoryForStats {
  score: number;
  category: string | null;
  systemChain: string[] | null;
}

interface Props {
  inventoryCount: number;
  bestPull: { score: number; publicTier: string; artifactName: string } | null;
  totalMines: number;
  streakDays: number;
  tierCounts: Record<string, number>;
  inventory?: InventoryForStats[];
}

export function FoundryStats({ inventoryCount, bestPull, totalMines, streakDays, inventory }: Props) {
  const totalValue = (inventory || []).reduce((s, i) => {
    return s + computeBlendedValuation(i.score, i.category || 'general', (i.systemChain || []).length);
  }, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
      <StatCard label="Vault" value={String(inventoryCount)} delay={0} />
      <StatCard
        label="Vault Value"
        value={totalValue > 0 ? formatMarketValue(totalValue) : '—'}
        accent="text-neon-green"
        sub="est. market value"
        delay={0.03}
      />
      <StatCard
        label="Best Pull"
        value={bestPull ? String(bestPull.score) : '—'}
        accent={bestPull ? (bestPull.score === 100 ? 'text-primary' : bestPull.score >= 94 ? 'text-purple-400' : bestPull.score >= 90 ? 'text-amber-400' : bestPull.score >= 80 ? 'text-sky-400' : 'text-emerald-400') : undefined}
        sub={bestPull?.publicTier}
        delay={0.06}
      />
      <StatCard label="Crystallizations" value={String(totalMines)} delay={0.09} />
      <StatCard label="Streak" value={streakDays > 0 ? `${streakDays}d` : '—'} sub={streakDays > 0 ? 'stability bonus' : undefined} delay={0.12} />
    </div>
  );
}

function StatCard({ label, value, accent, sub, delay = 0 }: { label: string; value: string; accent?: string; sub?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      className="relative bg-card/40 border border-border/20 rounded-xl p-4 sm:p-5 text-center backdrop-blur-sm overflow-hidden stat-card-glow shimmer-on-hover"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className={`text-2xl sm:text-3xl font-mono font-black ${accent || 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1.5">
        {label}
      </div>
      {sub && (
        <div className="text-[9px] text-muted-foreground/50 mt-0.5">{sub}</div>
      )}
    </motion.div>
  );
}
