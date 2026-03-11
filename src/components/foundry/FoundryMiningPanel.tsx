/**
 * FoundryMiningPanel — The "CRYSTALLIZE" button + Keep/Discard flow
 * Enforces daily pull limits and vault capacity server-side.
 * Includes rarity messaging and Mythic upgrade trigger.
 * 
 * Mobile-first: 44px touch targets, responsive spacing, safe-area aware
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
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

// ═══════════════════════════════════════════════════════════════
// Crystallization Ritual — cinematic full-screen synthesis
// ═══════════════════════════════════════════════════════════════

function CrystallizationRitual({ onComplete }: { onComplete: () => void }) {
  const progress = useMotionValue(0);
  const displayProgress = useTransform(progress, v => Math.round(v));
  const [phase, setPhase] = useState(0);

  const phases = [
    'Sampling Memory Stream…',
    'Condensing topology graph…',
    'Scoring pipeline integrity…',
    'Crystallizing architecture…',
    'Materializing artifacts…',
  ];

  useEffect(() => {
    const ctrl = animate(progress, 100, {
      duration: 2.8,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => {
        const p = Math.floor((v / 100) * phases.length);
        setPhase(Math.min(p, phases.length - 1));
      },
      onComplete,
    });
    return () => ctrl.stop();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <div className="text-center px-6 max-w-sm">
        {/* Crystallization rings */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid hsl(var(--primary) / 0.15)',
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-3 rounded-full border-2 border-neon-cyan/25"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-6 rounded-full"
            style={{ border: '1.5px solid hsl(var(--neon-purple) / 0.3)' }}
            animate={{ rotate: 360, scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-9 rounded-full bg-primary/8"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span className="text-3xl font-black font-mono text-primary tabular-nums">
              {displayProgress}
            </motion.span>
          </div>

          {/* Orbiting particles */}
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-neon-cyan/60"
              style={{ top: '50%', left: '50%' }}
              animate={{
                x: [
                  Math.cos((i * Math.PI) / 2) * 52,
                  Math.cos((i * Math.PI) / 2 + Math.PI) * 52,
                  Math.cos((i * Math.PI) / 2 + Math.PI * 2) * 52,
                ],
                y: [
                  Math.sin((i * Math.PI) / 2) * 52,
                  Math.sin((i * Math.PI) / 2 + Math.PI) * 52,
                  Math.sin((i * Math.PI) / 2 + Math.PI * 2) * 52,
                ],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>

        {/* Phase text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-mono text-muted-foreground tracking-wide"
          >
            {phases[phase]}
          </motion.p>
        </AnimatePresence>

        {/* Rising sparks */}
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-primary/80"
              animate={{
                y: [0, -18, 0],
                opacity: [0.2, 1, 0.2],
                scale: [0.6, 1.4, 0.6],
              }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

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
        toast.error(error || 'Failed to store pipeline');
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
