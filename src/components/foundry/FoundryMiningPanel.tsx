/**
 * FoundryMiningPanel — The "CRYSTALLIZE" button + Keep/Discard flow
 * Enforces daily pull limits and vault capacity server-side.
 * Includes rarity messaging and Mythic upgrade trigger.
 * 
 * Mobile-first: 44px touch targets, responsive spacing, safe-area aware
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pickaxe, Loader2 } from 'lucide-react';
import { MEMORY_STREAM_QUALITY_NOTE } from '@/lib/branding/memory-stream';
import { PipelineProvenance } from './PipelineProvenance';
import { KeepDiscardPanel } from './KeepDiscardPanel';
import { VaultUsageIndicator } from './VaultUsageIndicator';
import { VaultCapacityModal, DailyLimitModal, MythicDiscoveryModal } from './VaultUpgradeModals';
import { type PipelineStep } from '@/substrate/pipeline-fingerprint';
import type { MineResponse, MineResult } from '@/lib/foundry/public-mining-engine';
import { isPullLimitReached, isVaultFull, getVaultLimits } from '@/lib/substrate/vault-limits';
import { toast } from 'sonner';

interface Props {
  isMining: boolean;
  lastResult: MineResponse | null;
  onMine: () => void;
  onCrystallizing?: (v: boolean) => void;
  subscriptionTier?: string;
  vaultCount: number;
  pullsToday: number;
  onVaultChange?: () => void;
  onKeepPipeline?: (result: MineResult) => Promise<{ success: boolean; error?: string }>;
  onRecordPull?: () => Promise<number>;
}

import { CrystallizationRitual } from './CrystallizationRitual';

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function FoundryMiningPanel({
  isMining, lastResult, onMine, onCrystallizing,
  subscriptionTier, vaultCount, pullsToday, onVaultChange,
  onKeepPipeline, onRecordPull,
}: Props) {
  const [showRitual, setShowRitual] = useState(false);
  const [provenancePipeline, setProvenancePipeline] = useState<{
    name: string; score: number; systemChain: string[];
    pipelineSteps?: PipelineStep[];
    fingerprint?: string; discoveryCount?: number;
  } | null>(null);

  const [decisions, setDecisions] = useState<Record<string, 'kept' | 'discarded'>>({});
  const [keepLoading, setKeepLoading] = useState<string | null>(null);
  const [dailyLimitOpen, setDailyLimitOpen] = useState(false);
  const [vaultCapacityOpen, setVaultCapacityOpen] = useState(false);
  const [mythicModalOpen, setMythicModalOpen] = useState(false);
  const [pendingMythic, setPendingMythic] = useState<MineResult | null>(null);

  const limits = getVaultLimits(subscriptionTier);
  const atPullLimit = pullsToday >= limits.pullsPerDay;

  const handleCrystallize = async () => {
    if (isPullLimitReached(pullsToday, subscriptionTier)) {
      setDailyLimitOpen(true);
      return;
    }
    setDecisions({});
    setPendingMythic(null);

    // Launch cinematic ritual
    setShowRitual(true);
    onCrystallizing?.(true);

    if (onRecordPull) {
      await onRecordPull();
    }
    onMine();
  };

  const handleRitualComplete = useCallback(() => {
    setShowRitual(false);
    onCrystallizing?.(false);
  }, [onCrystallizing]);

  const handleKeep = useCallback(async (result: MineResult) => {
    const isMythic = ['Mythic', 'Apex'].includes(result.publicTier);
    const currentlyKept = Object.values(decisions).filter(d => d === 'kept').length;
    const effectiveVaultCount = vaultCount + currentlyKept;

    if (isVaultFull(effectiveVaultCount, subscriptionTier)) {
      if (isMythic) {
        setPendingMythic(result);
        setMythicModalOpen(true);
      } else {
        setVaultCapacityOpen(true);
      }
      return;
    }

    if (onKeepPipeline) {
      setKeepLoading(result.id);
      const { success, error } = await onKeepPipeline(result);
      setKeepLoading(null);
      if (!success) {
        toast.error(error || 'Failed to store memory');
        return;
      }
    }

    setDecisions(prev => ({ ...prev, [result.id]: 'kept' }));
    toast.success(`${result.name} stored in Vault`);
    onVaultChange?.();
  }, [decisions, vaultCount, subscriptionTier, onVaultChange, onKeepPipeline]);

  const handleDiscard = useCallback((result: MineResult) => {
    setDecisions(prev => ({ ...prev, [result.id]: 'discarded' }));
    toast.info(`${result.name} discarded`);
  }, []);

  const handleMythicDiscard = useCallback(() => {
    if (pendingMythic) {
      setDecisions(prev => ({ ...prev, [pendingMythic.id]: 'discarded' }));
      setPendingMythic(null);
    }
  }, [pendingMythic]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Crystallization Ritual Overlay */}
      <AnimatePresence>
        {showRitual && <CrystallizationRitual onComplete={handleRitualComplete} />}
      </AnimatePresence>

      {/* ── Status bar: vault + pulls ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm px-4 py-3">
        <VaultUsageIndicator currentCount={vaultCount} subscriptionTier={subscriptionTier} />
        <div className={`text-xs font-mono tabular-nums flex items-center gap-1.5 ${
          atPullLimit ? 'text-neon-amber' : 'text-muted-foreground'
        }`}>
          <span>{pullsToday}</span>
          <span className="text-muted-foreground/30">/</span>
          <span>{limits.pullsPerDay}</span>
          <span className="text-muted-foreground/50 ml-1 hidden sm:inline">pulls today</span>
          <span className="text-muted-foreground/50 ml-1 sm:hidden">pulls</span>
        </div>
      </div>

      {/* ── Crystallize button ── */}
      <div className="flex flex-col items-center">
        <motion.button
          onClick={handleCrystallize}
          disabled={isMining}
          whileHover={!isMining ? { scale: 1.02 } : {}}
          whileTap={!isMining ? { scale: 0.97 } : {}}
          className={`
            relative w-full max-w-md min-h-[56px] sm:min-h-[64px] py-4 sm:py-6 rounded-2xl font-mono
            text-base sm:text-lg font-black uppercase tracking-wider
            transition-all duration-200 border-2 overflow-hidden
            ${isMining
              ? 'bg-muted/20 border-border/20 text-muted-foreground cursor-wait'
              : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
            }
          `}
        >
          {/* Shimmer sweep on idle */}
          {!isMining && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/8 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
            />
          )}
          <div className="relative flex items-center justify-center gap-3">
            {isMining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Crystallizing...</span>
              </>
            ) : (
              <>
                <Pickaxe className="w-5 h-5" />
                <span>Crystallize</span>
              </>
            )}
          </div>
        </motion.button>

        <div className="text-[10px] font-mono text-muted-foreground/40 mt-2.5 text-center px-4">
          {MEMORY_STREAM_QUALITY_NOTE}
        </div>
      </div>

      {/* Keep/Discard results panel */}
      <AnimatePresence mode="wait">
        {lastResult && lastResult.ok && lastResult.results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <KeepDiscardPanel
              results={lastResult.results}
              onKeep={handleKeep}
              onDiscard={handleDiscard}
              decisions={decisions}
              keepLoading={keepLoading}
            />
          </motion.div>
        )}

        {lastResult && lastResult.ok && lastResult.results.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12"
          >
            <div className="text-muted-foreground/60 font-mono text-sm mb-2">
              No new memories discovered this cycle.
            </div>
            <div className="text-xs text-muted-foreground/40">
              {lastResult.rerollCredit
                ? 'Reroll credit earned — try again'
                : 'All current memories already in your vault'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Provenance overlay */}
      <PipelineProvenance
        pipeline={provenancePipeline}
        onClose={() => setProvenancePipeline(null)}
      />

      {/* Upgrade modals */}
      <DailyLimitModal open={dailyLimitOpen} onOpenChange={setDailyLimitOpen} />
      <VaultCapacityModal open={vaultCapacityOpen} onOpenChange={setVaultCapacityOpen} />
      <MythicDiscoveryModal
        open={mythicModalOpen}
        onOpenChange={setMythicModalOpen}
        onDiscard={handleMythicDiscard}
      />
    </div>
  );
}
