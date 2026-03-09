/**
 * FoundryMiningPanel — The "CRYSTALLIZE" button + Keep/Discard flow
 * Enforces daily pull limits and vault capacity.
 * Includes rarity messaging and Mythic upgrade trigger.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pickaxe, Loader2, Fingerprint } from 'lucide-react';
import { getTierBadgeClass, type PublicTier } from '@/lib/foundry/public-tiers';
import { MEMORY_STREAM_QUALITY_NOTE, CRYSTALLIZATION_PHASES } from '@/lib/branding/memory-stream';
import { PipelineProvenance } from './PipelineProvenance';
import { KeepDiscardPanel } from './KeepDiscardPanel';
import { VaultUsageIndicator } from './VaultUsageIndicator';
import { VaultCapacityModal, DailyLimitModal, MythicDiscoveryModal } from './VaultUpgradeModals';
import { truncateFingerprint, type PipelineStep } from '@/substrate/pipeline-fingerprint';
import type { MineResponse, MineResult } from '@/lib/foundry/public-mining-engine';
import { isPullLimitReached, isVaultFull, getVaultLimits } from '@/lib/substrate/vault-limits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CrystallizationPhase = 'sampling' | 'condensing' | 'crystallizing' | null;

interface Props {
  isMining: boolean;
  lastResult: MineResponse | null;
  onMine: () => void;
  onCrystallizing?: (v: boolean) => void;
  subscriptionTier?: string;
  vaultCount: number;
  pullsToday: number;
  onVaultChange?: () => void;
}

export function FoundryMiningPanel({
  isMining, lastResult, onMine, onCrystallizing,
  subscriptionTier, vaultCount, pullsToday, onVaultChange,
}: Props) {
  const [phase, setPhase] = useState<CrystallizationPhase>(null);
  const [provenancePipeline, setProvenancePipeline] = useState<{
    name: string; score: number; systemChain: string[];
    pipelineSteps?: PipelineStep[];
    fingerprint?: string; discoveryCount?: number;
  } | null>(null);

  // Keep/Discard state
  const [decisions, setDecisions] = useState<Record<string, 'kept' | 'discarded'>>({});

  // Modal states
  const [dailyLimitOpen, setDailyLimitOpen] = useState(false);
  const [vaultCapacityOpen, setVaultCapacityOpen] = useState(false);
  const [mythicModalOpen, setMythicModalOpen] = useState(false);
  const [pendingMythic, setPendingMythic] = useState<MineResult | null>(null);

  const limits = getVaultLimits(subscriptionTier);

  const handleCrystallize = () => {
    // Check daily pull limit
    if (isPullLimitReached(pullsToday, subscriptionTier)) {
      setDailyLimitOpen(true);
      return;
    }

    // Reset decisions for new crystallization
    setDecisions({});
    setPendingMythic(null);

    onCrystallizing?.(true);
    setPhase('sampling');
    setTimeout(() => setPhase('condensing'), 700);
    setTimeout(() => setPhase('crystallizing'), 1400);
    setTimeout(() => {
      setPhase(null);
      onCrystallizing?.(false);
    }, 2200);
    onMine();
  };

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

    // Mark as kept
    setDecisions(prev => ({ ...prev, [result.id]: 'kept' }));
    toast.success(`${result.name} stored in Vault`);
    onVaultChange?.();
  }, [decisions, vaultCount, subscriptionTier, onVaultChange]);

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
    <div className="space-y-6">
      {/* Vault usage + pull counter */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <VaultUsageIndicator currentCount={vaultCount} subscriptionTier={subscriptionTier} />
        <div className="text-xs font-mono text-muted-foreground">
          Pulls today: {pullsToday} / {limits.pullsPerDay}
        </div>
      </div>

      {/* Crystallize button */}
      <div className="flex flex-col items-center">
        <motion.button
          onClick={handleCrystallize}
          disabled={isMining}
          whileHover={!isMining ? { scale: 1.03 } : {}}
          whileTap={!isMining ? { scale: 0.97 } : {}}
          className={`
            relative w-full max-w-md py-6 rounded-2xl font-mono text-lg font-black uppercase tracking-wider
            transition-all border-2
            ${isMining
              ? 'bg-muted/20 border-border/20 text-muted-foreground cursor-wait'
              : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 crystallize-glow'
            }
          `}
        >
          {!isMining && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
          )}
          <div className="relative flex items-center justify-center gap-3">
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
        <div className="text-[10px] font-mono text-muted-foreground/50 mt-3">
          {MEMORY_STREAM_QUALITY_NOTE}
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
                {CRYSTALLIZATION_PHASES.find(p => p.key === phase)?.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keep/Discard results panel */}
      <AnimatePresence mode="wait">
        {lastResult && lastResult.ok && lastResult.results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <KeepDiscardPanel
              results={lastResult.results}
              onKeep={handleKeep}
              onDiscard={handleDiscard}
              decisions={decisions}
            />
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
              No new pipelines discovered this cycle.
            </div>
            <div className="text-xs text-muted-foreground/40">
              {lastResult.rerollCredit
                ? 'Reroll credit earned — try again'
                : 'All current pipelines already in your vault'}
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
