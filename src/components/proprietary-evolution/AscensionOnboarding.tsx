/**
 * Ascension Onboarding Modal — First-visit clarity-focused explainer
 * Matches CmpsblWelcome design system. Shows once per user via localStorage.
 * Uses shared CSS animation system from cmpsbl-welcome.css.
 */

import { useState, useEffect } from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';
import { X, Upload, Zap, Diamond, Package, ArrowRight, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import '@/components/onboarding/cmpsbl-welcome.css';

const STORAGE_KEY = 'ascension-onboarded';

interface AscensionStep {
  icon: React.ElementType;
  tag: string;
  title: string;
  body: string;
  accent: string;
  pattern: string;
  footer?: string;
  bullets?: string[];
}

const STEPS: AscensionStep[] = [
  {
    icon: Sparkles,
    tag: 'What is this?',
    title: 'Ascension — Code Transformation',
    body: 'Ascension takes your source code and collides it against a living 40‑Primitive cognitive substrate. New capabilities emerge from interaction — things your code couldn\'t do alone.\n\nNo large‑language model is used at any point. Every discovery comes from pure internal cording — deterministic, auditable, and repeatable.',
    footer: 'Zero LLM. Pure substrate collision.',
    accent: 'primary',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.12) 0%, transparent 50%)',
  },
  {
    icon: Upload,
    tag: 'Step 1 · Ingest',
    title: 'Upload Your Code',
    body: 'Drop source files in any of 25 supported languages — including 7 hardware description languages like VHDL and Verilog.\n\nYour code becomes Primitive #41, a first‑class participant in the substrate matrix with its own capability surface.',
    bullets: ['25 languages supported', '7 HDLs (VHDL, Verilog, SystemVerilog…)', 'Your code is never stored or shared'],
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-cyan) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Zap,
    tag: 'Step 2 · Discovery',
    title: 'Collision Cycles Run',
    body: 'Primitive #41 collides against all 40 substrate primitives in chains 2–8 primitives deep. Each collision tests for emergent capabilities and scores them with CJPI.\n\nGovernance enforces circuit breakers, rate limits, and audit chains throughout.',
    footer: 'Governed by DEFENSE Layer. Audited by BEACON.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Diamond,
    tag: 'Step 3 · Ascend',
    title: 'Lock Discoveries In',
    body: 'Review what the substrate found. Ascend successful interaction chains into deterministic, repeatable memories that become part of your code\'s permanent capability set.',
    accent: 'neon-magenta',
    pattern: 'radial-gradient(circle at 60% 20%, hsl(var(--neon-magenta) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Package,
    tag: 'Step 4 · Export',
    title: 'Take It With You',
    body: 'Export ascended capabilities as a single portable file: your original source code, tests, documentation, a sealed Mini‑Runtime™, and a CJPI‑scored capability certificate.\n\nDrop it into any stack — zero external dependencies.',
    footer: 'Exports available on paid tiers. Free users can discover and preview.',
    accent: 'neon-amber',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-amber) / 0.1) 0%, transparent 50%)',
  },
];

const accentMap: Record<string, string> = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  'neon-cyan': 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  'neon-purple': 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  'neon-magenta': 'text-neon-magenta bg-neon-magenta/10 border-neon-magenta/20',
  'neon-amber': 'text-neon-amber bg-neon-amber/10 border-neon-amber/20',
};

const iconAccent: Record<string, string> = {
  primary: 'text-primary',
  'neon-cyan': 'text-neon-cyan',
  'neon-purple': 'text-neon-purple',
  'neon-magenta': 'text-neon-magenta',
  'neon-amber': 'text-neon-amber',
};

export function AscensionOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const { trackOpened, trackStep, trackCompleted, trackSkipped } = useOnboardingTracking('ascension');

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) { setOpen(true); trackOpened(); }
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const dismiss = () => {
    if (step < STEPS.length - 1) {
      trackSkipped(step, STEPS.length);
    } else {
      trackCompleted(STEPS.length);
    }
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setDirection('next');
      setStep(s => {
        const ns = s + 1;
        trackStep(ns, STEPS[ns]?.tag);
        return ns;
      });
    } else dismiss();
  };

  const back = () => {
    if (step > 0) {
      setDirection('prev');
      setStep(s => s - 1);
    }
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const colors = accentMap[current.accent] || accentMap.primary;
  const iconColor = iconAccent[current.accent] || iconAccent.primary;
  const isLastStep = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[12000] grid place-items-center p-4 cmpsbl-welcome-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm cmpsbl-welcome-fade-in" />

      <div className="relative w-full max-w-md cmpsbl-welcome-modal-enter">
        <div className="relative bg-background/95 border border-border/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none cmpsbl-welcome-pattern-shift"
            style={{ background: current.pattern }}
          />

          {/* Scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="cmpsbl-welcome-scanline" />
          </div>

          {/* Top accent — magenta gradient for Ascension */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--neon-magenta)/0.5)] to-transparent" />

          {/* Progress + close */}
          <div className="relative flex items-center justify-between px-5 pt-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > step ? 'next' : 'prev'); setStep(i); }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-500 cursor-pointer',
                    i === step
                      ? 'w-7 bg-[hsl(var(--neon-magenta))] cmpsbl-welcome-dot-active'
                      : i < step
                        ? 'w-3 bg-[hsl(var(--neon-magenta)/0.5)]'
                        : 'w-3 bg-muted-foreground/20'
                  )}
                  aria-label={`Step ${i + 1}: ${STEPS[i].title}`}
                />
              ))}
            </div>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              aria-label="Skip onboarding"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step counter */}
          <div className="relative px-5 pt-3">
            <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Content */}
          <div
            key={step}
            className={cn(
              'relative px-6 pt-3 pb-5 flex-1',
              direction === 'next' ? 'cmpsbl-welcome-slide-in-right' : 'cmpsbl-welcome-slide-in-left'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl border flex items-center justify-center mb-4 cmpsbl-welcome-icon-pop',
              colors
            )}>
              <Icon className={cn('w-6 h-6', iconColor)} />
            </div>

            <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5 cmpsbl-welcome-tag-fade text-muted-foreground/60">
              {current.tag}
            </p>
            <h2 className="text-lg font-bold text-foreground mb-2.5 tracking-tight cmpsbl-welcome-title-reveal">
              {current.title}
            </h2>
            {current.body.split('\n\n').map((paragraph, i) => (
              <p key={i} className={cn("text-[13px] text-muted-foreground leading-relaxed cmpsbl-welcome-body-fade", i > 0 && "mt-2.5")}>
                {paragraph}
              </p>
            ))}

            {/* Bullet list */}
            {current.bullets && (
              <ul className="mt-3 space-y-1.5 cmpsbl-welcome-body-fade">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-[12px] text-foreground/80">
                    <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Footer note */}
            {current.footer && (
              <div className="mt-3 flex items-start gap-2 cmpsbl-welcome-body-fade">
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-muted-foreground/40 shrink-0" />
                <p className="text-[11px] font-mono text-muted-foreground/60">
                  {current.footer}
                </p>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="relative flex items-center justify-between px-6 pb-5 pt-1 border-t border-border/10">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={back} className="text-xs h-9 gap-1">
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={dismiss} className="text-xs h-9 text-muted-foreground">
                Skip tour
              </Button>
            )}

            <Button
              size="sm"
              onClick={next}
              className="text-xs h-9 gap-1.5 px-5 cmpsbl-welcome-cta-glow"
            >
              {isLastStep ? 'Begin Ascension' : 'Next'}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
