/**
 * FoundryMiningPanel — The "CRYSTALLIZE" button + last result display
 * Simple mode: one big button, result reveal, no cringe.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pickaxe, Loader2 } from 'lucide-react';
import { getTierBadgeClass, formatValuation, type PublicTier } from '@/lib/foundry/public-tiers';
import { MEMORY_STREAM_EVENT, MEMORY_STREAM_EMPTY } from '@/lib/branding/memory-stream';
import type { MineResponse } from '@/lib/foundry/public-mining-engine';

type CrystallizationPhase = 'sampling' | 'condensing' | 'crystallizing' | null;

function scoreColor(score: number): string {
  if (score === 100) return 'text-primary';
  if (score >= 94) return 'text-purple-400';
  if (score >= 90) return 'text-amber-400';
  if (score >= 80) return 'text-sky-400';
  return 'text-emerald-400';
}

interface Props {
  isMining: boolean;
  lastResult: MineResponse | null;
  onMine: () => void;
}

export function FoundryMiningPanel({ isMining, lastResult, onMine }: Props) {
  const [phase, setPhase] = useState<CrystallizationPhase>(null);

  const handleCrystallize = () => {
    setPhase('sampling');
    setTimeout(() => setPhase('condensing'), 700);
    setTimeout(() => setPhase('crystallizing'), 1400);
    setTimeout(() => setPhase(null), 2100);
    onMine();
  };

  return (
    <div className="space-y-6">
      {/* Crystallize button */}
      <div className="flex flex-col items-center">
        <motion.button
          onClick={handleCrystallize}
          disabled={isMining}
          whileHover={!isMining ? { scale: 1.02 } : {}}
          whileTap={!isMining ? { scale: 0.98 } : {}}
          className={`
            relative w-full max-w-md py-6 rounded-xl font-mono text-lg font-black uppercase tracking-wider
            transition-all border
            ${isMining
              ? 'bg-muted/20 border-border/20 text-muted-foreground cursor-wait'
              : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
            }
          `}
        >
          <div className="flex items-center justify-center gap-3">
            {isMining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Crystallizing...
              </>
            ) : (
              <>
                <Pickaxe className="w-5 h-5" />
                Crystallize
              </>
            )}
          </div>
        </motion.button>
        <div className="text-[10px] font-mono text-muted-foreground/50 mt-2">
          Quality floor: 68+ · Every pull is real software
        </div>

        {/* Crystallization phase animation */}
        <AnimatePresence>
          {phase && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mt-3 flex items-center gap-2"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${
                  phase === 'sampling' ? 'bg-sky-400' :
                  phase === 'condensing' ? 'bg-amber-400' :
                  'bg-primary'
                }`}
              />
              <span className="text-xs font-mono text-muted-foreground animate-fade-in">
                {phase === 'sampling' && 'Sampling Memory Stream...'}
                {phase === 'condensing' && 'Condensing topology...'}
                {phase === 'crystallizing' && 'Crystallizing pipeline...'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Last result */}
      <AnimatePresence mode="wait">
        {lastResult && lastResult.ok && lastResult.results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
              Last Crystallization — {lastResult.results.length} pipeline{lastResult.results.length > 1 ? 's' : ''}
            </div>
            {lastResult.results.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="bg-card/30 border border-border/20 rounded-lg p-4 backdrop-blur-sm"
              >
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
                    <div className="font-mono text-sm font-bold text-foreground truncate">
                      {result.name}
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    <div className="text-[9px] font-mono text-muted-foreground/40 mt-1">
                      {MEMORY_STREAM_EVENT}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.systemChain.map(s => (
                        <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-2xl font-mono font-black ${scoreColor(result.score)}`}>
                      {result.score}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      {formatValuation(result.valuationDisplay)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {lastResult && lastResult.ok && lastResult.results.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-muted-foreground/60 font-mono text-sm mb-2">
              {MEMORY_STREAM_EMPTY}
            </div>
            <div className="text-xs text-muted-foreground/40">
              {lastResult.rerollCredit
                ? 'Reroll credit earned — try again'
                : 'All current pipelines already in your vault'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
