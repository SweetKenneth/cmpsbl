/**
 * Ascension V2 — Hardened Pipeline UI
 * Route: /ascension-v2 (isolated from /ascension)
 *
 * 5-step wizard: Upload → Enhance (skippable) → Govern → Analyze → Results
 * Wired to V2 orchestrator with audit chain + fingerprint gate.
 *
 * Uses V2 category prefix in artifact_registry for data isolation.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Layers, ShieldCheck, Search, Download, Check, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { usePageSEO } from '@/hooks/usePageSEO';

import { V2UploadStep } from '@/components/ascension-v2/V2UploadStep';
import { V2EnhanceStep } from '@/components/ascension-v2/V2EnhanceStep';
import { V2GovernanceModeStep } from '@/components/ascension-v2/V2GovernanceModeStep';
import { V2ProcessingStep } from '@/components/ascension-v2/V2ProcessingStep';
import { V2ResultsStep } from '@/components/ascension-v2/V2ResultsStep';
import { V2LaunchLayers } from '@/components/ascension-v2/V2LaunchLayers';
import { V2CinematicHero } from '@/components/ascension-v2/V2CinematicHero';
import { V2UiModeToggle } from '@/components/ascension-v2/V2UiModeToggle';
import { useV2UiMode } from '@/lib/ascension-v2/ui-mode';
import { V2WhatsAscension } from '@/components/ascension-v2/V2WhatsAscension';
import { V2Faq } from '@/components/ascension-v2/V2Faq';

import {
  initRun,
  type DiscoveredCapability,
  type DedupResult,
} from '@/lib/ascension-v2';
import { peekReAscendPayload } from '@/lib/ascension-v2/reascend';

// ═══════════════════════════════════════════════════════════════
// Step config — 4 steps (Enhance is skippable)
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  { label: 'Upload', icon: Upload },
  { label: 'Enhance', icon: Layers },
  { label: 'Govern', icon: ShieldCheck },
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
  const { mode: uiMode, setMode: setUiMode } = useV2UiMode();
  const stepperRef = useRef<HTMLElement | null>(null);
  const isFirstStepRender = useRef(true);

  // Init a fresh run on mount.
  // Skip the reset when a re-ascension payload is pending — V2UploadStep will
  // call initRun() itself as part of its auto-replay so the chain doesn't get
  // wiped mid-flight by a parent effect racing the child.
  useEffect(() => {
    if (peekReAscendPayload()) {
      // Child will own the run lifecycle for this re-ascension.
      return;
    }
    const id = initRun({
      onError: (error: string) => {
        toast({ title: 'Pipeline error', description: error, variant: 'destructive' });
      },
    });
    setRunId(id);
  }, [toast]);

  // Snap to the Ascension UI section on every step change so users always
  // see the animated flow as they advance.
  useEffect(() => {
    if (isFirstStepRender.current) {
      isFirstStepRender.current = false;
      return;
    }
    const el = stepperRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const y = el.getBoundingClientRect().top + window.scrollY - 12;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }, [step]);

  const handleUploadComplete = useCallback(() => {
    setStep(1);
  }, []);

  const handleEnhanceComplete = useCallback((wasEnhanced: boolean, layerIds?: string[]) => {
    setEnhanced(wasEnhanced);
    setSelectedLayerIds(layerIds ?? []);
    setStep(2);
  }, []);

  const handleGovernanceComplete = useCallback(() => {
    setStep(3);
  }, []);

  const handleAnalysisComplete = useCallback((caps: DiscoveredCapability[], dedup: DedupResult) => {
    setCapabilities(caps);
    setDedupResult(dedup);
    setStep(4);
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
    <V2GovernanceModeStep key="govern" uiMode={uiMode} onComplete={handleGovernanceComplete} />,
    <V2ProcessingStep key="process" onComplete={handleAnalysisComplete} />,
    <V2ResultsStep
      key="results"
      capabilities={capabilities}
      dedup={dedupResult || { capabilities: [], rawCount: 0, groupCount: 0 }}
      enhanced={enhanced}
      selectedLayerIds={selectedLayerIds}
      uiMode={uiMode}
      onReset={handleReset}
    />,
  ];

  const seo = usePageSEO('/ascension-v2');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO {...seo.helmetProps} type="product" />
      <PublicNav />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
          {/* Cinematic Hero — only on upload step, above the machine */}
          {step === 0 && <V2CinematicHero />}

          {/* "What's Ascension" explainer — only on upload step, below hero */}
          {step === 0 && <V2WhatsAscension />}

          {/* Stepper — 4 steps, responsive */}
          <nav ref={stepperRef} className="mb-6 sm:mb-8 scroll-mt-4">
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

          {/* UI mode toggle — Simple is the calm default; Advanced unlocks the
              expert surfaces in Govern + Results (contract proof, drift
              overrides, provenance, language status). Hidden on Upload — there's
              nothing advanced to show yet — and on Processing where it would
              flicker mid-analysis. Choice persists per user. */}
          {step !== 0 && step !== 3 && (
            <div className="flex justify-center mb-4 sm:mb-6 animate-fade-in">
              <V2UiModeToggle mode={uiMode} onChange={setUiMode} />
            </div>
          )}

          {/* Step content */}
          <div className="min-h-[300px] sm:min-h-[400px]">
            {phases[step]}
          </div>

          {/* Reset is provided directly inside Results; the Processing step
              has its own implicit cancel via initRun() on remount. No need
              for a duplicate page-level Start Over button. */}

          {/* Top 20 Launch Layers — curated lineup. Hidden on Results so the
              ascended-package action block stays the focal point. */}
          {step !== 4 && <V2LaunchLayers />}

          {/* FAQ — only on upload step, page bottom */}
          {step === 0 && <V2Faq />}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
