/**
 * KeepDiscardPanel — Post-crystallization decision UI
 * Shows rarity messaging + Keep / Discard actions per pipeline
 */
import { motion } from 'framer-motion';
import { Check, X, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTierBadgeClass, formatValuation, type PublicTier } from '@/lib/foundry/public-tiers';
import type { MineResult } from '@/lib/foundry/public-mining-engine';
import { getFunctionalDescription } from '@/lib/pipeline-descriptions';

function scoreColor(score: number): string {
  if (score === 100) return 'text-primary';
  if (score >= 94) return 'text-purple-400';
  if (score >= 90) return 'text-amber-400';
  if (score >= 80) return 'text-sky-400';
  return 'text-emerald-400';
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
}

export function KeepDiscardPanel({ results, onKeep, onDiscard, decisions }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
        Crystallization Complete — {results.length} pipeline{results.length > 1 ? 's' : ''} discovered
      </div>

      {results.map((result, i) => {
        const decided = decisions[result.id];
        const rare = isRareOrAbove(result.publicTier);
        const mythic = isMythicOrAbove(result.publicTier);

        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`bg-card/30 border rounded-xl p-4 backdrop-blur-sm transition-all ${
              decided === 'kept'
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : decided === 'discarded'
                ? 'border-border/10 opacity-50'
                : mythic
                ? 'border-purple-500/40 ring-1 ring-purple-500/20'
                : rare
                ? 'border-amber-500/30'
                : 'border-border/20'
            }`}
          >
            {/* Rarity messaging */}
            {!decided && mythic && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20"
              >
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-purple-400">Mythic Pipeline Discovered</div>
                  <div className="text-[10px] text-purple-400/70">One of the rarest outcomes in the Memory Stream.</div>
                </div>
              </motion.div>
            )}
            {!decided && rare && !mythic && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-400">Rare discovery detected.</div>
                  <div className="text-[10px] text-amber-400/70">Consider storing this in your vault.</div>
                </div>
              </motion.div>
            )}

            {/* Pipeline info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getTierBadgeClass(result.publicTier as PublicTier)} uppercase tracking-wider`}>
                    {result.publicTier}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                    {result.category}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-foreground">{result.name}</div>
                <p className="text-xs text-primary/50 font-mono mt-1 leading-relaxed">
                  {getFunctionalDescription(result.name, result.systemChain)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-2xl font-mono font-black ${scoreColor(result.score)}`}>{result.score}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{formatValuation(result.valuationDisplay)}</div>
              </div>
            </div>

            {/* Decision area */}
            {!decided ? (
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => onKeep(result)}
                >
                  <Check className="w-3.5 h-3.5" /> Keep Pipeline
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={() => onDiscard(result)}
                >
                  <X className="w-3.5 h-3.5" /> Discard
                </Button>
              </div>
            ) : (
              <div className={`mt-3 text-xs font-mono flex items-center gap-1.5 ${
                decided === 'kept' ? 'text-emerald-400' : 'text-muted-foreground/50'
              }`}>
                {decided === 'kept' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {decided === 'kept' ? 'Stored in Vault' : 'Discarded'}
              </div>
            )}

            {/* Mythic hint */}
            {!decided && mythic && (
              <div className="text-[10px] font-mono text-purple-400/60 mt-2 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Rare discovery detected. Consider storing this in your vault.
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
