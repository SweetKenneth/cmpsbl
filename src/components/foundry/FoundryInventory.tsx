/**
 * FoundryInventory — User's vault of crystallized memories with export & removal
 * Uses internal valuation formula (pipeline-valuation.ts) for all pricing display
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Fingerprint, Loader2, Trash2, Lock, ArrowUpRight, DollarSign, Store, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTierBadgeClass, type PublicTier } from '@/lib/foundry/public-tiers';
import { formatMarketValue, computeBlendedValuation, getSuggestedMarketplaces, getTierFromScore, getCJPIMultiplier, getExponentialBase } from '@/lib/pipeline-valuation';
import { MEMORY_STREAM_PROVENANCE } from '@/lib/branding/memory-stream';
import { PipelineProvenance } from './PipelineProvenance';
import { getFunctionalDescription } from '@/lib/pipeline-descriptions';
import { getVaultLimits } from '@/lib/substrate/vault-limits';
import { truncateFingerprint, type PipelineStep } from '@/substrate/pipeline-fingerprint';
import {
  downloadTieredFoundryZip,
  type TieredFoundryExportArtifact,
} from '@/lib/export/foundry-tiered-zip';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InventoryItem {
  id: string;
  artifactId: string;
  artifactName: string;
  score: number;
  publicTier: string;
  valuationDisplay: number;
  obtainedAt: string;
  source: string;
  category: string | null;
  systemChain: string[] | null;
  pipelineFingerprint?: string | null;
  pipelineSteps?: PipelineStep[] | null;
  // Pricing fields
  recommendedResalePrice?: number | null;
  indiePrice?: number | null;
  standardPrice?: number | null;
  enterprisePrice?: number | null;
  pricingConfidence?: number | null;
  marketCategory?: string | null;
  suggestedMarketplaces?: string[] | null;
  comparableSummary?: string | null;
  commercializationNotes?: string | null;
  pricingSource?: string | null;
  pricingLastUpdatedAt?: string | null;
}

interface Props {
  inventory: InventoryItem[];
  onRemove?: (id: string) => Promise<boolean>;
  onReprice?: (id: string) => Promise<void>;
  onRepriceAll?: () => Promise<void>;
  repricing?: boolean;
  subscriptionTier?: string;
}

function mapInventoryToExportArtifacts(inventory: InventoryItem[]): TieredFoundryExportArtifact[] {
  return inventory.map((item) => ({
    id: item.artifactId || item.id,
    name: item.artifactName,
    score: item.score,
    publicTier: item.publicTier,
    valuationDisplay: item.valuationDisplay,
    category: item.category,
    systemChain: item.systemChain,
    description: getFunctionalDescription(item.artifactName, item.systemChain ?? []),
    fingerprint: item.pipelineFingerprint || null,
    obtainedAt: item.obtainedAt,
    source: item.source,
  }));
}

export function FoundryInventory({ inventory, onRemove, onReprice, onRepriceAll, repricing, subscriptionTier }: Props) {
  const [provenancePipeline, setProvenancePipeline] = useState<{
    name: string; score: number; systemChain: string[];
    pipelineSteps?: PipelineStep[];
    fingerprint?: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<InventoryItem | null>(null);
  const [expandedPricing, setExpandedPricing] = useState<string | null>(null);

  const handleRemove = useCallback(async () => {
    if (!confirmRemove || !onRemove) return;
    setRemoving(confirmRemove.id);
    const ok = await onRemove(confirmRemove.id);
    setRemoving(null);
    if (ok) {
      toast.success(`${confirmRemove.artifactName} removed from vault`);
    } else {
      toast.error('Failed to remove memory');
    }
    setConfirmRemove(null);
  }, [confirmRemove, onRemove]);

  if (inventory.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Fingerprint className="w-7 h-7 text-primary/40" />
        </div>
        <div className="text-foreground font-mono text-sm font-bold mb-2">
          No memories crystallized yet
        </div>
        <div className="text-xs text-muted-foreground/60 max-w-xs mx-auto leading-relaxed">
          Switch to the Crystallize tab and pull your first memory from the Memory Stream
        </div>
      </div>
    );
  }

  // Compute total value using blended formula
  const totalValuation = inventory.reduce((s, i) => {
    return s + computeBlendedValuation(i.score, i.category || 'general', (i.systemChain || []).length);
  }, 0);

  const handleExportVault = async () => {
    setIsExporting(true);
    try {
      const stats = await downloadTieredFoundryZip({
        artifacts: mapInventoryToExportArtifacts(inventory),
        filePrefix: 'memory-stream-vault-software',
        sourceLabel: 'Memory Stream Vault',
      });
      toast.success(`Exported ${stats.artifactCount} pipelines across ${stats.totalLanguageVariants} tiered language bundles`);
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* Summary */}
      <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-border/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-muted-foreground">
            {inventory.length} pipeline{inventory.length !== 1 ? 's' : ''}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3 h-3 text-neon-green" />
              Est. Value: <span className="text-neon-green font-bold">{formatMarketValue(totalValuation)}</span>
            </div>
          </div>
        </div>
        {/* Action buttons — full width row on mobile */}
        <div className="flex flex-wrap items-center gap-2">
          {onRepriceAll && (
            <button
              onClick={onRepriceAll}
              disabled={repricing}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/20 hover:border-border/40 disabled:opacity-50"
            >
              {repricing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {repricing ? 'Repricing...' : 'Reprice All'}
            </button>
          )}
          {getVaultLimits(subscriptionTier).exportEnabled ? (
            <button
              onClick={handleExportVault}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/20 hover:border-border/40 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              {isExporting ? 'Building ZIP...' : 'Export Tiered ZIP'}
            </button>
          ) : (
            <Link
              to="/upgrade"
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded border border-border/20 hover:border-border/40"
            >
              <Lock className="w-3 h-3" />
              Export (Studio+)
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {inventory.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group relative bg-card/30 border border-border/20 rounded-xl p-4 backdrop-blur-sm cursor-pointer result-card-hover"
          >
            {/* Card body — opens provenance */}
            <div
              onClick={() => setProvenancePipeline({
                name: item.artifactName,
                score: item.score,
                systemChain: item.systemChain ?? [],
                pipelineSteps: item.pipelineSteps ?? undefined,
                fingerprint: item.pipelineFingerprint ?? undefined,
              })}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getTierBadgeClass(item.publicTier as PublicTier)} uppercase tracking-wider`}>
                      {item.publicTier}
                    </span>
                    {item.category && (
                      <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                        {item.category}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground/30 ml-auto">
                      {item.source}
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-foreground">
                    {item.artifactName}
                  </div>
                  {item.systemChain && item.systemChain.length > 0 && (
                    <p className="text-[10px] text-primary/50 font-mono mt-1 leading-relaxed">
                      {getFunctionalDescription(item.artifactName, item.systemChain)}
                    </p>
                  )}
                  <div className="text-[9px] font-mono text-muted-foreground/40 mt-0.5">
                    {MEMORY_STREAM_PROVENANCE}
                  </div>
                  {item.pipelineFingerprint && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Fingerprint className="w-2.5 h-2.5 text-primary/40" />
                      <span className="text-[8px] font-mono text-muted-foreground/40">
                        {truncateFingerprint(item.pipelineFingerprint)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-mono font-black ${
                    item.score >= 100 ? 'text-primary' :
                    item.score >= 94 ? 'text-neon-purple' :
                    item.score >= 90 ? 'text-neon-amber' :
                    item.score >= 80 ? 'text-neon-cyan' : 'text-neon-green'
                  }`}>
                    {item.score}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-neon-green">
                    {formatMarketValue(computeBlendedValuation(item.score, item.category || 'general', (item.systemChain || []).length))}
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground">
                    <span>Tier: <span className="text-foreground uppercase">{getTierFromScore(item.score)}</span></span>
                    <span>×{getCJPIMultiplier(getTierFromScore(item.score)).toFixed(1)}</span>
                    <span>Modules: <span className="text-foreground">{(item.systemChain || []).length}</span></span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPricing(expandedPricing === item.id ? null : item.id);
                    }}
                    className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {expandedPricing === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Expanded valuation details */}
                <AnimatePresence>
                  {expandedPricing === item.id && (() => {
                    const blended = computeBlendedValuation(item.score, item.category || 'general', (item.systemChain || []).length);
                    const tier = getTierFromScore(item.score);
                    const base = getExponentialBase(item.score);
                    const mult = getCJPIMultiplier(tier);
                    const marketplaces = getSuggestedMarketplaces(item.score, item.category || 'general');
                    return (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-1.5 text-[9px] font-mono">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <DollarSign className="w-2.5 h-2.5" />
                            Blended Value: <span className="text-neon-green font-bold">{formatMarketValue(blended)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TrendingUp className="w-2.5 h-2.5" />
                            Base: {formatMarketValue(base)} × {mult.toFixed(1)} ({tier})
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Store className="w-2.5 h-2.5" />
                            Sell on: <span className="text-foreground">{marketplaces.join(', ')}</span>
                          </div>
                          {item.systemChain && item.systemChain.length > 0 && (
                            <div className="text-muted-foreground/70 leading-relaxed mt-1">
                              Chain: {item.systemChain.join(' → ')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>

            {/* Remove button — bottom right, no overlap with score */}
            {onRemove && (
              <div className="flex justify-end mt-2 pt-2 border-t border-border/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmRemove(item);
                  }}
                  disabled={removing === item.id}
                  className="flex items-center gap-1.5 text-[10px] font-mono p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive/60 hover:text-destructive border border-destructive/10 hover:border-destructive/20 transition-colors"
                  aria-label={`Remove ${item.artifactName} from vault`}
                >
                  {removing === item.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Remove</span>
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Confirm removal dialog */}
      <AlertDialog open={!!confirmRemove} onOpenChange={(open) => !open && setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Vault?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">{confirmRemove?.artifactName}</strong> will be permanently
              removed from your vault. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Provenance overlay */}
      <PipelineProvenance
        pipeline={provenancePipeline}
        onClose={() => setProvenancePipeline(null)}
        subscriptionTier={subscriptionTier}
      />
    </div>
  );
}
