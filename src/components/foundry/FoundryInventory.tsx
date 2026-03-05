/**
 * FoundryInventory — User's vault of crystallized pipelines with export
 * Now with Pipeline Provenance on click + fingerprint display.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Fingerprint } from 'lucide-react';
import { getTierBadgeClass, formatValuation, type PublicTier } from '@/lib/foundry/public-tiers';
import { MEMORY_STREAM_PROVENANCE } from '@/lib/branding/memory-stream';
import { PipelineProvenance } from './PipelineProvenance';
import { truncateFingerprint } from '@/substrate/pipeline-fingerprint';
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
}

interface Props {
  inventory: InventoryItem[];
}

function exportVaultAsJSON(inventory: InventoryItem[]) {
  const exportData = {
    exportedAt: new Date().toISOString(),
    source: 'CMPSBL Memory Stream Vault',
    pipelineCount: inventory.length,
    totalValuation: inventory.reduce((s, i) => s + i.valuationDisplay, 0),
    pipelines: inventory.map(item => ({
      name: item.artifactName,
      score: item.score,
      tier: item.publicTier,
      valuation: item.valuationDisplay,
      category: item.category,
      systemChain: item.systemChain,
      fingerprint: item.pipelineFingerprint || null,
      obtainedAt: item.obtainedAt,
      source: item.source,
      substrate_version: 'SPARTA',
      epoch: 'SPARTA',
    })),
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `memory-stream-vault-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${inventory.length} pipelines`);
}

export function FoundryInventory({ inventory }: Props) {
  const [provenancePipeline, setProvenancePipeline] = useState<{
    name: string; score: number; systemChain: string[];
    fingerprint?: string;
  } | null>(null);

  if (inventory.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">⛏️</div>
        <div className="text-muted-foreground font-mono text-sm mb-2">
          No pipelines crystallized yet
        </div>
        <div className="text-xs text-muted-foreground/50">
          Hit Crystallize to start pulling pipelines
        </div>
      </div>
    );
  }

  const totalValuation = inventory.reduce((s, i) => s + i.valuationDisplay, 0);

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
            onClick={() => exportVaultAsJSON(inventory)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/20 hover:border-border/40"
          >
            <Download className="w-3 h-3" />
            Export Vault
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
              fingerprint: item.pipelineFingerprint ?? undefined,
            })}
            className="bg-card/30 border border-border/20 rounded-lg p-4 backdrop-blur-sm hover:border-primary/30 transition-colors cursor-pointer"
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
                    {item.systemChain.map(s => (
                      <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
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
