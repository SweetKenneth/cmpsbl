/**
 * FoundryInventory — User's vault of crystallized pipelines with export & removal
 * Updated with commercialization pricing display
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Fingerprint, Loader2, Trash2, Lock, ArrowUpRight, DollarSign, Store, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTierBadgeClass, formatValuation, type PublicTier } from '@/lib/foundry/public-tiers';
import { formatPrice, confidenceLabel } from '@/lib/foundry/pricing-engine';
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

export function FoundryInventory({ inventory, onRemove, subscriptionTier }: Props) {
  const [provenancePipeline, setProvenancePipeline] = useState<{
    name: string; score: number; systemChain: string[];
    pipelineSteps?: PipelineStep[];
    fingerprint?: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<InventoryItem | null>(null);

  const handleRemove = useCallback(async () => {
    if (!confirmRemove || !onRemove) return;
    setRemoving(confirmRemove.id);
    const ok = await onRemove(confirmRemove.id);
    setRemoving(null);
    if (ok) {
      toast.success(`${confirmRemove.artifactName} removed from vault`);
    } else {
      toast.error('Failed to remove pipeline');
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
          No pipelines crystallized yet
        </div>
        <div className="text-xs text-muted-foreground/60 max-w-xs mx-auto leading-relaxed">
          Switch to the Crystallize tab and pull your first pipeline from the Memory Stream
        </div>
      </div>
    );
  }

  const totalValuation = inventory.reduce((s, i) => s + i.valuationDisplay, 0);

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
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/10">
        <div className="text-xs font-mono text-muted-foreground">
          {inventory.length} pipeline{inventory.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-muted-foreground">
            Vault value: <span className="text-foreground font-bold">{formatValuation(totalValuation)}</span>
          </div>
          {getVaultLimits(subscriptionTier).exportEnabled ? (
            <button
              onClick={handleExportVault}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/20 hover:border-border/40 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              {isExporting ? 'Building ZIP...' : 'Export Tiered ZIP'}
            </button>
          ) : (
            <Link
              to="/upgrade"
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/20 hover:border-border/40"
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
                  <div className="text-[9px] text-muted-foreground">
                    {formatValuation(item.valuationDisplay)}
                  </div>
                </div>
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
