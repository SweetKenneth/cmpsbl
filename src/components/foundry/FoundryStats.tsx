/**
 * FoundryStats — Quick stats bar for the Memory Stream page
 */
import { motion } from 'framer-motion';
import { getTierBadgeClass, type PublicTier } from '@/lib/foundry/public-tiers';

interface Props {
  inventoryCount: number;
  bestPull: { score: number; publicTier: string; artifactName: string } | null;
  totalMines: number;
  streakDays: number;
  tierCounts: Record<string, number>;
}

export function FoundryStats({ inventoryCount, bestPull, totalMines, streakDays, tierCounts }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Vault" value={String(inventoryCount)} />
      <StatCard
        label="Best Pull"
        value={bestPull ? String(bestPull.score) : '—'}
        accent={bestPull ? (bestPull.score >= 95 ? 'text-primary' : bestPull.score >= 90 ? 'text-amber-400' : 'text-sky-400') : undefined}
        sub={bestPull?.publicTier}
      />
      <StatCard label="Total Crystallizations" value={String(totalMines)} />
      <StatCard label="Streak" value={streakDays > 0 ? `${streakDays}d` : '—'} sub={streakDays > 0 ? 'stability bonus' : undefined} />
    </div>
  );
}

function StatCard({ label, value, accent, sub }: { label: string; value: string; accent?: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/30 border border-border/20 rounded-lg p-4 text-center"
    >
      <div className={`text-2xl font-mono font-black ${accent || 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-1">
        {label}
      </div>
      {sub && (
        <div className="text-[9px] text-muted-foreground/50 mt-0.5">{sub}</div>
      )}
    </motion.div>
  );
}
