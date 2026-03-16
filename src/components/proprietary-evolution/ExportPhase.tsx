/**
 * EXPORT Phase — Generate Capability Packs from crystallized memories
 * Includes Mini-Runtime™ for local execution
 */

import { useState, useEffect } from 'react';
import { Package, Download, Loader2, FileCode2, Shield, Cpu, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CrystallizedCapability {
  id: string;
  name: string;
  cjpiScore: number;
  tier: string;
  crystallizedAt: string;
  exported: boolean;
}

const EXPORT_TARGETS = [
  { id: 'typescript', label: 'TypeScript', ext: '.ts' },
  { id: 'python', label: 'Python', ext: '.py' },
  { id: 'rust', label: 'Rust', ext: '.rs' },
  { id: 'go', label: 'Go', ext: '.go' },
  { id: 'zig', label: 'Zig', ext: '.zig' },
] as const;

export function ExportPhase() {
  const [capabilities, setCapabilities] = useState<CrystallizedCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<string>('typescript');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCrystallized();
  }, []);

  const loadCrystallized = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('artifact_registry')
      .select('id, name, metadata, tier, created_at')
      .eq('category', 'proprietary-crystallized')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setCapabilities((data as any[]).map((d: any) => {
        const meta = d.metadata || {};
        return {
          id: d.id,
          name: d.name,
          cjpiScore: Number(meta.cjpi_score || 0),
          tier: d.tier || 'mint',
          crystallizedAt: String(meta.crystallized_at || d.created_at),
          exported: meta.exported === true,
        };
      }));
    }
    setLoading(false);
  };

  const handleExport = async () => {
    const eligible = capabilities.filter(c => !c.exported);
    if (eligible.length === 0) {
      toast({ title: 'Nothing to export', description: 'All capabilities already exported' });
      return;
    }

    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
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

      // Mark as exported
      for (const cap of eligible) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('artifact_registry').update({
          metadata: {
            exported: true,
            exported_at: new Date().toISOString(),
            export_target: selectedTarget,
          },
        }).eq('id', cap.id);
      }

      setExportResult(data?.download_url || 'Export completed');
      setCapabilities(prev => prev.map(c => ({ ...c, exported: true })));
      toast({ title: 'Capability Pack generated', description: `${eligible.length} capabilities exported` });
    } catch (err) {
      toast({ title: 'Export failed', description: String(err), variant: 'destructive' });
    } finally {
      setExporting(false);
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
        <p className="text-sm text-foreground font-medium">No crystallized capabilities</p>
        <p className="text-xs text-muted-foreground mt-1">
          Complete the Crystallization phase to lock capabilities for export
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Config */}
      <div className="border border-border/30 rounded-xl p-5 bg-card/40 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Capability Pack Configuration</span>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Target Language</p>
          <div className="flex flex-wrap gap-2">
            {EXPORT_TARGETS.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTarget(t.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono transition-all border",
                  selectedTarget === t.id
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "text-muted-foreground border-border/20 hover:border-border/40"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            Includes Mini-Runtime™ Engine ({selectedTarget === 'typescript' ? '~700' : '~900'} lines)
          </span>
        </div>

        <Button onClick={handleExport} disabled={exporting} className="w-full gap-2">
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Generate Capability Pack
        </Button>
      </div>

      {/* Export Result */}
      {exportResult && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Pack ready</p>
            <p className="text-[10px] text-green-600/70 dark:text-green-400/70 font-mono truncate">
              {exportResult}
            </p>
          </div>
        </div>
      )}

      {/* Capability List */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Crystallized Capabilities ({capabilities.length})
        </h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {capabilities.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/10"
            >
              <FileCode2 className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground/80 truncate flex-1">{c.name}</span>
              <span className={cn(
                "text-[10px] font-mono",
                c.cjpiScore >= 85 ? "text-amber-400" : "text-muted-foreground"
              )}>
                CJPI {c.cjpiScore}
              </span>
              {c.exported && <CheckCircle2 className="w-3 h-3 text-green-500" />}
            </div>
          ))}
        </div>
      </div>

      {/* Re-ingest CTA */}
      <div className="border border-dashed border-border/30 rounded-xl p-4 text-center bg-card/20">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Recursive Loop:</span>{' '}
          Re-ingest your enhanced stack to discover deeper chains.
          Each cycle compounds exclusivity.
        </p>
      </div>
    </div>
  );
}
