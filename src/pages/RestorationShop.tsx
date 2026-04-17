/**
 * RestorationShop → Ascension Lab (/ascension)
 * Full journey: Upload → Diagnostic → Select Primitives → Queue → DECODE Debrief → Export
 */

import { useState, useCallback, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_UPSTREAM_LICENSES } from "@/lib/factory/license-attribution";
import {
  Upload,
  ArrowRight,
  Sparkles,
  Loader2,
  Search,
  Settings2,
  Cpu,
  MessageSquare,
  FileUp,
  Download,
  Award,
  Shield,
  GitBranch,
  Check,
  X,
  FolderTree,
} from "lucide-react";
import {
  parseGitHubUrl,
  fetchGitHubTree,
  fetchGitHubFileContent,
  classifyRepoTree,
  type ClassifiedFile,
  type FileCategory,
} from "@/lib/repo-scanner/classify";
import { cn } from "@/lib/utils";
import { runScanTeam, type ScanResult, type PrimitiveRecommendation } from "@/lib/factory/scan-team";
import { generateRestorationReport, type RestorationReport } from "@/lib/factory/restoration-docs";
import { addToQueue, getQueuePosition, estimateWaitTime, type QueueEntry } from "@/lib/factory/restoration-queue";
import { generateRefurbishedCode as generateAscendedCode, getRefurbishedExtension as getAscendedExtension } from "@/lib/factory/generate-refurbished-code";
import { saveRestorationSession } from "@/lib/factory/restoration-session";
import { DecodeFactoryVoice } from "@/components/factory/DecodeFactoryVoice";
import { PrimitiveSelector } from "@/components/factory/PrimitiveSelector";
import { RestorationQueue } from "@/components/factory/RestorationQueue";
import { RestorationReportView } from "@/components/factory/RestorationReportView";
import { MembershipTiers } from "@/components/factory/MembershipTiers";
import { DecodeDebrief } from "@/components/factory/DecodeDebrief";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import { useDecodeStore } from "@/stores/decodeStore";
import { getVerticalSubdomain } from "@/config/domains";
import { wrapPremiumDocPage } from "@/lib/export/premium-html-wrapper";

const EnhancedFooter = lazy(() => import("@/components/EnhancedFooter").then(m => ({ default: m.EnhancedFooter })));

/** Escape HTML entities for safe injection into styled doc templates */
function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Wrap doc content using the premium HTML wrapper for uniform exports ecosystem-wide */
function wrapDocHtml(title: string, bodyContent: string): string {
  return wrapPremiumDocPage(title, bodyContent);
}

type Phase = 'upload' | 'diagnostic' | 'select' | 'queue' | 'debrief';
type ProcessingPrimitive = { name: string; status: 'pending' | 'active' | 'done' };

/** Trigger subtle haptic feedback for key interactions */
function haptic(pattern: 'light' | 'medium' | 'success' = 'light') {
  try {
    if ('vibrate' in navigator) {
      const patterns = { light: [8], medium: [15], success: [10, 30, 10] };
      navigator.vibrate(patterns[pattern]);
    }
  } catch { /* non-critical */ }
}

const PHASE_META: { key: Phase; label: string; icon: React.ElementType }[] = [
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'diagnostic', label: 'Diagnostic', icon: Search },
  { key: 'select', label: 'Select', icon: Settings2 },
  { key: 'queue', label: 'Processing', icon: Cpu },
  { key: 'debrief', label: 'Debrief', icon: MessageSquare },
];

