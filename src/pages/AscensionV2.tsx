/**
 * Ascension V2 — Hardened Pipeline UI
 * Route: /ascension-v2 (isolated from /ascension)
 *
 * 4-step wizard: Upload → Enhance (skippable) → Analyze+Dedup+Lock → Results
 * Wired to V2 orchestrator with audit chain + fingerprint gate.
 *
 * Uses V2 category prefix in artifact_registry for data isolation.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback, useEffect } from 'react';
import { Upload, Layers, Search, Download, Check, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';

import { V2UploadStep } from '@/components/ascension-v2/V2UploadStep';
import { V2EnhanceStep } from '@/components/ascension-v2/V2EnhanceStep';
import { V2ProcessingStep } from '@/components/ascension-v2/V2ProcessingStep';
import { V2ResultsStep } from '@/components/ascension-v2/V2ResultsStep';

import {
  initRun,
  type DiscoveredCapability,
  type DedupResult,
} from '@/lib/ascension-v2';

// ═══════════════════════════════════════════════════════════════
// Step config — 4 steps (Enhance is skippable)
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  { label: 'Upload', icon: Upload },
  { label: 'Enhance', icon: Layers },
  { label: 'Analyze', icon: Search },
  { label: 'Results', icon: Download },
] as const;

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function AscensionV2() {
  const [step, setStep] = useState(0);
  const [runId, setRunId] = useState('');
  const [enhanced, setEnhanced] = useState(false);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<DiscoveredCapability[]>([]);
  const [dedupResult, setDedupResult] = useState<DedupResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Init a fresh run on mount
  useEffect(() => {
    const id = initRun({
      onError: (error: string) => {
        toast({ title: 'Pipeline error', description: error, variant: 'destructive' });
      },
    });
    setRunId(id);
  }, []);

  const handleUploadComplete = useCallback(() => {
    setStep(1);
  }, []);

  const handleEnhanceComplete = useCallback((wasEnhanced: boolean, layerIds?: string[]) => {
    setEnhanced(wasEnhanced);
    setSelectedLayerIds(layerIds ?? []);
    setStep(2);
  }, []);

  const handleAnalysisComplete = useCallback((caps: DiscoveredCapability[], dedup: DedupResult) => {
    setCapabilities(caps);
    setDedupResult(dedup);
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
            'proprietary-mana-attachment-v2',
          ]);
      }
    } catch { /* non-fatal */ }

    const id = initRun();
    setRunId(id);
    setStep(0);
    setEnhanced(false);
    setSelectedLayerIds([]);
    setCapabilities([]);
    setDedupResult(null);
    toast({ title: 'Reset complete', description: 'Ready for a new analysis.' });
  }, [user, toast]);

  const phases = [
    <V2UploadStep key="upload" onComplete={handleUploadComplete} />,
    <V2EnhanceStep key="enhance" onComplete={handleEnhanceComplete} />,
    <V2ProcessingStep key="process" onComplete={handleAnalysisComplete} />,
    <V2ResultsStep
      key="results"
      capabilities={capabilities}
      dedup={dedupResult || { capabilities: [], rawCount: 0, groupCount: 0 }}
      enhanced={enhanced}
      selectedLayerIds={selectedLayerIds}
      onReset={handleReset}
    />,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Ascension V2 — Code Evolution Pipeline | CMPSBL®"
        description="Upload your code. Optionally enhance with Mana. Discover capabilities. Export a single wrapped ascension file."
      />
      <PublicNav />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
          {/* Hero — only on upload step */}
          {step === 0 && (
            <div className="text-center mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 sm:mb-3">
                Ascend Your Software
              </h1>
              <p className="text-muted-foreground text-xs sm:text-base max-w-lg mx-auto">
                Upload your code, optionally enhance with Mana-wrapped software,
                and we'll discover capabilities against the 40-Primitive substrate.
              </p>
            </div>
          )}

          {/* Stepper — 4 steps, responsive */}
          <nav className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-0">
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isComplete = i < step;
                const Icon = isComplete ? Check : s.icon;

                return (
                  <div key={s.label} className="flex items-center">
                    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                      <div className={cn(
                        'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300',
                        isComplete ? 'bg-primary text-primary-foreground' :
                        isActive ? 'bg-primary/10 text-primary border-2 border-primary' :
                        'bg-muted text-muted-foreground'
                      )}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className={cn(
                        'text-[9px] sm:text-[10px] font-medium',
                        isActive || isComplete ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {s.label}
                      </span>
                    </div>

                    {i < STEPS.length - 1 && (
                      <div className="w-8 sm:w-20 mx-0.5 sm:mx-1 mt-[-12px]">
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
          <div className="min-h-[300px] sm:min-h-[400px]">
            {phases[step]}
          </div>

          {/* Reset button — visible during analysis only */}
          {step === 2 && (
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
