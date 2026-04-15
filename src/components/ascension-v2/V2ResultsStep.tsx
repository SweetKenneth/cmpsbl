/**
 * V2 Results Step — Single wrapped ascension file export
 * Exports all deduped capabilities as ONE unified cmpsbl.* file,
 * not individual per-capability downloads.
 */

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Download, RotateCcw, Loader2, ShieldCheck, FileCode2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { completeRun, getSnapshot, type DiscoveredCapability, type DedupResult } from '@/lib/ascension-v2';
import { getChainState, getChainIntegrityHash } from '@/lib/ascension-v2/audit-chain';
import { generateUnifiedCapabilityFile, getUnifiedFilename } from '@/lib/export/unified-capability-file';
import { generateCmpsblManifest, serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { UnifiedCapabilityInput } from '@/lib/export/unified-capability-file';

interface Props {
  capabilities: ReadonlyArray<DiscoveredCapability>;
  dedup: DedupResult;
  enhanced?: boolean;
  onReset: () => void;
}

export function V2ResultsStep({ capabilities, dedup, enhanced = false, onReset }: Props) {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [integrityHash, setIntegrityHash] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    completeRun();
    getChainIntegrityHash().then(setIntegrityHash);
    // Brief settle time for DB writes to propagate
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const avgScore = useMemo(() => {
    if (capabilities.length === 0) return 0;
    return Math.round(capabilities.reduce((sum, c) => sum + c.cjpiScore, 0) / capabilities.length);
  }, [capabilities]);

  const topScore = useMemo(() => {
    if (capabilities.length === 0) return 0;
    return Math.max(...capabilities.map(c => c.cjpiScore));
  }, [capabilities]);

  const scoreColor = (s: number) =>
    s >= 85 ? 'text-amber-500' : s >= 60 ? 'text-primary' : 'text-muted-foreground';

  const handleExport = async () => {
    if (capabilities.length === 0) return;
    setExporting(true);

    try {
      const packName = `ascension-v2-${Date.now().toString(36)}`;
      const lang = 'typescript';

      // Convert DiscoveredCapability → UnifiedCapabilityInput
      const capInputs: UnifiedCapabilityInput[] = capabilities.map((cap, i) => ({
        id: `asc_v2_${i}_${Date.now().toString(36)}`,
        name: cap.name.replace(/\s+/g, '_'),
        cjpiScore: cap.cjpiScore,
        tier: cap.tier,
        chain: [...cap.chain],
        fingerprint: `fp_${cap.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now().toString(36)}`,
        moatSignature: `moat_${Date.now().toString(36)}`,
        capabilityType: 'ascended',
        description: cap.description,
      }));

      // Generate the single unified file containing ALL capabilities
      const unifiedCode = generateUnifiedCapabilityFile(capInputs, packName, lang);
      const unifiedFilename = getUnifiedFilename(lang);

      // Generate manifest
      const manifest = serializeCmpsblManifest({
        name: packName,
        cjpi: avgScore,
        primitives: [...new Set(capabilities.flatMap(c => [...c.chain]))],
        targets: [lang],
        version: '2.0.0',
        category: 'proprietary-evolution-v2',
        fingerprint: integrityHash.slice(0, 12).toUpperCase(),
        source: 'ascension-v2-pipeline',
      });

      // Build ZIP: single unified file + manifest
      const zip = new JSZip();
      const folder = zip.folder(packName)!;

      // The single wrapped ascension file
      folder.file(unifiedFilename, unifiedCode);

      // Manifest
      folder.file('manifest.json', manifest);

      // Capability summary
      const summary = capabilities.map((c, i) =>
        `${i + 1}. ${c.name} — CJPI ${c.cjpiScore} (${c.tier}) — Chain: ${c.chain.join(' → ')}`
      ).join('\n');

      folder.file('CAPABILITIES.md', `# Ascended Capabilities\n\n${summary}\n\n---\nDedup: ${dedup.rawCount} raw → ${dedup.capabilities.length} unique (${dedup.groupCount} groups)\nPipeline: Ascension V2\nIntegrity: ${integrityHash.slice(0, 24)}\n`);

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${packName}.zip`);

      toast({ title: 'Export complete', description: `Single wrapped file with ${capabilities.length} capabilities.` });
    } catch (err) {
      toast({ title: 'Export failed', description: String(err), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chain = getChainState();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Trophy className="w-10 h-10 mx-auto text-primary" />
        <h2 className="text-xl font-bold text-foreground">Your Ascended Code</h2>
        <p className="text-muted-foreground text-sm">
          {capabilities.length > 0
            ? `${dedup.rawCount} discoveries → ${capabilities.length} unique capabilities wrapped into a single file`
            : 'No strong matches found — try richer source code'}
        </p>
      </div>

      {/* Summary stats */}
      {capabilities.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{capabilities.length}</p>
            <p className="text-[10px] text-muted-foreground">Unique</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{avgScore}</p>
            <p className="text-[10px] text-muted-foreground">Avg CJPI</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{topScore}</p>
            <p className="text-[10px] text-muted-foreground">Top Score</p>
          </div>
        </div>
      )}

      {/* Single file preview */}
      {capabilities.length > 0 && (
        <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Single Wrapped File</span>
          </div>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-xs text-foreground truncate flex-1">{cap.name}</span>
                <span className={cn('text-xs font-mono font-bold', scoreColor(cap.cjpiScore))}>
                  {cap.cjpiScore}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            All {capabilities.length} capabilities compiled into cmpsbl.ts — drop in, import, use.
          </p>
        </div>
      )}

      {/* Audit chain integrity badge */}
      <div className="bg-muted/20 rounded-xl p-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground">
            Audit Chain: {chain.length} entries · {chain.verified ? 'Verified ✓' : 'Broken ✗'}
          </p>
          {integrityHash && (
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              SHA-256: {integrityHash.slice(0, 24)}…
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {capabilities.length > 0 && (
          <Button onClick={handleExport} disabled={exporting} className="w-full h-12 rounded-xl text-base">
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {exporting ? 'Generating…' : 'Download Ascended File'}
          </Button>
        )}

        <Button variant="ghost" onClick={onReset} className="w-full">
          <RotateCcw className="w-3 h-3 mr-1" />
          Start Over with New Code
        </Button>
      </div>
    </div>
  );
}