export default function RestorationShop() {
  const isUltimateSurface = getVerticalSubdomain() === 'ultimate';
  const [phase, setPhase] = useState<Phase>('upload');
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [report, setReport] = useState<RestorationReport | null>(null);
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [selectedPrims, setSelectedPrims] = useState<PrimitiveRecommendation[]>([]);
  const [ascendedCode, setAscendedCode] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<string>('TypeScript');
  const [isScanning, setIsScanning] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [processingPrimitives, setProcessingPrimitives] = useState<ProcessingPrimitive[]>([]);
  /** Manual upstream-license SPDX override — empty string = auto-detect from header. */
  const [upstreamLicenseSpdx, setUpstreamLicenseSpdx] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const identityRole = useDecodeStore(s => s.identityRole);

  // ═══ REPO SCAN STATE ═══
  const [uploadMode, setUploadMode] = useState<'file' | 'paste' | 'repo'>('file');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoFiles, setRepoFiles] = useState<ClassifiedFile[]>([]);
  const [repoConfirmed, setRepoConfirmed] = useState(false);
  const [isFetchingTree, setIsFetchingTree] = useState(false);
  const [isDownloadingFiles, setIsDownloadingFiles] = useState(false);
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');

  /** Fetch GitHub repo tree and classify files */
  const handleFetchRepo = useCallback(async () => {
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      toast.error('Invalid GitHub URL', {
        description: 'Example: https://github.com/owner/repo',
      });
      return;
    }
    setIsFetchingTree(true);
    setRepoFiles([]);
    setRepoConfirmed(false);
    try {
      const tree = await fetchGitHubTree(parsed.owner, parsed.repo);
      if (tree.length === 0) {
        toast.error('Empty repository', {
          description: 'No files found. Make sure the repository is public and not empty.',
        });
        return;
      }
      let classified = classifyRepoTree(tree);
      let coreCount = classified.filter(f => f.category === 'core').length;

      // Auto-promote: if no core files found, promote supporting source files to core
      if (coreCount === 0) {
        const supportingSourceCount = classified.filter(f => f.category === 'supporting').length;
        if (supportingSourceCount > 0) {
          classified = classified.map(f =>
            f.category === 'supporting'
              ? { ...f, category: 'core' as const, reason: 'Auto-promoted (no entry points detected)' }
              : f
          );
          coreCount = classified.filter(f => f.category === 'core').length;
          toast.info('Auto-classified source files as Core', {
            description: `No standard entry points detected. ${coreCount} source files promoted — review and adjust below.`,
            duration: 6000,
          });
        }
      }

      setRepoFiles(classified);
      setRepoOwner(parsed.owner);
      setRepoName(parsed.repo);
      toast.success(`Mapped ${classified.length} files`, {
        description: `${coreCount} core · ${classified.filter(f => f.category === 'supporting').length} supporting · ${classified.filter(f => f.category === 'skipped').length} skipped`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch repository';
      const isRateLimit = msg.includes('rate limit');
      const isNotFound = msg.includes('not found');
      toast.error(isRateLimit ? 'Rate Limited' : isNotFound ? 'Repository Not Found' : 'Load Failed', {
        description: msg,
        duration: isRateLimit ? 10000 : 5000,
      });
    } finally {
      setIsFetchingTree(false);
    }
  }, [repoUrl]);

  /** Toggle a file's category between core/supporting/skipped */
  const toggleFileCategory = useCallback((path: string) => {
    setRepoFiles(prev => prev.map(f => {
      if (f.path !== path) return f;
      const next: FileCategory = f.category === 'core' ? 'skipped' : f.category === 'skipped' ? 'core' : 'core';
      return { ...f, category: next, reason: next === 'core' ? 'User selected' : 'User excluded' };
    }));
  }, []);

  /** Download confirmed core files and concatenate for scanning */
  const handleConfirmAndScan = useCallback(async () => {
    const coreFiles = repoFiles.filter(f => f.category === 'core');
    if (coreFiles.length === 0) {
      toast.error('Select at least one core file to scan');
      return;
    }
    if (coreFiles.length > 30) {
      toast.error('Too many core files', {
        description: `${coreFiles.length} selected — narrow to 30 or fewer for best results.`,
      });
      return;
    }
    setIsDownloadingFiles(true);
    setRepoConfirmed(true);
    const contents: string[] = [];
    const fileNames: string[] = [];
    const failedFiles: string[] = [];
    try {
      for (const file of coreFiles) {
        if (!file.sha) continue;
        try {
          const content = await fetchGitHubFileContent(repoOwner, repoName, file.sha);
          contents.push(`// ═══ FILE: ${file.path} ═══\n${content}`);
          fileNames.push(file.path);
        } catch (fileErr) {
          failedFiles.push(file.path);
          const msg = fileErr instanceof Error ? fileErr.message : '';
          // Abort early on rate limit — no point continuing
          if (msg.includes('rate limit')) {
            toast.error('Rate Limited', {
              description: `Downloaded ${contents.length}/${coreFiles.length} files before hitting GitHub rate limit. Try again later.`,
              duration: 10000,
            });
            break;
          }
        }
      }
      if (contents.length === 0) {
        toast.error('Download Failed', {
          description: 'Could not download any files. GitHub may be rate-limiting or the repository may be private.',
        });
        return;
      }
      const merged = contents.join('\n\n');
      setCode(merged);
      setFileName(`${repoOwner}/${repoName} (${contents.length} files)`);
      if (failedFiles.length > 0) {
        toast.success(`Downloaded ${contents.length} core files`, {
          description: `${failedFiles.length} files skipped (download errors). Ready to scan.`,
        });
      } else {
        toast.success(`Downloaded ${contents.length} core files — ready to scan`);
      }
    } catch (err) {
      toast.error('Download Failed', {
        description: err instanceof Error ? err.message : 'Failed to download files',
      });
    } finally {
      setIsDownloadingFiles(false);
    }
  }, [repoFiles, repoOwner, repoName]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1_048_576) {
      toast.error('File too large. Maximum size is 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === 'string') {
        setCode(text);
        setFileName(file.name);
      }
    };
    reader.onerror = () => toast.error('Failed to read file.');
    reader.readAsText(file);
  }, []);

  const handleScan = useCallback(async () => {
    if (!code.trim() || isScanning) return;
    haptic('medium');
    setIsScanning(true);
    try {
      const result = await runScanTeam(code, fileName ?? undefined);
      setScanResult(result);
      setDetectedLang(result.metrics.language || 'TypeScript');
      haptic('success');
      setPhase('diagnostic');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Scan failed unexpectedly';
      toast.error('Diagnostic Scan Failed', {
        description: msg.slice(0, 300),
        duration: 8000,
      });
    } finally {
      setIsScanning(false);
    }
  }, [code, isScanning, fileName]);

  const handleSelectPrimitives = useCallback(async (selected: PrimitiveRecommendation[]) => {
    if (!scanResult || isRestoring) return;
    setIsRestoring(true);
    haptic('medium');
    setSelectedPrims(selected);

    const entry = addToQueue('demo-user', 'builder', 'demo-hash', selected.map(s => s.name));
    setQueueEntry(entry);
    setPhase('queue');

    // Animate each primitive activating
    const primStates: ProcessingPrimitive[] = selected.map(s => ({ name: s.name, status: 'pending' as const }));
    setProcessingPrimitives([...primStates]);

    for (let i = 0; i < primStates.length; i++) {
      primStates[i].status = 'active';
      setProcessingPrimitives([...primStates]);
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
      primStates[i].status = 'done';
      setProcessingPrimitives([...primStates]);
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const restorationReport = generateRestorationReport(scanResult, selected);
    setReport(restorationReport);

    const fingerprint = restorationReport.cjpiCertificate.fingerprint;
    const hardened = generateAscendedCode(code, selected, fingerprint, undefined, fileName ?? undefined);
    setAscendedCode(hardened);

    await saveRestorationSession({
      fingerprint,
      originalCode: code,
      originalLanguage: fileName?.split('.').pop() ?? undefined,
      scanResult,
      selectedPrimitives: selected.map(s => s.name),
      report: restorationReport,
    });

    entry.status = 'complete';
    setQueueEntry({ ...entry });
    haptic('success');
    setPhase('debrief');
    setIsRestoring(false);
  }, [scanResult, isRestoring, code, fileName]);

  const handleExport = useCallback(async () => {
    const isSubscribed = identityRole === 'governor' || identityRole === 'architect' || identityRole === 'creator' || identityRole === 'studio';

    if (!isSubscribed) {
      toast.error('To export your ascended code, please subscribe to a paid plan.', {
        action: {
          label: 'View Plans',
          onClick: () => window.location.href = '/plans',
        },
      });
      return;
    }

    if (!report) return;
    toast.success('Preparing your ascended code package for download...');

    try {
      const { buildAscensionZip } = await import('@/lib/export/ascension-zip-builder');
      const result = await buildAscensionZip({
        code,
        fileName,
        report,
        selectedPrims,
        detectedLang,
        ascendedCode,
        upstreamLicenseSpdx: upstreamLicenseSpdx || null,
      });

      const { saveAs } = await import('file-saver');
      saveAs(result.blob, result.zipName);
      toast.success(`Export complete — ${result.fileCount} files in your ascended code package.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error('Export failed.', { description: msg.slice(0, 200), duration: 10000 });
    }
  }, [report, code, ascendedCode, identityRole, selectedPrims, fileName, detectedLang, upstreamLicenseSpdx]);

  const resetFlow = useCallback(() => {
    setPhase('upload');
    setCode('');
    setFileName(null);
    setScanResult(null);
    setReport(null);
    setQueueEntry(null);
    setSelectedPrims([]);
    setAscendedCode('');
    setRepoUrl('');
    setRepoFiles([]);
    setRepoConfirmed(false);
    setUploadMode('file');
  }, []);

  const currentPhaseIdx = PHASE_META.findIndex(p => p.key === phase);

  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title="The Ascension Lab | CMPSBL® — Code Ascension with 40 Primitives"
        description="Upload your code. Our three-primitive scan team identifies vulnerabilities. Select up to 20 primitives to harden it. Sealed runtime included."
        canonical="https://cmpsbl.com/ascension"
      />

      {/* Lab ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div
          className="absolute -top-48 left-1/3 w-[700px] h-[700px] rounded-full animate-hero-orb-1"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 50%)" }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full animate-hero-orb-3"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-magenta) / 0.05) 0%, transparent 50%)" }}
        />
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
          <div className="absolute inset-x-0 h-px lab-scan-line" style={{ animationDuration: "10s" }} />
        </div>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.02) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
      </div>

      <PublicNav />

      <div className="container mx-auto px-3 sm:px-4 pt-20 relative z-10">
        <PublicBreadcrumb />
      </div>

      {/* Hero */}
      <section className="relative px-3 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-16 z-10">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-green lab-status-blink" />
            <span className="text-xs font-medium text-primary tracking-wide">The Ascension Lab</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-4 leading-[1.05]">
            Bring us your code.{" "}
            <span className="bg-clip-text text-transparent" style={{
              backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--neon-magenta)))",
            }}>
              We'll restore it first.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            We analyze your code, find its hidden potential, and ascend it — only replacing what we absolutely have to. AI is our tool, not your dependency.
          </p>
        </div>
      </section>

      {/* Main flow */}
      <section className="relative z-10 px-3 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Phase indicators — enterprise stepper with animated connectors */}
          <div className="flex items-center justify-center gap-1 mb-10">
            {PHASE_META.map((p, idx) => {
              const Icon = p.icon;
              const isActive = phase === p.key;
              const isPast = currentPhaseIdx > idx;
              return (
                <div key={p.key} className="flex items-center">
                  <button
                    onClick={() => { if (isPast) haptic('light'); }}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border relative",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_hsl(var(--primary)/0.3)] scale-105"
                        : isPast
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-card/40 text-muted-foreground/40 border-border/20",
                    )}
                  >
                    <Icon className={cn("w-4 h-4 transition-transform", isActive && "animate-pulse")} />
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-ping opacity-30 pointer-events-none" />
                    )}
                  </button>
                  <span className={cn(
                    "text-[9px] font-mono uppercase tracking-wider ml-1 hidden sm:inline transition-colors",
                    isActive ? "text-primary font-bold" : isPast ? "text-primary/60" : "text-muted-foreground/30"
                  )}>
                    {p.label}
                  </span>
                  {idx < PHASE_META.length - 1 && (
                    <div className="w-6 sm:w-10 h-[2px] mx-1.5 relative overflow-hidden rounded-full bg-border/20">
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                          isPast
                            ? "w-full bg-gradient-to-r from-primary/60 to-primary/40"
                            : "w-0 bg-primary/40"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* UPLOAD PHASE */}
          {phase === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-6 phase-card-enter">
              <div className="rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Upload Your Code</h2>
                    <p className="text-[10px] text-muted-foreground">Any language, any stack — we'll handle the rest</p>
                  </div>
                </div>

                {/* Mode tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/20 mb-5">
                  {([
                    { key: 'file' as const, label: 'Upload File', icon: FileUp },
                    { key: 'paste' as const, label: 'Paste Code', icon: Upload },
                    { key: 'repo' as const, label: 'GitHub Repo', icon: GitBranch, beta: true },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setUploadMode(tab.key)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        uploadMode === tab.key
                          ? "bg-background text-foreground shadow-sm border border-border/30"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.key === 'repo' ? 'Repo' : tab.key === 'paste' ? 'Paste' : 'File'}</span>
                      {tab.beta && (
                        <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 ml-0.5">Beta</Badge>
                      )}
                    </button>
                  ))}
                </div>

                {/* FILE UPLOAD MODE */}
                {uploadMode === 'file' && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".js,.jsx,.ts,.tsx,.py,.rs,.go,.java,.c,.cpp,.cs,.rb,.swift,.kt,.php,.scala,.lua,.r,.dart,.ex,.vhd,.v,.sv,.scala,.hdl,.fir,text/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => { haptic('light'); fileInputRef.current?.click(); }}
                      className={cn(
                        "w-full rounded-2xl border-2 border-dashed p-8 mb-5 text-center transition-all duration-300 group",
                        "hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_30px_hsl(var(--primary)/0.08)]",
                        fileName ? "border-primary/30 bg-primary/5" : "border-border/30 bg-background/20 drop-zone-idle"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-all duration-300",
                        fileName
                          ? "bg-primary/15 border border-primary/20"
                          : "bg-muted/20 border border-border/20 group-hover:bg-primary/10 group-hover:border-primary/20"
                      )}>
                        <FileUp className={cn(
                          "w-6 h-6 transition-all duration-300",
                          fileName ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary/60"
                        )} />
                      </div>
                      {fileName ? (
                        <div>
                          <p className="text-sm font-bold text-foreground">{fileName}</p>
                          <p className="text-[10px] text-muted-foreground mt-1.5">Click to choose a different file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold text-foreground">Click to upload a file</p>
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            Any of 90+ supported languages · Max 1MB
                          </p>
                        </div>
                      )}
                    </button>
                  </>
                )}

                {/* PASTE MODE */}
                {uploadMode === 'paste' && (
                  <Textarea
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setFileName(null); }}
                    placeholder="Paste your code here — any language, any stack..."
                    className="min-h-[160px] bg-background/50 font-mono text-xs mb-5 rounded-xl border-border/30 focus:border-primary/40 transition-colors"
                  />
                )}

                {/* REPO SCAN MODE (BETA) */}
                {uploadMode === 'repo' && (
                  <div className="space-y-4 mb-5">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1">
                      <FolderTree className="w-3.5 h-3.5" />
                      <span>Public repositories only · We fetch the file tree, classify files, then you confirm before we download anything</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/owner/repo"
                        className="flex-1 h-10 px-3 text-sm bg-background/50 border border-border/30 rounded-xl focus:border-primary/40 focus:outline-none transition-colors font-mono"
                        onKeyDown={(e) => e.key === 'Enter' && handleFetchRepo()}
                      />
                      <Button
                        onClick={handleFetchRepo}
                        disabled={!repoUrl.trim() || isFetchingTree}
                        variant="outline"
                        className="h-10 rounded-xl gap-1.5"
                      >
                        {isFetchingTree ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Map
                      </Button>
                    </div>

                    {/* File classification results */}
                    {repoFiles.length > 0 && !repoConfirmed && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground">
                            {repoFiles.filter(f => f.category === 'core').length} core · {repoFiles.filter(f => f.category === 'supporting').length} supporting · {repoFiles.filter(f => f.category === 'skipped').length} skipped
                          </p>
                          <Badge variant="secondary" className="text-[8px]">Click to toggle</Badge>
                        </div>

                        {/* Core files */}
                        {repoFiles.filter(f => f.category === 'core').length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Core — Will be scanned</p>
                            <div className="max-h-40 overflow-y-auto rounded-xl border border-primary/20 bg-primary/5 p-2 space-y-0.5">
                              {repoFiles.filter(f => f.category === 'core').map(f => (
                                <button
                                  key={f.path}
                                  onClick={() => toggleFileCategory(f.path)}
                                  className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-left hover:bg-primary/10 transition-colors group"
                                >
                                  <Check className="w-3 h-3 text-primary shrink-0" />
                                  <span className="text-[11px] font-mono text-foreground truncate flex-1">{f.path}</span>
                                  <span className="text-[9px] text-muted-foreground shrink-0">{f.reason}</span>
                                  <X className="w-3 h-3 text-muted-foreground/30 group-hover:text-destructive shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Supporting files */}
                        {repoFiles.filter(f => f.category === 'supporting').length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Supporting — Click to include</p>
                            <div className="max-h-28 overflow-y-auto rounded-xl border border-border/20 bg-muted/10 p-2 space-y-0.5">
                              {repoFiles.filter(f => f.category === 'supporting').map(f => (
                                <button
                                  key={f.path}
                                  onClick={() => toggleFileCategory(f.path)}
                                  className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-left hover:bg-primary/10 transition-colors"
                                >
                                  <div className="w-3 h-3 rounded-sm border border-border/40 shrink-0" />
                                  <span className="text-[11px] font-mono text-muted-foreground truncate flex-1">{f.path}</span>
                                  <span className="text-[9px] text-muted-foreground/50 shrink-0">{f.reason}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skipped summary */}
                        {repoFiles.filter(f => f.category === 'skipped').length > 0 && (
                          <p className="text-[10px] text-muted-foreground/50">
                            {repoFiles.filter(f => f.category === 'skipped').length} files skipped (tests, configs, assets, lock files)
                          </p>
                        )}

                        <Button
                          onClick={handleConfirmAndScan}
                          disabled={repoFiles.filter(f => f.category === 'core').length === 0 || isDownloadingFiles}
                          className="w-full rounded-xl font-bold gap-2 h-11 text-sm"
                        >
                          {isDownloadingFiles ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Downloading core files...</>
                          ) : (
                            <><Download className="w-4 h-4" /> Download & Prepare {repoFiles.filter(f => f.category === 'core').length} Core Files</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* SCAN BUTTON — shown when code is ready from any mode */}
                {(uploadMode !== 'repo' || (repoConfirmed && code.trim())) && (
                  <Button
                    onClick={handleScan}
                    disabled={!code.trim() || isScanning}
                    className="w-full rounded-xl font-bold gap-2.5 h-12 text-sm shadow-[0_0_20px_hsl(var(--primary)/0.15)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.25)] transition-all"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scanning with ENCODE + ORACLE + ENGINEER...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Run Diagnostic Scan
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* DIAGNOSTIC PHASE */}
          {phase === 'diagnostic' && scanResult && (
            <div className="max-w-2xl mx-auto space-y-6 phase-card-enter">
              {/* Score overview cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/30 bg-card/20 p-4 text-center">
                   <div className="text-2xl font-black text-foreground">{scanResult.cjpiEstimate}</div>
                   <div className="text-xs text-muted-foreground">Current CJPI</div>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                   <div className="text-2xl font-black text-primary">{scanResult.projectedCjpi}</div>
                   <div className="text-xs text-muted-foreground">Projected CJPI</div>
                </div>
                <div className="rounded-xl border border-border/30 bg-card/20 p-4 text-center">
                   <div className="text-2xl font-black text-foreground">{scanResult.architecturalRunway}mo</div>
                   <div className="text-xs text-muted-foreground">Arch. Runway</div>
                </div>
                <div className="rounded-xl border border-border/30 bg-card/20 p-4 text-center">
                   <div className="text-2xl font-black text-foreground">{scanResult.findings.length}</div>
                   <div className="text-xs text-muted-foreground">Findings</div>
                </div>
              </div>

              {/* Code Metrics */}
              <div className="rounded-xl border border-border/30 bg-card/20 p-4">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  Code Analysis — {scanResult.metrics.language}
                  {scanResult.metrics.languageConfidence > 0.8 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      {Math.round(scanResult.metrics.languageConfidence * 100)}% match
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
                  {[
                    { label: 'Lines', value: scanResult.metrics.totalLines },
                    { label: 'Functions', value: scanResult.metrics.functionCount },
                    { label: 'Classes', value: scanResult.metrics.classCount },
                    { label: 'Complexity', value: scanResult.metrics.cyclomaticComplexity },
                    { label: 'Depth Score', value: `${scanResult.metrics.depthScore}/100` },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg bg-muted/20 p-2">
                      <div className="text-sm font-bold text-foreground">{m.value}</div>
                      <div className="text-[9px] text-muted-foreground">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {scanResult.metrics.hasAsync && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Async</span>}
                  {scanResult.metrics.hasTypes && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Typed</span>}
                  {scanResult.metrics.hasTests && <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green">Tests</span>}
                  {scanResult.metrics.hasErrorHandling && <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green">Error Handling</span>}
                  {!scanResult.metrics.hasErrorHandling && <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">No Error Handling</span>}
                  {!scanResult.metrics.hasTests && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">No Tests</span>}
                </div>
              </div>

              {/* ═══ Enterprise Findings Table ═══ */}
              <div className="rounded-xl border border-border/30 bg-card/20 p-4">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Scan Findings — {scanResult.findings.length} Issues Detected
                </h4>
                <div className="space-y-2">
                  {scanResult.findings
                    .sort((a, b) => {
                      const sev = { critical: 0, warning: 1, info: 2 };
                      return (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2);
                    })
                    .map(f => (
                    <div
                      key={f.id}
                      className={cn(
                        "rounded-lg border p-3 transition-colors",
                        f.severity === 'critical'
                          ? "border-destructive/30 bg-destructive/5"
                          : f.severity === 'warning'
                            ? "border-amber-500/20 bg-amber-500/5"
                            : "border-border/20 bg-card/10",
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn(
                          "shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-[9px] font-black uppercase",
                          f.severity === 'critical'
                            ? "bg-destructive/20 text-destructive"
                            : f.severity === 'warning'
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-primary/10 text-primary",
                        )}>
                          {f.severity === 'critical' ? '!' : f.severity === 'warning' ? '⚠' : 'ℹ'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{f.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground font-mono">
                              {f.source}
                            </span>
                            {f.primitiveRecommendation && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                                Fix → {f.primitiveRecommendation}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                            {f.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DECODE Context (collapsible) */}
              <DecodeFactoryVoice
                role="mechanic"
                findings={scanResult.findings.map(f => ({
                  id: f.id,
                  severity: f.severity,
                  title: f.title,
                  description: f.description,
                  primitiveRecommendation: f.primitiveRecommendation,
                }))}
                scanContext={{ originalCode: code, scanResult }}
              />

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {(() => {
                  const findingLinkedCount = scanResult.findings.filter(f => f.primitiveRecommendation).length;
                  return findingLinkedCount > 0 ? (
                    <Button
                      onClick={() => {
                        const findingPrimIds = new Set(
                          scanResult.findings
                            .filter(f => f.primitiveRecommendation)
                            .map(f => f.primitiveRecommendation!.toLowerCase())
                        );
                        const autoSelected = scanResult.recommendedPrimitives.filter(
                          r => findingPrimIds.has(r.primitiveId)
                        );
                        if (autoSelected.length > 0) {
                          handleSelectPrimitives(autoSelected);
                        }
                      }}
                      disabled={isRestoring}
                      className="sm:flex-1 rounded-xl font-bold gap-2 bg-destructive hover:bg-destructive/90 text-white"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Auto-Fix {findingLinkedCount} Issue{findingLinkedCount !== 1 ? 's' : ''} Now
                    </Button>
                  ) : null;
                })()}
                <Button
                  onClick={() => setPhase('select')}
                  variant={scanResult.findings.some(f => f.primitiveRecommendation) ? "outline" : "default"}
                  className="sm:flex-1 rounded-xl font-bold gap-2"
                >
                  Choose Primitives Manually
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* SELECT PRIMITIVES PHASE */}
          {phase === 'select' && scanResult && (
            <div className="space-y-6 phase-card-enter">
              <PrimitiveSelector
                recommendations={scanResult.recommendedPrimitives}
                onConfirm={handleSelectPrimitives}
                isProcessing={isRestoring}
                maxSelections={isUltimateSurface ? scanResult.recommendedPrimitives.length : 20}
                defaultSelectionCount={isUltimateSurface ? scanResult.recommendedPrimitives.length : 8}
              />
            </div>
          )}

          {/* QUEUE PHASE */}
          {phase === 'queue' && (
            <div className="max-w-2xl mx-auto space-y-6 phase-card-enter">
              <RestorationQueue
                entry={queueEntry}
                queuePosition={queueEntry ? getQueuePosition(queueEntry.id) : null}
                estimatedWaitMs={estimateWaitTime('builder')}
              />

              {/* Cinematic primitive activation sequence */}
              {processingPrimitives.length > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-card/30 backdrop-blur-sm p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-foreground mb-1 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Applying Primitives
                  </h4>
                  <p className="text-[10px] text-muted-foreground mb-4">
                    Each primitive is being woven into your code's runtime behavior
                  </p>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-border/20 mb-4 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
                      style={{ width: `${(processingPrimitives.filter(p => p.status === 'done').length / processingPrimitives.length) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-1">
                    {processingPrimitives.map((p, idx) => (
                      <div
                        key={p.name}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300",
                          p.status === 'active' && "bg-primary/5 border border-primary/20 primitive-activate",
                          p.status === 'done' && "primitive-seal-flash",
                        )}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {p.status === 'done' ? (
                          <div className="w-5 h-5 rounded-full bg-[hsl(142_76%_36%/0.15)] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(142_76%_36%)]" />
                          </div>
                        ) : p.status === 'active' ? (
                          <div className="w-5 h-5 relative">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-border/30 bg-muted/10" />
                        )}
                        <span className={cn(
                          "text-xs font-mono flex-1",
                          p.status === 'done' ? "text-foreground" : p.status === 'active' ? "text-primary font-bold" : "text-muted-foreground/40"
                        )}>
                          {p.name}
                        </span>
                        {p.status === 'active' && (
                          <span className="text-[9px] text-primary/60 font-mono animate-pulse">activating...</span>
                        )}
                        {p.status === 'done' && (
                          <span className="text-[9px] text-[hsl(142_76%_36%/0.7)] font-mono font-semibold">✓ sealed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEBRIEF PHASE */}
          {phase === 'debrief' && report && (
            <div className="max-w-3xl mx-auto space-y-6 phase-card-enter">
              {/* ═══ CJPI Hero Badge — Cinematic Score Reveal ═══ */}
              <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card/30 to-primary/5 p-8 sm:p-10 text-center relative overflow-hidden cjpi-glow-pulse">
                {/* Ambient glow layers */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.12) 0%, transparent 50%)",
                }} />
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: "radial-gradient(circle at 30% 80%, hsl(var(--neon-purple) / 0.06) 0%, transparent 40%)",
                }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 mb-5 ascension-stagger-1">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">CJPI Certificate</span>
                  </div>
                  <div className="text-6xl sm:text-7xl font-black text-foreground mb-2 cjpi-score-reveal">
                    {report.cjpiCertificate.score}
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 font-mono mb-3 ascension-stagger-2">out of 100</div>
                  <div className={cn(
                    "inline-block text-xs font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-5 cjpi-tier-reveal",
                    report.cjpiCertificate.tier === 'S-Tier' || report.cjpiCertificate.tier === 'Apex'
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                      : report.cjpiCertificate.tier === 'A-Tier'
                        ? "bg-neon-green/15 text-neon-green border border-neon-green/30"
                        : "bg-muted/30 text-muted-foreground border border-border/30"
                  )}>
                    {report.cjpiCertificate.tier}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-mono ascension-stagger-3">
                    <span>Serial: {report.cjpiCertificate.serialNumber}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{report.primitiveManifest.length} primitives applied</span>
                  </div>
                </div>
              </div>

              {/* ═══ Primitives Applied Breakdown ═══ */}
              <div className="rounded-xl border border-border/30 bg-card/20 p-4">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Primitives Applied — {report.primitiveManifest.length} Total
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {(['Organ', 'Layer', 'Engine', 'Agent'] as const).map(cat => {
                    const count = report.primitiveManifest.filter(p => p.category === cat).length;
                    return (
                      <div key={cat} className="rounded-lg bg-muted/20 p-2.5 text-center">
                        <div className="text-lg font-black text-foreground">{count}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{cat}s</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {report.primitiveManifest.map(p => (
                    <span key={p.name} className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/10">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              <DecodeDebrief
                report={report}
                scanResult={scanResult}
                originalCode={code}
                ascendedCode={ascendedCode}
                selectedPrimitives={selectedPrims}
              />
              <RestorationReportView report={report} />

              {/* ═══ Fingerprint & Verification ═══ */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Your Fingerprint ID</p>
                <p className="text-base sm:text-lg font-mono font-black text-primary break-all">{report.cjpiCertificate.fingerprint}</p>
                <p className="text-[10px] text-muted-foreground mt-3 mb-3">
                  Save this ID — use it with DECODE for support, or verify provenance publicly.
                </p>
                <Button asChild variant="outline" size="sm" className="rounded-full text-xs gap-1.5">
                  <Link to={`/verify/${report.cjpiCertificate.fingerprint}`}>
                    <Shield className="w-3 h-3" />
                    Verify Provenance
                  </Link>
                </Button>
              </div>

              {/* ═══ Actions ═══ */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={resetFlow}
                  variant="outline"
                  className="sm:flex-1 rounded-xl font-semibold"
                >
                  Start New Ascension
                </Button>
                <Button
                  className="sm:flex-1 rounded-xl font-bold gap-2"
                  onClick={handleExport}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Ascended Code
                </Button>
              </div>
              <div className="text-center pt-1">
                <Button asChild variant="link" size="sm" className="text-muted-foreground gap-1">
                  <Link to="/showroom">
                    <Sparkles className="w-3 h-3" />
                    Browse certified discoveries in the Showroom
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="relative z-10 px-3 sm:px-6 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              Ascension Center Membership
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              One membership. Unlimited ascensions. The queue is the experience — the center has a line because the work is worth waiting for.
            </p>
          </div>
          <MembershipTiers />
        </div>
      </section>

      <Suspense fallback={<div className="min-h-[100px]" />}>
        <EnhancedFooter />
      </Suspense>
    </div>
  );
}
