/**
 * FoundryInventory — User's vault of crystallized pipelines with export
 * v13.3: structural pipeline identity with capability-level steps.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Fingerprint, Loader2 } from 'lucide-react';
import { getTierBadgeClass, formatValuation, type PublicTier } from '@/lib/foundry/public-tiers';
import { MEMORY_STREAM_PROVENANCE } from '@/lib/branding/memory-stream';
import { PipelineProvenance } from './PipelineProvenance';
import { truncateFingerprint, type PipelineStep } from '@/substrate/pipeline-fingerprint';
import {
  downloadTieredFoundryZip,
  type TieredFoundryExportArtifact,
} from '@/lib/export/foundry-tiered-zip';
import { toast } from 'sonner';

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
}

interface Props {
  inventory: InventoryItem[];
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
    description: `Crystallized pipeline: ${item.artifactName}`,
    fingerprint: item.pipelineFingerprint || null,
    obtainedAt: item.obtainedAt,
    source: item.source,
  }));
}

export function FoundryInventory({ inventory }: Props) {
  const [provenancePipeline, setProvenancePipeline] = useState<{
    name: string; score: number; systemChain: string[];
    pipelineSteps?: PipelineStep[];
    fingerprint?: string;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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
          <button
            onClick={handleExportVault}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/20 hover:border-border/40 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            {isExporting ? 'Building ZIP...' : 'Export Tiered ZIP'}
          </button>
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
            onClick={() => setProvenancePipeline({
              name: item.artifactName,
              score: item.score,
              systemChain: item.systemChain ?? [],
              pipelineSteps: item.pipelineSteps ?? undefined,
              fingerprint: item.pipelineFingerprint ?? undefined,
            })}
            className="bg-card/30 border border-border/20 rounded-xl p-4 backdrop-blur-sm cursor-pointer result-card-hover"
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
                <div className="font-mono text-sm font-bold text-foreground truncate">
                  {item.artifactName}
                </div>
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
                {item.systemChain && item.systemChain.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.systemChain.map((s, idx) => (
                      <span key={`${s}-${idx}`} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xl font-mono font-black ${
                  item.score >= 100 ? 'text-primary' :
                  item.score >= 94 ? 'text-purple-400' :
                  item.score >= 90 ? 'text-amber-400' :
                  item.score >= 80 ? 'text-sky-400' : 'text-emerald-400'
                }`}>
                  {item.score}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {formatValuation(item.valuationDisplay)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Provenance overlay */}
      <PipelineProvenance
        pipeline={provenancePipeline}
        onClose={() => setProvenancePipeline(null)}
      />
    </div>
  );
}
