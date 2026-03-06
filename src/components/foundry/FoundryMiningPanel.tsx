/**
 * FoundryMiningPanel — The "CRYSTALLIZE" button + last result display
 * Includes save-to-vault action for each result.
 * v13.3: structural pipeline identity with capability-level steps.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pickaxe, Loader2, Download, Check, Fingerprint } from 'lucide-react';
import { getTierBadgeClass, formatValuation, type PublicTier } from '@/lib/foundry/public-tiers';
import { MEMORY_STREAM_EVENT, MEMORY_STREAM_EMPTY, MEMORY_STREAM_QUALITY_NOTE, MEMORY_STREAM_PROVENANCE, CRYSTALLIZATION_PHASES } from '@/lib/branding/memory-stream';
import { PipelineProvenance } from './PipelineProvenance';
import { truncateFingerprint, type PipelineStep } from '@/substrate/pipeline-fingerprint';
import type { MineResponse } from '@/lib/foundry/public-mining-engine';
import {
  generateSingleExport,
  type ExportableArtifact,
} from '@/lib/export/universal-adapter';
import { getUnlockedLanguages } from '@/lib/export/language-unlock-tiers';
import { toast } from 'sonner';

type CrystallizationPhase = 'sampling' | 'condensing' | 'crystallizing' | null;

function scoreColor(score: number): string {
  if (score === 100) return 'text-primary';
  if (score >= 94) return 'text-purple-400';
  if (score >= 90) return 'text-amber-400';
  if (score >= 80) return 'text-sky-400';
  return 'text-emerald-400';
}

async function exportResultsAsZip(results: any[]) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  // Manifest
  const manifest = {
    exportedAt: new Date().toISOString(),
    source: 'CMPSBL Memory Stream',
    pipelineCount: results.length,
    pipelines: results.map(r => ({
      name: r.name,
      description: r.description,
      score: r.score,
      tier: r.publicTier,
      valuation: r.valuationDisplay,
      category: r.category,
      systemChain: r.systemChain,
      fingerprint: r.fingerprint || null,
      epoch: 'SPARTA',
    })),
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Per-pipeline exports
  for (const r of results) {
    const unlocked = getUnlockedLanguages(r.score);
    const lang = unlocked.includes('typescript') ? 'typescript'
      : unlocked.includes('python') ? 'python'
      : unlocked[0];
    if (!lang) continue;

    const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const exportable: ExportableArtifact = {
      id: r.fingerprint || r.id,
      name: r.name,
      rank: 0,
      cjpi: r.score,
      module: r.systemChain?.[0] || 'unknown',
      description: r.description || `Crystallized pipeline: ${r.name}`,
      sourceCode: '',
      synthesisContext: {
        name: r.name,
        moduleChain: r.systemChain || [],
        cjpi: r.score,
        description: `${r.name} — ${r.category || 'general'} pipeline`,
        category: r.category || 'general',
        entryCapability: 'process',
        exitCapability: 'emit',
        errorStrategy: 'propagate',
        maxExecutionMs: 30000,
      },
    };

    const bundle = generateSingleExport(exportable, lang);
    const folder = zip.folder(slug)!;
    folder.file('README.md', bundle.readme);
    for (const file of bundle.files) {
      folder.file(file.filename, file.content);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `memory-stream-crystallization-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${results.length} pipelines as ZIP`);
}

interface Props {
  isMining: boolean;
  lastResult: MineResponse | null;
  onMine: () => void;
  onCrystallizing?: (v: boolean) => void;
}

export function FoundryMiningPanel({ isMining, lastResult, onMine, onCrystallizing }: Props) {
  const [phase, setPhase] = useState<CrystallizationPhase>(null);
  const [provenancePipeline, setProvenancePipeline] = useState<{
    name: string; score: number; systemChain: string[];
    pipelineSteps?: PipelineStep[];
    fingerprint?: string; discoveryCount?: number;
  } | null>(null);

  const handleCrystallize = () => {
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
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Last Crystallization — {lastResult.results.length} pipeline{lastResult.results.length > 1 ? 's' : ''}
              </div>
              <button
                onClick={() => exportResultsAsZip(lastResult.results)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/20 hover:border-border/40"
              >
                <Download className="w-3 h-3" />
                Export ZIP
              </button>
            </div>

            {lastResult.persistedCount > 0 && (
              <div className="text-[10px] font-mono text-emerald-400/70 flex items-center gap-1.5 mb-3">
                <Check className="w-3 h-3" />
                Saved {lastResult.persistedCount} pipeline{lastResult.persistedCount > 1 ? 's' : ''} to Vault
              </div>
            )}
            {lastResult.persistedCount === 0 && lastResult.alreadyOwnedCount > 0 && (
              <div className="text-[10px] font-mono text-muted-foreground/70 flex items-center gap-1.5 mb-3">
                <Check className="w-3 h-3" />
                Already in your Vault
              </div>
            )}

            {lastResult.results.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                onClick={() => setProvenancePipeline({
                  name: result.name,
                  score: result.score,
                  systemChain: result.systemChain,
                  pipelineSteps: (result as any).pipelineSteps,
                  fingerprint: (result as any).fingerprint,
                })}
                className="bg-card/30 border border-border/20 rounded-lg p-4 backdrop-blur-sm cursor-pointer hover:border-primary/30 transition-colors"
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
                      {MEMORY_STREAM_PROVENANCE}
                    </div>
                    {(result as any).fingerprint && (
                      <div className="flex items-center gap-1 mt-1">
                        <Fingerprint className="w-2.5 h-2.5 text-primary/40" />
                        <span className="text-[8px] font-mono text-muted-foreground/40">
                          {truncateFingerprint((result as any).fingerprint)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.systemChain.map((s, idx) => (
                        <span key={`${s}-${idx}`} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
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

      {/* Provenance overlay */}
      <PipelineProvenance
        pipeline={provenancePipeline}
        onClose={() => setProvenancePipeline(null)}
      />
    </div>
  );
}
