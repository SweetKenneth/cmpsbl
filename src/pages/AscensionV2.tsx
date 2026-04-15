/**
 * Ascension V2 — Hardened Pipeline UI
 * Route: /ascension-v2 (isolated from /ascension)
 *
 * 4-step wizard: Upload → Analyze → Lock → Export
 * Wired to V2 orchestrator with audit chain + fingerprint gate.
 *
 * Uses V2 category prefix in artifact_registry for data isolation.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback, useEffect } from 'react';
import { Upload, Search, Lock, Download, Check, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';

import { V2UploadStep } from '@/components/ascension-v2/V2UploadStep';
import { V2ProcessingStep } from '@/components/ascension-v2/V2ProcessingStep';
import { V2LockStep } from '@/components/ascension-v2/V2LockStep';
import { V2ResultsStep } from '@/components/ascension-v2/V2ResultsStep';

import {
  initRun,
  getSnapshot,
  type RunPhase,
  type DiscoveredCapability,
} from '@/lib/ascension-v2';

// ═══════════════════════════════════════════════════════════════
// Step config
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  { label: 'Upload', icon: Upload },
  { label: 'Analyze', icon: Search },
  { label: 'Lock', icon: Lock },
  { label: 'Results', icon: Download },
] as const;

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function AscensionV2() {
  const [step, setStep] = useState(0);
  const [runId, setRunId] = useState('');
  const [discoveries, setDiscoveries] = useState<DiscoveredCapability[]>([]);
  const [ascendedCount, setAscendedCount] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Init a fresh run on mount
  useEffect(() => {
    const id = initRun({
      onPhaseChange: (phase: RunPhase) => {
        // Phase changes drive step transitions via explicit callbacks
      },
      onDiscovery: (cap: DiscoveredCapability) => {
        setDiscoveries(prev => [...prev, cap]);
        if (cap.cjpiScore > topScore) setTopScore(cap.cjpiScore);
      },
      onError: (error: string) => {
        toast({ title: 'Pipeline error', description: error, variant: 'destructive' });
      },
    });
    setRunId(id);
  }, []);

  const handleUploadComplete = useCallback(() => {
    setStep(1);
  }, []);

  const handleAnalysisComplete = useCallback((caps: DiscoveredCapability[]) => {
    setDiscoveries(caps);
    if (caps.length > 0) {
      const best = Math.max(...caps.map(c => c.cjpiScore));
      setTopScore(best);
    }
    setStep(2);
  }, []);

  const handleLockComplete = useCallback((count: number) => {
    setAscendedCount(count);
    setStep(3);
  }, []);

  const handleReset = useCallback(async () => {
    try {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('artifact_registry')
          .delete()
          .eq('user_id', user.id)
          .in('category', [
            'proprietary-evolution-v2',
            'proprietary-discovery-v2',
            'proprietary-ascended-v2',
          ]);
      }
    } catch { /* non-fatal */ }

    const id = initRun();
    setRunId(id);
    setStep(0);
    setDiscoveries([]);
    setAscendedCount(0);
    setTopScore(0);
    toast({ title: 'Reset complete', description: 'Ready for a new analysis.' });
  }, [user, toast]);

  const phases = [
    <V2UploadStep key="upload" onComplete={handleUploadComplete} />,
    <V2ProcessingStep key="process" onComplete={handleAnalysisComplete} />,
    <V2LockStep key="lock" discoveries={discoveries} onComplete={handleLockComplete} />,
    <V2ResultsStep
      key="results"
      stats={{ discovered: discoveries.length, ascended: ascendedCount, topScore }}
      onReset={handleReset}
    />,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Ascension V2 — Code Evolution Pipeline | CMPSBL®"
        description="Upload your code. Discover capabilities. Lock them permanently. Export hardened Layer 2 artifacts."
      />
      <PublicNav />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          {/* Hero — only on upload step */}
          {step === 0 && (
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
                Ascend Your Software
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
                Upload your code. We analyze it against the 40-Primitive substrate to discover
                capabilities — no AI, pure deterministic analysis.
              </p>
            </div>
          )}

          {/* Stepper */}
          <nav className="mb-8">
            <div className="flex items-center justify-center gap-0">
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isComplete = i < step;
                const Icon = isComplete ? Check : s.icon;

                return (
                  <div key={s.label} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300',
                        isComplete ? 'bg-primary text-primary-foreground' :
                        isActive ? 'bg-primary/10 text-primary border-2 border-primary' :
                        'bg-muted text-muted-foreground'
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium',
                        isActive || isComplete ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {s.label}
                      </span>
                    </div>

                    {i < STEPS.length - 1 && (
                      <div className="w-12 sm:w-20 mx-1 mt-[-12px]">
                        <div className={cn(
                          'h-0.5 rounded-full transition-colors',
                          i < step ? 'bg-primary' : 'bg-border'
                        )} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Step content */}
          <div className="min-h-[400px]">
            {phases[step]}
          </div>

          {/* Reset button — visible after step 0 */}
          {step > 0 && step < 3 && (
            <div className="mt-6 text-center">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Start Over
              </Button>
            </div>
          )}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
