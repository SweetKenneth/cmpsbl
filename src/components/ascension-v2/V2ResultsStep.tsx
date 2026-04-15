/**
 * V2 Results Step — Complete Ascension V2 Export
 * Exports: LICENSE.html, README.html, USER-GUIDE.html, original file,
 * ascended file (L2 wrapped), and ADVERTISEMENT.html
 * ZIP named: cmpsbl-ascended-{originalFileName}.zip
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Download, RotateCcw, Loader2, ShieldCheck, FileCode2, Package, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { completeRun, getSnapshot, type DiscoveredCapability, type DedupResult } from '@/lib/ascension-v2';
import { getChainState, getChainIntegrityHash } from '@/lib/ascension-v2/audit-chain';
import { generateUnifiedCapabilityFile, getUnifiedFilename } from '@/lib/export/unified-capability-file';
import { serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import {
  generateV2LicenseHTML,
  generateV2ReadmeHTML,
  generateV2UserGuideHTML,
  generateV2AdvertisementHTML,
} from '@/lib/export/ascension-v2-docs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { UnifiedCapabilityInput } from '@/lib/export/unified-capability-file';

interface Props {
  capabilities: ReadonlyArray<DiscoveredCapability>;
  dedup: DedupResult;
  enhanced?: boolean;
  onReset: () => void;
}

interface SourceFileData {
  name: string;
  extension: string;
  language: string;
  content: string;
}

export function V2ResultsStep({ capabilities, dedup, enhanced = false, onReset }: Props) {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [integrityHash, setIntegrityHash] = useState('');
  const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);
  const [candidateName, setCandidateName] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('typescript');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    completeRun();
    getChainIntegrityHash().then(setIntegrityHash);

    // Fetch original source files from artifact_registry
    const fetchSourceFiles = async () => {
      if (!user) return;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('artifact_registry')
          .select('name, metadata')
          .eq('user_id', user.id)
          .eq('category', 'proprietary-evolution-v2')
          .eq('tier', 'candidate')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data?.metadata?.source_files) {
          setSourceFiles(data.metadata.source_files as SourceFileData[]);
          setCandidateName(data.name?.replace('CANDIDATE_', '') || 'source');
          setSourceLanguage(data.metadata.language || 'typescript');
        }
      } catch {
        /* non-fatal — export will still work without originals */
      }
    };

    fetchSourceFiles();
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [user]);

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
      const lang = sourceLanguage.toLowerCase().replace(/\s+/g, '');

      // Determine original file name
      const primaryFile = sourceFiles.length > 0 ? sourceFiles[0] : null;
      const originalFileName = primaryFile?.name || `source.${lang === 'typescript' ? 'ts' : lang === 'python' ? 'py' : 'ts'}`;
      const baseName = originalFileName.replace(/\.[^.]+$/, '');
      const ext = originalFileName.match(/\.[^.]+$/)?.[0] || '.ts';

      // Ascended file name — user renames to original before drop-in
      const ascendedFileName = `cmpsbl.${baseName}${ext}`;

      // ZIP name per spec
      const zipName = `cmpsbl-ascended-${baseName}`;
      const fingerprint = integrityHash.slice(0, 12).toUpperCase() || 'PENDING';

      // ── Build capability inputs ──
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

      // ── Generate the ascended file (L2 wrapped) ──
      const ascendedCode = generateUnifiedCapabilityFile(
        capInputs,
        zipName,
        lang === 'typescript' ? 'typescript' : lang,
        sourceFiles.length > 0 ? sourceFiles : undefined,
      );

      // ── Generate all HTML docs ──
      const licenseHTML = generateV2LicenseHTML(zipName);

      const readmeHTML = generateV2ReadmeHTML({
        packName: zipName,
        originalFileName,
        ascendedFileName,
        capabilities: capabilities.map(c => ({
          name: c.name,
          cjpiScore: c.cjpiScore,
          tier: c.tier,
          chain: [...c.chain],
        })),
        language: sourceLanguage,
        avgCjpi: avgScore,
        topCjpi: topScore,
        fingerprint,
      });

      const userGuideHTML = generateV2UserGuideHTML({
        packName: zipName,
        originalFileName,
        ascendedFileName,
        capabilities: capabilities.map(c => ({
          name: c.name,
          cjpiScore: c.cjpiScore,
          tier: c.tier,
          chain: [...c.chain],
          description: c.description || '',
        })),
        language: sourceLanguage,
        avgCjpi: avgScore,
        fingerprint,
        integrityHash: integrityHash || 'PENDING',
        enhanced,
      });

      const advertisementHTML = generateV2AdvertisementHTML(zipName, capabilities.length);

      // ── Build ZIP ──
      const zip = new JSZip();
      const folder = zip.folder(zipName)!;

      // 1. LICENSE.html
      folder.file('LICENSE.html', licenseHTML);

      // 2. README.html
      folder.file('README.html', readmeHTML);

      // 3. USER-GUIDE.html
      folder.file('USER-GUIDE.html', userGuideHTML);

      // 4. Original source file(s) — untouched
      if (sourceFiles.length === 1) {
        folder.file(originalFileName, sourceFiles[0].content);
      } else if (sourceFiles.length > 1) {
        const origFolder = folder.folder('original')!;
        for (const sf of sourceFiles) {
          origFolder.file(sf.name, sf.content);
        }
      }

      // 5. Ascended file (L2 wrapped)
      folder.file(ascendedFileName, ascendedCode);

      // 6. ADVERTISEMENT.html
      folder.file('ADVERTISEMENT.html', advertisementHTML);

      // 7. manifest.json
      const manifest = serializeCmpsblManifest({
        name: zipName,
        cjpi: avgScore,
        primitives: [...new Set(capabilities.flatMap(c => [...c.chain]))],
        targets: [lang],
        version: '2.0.0',
        category: 'proprietary-evolution-v2',
        fingerprint,
        source: 'ascension-v2-pipeline',
      });
      folder.file('manifest.json', manifest);

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${zipName}.zip`);

      toast({
        title: 'Export complete',
        description: `${zipName}.zip — ${capabilities.length} capabilities, full docs included.`,
      });
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

      {/* Package contents preview */}
      {capabilities.length > 0 && (
        <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Export Package Contents</span>
          </div>
          <div className="space-y-1.5">
            {[
              { icon: FileText, name: 'LICENSE.html', desc: 'Commercial license with patent notices' },
              { icon: FileText, name: 'README.html', desc: 'Package overview & quick start' },
              { icon: FileText, name: 'USER-GUIDE.html', desc: 'Full guide: pipeline, activation, errors' },
              { icon: FileCode2, name: sourceFiles[0]?.name || 'source.*', desc: 'Original file — untouched' },
              { icon: FileCode2, name: `cmpsbl.${(sourceFiles[0]?.name || 'source.ts').replace(/\.[^.]+$/, '')}.*`, desc: `Ascended — ${capabilities.length} capabilities activated` },
              { icon: FileText, name: 'ADVERTISEMENT.html', desc: 'Custom Mana layers preview' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 py-1">
                <item.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-mono text-foreground truncate">{item.name}</span>
                <span className="text-[10px] text-muted-foreground truncate ml-auto">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capabilities list */}
      {capabilities.length > 0 && (
        <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Activated Capabilities</span>
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
            {exporting ? 'Generating Package…' : `Download cmpsbl-ascended-${(sourceFiles[0]?.name || 'source').replace(/\.[^.]+$/, '')}.zip`}
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
