/**
 * KeepDiscardPanel — Post-crystallization decision UI
 * Shows rarity messaging + Keep / Discard actions per pipeline
 * 
 * Mobile-first: 44px touch targets, responsive text, stacked layout on small screens
 * Uses semantic design tokens (neon-amber, neon-purple) from design system
 */
import { motion } from 'framer-motion';
import { Check, X, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTierBadgeClass, formatValuation, type PublicTier } from '@/lib/foundry/public-tiers';
import type { MineResult } from '@/lib/foundry/public-mining-engine';
import { getFunctionalDescription } from '@/lib/pipeline-descriptions';

function scoreColor(score: number): string {
  if (score === 100) return 'text-primary';
  if (score >= 94) return 'text-neon-purple';
  if (score >= 90) return 'text-neon-amber';
  if (score >= 80) return 'text-neon-cyan';
  return 'text-neon-green';
}

function isRareOrAbove(tier: string): boolean {
  return ['Relic', 'Mythic', 'Apex'].includes(tier);
}

function isMythicOrAbove(tier: string): boolean {
  return ['Mythic', 'Apex'].includes(tier);
}

interface Props {
  results: MineResult[];
  onKeep: (result: MineResult) => void;
  onDiscard: (result: MineResult) => void;
  decisions: Record<string, 'kept' | 'discarded'>;
  keepLoading?: string | null;
}

export function KeepDiscardPanel({ results, onKeep, onDiscard, decisions, keepLoading }: Props) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] sm:text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {results.length} pipeline{results.length > 1 ? 's' : ''} discovered
        </div>
        <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary/70 px-2 py-0.5">
          Keep or Discard
        </Badge>
      </div>

      {results.map((result, i) => {
        const decided = decisions[result.id];
        const rare = isRareOrAbove(result.publicTier);
        const mythic = isMythicOrAbove(result.publicTier);
        const isSaving = keepLoading === result.id;

        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, type: 'spring', damping: 20 }}
            className={`rounded-xl sm:rounded-2xl border backdrop-blur-sm transition-all duration-300 overflow-hidden ${
              decided === 'kept'
                ? 'border-neon-green/30 bg-neon-green/5'
                : decided === 'discarded'
                ? 'border-border/10 opacity-40'
                : mythic
                ? 'border-neon-purple/40 ring-1 ring-neon-purple/15 shadow-lg shadow-neon-purple/5'
                : rare
                ? 'border-neon-amber/30 shadow-md shadow-neon-amber/5'
                : 'border-border/20 bg-card/30'
            }`}
          >
            {/* Mythic top accent bar */}
            {!decided && mythic && (
              <div className="h-[3px] bg-gradient-to-r from-neon-purple via-primary-variant to-neon-magenta" />
            )}
            {!decided && rare && !mythic && (
              <div className="h-[2px] bg-gradient-to-r from-neon-amber to-accent" />
            )}

            <div className="p-4 sm:p-5">
              {/* Rarity messaging */}
              {!decided && mythic && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 + 0.2 }}
                  className="flex items-start gap-2.5 mb-3 px-3 py-2.5 rounded-lg bg-neon-purple/10 border border-neon-purple/20"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-4 h-4 text-neon-purple shrink-0 mt-0.5" />
                  </motion.div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-neon-purple">Mythic Pipeline Discovered</div>
                    <div className="text-[10px] sm:text-xs text-neon-purple/70 leading-relaxed">
                      One of the rarest outcomes in the Memory Stream.
                    </div>
                  </div>
                </motion.div>
              )}
              {!decided && rare && !mythic && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 + 0.2 }}
                  className="flex items-start gap-2.5 mb-3 px-3 py-2.5 rounded-lg bg-neon-amber/10 border border-neon-amber/20"
                >
                  <AlertTriangle className="w-4 h-4 text-neon-amber shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-neon-amber">Rare discovery detected</div>
                    <div className="text-[10px] sm:text-xs text-neon-amber/70 leading-relaxed">
                      Consider storing this in your vault.
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Pipeline info — responsive layout */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getTierBadgeClass(result.publicTier as PublicTier)} uppercase tracking-wider`}>
                      {result.publicTier}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider hidden sm:inline">
                      {result.category}
                    </span>
                  </div>
                  <div className="font-mono text-sm sm:text-base font-bold text-foreground leading-tight">
                    {result.name}
                  </div>
                  <p className="text-[11px] sm:text-xs text-primary/50 font-mono mt-1 leading-relaxed line-clamp-2">
                    {getFunctionalDescription(result.name, result.systemChain)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl sm:text-2xl font-mono font-black tabular-nums ${scoreColor(result.score)}`}>
                    {result.score}
                  </div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono tabular-nums">
                    {formatValuation(result.valuationDisplay)}
                  </div>
                </div>
              </div>

              {/* Decision area — touch-optimized */}
              {!decided ? (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    disabled={isSaving}
                    className={`flex-1 gap-1.5 min-h-[44px] text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      mythic
                        ? 'bg-gradient-to-r from-neon-purple to-primary-variant text-primary-foreground border-0 shadow-neon-purple/25 hover:shadow-neon-purple/40'
                        : 'shadow-primary/25 hover:shadow-primary/30'
                    }`}
                    onClick={() => onKeep(result)}
                  >
                    {isSaving ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Keep Pipeline'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isSaving}
                    className="flex-1 gap-1.5 min-h-[44px] text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    onClick={() => onDiscard(result)}
                  >
                    <X className="w-4 h-4" /> Discard
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 text-xs font-mono flex items-center gap-1.5 px-3 py-2 rounded-lg ${
                    decided === 'kept'
                      ? 'text-neon-green bg-neon-green/5 border border-neon-green/10'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {decided === 'kept' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {decided === 'kept' ? 'Stored in Vault' : 'Discarded'}
                </motion.div>
              )}

              {/* Mythic secondary hint */}
              {!decided && mythic && (
                <div className="text-[10px] font-mono text-neon-purple/50 mt-2.5 flex items-center gap-1.5 px-1">
                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                  <span>Rare discovery detected. Consider storing this in your vault.</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
