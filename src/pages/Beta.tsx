/**
 * Beta — Private Ascension Lab
 * Route: /beta (gated: ?1952=cmpsbl + 6-digit PIN)
 *
 * Private experimentation surface for testing new Ascension features
 * before promoting them to the public /ascension-v2 page.
 *
 * Architecture: Hybrid fork.
 *   - This page is a hard fork of AscensionV2.tsx (visual sandbox).
 *   - The orchestrator, registry, and edge functions stay shared, but
 *     opt into experimental branches via setAscensionMode('beta').
 *   - When a beta feature graduates, delete its mode branch and the
 *     code is already live in prod.
 *
 * Hidden from public:
 *   - robots.txt disallow
 *   - VerticalSecretGate renders nothing without ?1952=cmpsbl
 *   - PIN: 259100
 *   - Not in sitemap / route registry
 *   - noindex meta injected by gate
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Layers, Search, Download, Check, RotateCcw, FlaskConical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { VerticalSecretGate } from '@/components/gates/VerticalSecretGate';

import { V2UploadStep } from '@/components/ascension-v2/V2UploadStep';
import { V2EnhanceStep } from '@/components/ascension-v2/V2EnhanceStep';
import { V2ProcessingStep } from '@/components/ascension-v2/V2ProcessingStep';
import { V2ResultsStep } from '@/components/ascension-v2/V2ResultsStep';
import { V2LaunchLayers } from '@/components/ascension-v2/V2LaunchLayers';
import { V2CinematicHero } from '@/components/ascension-v2/V2CinematicHero';
import { V2WhatsAscension } from '@/components/ascension-v2/V2WhatsAscension';
import { V2Faq } from '@/components/ascension-v2/V2Faq';

import {
  initRun,
  type DiscoveredCapability,
  type DedupResult,
} from '@/lib/ascension-v2';
import { setAscensionMode, clearAscensionMode } from '@/lib/ascension-v2/mode';

const STEPS = [
  { label: 'Upload', icon: Upload },
  { label: 'Enhance', icon: Layers },
  { label: 'Analyze', icon: Search },
  { label: 'Results', icon: Download },
] as const;

function BetaContent() {
  const [step, setStep] = useState(0);
  const [, setRunId] = useState('');
  const [enhanced, setEnhanced] = useState(false);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<DiscoveredCapability[]>([]);
  const [dedupResult, setDedupResult] = useState<DedupResult | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const stepperRef = useRef<HTMLElement | null>(null);
  const isFirstStepRender = useRef(true);

  // Activate beta mode for the lifecycle of this page; restore prod on unmount.
  useEffect(() => {
    setAscensionMode('beta');
    return () => clearAscensionMode();
  }, []);

  useEffect(() => {
    const id = initRun({
      onError: (error: string) => {
        toast({ title: 'Pipeline error', description: error, variant: 'destructive' });
      },
    });
    setRunId(id);
  }, [toast]);

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

  const handleUploadComplete = useCallback(() => setStep(1), []);

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
      <PublicNav />

      {/* Beta banner — Governor-only context strip */}
      <div className="bg-gradient-to-r from-neon-amber/10 via-neon-amber/5 to-transparent border-b border-neon-amber/30">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FlaskConical className="h-3.5 w-3.5 text-neon-amber shrink-0" />
            <span className="text-[11px] sm:text-xs font-mono text-foreground truncate">
              Ascension Lab — private experimentation surface
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-neon-amber/40 text-neon-amber shrink-0">
            BETA
          </Badge>
        </div>
      </div>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
          {step === 0 && <V2CinematicHero />}
          {step === 0 && <V2WhatsAscension />}

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

          <div className="min-h-[300px] sm:min-h-[400px]">
            {phases[step]}
          </div>

          {step === 2 && (
            <div className="mt-6 text-center">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Start Over
              </Button>
            </div>
          )}

          <V2LaunchLayers />

          {step === 0 && <V2Faq />}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}

export default function Beta() {
  return (
    <VerticalSecretGate verticalId="beta">
      <BetaContent />
    </VerticalSecretGate>
  );
}
