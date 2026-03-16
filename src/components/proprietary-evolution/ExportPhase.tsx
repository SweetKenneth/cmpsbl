/**
 * ASCENDED MEMORY Phase — Generate portable capability artifacts
 * Tier-gated: Builder can see but not export. Export limits enforced per day.
 * Export languages are score-gated using the same LANGUAGE_UNLOCK_TIERS as crystallized memories.
 * Only capabilities with CJPI ≥ 68 are surfaced. Silicon/HDL targets require 94+.
 * Includes retirement prompt on export.
 */

import { useState, useEffect, useMemo } from 'react';
import { Package, Download, Loader2, FileCode2, Shield, Cpu, CheckCircle2, RefreshCw, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionLimits } from '@/hooks/useEvolutionLimits';
import { generateCapabilityPackZip, type CapabilityForExport } from '@/lib/proprietary-evolution/zip-generator';
import { LANGUAGE_UNLOCK_TIERS, getUnlockedLanguages } from '@/lib/export/language-unlock-tiers';
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

/** Minimum CJPI score to surface a capability for export */
const MIN_EXPORT_SCORE = 68;

export function ExportPhase() {
  const [allCapabilities, setAllCapabilities] = useState<CrystallizedCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<string>('typescript');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ packId: string; count: number } | null>(null);
  const [reingesting, setReingesting] = useState(false);
  const [showRetirementDialog, setShowRetirementDialog] = useState(false);
  const { toast } = useToast();
  const {
    canExport,
    exportsRemaining,
    evolutionExportsPerDay,
    productTier,
    isLoading: limitsLoading,
    refreshUsage,
  } = useEvolutionLimits();

  const isBuilderTier = productTier === 'builder';

  // Only surface capabilities ≥ 68 CJPI
  const capabilities = useMemo(
    () => allCapabilities.filter(c => c.cjpiScore >= MIN_EXPORT_SCORE),
    [allCapabilities]
  );

  // Highest score among eligible (non-exported, non-retired) capabilities drives language unlock
  const eligible = capabilities.filter(c => !c.exported && !c.retired);
  const bestScore = useMemo(
    () => eligible.reduce((max, c) => Math.max(max, c.cjpiScore), 0),
    [eligible]
  );

  // Available languages based on the best CJPI score (same tiers as crystallized memories)
  const unlockedLanguages = useMemo(() => getUnlockedLanguages(bestScore), [bestScore]);

  // Group language tiers for display
  const tierDisplay = useMemo(() => {
    return LANGUAGE_UNLOCK_TIERS.filter(t => t.minScore >= MIN_EXPORT_SCORE).map(tier => ({
      ...tier,
      unlocked: bestScore >= tier.minScore,
    }));
  }, [bestScore]);

  // Reset selected target if it becomes locked
  useEffect(() => {
    if (!unlockedLanguages.includes(selectedTarget as any) && unlockedLanguages.length > 0) {
      setSelectedTarget(unlockedLanguages[0]);
    }
  }, [unlockedLanguages, selectedTarget]);

  useEffect(() => {
    loadCrystallized();
  }, []);

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

  const initiateExport = () => {
    if (eligible.length === 0) {
      toast({ title: 'Nothing to export', description: 'No capabilities at CJPI 68+ available for export' });
      return;
    }
    if (!canExport) {
      toast({
        title: isBuilderTier ? 'Upgrade required' : 'Daily export limit reached',
        description: isBuilderTier
          ? 'The Builder tier lets you discover capabilities for free, but exporting requires a paid tier.'
          : `You've used all ${evolutionExportsPerDay} exports for today. Upgrade for more daily capacity.`,
        variant: 'destructive',
      });
      return;
    }
    if (!unlockedLanguages.includes(selectedTarget as any)) {
      toast({
        title: 'Language locked',
        description: `${selectedTarget} requires a higher CJPI score. Discover stronger capabilities to unlock it.`,
        variant: 'destructive',
      });
      return;
    }
    setShowRetirementDialog(true);
  };

  const handleExport = async () => {
    setShowRetirementDialog(false);
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'export',
          action: 'capability-pack',
          input: {
            capability_ids: eligible.map(c => c.id),
            target_language: selectedTarget,
            include_mini_runtime: true,
          },
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Export failed');

      const capsForExport: CapabilityForExport[] = eligible.map(c => ({
        id: c.id,
        name: c.name,
        cjpiScore: c.cjpiScore,
        tier: c.tier,
        chain: c.chain,
        fingerprint: c.fingerprint,
        moatSignature: c.moatSignature,
        capabilityType: c.capabilityType,
        description: c.description,
        category: c.category,
      }));

      const candidateName = capsForExport[0]?.chain[0] || 'CANDIDATE';

      await generateCapabilityPackZip({
        targetLanguage: selectedTarget,
        capabilities: capsForExport,
        candidateName,
      });

      setExportResult({ packId: data.pack_id, count: eligible.length });
      setAllCapabilities(prev => prev.map(c =>
        eligible.some(e => e.id === c.id) ? { ...c, exported: true, retired: true } : c
      ));
      await refreshUsage();
      toast({ title: 'Ascended Memory exported', description: `${eligible.length} capabilities exported & retired. Future Ascension cycles will discover new ones.` });
    } catch (err) {
      toast({ title: 'Export failed', description: String(err), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleReingest = async () => {
    if (capabilities.length === 0) return;
    setReingesting(true);

    try {
      const combinedName = `EVOLVED_${capabilities[0]?.chain[0] || 'PACK'}_V${Date.now().toString(36).slice(-4).toUpperCase()}`;
      const totalResolvers = capabilities.length * 3;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert({
        name: `CANDIDATE_${combinedName}`,
        slug: `candidate-${combinedName.toLowerCase().replace(/_/g, '-')}-${Date.now().toString(36)}`,
        tier: 'candidate',
        category: 'proprietary-evolution',
        description: `Re-ingested Candidate Node #41 — Evolved from ${capabilities.length} crystallized capabilities`,
        metadata: {
          phase: 'ingest',
          language: 'TypeScript/Evolved',
          file_count: capabilities.length,
          resolver_count: totalResolvers,
          size_kb: capabilities.length * 15,
          ingested_at: new Date().toISOString(),
          evolution_cycle: 2,
          parent_capabilities: capabilities.map(c => c.id),
          parent_avg_cjpi: Math.round(capabilities.reduce((s, c) => s + c.cjpiScore, 0) / capabilities.length),
        },
      });

      if (error) throw error;

      toast({
        title: 'Re-ingested as evolved candidate',
        description: `${combinedName} registered — return to Discovery to run deeper collision chains`,
      });
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
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            Export Quota
          </span>
          {isBuilderTier ? (
            <span className="text-xs font-mono text-destructive flex items-center gap-1">
              <Lock className="w-3 h-3" /> Upgrade to export
            </span>
          ) : (
            <span className={cn(
              "text-xs font-mono font-bold",
              canExport ? "text-primary" : "text-destructive"
            )}>
              {exportsRemaining}/{evolutionExportsPerDay} remaining today
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">
          Best CJPI: {bestScore} · {unlockedLanguages.length} languages
        </span>
      </div>

      {/* Export Config — Score-gated language tiers */}
      <div className={cn(
        "border rounded-xl p-5 space-y-4",
        isBuilderTier
          ? "border-border/20 bg-card/20 opacity-75"
          : "border-border/30 bg-card/40"
      )}>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Capability Pack Configuration</span>
        </div>

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
              {tier.languages.map(lang => {
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
            Includes Mini-Runtime™ Engine • License (HTML + MD) • README (HTML + MD) • Pipeline Details • Valuation • Manifest
          </span>
        </div>

        <Button
          onClick={initiateExport}
          disabled={exporting || isBuilderTier || !canExport}
          className="w-full gap-2"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isBuilderTier ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isBuilderTier ? 'Upgrade to Export' : 'Generate & Download Capability Pack (.zip)'}
        </Button>
      </div>

      {/* Retirement Confirmation Dialog */}
      <AlertDialog open={showRetirementDialog} onOpenChange={setShowRetirementDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Export & Retire Capabilities
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Exporting {eligible.length} capability{eligible.length !== 1 ? 'ies' : ''} will{' '}
                <strong className="text-foreground">retire them from the discovery pool</strong>.
              </p>
              <p>
                Retired capabilities are locked into your export bundle — future discovery runs
                will explore fresh collision patterns and find new ones. This compounds your
                proprietary advantage with each cycle.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExport}>
              Export & Retire
            </AlertDialogAction>
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

      {/* Capability List */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Export-Ready Capabilities ({capabilities.length} at CJPI 68+)
        </h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {capabilities.map(c => (
            <div
              key={c.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg",
                c.retired ? "bg-muted/5 opacity-50" : "bg-muted/10"
              )}
            >
              <FileCode2 className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground/80 truncate flex-1">{c.name}</span>
              <span className={cn(
                "text-[10px] font-mono",
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
              {c.exported && !c.retired && <CheckCircle2 className="w-3 h-3 text-green-500" />}
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
          className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
        >
          {reingesting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Re-ingest as Evolved Candidate → Start New Ascension Cycle
        </Button>
      </div>
    </div>
  );
}
