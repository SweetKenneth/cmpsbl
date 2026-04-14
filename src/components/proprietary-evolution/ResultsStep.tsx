/**
 * ResultsStep — Clean summary + export
 * Shows what was discovered in simple terms + download button
 */

import { useState, useEffect, useMemo } from 'react';
import { Download, Sparkles, Shield, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateCapabilityPackZip, type CapabilityForExport } from '@/lib/proprietary-evolution/zip-generator';
import type { ExportLanguage } from '@/lib/export/universal-adapter';

interface Props {
  stats: { discovered: number; ascended: number; topScore: number };
  onReset: () => void;
}

interface AscendedItem {
  name: string;
  score: number;
  tier: string;
  description: string;
}

export function ResultsStep({ stats, onReset }: Props) {
  const [items, setItems] = useState<AscendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<string>('typescript');
  const [sourceFiles, setSourceFiles] = useState<Array<{ name: string; content: string }>>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch ascended capabilities
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('artifact_registry')
        .select('name, metadata, tier, description')
        .eq('user_id', user.id)
        .eq('category', 'proprietary-ascended')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setItems(data.map((d: any) => ({
          name: d.name?.replace(/_/g, ' ') || 'Capability',
          score: Number(d.metadata?.cjpi_score || 0),
          tier: d.tier || 'mint',
          description: d.description || '',
        })));
      }

      // Get source language + files from candidate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: candidate } = await (supabase as any)
        .from('artifact_registry')
        .select('metadata')
        .eq('user_id', user.id)
        .eq('category', 'proprietary-evolution')
        .eq('tier', 'candidate')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (candidate?.metadata) {
        setSourceLanguage(candidate.metadata.source_export_language || 'typescript');
        if (candidate.metadata.source_files) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setSourceFiles(candidate.metadata.source_files.map((f: any) => ({
            name: f.name,
            content: f.content || '',
          })));
        }
      }

      setLoading(false);
    })();
  }, [user]);

  const scoreColor = (s: number) =>
    s >= 85 ? 'text-neon-amber' : s >= 60 ? 'text-primary' : 'text-muted-foreground';

  const avgScore = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length);
  }, [items]);

  const handleExportAll = async () => {
    if (!user || items.length === 0) return;
    setExporting(true);

    try {
      const caps: CapabilityForExport[] = items.map(item => ({
        name: item.name.replace(/\s+/g, '_'),
        tier: item.tier,
        cjpiScore: item.score,
        description: item.description,
        chain: [],
        fingerprint: `fp_${item.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now().toString(36)}`,
        moatSignature: `moat_${Date.now().toString(36)}`,
        capabilityType: 'ascended',
      }));

      const blob = await generateCapabilityPackZip(
        caps,
        sourceLanguage as ExportLanguage,
        sourceFiles,
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ascended-capabilities-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Export complete', description: `${items.length} capabilities exported.` });
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

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Your Results</h2>
        <p className="text-sm text-muted-foreground">
          {items.length > 0
            ? `${items.length} capabilities discovered and locked`
            : 'No strong matches found — try richer source code'
          }
        </p>
      </div>

      {/* Summary stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/20 bg-card/40 p-3 text-center">
            <p className="text-xl font-bold text-foreground">{items.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Capabilities</p>
          </div>
          <div className="rounded-xl border border-border/20 bg-card/40 p-3 text-center">
            <p className={cn("text-xl font-bold", scoreColor(avgScore))}>{avgScore}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Avg Score</p>
          </div>
          <div className="rounded-xl border border-border/20 bg-card/40 p-3 text-center">
            <p className={cn("text-xl font-bold", scoreColor(stats.topScore))}>{stats.topScore}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Top Score</p>
          </div>
        </div>
      )}

      {/* Capability list — clean & simple */}
      {items.length > 0 && (
        <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border/15 bg-card/30 px-3 py-2.5 animate-fade-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                {item.description && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.description}</p>
                )}
              </div>
              <span className={cn("text-xs font-bold tabular-nums shrink-0", scoreColor(item.score))}>
                {item.score}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Score quality bar */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Overall Quality
            </span>
            <span className={cn("font-bold", scoreColor(avgScore))}>
              {avgScore >= 85 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Fair'}
            </span>
          </div>
          <Progress value={avgScore} className="h-2 rounded-full" />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        {items.length > 0 && (
          <Button
            size="lg"
            className="w-full h-12 rounded-xl text-sm font-semibold gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
            onClick={handleExportAll}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting ? 'Generating…' : 'Download All Capabilities'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="lg"
          className="w-full h-12 rounded-xl text-sm text-muted-foreground gap-2"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4" />
          Start Over with New Code
        </Button>
      </div>
    </div>
  );
}
