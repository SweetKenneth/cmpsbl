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
import { DecodeFactoryVoice } from "@/components/factory/DecodeFactoryVoice";
import { PrimitiveSelector } from "@/components/factory/PrimitiveSelector";
import { RestorationQueue } from "@/components/factory/RestorationQueue";
import { RestorationReportView } from "@/components/factory/RestorationReportView";
import { MembershipTiers } from "@/components/factory/MembershipTiers";
import { DecodeDebrief } from "@/components/factory/DecodeDebrief";
import { PublicBreadcrumb } from "@/components/navigation/PublicBreadcrumb";
import { useDecodeStore } from "@/stores/decodeStore";

const EnhancedFooter = lazy(() => import("@/components/EnhancedFooter").then(m => ({ default: m.EnhancedFooter })));

type Phase = 'upload' | 'diagnostic' | 'select' | 'queue' | 'debrief';

const PHASE_META: { key: Phase; label: string; icon: React.ElementType }[] = [
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'diagnostic', label: 'Diagnostic', icon: Search },
  { key: 'select', label: 'Select', icon: Settings2 },
  { key: 'queue', label: 'Processing', icon: Cpu },
  { key: 'debrief', label: 'Debrief', icon: MessageSquare },
];

export default function RestorationShop() {
  const [phase, setPhase] = useState<Phase>('upload');
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [report, setReport] = useState<RestorationReport | null>(null);
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const identityRole = useDecodeStore(s => s.identityRole);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 1MB)
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
      const result = await runScanTeam(code);
      setScanResult(result);
      setPhase('diagnostic');
    } finally {
      setIsScanning(false);
    }
  }, [code, isScanning]);

  const handleSelectPrimitives = useCallback(async (selected: PrimitiveRecommendation[]) => {
    if (!scanResult || isRestoring) return;
    setIsRestoring(true);

    const entry = addToQueue('demo-user', 'builder', 'demo-hash', selected.map(s => s.name));
    setQueueEntry(entry);
    setPhase('queue');

    await new Promise(resolve => setTimeout(resolve, 3000));

    const restorationReport = generateRestorationReport(scanResult, selected);
    setReport(restorationReport);

    entry.status = 'complete';
    setQueueEntry({ ...entry });
    setPhase('debrief');
    setIsRestoring(false);
  }, [scanResult, isRestoring]);

  const handleExport = useCallback(() => {
    const isSubscribed = identityRole === 'governor' || identityRole === 'architect' || identityRole === 'creator' || identityRole === 'studio';

    if (!isSubscribed) {
      toast.error('To export your refurbished code, please subscribe to a paid plan.', {
        action: {
          label: 'View Plans',
          onClick: () => window.location.href = '/plans',
        },
      });
      return;
    }

    // Build and trigger ZIP download
    if (!report) return;
    toast.success('Preparing your refurbished code package for download...');

    import('jszip').then(({ default: JSZip }) => {
      const zip = new JSZip();

      // Original source
      zip.file('original-source.txt', code || '// No source provided');

      // Refurbishment report as JSON
      zip.file('restoration-report.json', JSON.stringify(report, null, 2));

      // Pipeline details
      const pipelineMd = report.pipelineDetails.map(
        p => `### Step ${p.order}: ${p.primitiveName}\n${p.action}\nDuration: ${p.durationMs}ms`
      ).join('\n\n');
      zip.file('docs/pipeline-details.md', `# Pipeline Details\n\n${pipelineMd}`);

      // New capabilities
      const capsMd = report.newCapabilities.map(
        c => `### ${c.name}\n${c.description}\n\n\`\`\`typescript\n${c.usageExample}\n\`\`\``
      ).join('\n\n');
      zip.file('docs/new-capabilities.md', `# New Capabilities\n\n${capsMd}`);

      // Test harness config
      const testMd = [
        `# Testing Guide`,
        `\nInstall: \`${report.testingGuide.installCommand}\``,
        `Run: \`${report.testingGuide.testCommand}\``,
        `\n## Steps\n`,
        ...report.testingGuide.steps.map((s, i) => `${i + 1}. ${s}`),
      ].join('\n');
      zip.file('docs/testing-guide.md', testMd);

      // CJPI certificate
      zip.file('docs/cjpi-certificate.json', JSON.stringify(report.cjpiCertificate, null, 2));

      // Error codes
      const errorMd = report.errorCodes.map(
        e => `### ${e.code}\n**Trigger:** ${e.trigger}\n**Resolution:** ${e.resolution}`
      ).join('\n\n');
      zip.file('docs/error-codes.md', `# Error Codes\n\n${errorMd}`);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        import('file-saver').then(({ saveAs }) => {
          saveAs(blob, `cmpsbl-refurbished-${report.id}.zip`);
          toast.success('Export complete. Your refurbished code has been downloaded.');
        });
      });
    });
  }, [report, code, identityRole]);

  const resetFlow = useCallback(() => {
    setPhase('upload');
    setCode('');
    setFileName(null);
    setScanResult(null);
    setReport(null);
    setQueueEntry(null);
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

                {/* File upload drop zone */}
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
                        Any of 25 supported languages · Max 1MB
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
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/30 bg-card/20 p-4 text-center">
                   <div className="text-2xl font-black text-foreground">{scanResult.cjpiEstimate}</div>
                   <div className="text-xs text-muted-foreground">Current CJPI Estimate</div>
                </div>
                <div className="rounded-xl border border-border/30 bg-card/20 p-4 text-center">
                   <div className="text-2xl font-black text-foreground">{scanResult.architecturalRunway}mo</div>
                   <div className="text-xs text-muted-foreground">Architectural Runway</div>
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
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">The refurbishment lab is processing your code...</p>
              </div>
            </div>
          )}

          {/* DEBRIEF PHASE */}
          {phase === 'debrief' && report && (
            <div className="max-w-3xl mx-auto space-y-6">
              <DecodeDebrief report={report} scanResult={scanResult} />
              <RestorationReportView report={report} />

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
