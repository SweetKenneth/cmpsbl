/**
 * CMPSBL Welcome Onboarding — First-visit guided tour
 * Aligned with Software Ascension Center messaging
 * Neon gradient aesthetic matching homepage hero
 */

import { useState, useEffect } from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ChevronRight, Wrench, Layers, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './cmpsbl-welcome.css';

const STORAGE_KEY = 'cmpsbl-welcomed';

interface OnboardingStep {
  icon: React.ElementType;
  tag: string;
  title: string;
  body: string;
  accent: string;
  pattern: string;
  footer?: string;
  inlineCta?: { text: string; href: string };
  secondaryInlineCta?: { text: string; href: string };
}

const STEPS: OnboardingStep[] = [
  {
    icon: Layers,
    tag: 'The Substrate',
    title: 'Where Machines Learn to Dream',
    body: 'CMPSBL is a governed cognitive infrastructure — 40 primitives working in concert to scan, diagnose, and ascend code.\n\nNo AI in the output. Pure algorithmic architecture. Patent-pending dual-layer technology that enhances your software while your original code remains untouched.',
    footer: '12 Organs · 12 Layers · 8 Engines · 8 Agents',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--neon-cyan) / 0.12) 0%, transparent 50%)',
  },
  {
    icon: Wrench,
    tag: 'Ascension',
    title: 'Your Code, Elevated',
    body: 'Upload your working code. The 40-primitive matrix scans for vulnerabilities, hidden capabilities, and structural limits — then hardens it with up to 20 primitives.\n\nYou get back production-ready, certified software. Your original code remains unchanged.',
    footer: 'No lock-in · Sealed runtime · Runs across 90+ languages',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: ShieldCheck,
    tag: 'Ownership',
    title: 'Sealed Runtime. No Subscription.',
    body: 'Every ascended export is yours forever — sealed runtime, no recurring fees, no vendor lock-in.\n\nThe diagnostic report is free whether you purchase or not. We prove the value before you commit.',
    footer: 'Zero-friction trial · Keep it forever · No code stored or reused',
    accent: 'neon-magenta',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-magenta) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Zap,
    tag: 'Begin',
    title: 'Start Your Ascension',
    body: 'Builder tier is free — explore diagnostics and see what the substrate can find in your code.\n\nCreator and Architect tiers unlock full ascension exports, expanded capabilities, and priority processing.',
    footer: 'No credit card required. The scanners are already running.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 40% 50%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
    inlineCta: { text: 'Ascend Your Code', href: '/ascension' },
    secondaryInlineCta: { text: 'Create Free Account', href: '/auth' },
  },
];

const accentVar: Record<string, string> = {
  'neon-cyan': '--neon-cyan',
  'neon-purple': '--neon-purple',
  'neon-magenta': '--neon-magenta',
};

const accentMap: Record<string, string> = {
  'neon-cyan': 'text-neon-cyan',
  'neon-purple': 'text-neon-purple',
  'neon-magenta': 'text-neon-magenta',
};

