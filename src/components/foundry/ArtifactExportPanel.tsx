/**
 * ArtifactExportPanel — Tiered language export for user-owned crystallized memories.
 * Score determines which export languages are unlocked, aligned to rarity tiers.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Lock, ChevronDown, ChevronUp, Cpu, Code2, Loader2, ArrowUpRight } from 'lucide-react';
import {
  getLanguagesForScore,
  generateSingleExport,
  downloadBundle,
  type ExportLanguage,
  type ExportableArtifact,
} from '@/lib/export/universal-adapter';
import { getUnlockStatus } from '@/lib/export/language-unlock-tiers';
import { scoreToPublicTier, getTierBadgeClass, type PublicTier } from '@/lib/foundry/public-tiers';
import { getFunctionalDescription } from '@/lib/pipeline-descriptions';
import { getVaultLimits } from '@/lib/substrate/vault-limits';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ArtifactExportPanelProps {
  artifact: {
    name: string;
    score: number;
    systemChain: string[];
    category?: string | null;
    fingerprint?: string;
  };
  subscriptionTier?: string;
}

const TIER_LABELS: Record<string, { icon: typeof Code2; color: string }> = {
  raw:     { icon: Code2, color: 'text-muted-foreground' },
  mint:    { icon: Code2, color: 'text-emerald-400' },
  prime:   { icon: Code2, color: 'text-sky-400' },
  relic:   { icon: Code2, color: 'text-amber-400' },
  silicon: { icon: Cpu,   color: 'text-purple-400' },
};

export function ArtifactExportPanel({ artifact, subscriptionTier }: ArtifactExportPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState<ExportLanguage | null>(null);
  const limits = getVaultLimits(subscriptionTier);

  const languages = useMemo(() => getLanguagesForScore(artifact.score), [artifact.score]);
  const tiers = useMemo(() => getUnlockStatus(artifact.score), [artifact.score]);
  const unlockedCount = languages.filter(l => !l.locked).length;
  const totalCount = languages.length;
  const publicTier = scoreToPublicTier(artifact.score);

  const handleExport = async (lang: ExportLanguage) => {
    setExporting(lang);
    try {
      const exportable: ExportableArtifact = {
        id: artifact.fingerprint || artifact.name,
        name: artifact.name,
        rank: 0,
        cjpi: artifact.score,
        module: artifact.systemChain[0] || 'unknown',
        description: getFunctionalDescription(artifact.name, artifact.systemChain),
        sourceCode: '',
        synthesisContext: {
          name: artifact.name,
          moduleChain: artifact.systemChain,
          cjpi: artifact.score,
          description: getFunctionalDescription(artifact.name, artifact.systemChain),
          category: artifact.category || 'general',
          entryCapability: 'process',
          exitCapability: 'emit',
          errorStrategy: 'propagate',
          maxExecutionMs: 30000,
        },
      };

      const bundle = generateSingleExport(exportable, lang);
      await downloadBundle(bundle);
      toast.success(`Exported ${artifact.name} as ${lang.toUpperCase()}`);
    } catch (err) {
      toast.error('Export failed');
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  if (!limits.exportEnabled) {
    return (
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-muted/10">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              Export requires Studio tier or above
            </span>
          </div>
          <Link
            to="/store?tab=plans"
            className="flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
          >
            Upgrade <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-4">
      {/* Header toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between group"
      >
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          Export Languages
          <span className="ml-2 text-foreground/80">
            {unlockedCount}/{totalCount} unlocked
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground/60 group-hover:text-foreground transition-colors">
          <span className="text-[9px] font-mono">{expanded ? 'collapse' : 'expand'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              {tiers.map((tier) => {
                const cfg = TIER_LABELS[tier.id] || { icon: Code2, color: 'text-muted-foreground' };
                const Icon = cfg.icon;
                return (
                  <div key={tier.id} className="space-y-1.5">
                    {/* Tier header */}
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3 h-3 ${tier.unlocked ? cfg.color : 'text-muted-foreground/30'}`} />
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${tier.unlocked ? cfg.color : 'text-muted-foreground/30'}`}>
                        {tier.label}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/40">
                        {tier.minScore}+
                      </span>
                      {!tier.unlocked && (
                        <span className="text-[8px] font-mono text-muted-foreground/30 flex items-center gap-1 ml-auto">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>

                    {/* Language buttons */}
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {tier.languages.map((lang) => {
                        const langInfo = languages.find(l => l.value === lang);
                        const isLocked = !tier.unlocked;
                        const isExporting = exporting === lang;

                        return (
                          <button
                            key={lang}
                            disabled={isLocked || isExporting}
                            onClick={() => handleExport(lang)}
                            className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${
                              isLocked
                                ? 'border-border/10 text-muted-foreground/20 bg-muted/5 cursor-not-allowed'
                                : 'border-border/30 text-foreground/80 bg-card/50 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground cursor-pointer'
                            }`}
                          >
                            {isExporting ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : isLocked ? (
                              <Lock className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />
                            ) : (
                              <Download className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />
                            )}
                            {langInfo?.label || lang}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer info */}
            <div className="mt-3 pt-2 border-t border-border/10 text-[9px] font-mono text-muted-foreground/40">
              {publicTier && (
                <span className={`${getTierBadgeClass(publicTier as PublicTier)} px-1.5 py-0.5 rounded border text-[8px] mr-2`}>
                  {publicTier}
                </span>
              )}
              Each export includes source code, test harness, Makefile, and the CMPSBL® Mini-Runtime™ Engine as a ZIP package.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
