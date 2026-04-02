/**
 * ASCENDED MEMORY Phase — Generate portable capability artifacts
 * Supports individual capability export AND download-all.
 * Vault management: save/discard discoveries.
 * 
 * LOCKED EXPORT LANGUAGE: Ascension exports are always in the ingested language.
 * Users import Python → export Python. No cross-language export.
 *
 * Accepts optional verticalResult from the Forge phase to include
 * vertical discoveries in the export ZIP.
 */
import type { VerticalCollisionResult } from '@/lib/ascension/vertical-collision';

import { useState, useEffect, useMemo } from 'react';
import { labelPrimitive } from '@/lib/export/primitive-labels';
import { Package, Download, Loader2, FileCode2, Shield, CheckCircle2, Lock, AlertTriangle, Trash2, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportWarpTunnel, type WarpState } from './ExportWarpTunnel';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionLimits } from '@/hooks/useEvolutionLimits';
import { generateCapabilityPackZip, type CapabilityForExport } from '@/lib/proprietary-evolution/zip-generator';
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

interface AscendedCapability {
  id: string;
  name: string;
  cjpiScore: number;
  tier: string;
  ascendedAt: string;
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

// No minimum export score — all ascended capabilities are exportable

/**
 * Map the ingested language label to the ExportLanguage key.
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

interface ExportPhaseProps {
  verticalResult?: VerticalCollisionResult | null;
}

export function ExportPhase({ verticalResult }: ExportPhaseProps = {}) {
  const [allCapabilities, setAllCapabilities] = useState<AscendedCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{ packId: string; count: number } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
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

  const capabilities = allCapabilities;

  const eligible = capabilities.filter(c => !c.exported && !c.retired);
  const bestScore = useMemo(
    () => eligible.reduce((max, c) => Math.max(max, c.cjpiScore), 0),
    [eligible]
  );

  // The export language is ALWAYS the source language — no picker needed
  const exportLanguage = sourceLanguage || 'typescript';

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
    loadCrystallized();
    loadCandidateLanguage();
  }, []);

  /** Load the candidate's ingested language and source files (user-scoped) */
  const loadCandidateLanguage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('metadata')
      .eq('user_id', user.id)
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
      }

      // Extract user source files for inclusion in ZIP
      const sourceFiles = (meta.source_files as Array<{ name: string; extension: string; language: string; content: string }>) || [];
      setUserSourceFiles(sourceFiles.filter(f => f.content && f.content.length > 0));
    }
  };

  const loadCrystallized = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('id, name, metadata, tier, created_at, description, category')
      .eq('user_id', user.id)
      .eq('category', 'proprietary-ascended')
      .order('created_at', { ascending: false })
      .limit(500);

    if (data) {
      setAllCapabilities((data as any[]).map((d: any) => {
        const meta = d.metadata || {};
        return {
          id: d.id,
          name: d.name,
          cjpiScore: Number(meta.cjpi_score || 0),
          tier: d.tier || 'mint',
          ascendedAt: String(meta.ascended_at || d.created_at),
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
    setExportScope(scope);
    setShowRetirementDialog(true);
  };

  const handleExport = async () => {
    setShowRetirementDialog(false);
    const targets = exportScope === 'all' ? eligible : eligible.filter(c => c.id === exportScope);
    if (targets.length === 0) return;
    
    setExporting(exportScope);

    // Snap to warp tunnel
    setTimeout(() => {
      document.getElementById('export-warp')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    try {
      const { data, error } = await supabase.functions.invoke('pf-proprietary-evolution', {
        body: {
          module: 'export',
          action: 'capability-pack',
          input: {
            capability_ids: targets.map(c => c.id),
            target_language: exportLanguage,
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

      // Forge MERGES into base capabilities — upgrading them into super agents.
      // Each forge discovery is paired 1:1 with a base capability via baseDiscoveryId.
      // The result is the SAME number of capabilities, but each is enhanced with an agent persona.
      if (verticalResult?.discoveries?.length) {
        for (const d of verticalResult.discoveries) {
          const baseIdx = capsForExport.findIndex(c => c.id === d.baseDiscoveryId);
          if (baseIdx >= 0) {
            // Upgrade the base capability in-place
            const base = capsForExport[baseIdx];
            capsForExport[baseIdx] = {
              ...base,
              name: `${base.name}::${d.primitiveName}`.toLowerCase(),
              cjpiScore: Math.max(base.cjpiScore, d.cjpiScore),
              chain: [...base.chain, d.primitiveName],
              moatSignature: `${base.moatSignature}+${d.primitiveName}::forge`,
              capabilityType: `${verticalResult.verticalName || d.vertical} Super Agent`,
              description: `${base.description} Enhanced with ${d.primitiveName} agent persona: ${d.description}`,
            };
          }
        }
      }

      const candidateName = capsForExport[0]?.chain[0] || 'CANDIDATE';

      await generateCapabilityPackZip({
        targetLanguage: exportLanguage,
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('artifact_registry')
        .delete()
        .eq('id', capId)
        .eq('user_id', user.id);
      if (error) throw error;
      setAllCapabilities(prev => prev.filter(c => c.id !== capId));
      toast({ title: 'Capability discarded', description: 'Removed from your vault.' });
    } catch (err) {
      toast({ title: 'Discard failed', description: String(err), variant: 'destructive' });
    } finally {
      setDiscarding(null);
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
      <div className="border border-border/30 rounded-xl p-8 text-center bg-card/30 space-y-3">
        <Package className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">No export-ready capabilities</p>
        <p className="text-xs text-muted-foreground mt-1">
          Ascend discoveries first to make them available for export.
        </p>
        <p className="text-[10px] text-primary font-mono">← Go to Step 3 (Ascend) to lock capabilities into memory</p>
      </div>
    );
  }

  const isHdl = ['verilog', 'vhdl', 'systemverilog', 'systemc', 'spice', 'chisel', 'amaranth'].includes(exportLanguage);

  return (
    <div className="space-y-6">
      {/* Tier Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/20">
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
          Best CJPI: {bestScore} · {eligible.length} eligible
        </span>
      </div>

      {/* ═══ WARP TUNNEL VISUALIZATION ═══ */}
      {eligible.length > 0 && (
        <div id="export-warp">
        <ExportWarpTunnel
          state={
            exporting ? 'launching'
              : exportResult ? 'complete'
              : 'idle'
          }
          capabilityCount={eligible.length}
          exportedCount={exportResult?.count}
        />
        </div>
      )}

      {/* Export Language — Locked to Source */}
      <div className={cn(
        "border rounded-2xl p-5 sm:p-6 space-y-5",
        isBuilderTier ? "border-border/20 bg-card/20 opacity-75" : "border-border/25 bg-card/60 backdrop-blur-sm shadow-sm"
      )}>
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Export Language</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/[0.05] border border-primary/20">
          <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-mono text-foreground font-bold">
              {exportLanguage}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Locked to your ingested language{sourceLanguageLabel ? ` (${sourceLanguageLabel})` : ''}
            </p>
          </div>
          <span className="text-[9px] font-mono px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/15">
            {isHdl ? 'HDL' : 'Software'}
          </span>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Ascension exports match your import language — your code plugs back into your stack.
          {isHdl && <span className="text-primary"> HDL integrity and timing constraints preserved.</span>}
          {' '}Your original source files ({userSourceFiles.length}) are included alongside substrate-enhanced code.
        </p>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            Includes Mini-Runtime™ Engine • License • README • Memory Chain Details • Valuation • Manifest
          </span>
        </div>

        {/* ═══ EXPORT PREVIEW SUMMARY ═══ */}
        {eligible.length > 0 && (
          <div className="rounded-lg border border-border/20 bg-muted/10 p-3 space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Export Preview</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {verticalResult?.discoveries?.length ? 'Super Agents' : 'Capabilities'}
                </span>
                <span className="font-mono font-bold text-foreground">{eligible.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source files</span>
                <span className="font-mono font-bold text-foreground">{userSourceFiles.length}</span>
              </div>
              {verticalResult && verticalResult.discoveries.length > 0 && (
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">{verticalResult.verticalName} personas merged</span>
                  <span className="font-mono font-bold text-primary">{verticalResult.discoveries.length} of {eligible.length} upgraded</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best CJPI</span>
                <span className="font-mono font-bold text-neon-amber">{bestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. files in ZIP</span>
                <span className="font-mono font-bold text-foreground">
                  {eligible.length * 3 + userSourceFiles.length + 4}
                </span>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground">
              Includes: capability modules, Mini-Runtime™, README, manifest, license, memory chain details
              {verticalResult && verticalResult.discoveries.length > 0 && ` — each capability enhanced with ${verticalResult.verticalName} agent persona`}
            </p>
          </div>
        )}

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
            {isBuilderTier ? 'Upgrade to Export' : `Download All ${eligible.length} ${verticalResult?.discoveries?.length ? 'Super Agents' : 'Capabilities'} (.zip)`}
          </Button>
        )}
      </div>

      {/* Retirement Confirmation Dialog */}
      <AlertDialog open={showRetirementDialog} onOpenChange={setShowRetirementDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-neon-amber" />
              Export & Retire
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Exporting will <strong className="text-foreground">retire {exportScope === 'all' ? 'all' : 'this'} capability from the discovery pool</strong>.
              </p>
              <p>
                Retired capabilities are locked into your export. Future runs find new ones.
              </p>
              {userSourceFiles.length > 0 && (
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
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
          <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-neon-green dark:text-neon-green font-medium">
              Pack downloaded — {exportResult.count} capabilities exported & retired
            </p>
            <p className="text-[10px] text-neon-green/70 dark:text-neon-green/70 font-mono break-words">
              Pack ID: {exportResult.packId}
            </p>
          </div>
        </div>
      )}

      {/* Capability List — Individual export + discard */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Your Vault ({capabilities.length} ascended)
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
                <span className="text-xs text-foreground font-medium break-words flex-1">{c.name}</span>
                <span className={cn(
                  "text-[10px] font-mono font-bold uppercase",
                  c.cjpiScore >= 90 ? "text-neon-amber" :
                  c.cjpiScore >= 80 ? "text-neon-blue" :
                  "text-muted-foreground"
                )}>
                  {c.tier}
                </span>
                <span className={cn(
                  "text-[10px] font-mono tabular-nums",
                  c.cjpiScore >= 90 ? "text-neon-amber" :
                  c.cjpiScore >= 80 ? "text-neon-blue" :
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
                          {labelPrimitive(node)}
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
                    className="h-10 min-h-[44px] text-xs gap-1.5 flex-1"
                    disabled={!!exporting || isBuilderTier || !canExport}
                    onClick={() => initiateExport(c.id)}
                  >
                    {exporting === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Export this capability
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 min-h-[44px] text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={discarding === c.id}
                    onClick={() => handleDiscard(c.id)}
                  >
                    {discarding === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Discard
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}