/**
 * V2 Results Step — Complete Ascension V2 Export
 * Exports: LICENSE.html, README.html, USER-GUIDE.html, original file,
 * ascended file (L2 wrapped), and ADVERTISEMENT.html
 * ZIP named: cmpsbl-ascended-{originalFileName}.zip
 *
 * Now includes optional CMPSBL Layer selection (Crown Jewel add-ons).
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useEffect, useMemo } from 'react';
import { Trophy, Download, RotateCcw, Loader2, ShieldCheck, FileCode2, Package, FileText, Zap, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DownloadCeremonyOverlay } from '@/components/downloads/DownloadCeremonyOverlay';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { completeRun, getSnapshot, type DiscoveredCapability, type DedupResult } from '@/lib/ascension-v2';
import { getChainState, getChainIntegrityHash } from '@/lib/ascension-v2/audit-chain';
import { generateUnifiedCapabilityFile, getUnifiedFilename } from '@/lib/export/unified-capability-file';
import { formatEnhancedCapabilityName } from '@/lib/export/humanize-name';
import { validateLayer2Linkage } from '@/lib/export/layer2-validator';
import { runPreExportHarness, formatHarnessVerdict } from '@/lib/ascension-v2/pre-export-harness';
import { serializeCmpsblManifest } from '@/lib/export/cmpsbl-manifest';
import {
  generateV2LicenseHTML,
  generateV2ReadmeHTML,
  generateV2UserGuideHTML,
  generateV2AdvertisementHTML,
} from '@/lib/export/ascension-v2-docs';
import { detectUpstreamLicenseForExport, buildUpstreamLicenseFile, buildNoticeFile } from '@/lib/licensing/upstream-license-bundle';
import { V2UpstreamLicenseSelect, type SpdxChoice } from './V2UpstreamLicenseSelect';
import { detectLicenseFromSiblingFile } from '@/lib/factory/sibling-license-scan';
import { buildLicenseFromSpdx, type DetectedLicense } from '@/lib/factory/license-attribution';
import { AlertTriangle } from 'lucide-react';
import { getAvailableLayers, type CmpsblLayerDefinition } from '@/lib/export/cmpsbl-layers';
import { V2SmartRecommendations } from './V2SmartRecommendations';
import { V2ActivationGuide } from './V2ActivationGuide';
import {
  getLanguageParityStatus,
  getLanguageParityEntry,
  getShippingLanguages,
} from '@/lib/export/language-parity-tiers';
import { Clock } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { UnifiedCapabilityInput } from '@/lib/export/unified-capability-file';

interface Props {
  capabilities: ReadonlyArray<DiscoveredCapability>;
  dedup: DedupResult;
  enhanced?: boolean;
  selectedLayerIds?: string[];
  onReset: () => void;
}

interface SourceFileData {
  name: string;
  extension: string;
  language: string;
  content: string;
}

export function V2ResultsStep({ capabilities, dedup, enhanced = false, selectedLayerIds = [], onReset }: Props) {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [ceremonyOpen, setCeremonyOpen] = useState(false);
  const [ceremonyName, setCeremonyName] = useState('');
  const [integrityHash, setIntegrityHash] = useState('');
  const [sourceFiles, setSourceFiles] = useState<SourceFileData[]>([]);
  const [candidateName, setCandidateName] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('typescript');
  const [spdxChoice, setSpdxChoice] = useState<SpdxChoice>('auto');
  // After export succeeds we surface the run-aware activation guide so the
  // user has copy-pasteable next steps using their actual ascended filename.
  const [exportedAscendedName, setExportedAscendedName] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const availableLayers = useMemo(() => getAvailableLayers(), []);
  const selectedLayers = useMemo(() => new Set(selectedLayerIds), [selectedLayerIds]);

  // Live detection of the upstream license. Two strategies, in order:
  //   1. Sibling LICENSE file in the upload set (covers the common case where
  //      a repo's LICENSE lives at the root, not in every source-file header —
  //      e.g. Simon Willison's `llm`, most Python/Rust/Go projects).
  //   2. Inline SPDX/Apache/MIT/BSD/MPL/ISC header in the primary source.
  // Both strategies use the same conservative SPDX patterns, so a hit is
  // legally meaningful regardless of which one fired.
  const detectedUpstream: DetectedLicense | null = useMemo(() => {
    if (sourceFiles.length === 0) return null;
    const sibling = detectLicenseFromSiblingFile(sourceFiles);
    if (sibling) return sibling;
    return detectUpstreamLicenseForExport(sourceFiles[0].content);
  }, [sourceFiles]);

  // True only when the user has neither inline-detected nor manually selected
  // an upstream SPDX. We surface a loud warning in this state so NOASSERTION
  // exports never happen by accident.
  const upstreamMissing =
    sourceFiles.length > 0 &&
    spdxChoice === 'auto' &&
    detectedUpstream === null;

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

    const baseName = (sourceFiles[0]?.name || 'source').replace(/\.[^.]+$/, '');
    setCeremonyName(`cmpsbl-ascended-${baseName}`);
    setCeremonyOpen(true);
    try {
      const lang = sourceLanguage.toLowerCase().replace(/\s+/g, '');

      // Determine original file name. Sanitize so non-alphanumerics in the
      // base (e.g. `cmpsbl.cli-5.py`) don't produce malformed ascended names
      // like `cmpsbl.cmpsbl.cli-5.py`. The ascended file uses an underscore
      // join so it stays a valid identifier in every supported language.
      const primaryFile = sourceFiles.length > 0 ? sourceFiles[0] : null;
      const rawOriginalName = primaryFile?.name || `source.${lang === 'typescript' ? 'ts' : lang === 'python' ? 'py' : 'ts'}`;
      const ext = rawOriginalName.match(/\.[^.]+$/)?.[0] || (lang === 'python' ? '.py' : '.ts');
      const rawBase = rawOriginalName.slice(0, rawOriginalName.length - ext.length);
      const safeBase = rawBase.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'source';
      // What we actually write the user's untouched source as inside the ZIP.
      const originalFileName = `${safeBase}${ext}`;
      // What we write the L2 wrapped file as. Always parseable, always unique.
      const ascendedFileName = `cmpsbl_${safeBase}${ext}`;

      // ZIP name per spec
      const zipName = `cmpsbl-ascended-${safeBase.toLowerCase()}`;
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

      // ── Resolve selected layers ──
      const activeLayers = availableLayers.filter(l => selectedLayers.has(l.id));

      // ── Generate the ascended file (L2 wrapped + optional layers) ──
      const ascendedCode = generateUnifiedCapabilityFile(
        capInputs,
        zipName,
        lang === 'typescript' ? 'typescript' : lang,
        sourceFiles.length > 0 ? sourceFiles : undefined,
        activeLayers.length > 0 ? activeLayers : undefined,
      );

      // ── Pre-ZIP acceptance gate: dynamically generated test harness ──
      // Runs syntax/AST + Layer-2 linkage + Layer-1 fingerprint integrity +
      // CMPSBL Layer auto-wire + execution smoke. Critical failures abort.
      const harness = runPreExportHarness({
        ascendedCode,
        language: lang,
        originalFiles: sourceFiles,
        selectedLayers: activeLayers,
      });
      if (!harness.passed) {
        console.error('[Ascension V2] Pre-export harness blocked:', harness.summary);
        const firstCritical = harness.checks.find(c => c.severity === 'critical' && !c.passed);
        toast({
          title: 'Export blocked — pre-export harness failed',
          description: firstCritical?.message || formatHarnessVerdict(harness),
          variant: 'destructive',
        });
        setCeremonyOpen(false);
        setExporting(false);
        return;
      }
      if (harness.softWarnings > 0) {
        console.warn('[Ascension V2] Harness soft warnings:', harness.summary);
      }

      // ── Generate all HTML docs ──
      const licenseHTML = generateV2LicenseHTML({ packName: zipName, fingerprint });

      // Compute the upstream license that will actually ship — single source
      // of truth for the README, NOTICE.txt, LICENSE-UPSTREAM.txt, and manifest
      // entries below. Honors the SPDX dropdown override; otherwise falls
      // through sibling-LICENSE → inline-header detection (same precedence
      // as the live preview above the dropdown).
      const overrideSpdx = spdxChoice === 'auto' ? null : (spdxChoice === 'none' ? null : spdxChoice);
      const shippingUpstream: DetectedLicense | null =
        sourceFiles.length === 0 || spdxChoice === 'none'
          ? null
          : overrideSpdx
            ? buildLicenseFromSpdx(overrideSpdx)
            : detectLicenseFromSiblingFile(sourceFiles)
              ?? detectUpstreamLicenseForExport(sourceFiles[0].content);

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
        upstreamLicense: shippingUpstream
          ? { spdx: shippingUpstream.spdx, label: shippingUpstream.label }
          : null,
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

      // 7. manifest.json — now carries dual-layer SPDX so downstream tooling
      //    (SBOMs, license scanners) can see both layers at a glance.
      const manifest = serializeCmpsblManifest({
        name: zipName,
        cjpi: avgScore,
        // IP protection: expose only the deduped *primitive count* surface,
        // not the raw chain composition per capability. Chain order is part
        // of the orchestration moat and stays sealed in the wrapper.
        primitives: [...new Set(capabilities.flatMap(c => [...c.chain]))],
        targets: [lang],
        version: '2.0.0',
        category: 'proprietary-evolution-v2',
        fingerprint,
        source: 'ascension-v2-pipeline',
        license: {
          layer2: { spdx: 'CAAL-1.0', file: 'LICENSE.html' },
          layer1: shippingUpstream
            ? { spdx: shippingUpstream.spdx, label: shippingUpstream.label, file: 'LICENSE-UPSTREAM.txt' }
            : { spdx: 'NOASSERTION', label: 'No upstream license declared', file: null },
        },
      });
      folder.file('manifest.json', manifest);

      // 8. HARNESS-REPORT.txt — pre-export verification proof bundled with ZIP
      folder.file('HARNESS-REPORT.txt', harness.summary);

      // 9. LICENSE-UPSTREAM.txt + NOTICE.txt — Apache/MIT/BSD/MPL/ISC
      //    attribution travels with the artifact. NOTICE satisfies Apache §4(d)
      //    and gives a clean human-readable summary at the archive root.
      if (shippingUpstream) {
        folder.file('LICENSE-UPSTREAM.txt', buildUpstreamLicenseFile(shippingUpstream, originalFileName));
        folder.file('NOTICE.txt', buildNoticeFile(shippingUpstream, originalFileName));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${zipName}.zip`);

      const verdictNote = harness.softWarnings > 0
        ? ` · ${harness.softWarnings} soft warning${harness.softWarnings === 1 ? '' : 's'}`
        : '';
      toast({
        title: 'Export complete',
        description: `${zipName}.zip — ${capabilities.length} capabilities${verdictNote}, harness report bundled.`,
      });

      // Surface the activation guide now that we know the real ascended name.
      setExportedAscendedName(ascendedFileName);

      // Keep ceremony visible briefly after download starts
      setTimeout(() => setCeremonyOpen(false), 3500);
    } catch (err) {
      setCeremonyOpen(false);
      // Distinguish Coming Soon language gating from real failures so the
      // user sees a clean roadmap message instead of a stack trace.
      const isComingSoon = err instanceof Error && err.name === 'LanguageNotShippingError';
      toast({
        title: isComingSoon ? 'Language coming soon' : 'Export failed',
        description: err instanceof Error ? err.message : String(err),
        variant: isComingSoon ? 'default' : 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12 sm:py-16">
        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chain = getChainState();
  const primaryFileName = sourceFiles[0]?.name || 'source';
  const displayBaseName = primaryFileName.replace(/\.[^.]+$/, '');

  return (
    <div className="space-y-4 sm:space-y-6">
      <DownloadCeremonyOverlay
        open={ceremonyOpen}
        itemName={ceremonyName}
        kindLabel="Ascended Code Package"
        note="Your Layer 2 wrapped package with full docs is being assembled."
      />
      <div className="text-center space-y-1.5 sm:space-y-2">
        <Trophy className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary" />
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Your Ascended Code</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {capabilities.length > 0
            ? `${dedup.rawCount} discoveries → ${capabilities.length} unique capabilities wrapped into a single file`
            : 'No strong matches found — try richer source code'}
        </p>
      </div>

      {/* Summary stats — responsive grid */}
      {capabilities.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-muted/30 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-2xl font-bold text-foreground">{capabilities.length}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Unique</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-2xl font-bold text-foreground">{avgScore}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Avg CJPI</p>
          </div>
          <div className="bg-muted/30 rounded-xl p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-2xl font-bold text-foreground">{topScore}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Top Score</p>
          </div>
        </div>
      )}

      {/* Package contents preview — mobile-friendly file list */}
      {capabilities.length > 0 && (
        <div className="bg-muted/20 border border-border rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground">Export Package Contents</span>
          </div>
          <div className="space-y-1 sm:space-y-1.5">
            {[
              { icon: FileText, name: 'LICENSE.html', desc: 'Commercial license' },
              { icon: FileText, name: 'README.html', desc: 'Overview & quick start' },
              { icon: FileText, name: 'USER-GUIDE.html', desc: 'Full activation guide' },
              { icon: FileCode2, name: sourceFiles[0]?.name || 'source.*', desc: 'Original — untouched' },
              { icon: FileCode2, name: `cmpsbl.${displayBaseName}.*`, desc: `${capabilities.length} capabilities` },
              { icon: FileText, name: 'ADVERTISEMENT.html', desc: 'Mana layers preview' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 sm:gap-2 py-0.5 sm:py-1 min-w-0">
                <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-mono text-foreground truncate min-w-0 flex-1">{item.name}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground flex-shrink-0 hidden xs:inline">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Capabilities list */}
      {capabilities.length > 0 && (
        <div className="bg-muted/20 border border-border rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground">Activated Capabilities</span>
          </div>
          <div className="space-y-1 sm:space-y-1.5 max-h-[180px] sm:max-h-[200px] overflow-y-auto">
            {capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2 py-0.5 sm:py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-[10px] sm:text-xs text-foreground truncate flex-1 min-w-0">
                  {formatEnhancedCapabilityName(cap.name, cap.chain.filter((p) => p !== 'CANDIDATE'))}
                </span>
                {cap.mergeVerdict && (
                  <span
                    className={cn(
                      'text-[8px] sm:text-[9px] font-mono uppercase px-1.5 py-0.5 rounded flex-shrink-0',
                      cap.mergeVerdict === 'beneficial' && 'bg-primary/15 text-primary',
                      cap.mergeVerdict === 'neutral' && 'bg-muted text-muted-foreground',
                      cap.mergeVerdict === 'risky' && 'bg-destructive/15 text-destructive',
                    )}
                    title={`Merge verdict: ${cap.mergeVerdict}${cap.mergeNetImprovement !== undefined ? ` · Δ ${cap.mergeNetImprovement}` : ''}`}
                  >
                    {cap.mergeVerdict === 'beneficial' ? '↑' : cap.mergeVerdict === 'risky' ? '↓' : '='}
                  </span>
                )}
                {cap.band && (
                  <span
                    className={cn(
                      'text-[8px] sm:text-[9px] font-mono uppercase px-1.5 py-0.5 rounded flex-shrink-0',
                      cap.band === 'high' && 'bg-primary/15 text-primary',
                      cap.band === 'medium' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                      cap.band === 'low' && 'bg-muted text-muted-foreground',
                      cap.band === 'hypothesis' && 'bg-muted/50 text-muted-foreground italic',
                    )}
                    title={`Confidence: ${cap.band}${cap.bandChannelCount !== undefined ? ` · ${cap.bandChannelCount}/3 channels` : ''}`}
                  >
                    {cap.band}
                  </span>
                )}
                <span className={cn('text-[10px] sm:text-xs font-mono font-bold flex-shrink-0', scoreColor(cap.cjpiScore))}>
                  {cap.cjpiScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer selection indicator (selected on Enhance step) */}
      {selectedLayers.size > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-[10px] sm:text-xs text-foreground">
            ✓ {selectedLayers.size} CMPSBL Layer{selectedLayers.size > 1 ? 's' : ''} will auto-wire into export
          </span>
        </div>
      )}

      {/* Smart Recommendations — gap+adjacency picks based on what this run covered */}
      <V2SmartRecommendations
        coveredPrimitives={capabilities.flatMap((c) => c.chain.filter((p) => p !== 'CANDIDATE'))}
        selectedLayerIds={Array.from(selectedLayers)}
        limit={4}
      />

      <div className="bg-muted/20 rounded-xl p-2.5 sm:p-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs font-medium text-foreground">
            Audit Chain: {chain.length} entries · {chain.verified ? 'Verified ✓' : 'Broken ✗'}
          </p>
          {integrityHash && (
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono truncate">
              SHA-256: {integrityHash.slice(0, 24)}…
            </p>
          )}
        </div>
      </div>

      {/* Source-language notice — when native layer parity isn't done yet, the
          ZIP still ships: original source untouched + sealed TypeScript runtime
          sidecar that runs the layers. The user's language always comes home. */}
      {(() => {
        const lang = sourceLanguage.toLowerCase().replace(/\s+/g, '');
        const status = getLanguageParityStatus(lang);
        const entry = getLanguageParityEntry(lang);
        if (status === 'SHIPPING') return null;
        const label = entry?.label ?? sourceLanguage;
        return (
          <div className="bg-muted/40 border border-border rounded-xl p-3 sm:p-4 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[11px] sm:text-xs font-semibold text-foreground">
                {label} export — pass-through mode
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                Your {label} source ships untouched in the ZIP alongside a sealed TypeScript runtime sidecar that runs the CMPSBL Layers. Native {label} layer parity is on the roadmap.
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground/80 leading-relaxed">
                Full native parity today: {getShippingLanguages().map(l => l.label).join(', ')}.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Actions — source language always exports. No gating. */}
      <div className="space-y-3">
        {/* Loud warning when no upstream license can be detected and the user
            hasn't manually chosen one. Without this, a NOASSERTION export ships
            silently — which is exactly what just happened on the cli-7.py upload. */}
        {upstreamMissing && (
          <div
            className="rounded-xl border border-neon-amber/50 bg-neon-amber/10 p-3 sm:p-4 flex items-start gap-2.5"
            role="alert"
          >
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-neon-amber flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[11px] sm:text-xs font-semibold text-foreground">
                No upstream license detected
              </p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                We checked your source header and any sibling <span className="font-mono">LICENSE</span> file —
                neither declared an SPDX. If this code is open-source (e.g. Apache-2.0, MIT, BSD),
                pick the correct license below so attribution travels with your export. Otherwise the
                manifest will ship as <span className="font-mono">NOASSERTION</span>.
              </p>
            </div>
          </div>
        )}

        <V2UpstreamLicenseSelect
          value={spdxChoice}
          onChange={setSpdxChoice}
          detected={detectedUpstream}
          hasSource={sourceFiles.length > 0}
        />

        {capabilities.length > 0 && (
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full h-11 sm:h-12 rounded-xl text-xs sm:text-base"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2 flex-shrink-0" />
            )}
            <span className="truncate">
              {exporting
                ? 'Generating Package…'
                : `Download cmpsbl-ascended-${displayBaseName}.zip`}
            </span>
          </Button>
        )}

        {exportedAscendedName && (
          <V2ActivationGuide
            ascendedFileName={exportedAscendedName}
            language={sourceLanguage}
            enhanced={enhanced || selectedLayers.size > 0}
            attachedLayerIds={Array.from(selectedLayers)}
          />
        )}

        <Button variant="ghost" onClick={onReset} className="w-full text-xs sm:text-sm">
          <RotateCcw className="w-3 h-3 mr-1" />
          Start Over with New Code
        </Button>
      </div>
    </div>
  );
}
