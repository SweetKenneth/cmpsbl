/**
 * Ascension — /x
 * PIN-gated software evolution lifecycle within the CMPSBL cognitive substrate.
 * Full-page step-by-step wizard: INGEST → ASCENSION → CRYSTALLIZATION → EXPORT
 *
 * PERF: Pure CSS animations — no framer-motion dependency.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { PinGate } from '@/components/gates/PinGate';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { AscensionHero } from '@/components/proprietary-evolution/AscensionHero';
import { IngestPhase } from '@/components/proprietary-evolution/IngestPhase';
import { DiscoveryPhase } from '@/components/proprietary-evolution/DiscoveryPhase';
import { CrystallizationPhase } from '@/components/proprietary-evolution/CrystallizationPhase';
import { ExportPhase } from '@/components/proprietary-evolution/ExportPhase';
import { AscensionStepper } from '@/components/proprietary-evolution/AscensionStepper';
import { AscensionOnboarding } from '@/components/proprietary-evolution/AscensionOnboarding';
import { AscensionEffectPanel } from '@/components/proprietary-evolution/AscensionEffectPanel';

const PHASE_LABELS = ['Ingest', 'Discovery', 'Ascend', 'Export'] as const;

const PHASE_DESCRIPTIONS = [
  'Upload source files — your code becomes Primitive #41',
  'Collide against 40 substrate primitives to discover capabilities',
  'Ascend discovered capabilities into permanent memories',
  'Export portable Ascended Memory packs',
] as const;

export default function ProprietaryEvolution() {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [displayedStep, setDisplayedStep] = useState(0);
  const [phaseAnimClass, setPhaseAnimClass] = useState('ascension-phase-idle');
  const [showHero, setShowHero] = useState(true);

  const goTo = useCallback((step: number) => {
    if (step === activeStep) return;
    const dir = step > activeStep ? 1 : -1;
    setDirection(dir);

    // Exit animation
    setPhaseAnimClass(dir > 0 ? 'ascension-phase-exit-left' : 'ascension-phase-exit-right');

    setTimeout(() => {
      setDisplayedStep(step);
      setActiveStep(step);
      setShowHero(step === 0);
      // Enter animation
      setPhaseAnimClass(dir > 0 ? 'ascension-phase-enter-right' : 'ascension-phase-enter-left');

      setTimeout(() => setPhaseAnimClass('ascension-phase-idle'), 350);
    }, 250);
  }, [activeStep]);

  const next = () => { if (activeStep < 3) goTo(activeStep + 1); };
  const back = () => { if (activeStep > 0) goTo(activeStep - 1); };

  const phases = [
    <IngestPhase key="ingest" />,
    <DiscoveryPhase key="discovery" />,
    <CrystallizationPhase key="crystallize" />,
    <ExportPhase key="export" />,
  ];

  // CSS class for phase transition
  const phaseClass = transitioning
    ? (direction > 0 ? 'ascension-phase-exit-left' : 'ascension-phase-exit-right')
    : (direction !== 0 ? (direction > 0 ? 'ascension-phase-enter-right' : 'ascension-phase-enter-left') : 'ascension-phase-idle');

  return (
    <PinGate pin="041041" storageKey="gate-x-proprietary">
      <div className="min-h-screen bg-background flex flex-col">
        <SEO
          title="Ascension — Software Evolution | CMPSBL"
          description="Bring your software into the CMPSBL cognitive substrate. New capabilities emerge from interaction — crystallized into portable, exportable Ascended Memories."
          canonical="https://cmpsbl.com/x"
        />

        <PublicNav />
        <AscensionOnboarding />

        {/* ═══ COMPACT HERO (only on step 0) ═══ */}
        <div
          className={activeStep === 0 ? 'ascension-hero-enter' : 'ascension-hero-exit'}
          style={{ overflow: 'hidden' }}
        >
          {activeStep === 0 && <AscensionHero />}
        </div>

        {/* ═══ WIZARD SECTION ═══ */}
        <section className="flex-1 flex flex-col">
          {/* Sticky stepper + phase header */}
          <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/10">
            <div className="max-w-4xl mx-auto px-4 pt-4 pb-3 space-y-3">
              <AscensionStepper activeStep={activeStep} onStepClick={goTo} />

              {/* Phase title + description */}
              <div className="text-center">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {PHASE_LABELS[activeStep]}
                </h2>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {PHASE_DESCRIPTIONS[activeStep]}
                </p>
              </div>
            </div>
          </div>

          {/* Phase content — CSS animated transitions */}
          <main className="flex-1">
            <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
              <div ref={phaseRef} className={phaseClass}>
                {phases[displayedStep]}
              </div>

              {/* ═══ VISION: Effect Monitor (always visible) ═══ */}
              <div className="mt-8 pt-6 border-t border-border/10">
                <AscensionEffectPanel />
              </div>
            </div>
          </main>

          {/* Bottom navigation */}
          <div className="sticky bottom-0 z-30 bg-background/90 backdrop-blur-xl border-t border-border/10">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={back}
                disabled={activeStep === 0}
                className="gap-1.5 text-xs h-9"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>

              <span className="text-[10px] font-mono text-muted-foreground">
                Step {activeStep + 1} of 4
              </span>

              <Button
                size="sm"
                onClick={next}
                disabled={activeStep === 3}
                className="gap-1.5 text-xs h-9"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </PinGate>
  );
}