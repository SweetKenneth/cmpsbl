/**
 * ResultsStep — Consumes canonical AscensionResults
 * 
 * E2: Uses deterministicFingerprint for export
 * Summary, quality metrics, and export all derive from one result object.
 */

import { useState, useMemo } from 'react';
import { Download, Sparkles, Shield, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { generateCapabilityPackZip, type CapabilityForExport } from '@/lib/proprietary-evolution/zip-generator';
import { deterministicFingerprint, type AscensionResults } from '@/lib/ascension/orchestrator';

interface Props {
  results: AscensionResults | null;
  onReset: () => void;
}

export function ResultsStep({ results, onReset }: Props) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const items = results?.capabilities ?? [];

  const scoreColor = (s: number) =>
    s >= 85 ? 'text-neon-amber' : s >= 60 ? 'text-primary' : 'text-muted-foreground';

  const avgScore = useMemo(() => results?.avgScore ?? 0, [results]);

  const handleExportAll = async () => {
    if (!results || items.length === 0) return;
    setExporting(true);

    try {
      const caps: CapabilityForExport[] = items.map((item) => ({
        id: deterministicFingerprint(item.name, item.nodeA, item.nodeB, results.runId),
        name: item.name.replace(/\s+/g, '_'),
        tier: item.tier,
        cjpiScore: item.score,
        description: item.description,
        chain: [],
        fingerprint: deterministicFingerprint(item.name, item.nodeA, item.nodeB, results.runId),
        moatSignature: `moat_${deterministicFingerprint(item.name, item.nodeA, item.nodeB, results.runId)}`,
        capabilityType: 'ascended',
      }));

      await generateCapabilityPackZip({
        targetLanguage: results.sourceLanguage,
        capabilities: caps,
        candidateName: results.candidateName || 'ascension_export',
        userSourceFiles: [],
        sourceLanguage: results.sourceLanguage,
      });

      toast({ title: 'Export complete', description: `${items.length} capabilities exported.` });
    } catch (err) {
      toast({ title: 'Export failed', description: String(err), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  if (!results) {
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
            <p className="text-xl font-bold text-foreground">{results.discovered}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Discovered</p>
          </div>
          <div className="rounded-xl border border-border/20 bg-card/40 p-3 text-center">
            <p className={cn("text-xl font-bold", scoreColor(avgScore))}>{avgScore}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Avg Score</p>
          </div>
          <div className="rounded-xl border border-border/20 bg-card/40 p-3 text-center">
            <p className={cn("text-xl font-bold", scoreColor(results.topScore))}>{results.topScore}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Top Score</p>
          </div>
        </div>
      )}

      {/* Capability list */}
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
