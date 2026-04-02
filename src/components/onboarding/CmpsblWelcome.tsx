/**
 * CMPSBL Welcome Onboarding — First-visit guided tour for /
 * Software Refurbishment Center intro: Memory Stream, Ascension, Catalog, legacy access
 * Uniform "Next" button bottom-right on every card
 */

import { useState, useEffect } from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ChevronRight, Zap, Search, Wrench, ShoppingBag, BookOpen } from 'lucide-react';
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
  bullets?: string[];
  entries?: { icon: React.ElementType; label: string; desc: string }[];
}

const STEPS: OnboardingStep[] = [
  {
    icon: Search,
    tag: 'Discovery',
    title: 'The Scanners Are Running',
    body: 'Memory Stream runs autonomous 8-hour discovery cycles — finding capabilities in code that nobody asked it to find.\n\nEvery discovery is scored by CJPI, priced, and placed in the Catalog. You browse, you buy, you own it forever. Once purchased, a discovery is permanently retired from the stream.',
    footer: 'No AI inside the output. Pure algorithmic discovery.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 30% 70%, hsl(var(--neon-cyan) / 0.12) 0%, transparent 50%)',
  },
  {
    icon: Wrench,
    tag: 'Refurbishment',
    title: 'The Refurbishment Lab',
    body: "Ascension takes your existing code and refurbishes it. We scan for vulnerabilities and hidden capabilities, harden it with up to 20 primitives, and send it back production-ready.\n\n3-day evaluation period included. If you're not satisfied, you keep the diagnostic report for free.",
    footer: "Submit your code. We'll make it certified.",
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 70% 30%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: ShoppingBag,
    tag: 'Catalog',
    title: 'Browse What the Scanners Found',
    body: "The Catalog displays scored discoveries from Memory Stream. Each one is real, production-grade software with a CJPI quality score.\n\nBuilder tier users can also visit the Open Archive — free access to Raw-tier discoveries that haven't been fully refurbished yet.",
    footer: 'Priced by quality. $1–$2 per CJPI point. Perfect 100s at $1,952.',
    accent: 'neon-magenta',
    pattern: 'radial-gradient(circle at 50% 80%, hsl(var(--neon-magenta) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: BookOpen,
    tag: 'Legacy access',
    title: 'Substrate Still Available',
    body: 'The 40-Primitive substrate architecture — 12 Organs, 12 Layers, 8 Engines, 8 Agents — still powers everything under the hood.\n\nLegacy reference materials including the Substrate Explorer, Architecture deep-dives, and full documentation are accessible from the footer under "Legacy Reference."',
    footer: 'The center runs on the substrate. The substrate is the IP moat.',
    accent: 'neon-cyan',
    pattern: 'radial-gradient(circle at 80% 60%, hsl(var(--neon-cyan) / 0.1) 0%, transparent 50%)',
  },
  {
    icon: Zap,
    tag: 'Get started',
    title: 'Start with a Free Account',
    body: "Builder tier is free — browse the Catalog, access the Open Archive for Raw-tier discoveries, and view diagnostics.\n\nCreator and Architect tiers unlock Ascension refurbishments, expanded vaults, and priority processing. The center is already running — the scanners never stop.",
    footer: 'No credit card required. The scanners are already discovering.',
    accent: 'neon-purple',
    pattern: 'radial-gradient(circle at 40% 50%, hsl(var(--neon-purple) / 0.1) 0%, transparent 50%)',
    inlineCta: { text: 'Browse the Catalog', href: '/showcase' },
    secondaryInlineCta: { text: 'Create Free Account', href: '/auth' },
  },
];

const accentMap: Record<string, string> = {
  'neon-cyan': 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20',
  'neon-purple': 'text-neon-purple bg-neon-purple/10 border-neon-purple/20',
  'neon-magenta': 'text-neon-magenta bg-neon-magenta/10 border-neon-magenta/20',
};

const iconAccent: Record<string, string> = {
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
  const colors = accentMap[current.accent] || accentMap['neon-cyan'];
  const iconColor = iconAccent[current.accent] || iconAccent['neon-cyan'];
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

          {/* Top edge accent */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[hsl(var(--neon-cyan)/0.4)]" />

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
                      ? 'w-7 bg-[hsl(var(--neon-cyan))] cmpsbl-welcome-dot-active'
                      : i < step
                        ? 'w-3 bg-[hsl(var(--neon-cyan)/0.5)]'
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

            {/* Footer quote */}
            {current.footer && (
              <p className="mt-3 text-[11px] font-mono text-muted-foreground/60 cmpsbl-welcome-body-fade">
                {current.footer}
              </p>
            )}

            {/* Bullet list */}
            {current.bullets && (
              <ul className="mt-3 space-y-1.5 cmpsbl-welcome-body-fade">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-[13px] text-foreground/80">
                    <span className={cn('w-1.5 h-1.5 rounded-full', `bg-${current.accent}`)} />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Dual entry paths */}
            {current.entries && (
              <div className="mt-4 space-y-2.5 cmpsbl-welcome-body-fade">
                {current.entries.map((entry) => {
                  const EntryIcon = entry.icon;
                  return (
                    <div key={entry.label} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/20">
                      <EntryIcon className={cn('w-4 h-4 mt-0.5 shrink-0', iconColor)} />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{entry.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{entry.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline CTAs */}
            {(current.inlineCta || current.secondaryInlineCta) && (
              <div className="mt-4 flex flex-wrap gap-2 cmpsbl-welcome-body-fade">
                {current.inlineCta && (
                  <button
                    onClick={() => { dismiss(); navigate(current.inlineCta!.href); }}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors',
                      colors,
                      'hover:opacity-80'
                    )}
                  >
                    {current.inlineCta.text}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {current.secondaryInlineCta && (
                  <button
                    onClick={() => { dismiss(); navigate(current.secondaryInlineCta!.href); }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {current.secondaryInlineCta.text}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer — uniform Next button */}
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
              {isLastStep ? 'Get Started' : 'Next →'}
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
