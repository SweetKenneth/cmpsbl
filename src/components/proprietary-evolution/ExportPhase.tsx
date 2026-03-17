/**
 * ASCENDED MEMORY Phase — Generate portable capability artifacts
 * Supports individual capability export AND download-all.
 * Vault management: save/discard discoveries.
 * 
 * SOURCE LANGUAGE EXPORT: Users can always export in their ingested language
 * (bypasses score-gating) to preserve code integrity, especially for HDL.
 */

import { useState, useEffect, useMemo } from 'react';
import { Package, Download, Loader2, FileCode2, Shield, Cpu, CheckCircle2, RefreshCw, Lock, AlertTriangle, Trash2, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionLimits } from '@/hooks/useEvolutionLimits';
import { generateCapabilityPackZip, type CapabilityForExport } from '@/lib/proprietary-evolution/zip-generator';
import { LANGUAGE_UNLOCK_TIERS, getUnlockedLanguages } from '@/lib/export/language-unlock-tiers';
import type { ExportLanguage } from '@/lib/export/universal-adapter';
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

interface CrystallizedCapability {
  id: string;
  name: string;
  cjpiScore: number;
  tier: string;
  crystallizedAt: string;
  exported: boolean;
  retired: boolean;
  chain: string[];
  fingerprint: string;
  moatSignature: string;
  capabilityType: string;
  description: string;
  category: string;
}

interface UserSourceFile {
  name: string;
  extension: string;
  language: string;
  content: string;
}

const MIN_EXPORT_SCORE = 68;

/**
 * Map the ingested language label (from LANG_MAP) to the ExportLanguage key.
 * e.g. "TypeScript" → "typescript", "Verilog" → "verilog", "C++" → "cpp"
 */
const DISPLAY_TO_EXPORT: Record<string, ExportLanguage> = {
  'typescript': 'typescript', 'typescript/react': 'typescript',
  'javascript': 'typescript', 'javascript/react': 'typescript',
  'python': 'python', 'rust': 'rust', 'go': 'go', 'java': 'java',
  'c#': 'csharp', 'c++': 'cpp', 'c': 'c', 'zig': 'zig',
  'haskell': 'haskell', 'swift': 'swift', 'kotlin': 'kotlin',
  'php': 'php', 'lua': 'lua', 'dart': 'dart', 'scala': 'scala',
  'elixir': 'elixir', 'ruby': 'ruby',
  'verilog': 'verilog', 'systemverilog': 'systemverilog', 'vhdl': 'vhdl',
  'spice': 'spice', 'bluespec': 'systemverilog',
};

function resolveSourceLanguage(langLabel: string): ExportLanguage | null {
  const key = langLabel.toLowerCase().replace(/\s+/g, '');
  return DISPLAY_TO_EXPORT[key] || null;
}