export function CmpsblWelcome() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const navigate = useNavigate();
  const { trackOpened, trackStep, trackCompleted, trackSkipped } = useOnboardingTracking('welcome');

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
    } else {
      dismiss();
    }
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
  const iconColor = accentMap[current.accent] || accentMap['neon-cyan'];
  const cssVar = accentVar[current.accent] || accentVar['neon-cyan'];
  const isLastStep = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[12000] grid place-items-center p-4 cmpsbl-welcome-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md cmpsbl-welcome-fade-in" />

      <div className="relative w-full max-w-md cmpsbl-welcome-modal-enter">
        {/* Neon gradient border wrapper */}
        <div
          className="rounded-2xl p-[1.5px] shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--neon-purple)), hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--primary)))',
          }}
        >
          <div className="relative bg-background rounded-[14.5px] overflow-hidden flex flex-col">
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none cmpsbl-welcome-pattern-shift"
              style={{ background: current.pattern }}
            />

            {/* Scan line */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[14.5px]">
              <div className="cmpsbl-welcome-scanline" />
            </div>

            {/* Progress + close */}
            <div className="relative flex items-center justify-between px-5 pt-5">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > step ? 'next' : 'prev'); setStep(i); }}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-500 cursor-pointer',
                      i === step
                        ? 'w-7 cmpsbl-welcome-dot-active'
                        : i < step
                          ? 'w-3 opacity-50'
                          : 'w-3 bg-muted-foreground/20'
                    )}
                    style={
                      i <= step
                        ? { background: `hsl(var(${cssVar}))` }
                        : undefined
                    }
                    aria-label={`Step ${i + 1}: ${STEPS[i].title}`}
                  />
                ))}
              </div>
              <button
                onClick={dismiss}
                className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 transition-colors"
                aria-label="Skip onboarding"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step counter */}
            <div className="relative px-5 pt-3">
              <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">
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
              {/* Icon with neon glow */}
              <div
                className="w-12 h-12 rounded-xl border flex items-center justify-center mb-4 cmpsbl-welcome-icon-pop"
                style={{
                  borderColor: `hsl(var(${cssVar}) / 0.25)`,
                  background: `hsl(var(${cssVar}) / 0.08)`,
                  boxShadow: `0 0 20px hsl(var(${cssVar}) / 0.12)`,
                }}
              >
                <Icon className={cn('w-6 h-6', iconColor)} />
              </div>

              <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5 cmpsbl-welcome-tag-fade text-muted-foreground/50">
                {current.tag}
              </p>
              <h2
                className="text-lg font-black text-transparent bg-clip-text mb-2.5 tracking-tight cmpsbl-welcome-title-reveal"
                style={{
                  backgroundImage: `linear-gradient(135deg, hsl(var(${cssVar})), hsl(var(--foreground)))`,
                }}
              >
                {current.title}
              </h2>
              {current.body.split('\n\n').map((paragraph, i) => (
                <p key={i} className={cn("text-[13px] text-muted-foreground/80 leading-relaxed cmpsbl-welcome-body-fade", i > 0 && "mt-2.5")}>
                  {paragraph}
                </p>
              ))}

              {/* Footer quote */}
              {current.footer && (
                <div className="mt-4 px-3 py-2 rounded-lg border border-border/15 bg-card/30 cmpsbl-welcome-body-fade">
                  <p className="text-[11px] font-mono text-muted-foreground/60 tracking-wide">
                    {current.footer}
                  </p>
                </div>
              )}

              {/* Inline CTAs */}
              {(current.inlineCta || current.secondaryInlineCta) && (
                <div className="mt-5 flex flex-wrap gap-2.5 cmpsbl-welcome-body-fade">
                  {current.inlineCta && (
                    <button
                      onClick={() => { dismiss(); navigate(current.inlineCta!.href); }}
                      className="relative group/cta inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: `linear-gradient(135deg, hsl(var(--neon-purple) / 0.15), hsl(var(--neon-cyan) / 0.15))`,
                        border: `1px solid hsl(var(--neon-purple) / 0.3)`,
                        color: `hsl(var(--neon-cyan))`,
                      }}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      {current.inlineCta.text}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {current.secondaryInlineCta && (
                    <button
                      onClick={() => { dismiss(); navigate(current.secondaryInlineCta!.href); }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/50 transition-all duration-300"
                    >
                      {current.secondaryInlineCta.text}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer — navigation */}
            <div className="relative flex items-center justify-between px-6 pb-5 pt-1 border-t border-border/10">
              {step > 0 ? (
                <Button variant="ghost" size="sm" onClick={back} className="text-xs h-9 gap-1 text-muted-foreground">
                  Back
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={dismiss} className="text-xs h-9 text-muted-foreground/60">
                  Skip tour
                </Button>
              )}

              <button
                onClick={next}
                className="relative inline-flex items-center gap-1.5 text-xs font-bold h-9 px-5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cmpsbl-welcome-cta-glow"
                style={{
                  background: `linear-gradient(135deg, hsl(var(${cssVar}) / 0.12), hsl(var(${cssVar}) / 0.06))`,
                  border: `1px solid hsl(var(${cssVar}) / 0.3)`,
                  color: `hsl(var(${cssVar}))`,
                }}
              >
                {isLastStep ? 'Get Started' : 'Next'}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
