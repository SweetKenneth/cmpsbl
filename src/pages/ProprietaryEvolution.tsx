/**
 * Ascension — /ascension
 * Simplified 4-step wizard: Upload → Trace (optional) → Processing → Results
 * 
 * A1: Immutable run state via commitRun()
 * D1: UI calls executeRun() — not a controller
 * C1: Run-scoped everything
 * 
 * PERF: Pure CSS animations — no framer-motion dependency.
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, Link2, Activity, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { AscensionOnboarding } from '@/components/proprietary-evolution/AscensionOnboarding';
import { SimpleUploadStep } from '@/components/proprietary-evolution/SimpleUploadStep';
import { TraceAttachStep } from '@/components/proprietary-evolution/TraceAttachStep';
import { ProcessingStep } from '@/components/proprietary-evolution/ProcessingStep';
import { ResultsStep } from '@/components/proprietary-evolution/ResultsStep';
import type { TraceContext } from '@/lib/vision/trace';
import type { CandidateAnalysis } from '@/components/proprietary-evolution/ingest-utils';
import {
  createRun,
  acceptInput,
  attachTrace,
  resetRun,
  type AscensionRun,
  type AscensionResults,
} from '@/lib/ascension/orchestrator';

const STEPS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'trace', label: 'Trace', icon: Link2 },
  { id: 'analyze', label: 'Analyze', icon: Activity },
  { id: 'results', label: 'Results', icon: Sparkles },
] as const;

export default function ProprietaryEvolution() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<AscensionResults | null>(null);
  const runRef = useRef<AscensionRun | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUploadComplete = useCallback((analysis: CandidateAnalysis) => {
    if (!user) {
      toast({ title: 'Not signed in', variant: 'destructive' });
      return;
    }
    // A1: Immutable — acceptInput returns new run
    const run = createRun(user.id);
    const accepted = acceptInput(
      run,
      analysis.name || 'UPLOADED',
      analysis.language || 'typescript',
      analysis.ingestedFiles?.map(f => ({ name: f.name, content: f.content || '' })) || [],
    );
    runRef.current = accepted;
    setStep(1);
  }, [user, toast]);

  const handleTraceAttach = useCallback((t: TraceContext) => {
    if (runRef.current) {
      // A1: Immutable — attachTrace returns new run
      runRef.current = attachTrace(runRef.current, t);
    }
    setStep(2);
  }, []);

  const handleTraceSkip = useCallback(() => {
    setStep(2);
  }, []);

  const handleProcessingComplete = useCallback((resultData: AscensionResults) => {
    setResults(resultData);
    setStep(3);
  }, []);

  const handleReset = useCallback(async () => {
    // C1: Run-scoped reset — only this run's artifacts
    if (runRef.current) {
      try {
        await resetRun(runRef.current);
      } catch { /* non-fatal */ }
    }
    runRef.current = null;
    setStep(0);
    setResults(null);
    toast({ title: 'Reset complete', description: 'Ready for a new analysis.' });
  }, [toast]);

  const phases = [
    <SimpleUploadStep key="upload" onComplete={handleUploadComplete} />,
    <TraceAttachStep key="trace" onAttach={handleTraceAttach} onSkip={handleTraceSkip} />,
    <ProcessingStep key="process" run={runRef.current} onComplete={handleProcessingComplete} />,
    <ResultsStep key="results" results={results} sourceFiles={runRef.current?.sourceFiles} onReset={handleReset} />,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Ascension — Code Transformation | CMPSBL"
        description="Upload your code and discover new capabilities. The 40-Primitive substrate finds what your software can become — no LLM, pure deterministic analysis."
        canonical="https://cmpsbl.com/ascension"
        image="https://cmpsbl.com/og/ascension.jpg"
        keywords={['code transformation', 'capability discovery', 'substrate collision', 'CJPI scoring', 'software augmentation']}
        faq={[
          { question: 'What is Ascension?', answer: 'Ascension discovers hidden capabilities in your code by analyzing it against a 40-Primitive cognitive substrate — with zero LLM involvement.' },
          { question: 'How long does it take?', answer: 'Typically under 2 minutes. Upload your code, optionally attach a trace, and watch the analysis run.' },
          { question: 'What do I get?', answer: 'A downloadable package containing discovered capabilities as source code, tests, and documentation.' },
        ]}
      />

      <PublicNav />
      <AscensionOnboarding />

      <section className="flex-1 flex flex-col">
        {/* ═══ HERO — only on first step ═══ */}
        {step === 0 && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-neon-purple/[0.04]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_hsl(var(--primary)/0.08)_0%,_transparent_50%)]" />
            <div className="relative max-w-3xl mx-auto px-4 pt-16 pb-10 sm:pt-24 sm:pb-14 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                <span className="text-primary">Ascend Your Software</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Upload your code. We'll analyze it against the substrate and discover
                capabilities your software already had — no AI, pure deterministic analysis.
              </p>
            </div>
          </div>
        )}

        {/* ═══ STEPPER ═══ */}
        <div className="bg-background/80 backdrop-blur-2xl border-b border-border/10">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center w-full">
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isComplete = i < step;
                const Icon = isComplete ? Check : s.icon;

                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                          isActive
                            ? "border-primary bg-primary/15 shadow-[0_0_16px_hsl(var(--primary)/0.25)] scale-105"
                            : isComplete
                              ? "border-primary/50 bg-primary/10"
                              : "border-border/30 bg-muted/15"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4 transition-colors",
                          isActive ? "text-primary" : isComplete ? "text-primary/70" : "text-muted-foreground/40"
                        )} />
                      </div>
                      <span className={cn(
                        "text-[10px] font-mono uppercase tracking-wider whitespace-nowrap",
                        isActive ? "text-primary font-bold" : isComplete ? "text-primary/60" : "text-muted-foreground/40"
                      )}>
                        {s.label}
                      </span>
                    </div>

                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] mx-2 sm:mx-3 mt-[-18px]">
                        <div className={cn(
                          "h-full rounded-full transition-all duration-500",
                          i < step ? "bg-primary/40" : "bg-border/20"
                        )} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ STEP CONTENT ═══ */}
        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
            {phases[step]}
          </div>
        </main>
      </section>

      <EnhancedFooter />
    </div>
  );
}