export function ExportPhase() {
  const [allCapabilities, setAllCapabilities] = useState<CrystallizedCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<string>('typescript');
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{ packId: string; count: number } | null>(null);
  const [reingesting, setReingesting] = useState(false);
  const [showRetirementDialog, setShowRetirementDialog] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | string>('all');
  const [discarding, setDiscarding] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<ExportLanguage | null>(null);
  const [sourceLanguageLabel, setSourceLanguageLabel] = useState<string>('');
  const [userSourceFiles, setUserSourceFiles] = useState<UserSourceFile[]>([]);
  const { toast } = useToast();
  const {
    canExport,
    productTier,
    isLoading: limitsLoading,
    refreshUsage,
  } = useEvolutionLimits();

  const isBuilderTier = productTier === 'builder';

  const capabilities = useMemo(
    () => allCapabilities.filter(c => c.cjpiScore >= MIN_EXPORT_SCORE),
    [allCapabilities]
  );

  const eligible = capabilities.filter(c => !c.exported && !c.retired);
  const bestScore = useMemo(
    () => eligible.reduce((max, c) => Math.max(max, c.cjpiScore), 0),
    [eligible]
  );

  // Unlocked languages: normal score-gated + always include source language
  const unlockedLanguages = useMemo(() => {
    const base = getUnlockedLanguages(bestScore);
    if (sourceLanguage && !base.includes(sourceLanguage)) {
      return [sourceLanguage, ...base];
    }
    return base;
  }, [bestScore, sourceLanguage]);

  const tierDisplay = useMemo(() => {
    return LANGUAGE_UNLOCK_TIERS.filter(t => t.minScore >= MIN_EXPORT_SCORE).map(tier => ({
      ...tier,
      unlocked: bestScore >= tier.minScore,
    }));
  }, [bestScore]);

  useEffect(() => {
    if (!unlockedLanguages.includes(selectedTarget as any) && unlockedLanguages.length > 0) {
      // Default to source language if available, otherwise first unlocked
      setSelectedTarget(sourceLanguage || unlockedLanguages[0]);
    }
  }, [unlockedLanguages, selectedTarget, sourceLanguage]);

  useEffect(() => { loadCrystallized(); loadCandidateLanguage(); }, []);

  /** Load the candidate's ingested language and source files */
  const loadCandidateLanguage = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('metadata')
      .eq('category', 'proprietary-evolution')
      .eq('tier', 'candidate')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.metadata) {
      const meta = data.metadata as Record<string, unknown>;
      const langLabel = String(meta.language || '');
      setSourceLanguageLabel(langLabel);
      const resolved = resolveSourceLanguage(langLabel);
      if (resolved) {
        setSourceLanguage(resolved);
        setSelectedTarget(resolved);
      }

      // Extract user source files for inclusion in ZIP
      const sourceFiles = (meta.source_files as Array<{ name: string; extension: string; language: string; content: string }>) || [];
      setUserSourceFiles(sourceFiles.filter(f => f.content && f.content.length > 0));
    }
  };

  const loadCrystallized = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('id, name, metadata, tier, created_at, description, category')
      .eq('category', 'proprietary-crystallized')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setAllCapabilities((data as any[]).map((d: any) => {
        const meta = d.metadata || {};
        return {
          id: d.id,
          name: d.name,
          cjpiScore: Number(meta.cjpi_score || 0),
          tier: d.tier || 'mint',
          crystallizedAt: String(meta.crystallized_at || d.created_at),
          exported: meta.exported === true,
          retired: meta.retired === true,
          chain: (meta.chain as string[]) || [],
          fingerprint: String(meta.structural_fingerprint || ''),
          moatSignature: String(meta.moat_signature || ''),
          capabilityType: String(meta.capability_type || 'collision'),
          description: d.description || '',
          category: d.category || 'proprietary-evolution',
        };
      }));
    }
    setLoading(false);
  };

  const initiateExport = (scope: 'all' | string) => {
    const targets = scope === 'all' ? eligible : eligible.filter(c => c.id === scope);
    if (targets.length === 0) {
      toast({ title: 'Nothing to export', description: 'No capabilities available for export' });
      return;
    }
    if (!canExport) {
      toast({
        title: isBuilderTier ? 'Upgrade required' : 'Export not available',
        description: isBuilderTier
          ? 'The Builder tier lets you discover capabilities for free, but exporting requires a paid tier.'
          : 'Exports are not enabled for your current plan.',
        variant: 'destructive',
      });
      return;
    }
    // Source language is always allowed; other languages need score check
    if (selectedTarget !== sourceLanguage && !unlockedLanguages.includes(selectedTarget as any)) {
      toast({ title: 'Language locked', description: `${selectedTarget} requires a higher CJPI score.`, variant: 'destructive' });
      return;
    }
    setExportScope(scope);
    setShowRetirementDialog(true);
  };

  const handleExport = async () => {
    setShowRetirementDialog(false);
    const targets = exportScope === 'all' ? eligible : eligible.filter(c => c.id === exportScope);
    if (targets.length === 0) return;
    
    setExporting(exportScope);
    try {
      const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'export',
          action: 'capability-pack',
          input: {
            capability_ids: targets.map(c => c.id),
            target_language: selectedTarget,
            include_mini_runtime: true,
          },
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Export failed');

      const capsForExport: CapabilityForExport[] = targets.map(c => ({
        id: c.id, name: c.name, cjpiScore: c.cjpiScore, tier: c.tier,
        chain: c.chain, fingerprint: c.fingerprint, moatSignature: c.moatSignature,
        capabilityType: c.capabilityType, description: c.description, category: c.category,
      }));

      const candidateName = capsForExport[0]?.chain[0] || 'CANDIDATE';

      await generateCapabilityPackZip({
        targetLanguage: selectedTarget,
        capabilities: capsForExport,
        candidateName,
        userSourceFiles: userSourceFiles.length > 0 ? userSourceFiles : undefined,
        sourceLanguage: sourceLanguageLabel,
      });

      setExportResult({ packId: data.pack_id, count: targets.length });
      setAllCapabilities(prev => prev.map(c =>
        targets.some(e => e.id === c.id) ? { ...c, exported: true, retired: true } : c
      ));
      await refreshUsage();
      toast({ title: 'Ascended Memory exported', description: `${targets.length} capability${targets.length > 1 ? 'ies' : ''} exported & retired.` });
    } catch (err) {
      toast({ title: 'Export failed', description: String(err), variant: 'destructive' });
    } finally {
      setExporting(null);
    }
  };

  const handleDiscard = async (capId: string) => {
    setDiscarding(capId);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('artifact_registry')
        .delete()
        .eq('id', capId);
      if (error) throw error;
      setAllCapabilities(prev => prev.filter(c => c.id !== capId));
      toast({ title: 'Capability discarded', description: 'Removed from your vault.' });
    } catch (err) {
      toast({ title: 'Discard failed', description: String(err), variant: 'destructive' });
    } finally {
      setDiscarding(null);
    }
  };

  const handleReingest = async () => {
    if (capabilities.length === 0) return;
    setReingesting(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;
      if (!currentUser) throw new Error('Authentication required');

      const combinedName = `EVOLVED_${capabilities[0]?.chain[0] || 'PACK'}_V${Date.now().toString(36).slice(-4).toUpperCase()}`;
      const totalResolvers = capabilities.length * 3;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert({
        user_id: currentUser.id,
        name: `CANDIDATE_${combinedName}`,
        slug: `candidate-${combinedName.toLowerCase().replace(/_/g, '-')}-${Date.now().toString(36)}`,
        tier: 'candidate',
        category: 'proprietary-evolution',
        description: `Re-ingested Candidate Node #41 — Evolved from ${capabilities.length} crystallized capabilities`,
        metadata: {
          phase: 'ingest', language: sourceLanguageLabel || 'TypeScript/Evolved', file_count: capabilities.length,
          resolver_count: totalResolvers, size_kb: capabilities.length * 15,
          ingested_at: new Date().toISOString(), evolution_cycle: 2,
          parent_capabilities: capabilities.map(c => c.id),
          parent_avg_cjpi: Math.round(capabilities.reduce((s, c) => s + c.cjpiScore, 0) / capabilities.length),
          source_files: userSourceFiles, // Carry forward user source files
        },
      });

      if (error) throw error;
      toast({ title: 'Re-ingested as evolved candidate', description: `${combinedName} registered — return to Discovery to run deeper collision chains` });
    } catch (err) {
      toast({ title: 'Re-ingest failed', description: String(err), variant: 'destructive' });
    } finally {
      setReingesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (capabilities.length === 0) {
    return (
      <div className="border border-border/30 rounded-xl p-8 text-center bg-card/30">
        <Package className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">No export-ready capabilities</p>
        <p className="text-xs text-muted-foreground mt-1">
          Capabilities must reach CJPI 68+ to qualify for export. Complete deeper discovery cycles to raise scores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tier Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border/20">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Export Quota</span>
          {isBuilderTier ? (
            <span className="text-xs font-mono text-destructive flex items-center gap-1">
              <Lock className="w-3 h-3" /> Upgrade to export
            </span>
          ) : (
            <span className="text-xs font-mono font-bold text-primary">Exports enabled</span>
          )}
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">
          Best CJPI: {bestScore} · {unlockedLanguages.length} languages
        </span>
      </div>

      {/* Export Config — Score-gated language tiers */}
      <div className={cn(
        "border rounded-xl p-5 space-y-4",
        isBuilderTier ? "border-border/20 bg-card/20 opacity-75" : "border-border/30 bg-card/40"
      )}>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Target Language</span>
        </div>

        {/* Source Language — Always Available */}
        {sourceLanguage && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-3 h-3 text-primary" />
              <p className="text-[10px] font-mono text-primary uppercase tracking-wider font-semibold">
                Source Language — Always Available
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => !isBuilderTier && setSelectedTarget(sourceLanguage)}
                disabled={isBuilderTier}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono transition-all border",
                  selectedTarget === sourceLanguage
                    ? "bg-primary/15 text-primary border-primary/40 ring-1 ring-primary/20"
                    : "text-foreground border-primary/20 hover:border-primary/40",
                  isBuilderTier && "opacity-30 cursor-not-allowed"
                )}
              >
                {sourceLanguage}
                <span className="text-[9px] ml-1 text-muted-foreground">(your code)</span>
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground">
              Export in your ingested language ({sourceLanguageLabel}) — preserves your original code with substrate splices.
              {['verilog', 'vhdl', 'systemverilog', 'systemc', 'spice', 'chisel', 'amaranth'].includes(sourceLanguage) && (
                <span className="text-primary"> HDL integrity preserved.</span>
              )}
            </p>
          </div>
        )}

        {/* Score-gated tiers */}
        {tierDisplay.map(tier => (
          <div key={tier.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {tier.label} — {tier.minScore}+ CJPI
              </p>
              {!tier.unlocked && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground font-mono flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Score {tier.minScore}+
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tier.languages.filter(l => l !== sourceLanguage).map(lang => {
                const isUnlocked = tier.unlocked;
                return (
                  <button
                    key={`${tier.id}-${lang}`}
                    onClick={() => isUnlocked && !isBuilderTier && setSelectedTarget(lang)}
                    disabled={!isUnlocked || isBuilderTier}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono transition-all border",
                      selectedTarget === lang && isUnlocked
                        ? "bg-primary/10 text-primary border-primary/30"
                        : isUnlocked
                          ? "text-muted-foreground border-border/20 hover:border-border/40"
                          : "text-muted-foreground/40 border-border/10",
                      (!isUnlocked || isBuilderTier) && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    {lang}
                    {!isUnlocked && <Lock className="w-2.5 h-2.5 ml-1 inline" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            {selectedTarget === sourceLanguage
              ? 'Your original source code is included with substrate capability splices applied.'
              : 'Includes Mini-Runtime™ Engine • License • README • Pipeline Details • Valuation • Manifest'}
          </span>
        </div>

        {/* Download All Button */}
        {eligible.length > 1 && (
          <Button
            onClick={() => initiateExport('all')}
            disabled={!!exporting || isBuilderTier || !canExport}
            className="w-full gap-2"
          >
            {exporting === 'all' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isBuilderTier ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isBuilderTier ? 'Upgrade to Export' : `Download All ${eligible.length} Capabilities (.zip)`}
          </Button>
        )}
      </div>

      {/* Retirement Confirmation Dialog */}
      <AlertDialog open={showRetirementDialog} onOpenChange={setShowRetirementDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Export & Retire
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Exporting will <strong className="text-foreground">retire {exportScope === 'all' ? 'all' : 'this'} capability from the discovery pool</strong>.
              </p>
              <p>
                Retired capabilities are locked into your export. Future runs find new ones.
              </p>
              {selectedTarget === sourceLanguage && userSourceFiles.length > 0 && (
                <p className="text-primary text-sm">
                  ✦ Your original {sourceLanguageLabel} source files ({userSourceFiles.length} files) will be included alongside the substrate-enhanced code.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExport}>Export & Retire</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Result */}
      {exportResult && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              Pack downloaded — {exportResult.count} capabilities exported & retired
            </p>
            <p className="text-[10px] text-green-600/70 dark:text-green-400/70 font-mono truncate">
              Pack ID: {exportResult.packId.slice(0, 8)}…
            </p>
          </div>
        </div>
      )}

      {/* Capability List — Individual export + discard */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Your Vault ({capabilities.length} at CJPI 68+)
        </h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {capabilities.map(c => (
            <div
              key={c.id}
              className={cn(
                "rounded-xl border transition-all",
                c.retired
                  ? "bg-muted/5 opacity-50 border-border/10"
                  : "bg-card/30 border-border/20 hover:border-border/40"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-2.5">
                <FileCode2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground font-medium truncate flex-1">{c.name}</span>
                <span className={cn(
                  "text-[10px] font-mono font-bold uppercase",
                  c.cjpiScore >= 94 ? "text-amber-400" :
                  c.cjpiScore >= 90 ? "text-orange-400" :
                  c.cjpiScore >= 80 ? "text-blue-400" :
                  "text-muted-foreground"
                )}>
                  {c.tier}
                </span>
                <span className={cn(
                  "text-[10px] font-mono tabular-nums",
                  c.cjpiScore >= 94 ? "text-amber-400" :
                  c.cjpiScore >= 90 ? "text-orange-400" :
                  c.cjpiScore >= 80 ? "text-blue-400" :
                  "text-muted-foreground"
                )}>
                  CJPI {c.cjpiScore}
                </span>
                {c.retired && (
                  <span className="text-[9px] font-mono text-muted-foreground/60 bg-muted/20 px-1.5 py-0.5 rounded">
                    Retired
                  </span>
                )}
              </div>
              {/* Description */}
              {c.description && (
                <div className="px-4 pb-2 border-t border-border/10">
                  <p className="text-xs text-foreground/70 leading-relaxed mt-2">
                    {c.description}
                  </p>
                  {c.chain.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[9px] font-mono text-muted-foreground/60">Chain:</span>
                      {c.chain.map((node, idx) => (
                        <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/5 text-primary/70">
                          {node}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Per-capability actions */}
              {!c.retired && !c.exported && (
                <div className="flex items-center gap-2 px-4 pb-3 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] gap-1 flex-1"
                    disabled={!!exporting || isBuilderTier || !canExport}
                    onClick={() => initiateExport(c.id)}
                  >
                    {exporting === c.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    Export this capability
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={discarding === c.id}
                    onClick={() => handleDiscard(c.id)}
                  >
                    {discarding === c.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Discard
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recursive Loop CTA */}
      <div className="border border-primary/20 rounded-xl p-5 bg-primary/5 space-y-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Recursive Ascension Loop</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Re-ingest your enhanced capabilities as a new candidate node.
          The Discovery engine will find <strong className="text-foreground">deeper collision chains</strong> —
          each cycle compounds exclusivity and raises the CJPI floor.
        </p>
        <Button
          variant="outline"
          onClick={handleReingest}
          disabled={reingesting}
          className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10 whitespace-normal text-left leading-snug py-3 h-auto"
        >
          {reingesting ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 shrink-0" />
          )}
          <span>Re-ingest as Evolved Candidate → Start New Ascension Cycle</span>
        </Button>
      </div>
    </div>
  );
}
