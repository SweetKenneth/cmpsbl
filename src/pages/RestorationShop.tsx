/**
 * RestorationShop → Refurbishment Lab (/ascension)
 * Full journey: Upload → Diagnostic → Select Primitives → Queue → DECODE Debrief → Export
 */

import { useState, useCallback, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { runScanTeam, type ScanResult, type PrimitiveRecommendation } from "@/lib/factory/scan-team";
import { generateRestorationReport, type RestorationReport } from "@/lib/factory/restoration-docs";
import { addToQueue, getQueuePosition, estimateWaitTime, type QueueEntry } from "@/lib/factory/restoration-queue";
import { generateRefurbishedCode, generateLicense, getRefurbishedExtension } from "@/lib/factory/generate-refurbished-code";
import { generateHtmlReport } from "@/lib/factory/html-report-generator";
import { saveRestorationSession } from "@/lib/factory/restoration-session";
import { wrapPremiumDocPage } from "@/lib/export/premium-html-wrapper";
import { generateUniversalUserGuide } from "@/lib/export/universal-user-guide";
import { DecodeFactoryVoice } from "@/components/factory/DecodeFactoryVoice";
import { PrimitiveSelector } from "@/components/factory/PrimitiveSelector";
import { RestorationQueue } from "@/components/factory/RestorationQueue";
import { RestorationReportView } from "@/components/factory/RestorationReportView";
import { MembershipTiers } from "@/components/factory/MembershipTiers";
import { DecodeDebrief } from "@/components/factory/DecodeDebrief";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import { useDecodeStore } from "@/stores/decodeStore";
import { getVerticalSubdomain } from "@/config/domains";

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
  const [refurbishedCode, setRefurbishedCode] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<string>('TypeScript');
  const [isScanning, setIsScanning] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [processingPrimitives, setProcessingPrimitives] = useState<ProcessingPrimitive[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const identityRole = useDecodeStore(s => s.identityRole);

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
    setIsScanning(true);
    try {
      const result = await runScanTeam(code, fileName ?? undefined);
      setScanResult(result);
      setDetectedLang(result.metrics.language || 'TypeScript');
      setPhase('diagnostic');
    } finally {
      setIsScanning(false);
    }
  }, [code, isScanning, fileName]);

  const handleSelectPrimitives = useCallback(async (selected: PrimitiveRecommendation[]) => {
    if (!scanResult || isRestoring) return;
    setIsRestoring(true);
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
    const hardened = generateRefurbishedCode(code, selected, fingerprint, undefined, fileName ?? undefined);
    setRefurbishedCode(hardened);

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
    setPhase('debrief');
    setIsRestoring(false);
  }, [scanResult, isRestoring, code, fileName]);

  const handleExport = useCallback(() => {
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

    import('jszip').then(({ default: JSZip }) => {
      const zip = new JSZip();
      const fingerprint = report.cjpiCertificate.fingerprint;

      // ═══ Regenerate ascended code fresh at export time ═══
      // This ensures the latest generator logic is always used,
      // preventing stale cached state from earlier sessions.
      // The generator now THROWS on L2 validation failure — catch it.
      let freshRefurbished: string;
      try {
        freshRefurbished = selectedPrims.length > 0
          ? generateRefurbishedCode(code, selectedPrims, fingerprint, undefined, fileName ?? undefined)
          : refurbishedCode;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error('Export blocked — Layer 2 validation failed. Your code is safe.', {
          description: msg.slice(0, 200),
          duration: 10000,
        });
        return;
      }

      // ═══ LICENSE (styled HTML) ═══
      zip.file('LICENSE.html', wrapDocHtml('CMPSBL® Software License', generateLicense(report.id, fingerprint)));

      // ═══ Dual-Layer Source ═══
      const refExt = getRefurbishedExtension(detectedLang);
      zip.file('src/original-source.txt', code || '// No source provided');
      zip.file(`src/ascended-source${refExt}`, freshRefurbished || '// Ascended code not generated');

      // ═══ Restoration Report (JSON) ═══
      zip.file('restoration-report.json', JSON.stringify(report, null, 2));

      // ═══ Pipeline Details (styled HTML) ═══
      const pipelineHtml = report.pipelineDetails.map(
        p => `<div class="step"><span class="step-num">${p.order}</span><div><strong>${p.primitiveName}</strong><span class="dim"> — ${p.durationMs}ms</span><div class="detail">${p.action}</div></div></div>`
      ).join('\n');
      zip.file('docs/pipeline-details.html', wrapDocHtml('Pipeline Details', `<p>Fingerprint: <code>${fingerprint}</code><br/>Serial: <code>${report.id}</code></p>\n${pipelineHtml}`));

      // ═══ New Capabilities (styled HTML) ═══
      const capsHtml = report.newCapabilities.map(
        c => `<div class="card"><h3>${c.name}</h3><p>${c.description}</p><pre><code>${escHtml(c.usageExample)}</code></pre></div>`
      ).join('\n');
      zip.file('docs/new-capabilities.html', wrapDocHtml('New Capabilities', capsHtml));

      // ═══ Testing Guide (styled HTML) ═══
      const testHtml = [
        `<p>Install: <code>${report.testingGuide.installCommand}</code></p>`,
        `<p>Run: <code>${report.testingGuide.testCommand}</code></p>`,
        `<h2>Steps</h2><ol>`,
        ...report.testingGuide.steps.map(s => `<li>${s}</li>`),
        `</ol>`,
      ].join('\n');
      zip.file('docs/testing-guide.html', wrapDocHtml('Testing Guide', testHtml));

      // ═══ Test Harness Config ═══
      const testConfig = {
        serialNumber: report.id,
        fingerprint,
        configPath: report.testingGuide.configPath,
        primitives: report.primitiveManifest.map(p => p.name),
        testCommand: report.testingGuide.testCommand,
      };
      zip.file('test-harness.config.json', JSON.stringify(testConfig, null, 2));

      // ═══ CJPI Certificate ═══
      zip.file('docs/cjpi-certificate.json', JSON.stringify(report.cjpiCertificate, null, 2));

      // ═══ HTML Ascension Report (styled, self-contained) ═══
      zip.file('ascension-report.html', generateHtmlReport(report));

      // ═══ Error Codes (styled HTML) ═══
      const errorHtml = report.errorCodes.map(
        e => `<div class="card"><h3>${e.code}</h3><p><strong>Trigger:</strong> ${e.trigger}</p><p><strong>Resolution:</strong> ${e.resolution}</p></div>`
      ).join('\n');
      zip.file('docs/error-codes.html', wrapDocHtml('Error Codes', errorHtml));

      // ═══ Vulnerability Assessment (styled HTML) ═══
      const vulnHtml = report.vulnerabilityAssessment.map(
        v => `<div class="card"><h3>${v.title}</h3><span class="badge badge-${v.severity}">${v.severity}</span> <span class="badge badge-${v.status}">${v.status}</span><p>${v.details}</p></div>`
      ).join('\n');
      zip.file('docs/vulnerability-assessment.html', wrapDocHtml('Vulnerability Assessment', vulnHtml));

      // ═══ Primitive Manifest (styled HTML) ═══
      const manifestHtml = `<table><thead><tr><th>Primitive</th><th>Category</th><th>Contribution</th></tr></thead><tbody>${
        report.primitiveManifest.map(p => `<tr><td><strong>${p.name}</strong></td><td>${p.category}</td><td>${p.contribution}</td></tr>`).join('\n')
      }</tbody></table>`;
      zip.file('docs/primitive-manifest.html', wrapDocHtml('Primitive Manifest', manifestHtml));

      // ═══ README ═══
      const readmeMd = [
        `# CMPSBL® Ascended Code Package`,
        ``,
        `**Serial:** \`${report.id}\``,
        `**Fingerprint:** \`${fingerprint}\``,
        `**CJPI Score:** ${report.cjpiCertificate.score} (${report.cjpiCertificate.tier})`,
        `**Primitives Applied:** ${report.primitiveManifest.map(p => p.name).join(', ')}`,
        `**Generated:** ${new Date().toISOString()}`,
        ``,
        `## Contents`,
        ``,
        `- \`src/original-source.txt\` — Your original code`,
        `- \`src/ascended-source${getRefurbishedExtension(detectedLang)}\` — Hardened code with primitive guards`,
        `- \`restoration-report.json\` — Full machine-readable report`,
        `- \`test-harness.config.json\` — Config for @cmpsbl/test-harness`,
        `- \`LICENSE.html\` — Usage license`,
        `- \`docs/\` — Pipeline details, capabilities, testing guide, error codes, CJPI cert`,
        ``,
        `## Quick Start`,
        ``,
        `\`\`\`bash`,
        `npm install @cmpsbl/test-harness`,
        `npx cmpsbl-test --config ./restoration-report.json`,
        `\`\`\``,
        ``,
        `## Support`,
        ``,
        `Visit https://cmpsbl.com and use your fingerprint ID (\`${fingerprint}\`)`,
        `to have DECODE pull up this ascension for customer support.`,
        ``,
        `© ${new Date().getFullYear()} PromptFluid™ · CMPSBL®`,
      ].join('\n');
      zip.file('README.md', readmeMd);

      // ═══ Universal User Guide (HTML) — ships in every export ═══
      zip.file('docs/USER-GUIDE.html', generateUniversalUserGuide({
        name: fileName?.replace(/\.[^.]+$/, '') || 'Ascended Code',
        slug: `ascended-${report.id}`,
        kind: 'ascension',
        tier: report.cjpiCertificate.tier,
        cjpi: report.cjpiCertificate.score,
        fingerprint,
        modules: report.primitiveManifest.map(p => p.name),
      }));

      // Dynamic ZIP naming: use the source file name, not generic serial
      const safeName = (fileName?.replace(/\.[^.]+$/, '') || 'refurbished')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      zip.generateAsync({ type: 'blob' }).then(blob => {
        import('file-saver').then(({ saveAs }) => {
          saveAs(blob, `cmpsbl-${safeName}-${report.cjpiCertificate.tier.toLowerCase()}.zip`);
          toast.success('Export complete. Your ascended code package has been downloaded.');
        });
      });
    });
  }, [report, code, refurbishedCode, identityRole, selectedPrims, fileName, detectedLang]);

  const resetFlow = useCallback(() => {
    setPhase('upload');
    setCode('');
    setFileName(null);
    setScanResult(null);
    setReport(null);
    setQueueEntry(null);
    setSelectedPrims([]);
    setRefurbishedCode('');
  }, []);

  const currentPhaseIdx = PHASE_META.findIndex(p => p.key === phase);

  return (
    <div className="min-h-screen bg-background relative">
      <SEO
        title="The Refurbishment Lab | CMPSBL® — Code Refurbishment with 40 Primitives"
        description="Upload your code. Our three-primitive scan team identifies vulnerabilities. Select up to 20 primitives to harden it. 3-day evaluation period included."
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
            <span className="text-xs font-medium text-primary tracking-wide">The Refurbishment Lab</span>
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
            We analyze your code, find its hidden potential, and refurbish it — only replacing what we absolutely have to. AI is our tool, not your dependency.
          </p>
        </div>
      </section>

      {/* Main flow */}
      <section className="relative z-10 px-3 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Phase indicators */}
          <div className="flex items-center justify-center gap-1 mb-10">
            {PHASE_META.map((p, idx) => {
              const Icon = p.icon;
              const isActive = phase === p.key;
              const isPast = currentPhaseIdx > idx;
              return (
                <div key={p.key} className="flex items-center">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all border",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : isPast
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-card/40 text-muted-foreground/40 border-border/20",
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {idx < PHASE_META.length - 1 && (
                    <div className={cn(
                      "w-8 h-px mx-1 transition-colors",
                      isPast ? "bg-primary/40" : "bg-border/30"
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* UPLOAD PHASE */}
          {phase === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="rounded-xl border border-border/40 bg-card/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">Upload Your Code</h2>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".js,.jsx,.ts,.tsx,.py,.rs,.go,.java,.c,.cpp,.cs,.rb,.swift,.kt,.php,.scala,.lua,.r,.dart,.ex,.vhd,.v,.sv,.scala,.hdl,.fir,text/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full rounded-xl border-2 border-dashed p-6 mb-4 text-center transition-colors",
                    "hover:border-primary/40 hover:bg-primary/5",
                    fileName ? "border-primary/30 bg-primary/5" : "border-border/40 bg-background/30"
                  )}
                >
                  <FileUp className={cn("w-8 h-8 mx-auto mb-2", fileName ? "text-primary" : "text-muted-foreground/40")} />
                  {fileName ? (
                    <div>
                      <p className="text-sm font-semibold text-foreground">{fileName}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Click to choose a different file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-foreground">Click to upload a file</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Any of 90+ supported languages · Max 1MB
                      </p>
                    </div>
                  )}
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-border/30" />
                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">or paste code</span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>

                <Textarea
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setFileName(null); }}
                  placeholder="Paste your code here — any language, any stack..."
                  className="min-h-[160px] bg-background/50 font-mono text-xs mb-4"
                />
                <Button
                  onClick={handleScan}
                  disabled={!code.trim() || isScanning}
                  className="w-full rounded-xl font-bold gap-2"
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
              </div>
            </div>
          )}

          {/* DIAGNOSTIC PHASE */}
          {phase === 'diagnostic' && scanResult && (
            <div className="max-w-2xl mx-auto space-y-6">
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

              <Button
                onClick={() => setPhase('select')}
                className="w-full rounded-xl font-bold gap-2"
              >
                Choose Your Primitives
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* SELECT PRIMITIVES PHASE */}
          {phase === 'select' && scanResult && (
            <div className="space-y-6">
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
            <div className="max-w-2xl mx-auto space-y-6">
              <RestorationQueue
                entry={queueEntry}
                queuePosition={queueEntry ? getQueuePosition(queueEntry.id) : null}
                estimatedWaitMs={estimateWaitTime('builder')}
              />

              {/* Animated primitive activation */}
              {processingPrimitives.length > 0 && (
                <div className="rounded-xl border border-border/30 bg-card/20 p-4">
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Applying Primitives
                  </h4>
                  <div className="space-y-1.5">
                    {processingPrimitives.map((p) => (
                      <div key={p.name} className="flex items-center gap-2">
                        {p.status === 'done' ? (
                          <div className="w-4 h-4 rounded-full bg-neon-green/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-neon-green" />
                          </div>
                        ) : p.status === 'active' ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-border/40" />
                        )}
                        <span className={cn(
                          "text-xs font-mono",
                          p.status === 'done' ? "text-foreground" : p.status === 'active' ? "text-primary font-bold" : "text-muted-foreground/50"
                        )}>
                          {p.name}
                        </span>
                        {p.status === 'active' && (
                          <span className="text-[9px] text-primary/70 ml-auto">activating...</span>
                        )}
                        {p.status === 'done' && (
                          <span className="text-[9px] text-neon-green/70 ml-auto">sealed</span>
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
            <div className="max-w-3xl mx-auto space-y-6">
              <DecodeDebrief
                report={report}
                scanResult={scanResult}
                originalCode={code}
                refurbishedCode={refurbishedCode}
                selectedPrimitives={selectedPrims}
              />
              <RestorationReportView report={report} />

              {/* Fingerprint ID notice */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Your Fingerprint ID</p>
                <p className="text-sm font-mono font-bold text-primary">{report.cjpiCertificate.fingerprint}</p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Save this ID — you can return anytime and use it with DECODE to pull up this refurbishment for support.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={resetFlow}
                  variant="outline"
                  className="flex-1 rounded-xl font-semibold"
                >
                  Start New Refurbishment
                </Button>
                <Button
                  className="flex-1 rounded-xl font-bold gap-2"
                  onClick={handleExport}
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Refurbished Code
                </Button>
              </div>
              <div className="text-center pt-2">
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
              Refurbishment Center Membership
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              One membership. Unlimited refurbishments. The queue is the experience — the center has a line because the work is worth waiting for.
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
